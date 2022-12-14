// Copyright 2011-2018, ARRIS Enterprises, LLC. All rights reserved.
// This program is confidential and proprietary to ARRIS Enterprises, LLC. (ARRIS), and may not be
// copied, reproduced, modified, disclosed to others, published or used, in whole or in part, without
// the express prior written permission of ARRIS.
// Portions Copyright 2013 webtoolkit.info Inc.  http://www.webtoolkit.info/javascript_base64.html

var attrs = {
    Family:"950",
// UNIHAN ADD START
    ModelName:"",
// UNIHAN ADD END
    IPV6:true,
//    Languages:["English:English", "Spanish:Espanol", "French:Francais", "German:Deutsch","Portuguese:Português do Brasil","Dutch:Dutch","Romanian:Romanian","Italian:Italiano","Polish:Polish","Hungarian:Hungarian","Czech:Czech","Slovakian:Slovakian"],
    Languages:["English:English", "Spanish:Espanol", "French:Francais", "German:Deutsch","Portuguese:Português do Brasil"],
    Moca: "",
    Wifi: "",
    //SERCOMM ADD
    muti: "",
    gwWan: "",
    //SERCOMM ADD
    DefPasswdChanged: ""
}
    // todo: put in snmp check for no data returned

function encode(o) {
    o = "" + o;
    o = encodeURIComponent(o);
    return o;
}
function getAttr(name) {
    return attrs[name] || "";
}
function isMG() {
    return attrs["Family"] == "MG" || attrs["Family"] == "MG6";
}
function isMG5() {
    return attrs["Family"] == "MG";
}
function isMG6() {
    return attrs["Family"] == "MG6";
}
function is852() {
    return attrs["Family"] == "852";
}
function is95x() {
    return attrs["Family"] == "950";
}
function isIPV6() {
    return isMG() ? false : attrs["IPV6"];
}
function isMoca() {
    return isMG();
}
// UNIHAN ADD START
// hasMoca returns true if model supports Moca.
// This function used to check specific model names
// but now checks the attribute Moca filled in the
// credential at login. The enum below is defined in
// ti/arris_docsis/include/db_arris.h.
//enum
//{
//    ARRIS_MOCA_NONE,
//    ARRIS_MOCA_11,
//    ARRIS_MOCA_20
//}; // DB_MOCA
function hasMoca()
{
	var mocaModel  = attrs["Moca"];

	if ( (mocaModel != "") && ( mocaModel != "0") )
	   return true;
	return false;
}
// UNIHAN ADD END

// UNIHAN ADD START , PROD00208108
// hasWiFi80211ac returns true if model has QCA and supports AC.
// This function used to check specific model names
// but now checks the attribute Wifi filled in the
// credential at login. If Wifi attribute is WIRELESS_QCA_AC_DBC (5)
// or greater then hasWiFi80211ac returns true.
// The enum below is defined in
// ti/arris_docsis/include/db_arris.h.
// Wireless support follows the following:
//enum
//{
//    NO_WIRELESS,
//    WIRELESS_RT3662F,
//    WIRELESS_RT3352,
//    WIRELESS_CELENO_DBC,
//    WIRELESS_CELENO_24_CLR260,
//    WIRELESS_QCA_AC_DBC,
//    WIRELESS_CELENO_24_CLR260H,
//    MAX_WIRELESS_OPTIONS = 16
//};
//
function hasWiFi80211ac()
{
    var WifiModel  = attrs["Wifi"];

    if( (WifiModel != undefined) && (WifiModel != "") && (WifiModel.asInt() == 5 /*QCA_DBC*/) )
        return true;
    return false;
}
function isMTKDBC()
{
    var WifiModel  = attrs["Wifi"];

    if( (WifiModel != undefined) && (WifiModel != "") && (WifiModel.asInt() == 7 /*MTK_DBC*/) )
        return true;
    return false;
}
// UNIHAN ADD END

function isQCA()
{
    var WifiModel  = attrs["Wifi"];

    if( (WifiModel != undefined) && (WifiModel != "") && (WifiModel.asInt() == 5 /*QCA_DBC*/) )
        return true;
    return false;
}

// add function to check if 852/862 wifi
function isPuma5Wifi() {
    var WifiModel  = attrs["Wifi"];

    if( (WifiModel != undefined) && (WifiModel != "") && (WifiModel.asInt() < 3 /*RT3662F or RT3352 or no wifi*/) )
        return true;
    return false;
}
function isClassicCM() {
    return !isMG();
}
function isDBC() {
    return (wirelessBand()=="2"); // MIB value of 2 is DBC note: MAIN branch checks for isMG6()
}
function isSimulateDBC() { // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    return true;//false;
}

var is5GPageURL = false;
function is5GPage() {
   if (isDBC() && is5GPageURL) {
      return 1;
   }
   return 0;
}

function showSSIDGraph() {
    if( isPuma5Wifi() && !attrs["ModelName"].contains("862")) return false;
    if( customerId() == 5 ) return true; // UNIHAN ADD , CLM-3330
    return isTechnician();// allow for all tech access
}
function showSpectrum() {
    return isMG6();
}

function showMacBridgeGUI() {
	if(!isLoggedIn()) {
        return false;
    }
	if (customerId() == 1 && attrs["ModelName"]&& !attrs["ModelName"].contains("DG860") ){// Only support for NA, exclude model 862.
		return true;
	}

	return false;
}

