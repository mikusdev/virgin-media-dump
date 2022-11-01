//(c) Copyright 2017, ARRIS Group, Inc., All rights reserved.

var DEFAULT_SJCL_PARANOIA = 10;
var DEFAULT_SJCL_NUMWORDS = 2
var DEFAULT_SJCL_ITERATIONS = 1000;
var DEFAULT_SJCL_KEYSIZEBITS = 128;
var DEFAULT_SJCL_TAGLENGTH = 128;

/* encryptData(configData)
 * input:  configData: Array object containing sensitive data. This data
 *         is allowed to be passed with or without crypto params.
 * return: Array object containing an encrypted blob and crypto params.
 */
function encryptData(configData)
{
    var key = "";
    if (!hasCryptoParams(configData))
    {
        addCryptoParams(configData, "encryptData");
    }
    if(!isLoggedIn()) {
       var curPwd = configData['oldPassword'];//getSessionStorage("gui_pw");
       if (getCSRLoginMode() == 1)
       {
          // For CSR Login set the encryption key to ' '
          curPwd = ' ';
       }
       key = sjclPbkdf2 (curPwd, configData['salt'], DEFAULT_SJCL_ITERATIONS, DEFAULT_SJCL_KEYSIZEBITS);
       setSessionStorage("myKey",key);
    }
    else
    {
       key = getSessionStorage("myKey");
    }
    var blob = sjclCCMencrypt(key, JSON.stringify(configData), configData['iv'], configData['authData'], DEFAULT_SJCL_TAGLENGTH);
    var encryptedConfigData = {'encryptedBlob': blob, 'salt': configData['salt'], 'iv': configData['iv'], 'authData': configData['authData']};
    return encryptedConfigData;
}

/* decryptData(configData)
 * input:  configData: Array object to be decrypted. This JSON must
 *         contain crypto params.
 * return: Array object containing unencrypted sensitive data.
 */
function decryptData(configData)
{
    if (hasCryptoParams(configData))
    {
        //var curPwd = getSessionStorage("gui_pw");
        var key = getSessionStorage("myKey"); //sjclPbkdf2(curPwd, configData['salt'], DEFAULT_SJCL_ITERATIONS, DEFAULT_SJCL_KEYSIZEBITS);
        var blob = configData['encryptedBlob'];
        var decryptedConfigData = sjclCCMdecrypt(key, blob, configData['iv'], configData['authData'], DEFAULT_SJCL_TAGLENGTH);
        decryptedConfigData = JSON.parse(decryptedConfigData);
        return decryptedConfigData;
    }
    else
    {
        return configData;
    }
}

/* function addCryptoParams(configData, authData)
 * input:  configData: Array object which to add crypto params (salt, iv and authData).
 *         authData: Associated non-secret data used by SJCL for message authentication.
 * return: Array object updated with crypto params.
 */
function addCryptoParams(configData, authData)
{
    if (hasCryptoParams(configData))
    {
        console.log("In crypto.js:addCryptoParams: Already have crypto params");
    }
    else
    {
        configData['authData'] = authData;
        if(!isLoggedIn()) {
           configData['salt'] = sjclRandomHex(DEFAULT_SJCL_NUMWORDS, DEFAULT_SJCL_PARANOIA);
           configData['iv'] = sjclRandomHex(DEFAULT_SJCL_NUMWORDS, DEFAULT_SJCL_PARANOIA);
           setSessionStorage("mySalt",configData['salt']);
           setSessionStorage("myIv",configData['iv']);
        }
        else
        {
           configData['salt'] = getSessionStorage("mySalt");
           configData['iv'] = getSessionStorage("myIv");
        }
    }
    return configData;
}

/* function hasCryptoParams(configData)
 * input: configData: Array object to be checked for present crypto params.
 * return: true if configData contains populated cypto params, false if not.
 */

function hasCryptoParams(configData)
{
    if (configData.hasOwnProperty('salt') && configData.hasOwnProperty('iv') && configData.hasOwnProperty('authData'))
    {
        if ((configData['salt'].length > 0) && (configData['iv'].length > 0) && (configData['authData'].length > 0))
        {
            return true;
        }
    }
    else
    {
        return false;
    }
}