function showDsLiteGUI() {
	if(!isLoggedIn()) {
        return false;
    }
	if (attrs["ModelName"]&& attrs["ModelName"].contains("S") ){// Only support Europe (S).
		return true;
	}

	return false;
}

function showL2TPGUI() {
	if(!isLoggedIn()) {
        return false;
    }
	if (attrs["ModelName"]&& attrs["ModelName"].contains("S") ){// Only support Europe (S).
		return true;
	}

	return false;
}

function showATM() {
	return false; // Hide it for LGI resolution now PD 6696
	//return isTechnician() && hasWiFi80211ac(); // Only support QCA wifi. for technician login
}

// UNIHAN ADD START
function Ifindex24G() {
    return 10000;
}
function Ifindex50G() {
    return 10100;
}
function Primary24GIndex() {
    return 1;
}
function Primary5GIndex() {
    // todo: need to be changed if multple SSIS is supported in wifi driver.
    return 9;
}
function TotalSSIDsPerBand() {
    // todo: need to be changed if multple SSIS is supported in wifi driver.
    return 8;
}
function TotalSSIDs() {
    return Primary5GIndex() + TotalSSIDsPerBand() - 1;
}
// UNIHAN ADD END

function getLanguages() {
    if (isMG() && attrs["Languages"].length>1)
        attrs["Languages"] = [ attrs["Languages"][0] ];
    return attrs["Languages"];
}

function getLangCode(){
    //var def_lang = {"English":"en","Spanish":"es", "French":"fr", "German":"de", "Portuguese":"pt-br", "Dutch":"nl", "Romanian":"ro", "Italian":"it", "Polish":"pl", "Hungarian":"hu", "Czech":"cz", "Slovakian":"sk","Turkish":"tk"};
    var lang = language();
    //return def_lang[lang];
    return lang;
}

function userName() {
    return attrs["Name"] || "";
}
function isTechnician() {
    return isLoggedIn() && attrs["Technician"];
}

function isWanConnection(){
    if (attrs["conType"]&& attrs["conType"].contains("WAN")){
        return true;
    }
    else{
        return false;
    }
}

function isLoggedIn(credential) {
    /*if (!attrs["Credential"]) {
        attrs["Credential"] = credential || readCookie("credential");
        if (attrs["Credential"]) {
            var o = Base64.decode(attrs["Credential"]);
            o = JSON.parse(o);
            //SERCOMM ADD
            attrs["muti"] = o["muti"];
            if(attrs["muti"]){

                attrs["Credential"] = "";
                attrs["conType"] = o["conType"];
                attrs["gwWan"] = o["gwWan"];

                if( attrs["gwWan"] == "f" && attrs["conType"] == "LAN" && attrs["muti"] == "GW_WAN"){

                    return '2';
                }
                if(attrs["gwWan"] == "t" && attrs["muti"] == "LAN"){

                    return '1';
                }
                if( attrs["gwWan"] == "f" && attrs["conType"] == "LAN" && attrs["muti"] == "LAN"){

                    return '3';
                }
                if(attrs["gwWan"] == "t" && attrs["muti"] == "GW_WAN"){

                    return '4';
                }
            }
            //SERCOMM END
            attrs["Family"] = o["family"];
// UNIHAN ADD START
            attrs["ModelName"] = o["modelname"];
// UNIHAN ADD END
            attrs["Technician"] = o["tech"];
            attrs["Name"] = decodeURIComponent(o["name"]); // UNIHAN MOD, PROD00214448
	    attrs["Moca"] = o["moca"]; // filled in credential based on DB_MOCA
	    attrs["Wifi"] = o["wifi"]; // filled in credential based on DB_WIRELESS
	    attrs["conType"] = o["conType"];
	    attrs["DefPasswdChanged"] = o["DefPasswdChanged"];
            attrs["gwWan"] = o["gwWan"];
        }
    }
    return attrs["Credential"];*/
	if(ag.isInvalidPassword == true)
		return false;
	if(ag.otherLocalUser == true)
		return 3;
	if (!attrs["Credential"]) {
		attrs["Credential"] = credential || getSessionStorage("credential");
        if (attrs["Credential"]) {
            var o = Base64.decode(attrs["Credential"]);
            o = JSON.parse(o);

            attrs["Family"] = o["family"];
            attrs["ModelName"] = o["modelname"];
            attrs["Technician"] = o["tech"];
            attrs["Name"] = decodeURIComponent(o["name"]);
            attrs["Moca"] = o["moca"];
            attrs["Wifi"] = o["wifi"];
            attrs["conType"] = o["conType"];
            attrs["DefPasswdChanged"] = o["DefPasswdChanged"];
            attrs["gwWan"] = o["gwWan"];
        }
        }
    return attrs["Credential"];
}
function verifyLoginCredential() {
    if ( getSessionStorage("credential")){
        try {
            snmpGet1(arCurrentTime.oid+".0")
        }  catch (e) {
            //eraseCookie("credential");
            setSessionStorage("credential","");
            clearSessionKey();
            refresh();
            return false;
        }
    }
    return true;
}
function clearLoginCredential() {
    attrs["Credential"] = "";
    //eraseCookie("credential");
    setSessionStorage("credential","");
    //setSessionStorage("ar_nonce","");
    setSessionStorage("csrf_nonce","");
    clearSessionKey();
}


/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/
var BBase64 = {
    // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    isBase64 : function(input) {
        for (var i=0; i<input.length; i++) {
            if (_keyStr.indexOf(input.charAt(i) === -1))
                return false;
        }
        return true;
    },
    // public method for encoding
    encode : function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        //input = Base64._utf8_encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output +
                this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }
        return output;
    },
    // public method for decoding
    decode : function (input) {
        if (input === null)
            return "";
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = Base64._utf8_decode(output);
        return output;
    },

    // private method for UTF-8 encoding
    _utf8_encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (true || c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    },
    // private method for UTF-8 decoding
    _utf8_decode : function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;
        while ( i < utftext.length ) {
            c = utftext.charCodeAt(i);
            if (true || c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    }
}

function rc4stream(key) {
    var ii=0;
    var jj=0;
    function rc4(str) {
        var s = [], j = 0, x, res = '';
        for (var i = 0; i < 256; i++) {
            s[i] = i;
        }
        for (i = 0; i < 256; i++) {
            j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
            x = s[i];
            s[i] = s[j];
            s[j] = x;
        }
        for (var y = 0; y < str.length; y++) {
            ii = (ii + 1) % 256;
            jj = (jj + s[ii]) % 256;
            x = s[ii];
            s[ii] = s[jj];
            s[jj] = x;
            res += String.fromCharCode(str.charCodeAt(y) ^ s[(s[ii] + s[jj]) % 256]);
        }
        return res;
    }
    return rc4;
}

function encrypt(s) {
    if (!getSessionKey())
        return s;
    s = rc4stream(getSessionKey())(s);
    s = BBase64.encode(s);
    return s;
}

function decrypt(s) {
    if (!getSessionKey())
        return s;
    s = BBase64.decode(s);
    s = rc4stream(getSessionKey())(s);
    return s;
}

var hooks = {
    buildSetURL:function (oid, value, type) {
        if (oid.startsWith("."))
	    oid = oid.substr(1);
        var url = "snmpSet?oid=" + encrypt( oid + "=" + encode(value) + ";" + type + ";");
        return url;
    },
    buildGetURL:function (oida) {
        var url = "snmpGet?oids=" + encrypt( _.reduce(oida, function (acc, oid) {
            if (oid.startsWith("."))
	        oid = oid.substr(1);
            return acc + encode(oid) + ";";
        }, ""));
        return url;
    },
    buildWalkURL:function (oida) {
        var url = "walk?oids=" + encrypt( _.reduce(oida, function (acc, oid) {
        	$.log("buildWalkURL acc="+acc+"; oid="+oid);
        	if (oid.startsWith("."))
	        oid = oid.substr(1);
            if (oid.endsWith("."))
	        oid = oid.substr(0, oid.length-1);
            return acc + encode(oid) + ";";
        }, ""));
        return url;
    },
    postProcess:function (json) {
        return json;
    },
    buildBulkSetURL:function (oida) {
        var url = "snmpSetBulk?oids=" + encrypt(_.reduce(oida, function (acc, oid) {
            if (oid[0].startsWith("."))
                oid[0] = oid[0].substr(1);
            return  acc + oid[0] + "=" + encode(oid[1]) + ";" + oid[2] + ";" + "\\n";
        }, ""));
        return url;
    }
};

// PROD00195733
// To Spped up submission, It just submit the unchanged datas by default,
// We can use the following global parameter "_storeData_param.submitChangedDatas" to control its behavior.
var _storeData_param = {};
// If Ture, snmpSet1 submit data instantly.
// otherwise, pend the request, until all submission are already.
_storeData_param.submitInstantly = false;
// If True, only dirty data will be submitted. otherwise, submit it forcely.
// The default is true, more less data changes, more speed up to submit.
_storeData_param.submitChangedDatas = true;

function storeData_param(submitInstantly, submitChangedDatas){
	_storeData_param.submitInstantly = submitInstantly;
	_storeData_param.submitChangedDatas = submitChangedDatas;
}

var nestedApplyAll = false;

var snmpSet_stat = {
		total_submits:0,
		success_returns:0,
		failed_returns:0
};

/**
 *
 * @param oid
 * @param value
 * @param type
 * @param forceSubmit	Send the request immediately, whatever the datd was changed or not. default is false.
 * @returns
 */
function snmpSet1(oid, value, type, forceSubmit) {
 //   if (isDBC() && oid.startsWith(arApplyAllSettings.oid)) {
 //       alert("debug: suppress snmpSet1 arApplyAllSettings")   ;
 //       return 1;
 //   }
	$.log("snmpSet1["+oid+"]; walk[oid]=" + walk[oid] + "; value=" + value);
	// PROD00195733
	if (!forceSubmit && _storeData_param.submitChangedDatas){
		if (walk[oid] == value){
			return value;
		}else if (oid.indexOf(arBssSSID.oid)==0 ){
		// For SSID, the getting value format is different from setting format.
			if (convertSSIDName(walk[oid]) == value){
				return walk[oid];
			}
		}
	}

	// TODO Implements the "_storeData_param.submitInstantly"
	//      The Web sever parser should support the multi-OIDs,

	snmpSet_stat.total_submits ++;

    //  value = encodeHack(value);
    var url = hooks.buildSetURL(oid, value, type); //"snmpSet?oid=" + oid + "=" + encode(value) + ";" + type + ";";
    $.log("set " + decodeOid(oid) + "=" + value);
    $.log(url);
    var rv = "fail";
    var isApplyAll = false; // oid.startsWith(arApplyAllSettings.oid + ".");

    jQuery.ajax({
        url:url,
        success:function (result) {
            walk[oid] = value; //UNIHAN ADD for PROD00200767//
            if (isApplyAll) {
                getSecondsSinceLastApply(true);
            }
            rv = result;
            snmpSet_stat.success_returns++;
        },
        error:function (jqXHR, textStatus, errorThrown) {
            if (jqXHR.status == 401) {
// "unauthorized" will be handled on top handler.
//                clearLoginCredential();
//                refresh();
                rv = "unauthorized";
            } else {
                if (isApplyAll&& !nestedApplyAll)
                    try {
                        nestedApplyAll = true;

                     ;//   snmpSet1(oid, value, type);
                    } finally {
                        nestedApplyAll = false;
                        }
            }
            snmpSet_stat.failed_returns++;
        },
        //           dataType : "json",
        async:false,
        cache:false
    });

    if (rv == "unauthorized")
        throw "unauthorized";
    if (rv == "fail" && shouldVerify(oid, value)){
        if(isLGI())
            throw xlate("There is an unexpected Error.");
        else
            throw xlate("Unexpected Error.");
    }
    $.log(">>" + JSON.stringify(rv));
    return rv;
}