/* Wrapper for sjcl.misc.pbkdf2
 * password - ascii string
 * salt - hex string
 * iterations - integer
 * keySizeBits - integer
 * returns: derived key - hex string
 */
function sjclPbkdf2 (password, salt, iterations, keySizeBits)
{
    salt = sjcl.codec.hex.toBits(salt);
    var dk = sjcl.misc.pbkdf2(password, salt, iterations, keySizeBits);

    if (dk.length > 0) {
        dk = sjcl.codec.hex.fromBits(dk);
        //console.log ('derived key hex string:' + dk);
    }
    else {
        dk = 0;
        console.log ('derived key is empty');
    }
    return dk;
}

/* Wrapper for sjcl.random.randomWords
 * numWords - number of random 32 bit words
 * paranoia - integer (0-10)
 * returns: hex string
 */
function sjclRandomHex (numWords, paranoia)
{
    var rn = sjcl.random.randomWords(numWords, paranoia);
    if (rn.length > 0) {
        rn = sjcl.codec.hex.fromBits(rn);
        //console.log ('random hex string:' + rn);
    }
    else {
        rn = 0;
        console.log ('random words is empty');
    }
    return rn
}

/* Wrapper for sjcl.mode.ccm.encrypt and sjcl.cipher.aes
 * derivedKey - hex string
 * plainText - ascii string
 * initVector - hex string
 * authData - ascii string
 * tagLenBits - integer
 * returns: cipherText - hex string
 */
function sjclCCMencrypt (derivedKey, plainText, initVector, authData, tagLenBits)
{
    // Convert derived key from hex to bitArray
    derivedKey = sjcl.codec.hex.toBits(derivedKey);
    // AES pseudorandom function based on derived key
    var prf = new sjcl.cipher.aes(derivedKey);
    //Convert plainText and iv to bitArrays
    plainText = sjcl.codec.utf8String.toBits(plainText);
    initVector = sjcl.codec.hex.toBits(initVector);
    //Convert ascii string authData to bitArray, then hex string, finally to bitArray
    authData = sjcl.codec.utf8String.toBits(authData);
    authData = sjcl.codec.hex.fromBits(authData);
    authData = sjcl.codec.hex.toBits(authData);
    // Encrypt with params to get cipher text
    var ct = sjcl.mode.ccm.encrypt (prf, plainText, initVector, authData, tagLenBits);
    if (ct.length > 0) {
        ct = sjcl.codec.hex.fromBits(ct);
        //console.log ('cipher text hex string:' + ct);
    }
    else {
        ct = 0;
        console.log ('cipher text is empty');
    }
    return ct;
}

/* Wrapper for sjcl.mode.ccm.decrypt and sjcl.cipher.aes
 * derivedKey - hex string
 * cipherText - hex string
 * initVector - hex string
 * authData - ascii string
 * tagLenBits - integer
 * returns: clearText - ascii string
 */
function sjclCCMdecrypt (derivedKey, cipherText, initVector, authData, tagLenBits)
{
    // AES pseudorandom function based on derived key
    derivedKey = sjcl.codec.hex.toBits(derivedKey);
    var prf = new sjcl.cipher.aes(derivedKey);
    //Convert cipher text and iv to bitArrays
    cipherText = sjcl.codec.hex.toBits(cipherText);
    initVector = sjcl.codec.hex.toBits(initVector);
    //Convert ascii string authData to bitArray, then hex string, finally to bitArray
    authData = sjcl.codec.utf8String.toBits(authData);
    authData = sjcl.codec.hex.fromBits(authData);
    authData = sjcl.codec.hex.toBits(authData);
    // Decrypt with params
    var pt = sjcl.mode.ccm.decrypt (prf, cipherText, initVector, authData, tagLenBits);
    if (pt.length > 0) {
        pt = sjcl.codec.utf8String.fromBits(pt);
        //console.log ('plain text hex string:' + pt);
    }
    else {
        pt = 0;
        console.log ('plain text is empty');
    }
    return pt;
}