function shouldVerify(oid, val) {
   // if (isMG())
   //     return false;  // GW snmp is a little screwy so skip for now

    if (oid.startsWith(arLanClientType.oid + "."))
        return false; //was false;

    if (oid.startsWith(arApplyAllSettings.oid + "."))
        return true; //was false;
    if (oid.startsWith(arWpsSTAPin.oid + "."))
        return false;
    if (oid.startsWith(arWpsPushButton.oid + "."))
        return false;
    if (oid.startsWith(arCurrentTime.oid + "."))
        return false;
    if (oid.startsWith(arEmailApplySettings.oid + "."))
        return false;
    if (oid.startsWith(arClearLogs.oid + "."))
        return false;
    if (oid.startsWith(arReboot.oid + "."))
        return false;
    if (oid.startsWith(arClearMSOLogs.oid + "."))
        return false;
    if (oid.startsWith(arEmailApplySettings.oid + "."))
        return false;
    if (oid.startsWith(arApplySNTPSettings.oid + "."))
        return false;
    if (oid.startsWith(arDefaults.oid + "."))
        return false;
    if (oid.startsWith(SNTPServerTable.oid + "."))
        return false;
    //if (oidIsRowStatus(oid) && val != 1)
    //    return false;
    return true;
}


function snmpSet1Async(oid, value, type, func) {
    //  value = encodeHack(value);
    var url = hooks.buildSetURL(oid, value, type); //"snmpSet?oid=" + oid + "=" + encode(value) + ";" + type + ";";
    $.log("setasync " + decodeOid(oid) + "=" + value);
    $.log(url);

    jQuery.ajax({
        url:url,
        success:function (result) {
            func(true);
        },
        error:function (jqXHR, textStatus, errorThrown) {
            func(false);
        },
//        error: function(jqXHR, textStatus, errorThrown) {
//            alert("text:{An error has occured.  Your changes may have not been applied.  Please refresh this page and verify the changes you expect.}");
//            throw "";
//        },
        //           dataType : "json",
        async:true,
        cache:false
    });
}
function snmpGet1Async(oid, func, errorfunc) {
    try {
        var url = hooks.buildGetURL([oid]);
        jQuery.ajax({
            url:url,
            success:function (result) {
                result = decrypt(result);
                var rv = result;
                try {
                    rv = JSON.parse(rv);
                } catch (e) {
                    clearLoginCredential();
                    return;
                }
                func(rv[oid]);
            },
            error:function (jqXHR, textStatus, errorThrown) {
                clearLoginCredential();
                if (errorfunc)
                    errorfunc(jqXHR, textStatus, errorThrown);
            },
            dataType:"text",
            async:true,
            cache:false
        });
    } catch (e) {
        $.log("snmp get error " + e);
        return "";
    }
    return "";
}

function snmpGet1(oid, opts) {
    try {
        var url = hooks.buildGetURL([oid]); //"snmpGet?oids=" + encode(oid) + ";";
        $.log(url);
        var rv = snmpGetJsonSync(url, opts);
        rv = hooks.postProcess(rv);
        if (rv && rv[oid]){
        	return rv[oid];
        }else{
        	return "";
        }
    } catch (e) {
        $.log("snmp get1 error " + e);
        throw e;
    }
}

function xxxcompare(a, b) {
    a = "" + a;
    b = "" + b;
    if (a.startsWith("$"))
        a = a.replace(/ /g, "");
    if (b.startsWith("$"))
        b = b.replace(/ /g, "");
    if (a.startsWith("$") && !b.startsWith("$")) {
        if (canConvertToASCII(a))
            a = convertHexStringToASCIIString(a)
    } else if (b.startsWith("$") && !a.startsWith("$")) {
        if (canConvertToASCII(b))
            b = convertHexStringToASCIIString(b)
    }
    if (a.length === 0 && b === "$00000000") {
        return true;
    }
    if (a.startsWith("$") && b.startsWith("$")) {
        return a.toUpperCase() == b.toUpperCase();
    }
    return a == b;
}
/**
 * Added by Bamy, for Apply waiting dialog.
 */

if(!isLGI()){
var langCode2 = getLangCode();
    	if (langCode2){
    		$.cachedScript("text_"+langCode2+".js", null, {async:false});
    	}
}

var WaitDialog = new function(params){
	this.waitInterval = 1; // sec.
	this.timeout = 0; // sec.
	this.title = "Please Wait";
	if(isLGI())
		this.content = xlate("ApplyingChanges");
	else
		this.content = "Applying Changes...";
	this.height = 80;
	this.width = 250;
	this.checkApplyStatus = false;
	this.checkApplyStatusInterval = 10;//sec.
	this.refreshPage = true;
	this.onCloseBefore = null;
	this.onCloseAfter = null;
	this._waitDialog = null;
	this._initialized = false;
	this._timerId = 0;
	this._timeElapsed = 0;
	this._checkApplyStatusTimerId = 0;
	this._isOpened = false;
	this.init = function(params){
		this.setParams(params);

		if (!this._initialized){
			this._waitDialog = $("#wait-dialog");
			this._initialized = true;
		}
	};
	this.open = function(params){
		if (this._timerId != 0) return;
		this.init(params);

		$("#wait-dialog").text( WaitDialog._parseMsg(WaitDialog.content) );

	    $("#wait-dialog").dialog(
            { autoOpen:false,
                height:WaitDialog.height,
                width:WaitDialog.width,
                resizable:false,
                title:WaitDialog.title,
                modal:true,
                closeOnEscape:false,
                draggable:false,
                open:function() { $(".ui-dialog-titlebar-close").hide(); },
                beforeClose:function () {
                    return canCloseWaitDialog;
                }
            });
        prepareDialog("wait-dialog");

        $("#wait-dialog").dialog("open");
        this._isOpened = true;
        this._timerId = window.setInterval(WaitDialog.onInterval, WaitDialog.waitInterval * 1000);

	};
	this.setParams = function(params){
		if (params == undefined) return;
		_.each(params, function(v, k) {
			WaitDialog[k] = v;
			if (k == "width"){
				$("#wait-dialog").dialog("option","width",v);
			}else if (k == "height"){
				$("#wait-dialog").dialog("option","height",v);
			}else if (k == "content"){
				$("#wait-dialog").text( WaitDialog._parseMsg(v) );
			}
        });
	};

	this.onInterval = function(){
		WaitDialog._timeElapsed += WaitDialog.waitInterval;
		$.log("WaitDialog._timeElapsed:"+WaitDialog._timeElapsed);
		if (WaitDialog.timeout!=0 && WaitDialog._timeElapsed>WaitDialog.timeout){
			WaitDialog.closeImmediately();
			return;
		}

		$("#wait-dialog").text( WaitDialog._parseMsg(WaitDialog.content) );

	};
//	this._getApplyAllSettings = function(){
//		return snmpGet1(MibObjects.ApplyAllSettings.oid+".0", {timeout:1000});
//	};
	this.onCheckApplyStatusInterval = function(){
		$.log("WaitDialog.onCheckApplyStatusInterval:");
		var oid = MibObjects.ApplyAllSettings.oid+".0";
		var url = hooks.buildGetURL([oid]);
		$.ajax({url:url,
			timeout:1000,
			success: function (result) {
                result = decrypt(result);
                $.log("get result " + result);
                rv = result;
                if (rv == "unauthorized"){
			    	jQuery.event.trigger( "ajaxStop" );
			    	throw "unauthorized";
			    }
                try {
                    var rrv = JSON.parse(rv);
                    if (rrv && rrv[oid] && rrv[oid].asInt()==1){
        	WaitDialog.closeImmediately();
        }
                } catch (e) {
                	$.logError("JSON.parse:"+rv+" error="+e);
                	clearLoginCredential();
                    throw "unauthorized";
                }

            },
            error:function (jqXHR, textStatus, errorThrown) {
            	$.logError("textStatus="+textStatus+" errorThrown="+errorThrown);
                if (jqXHR.status != 0) {
                    clearLoginCredential();
                    throw "unauthorized";
                }
            },
            async:true});
        //var status = WaitDialog._getApplyAllSettings();

	};
	this.clearInterval = function(){
		this._timeElapsed = 0;
		window.clearInterval(this._timerId);
		if (this._checkApplyStatusTimerId > 0){
			window.clearInterval(this._checkApplyStatusTimerId);
			this._checkApplyStatusTimerId = 0;
		}
		this._timerId = 0;
	};
	this.resetTimerCounter = function(){
		this._timeElapsed = 0;
	};
	this.close = function(isNeedRefresh){
		$.log("WaitDialog.timeout=" + this.timeout);

		if (this.checkApplyStatus){
        	this._checkApplyStatusTimerId = window.setInterval(WaitDialog.onCheckApplyStatusInterval, WaitDialog.checkApplyStatusInterval * 1000);
        }

		if (this.timeout==0 && this._isOpened){
			this.closeImmediately(isNeedRefresh);
			this._isOpened = false;
		}
	};
	this.closeImmediately = function(isNeedRefresh){
		this.clearInterval();
		if (this.onCloseBefore && _.isFunction(this.onCloseBefore)){
			this.onCloseBefore.apply(this);
		}
		$("#wait-dialog").dialog("destroy");
		if ((undefined == isNeedRefresh && this.refreshPage) || isNeedRefresh){
			refresh(); // Reload page.
		}
		if (this.onCloseAfter && _.isFunction(this.onCloseAfter)){
			this.onCloseAfter();
		}
		$.log("closeImmediately close dialog ok...");
	};

	this._parseMsg = function(msg) {
		if (!msg) return "";
		var outStr = msg.replace(/\$\{timeout\}/g, this.timeout);
		outStr = outStr.replace(/\$\{timeElapsed\}/g, this._timeElapsed);
		outStr = outStr.replace(/\$\{timeLeft\}/g, (this.timeout - this._timeElapsed) );
		return outStr;
	};
};

var canCloseWaitDialog = false;
function openWaitDialog() {
    canCloseWaitDialog = false;
    $("#wait-dialog").dialog(
        { autoOpen:false,
            height:80,
            width:250,
            resizable:false,
            title:"Please Wait",
            modal:true,
            closeOnEscape:false,
            draggable:false,
            open:function() { $(".ui-dialog-titlebar-close").hide(); },
            beforeClose:function () {
                return canCloseWaitDialog;
            }
        });
    prepareDialog("wait-dialog");
    $("#wait-dialog").dialog("open");
}

function closeWaitDialog() {
    canCloseWaitDialog = true;
    $("#wait-dialog").dialog("close");
}


function doApplyAndRebootAsync(applyNeeded, rebootNeeded, refreshNeeded) {
    var canCloseWaitDialog = false;
    var busyDialogNeeded = true;

    function openWaitDialog() {
        if (!busyDialogNeeded)
            return;
        canCloseWaitDialog = false;
        $("#wait-dialog").dialog(
            { autoOpen:false,
                height:80,
                width:250,
                resizable:false,
                title:"Please Wait",
                beforeClose:function () {
                    return canCloseWaitDialog;
                }
            });
        prepareDialog("wait-dialog");
        $("#wait-dialog").dialog("open");
    }

    function closeWaitDialog() {
        busyDialogNeeded = false;
        canCloseWaitDialog = true;
        $("#wait-dialog").dialog("close");
    }

    function start() {
        if (applyNeeded)
            snmpSet1Async(arApplyAllSettings.oid + ".0", "1", "2", applyDone);
        else applyDone(true);
    }

    function applyDone(ok) {
        if (rebootNeeded)
            snmpSet1Async(arReboot.oid + ".0", "1", "2", rebootDone);
        else rebootDone(true);
    }

    function rebootDone(ok) {
        closeWaitDialog();
        if (refreshNeeded)
            refresh();
    }

    setTimeout(openWaitDialog, 2);
    start();
}


function _snmpBaseAjax (opts, try_max_times, fail_count) {
	jQuery.ajax(opts).fail(function(jqXHR, textStatus, errorThrown){
		fail_count ++;
		$.log("snmpBaseAjax.fail["+fail_count+"/"+try_max_times+"]: url="+opts["url"]+", jqXHR.status="+jqXHR.status+", textStatus="+textStatus+"; errorThrown="+errorThrown);
		if (jqXHR.status == 401){
			throw "unauthorized";
		}
		if (fail_count < try_max_times){
			snmpBaseAjax (opts, try_max_times, fail_count);
		}
	});
	if (try_max_times == fail_count) {
		$.logError("Terminate snmpBaseAjax after try "+try_max_times+" times. url="+ opts["url"]);
		refresh();
	}
}

//The base ajax will check the authorize,
//all snmpget/set/walk function should use this object to filter the authrization.
function snmpBaseAjax (options){
	var opts = _.extend({
		 dataType:"text",
         async:false,
         cache:false}, options);
	var try_max_times = 5, fail_count =0;
	_snmpBaseAjax (opts, try_max_times, fail_count);

};
function snmpGetJsonSync(url, opts) {
	var outJson = {};
	snmpBaseAjax(_.extend({
        url:url,
        success:function (result) {
            result = decrypt(result);
            outJson = JSON.parse(result);
            $.log("snmpGetJsonSync["+url+"]:\n"+JSON.stringify(outJson));
        },
        dataType:"text",
        async:false,
        cache:false
    }, opts));
	return outJson;
}


// sa [ string... ]
function snmpGet(sa) {
    try {
        var url = hooks.buildGetURL(sa);
        var rv = snmpGetJsonSync(url);
        rv = hooks.postProcess(rv);
        return rv;
    } catch (e) {
        $.log("snmpGet caught " + e);
        throw e;
    }
}

function snmpWalk(sa) {
    try {
        var url = hooks.buildWalkURL(sa);
        var rv = snmpGetJsonSync(url);
        rv = hooks.postProcess(rv);
        return rv;
    } catch (e) {
        $.log("snmpWalk caught " + e);
        throw e;
    }
}

function snmpWalkAsync(sa, callback) {
        var url = hooks.buildWalkURL(sa);
        var rv = null;
        snmpBaseAjax({
            url:url,
            success:function (result) {
                result = decrypt(result).trim();
                $.log("snmpWalkAsync success result:"+result);
                if (!result || result.charAt(result.length-1)!='}'){
                	rv = null;
                }else{
                	rv = JSON.parse(result);
                }

                if (callback){
                	callback(rv);
                }
            },
            async:true
        });
}


function continueSession() {
   return;
   var turnCryptOff = true || location.href.contains("nocrypt");
   if (turnCryptOff && getSessionStorage("ar_use_session_key") == "on") {
       clearLoginCredential();
       setSessionStorage("ar_use_session_key", "off");
   }
   if (!getSessionStorage("ar_use_session_key"))
       setSessionStorage("ar_use_session_key", turnCryptOff ? "off" : "on");
   if (getSessionStorage("ar_use_session_key") != "on") {
       clearSessionKey();
       return;
   }

    var cred = isLoggedIn() ? attrs["Credential"] :  "";
//    if (!cred)
//        return false;
    var ok = false;
    var startSession = false;
    try {
        jQuery.ajax({
            url:"/factory/continueSession?arg=" + (cred ? encrypt(cred) : ""),
            success:function (result) {
                ok = true;
            },
            error:function (jqXHR, textStatus, errorThrown) {
                startSession = (errorThrown == "No Session Key");
            },
            dataType:"text",
            async:false,
            cache:false
        });
    } catch (e) {
        ok = false;
    }
    if (!ok) {
        clearLoginCredential();
    }
    if (startSession) {
        clearSessionKey();
        setupSessionKey();
    }
    return ok;
}

function login(name, password) {
    //Save off password for use when decrypting wifi passphrases encrypted on server.
    password = encode_Html(password);
    /*if (getCSRLoginMode() != 1) {
        setSessionStorage("gui_pw", password);  //ARRIS ADD 37130
    } else {
        setSessionStorage("gui_pw", " ");
    }*/
    var jsConfig =  '{"csrfNonce": "' + getSessionStorage("csrf_nonce") + '", "newPassword": "' + password + '", "oldPassword": "' + password + '", "ChangePassword": "false"}';
    credentialData(jsConfig);
    return isLoggedIn();
}



function logout()
{
	$.ajax({
        type: "POST",
        url: "php/logout.php",
        success: function(msg) {
            //setSessionStorage("ar_nonce","");
            setSessionStorage("csrf_nonce","");
        },
        async:false,
        cache:false,
        error: function(){
            console.log("ERROR in Logout");
            // does something
        }
    });
}
/*function getNonce() {
    var n = getSessionStorage("ar_nonce");
    if (!n) {
        n = "_n="+(""+Math.random()).substr(2,5);
        setSessionStorage("ar_nonce", n);
    }
    return n;
}*/
// UNIHAN ADD START PD215305
function checkAccount( userName ) {

    var up = Base64.encode( "1" + ":" + userName );
    var ret = "";
    jQuery.ajax({
        url:"checkAccount?arg=" + up ,
        success:function (result) {
            ret = result;
        },
        dataType:"text",
        async:false,
        cache:false
    });

    if( ret == "true" )
    {
        return true;
    }
    else
    {
        return false;
    }
}
// UNIHAN ADD END
// UNIHAN ADD START PD5618
function isMSODisSSID( ssid ) {

    var ret = "";
    jQuery.ajax({
        url:"checkMSOTakeCtrl?arg=" + "1" + ":" + ssid ,
        success:function (result) {
            ret = result;
        },
        dataType:"text",
        async:false,
        cache:false
    });

    if( ret == "true" )
    {
        return true;
    }
    else
    {
        return false;
    }
}
// UNIHAN ADD END
function checkPassword( password ) {
    password = encode_Html(password);
    var jsConfig =  '{"csrfNonce": "' + getSessionStorage("csrf_nonce") + '", "newPassword": "' + "" + '", "oldPassword": "' + password + '", "ChangePassword": "false"}';
    credentialData(jsConfig);
    var ok = ag.isGUIblocked == false? true : false;
    return ok;
}

function credentialData(jsConfig) {
    //ARRIS ADD START 37130
    //Parse and stringify are needed since encryptData expects an array.
    jsConfig = JSON.parse(jsConfig);
    jsConfig = encryptData(jsConfig);
    jsConfig = JSON.stringify(jsConfig);
    //ARRIS ADD END 37130
    $.ajax({
        type: "POST",
        url: "php/ajaxSet_Password.php",
        data: { configInfo: jsConfig },
        dataType: "json",
        success: function(msg) {
            if ("Match" == msg.p_status) {
                var csrf_nonce = msg.nonce;
                setSessionStorage("credential","eyAidW5pcXVlIjoiMjgwb2FQU0xpRiIsICJmYW1pbHkiOiI4NTIiLCAibW9kZWxuYW1lIjoiVEcyNDkyTEctODUiLCAibmFtZSI6InRlY2huaWNpYW4iLCAidGVjaCI6dHJ1ZSwgIm1vY2EiOjAsICJ3aWZpIjo1LCAiY29uVHlwZSI6IkxBTiIsICJnd1dhbiI6ImYiLCAiRGVmUGFzc3dkQ2hhbmdlZCI6IllFUyIgfQ==");
                setSessionStorage("csrf_nonce",csrf_nonce);
                ag.isGUIblocked = false;
                ag.isInvalidPassword = false;
                ag.otherLocalUser = false;
            }
            else if(msg.p_status == "Active_session")
            {
                ag.otherLocalUser = true;
                ag.isInvalidPassword = false;
            }
            else
            {
                ag.otherLocalUser = false;
                ag.isInvalidPassword = true;
            }
        },
        async:false,
        cache:false,
        error: function(){
        	// does something
        }
    });
}

function changePassword(OldPassword, NewPassword) {
    OldPassword = encode_Html(OldPassword);
    var jsConfig =  '{"csrfNonce": "' + getSessionStorage("csrf_nonce") + '", "newPassword": "' + NewPassword + '", "oldPassword": "' + OldPassword + '", "ChangePassword": "true"}';
    credentialData(jsConfig);
    var ok = ag.isGUIblocked == false?1:0;
    return ok;
}

function getPublicKey() {
    var res="";
    jQuery.ajax({
        url:"/factory/getPublicKey",
        success:function (result) {
            res = result;
        },
        dataType:"text",
        async:false,
        cache:false
    });
    return res;
}

function setCipher(base64) {
    var ok=false;
    jQuery.ajax({
        url:"/factory/setCipher?arg="+base64,
        success:function () {
            ok = true;
        },
        dataType:"text",
        async:false,
        cache:false
    });
    return ok;
}

function setupSessionKey() {
    if (getSessionKey())
        return;

    var pubkey = getPublicKey();
    var rsa = new RSAKey();
    var publicKey = getPublicKey().split(":");
    var n = publicKey[0]; //"BE79FD8A396EA4AA6D758585F272C08D15EA7523EA53A24FE614F78195D892090A115C60A2B39936ECFB4896035C8474A85EA7B9CA03DED20A8FF81B4765617CEE330CF72C28F603B32936BE15A914986F6A04627F61C1F777018D75CB4ECD226ABF63A274027E5378AA9ADFB0CCD20B260029A3AE89ECEC3B2EDD2FC6A106CF";
    var e = publicKey[1];  //"010001";
    rsa.setPublic(n, e);
    var key = "1234567890123456";
    var res = rsa.encrypt(key);
    setCipher(hex2b64(res));
    setSessionKey(key);
}

var _adapterTypes = {
	0: "unknown",
	1: "ethernet",
	2: "usb",
	3: "moca",
	4: "dsg",
	5: "wireless1",
	6: "wireless2",
	7: "wireless3",
	8: "wireless4",
	9: "wireless5",
	10: "wireless6",
	11: "wireless7",
	12: "wireless8",
	13: "wireless9",
	14: "wireless10",
	15: "wireless11",
	16: "wireless12",
	17: "wireless13",
	18: "wireless14",
	19: "wireless15",
	20: "wireless16",
	21: "ethernet2",
	22: "ethernet3",
	23: "ethernet4"

	};
function adapterType(v)
{
  if (v == 1 || v==21 || v== 22 || v==23) return "Ethernet";
  else if (v == 2) return "Usb";
  if (v == 3) return "Moca";
  else if (v == 4) return "Dsg";
  /*else if (v == 6 || v == 14) return "XHS"  for PROD00195509 */
  else if (v >= 5 && v <= 12) return "Wireless24";
  else if (v >= 13 && v <= 20) return "Wireless50";
  else return "Unknown";
}

var _adapterTypesOfSSIDs = {
	10001: 5,
	10002: 6,
	10003: 7,
	10004: 8,
	10005: 9,
	10006: 10,
	10007: 11,
	10008: 12,
	10101: 13,
	10102: 14,
	10103: 15,
	10104: 16,
	10105: 17,
	10106: 18,
	10107: 19,
	10108: 20
	};
function getAdapterTypeOfSSID(ssid){
	return _adapterTypesOfSSIDs[ssid];
}
var BssSession = {
	sessionKey: "ar_bssTable",
	// Load BSS Table if the session storage is empty.
	loadBSSTable:	function (){
		if (!getSessionStorage(this.sessionKey)){
			clearMibTableData(BSSTable);
			var bssTbl = [];
			var _bulkLoading = bulkLoading;
			bulkLoading = false;
			BSSTable.getTable([arBssSSID], function(index, row, key){
				bssTbl.push({"index":index,"ssid":row[0], "ifIndex":key});
			});
			bulkLoading = _bulkLoading;

			setSessionStorage(this.sessionKey, JSON.stringify(bssTbl));
		}
	},
	// Get SSID name by IfIndex
	getSSIDNameByIfIndex: function (ifIndex) {
		this.loadBSSTable();
		var bssTbl = JSON.parse(getSessionStorage(this.sessionKey));
		var ssid = null;
		_.each(bssTbl, function(obj){
			if (obj.ifIndex == ifIndex){
				ssid = obj.ssid;
				_.breakLoop();
			}
		});
		return ssid;
	},
	// Clear session storage
	clearBSSTableSessionStorage: function(){
		setSessionStorage(this.sessionKey, "");
	}


};

function bulkSet() {
    var oids = [];
    var send = false;
    _.each(bulkSetList, function (oid, index) {
        oids.push(oid);
        //if (oids.length === 20 || index === (bulkSetList.length-1)) {
        if (index === (bulkSetList.length-1) || ((oids.toString().length + oid.toString().length) >= 1900)) {
            //$.log("bulkSet = " + JSON.stringify(oids));
            $.log("bulkSet Length = " + oids.toString().length);
            var v = snmpBulkSet(oids);
            oids = [];
            oids.length = 0;
        }
    });
    clearBulkSetList();
}

function snmpBulkSet(oida ) {

    snmpSet_stat.total_submits ++;

    var url = hooks.buildBulkSetURL(oida);
    $.log("url: " + url);
    var rv = "fail";

    jQuery.ajax({
        url:url,
        success:function (result) {
            rv = result;
            snmpSet_stat.success_returns++;
        },
        error:function (jqXHR, textStatus, errorThrown) {
            if (jqXHR.status == 401) {
                rv = "unauthorized";
            }
            snmpSet_stat.failed_returns++;
        },
        async:false,
        cache:false
    });

    if (rv == "unauthorized")
        throw "unauthorized";
    $.log(">>" + JSON.stringify(rv));
    return rv;
}


function isRouterConnection()
{
    if ( attrs["gwWan"]&& (attrs["gwWan"] == "t") )
    {
        return true;
    }
    else
    {
        return false;
    }
}

