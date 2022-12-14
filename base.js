// Copyright 2011-2018, ARRIS Enterprises, LLC. All rights reserved.
// This program is confidential and proprietary to ARRIS Enterprises, LLC. (ARRIS), and may not be
// copied, reproduced, modified, disclosed to others, published or used, in whole or in part, without
// the express prior written permission of ARRIS.
// Portions Copyright 2013 webtoolkit.info Inc.  http://www.webtoolkit.info/javascript_base64.html

var _afterBuild = new Array();
var _afterApply = new Array();
var _applyFinished = new Array();
var ag = null;
var _technician = { };
var base = "";
var basePath = "";
var _lastEvent;

// Move the below declarations down as getUserData references
// session storage csrf nonce.  The function definition needs to be available
// before this call.
//var getData = {"hidemodemmode": ""};
//var data = getUserData(getData);
//var hideModemMenu=data['hidemodemmode'];

$.ajaxSetup({
    type: "POST",
    beforeSend: function (xhr) {
        xhr.setRequestHeader("CSRF_NONCE", getSessionStorage("csrf_nonce"));
    }
});

function supports_html5_storage() {
    try {
        return 'sessionStorage' in window && window['sessionStorage'] !== null;
    } catch (e) {
        return false;
    }
}
function clearSessionStorage() {
    if (sessionStorage) {
        var ar_session_key = sessionStorage["ar_session_key"];
        var ar_use_session_key = sessionStorage["ar_use_session_key"];
        while (sessionStorage.length) {
            var k = sessionStorage.key(0);
            if (!k)
                break;
            sessionStorage.removeItem(k);
        }
        if (ar_session_key)
            sessionStorage["ar_session_key"] = ar_session_key;
        if (ar_use_session_key)
            sessionStorage["ar_use_session_key"] = ar_use_session_key;
    }
}
var _sessionStorage = supports_html5_storage() ? sessionStorage : null ;
function getSessionStorage(key) {
    if (_sessionStorage)
        return _sessionStorage[key];
    return Base64.decode(readCookie(key));
}
function setSessionStorage(key,value) {
    if (_sessionStorage)
        _sessionStorage[key] = value;
    else createCookie(key, Base64.encode(value));
}

var getData = {"hidemodemmode": ""};
var data = getUserData(getData);
var hideModemMenu=data['hidemodemmode'];
var IsSubnetChanged = "";

var _localStorage = {
    hname:location.hostname?location.hostname:'localStatus',
    isLocalStorage:window.localStorage?true:false,
    dataDom:null,

    initDom:function(){
        if(!this.dataDom){
            try{
                this.dataDom = document.createElement('input');
                this.dataDom.type = 'hidden';
                this.dataDom.style.display = "none";
                this.dataDom.addBehavior('#default#userData');
                document.body.appendChild(this.dataDom);
                var exDate = new Date();
                exDate = exDate.getDate()+300000;
                this.dataDom.expires = exDate.toUTCString();
            }catch(ex){
                return false;
            }
        }
        return true;
    },
    set:function(key,value){
        if(this.isLocalStorage){
            window.localStorage.setItem(key,value);
        }else{
            if(this.initDom()){
                this.dataDom.load(this.hname);
                this.dataDom.setAttribute(key,value);
                this.dataDom.save(this.hname);
            }
        }
    },
    get:function(key){
        if(this.isLocalStorage){
            return window.localStorage.getItem(key);
        }else{
            if(this.initDom()){
                this.dataDom.load(this.hname);
                return this.dataDom.getAttribute(key);
            }
        }
    },
    remove:function(key){
        if(this.isLocalStorage){
            localStorage.removeItem(key);
        }else{
            if(this.initDom()){
                this.dataDom.load(this.hname);
                this.dataDom.removeAttribute(key);
                this.dataDom.save(this.hname);
            }
        }
    }
};
function getLocalStorage(key){ return _localStorage.get(key);}
function setLocalStorage(key, value){ return _localStorage.set(key, value);}
function clearLocalStorage(key){ return _localStorage.remove(key);}

// 1 - log, 2-show,4-verify,8-notrans, 64-set1 128-setmult
function debug(value) {
    if (value !== undefined)
        setSessionStorage("ar_debug_state",value);
    return getSessionStorage("ar_debug_state") || 0;
}
function hardwareVersion(substring) {
    if (getSessionStorage("ar_hw_version") === undefined || getSessionStorage("ar_hw_version")===null)
      setSessionStorage("ar_hw_version", snmpGet1(arHardwareVersion.oid+".0") || "???");
    var hv = getSessionStorage("ar_hw_version");
    if (substring !== undefined)
        return hv.indexOf(substring) != -1;
    return hv;
}
function customerId() {
    if (getSessionStorage("ar_cust_id") === undefined || getSessionStorage("ar_cust_id") === null) {
        //setSessionStorage("ar_cust_id",  snmpGet1(arCustomID.oid+".0") || "0");
        var getData = {"customerID": ""};
        data = getUserData(getData);
        setSessionStorage("ar_cust_id",  data['customerID'] || "7");
    }
    return getSessionStorage("ar_cust_id").asInt();
}

function userRadioControl() {
    if (getSessionStorage("ar_user_rc") === undefined || getSessionStorage("ar_user_rc") === null)
    {
        var ret_val = snmpGet1(arWiFiRadioControlMode.oid+".0").asInt(0);
        //setSessionStorage("ar_user_rc", snmpGet1(arWiFiRadioControlMode.oid+".0").asInt(0) === 0 ? 1 : 0);
        setSessionStorage( "ar_user_rc", ret_val.asInt(0) );
    }
    //return getSessionStorage("ar_user_rc") == "1";
    return getSessionStorage("ar_user_rc").asInt(0);
}

// UNIHAN ADD START , PROD00194460
function resetUserRadioControl()
{
    var ret_val = snmpGet1(arWiFiRadioControlMode.oid+".0").asInt(0);
    setSessionStorage( "ar_user_rc", ret_val.asInt(0) );
    return getSessionStorage("ar_user_rc").asInt(0);
}

function validateUserRadioControl()
{
    userRadioControl(); // Store control mode if it is null
    var preMode = getSessionStorage("ar_user_rc");
    var curMode = snmpGet1(arWiFiRadioControlMode.oid+".0").asInt(0);

    if( parseInt( preMode ) == parseInt( curMode ) )
    {
        return true;
    }
    return false;
}
// UNIHAN ADD START

function selectedRadio() {
    if (getSessionStorage("ar_selected_radio") === undefined || getSessionStorage("ar_user_rc") === null) {
        setSelectedRadio(0);
        return 0;
    }
    return getSessionStorage("ar_selected_radio");
}

function setSelectedRadio(val) {
    setSessionStorage("ar_selected_radio", val);
}

function language(forceCheck) {
    try {
    if (forceCheck || getSessionStorage("ar_language") === undefined || !getSessionStorage("ar_language")) {
        //var snmplang = snmpGet1(arLanguage.oid+".0");
        //setSessionStorage("ar_language",  snmplang || "English");
        var getData = {"lang": ""};
        data = getUserData(getData);
        setSessionStorage("ar_language",  data["lang"] || "en");
    }
    return getSessionStorage("ar_language");
    } catch (e) {
        return "en";
    }
}
function allow40MHzOnly() {
    if (getSessionStorage("ar_allow40MHz") === undefined || getSessionStorage("ar_allow40MHz") === null) {
       setSessionStorage("ar_allow40MHz",  snmpGet1(arWiFiAllow40MHz.oid+".0") || "0");
    }
    return getSessionStorage("ar_allow40MHz") == "1";
}
function clearLanguage() {
    setSessionStorage("ar_language", "");
}

function clearSessionKey() {
    setSessionStorage("ar_session_key", "");
}
function setSessionKey(val) {
    setSessionStorage("ar_session_key", val);
}
function getSessionKey() {
    return getSessionStorage("ar_session_key") || "";
}

function isTwc() {
    return customerId() === 3;
}
function isSuddenlink() {
    return customerId() === 12;
}
function isLGI() {
    return true;
    return ((customerId() === 6) ||(customerId() === 7) || (customerId() === 8)
             || (customerId() === 9) || (customerId() === 20) || (customerId() === 23)
	     || (customerId() === 26) || (customerId() === 27) || (customerId() === 41));
}
function isVM() {
    return ((customerId() === 8) || (customerId() === 41));
}
function isZiggo() {
    return customerId() === 20;
}
// PEGATRON ADD START - PD4666, PD7192, PD8180, PD8181
function isCox() {
    return customerId() === 5;
}
// PEGATRON ADD END - PD4666, PD7192, PD8180, PD8181

function wirelessBand() {
    if (getSessionStorage("ar_wirelessBand") === undefined || getSessionStorage("ar_wirelessBand") === null) {
        setSessionStorage("ar_wirelessBand",  snmpGet1(arWirelessBand.oid+".0") || "0");
    }
    return getSessionStorage("ar_wirelessBand");
}

function first_install_status() {
    if (!attrs["conType"])
        check_ConType();
    if (attrs["conType"]&& attrs["conType"].contains("WAN")){
        return 1;
    }
    if (getSessionStorage("ar_first_install") === undefined || getSessionStorage("ar_first_install") === null) {
        //setSessionStorage("ar_first_install",  snmpGet1(arFirstInstallWizardCompletionStatus.oid+".0") || "0");
    // LGI MOD START
    var getData = {"firstInstallStatus": "", "firstInstallState": ""};
        data = getUserData(getData);
        var firstInstall = (data['firstInstallStatus'] == 0 && data['firstInstallState'] == 0)?0:1;
        setSessionStorage("ar_first_install",  firstInstall || "0");
    // LGI MOD END
    }
    return getSessionStorage("ar_first_install").asInt();
}

var menuStateLoaded = false;
function loadMenus()
{
    if (!menuStateLoaded
        && (getSessionStorage("ar_hide") === undefined || !getSessionStorage("ar_hide"))
        /*  UNIHAN MOD .PROD00198220
        && isLoggedIn()
        */
        )
    {
        //if (!menuStateLoaded  && isLoggedIn()) {
        menuStateLoaded = true;

        var table = [ ] ; // table stopped working WebAccessTable.getTable([arWebAccessPage]);
        // UNIHAN ADD START PROD00220991
        var getData = {"deviceMode": "", "dsliteMode": ""};
        data = getUserData(getData);
        var IPMode = parseInt(data['deviceMode']);//arWanIPProvMode.get();
        var DSLite = parseInt(data['dsliteMode']);//parseInt(arDSLiteWanEnable.get());
	// UNIHAN MOD START PROD00221873
        var ipv4Page = ";disable:wan_dynamic;disable:wan_static;disable:lan_settings;disable:firewall_ip;disable:wan_routing;disable:firewall_dmz;disable:firewall_virt";
	// UNIHAN MOD END PROD00221873
        var ipv6Page = ";disable:wan_dynamicv6;disable:wan_staticv6;disable:lan_settingsv6;disable:firewall_ipv6";

        if(isLGI())
        {
            first_install_status(); // Do it now to create session storage once.

            checkRedirect();

            if(parseInt(eRouterInitMode.get()) == 1 || (isZiggo() && IPMode == 0)){
                var gwFields = ";hide:ParentalControl;hide:ConnectedDevices;hide:AdvancedSettings;hide:home_wizardfields;hide:home_conn_devices_field;hide:remote_access;";
                table.push([gwFields]);
                if( isVM() )
                {
                    table.push([";hide:remote_access"]);
                }
            }

            if(isVM())
            {
                var hideVM = ";hide:ParentalControl;";
                table.push([hideVM]);
            }

            if(parseInt(IPMode) == 1)
            {
                var IPv6fields = ";hide:device_status_WANIPv6Info;hide:device_status_WANDSLiteInfo;hide:dhcp_setting_DHCPv6serverContainer;hide:firewall_IPv6Firewall;hide:ipfilter_ipv6Container";
                table.push([IPv6fields]);
            }
            else if(parseInt(IPMode) == 2) // IPv6 mode
            {
                if(DSLite == 1) //DSLite enabled
                {
                    var IPv4fields = ";hide:device_status_WANIPv4Info;hide:firewall_IPv4Firewall;hide:ipfilter_ipv4Container";
                }
                else if(DSLite == 2) // DSLite disabled
                {
                    var IPv4fields = ";hide:device_status_WANIPv4Info;hide:dhcp_setting_DHCPv4Container;hide:firewall_IPv4Firewall;hide:ipfilter_ipv4Container";
                }
                table.push([IPv4fields]);
            }

	    //Hide changepassword page in case of the user login from gateway interface, but CSR agent is able to access it
	    if(!isTechnician() && isRouterConnection())
	    {
		var Passwordfield = ";hide:change_password;";
		table.push([Passwordfield]);
	    }
        }

        if( parseInt(IPMode) == 1 )
        {
            table.push([ipv6Page]);
        }
        else if( parseInt(IPMode) == 2 )
        {
            table.push([ipv4Page]);
        }
        // UNIHAN ADD END PROD00220991

	// UNIHAN ADD START CLM-4504
	if( customerId() == 5 && !isTechnician() )
	{
	    var hide_page = ";hide:wan_static;hide:wan_staticv6";
	    table.push([hide_page]);
	}
	// UNIHAN ADD END CLM-4504

        WebAccessTable.getTable([arWebAccessPage, arWebAccessLevel, arWebAccessRowStatus], function(index, row, key)
        {
            var s = row[0];
            var AccessLevel = parseInt( row[1] );
            var RowStatus = parseInt( row[2] );
            if (s)
            {
                if( RowStatus == 1 && (( AccessLevel == 1 && isTechnician() ) || ( AccessLevel == 2 && !isTechnician() ) || ( AccessLevel == 3 )))
                {
                    table.push([s]);
                }
            }
        });

        var hides = ";";
        var disables = ";";
        function loadRow(row) {
            var ss = row[0].split(";");
            _.each(ss, function(sss) {
               var ssss = sss.split(":");
                if (ssss[0] === "hide")
                    hides += ssss[1]+";";
                if (ssss[0] === "disable")
                    disables += ssss[1]+";";
                //if (ssss[0] === "skin") {
                //	setSessionStorage("ar_skin",  ssss[1]);
                //}
            });
        }
        _.each(table, loadRow);

//Hiding DMZ,portforward and porttriggering menus When DSLite mode is enabled

 if(isLoggedIn()!=null)
	{
		if(parseInt(arDSLiteWanEnable.get())==1)
		{
			 hides += "security_dmz;porttriggering;portforwarding;";
		}

	}



        //setSessionStorage("ar_hide",  hides);
        //setSessionStorage("ar_disable",  disables);
    } else {
        // UNHAN MOD START , PROD00197418
        //if(isTechnician() && getSessionStorage("ar_hide") && getSessionStorage("ar_hide") !==undefined )
        if( /* ( ( AccessLevel == 1 && isTechnician() ) || ( AccessLevel == 2 && !isTechnician() ) || ( AccessLevel == 3 ) ) &&*/
              getSessionStorage("ar_hide") && getSessionStorage("ar_hide") !==undefined )
        {
            setSessionStorage("ar_hide",getSessionStorage("ar_hide") );
        }
        else
        {
            setSessionStorage("ar_hide", ";");
        }

        if( /*( ( AccessLevel == 1 && isTechnician() ) || ( AccessLevel == 2 && !isTechnician() ) || ( AccessLevel == 3 ) ) &&*/
              getSessionStorage("ar_disable") && getSessionStorage("ar_disable") !==undefined )
        {
            setSessionStorage("ar_disable",getSessionStorage("ar_disable") );
        }
        else
        {
            setSessionStorage("ar_disable", ";");
        }
        // UNIHAN MOD END
    }
}
function getSkin(){
    var getData = {"webUiSkin": ""};
    data = getUserData(getData);
    if (getSessionStorage("ar_skin") === undefined || getSessionStorage("ar_skin") === null || getSessionStorage("ar_skin") != data['webUiSkin']) {
        setSessionStorage("ar_skin",  data['webUiSkin'] || "upc");
    }
    return getSessionStorage("ar_skin");
}
function isDisabledByMso(tag){
	if (!getSessionStorage("ar_disable")){
		return false;
	}
	return getSessionStorage("ar_disable").contains(";"+tag+";");
}
// todo: verify twc here
function menuVisible(s) {
    loadMenus();
//    return (isTechnician() && !isTwc()) || !s || !(getSessionStorage("ar_hide").contains(s+";"));
    return !s || !(getSessionStorage("ar_hide").contains(";"+s+";"));
}
function submenuVisible(s) {
    loadMenus();
//    return (isTechnician() && !isTwc()) || !s || !(getSessionStorage("ar_hide").contains(s+";"));
    return !s || !(getSessionStorage("ar_hide").contains(";"+s+";"));
}
// It???s also able to use menu.id to enable/disable page,
// if the menu.id is on top menus, all of its children should be effected.
function pageEnabled(s) {
    loadMenus();
    var ret = !s || !isDisabledByMso(s);
    if (ret){
    	var m = menu();
    	for (var i=0; i< m.length; i++){
    		var item = m[i];
    		if (item.page==s && isDisabledByMso(item.id)){
    			return false;
    		}
    		if (item.children){
    			for (var iChild=0; iChild<item.children.length; iChild++){
    				var childItem = item.children[iChild];
    				if (childItem.page==s &&
    					(isDisabledByMso(childItem.id) || isDisabledByMso(item.id))){
    					return false;
    				}
    			}
    		}
    	}
    }
    return ret;
}
function fieldsetVisible(s) {
    loadMenus();
//    return isTechnician() || !s || !(getSessionStorage("ar_hide").contains(base+"_"+s+";"));
    return !s || !(getSessionStorage("ar_hide").contains(";"+base+"_"+s+";"));
}
function fieldsetEnabled(s) {
    loadMenus();
    //return isTechnician() || !s || !(getSessionStorage("ar_disable").contains(base+"_"+s+";"));
    return !s || !(getSessionStorage("ar_disable").contains(";"+base+"_"+s+";"));
}
jQuery.fn.valOrChecked = function(v) {
    var vals = [];
    this.each(function() {
        var a = $(this);
        if (v !== undefined) {
            if (a.is(':checkbox'))
                a.attr("checked", !(v == "0"));
            else a.val(v);
            vals[0] = this;
        } else {
            vals.push(a.is(':checkbox') ? (a.is(":checked") ? 1 : 0) : a.val());
        }
    });
    return vals[0];
};

$.fn.truncateTextToFit = function() {
    this.each(function() {
    if ($(this).textWidth() <= $(this).width())
        return;
    var t = $(this).text();
    $(this).attr("title",t);
    while ($(this).textWidth() > $(this).width()) {
        $(this).text(t.substr(0, t.length-1));
        t = $(this).text();
    }
    $(this).html(t.substr(0, t.length-2)+" &hellip;");
    })
};


jQuery.log = function(message) {
    if (debug()&1 && window.console && window.console.debug) {
        window.console.debug(message);
    }
};
jQuery.logError = function(message) {
    if (window.console && window.console.error) {
        window.console.error(message);
    }
};

jQuery.fn.textWidth = function(){
 var calc = '<span style="display:none">' + $(this).text() + '</span>';
 $('body').append(calc);
 var width = $('body').find('span:last').width();
 $('body').find('span:last').remove();
 return width;
};

Boolean.prototype.asInt = function() {
    return this.valueOf() ? 1 : 0;
}
Number.prototype.asInt = function() {
    return Math.floor(this);
}

Number.prototype.asString = function(len) {
    var s = this.toString();
    if (s.length < len)
        return "00000000000000000000000000000000".substr(0, len - s.length) + s;
    return s;
}
Number.prototype.asHexString = function(len) {
    var s = this.toString(16);
    if (s.length < len)
        return "00000000000000000000000000000000".substr(0, len - s.length) + s;
    return s;
}
String.prototype.asInt = function(nanVal) {
    var v = parseInt(this,10);
    return isNaN(v) ? nanVal : v;
}
String.prototype.fmt = function () {
    var args = arguments;
    var pattern = new RegExp("%([0-" + arguments.length + "])", "g");
    return this.replace(pattern, function(match, index) {
        return args[index];
    });
}

String.prototype.varsub = function(subfunc) {
    var ss = this;
    if (this.indexOf('{{') !== -1)
        _.each(this.match(/{{[^}]*}}/g) || [], function(s) {
           ss = ss.replace(s,subfunc(s.substr(2,s.length-4)));
        });
    return ss.valueOf();
}

String.prototype.startsWith = function(str) {
    return (this.indexOf(str) === 0);
}
String.prototype.endsWith = function (str) {
    var lastIndex = this.lastIndexOf(str);
    return (lastIndex != -1) && (lastIndex + str.length == this.length);
}
String.prototype.grow = function(i) {
    var len = this.length + i;
    if (len < 0)
        len = 0;
    if (len <= this.length) {
        return this.substr(0, len);
    } else {
        var s = this;
        while (len-- > this.length)
            s += " ";
        return s;
    }
}
String.prototype.contains = function () {
    for (var i=0; i<arguments.length; i++)
        if (this.indexOf(arguments[i]) !== -1)
            return true;
    return false;
}
String.prototype.padLeft = function(ch,len) {
    var l = len - this.length;
    var s = ""+this;
    while (l-->0) {
        s = ch+s;
    }
    return s;
};
String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g,"");
}
String.prototype.ltrim = function() {
	return this.replace(/^\s+/,"");
}
String.prototype.rtrim = function() {
	return this.replace(/\s+$/,"");
}
// strip non word chars
String.prototype.word = function() {
    return this.replace(/\W/g,"");
}
Array.prototype.unique = function unique(keyfunc) {
    if (!keyfunc) keyfunc = function(a) { return a; };
    var o = { };
    _.each(this, function(e) { o[keyfunc(e)]=true; })
    var ua = [  ];
    _.each(this, function(e) { if (o[keyfunc(e)]) ua.push(e); o[keyfunc(e)]=false; });
    return ua;
}


/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/
var Base64 = {
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
		input = Base64._utf8_encode(input);
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
			if (true || (c < 128)) {
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
			if (true || (c < 128)) {
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

function setWifiData(wifiData) {
	wifiData["csrf_nonce"] = getSessionStorage('csrf_nonce');
	wifiData = encryptData(wifiData);  //ARRIS ADD 37130
	var wifiData_json = JSON.stringify(wifiData);
	$.ajax({
		type: "POST",
		url: "php/wifi_data.php",
		data: { wifiData: wifiData_json,
                        opType: "WRITE" },
		dataType: "json",
		success: function(msg) {
            setWifiUpdateDone();
		    if(msg == 0)
		    {
		        logoutAndReload();
		    }
		    console.log(JSON.stringify(msg));
		},
	        async:true,
		cache:false,
		error: function(){
    		setWifiUpdateDone();
			// do something
		}
	});
	return;
}

function getWifiData(wifiData) {
	var data;
	wifiData = addCryptoParams(wifiData, "getWifiData");  //ARRIS ADD 37130
	$.ajax({
		type: "POST",
		url: "php/wifi_data.php",
		data: { wifiData: wifiData,
                        opType: "READ" },
		dataType: "json",
		success: function(msg) {
			if(msg == 0)
			{
				logoutAndReload();
			}
			data = msg;
			data = decryptData(data);  //ARRIS ADD 37130
		},
	        async:false,
		cache:false,
		error: function(){
			console.log("Falied to get wifi data");
		}
	});
	return data;
}
function setMTUData(MTUData) {
        MTUData = encryptData(MTUData);  //ARRIS ADD 37130
        var MTUData_json = JSON.stringify(MTUData);
       
        $.ajax({
                type: "POST",
                url: "php/ajaxSet_mtu_size.php",
                data: { MTUData: MTUData_json },
                dataType: "text",
                success: function(msg) {
               console.log("success to set setMTUData");
                },
                async:false,
                cache:false,
                error: function(){
                console.log("Failed to set setMTUData");
                }
         });
         return;
}

function setPingData(PingData) {
        var PingData_json = JSON.stringify(PingData);
        $.ajax({
                type: "POST",
                url: "php/ajaxSet_ping_data.php",
                data: { PingData: PingData_json },
                dataType: "text",
                success: function(msg) {
                console.log("Successfully set Ping data");
                },
                async:false,
                cache:false,
                error: function(){
                        console.log("Failed to set Ping data");
                }
        });
        return;
}

function getPingData(PingData) {
        var data;
 //       var PingData_json = JSON.stringify(PingData);
        $.ajax({
                type: "POST",
                url: "php/ajaxGet_ping_data.php",
                data: { PingData: PingData },
                dataType: "json",
                success: function(msg) {
                        data =msg;
                        console.log("success to get ping data");
                },
                async:false,
                cache:false,
                error: function(){
                        console.log("Failed to get ping data");
                }
        });
        return data;
}

function setAssocDevData(assocDevData) {
	var assocDevData_json = JSON.stringify(assocDevData);
	$.ajax({
		type: "POST",
		url: "php/associated_devices_data.php",
		data: { assocDevData: assocDevData_json,
                        opType: "WRITE" },
		dataType: "json",
		success: function(returnData) {
		    if(returnData == 0)
		    {
		        logoutAndReload();
		    }
		   // console.log(JSON.stringify(returnData));
		   // console.log("success to set_AssocDev Data: ");
		},
	        async:true,
		cache:false,
		error: function(){
			//console.log("Falied to set_AssocDev Data");
		}
	});
	return;
}

function getAssocDevData(assocDevData, callback) {
	var assocDevData_json = JSON.stringify(assocDevData);
	$.ajax({
		type: "POST",
		url: "php/associated_devices_data.php",
		data: { assocDevData: assocDevData_json,
                        opType: "READ" },
		dataType: "json",
		success: function(returnData) {
		    if(returnData == 0)
		    {
		        logoutAndReload();
		    }
		    callback(returnData);
		    //console.log("success to get_AssocDev Data: ");
		},
	        async:true,
		cache:false,
		error: function(){
			//console.log("Falied to get associated devices data");
		}
	});
	return;
}
function setUPnPData(UPnPData) {
        var UPnPData_json = JSON.stringify(UPnPData);
        $.ajax({
                type: "POST",
                url: "php/upnp_setting_data.php",
                data: { UPnPData: UPnPData_json },
                dataType: "text",
                success: function(msg) {
               //console.log("success to set setUPnPData");
                },
                async:false,
                cache:false,
                error: function(){
                //console.log("Falied to set setUPnPData");
                }
         });
         return;
}

function setDhcpData(DhcpData) {
	var DhcpData_json = JSON.stringify(DhcpData);
	$.ajax({
		type: "POST",
		url: "php/ajaxSet_dhcp_setting_data.php",
		data: { DhcpData: DhcpData_json },
		dataType: "text",
		success: function(msg) {
                        var response = msg.replace(/^\s+|\s+$/g, '');
                        if (response == "SubnetMaskError") {  //We only handle error for subnet as of now
                            removeConfirmWizard();
                            showErrorTipsButton("SubnetMask", xlate(customerName("DHCPSubnetUsedForOtherFunctions", 1)), true, true);
                            return;
                        } else if (response == "LanIPError") {
                            removeConfirmWizard();
                            showErrorTipsButton("StartIPAddress", xlate(customerName("StartingIPUsedForOtherFunctions", 1)), true, true);
                            return;
                        }
			console.log("success to set dhcp data: "/*+JSON.stringify(msg)*/);
		},
		async:true,
		cache:false,
		error: function(){
			console.log("Falied to set dhcp data");
                        if(IsSubnetChanged == 'true') {
                            spinnerSuccess();
                            setTimeout(redirectBlank,2000);
                        }
		}
	});
	return;
}

function getDhcpData(dhcpData) {
	var data;
	$.ajax({
		type: "POST",
		url: "php/ajaxGet_dhcp_setting_data.php",
		data: { dhcpData: dhcpData },
		dataType: "json",
		success: function(msg) {
			data = msg;
			console.log("success to get dhcp data");
		},
		async:false,
		cache:false,
		error: function(){
			console.log("Falied to get dhcp data");
		}
	});
	return data;
}

function setUserData(userData) {
	var userData_json = JSON.stringify(userData);
	$.ajax({
		type: "POST",
		url: "php/user_data.php",
		data: { userData: userData_json,
                        opType: "WRITE" },
		dataType: "json",
		success: function(msg) {
                    if(msg == 0)
                    {
                        logoutAndReload();
                    }
                    console.log(JSON.stringify(msg));
		},
	        async:false,
		cache:false,
		error: function(){
			// do something
		}
	});
	return;
}

function getUserData(userData, callback) {
	var data;
	userData_json = JSON.stringify(userData);
	$.ajax({
		type: "POST",
		url: "php/user_data.php",
		data: { userData: userData_json,
                        opType: "READ" },
		dataType: "json",
		success: function(msg) {
			data = msg;
			if(callback) { callback(data); }
		},
	        async:false,
		cache:false,
		error: function(){
			console.log("Falied to get user data");
		}
	});
	return data;
}

function createCookie(name, value, seconds) {
    var expires = "";
    if (seconds) {
        var date = new Date();
        date.setTime(date.getTime() + (seconds * 1000 + 15));
        expires = "; expires=" + date.toGMTString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}
//function updateCookieExpiration(name, seconds) {
//    var cookie = readCookie(name);
//    if (!cookie)
//        return;
//    eraseCookie(cookie);
//    createCookie(name, cookie, seconds);
//}
function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
function hasCookie(name) {
    return (document.cookie || "").indexOf(name+"=") != -1;
}
function eraseCookie(name) {
    createCookie(name, "", -1);
}

function isCharacterKeyPress(evt) {
    if (typeof evt.which == "undefined") {
        // This is IE, which only fires keypress events for printable keys
        return true;
    } else if (typeof evt.which == "number" && evt.which > 0) {
        // In other browsers except old versions of WebKit, evt.which is
        // only greater than zero if the keypress is a printable key.
        // We need to filter out backspace and ctrl/alt/meta key combinations
        return !evt.ctrlKey && !evt.metaKey && !evt.altKey && evt.which != 8;
    }
    return false;
}
function htmlEscape(s) {
    s = ""+s; // make sure a string
    return  s.replace(/&/g,'&amp;').
                replace(/>/g,'&gt;').
                replace(/</g,'&lt;').
                replace(/"/g,'&quot;');
}
var _nextName = 0;
function getNextName(base) {
    return "_" + base + "_" + (_nextName++);
}

function buildTag(thetag) {
    return function () {
        var def = { tag: thetag };
        var contents = [];
        def.toHTML = function () {
            var str = "";
            if (def.constructor == Array) {
                for (var i = 0; i < def.length; i++)
                    str += def[i].toHTML();
                return str;
            }
            str += "<" + def.tag + " ";
            $.each(def, function (key, value) {
                if (!key || key.charAt(0) == '_' || key == "tag" || key == "contents" || key == "text" || typeof value !== "string")
                    return key;
                str += key + "=\"" + value + "\" ";
            });
            str += ">";
            if (def.text)
                str += def.text;
            if (def.contents) {
                if (def.contents.constructor == Array) {
                    for (i = 0; i < def.contents.length; i++)
                        str += def.contents[i].toHTML();
                } else {
                    str += def.contents.toHTML();
                }
            }
            str += "</" + def.tag + ">";
            return str;
        };
        var add = function () {
            for (var i = 0; i < arguments.length; i++) {
                var a = arguments[i];
                if (!a)
                    continue;
                if (typeof a === "string") {
                    var index = a.indexOf(":");
                    var key = a.substr(0, index);
                    var val = a.substr(index + 1);
                    val = val.varsub(function(s) { return s.startsWith("=") ?  eval(s.substring(1)) : xlate(s); });
                    def[key] = val;
                } else if (typeof a == "function") {
                    var fname = a.toString();
                    fname = fname.substring(fname.indexOf(" ") + 1, fname.indexOf("("));
                    var uniquefname = getNextName(fname);
                    window[uniquefname] = function (e) {
                        _lastEvent = window["event"] ? event : e;
                        a(_lastEvent);
                    };
                    def[fname] = "{ " + uniquefname + "(arguments[0]);}";
                } else if (_.isArray(a)) {
                    for (var j = 0; j < a.length; j++)
                        add(a[j]);
                } else {
                    contents.push(a);
                }
            }
        };
        add.apply(this, arguments);
        if (contents.length)
            def["contents"] = contents;
        return def;
    };
}


$.each([ "a","abbr","acronym","address","applet","area","b","base","basefont","bdo","big","blockquote","body","br","button","caption","canvas","center","cite","code","col","colgroup","dd","del",
    "dfn","dir","div","dl","dt","em","fieldset","font","form","frame","frameset","h1","h2","h3","h4","h5","h6","head","hr","html","i","iframe","img","input","ins","isindex","kbd","label",
    "legend","li","link","map","menu","meta","noframes","noscript","object","ol","optgroup","option","p","param","pre","q","s","samp","script",
    "select","small","span","strike","strong","style","sub","sup","table","tbody","td","textarea","tfoot","th","thead","title","tr","tt","u","ul","var" ]
        , function(i, t) {
    if (window["_" + t])
        throw("error _" + t + " already defined.");
    window["_" + t] = buildTag(t);

});

function parseLabel(label) {
    var index = label.indexOf(":");
    if (index == -1) {
        return { label: label, oid: "" };
    } else {
        var key = label.substr(0, index);
        var val = label.substr(index + 1);
        //OIDs.push(val);
        return { label: key, oid: val };
    }
}

// $("body").width()

function helpTag(label1, text) {
    var t = text || helpText(label1);
    afterBuild(function() {
        $("#"+label1.word()+"_image_tt").mouseenter(function(e) {
            $("body").append("<div id='ttip' class=toolTip></div>");
            $("#ttip").text(t);
            $("#ttip").css('z-index',"11000");
            $("#ttip").css('top', $(this).offset().top);
            $("#ttip").css('left',$(this).offset().left+32);
            $("#ttip").show();
        });
        $("#"+label1.word()+"_image_tt").mouseleave(function(e) {
           $("#ttip").remove();
        });
    });
    return  _div("style:display:inline;",  _img("id:"+label1.word()+"_image_tt", "src:" + basePath + "i/help.png", "height:16px", "width:16px", "style:padding-left:10px;padding-right:10px;"
        ));
}
//    return  _img("class:tipped", "src:" + basePath + "i/help.png", "height:16px", "width:16px", "style:padding-left:10px;padding-right:10px;", "title:" + helpText(label1));


function inlineButton(label1, onclick) {
    return _tr(_td("width:35%", "text:" + xlate(label1)), _td(_input("type:button", "id:" + label1, "value:{{"+label1+"}}", onclick), helpTag(label1)));
}
function inlineButtonRaw(label1, onclick) {
    return _tr(_td(_input("type:button", "id:" + label1, "value:{{"+label1+"}}", onclick)));
}
function inlineButtonRaw2(label1, onclick,label2, onclick2) {
    return _tr(_td(_input("type:button", "id:" + label1, "value:{{"+label1+"}}", onclick),_input("type:button", "id:" + label2, "value:{{"+label2+"}}", onclick2)));
}
function inlineButtonImage(label1, image, onclick) {
    return _tr(_td("width:35%", "text:{{"+label1+"}}"), _td(_input("type:image", "id:" + label1, "src:" + image, onclick), helpTag(label1)));
}


function formatter(args) {
    var f = { };
    f.load = function(v) {
        return v === undefined || v === null ? "" : v;
    };
    f.store = function(v) {
        return v === undefined || v === null ? "" : v;
    };
    f.validate = function(v) {
        if (this.notEmpty && (""+v).length == 0)
            throw xlate("%s: must have a value", f.label);
        if (this.notZero && v.asInt() === 0)
            throw xlate("%s: must be a positive number", f.label);
        return v;
    };
    f.storeAndValidate = function(v) {
        return f.store(f.validate(v));
    };
    if (args) {
        _.each(args, function(v, k) {
            f[k] = v;
        });
    }
    return f;
}

function textFormatter(args) {
    var o = formatter(args);
    o.load = function(v) {
        v = ( v === undefined || v === null) ? "" : v;
        if (v && isHexString(v) && v.endsWith(" 00")) { // strip improper null term
            v = v.substr(0, v.length-3);
            v = hexToString(v);
        }
        return v;
    };
    return o;
}





function text(label1, fmt, helpText) {
    if (technicianOnly(label1) && !isTechnician())
        return null;
    if (!fieldsetVisible(label1))
        afterBuild(function() { $("#tr_" + label1.word()).hide(); });
    if  (!fieldsetEnabled(label1))
        afterBuild(function() { $("#" + label1.word()).attr('disabled', true); });


    var f = fmt ? fmt : formatter();
    //    afterBuild(function() {
    //        $("#"+label1).bind("change", function() {
    //            adirty[label1] = $("#"+label1).valOrCheckd();
    //        });
    //    });

    if (label1)
        afterBuild(function() {
            ag.orig[label1] = $("#"+label1).valOrChecked();
        });
    if (f.store)
        afterApply(function() {
            ag.dirty[label1] = $("#" + label1).valOrChecked() != ag.orig[label1];
            if (ag[label1] !== undefined) {
                if (!$("#"+label1).attr("disabled")) {
                    var v =(f.validate($("#" + label1).valOrChecked()));
                    ag[label1] = f.store(v);
                    }
            }
        });
    var type = label1.indexOf("Password") != -1 ? "password" : "text";
    if (label1 == "Keystring")
        type = "password";

    if (f.password)
        type = "password";
    f.label = xlate(label1);
    ag[label1] = f.load ? f.load(ag[label1]) : ag[label1];
// merge change from MAIN
//   return _tr(_td("width:35%", "text:{{"+label1+"}}"), _td(_input("type:" + type, "id:" + label1, "value:" + htmlEscape(""+ag[label1]),
//            (f.size ? "size:" + f.size : null)), helpTag(label1, helpText)));
    return _tr("id:tr_"+label1,_td("width:35%", "text:{{"+label1+"}}"), _td(_input("type:" + type, "id:" + label1,
            (f.size ? "size:" + f.size : null), (type == "password" ? "autocomplete:off" : null), "value:" + htmlEscape(""+ag[label1])), helpTag(label1, helpText)));
}
function text2(label1, fmt, sepText, helpText) {
    if (technicianOnly(label1) && !isTechnician())
        return null;
    if (!fieldsetVisible(label1))
        afterBuild(function() { $("#tr_" + label1.word()).hide(); });
    if  (!fieldsetEnabled(label1))
        afterBuild(function() { $("#" + label1.word()).attr('disabled', true); });

    var f = fmt ? fmt : formatter();
    var l = parseLabel(label1);
    if (label1)
         afterBuild(function() {
             ag.orig[label1] = $("#"+label1).valOrChecked();
             ag.orig[label1+ "_1"] = $("#"+label1+ "_1").valOrChecked();
         });
    if (f.store)
        afterApply(function() {
            ag.dirty[label1] = $("#" + label1).valOrChecked() != ag.orig[label1];
            ag.dirty[label1+ "_1"] = $("#" + label1+ "_1").valOrChecked() != ag.orig[label1+ "_1"];
            if (ag[label1] !== undefined) {
                var v1 = (f.validate($("#" + label1).valOrChecked()));
                ag[label1]  = f.store(v1);
            }
            if (ag[label1 + "_1"] !== undefined) {
                var v2 = (f.validate($("#" + label1 + "_1").valOrChecked()));
                ag[label1 + "_1"]  = f.store(v2);
            }
        });
    ag[label1] = f.load(ag[label1]);
    ag[label1 + "_1"] = f.load(ag[label1 + "_1"]);
    f.label = xlate(label1);

    return _tr("id:tr_"+label1,_td("width:35%", "text:{{" + label1 + "}}"),
            _td(_input("type:text", "id:" + l.label, (f.size ? "size:" + f.size : null), "value:" + htmlEscape(""+ag[label1])), _b("text:" + (sepText !== undefined ? "&nbsp;" + sepText + "&nbsp;" : "")), _input("type:text", (f.size ? "size:" + f.size : null), "id:" + l.label + "_1", "value:" + htmlEscape(""+ag[label1 + "_1"])), helpTag(label1, helpText)));
}
function rotext(label1, fmt) {
    if (technicianOnly(label1) && !isTechnician())
        return null;
    var f = fmt ? fmt : formatter();
    var l = parseLabel(label1);
    ag[label1] = f.load ? f.load(ag[label1]) : ag[label1];

    return _tr(_td("width:35%", "text:{{" + label1 + "}}"), _td(_input("type:text", "id:" + l.label, (f.size ? "size:" + f.size : null), "class:read_only", "readonly:readonly", "value:" + htmlEscape(ag[label1])), helpTag(label1))); // UNIHAN MOD, PROD00216938
}
function rostatictext(label1, text) {
    text = text || "";
    return _tr(_td("width:35%", "text:{{" + label1 + "}}"), _td(_input("type:text", "class:read_only", "readonly:readonly", "value:" + htmlEscape(text)), helpTag(label1))); // UNIHAN MOD, PROD00216938
}
function snmpText(label1, val, size) {
    return _tr(_td("width:35%", "text:{{" + label1+"}}"), _td(_input("type:text", "class:read_only", "readonly:readonly", "value:" + val, // UNIHAN MOD, PROD00216938
            (size !== undefined ? "size:" + size : null))));

}
var snmpTextEditId = 0;
function snmpTextEdit(label1, val, size) {
    return _tr(_td("width:35%", "text:{{" + label1+"}}"), _td(_input("id:snmpTextEdit"+(snmpTextEditId++),"type:text","value:" + val,
            (size !== undefined ? "size:" + size : null))));
}
function snmpTextArea(label1, val) {
    return _tr(_td("width:35%", "text:{{" + label1+"}}"), _td(_textarea("rows:6", "cols:50", "class:read_only", "readonly:readonly", "text:" + val // UNIHAN MOD, PROD00216938
            )));

}


function snmpFieldset(label1, contents) {
    return _div("id:" + label1, _h4("text:{{" + label1+"}}"), _table("class:common_table", _tbody($.makeArray(arguments).slice(1))));
}

function form(label1, label2, contents) {
    return _div(_div("class:description", _h3("text:{{" + label1+"}}"), _div("text:{{" + label2+"}}")),
        //_div("id:loading_distractor" , "style:display: none;",
        //"style:position:absolute;left:300px;top:350px;z-index:9;",
        //_span(_img("src:i/distractor.gif"))),
            $.makeArray(arguments).slice(2), _br(), _br());
}

//function fieldset(label1, contents) {
//    if (technicianOnly(label1) && !isTechnician())
//        return null;
//    if (!fieldsetVisible(label1))
//        afterBuild(function() { $("#" + label1.word()).hide(); });
//    if  (!fieldsetEnabled(label1))
//        afterBuild(function() { $("#" + label1.word()+ " *").attr('disabled', true); });
//    return _div("id:" + label1.word(), _h4("text:{{" + label1+"}}"), _table("class:common_table", _tbody($.makeArray(arguments).slice(1))));
//}
/**
 * Extend the attributes:
 * attr["isBuildTable"] ---- If true, the fieldset is a table type, all contents should be _tr elements,
 * 							 If false, the fieldset is a div type,all contents could be any legal elements.
 * 							 Default isBuildTable is true.
 * attr["level"]        ---- Effect the headline, condidations is 4(_h4), 5(_h5), the default is 4.
 */
function fieldset(label1, contents, attr ) {
    if (technicianOnly(label1) && !isTechnician())
        return null;
    if (!fieldsetVisible(label1))
        afterBuild(function() { $("#" + label1.word()).hide(); });
    if  (!fieldsetEnabled(label1))
        afterBuild(function() { $("#" + label1.word()+ " *").attr('disabled', true); });
    var isBuildTable = true, level =4;
    var contentArr = $.makeArray(arguments);
    attr = contentArr[contentArr.length-1];
    if (undefined != attr && (undefined != attr["attr"]) ){
    	$.log("label="+label1+"; attr.isBuildTable="+attr["isBuildTable"]+";attr.level="+attr["level"] );
    	if (undefined != attr["isBuildTable"]) isBuildTable = attr["isBuildTable"];
    	if (undefined != attr["level"]) level = attr["level"];
    	contentArr = contentArr.slice(1, contentArr.length-1);
    }else{
    	contentArr = contentArr.slice(1);
    }

    var headline = "";

    if (level == 5) {
    	headline = _h5("text:{{" + label1+"}}");
    }else{
    	headline = _h4("text:{{" + label1+"}}");
    }
    var body = "";
    if (isBuildTable){
    	body = _table("class:common_table", _tbody(contentArr));
    }else{
    	body = _div("style:border-top:1px solid #ccc;", contentArr);
    }
    return _div("id:" + label1.word(), headline, body );
}


function checkbox(label1, onchange, helpText) {
    if (technicianOnly(label1) && !isTechnician())
        return null;
    if (!fieldsetVisible(label1))
        afterBuild(function() { $("#tr_" + label1.word()).hide(); });
    if  (!fieldsetEnabled(label1))
        afterBuild(function() { $("#" + label1.word()).attr('disabled', true); });

    afterApply(function() {
        if (ag[label1] !== undefined) {
            var v = $("#" + label1).valOrChecked();
            ag.dirty[label1] = ag[label1] != v;
            ag[label1] = v;
        } else  ag.dirty[label1] = true;
    });

    //checkboxItem(label1);
    var l = parseLabel(label1);
    var checked = ag[label1];

    if (checked)
        return _tr("id:tr_"+label1,_td("width:35%", "text:{{" + label1+"}}"), _td(_input("type:checkbox", "id:" + l.label, "checked:true", onchange), helpTag(label1, helpText)));
    else return _tr("id:tr_"+label1,_td("width:35%", "text:{{" + label1+"}}"), _td(_input("type:checkbox", "id:" + l.label, onchange), helpTag(label1, helpText)));
}

// nb: values must be get set explicitly
function checkbox4(label1, label2,label3, label4) {
    if (technicianOnly(label1) && !isTechnician())
        return null;

    function buildCheck(name) {
        var al = [ ];
        if (name) {
            al.push(_input("type:checkbox", "name:"+name, "id:"+name));
            al.push(_label("for:"+name, "text:&nbsp; &nbsp; &nbsp;"+name));
        }
        return al;
    }

   return _tr(_td("width:25%", buildCheck(label1)), _td("width:25%", buildCheck(label2)),_td("width:25%", buildCheck(label3)), _td("width:25%", buildCheck(label4)));
}


function select(label1, vals, onchangefunc, selectedValue, helpText) {
    if (technicianOnly(label1) && !isTechnician())
        return null;
    if (!fieldsetVisible(label1))
        afterBuild(function() { $("#tr_" + label1.word()).hide(); });
    if  (!fieldsetEnabled(label1))
        afterBuild(function() { $("#" + label1.word()).attr('disabled', true); });

    vals = _.without(vals, null);
    var dirty = false;
    // selectItem(label1);
    var l = parseLabel(label1);
    var options = [];
    var value = selectedValue || ag[label1];
    var haveSelected =  _.any(vals, function(v) { return v.split(":")[0] == value; });
    var options = _.map(vals, function f(v, index) {
        v = v.split(":");
        if (v[0] == value || (!haveSelected && index ===0))
            return  _option("value:" + v[0], "text:" + htmlEscape(v[1]), "selected:selected");
        else return  _option("value:" + v[0], "text:" + htmlEscape(v[1]));
    });
    afterApply(function() {
        if (ag[label1] !== undefined) {
            var v = $("#" + label1).valOrChecked();
            ag.dirty[label1] = ag[label1] !== v;
            ag[label1] = v;
        } else  ag.dirty[label1] = true;
    });
    return _tr("id:tr_"+label1,_td("width:35%", "text:{{" + label1+"}}"), _td(_select("id:" + l.label, options, function onchange() {
        dirty = true;
        if (onchangefunc)
            onchangefunc();
    }), helpTag(label1, helpText)));
}
function select2(label1, vals, onchange, sepText) {
    if (technicianOnly(label1) && !isTechnician())
        return null;
    if (!fieldsetVisible(label1))
        afterBuild(function() { $("#tr_" + label1.word()).hide(); });
    if  (!fieldsetEnabled(label1))
        afterBuild(function() { $("#" + label1.word()).attr('disabled', true); });

    afterApply(function() {
        if (ag[label1] !== undefined) {
            var v1 = $("#" + label1).valOrChecked();
            ag.dirty[label1] = ag[label1] !== v1;
            ag[label1] = v1;
        }  ag.dirty[label1] = true;
        if (ag[label1 + "_1"] !== undefined) {
            var v2 = $("#" + label1 + "_1").valOrChecked();
            ag.dirty[label1+ "_1" ] = ag[label1 + "_1"] !== v2;
            ag[label1+ "_1"] = v2;
        }  ag.dirty[label1+"_1"] = true;
    });
    vals = _.without(vals, null);
    var l = parseLabel(label1);
    var options = [];
    for (var i = 0; i < vals.length; i++) {
        var index = vals[i].indexOf(":");
        options[i] = _option("value:" + vals[i].substr(0, index), "text:" + vals[i].substr(index + 1));
    }
    return _tr("id:tr_"+label1,_td("width:35%", "text:{{" + label1+"}}"), _td(_select("id:" + l.label, options, onchange),
            _b("text:" + (sepText !== undefined ? "&nbsp;" + sepText + "&nbsp;" : "")),
            _select("id:" + l.label + "_1", options, onchange), helpTag(label1)));
}
function select2Optional(label1, vals, onchange, sepText, optionalCheckText) {
    if (technicianOnly(label1) && !isTechnician())
        return null;
    afterBuild(function() {
        $("#" + l.label + "div").hide();
    });
    afterApply(function() {
        if (ag[label1] !== undefined) {
            ag[label1 + "_Checked"] = $("#" + label1 + "check").valOrChecked();
        }
        if (ag[label1] !== undefined) {
            ag[label1] = $("#" + label1).valOrChecked();
        }
        if (ag[label1 + "_1"] !== undefined) {
            ag[label1 + "_1"] = $("#" + label1 + "_1").valOrChecked();
        }
    });
    vals = _.without(vals, null);
    var l = parseLabel(label1);
    var options = [];
    for (var i = 0; i < vals.length; i++) {
        var index = vals[i].indexOf(":");
        options[i] = _option("value:" + vals[i].substr(0, index), "text:" + vals[i].substr(index + 1));
    }


    return _tr(_td("width:35%", "text:{{" + label1+"}}"),
            _td(_div("style:height:24px;width:100px;", _input("id:" + l.label + "_Checked", "type:checkbox", "checked:checked"
                ,
                  function onclick() {
                if (!$("#" + l.label + "_Checked").valOrChecked()) {
                    $("#" + l.label + "div").show();
                } else {
                    $("#" + l.label + "div").hide();
                }
            }

//                    function onchange() {
//                if (!$("#" + l.label + "_Checked").valOrChecked()) {
//                    alert("show "+("#" + l.label + "div"));
//                    $("#" + l.label + "div").show();
//                } else {
//                    alert("hide "+("#" + l.label + "div"));
//                    $("#" + l.label + "div").hide();
//                }
//            }
                    ), _b("text:" + optionalCheckText)),
                //   <label for="check3">U</label>
                    _div("id:" + l.label + "div",
                            _select("id:" + l.label, options, onchange),
                            _b("text:" + (sepText !== undefined ? "&nbsp;" + sepText + "&nbsp;" : "")),
                            _select("id:" + l.label + "_1", options, onchange),

                        helpTag(label1)
                    )

            ));
}

function getSelectedDays(divid) {
    var d = 0;
    var s = 0;
    _.each([0,1,2,3,4,5,6], function (i) {
        if ($("#"+divid+" #daycheck"+i+"").is(':checked'))
            d |= (1<<s);
        s++;
    });
    return d;
}

function select2OptionalDay(label1, vals, onchange, sepText, optionalCheckText) {
    if (technicianOnly(label1) && !isTechnician())
        return null;
    afterBuild(function() {
        $("#" + l.label + "div").hide();

    });
    vals = _.without(vals, null);
    var l = parseLabel(label1);
    var options = [];
    for (var i = 0; i < vals.length; i++) {
        var index = vals[i].indexOf(":");
        options[i] = _option("value:" + vals[i].substr(0, index), "text:" + vals[i].substr(index + 1));
    }

    var di = [  ];
    var i = 0;
    _.each(days, function (d) {
        d = d.split(":")[1];
        if (i == 4)
            di.push(_br());
        var idname = "daycheck" + i;
        if (i < 7)
            di.push(_input("id:"+idname, "type:checkbox", "checked:checked", "value:bas", "text:"+d

               // function onclick() {
              //   //   if ($("#"+idname).is(':checked'))
              //  }
                //,
                //function onclick() {
                //   if ($("#"+idname).is(':checked'))
                //    $("#"+idname).removeAttr('checked');
                //   else $("#"+idname).attr('checked','checked');
                //    return true;
                //}
            ));
        i++;
    });

    return _tr(_td("width:35%", "text:{{" + label1+"}}"),
            _td(_div("style:height:24px;width:120px;", _input("id:" + l.label + "_Checked", "type:checkbox", "checked:checked",
                  function onclick() {
                if (!$("#" + l.label + "_Checked").valOrChecked()) {
                    $("#" + l.label + "div").show();
                } else {
                    $("#" + l.label + "div").hide();
                    $("#" + l.label + "div :checkbox").attr('checked','checked');
                }
            }

//                    function onchange() {
//                if (!$("#" + l.label + "_Checked").valOrChecked()) {
//                    alert("show "+("#" + l.label + "div"));
//                    $("#" + l.label + "div").show();
//                } else {
//                    alert("hide "+("#" + l.label + "div"));
//                    $("#" + l.label + "div").hide();
//                }
//            }
                    ), _b("text:" + optionalCheckText)),
                //   <label for="check3">U</label>
                    _div("id:" + l.label + "div",
                        //    _select("id:" + l.label, options, onchange),
                        //    _b("text:" + (sepText !== undefined ? "&nbsp;" + sepText + "&nbsp;" : "")),
                        //    _select("id:" + l.label + "_1", options, onchange),
                        di//,
                     //   helpTag(label1)
                    )

            ));
}


// To fix the issue as PROD00198787 shown, I provide this function.
// The selection control will be validated when submitting form or change the value.
function selectWithFormatter(label1, vals, fmt, selectedValue, helpText) {
    if (technicianOnly(label1) && !isTechnician())
        return null;
    if (!fieldsetVisible(label1))
        afterBuild(function() { $("#tr_" + label1.word()).hide(); });
    if  (!fieldsetEnabled(label1))
        afterBuild(function() { $("#" + label1.word()).attr('disabled', true); });

    var f = fmt ? fmt : formatter();
    if (label1) {
        afterBuild(function() {
            ag.orig[label1] = $("#"+label1).valOrChecked();
        });
    }

    vals = _.without(vals, null);
    var dirty = false;
    // selectItem(label1);
    var l = parseLabel(label1);
    var options = [];
    var value = selectedValue || ag[label1];
    var haveSelected =  _.any(vals, function(v) { return v.split(":")[0] == value; });
    var options = _.map(vals, function f(v, index) {
        v = v.split(":");
        if (v[0] == value || (!haveSelected && index ===0))
            return  _option("value:" + v[0], "text:" + htmlEscape(v[1]), "selected:selected");
        else return  _option("value:" + v[0], "text:" + htmlEscape(v[1]));
    });

    if (f.store) {
	    afterApply(function() {
	        ag.dirty[label1] = $("#" + label1).valOrChecked() != ag.orig[label1];
	        if (ag[label1] !== undefined) {
	            if (!$("#"+label1).attr("disabled")) {
	            	var oriValue = $("#" + label1).valOrChecked();
	              var vRs =f.validate(oriValue);
	              if (vRs){
		              if (vRs[0] == "error"){
		              	throw vRs[1];
		              }else if (vRs[0] == "warn" || vRs[0] == "info"){
		              	alert(vRs[1]);
		              }else if (vRs[0] == "pass"){
		              	ag[label1] = f.store(vRs[1]);
		              }
	              }else{
	                ag[label1] = f.store(oriValue);
	              }
              }
	        }
	    });
    }

    return _tr("id:tr_"+label1,_td("width:35%", "text:{{" + label1+"}}"), _td(_select("id:" + l.label, options, function onchange() {
			if (f.instantValidate){
				var oriValue = $("#" + label1).valOrChecked();
        var vRs =f.validate(oriValue);
        if (vRs){
          if (vRs[0] == "error"){
          	alert(vRs[1]);
          	$("#" + label1).val(ag.orig[label1]);
          }else if (vRs[0] == "warn" || vRs[0] == "info"){
          	alert(vRs[1]);
          	$("#" + label1).val(ag.orig[label1]);
          }else if (vRs[0] == "pass"){
          	ag.orig[label1] = oriValue;
          }
        }
			}
    }), helpTag(label1, helpText)));
}

// Set the options of a select control.
// It will be replace the old options, and keep the previous selected option if existed, otherwise the first option will be selected.
function setSelectOptions(labelName, vals) {
	var ctlSelect = $("#" + labelName);
	if (undefined == ctlSelect){
		return null;
	}
	var oriValue = ctlSelect.valOrChecked();

    vals = _.without(vals, null);

    var value = oriValue;
    var haveSelected =  _.any(vals, function(v) { return v.split(":")[0] == value; });
    var optionsStr = "";
    _.map(vals, function f(v, index) {
        v = v.split(":");
        if (v[0] == value || (!haveSelected && index ===0))
            optionsStr +=  _option("value:" + v[0], "text:" + htmlEscape(v[1]), "selected:selected").toHTML();
        else optionsStr +=  _option("value:" + v[0], "text:" + htmlEscape(v[1])).toHTML();
    });

    ctlSelect.empty();
    ctlSelect.append( optionsStr );

}



function ApplyButton() {
    return buttons("{{Apply}}", function onclick(event) {
        Apply();
    });
}

function buttons() {
    var buttons = [];
    for (var i = 0; i < 4; i++)
        if (arguments[i * 2]) {
            buttons.push(_input("type:button", "value:" + arguments[i * 2], "class:submitBtn", arguments[i * 2 + 1]));
        }

    return _div("id:ApplyButton", _br(), buttons);
}

function buttonsMap(){
    var buttons = [];
    _.each(arguments, function(arg, i){
    	var btn = [];
    	_.map(arg, function(value, key){
    		if (_.isFunction(value)){
    			btn.push(value);
    		}else{
    			btn.push(""+key+":"+value);
    		}
    	});
    	 buttons.push(_input("type:button", "class:submitBtn", btn));
    });

    return _div("id:Map_ApplyButton", _br(), buttons);// UNIHAN MOD , PROD00216744
}

function dialog(id, title, elements, okName, okAction) {
    var buttonsDef = { };
    buttonsDef[xlate(okName)] = function() {
        try {
            okAction.apply(this);
        } catch (e) {
            handleError(e);
        }
    };
    buttonsDef[xlate("Cancel")] = function() {
        $(this).dialog("close");
    };

    window["dialog_" + id] = {
        autoOpen: false, width:500, modal: true,
        dialogClass: "fieldgrp",
        buttons: buttonsDef
    };

    return _div("id:" + id, "title:" + xlate(title), _table("class:common_table", _tbody(elements)));
}
function prepareDialog(id) {
    $("#" + id).dialog(window["dialog_" + id]);
}

function getURLArgs() {
    var pos = location.href.lastIndexOf('?');
    if (pos == -1)
        return "";
    var s = decodeURI(location.href.substr(pos + 1)).split("&");
    var page = s[0];
    _.each(s, function(a) {
       if (a.startsWith("debug")) {
           debug(a.substr(5));
       }
    });
    return page;
}

function getDefaultPage(){
	var defPage = "basic_setup";
	if (isSuddenlink()){
		defPage = isTechnician()?"util_status":"basic_setup";
	}
	return defPage;
}

function getPage() {
    var v = window.location.pathname;
    if (v.startsWith("/"))
        v = v.slice(1);
    return v;
}


function goRebuild(tag) {
    window.event.preventDefault();
    rebuild(tag);
    // window.open(getPage()+'?'+tag, "_self");
}
function go(tag) {
    window.open(getPage() + '?' + tag, "_self");
}

function hsd_onclick()
{
    $.ajax({
        url: "hsd",
        success: function(result) {
            eval('(function() {'+ result+'}).call(this);');
        },
        error: function(result) {
            if (window.console) console.log("hsd cgi error!");
        },
        dataType : "text",
        async: false,
        cache: false
    });
}

function buildShell() {
    $.log("buildShell");

    if (typeof noMenus !== "undefined" && noMenus) {
        var shell = _div("id:wrapper",
                _div("id:content",
                        _div("id:tabs",
                                _div("id:first",
                                        _div("id:placeholder",
                                                _table(_tbody(_tr(
                                                        _td(_div("id:mainpage"))))))
                                        ))),
                _div("id:walk-dialog", "title:", "style:display: none;"),
                 _div("id:action-dialog", "title:", "style:display: none;"),
                    _div("id:error-dialog", "title:", "style:display: none;"),
                     _div("id:wait-dialog", "title:", "style:display: none;", "text:Applying Changes...")
                );
        $(shell.toHTML()).appendTo("body");


        $("body").css("background", "transparent");
        $("#wrapper").css("background", "transparent");
        $("#footer").css("background", "transparent");
        $("#wrapper").css("width", "650");


        return;
    }

    //id page children
    var m = menu();
    if (!isLoggedIn()) {
        m = [
            { id: "Login", page: "login", children: [
                { id: "Login", page:"login" }
            ] }
        ];
    }

    //var hash = isLoggedIn() ? (getURLArgs() || getDefaultPage()) : "login";
    var hash = getDefaultPage();
    var index = 0;

    function sel(p) {
        return getPage() == p ? "class:selected" : null;
    }

    var hsd = menuVisible("HSD");

    var topNav = isClassicCM() ? _ul("id:nav",
            _li(_a("class:selected", "href:router.html", "text:{{Wireless}}")), // "href:router.html",

// UNIHAN MOD START
           hsd ?  _li(_a(isClassicCM() ?  ("href:javascript:void(0)") : ("href:cm.html"), "text:{{HSD}}", "class:end", isClassicCM()? "onclick:hsd_onclick()":(null))) : null, // "href:router.html",
           //hsd ?  _li(_a(isClassicCM() ?  ("href:"+"phy.htm") : ("href:cm.html"), "text:{{HSD}}", "class:end")) : null, // "href:router.html",
// UNIHAN MOD END
        // _li(_a("href:voice.html", "text:Voice")),
        //_li(_a("href:phy.htm", "class:end", "text:Voice")),
            _li(_a("href:router.html", "text:{{Logout}}", function onclick() {
                logout();
                clearLoginCredential();
                refresh();
            }))
            ) : _ul("id:nav",
            _li(_a(sel("router.html"), "href:router.html", "text:{{Wireless}}")), // "href:router.html",
            hsd ? _li(_a(sel("cm.html"), "href:cm.html", "text:{{HSD}}")) : null, // "href:router.html",
        // _li(_a("href:voice.html", "text:Voice")), // "class:end"
        //_li(_a("href:phy.htm", "class:end", "text:Voice")),
            _li(_a("href:" + getPage(), "text:{{Logout}}", function onclick() {
                logout();
                clearLoginCredential();
                refresh();
            }))
            );

    var mainMenu = [ ];
    var subMenu = [ ];
    $.each(m, function(k, v) {
        if (!v)
            return;
        if (v.page == hash) {
            mainMenu = v;
            subMenu = v;
        } else {
            $.each(v.children, function(k, vv) {
                if (vv && vv.page == hash) {
                    mainMenu = v;
                    subMenu = vv;
                }
            });
        }
    });

    $.log("mainMenu.id="+mainMenu.id);
    $.log("subMenu.id="+subMenu.id);


    var sideNav = _div("id:navigation_bar",
            _h1("text:{{" + mainMenu.id+"}}"),
            _ul("class:sidenav",
                    $.map(mainMenu.children ? mainMenu.children : [], function(m) {  // "class:current" class:selected
                        if (!m || !m.page)
                           return null;
                        if (m.id=="Login") m.page="";
                        if (m.page == subMenu.page)
                            return _li(_a("href:" + getPage() + "?" + m.page, "text:{{" + m.id+"}}", "class:current", "onclick: go('" + m.page + "');"));
                        else return _li(_a("href:" + getPage() + "?" + m.page, "text:{{" + m.id+"}}", "onclick: go('" + m.page + "');"));
                    }),
                    _div("style:VISIBILITY: hidden", "id:version", "text:1.0")
                    ),
            _div("id:sidenav_bottom"));


    var logo = isMG5() ? _img("src:http://"+window.location.hostname+"/skin/img/icons/logos/logo_default.png", "id:logo", "alt:moxi",  "width:143",  "height:37")
        : _img("src:i/logo.gif", "id:logo");
//    if (!isLoggedIn())  Commented by Bamy, Why Logo is hidden if no logged in?
//        logo = null;
	var shell = _div("id:wrapper",
					_div("id:header", logo, topNav),
					_div("id:content",
						_div("id:tabs",
							_ul("class:tabNavigation",
								$.map(m, function(m) {  // "class:current"
									if (!m) return null;
									var selected = _.include(_.pluck(m.children, "page"),base) ? "class:selected" : "";
									return _li(_a(selected, "href:" + getPage() + "?" + m.page, "text:{{" + m.id+"}}", "onclick: go('" + m.page + "');"));
								})
							),
							_div("id:first",
								_div("id:placeholder",
									_table(_tbody(
											_tr("id:tr_mainpage",_td("width:200px", sideNav),_td(_div("id:mainpage"))),
											_tr("id:tr_errorpage","style:display:none;color:red;", _td("colspan:2","height:100","style:padding-top:40px;","align:center", _div("id:errorpage")))
										   )
									)
								)
							)
						)
					),
					_img("src:i/content_bottom.jpg", "width:973", "height:6", "complete:complete"),
					_div("id:footer"),
					_div("id:walk-dialog", "title:", "style:display: none;"),
					_div("id:action-dialog", "title:", "style:display: none;"),
					_div("id:error-dialog", "title:", "style:display: none;"),
					_div("id:wait-dialog", "title:", "style:display: none;", "text:Applying Changes...")
				);
    $(shell.toHTML()).appendTo("body");
    //  $(header.toHTML()).appendTo("#header");
    //  $(new Menu().build().toHTML()).appendTo($("#sidebar"));
    if (mainMenu.id == undefined){
    	$("#tr_mainpage").css("display","none");
    	$("#tr_errorpage").css("display","");
    	$("#errorpage").text(xlate("This page is unavailable."));
    }

    // make sure menus fit
    $(".sidenav a").truncateTextToFit();
}


function afterBuild(func) {
    _afterBuild.push(func);
}
function afterBuildOnce(func) {
    if (!_.include(_afterBuild, func))
        _afterBuild.push(func);
}

function afterApply(func) {
    _afterApply.push(func);
}

function onApplyFinished(func) {
    _applyFinished.push(func);
}

// alog
function addCustomSetting(s) {
    var ud = snmpGet1(arCustomSettings.oid+".0") || "";
    if (!ud.contains(s+"!")) {
        ud += s+"!";
        snmpSet1(arCustomSettings.oid+".0", ud, "4");
    }
}

jQuery.cachedScript = function (url, successCallback, opts){
	var options = $.extend(opts||{}, {
			dataType:"script",
			cache:true,
			url:url,
			success:successCallback
	});
	return jQuery.ajax(options);
};

function handleError(e) {
	  $.log("handleError:" + e);

    if (e === "unauthorized") {
    	  clearLoginCredential();
        refresh();
        return;
    }
    if (e["label"])
        alert(xlate("Could not set ") + "\"" +xlate(e["label"])+"\""); // todo: tranlaset
    else if (canXlate(e))
        alert(xlate(e));
    else if (_.isString(e))
        alert(e);
    else {
    //	alert(xlate("System error:\n")+ e); // todo: tranlaset
    	var trace = printStackTrace({e:e});
  	  	alert("Error stack trace:\n"+trace);
  	  	$.logError("System error:\n" + e +"\n\n" + "Error stack trace:\n"+trace);
    }
}

function PollingApply() {
    var strTmp = "";
    try {
        strTmp = snmpGet1(arReinitStatus.oid+".0");
    } catch (e) {
        strTmp = "";
    }

    $.log("arReinitStatus="+strTmp);

    if (strTmp != "") {
        refresh();
    } else {
        strTmp = $("#wait-dialog").text();
        if (strTmp.search(/\.{3}/) >= 0) {
            $("#wait-dialog").text(strTmp.replace(/\.{3}/, ""));
        } else {
            $("#wait-dialog").text(strTmp+".");
        }
        setTimeout(PollingApply, 1000);
    }
}
// UNIHAN ADD START
function checkStartApplySetting( restartBandNo ) {
    if( isStartApplySettingNeeded() )
    {
        openWaitDialog();
        $("#wait-dialog").text("Applying Changes...");
        //startApplyAllSettings();
        setTimeout(closeWaitDialog, 15000*restartBandNo );
    }
}

function isStartApplySettingNeeded() {
    if (getSessionStorage("ar_apply_setting") === undefined || getSessionStorage("ar_selected_page")===null)
    {
        setSessionStorage("ar_apply_setting", 0);
    }

    var isSAS = getSessionStorage("ar_apply_setting");
    if( isSAS.asInt() == 1)
    {
        setSessionStorage("ar_apply_setting", 0);
        return true;
    }
    return false;
}

function setStartApplySetting() {
    setSessionStorage("ar_apply_setting", 1);
}

function DoApply(args) {
	try{
		$.log("DoApply, args="+args);
        if (args && args["storeFun"] && _.isFunction(args["storeFun"])){
        	$.log("DoApply:storeFun="+args["storeFun"]+"; storeParams" + args["storeParams"] + ",paramType="+ (typeof(args["storeParams"])));
        	args["storeFun"](args["storeParams"]);
        }else{
        	if (typeof storeData === "undefined")
        		return;
        	storeData();
        }
        if (args && args["withoutApplyAllSettings"]){
        	// do not apply all settings
        }else{
        	if (snmpSet_stat.total_submits>0){
        		MibObjects.ApplyAllSettings.set(1,"",true);
        	}else{
        		WaitDialog.close();
        		return;
        	}
        }
        if (args && args["onApplyFinished"] && _.isFunction(args["onApplyFinished"])){
        	args["onApplyFinished"]();
        }
        var _delayClose = 0; // Delay close wait dialog to make sure that ApplyAllSettings status has been changed.
        if (args && args["delayClose"]){
        	_delayClose = args["delayClose"];
        	setTimeout(function(){
                if(args && !args["refreshPage"])
                {
                    WaitDialog.close(args["refreshPage"]);
                }
                else
                {
                    WaitDialog.close();
                }
            }, _delayClose);
        }else{
                if(args && !args["refreshPage"])
                {
                    WaitDialog.close(args["refreshPage"]);
                }
                else
                {
                   WaitDialog.close();
                }
        }

	}catch(e){
		WaitDialog.closeImmediately(false);
        if (e != "cancel")
            handleError(e);
	}
}

function Apply(args) {
	try {
		$.each(_afterApply, function (k, v) {
	        v();
	    });

            if (args && args["noWaitDialog"])
            {
                // Do not open WaitDialog
            }
            else
            {
	        WaitDialog.open();
            }
	    window.setTimeout(function(){
	    	DoApply(args);
	    }, 100);

	} catch (e) {
		WaitDialog.closeImmediately(false);
        if (e != "cancel")
            handleError(e);
    }

}
// UNIHAN ADD END

//SERCOMM ADD
function replaceThePreviousLogin(){
        jQuery.ajax({
            url:"changeUser",
            dataType:"text",
            async:false,
            cache:false
        });
}
//SERCOMM END

function loginbuild() {
    ag = { };
    //ag.UserName = isSuddenlink() ? "" : "admin";
    ag.UserName = "";
    ag.Password = "";

    if (hasCookie("username"))
        ag.UserName = readCookie("username");

    doLogin = function() {
        clearSessionStorage();
        login($("#UserName").val(), $("#Password").val())
        //SERCOMM ADD
        if (!isLoggedIn()){
            alert(xlate("Invalid user name or password!"));

        }else if (isLoggedIn() == '1'){

            alert(xlate("Local user already login, please wait..."));
            clearLoginCredential();
        }else if(isLoggedIn() == '2'){

            if(confirm("Remote user already login, do you want to terminate it?")){
                replaceThePreviousLogin();
            }else{
                clearLoginCredential();
            }
        }else if (isLoggedIn() == '3'){

            alert(xlate("Other local user already login, please wait..."));
            clearLoginCredential();
        }else if (isLoggedIn() == '4'){

            alert(xlate("Other remote user already login, please wait..."));
            clearLoginCredential();
        }
        //SERCOMM END
        refresh();
    };
    afterBuild(function() {
        $(document).keypress(function(event){
            var keycode = (event.keyCode ? event.keyCode : event.which);
            if(keycode == '13'){
                doLogin();
            }
        });
    });
    return form("Login", isSuddenlink() ? "LoginText_sl" : "LoginText",
            fieldset("Login",
                    [text("UserName"),
                        text("Password")
                    ]),
            buttons("{{Apply}}", function onclick() {
                doLogin();
            }));
}

function disableForm()
{
    $('input:text').attr('disabled', 'disabled');
    $('input:checkbox').attr('disabled', 'disabled');
    $('select').attr('disabled', 'disabled');
}

function enableForm()
{
    $('input:text').removeAttr('disabled');;
    $('input:checkbox').removeAttr('disabled');;
    $('select').removeAttr('disabled');;
}


function disablePage() {
    $('#mainpage *').attr('disabled', true);
    $('.submitBtn').hide();
    if ($("#LAN")) { // make sure we can see lan change
        $("#LAN").parents().removeAttr('disabled');
        $("#LAN ").removeAttr('disabled');
        $("#LAN").children().removeAttr('disabled');
        $("#LAN").show();
    }
    if ($("#BSS")) { // make sure we can see lan change
        $("#BSS").parents().removeAttr('disabled');
        $("#BSS").removeAttr('disabled');
        $("#BSS").children().removeAttr('disabled');
        $("#BSS").show();
    }
}



function enableItem(id) {
    $('.submitBtn').show(); // make sure we can see
     $('.submitBtn').removeAttr('disabled'); // make sure we can see
    $('.submitBtn').parent().removeAttr('disabled');
    if ($(id)) {
        $(id).parents().removeAttr('disabled');
        $(id).removeAttr('disabled');
        $(id).children().removeAttr('disabled');
        $(id).show();
    }
}



function render2() {
    $.each(_afterBuild, function(k, v) {
        v();
    });

    if ($("#dialog"))
        prepareDialog("dialog");
    if ($("#dialog1"))
        prepareDialog("dialog1");
    if ($("#dialog2"))
        prepareDialog("dialog2");

    $("body").ajaxError(function(event, request, settings) {
        // alert("Error Requesting Data");
       // refresh();
    });

    if (location.href.indexOf("cm.html") != -1)
        return;

    if (isLoggedIn() && !pageEnabled(base)) {
        disablePage();
    }
    if (isLoggedIn() && (!submenuVisible(base) || !menuMap[base])) {
        $('#mainpage').hide();
    }
    if (isLoggedIn())
    {
        if(hideModemMenu == "false")
        {
            $("#Modem").hide();
        }
        else
        {
            $("#Modem").show();
        }
    }

}

function render() {
    $("#loading-dialog").remove();
    buildShell();

    var def = isLoggedIn() ? build() : loginbuild();
    $(def.toHTML()).appendTo($("#mainpage"));


    if (ag) {
        ag.dirty = { };
        ag.orig = { };
    }
    $(render2());
}


function getSelectedLAN() {
    if (!isTechnician() || isMG())
        return getLan()[0];
    return getSessionStorage("ar_selected_lan") || getLan()[0] ;
}
function selectLan() {
    if (!isTechnician() || isMG() || (isTwc()&& !isWanConnection()) )
        return null;
    ag.LAN = getSelectedLAN();
    var slans = _.map(getLan(), function (v) {
        return "" + v + ":" + getLanName(v)
    });
    return fieldset("LANSegment", select("LAN", slans, function onChange() {
        $.log("selected lan set " + $("#LAN").val());
        setSessionStorage("ar_selected_lan", $("#LAN").val());
        refresh();
    }));
}

function getSelectedBss() {
    if (!isTechnician() || isMG())
        return getBss()[0];
    //UNIHAN MOD BEG
    return getSessionStorage("ar_selected_bss") || getBss()[0] ;
    //UNIHAN MOD END
}
// UNIHAN ADD START
function adjustBssToIfindex(bss, band) {
    // Invalid ifindex is returned to NOT access any mib..
    bss = bss.asInt(0);
    if(bss > TotalSSIDsPerBand())
        return 0;
    // Return different ifindex decided by band and bss
    if (isDBC() && band)
        return Ifindex50G()+bss.asInt(0);
    return Ifindex24G()+bss.asInt(0);
}
//UNIHAN AND END
function adjustBssForBand(bss, band) {
    bss = bss.asInt(0);
    //bss = bss;
    if (isSimulateDBC()) {
        //UNIHAN MOD START
        // Change To Index Of TWC SSID Pair
        if (bss>=Primary5GIndex())
            return adjustBssToIfindex(bss-Primary5GIndex()+1,band);
        return adjustBssToIfindex(bss,band);
        //return bss >= 22 ? bss-10 : bss;
        //UNIHAN MOD END
    }
    if (band && bss<=22)
        return bss+10;
    if (!band && bss>=22)
        return bss-10;
    return bss
}

function selectBss() {
    if (!isTechnician() || isMG() || (isTwc()&& !isWanConnection()))
        return null;
    ag.BSS = getSelectedBss();
    // UNIHAN MOD START
    var slans = _.map(getBss(), function (v) {
        if ((!is5GPage()) && v.asInt(0) >= Primary5GIndex())
            return null;
        if ((is5GPage()) && v.asInt(0) < Primary5GIndex())
            return null;
        return "" + v + ":" + getBssName(v)
    });
    // UNIHAN MOD END
    return fieldset("Wireless", select("BSS", slans, function onChange() {
        $.log("selected bss set " + $("#BSS").val());
       //UNIHAN MOD BEG
       setSessionStorage("ar_selected_bss", $("#BSS").val());
       //UNIHAN MOD END
        refresh();
    }));
}


function sectionIndex() {
    var a = new Array();
    for (var i = 0; i < 99; i++) {
        if (arguments[i * 3]) {
            var li;
            (function(id1, id2, url) {
                li = _li(_a("href:" + url, _label("class:item", "text:{{" + id1 +"}}"),
                        _br(), _label("text:{{" + id2+"}}"), _br()
                        ), _br());
            })(arguments[i * 3], arguments[i * 3 + 1], arguments[i * 3 + 2]);
            a.push(li);
        } else break;
    }
    return _ul(a);
}

function canXlate(id) {
    return _xlate [id];
}
function xlate(id, arg1, arg2, arg3) {
//    if (debug()&8)
//        return "{{"+id+"}}";
    var o = _xlate [id];

    if ((debug()&8) && !o)
      o = "@@"+id;

    if (!o) {
        o = id.replace("_tt","");
        if (_xlate[o])
            o = _xlate[o];
    }
//    if (!o)
//        alert("no def for "+o);
    if (arg1 !== undefined)
        o = o.replace("%s",arg1);
    if (arg2 !== undefined)
        o = o.replace("%s",arg2);
    if (arg3 !== undefined)
        o = o.replace("%s",arg3);
    return o;
}
function xlateErrorMsg(id) {
    if (language() == "en")
        return id;
    var msg = _xlate [id];
    if (!msg)
        msg = xlate("Error");
    return msg;
}


function helpText(id) {
    if(isLGI())
    	return customerName(id+"_tt",2);
    else
        return xlate(id+"_tt");
}

function technicianOnly(id, value) {
    if (value !== undefined)
        _technician[id] = value;
    return _technician[id] === undefined ? false : _technician[id];
}


function updateDisabledState(checkboxsel, inputsel, invert) {
    var on = $(checkboxsel).attr("checked") && !$(checkboxsel).attr("disabled");
    if (invert)
        on = !on;
    var id = $(checkboxsel).attr("id");
    $(inputsel).each(function() {
        if ($(this).attr("id") != id && !$(this).hasClass(".read_only")) {
            if (on) {
                $(this).removeClass("input_disabled");
                $(this).removeAttr("disabled");
            } else {
                $(this).addClass("input_disabled");
                $(this).attr("disabled", "disabled");
            }
        }
    });
    $(inputsel).each(function() {
        if ($(this).attr("id") != id && !$(this).hasClass(".read_only")) {
            if ($(this).is(':checkbox')) {
                $(this).trigger("change");
            }
        }
    });
}

// Set the disabled state by input param - disabled
function setDisabledState(inputsel, disabled) {
    $(inputsel).each(function() {
        if (!$(this).hasClass(".read_only")) {
            if (!disabled) {
                $(this).removeClass("input_disabled");
                $(this).removeAttr("disabled");
            } else {
                $(this).addClass("input_disabled");
                $(this).attr("disabled", "disabled");
            }
        }
    });
    $(inputsel).each(function() {
        if (!$(this).hasClass(".read_only")) {
            if ($(this).is(':checkbox')) {
                $(this).trigger("change");
            }
        }
    });
}

function setupCheck(checkboxsel, inputsel, invert) {
    function updater() {
        if (invert)
            updateDisabledState(checkboxsel, inputsel, true);
        else updateDisabledState(checkboxsel, inputsel);
    }
    afterBuild(function() {
        $(checkboxsel).bind("click", updater);
        updater();
    });
}


function todToInt(selectedDays, hour1, hour2) {
    hour1 = hour1.asInt();
    hour2 = hour2.asInt();

//    if (hour1 >= hour2)
//        throw xlate("No hours of the day selected. Second hour must be after the first.");

    var todTime = 0;
    var i = 0;
    var todDay = selectedDays;
    todDay &= 0x7F;
    if (hour1 > hour2) {
        for (i = hour1; i <= 23; i++)
            todTime |= 1 << i;
        for (i = 0; i < hour2; i++)
            todTime |= 1 << i;
    } else {
        for (i = hour1; i < hour2; i++) {
            var shift = (i === 0) ? (1 << 0) : (1 << (i));
            todTime |= shift;
        }
    }
    return (todTime << 7) | todDay;
}
function lowestBitSet(tod, l, h) {
    tod = parseInt(tod,10);
    l = parseInt(l,10);
    h = parseInt(h,10);
    for (var i = l; i <= h; i++)
        if (tod & (1 << i))
            return i;
    return l;
}
function highestBitSet(tod, l, h) {
    for (var i = h; i >= l; i--)
        if (tod & (1 << i))
            return i;
    return h;
}

function todToTimeString(tod) {
	tod = parseInt(tod, 10);
	// check tod across 00:00
	if((tod & 0x40000000) && (tod & 0x80))
	{
		tod = ~tod;
		var h = (lowestBitSet(tod, 7, 30) - 7);
		var l = (highestBitSet(tod, 7, 30) - 7) + 1;
	}
	else
	{
		var l = (lowestBitSet(tod, 7, 30) - 7);
		var h = (highestBitSet(tod, 7, 30) - 7) + 1;
	}
    var s = l.asString(2) + ":00-" + h.asString(2) + ":00";
    if ((s == "00:00-24:00") || (s == "24:00-00:00"))
        s = "All Day";
    return s;
}
function todToDayString(tod) {
    var day = "";
    tod = parseInt(tod,10);
    if ((tod & 0x07F) === 0x07F)
        return "Every Day";
    tod = tod & 0x7F;
    for (var i = 0; i <= 6; i++)
        if (tod & (1 << i))
            day += days[i].substr(2) + ",";
    if (day.endsWith(","))
        day = day.substr(0, day.length - 1);
    return day;
}

_.filterMap = function(obj, iterator, context) {
    var results = {};
    _.each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[index] = value;
    });
    return results;
};

var g_reqParameters = {};
function setReqParameter(params){
	_.each(params, function(v,k){
		g_reqParameters[k] = v;
	});
}
function getReqParamValue(name){
	var url = location.href;
	var arr = url.split("?");
	var prefix = arr[0];
	var params = "";
	if (arr.length >1){
		params = arr[1];
	}else{
		return null;
	}
	if (params && params.length>0){
		arr = params.split("&");
		for(var i=0; i<arr.length; i++){
			var param =arr[i];
			var parr = param.split("=");
			var pkey = parr[0];
			var pvalue = null;
			if (parr.length>1) pvalue = parr[1];
			if (name == pkey){
				return decodeURIComponent(pvalue);
			}
		};
	}
	return null;
}
function genCurUrlWithReqParams(){
	var url = location.href;
	var arr = url.split("?");
	var prefix = arr[0];
	var params = "";
	if (arr.length >1){
		params = arr[1];
	}
	var l_reqParams = {};
	_.each(g_reqParameters, function(v,k){
		l_reqParams[k] = v;
	});
	if (params && params.length>0){
		arr = params.split("&");
		for(var i=0; i<arr.length; i++){
			var param =arr[i];
			var parr = param.split("=");
			var pkey = parr[0];
			l_reqParams = _.filterMap(l_reqParams, function(v, k){
				if (k == pkey){
					arr[i] = k+"="+encodeURIComponent(v);
					return false;
				}else{
					return true;
				}
			});
		};

	}else{
		arr = [];
	}

	_.each(l_reqParams, function(v, k){
		arr.push(k+"="+encodeURIComponent(v));
	});
	params = arr.join("&");

	return prefix + ((params.length>0)?"?":"") + params;
}


function refresh(page) {
    if (page) {
        page = "http://"+window.location.host+"/"+page;
    } else page = location.href;

    location.href = genCurUrlWithReqParams();

    //location.reload(true);
    //window.open(page, "_self");

}


function reboot() {
    if (isMG() || is95x())
        refresh("reboot?"+xlate("Rebooting..."));
    else arReboot.set(1,"", true);
}



function isHexString(s) {
    if (s.length === 0)
        return false;
    var pos = 0;
    if (s.charAt(pos) == '$')
        pos++;
    while (pos < s.length) {
        if ("01234567789ABCDEFabcdef ".indexOf(s.charAt(pos)) == -1)
            return false;
        else pos++;
    }
    return true;
}

function parseHexString(hs) {
    if (!isHexString(hs))
        return [ ];
    var a = [ ];
    var pos = 0;
    if (hs.charAt(pos) == '$')
        pos++;

    while (pos < hs.length) {
        if (hs.charAt(pos) == ' ') {
            pos++;
            continue;
        }
        if (hs.length < 2)
            return [ ];
        var num = parseInt(hs.charAt(pos), 16) * 16 + parseInt(hs.charAt(pos + 1), 16);
        if (isNaN(num))
            return [ ];
        pos += 2;
        a.push(num);
    }
    return a;
}
function toHexString(a) {
    var s = "$";
    _.each(a, function(d) {
        if (d < 16) s += "0";
        s += Number(d).toString(16).toUpperCase()
    });
    return s;
}

function stringToHex(s) {
    var v = "";
    for (var i = 0; i < s.length; i++)
        v += toHexDig(s.charCodeAt(i), 2);
    return v;
}
function hexToString(s) {
    return String.fromCharCode.apply(this, parseHexString(s));
}
function toHexDig(s, len) {
    s = Number(s).toString(16).toUpperCase();
    if (s.length < len)
        s = "00000000000000000000000000".substr(0, len - s.length) + s;
    return s;
}


function ipToHex(v, sep) {
    if (sep === undefined)
        sep = "";
    sep = "";
    var reg = /^[0-9]+.[0-9]+.[0-9]+.[0-9]+$/;
    if (!reg.test(v))
        return "$" + "00" + sep + "00" + sep + "00" + sep + "00";
    var a = v.split(".");
    return "$" + toHexDig(a[0], 2) + sep + toHexDig(a[1], 2) +
            sep + toHexDig(a[2], 2) + sep + toHexDig(a[3], 2);
}
function hexToIp(v) {
    if (!v)
        return "0.0.0.0";
    if (!v.startsWith("$") && v.length === 4)
        v = convertASCIIStringToHexString(v);
    var reg = /\$?([0-9A-Fa-f][0-9A-Fa-f]) ?([0-9A-Fa-f][0-9A-Fa-f]) ?([0-9A-Fa-f][0-9A-Fa-f]) ?([0-9A-Fa-f][0-9A-Fa-f]) ?/;
    if (!reg.test(v))
        return "0.0.0.0";
    var s = "";
    s += parseInt(RegExp.$1, 16) + ".";
    s += parseInt(RegExp.$2, 16) + ".";
    s += parseInt(RegExp.$3, 16) + ".";
    s += parseInt(RegExp.$4, 16);
    return s;
}

function macToHex(v) {
    v = v.toUpperCase();
    var reg = /^[0-9A-Fa-f][0-9A-Fa-f]:[0-9A-Fa-f][0-9A-Fa-f]:[0-9A-Fa-f][0-9A-Fa-f]:[0-9A-Fa-f][0-9A-Fa-f]:[0-9A-Fa-f][0-9A-Fa-f]:[0-9A-Fa-f][0-9A-Fa-f]$/;
    if (!reg.test(v))
        return "$" + "000000000000";
    //var a = v.split(":");
    return "$" + v.replace(/:/g, "");
}
function hexToMac(v) {
    if (!v)
        return "";
    if (!v.startsWith("$") && v.length === 6)
        v = convertASCIIStringToHexString(v);
    if (v.startsWith("$"))
        v = v.substr(1);

    v = v.replace(/ /g, "");
    var reg = /^[0-9A-Fa-f]{12}$/;
    if (!reg.test(v))
        return "00:00:00:00:00:00";
    var s = "";
    for (var i = 0; i < 6; i++) {
        s += v.charAt(i * 2);
        s += v.charAt(i * 2 + 1);
        if (i < 6 - 1)
            s += ":";
    }
    return s.toUpperCase();
}


function ipv4ToHex(s) {
  var reg = /^[0-9]+.[0-9]+.[0-9]+.[0-9]+$/;
  if (!reg.test(s))
      return null;
  var hex = "";
  s = s.split(".");
  for (var i=0; i<4; i++) {
      if (s[i].asInt() > 255)
          return null;
      hex += toHexDig(s[i], 2)
  }
  return hex;
}

  function hexToIpv4(v) {
  if (!v)
      return null;
  if (!v.startsWith("$") && v.length === 4)
      v = convertASCIIStringToHexString(v);
  v = v.replace("$","").replace(/ /g,"");
  if (!/^[0-9A-Fa-f]{8}$/.test(v))
      return null;
  v = v.match(/([0-9A-Fa-f]{2})/g);
  var s = "";
  for (var i=0;i<4;i++)
    s += parseInt(v[i], 16) + (i!=3 ? "." : "");
  return s;
  }


function hexToIpv6(v) {
    if (!v)
        return "::";// MOD for PROD00202100
    if (!v.startsWith("$") && v.length === 16)
        v = convertASCIIStringToHexString(v);
    v = v.replace("$","").replace(/ /g,"");
    if (!/^[0-9A-Fa-f]{32}$/.test(v))
      return "::"; // UNIAHN MOD PROD00196273
    v = v.match(/([0-9A-Fa-f]{4})/g);
    var s = "";
    for (var i=0;i<8;i++) {
        //alert(s);
       s += ""+v[i].replace(/^[0]{1,3}/,"")+":";
        //alert(s);
    }
    s = ":"+s;
    for (i=8; i>=2; i--) {
        var rg = new RegExp(":(0:){"+i+"}");
        if (rg.test(s)) {
            s = s.replace(rg,"::");
            break;
        }
    }
    s = s.substr(1,s.length-2).toUpperCase();
    if (s == "")
        return "::";
    if (s.startsWith(":"))
        return ":"+s;
    if (s.endsWith(":"))
        return s+":";
    return s;
}

function checkDomainName(str)
{
    return (/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(str) || /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])+\.(?:\.[a-zA-Z]{2,})+$/.test(str));
}


function hexToIpv6x(v) {
    if (!v)
        return null;
    if (!v.startsWith("$") && v.length === 16)
        v = convertASCIIStringToHexString(v);
    v = v.replace("$","").replace(/ /g,"");
    if (!/^[0-9A-Fa-f]{32}$/.test(v))
      return null;
    v = v.match(/([0-9A-Fa-f]{4})/g);
    var s = "";
    for (var i=0;i<8;i++)
       s += ""+v[i].replace(/^[0]{1,3}/,"")+":";
    for (i=8; i>=2; i--) {
        var rg = new RegExp("(0:){"+i+"}");
        if (rg.test(s)) {
            s = s.replace(rg,":");
            break;
        }
    }
    s = s.substr(0,s.length-1);
    if (s == "")
        return "::";
    if (s.startsWith(":"))
        return ":"+s;
    if (s.endsWith(":"))
        return s+":";
    return s;
}

function ipv6ToHex(s) {
    var v = ipv6ToHexOrNull(s);
    return v===null || v===undefined ? "$00000000000000000000000000000000": v;
}
 function ipv6ToHexOrNull(s) {
     if (s=="::")
       return "$"+"".padLeft("0",32);
     if (s.startsWith("::"))
       s = "0::"+s.substr(2);
     if (s.endsWith("::"))
       s = s.substr(0, s.length-2)+"::0";
     var foundColonColon=false;
     var hex = "";
     var fail = false;
     var parts = s.split(":");
     if (parts.length == 1 || parts.length > 8) return null;
     for (var i=0;i<parts.length;i++) {
          if (parts[i] == "") {
              if (foundColonColon)
                  return null;
              foundColonColon=true;
              hex += "X";
          } else if (i == parts.length-1 && parts[i].indexOf(".") !== -1) {
              var v4Hex = ipv4ToHex(parts[i]);
              if (v4Hex === null)
                  return null;
              hex  += v4Hex;
          } else {
                  parts[i] = parts[i].toUpperCase().padLeft("0",4);
                  if (!/^[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]$/.test(parts[i]))
                      return null;
                  hex += parts[i];
              }
          }
     hex = hex.replace(/X/,"".padLeft("0",32-hex.length+1));
     return hex.length == 32 ? "$"+hex : null;
 }


function test(v) {
    var s = "$";
    if (!v)
        v = 0;
    var pos = 0;
    for (var i = 0; i < 4; i++) {
        var bits = 0;
        if (v > pos) {
            bits = v - pos;
            if (bits > 8)
                bits = 8;
        }
        pos += 8;
        s += toHexDig((1 << bits) - 1, 2) + (i < 3 ? " " : "");
    }
    return hexToIp(s);
}



function prefix() {
    var o = formatter();
    o.load = function(v) {
        var s = "$";
        if (!v)
            v = 0;
        var pos = 0;
        for (var i = 0; i < 4; i++) {
            var bits = 0;
            if (v > pos) {
                bits = v - pos;
                if (bits > 8)
                    bits = 8;
            }
            pos += 8;
            s += toHexDig( (((1<<bits)-1)<<(8-bits)) ,2)+(i<3 ? " " : "");
        }
        return hexToIp(s);
    };
    o.store = function(v) {
        var msg = xlate("Invalid subnet mask.");
        var reg = /^[0-9]+.[0-9]+.[0-9]+.[0-9]+$/;
        if (!reg.test(v))
            return 0;
        var a = v.split("\.");
        var prefix = 0;
        var done = false;
        for (var i = 0; i < 4; i++) {
            var d = Number(a[i]);
            for (var j = 7; j >= 0; j--) {
                var on = (d & (1 << j));
                if (!done && on)
                    prefix++;
                else done = true;
                if (done && on)
                    throw msg;
            }
        }
        return prefix;
    };
    o.validate = function(v) {
        if (this.notEmpty && (""+v).length === 0)
            throw xlate("Subnet Mask Address cannot be empty");
        if (!v)
            return v;
        var reg = /^([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)$/;
        if (!reg.test(v))
            throw xlate("Invalid subnet mask: Must be 4 numbers separated by '.' e.g. 123.44.5.245");
        var allZero = true;
        _.each(v.split(/\./), function f(i) {
            if (i.asInt() > 255)
                throw xlate("'%s' is not a valid part of a Subnet Mask. Must be less than 256.",i);;
            if (allZero)
                allZero = i.asInt() === 0;
        });

        if (this.notZero && allZero)
            throw xlate("Subnet Mask cannot be all zero");
        return v;
    }
    return o;
}

function nullIp(ip) {
    return ip.length === 0 || ip == "0.0.0.0" || ip == "$00000000" || ip == "$00000000000000000000000000000000";
}

function hexIp() {
    var o = formatter();
    o.load = function(v) {
        return hexToIp(v);
    };
    o.store = function(v) {
        //alert("store "+v+" "+ipToHex(v));
        return ipToHex(v, " ");
    };
    o.validate = function(v) {
        if (this.notEmpty && (""+v).length === 0)
            throw xlate("IP Address cannot be empty");
        if (!v)
            return v;
        var reg = /^([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)$/;
        if (!reg.test(v))
            throw xlate("Invalid IP address: Must be 4 numbers separated by '.' e.g. 123.44.5.245");
        var allZero = true;
        var index = 0;
        _.each(v.split(/\./), function f(i) {
            if (i.asInt() > 255)
                throw xlate("'%s' is not a valid part of an IP Address. Must be less than 256.", i);
            if (index==0 && i.asInt() == 127)
                throw xlate("Invalid IP address");
            if (allZero)
                allZero = i.asInt() === 0;
            index++;
        });

        if (this.notZero && allZero)
            throw xlate("IP Address cannot be all zero");
        return v;
    }
    return o;
}
function hexIpNotNull() {
    var o = hexIp();
    o.notEmpty = true;
    o.notZero = true;
    return o;
}





function TypedAddr(type,addr) {
    this.type = type;
    this.addr = addr;
    this.toString = function() {
        return addr;
    }
}

function typedAddr() {
    var o = formatter();
    o.notEmpty = true;
    function hasName(v) {
        return /[a-z]/i.test(v);
    }
    o.hexIp = new hexIp();
    o.load = function(v) {
        if (v.type == "16")
            return v.addr;
        else return this.hexIp.load(v.addr);
    };
    o.store = function(v) {
        var oo = {
            type:hasName(v) ? "16" : "1", // mod for ipv6
            addr:hasName(v) ? v : o.hexIp.store(v, " ")
        };
        return oo;
    };
    o.validate = function(v) {
        if (this.notEmpty && (""+v).length === 0)
            throw xlate("IP Address cannot be empty");
        if (!v)
            return v;
        if (hasName(v))
            return v;
        return o.hexIp.validate(v);
    }
    return o;
}

// UNIHAN ADD START, PROD00198223
function checkIpV6Addr(str)
{
    return (/^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/.test(str));
}
// UNIHAN ADD END, PROD00198223


function checkIpV4Addr(str)
{

return ( /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/.test(str));
}

function hexIpV6() {
    var o = formatter();
    o.notEmpty = true;
    //o.notZero = true; leave this until heavy qa
    o.load = function(v) {
        if (!v)
            v = "::";
        else v = hexToIpv6(v) || "::";
        if (!o.notEmpty && (!v || v=="::" || /^.?null.?$/.test(v)))
            v = "";
        return v;
    }
    o.store = function(v) {
        return ipv6ToHex(v);
    }
    o.validate = function(v) {
        if (!o.notEmpty && v == "")
            return v;
        if(!o.notEmpty && /^.?null.?$/.test(v))
            return "";
        var hex = ipv6ToHexOrNull(v);

        // UNIHAN ADD START, PROD00198223
        var ipv6Str = hexToIpv6(hex);
        if ( !hex || !checkIpV6Addr(ipv6Str) ) // MOD for PROD00202094 to rectify MOD for PROD00202100 of hexToIpv6()
            throw xlate("Invalid IPv6 address");
        // UNIHAN ADD END, PROD00198223

        if (hex !== null) {
            if (o.notZero && hex == "$00000000000000000000000000000000")
             throw xlate("IP Address cannot be empty");
          return v;
        }
        // UNIAHN Add START , PROD00196273
        if ( hex == null )
        {
            v = "::";
            return v;
        }
        // UNIAHN ADD END
        throw xlate("Invalid IPv6 address");
    }
    o.normalize = function(v) {
        return o.load(o.store(v));
    }


    o.size = 40;
    return o;
}



function hexIpV6OrNull() {
    o = hexIpV6();
    o.notEmpty = false;
    o.notZero = false;
    return o;
}

function hexIpV6orFQDN() {
    var o = formatter();
    o.load = function(v) {
        if (v.startsWith("$")) {
            if (v.replace("$","").replace(/ /g,"") == "00000000000000000000000000000000")
                return "";
            return hexToIpv6(v) || "::";
        }
        else return v;
    }
    o.store = function(v) {
        return !v ? "" : (v.contains(":") ? ipv6ToHex(v) : v);
    }
    o.validate = function(v) {
        if (!v)
             return ""; //throw xlate("Must specify domain name or IP address");
         if (v.contains(":") && ipv6ToHexOrNull(v) !== null)
            return v;
        else {
            return v;
        }
        throw xlate("Invalid IPv6 address");
    }
    o.size = 40;
    return o;
}



function macAddr() {
    var o = formatter();
    o.load = function(v) {
        return hexToMac(v);
    };
    o.store = function(v) {
        //alert("store "+v+" "+ipToHex(v));
        return macToHex(v);
    };
    o.validate = function(v) {
        if (!v)
            return v;
        var reg = /^[0-9A-Fa-f][0-9A-Fa-f]:[0-9A-Fa-f][0-9A-Fa-f]:[0-9A-Fa-f][0-9A-Fa-f]:[0-9A-Fa-f][0-9A-Fa-f]:[0-9A-Fa-f][0-9A-Fa-f]:[0-9A-Fa-f][0-9A-Fa-f]$/;
        if (!reg.test(v) || v == "00:00:00:00:00:00")
            throw xlate("Invalid MAC address: Must be 6 pairs of hexadecimals separated by ':' e.g. 12:34:56:78:9A:BC");
        return v;
    };
    o.isMulticast = function(v) {
    	if (!v) return false;
    	var b2 = v.trim().charAt(1);
    	if ( b2 & 0x01){
    		return true;
    	}
    	return false;
    };
    o.validateNoneMulticast = function(v){
    	if (!this.validate(v)) return false;
    	if (this.isMulticast(v)) {
    		throw xlate("Invalid MAC address: It should not be a multicast address.");
    	}
    	return true;
    };
    return o;
}

function intField() {
    var o = formatter();
    o.validate = function(v) {
        var reg = /^[0-9]+$/;
        if (!reg.test(v))
            throw xlate("%s must be a number.",this.label);
        return v;
    }
    return o;
}

function intRangeField(lo, hi) {
    var o = formatter();
    o.validate = function(v) {
        var reg = /^[0-9]+$/;
        if (!reg.test(v))
            throw xlate("%s must be a number.",this.label);
        if (v.asInt()<lo || v.asInt()>hi)
            throw xlate("%s must be between %s and %s.",this.label,lo,hi);
        return v;
    }
    return o;
}

function intRangeFieldOrZero(lo, hi) {
    var o = formatter();
    o.validate = function(v) {
        var reg = /^[0-9]+$/;
        if (!reg.test(v))
            throw xlate("%s must be a number.",this.label);
        if (v.asInt()!==0 && (v.asInt()<lo || v.asInt()>hi))
             throw xlate("%s must be between %s and %s or 0.",this.label,lo,hi); // UNIHAN MOD, PROD00217167
        return v;
    }
    return o;
}

function rangeCheck (msg, v, lo, hi) {
    if (v > hi || v <lo)
        throw xlate("%s must be between %s and %s.",v,lo,hi);
}


function nullBugHack() {
    var o = formatter();
    o.load = function(v) {
        if (v == "%20")
            return "";
        return v;
    };
    o.store = function(v) {
        if (v.length === 0)
            return " ";
        return v;
    };
    return o;
}
function ssid() {
    var o = formatter();
    o.validate = function(s) {
        if (s.length < 1 || s.length > 32)
            throw xlate("Invalid SSID: Must be between 1 and 32 characters.");
        // UNIHAN DEL START, PROD00198899
        //_.each(s.split(""), function(c, i) {
           // if (i === 0 && "!#;".indexOf(c) != -1)
               // throw xlate("Invalid SSID: Cannot start with !, # or ;");
            //if ("\"$[]".indexOf(c) != -1)
               // throw xlate("Invalid SSID: Cannot contain  \", $, [, or ]");
        //});
        // UNIHAN DEL END
        return s;
    }
    return o;
}

function canConvertToASCII(s) {
    return _.all(parseHexString(s), function(d) {
        return d >= 32 && d <= 126
    });
}
function convertHexStringToASCIIString(hexString) {
    return String.fromCharCode.apply(this, parseHexString(hexString));
}
function convertASCIIStringToHexString(asciiString) {
    var s="$";
    for (var i=0; i<asciiString.length; i++) {
        s += asciiString.charCodeAt(i).asHexString(2);
    }
    return s;
}
// stringToHex -- sdsd
// hexToASCII

var wepHelper;
function wepPassword() {
    var o = formatter();
    wepHelper = o;
    o.size = 26;
    o.load = function(v) {
        if (!v)
            v = "";

        if (v.startsWith("$"))
            return v.substr(1).replace(/ /g, "");
        else if (v.startsWith("0x"))
            return v.substr(2).replace(/ /g, "");
        else return v;
//        if (v.startsWith("$")) {
//            v = v.substr(1).replace(/ /g, "");
//            if (canConvertToASCII(v))
//                v = convertHexStringToASCIIString(v);
//        }
//        return v;
    };
    o.store = function(v) {
        if (!$("#SimpleKeyWEP").is(":visible")) // only check in wep mode
            return v;

        var keyLength = $("#KeyLength").valOrChecked();
        var isHex = isHexString(v) && !v.contains(" ");
        if (v.startsWith("$"))
            v = v.substr(1);

        if (ag.WEPKeyType == 1 || ag.WEPKeyType == 2)
        {
            if (v.length === 5 || v.length === 13 )
               return v;
            if ( ( v.length === 10 && isHex ) || ( ( v.length === 26 && isHex ) ) ) {
                return "0x" + v;
            }
            throw xlate("WEP 64-bit passwords must be 5 ASCII or 10 hexadecimal digits. WEP 128-bit passwords must be 13 ASCII or 26 hexadecimal digits.");
            //throw xlate("WEP 64-bit/128-bit Passwords must be 5/13 ASCII or 10/26 hexadecimal digits.");
        }

        /*
        if (ag.WEPKeyType == 2) {
            if (v.length === 13)
                return v;
            if (v.length === 26 && isHex) {
                return "0x" + v;
            }
            throw xlate("WEP 128-bit Passwords must be 13 ASCII or 26 hexadecimal digits.");
        }
        */
        return "";
    };
    return o;
}

// UNIHAN ADD START , PROD00196875
function wpaSimpleKeyFmt()
{
    var o = formatter();
    o.validate = function(v)
    {
        if ((""+v).length == 0)
            throw xlate("WPA Pre-Shared Key must have a value.");
        // check length, allow any custom binary value
        var k = v;
        if (( k.length< 8 || k.length > 64 ))
            throw xlate("Shared Key must be between 8 and 64 characters.");

        if( k.length == 64 && !isHexString(k) )
        {
            throw xlate("Shared Key 64 length should be hex digit string.");
        }
        return v;
    };
    return o;
}
// UNIHAN ADD END

function stringToSnmpDate(v) {
    if (!/[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:[0-9][0-9]:[0-9][0-9].[0-9][0-9]$/.test(v)) {
        throw xlate("date/time must be of the form yyyy-MM-dd HH:mm:ss.ff");
    }
    var y = v.substr(0,4).asInt();
    var m = v.substr(5,2).asInt();
    var d = v.substr(8,2).asInt();
    var h = v.substr(11,2).asInt();
    var mi = v.substr(14,2).asInt();
    var s = v.substr(17,2).asInt();
    var ms = v.substr(20,2).asInt();

    return toHexString([
            (y/256).asInt(),(y%256).asInt(),m,d,h,mi,s,ms
            ]);
}
function snmpDateToString(v) {
    var ha = parseHexString(v);
    if (ha.length != 8)
        return "????-??-?? ??:??:??.??";
    function get1(index) {
        var v = ha[index];
        if (v < 10)
            return "0" + v;
        return "" + v;
    }

    var s = "" + (ha[0] * 256 + ha[1]) + "-" + get1(2) + "-" + get1(3) + " " + get1(4) + ":" + get1(5) + ":" + get1(6) + "." + get1(7);
    return s;
}

function tunnelOid(k) {
  var s =  "1.3.6.1.4.1.4115.1.3.4.1.1.7.0";
 return s + "." +
         _.map(k.split(""),function f(c) { return c.charCodeAt(0); }).
                 join(".");
}

//  var v = snmpGet1("1.3.6.1.4.1.4115.1.3.4.1.1.7.0");
function getFromTunnel(name) {
  function getWhenReady(oid) {
        for (;;) {
          var v = snmpGet1(oid);
          if (v !== "BUSY")
            return v;
          $.log("BUSY: "+oid);
          var start = new Date().getTime();
          while (new Date().getTime() - start < 100)
               ;// crude timer hack to give snmp time to settle down
        }
  }
  // prime
  $.log("getFromTunnel "+name);
  getWhenReady(tunnelOid(name)+".0");
  var index = 1;
  var rv = "";
  for (;;) {
      var v = getWhenReady(tunnelOid(name)+"."+index);
      if (v === "")
        break;
      rv += v;
      index++;
  }
    return rv;
}

function tunnelTest() {
    //parseTunnelData(getFromTunnel("AdvConfig"));
    //parseTunnelData(getFromTunnel("AdvProduct"));
    //parseTunnelData(getFromTunnel("CMState"));
    //parseTunnelData(getFromTunnel("EventLog"));
    //parseTunnelData(getFromTunnel("TouchstoneStatus"));
    parseTunnelData(getFromTunnel("HWFWVersions"));
}

function parseTunnelData(d) {
    $.log("parseTunnelData "+d);
    var o = {};
    if (d) {
        _.each(d.split("^"), function(l) {
            if (l) {
                l = l.split("|");
                $.log("->" + JSON.stringify(l));
                if (l.length) {
                    var tag = l[0];
                    var value = l.length > 1 ? l.splice(1, l.length-1) : "";
                    if (value) {
                        if (o[tag]) {
                            o[tag].push(value)
                        } else {
                            o[tag] = [value];
                        }
                    }
                }
            }
        });
    }
    $.log(JSON.stringify(o));
    o.get = function(s) {
        try {
            if (this[s])
                return this[s][0];
        } catch(e) {
            return "";
        }
    }
    o.getTable = function(s) {
        try {
            if (this[s])
                return this[s];
            else return [];
        } catch(e) {
            return [];
        }
    }
    o.eachRow = function(s, f) {
        try {
            if (this[s])
                _.each(this[s],f);
        } catch(e) {
            return "";
        }
    }
    return o;
}

// UNIHAN ADD START
function validateIpOnSubnetBySelectBss(ip) {
    var bssNo = parseInt(getSelectedBss());
    bssNo = bssNo >= 9 ? bssNo -= 9 : bssNo -= 1;

    var IPAddress = arLanGatewayIp.get(getLan()[bssNo]).replace(/[$ ]/g,"");
    var SubnetMask = arLanSubnetMask.get(getLan()[bssNo]).replace(/[$ ]/g,"");

    var f = hexIp();
    if (ip.contains(".")) {
        f.validate(ip);
        ip = f.store(ip).replace(/[$ ]/g,"");
    } else {
        ip = ip.replace(/[$ ]/g,"");
    }
    if ((parseInt(ip, 16) & parseInt(SubnetMask,16)) != (parseInt(IPAddress, 16) & parseInt(SubnetMask,16))) {
        throw xlate("Invalid IP address. Invalid network address.");
    }
}
// UNIHAN ADD END

function validateIpOnSubnet(ip) {
    var IPAddress = arLanGatewayIp.get(getLan()[0]).replace(/[$ ]/g,"");
    var SubnetMask = arLanSubnetMask.get(getLan()[0]).replace(/[$ ]/g,"");

    var f = hexIp();
    if (ip.contains(".")) {
        f.validate(ip);
        ip = f.store(ip).replace(/[$ ]/g,"");
    } else {
        ip = ip.replace(/[$ ]/g,"");
    }
    if ((parseInt(ip, 16) & parseInt(SubnetMask,16)) != (parseInt(IPAddress, 16) & parseInt(SubnetMask,16))) {
        throw xlate("Invalid IP address. Invalid network address.");
    }
}

function hex2bin_Ex(hex) {
    var str = "";
    var result = "";

    for (i=0; i<hex.length; i++)
    {
        var padstr = "0000";
        str = parseInt(hex.charAt(i), 16).toString(2);
        padstr = padstr.substring(0, padstr.length - str.length) + str;
        result += padstr;
    }

    return result;
}

function validateIpOnSubnetV6(ipv6) {
    var gwIpv6 = arLanGatewayIp2.get(getLan()[0]).replace(/[$ ]/g,"");
    var prefix = arLanPrefixLengthV6.get(getLan()[0]);

    ipv6 = ipv6ToHex(ipv6).replace(/[$ ]/g,"");
    ipv6 = hex2bin_Ex(ipv6);
    gwIpv6 = hex2bin_Ex(gwIpv6);

    if(null == ipv6.substring(0, prefix).match(gwIpv6.substring(0, prefix)))
    {
        throw xlate("Invalid IP address. Invalid network address.");
    }
}

function convertToSnmpHex(s) {
    var t = s;
    if (!t.endsWith(" "))
        t += " ";
    var reg = /^([0-9A-Fa-f][0-9A-Fa-f] )+$/;
    if (reg.test(t)) {
        return "$"+t.replace(/ /g,"");
    }
    return s;
}


function IPV6ToOid(v6) {
    hexIpV6().validate(v6);
    var hd = hexIpV6().store(v6);
    if (!hd)
        throw xlate("Invalid IPv6 address");
    hd = hd.replace("$", '');
    var s = "";
    while (hd.length >= 4) {
        s = s + parseInt(hd.substr(0, 4),16)+".";
        hd = hd.substr(4);
    }
    s = s.substr(0, s.length-1);
    return s;
}

function oidToIPV6(oid) {
    var v6 = "";
    // UNIHAN MOD START , PROD00195840
    var grouphasValue = false;

    if (is852()) {
        var flag = 0;
       _.each(oid.split("."), function(s) {
    	if (flag == 1) {
    		var tmp = parseInt(s).toString(16);
    		if(tmp.length==1 && parseInt(tmp)!=0){
    			tmp="0"+tmp;
    		}

// UNIHAN MOD START for fix the bug about conversion 0a of .0d0a. count as '0' not '10'
            if( grouphasValue == true && parseInt( tmp, 16 ) == 0 )
// UNIHAN MOD END
            {
                tmp += "0";
                grouphasValue = false;
            }

    		v6 += tmp +":";
    		flag = 0;
    	} else {
    		var tmp = parseInt(s).toString(16);
    		if(tmp.length==1 && parseInt(tmp)!=0){
    			tmp="0"+tmp;
    		}

// UNIHAN MOD START for fix the bug about conversion 0d of .0d0a. count as '0' not '13'.
            if( parseInt( tmp, 16 ) != 0 )
// UNIHAN MOD END
            {
                grouphasValue = true;
            }
    // UNIHAN MOD END

    		v6 += tmp;
    		flag+=1;
    	}
       });
    } else {
       _.each(oid.split("."), function(s) { v6 += parseInt(s).toString(16)+":"; });
    }
    var v = v6.substr(0, v6.length-1).toUpperCase();
    return hexIpV6().normalize(v);
}

// 0=>2.4 and 5 GHz (only default),"1=>2.4 GHz,2=>5 GHz, undefined=>1
function getChannels(band){
    if (band==1) {
        var getData = {"country24g": ""};
        data = getUserData(getData);
        var country = (data["country24g"] || "").toLowerCase();
    } else if (band==2) {
        var getData = {"country5g": ""};
        data = getUserData(getData);
        var country = (data["country5g"] || "").toLowerCase();
    }
    //var country = (arWiFiCountry.get() || "").toLowerCase();
    var isEurope =  country ? "eu,at,be,ch,cz,de,dk,ee,ie,el,fr,es,it,cy,lv,lt,lu,hu,mt,nl,pl,pt,ro,gb,gr,hu,ie,si,sk,fi,se,uk".contains(country) : false;
    var ch;
    if (band==2) {
		if (country == "jp")
		{
			ch = [36,40,44,48,184,188,192,196];
		}
		else if (country == "cn" || country == "jm")  //China and Jamaica // Added Jamaica - Currently Jamaica supports 20Mhz channels
		{
				ch = [149,153,157,161,165];
		}
		else if (country == "il")//Israel
		{
			ch = [36,40,44,48,52,56,60,64];
		}
		else if (country == "za")//South Africa
		{
			ch = [36,40,44,48,52,56,60,64,100,104,108,112,116,132,136,140];
		}
		else if (isEurope)
		{
			ch = [36,40,44,48,52,56,60,64,100,104,108,112,116,120,124,128,132,136,140];//Adding new set of channels for LGI
		}
		else
		{
			ch = [36,40,44,48,149,153,157,161,165];
		}
    } else {
        ch = [1,2,3,4,5,6,7,8,9,10,11];
        var isMax11Country = country ? "pr,tw,us,ca,df,mx,cl,jm,pa,gd,lc,vc".contains(country) : false; // Adding Jamaica, Panama 1-11
        if( isLGI() && (isVM() || isZiggo()))
        {
            isMax11Country = false;
        }
	    if (country == "jp")
	    {
			ch = ch.concat([12,13,14]);
	    }
		else if (isMax11Country == false)
		{
			ch = ch.concat([12,13]);
		}
    }
    return ch;
}
function getChannelList(band) {
    if (band === 0 || band === "0")
        return ["0:Auto"];
    var ch = getChannels(band);

    return ["0:Auto"].concat(_.map(ch, function(ch) { return ""+ch+":"+ch;}));
}

// UNIHAN ADD START
function get5GChannelList() {
    return  ["0:Auto", "1:36", "2:40", "3:44", "4:48", "5:149", "6:153", "7:157", "8:161", "9:165"];
}
function getWirelessMode() {
    return  ["0:B/G mixed","1:B only","4:G only","6:N only","7:G/N mixed", "9:B/G/N mixed" ];
}
function get5GWirelessMode() {
    return  ["0:A/N mixed","1:A only","4:N only" ]
}
// UNIHAN ADD END
function link(label1, href, text) {
    if (technicianOnly(label1) && !isTechnician())
        return null;
    var l = canXlate(label1) ? xlate(label1) : text;
    return _tr(_td("width:35%", _a("href:"+href,"text:"+l)), _td());
}

function inlineapply(label1) {
    return _tr(_td("width:35%", "align:right", _input("type:button", "id:" +label1, "value:{{Apply}}", onclick)), _td());
}

function ApplyButton() {
    return buttons("{{Apply}}", function onclick(event) {
        Apply();
    });
}

// UNIHAN ADD START
function ApplyWifiButton() {
    return buttons("{{Apply}}", function onclick(event) {
        // UNIAHN MOD START ,PROD00194460
        // ARRIS Added handleError routine.
        try{
	        if( validateUserRadioControl() == false )
	        {
	            alert("User Control Mode has been changed, reload page!" );
	            resetUserRadioControl();
	            refresh();
	            return;
	        }
	        else
	        {
	            Apply();
	        }
	        // UNIAHN MOD END
      }catch(e){
        handleError(e);
      }
    });
}
// UNIHAN ADD END
// todo: add change password for suddenlink
// todo: make sure tabs from mg gets moved over?

// Added in merge from MAIN on 06192013 however causes issues with snmpGet.
// Changes arr probably required on server side. Leaving in but commented out for now.
  $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
      //var startChar = options.url.indexOf('?') === -1 ? '?' : '&';
      //options.url += startChar + getNonce();
  });

/**
 * Added 20130719
 * Check whether contain the dirty datas.
 * args: if empty, will check all "ag" args, otherwise, just for args checking.
 * Notice that this function must be called in "afterApply",
 */
function isContainDirty(args){
	var isDirtyFound = false;
	if (! args){
		if (ag != undefined){
			_.map(ag, function(v, k){
				$.log("isContainDirty:"+k+"==>"+v);
				if (ag.dirty[k] != undefined && ag.dirty[k]){
					$.log("Found dirty:"+k+"==>"+v);
					isDirtyFound = true;
					return;
				}
			});
		}
	}else{
		_.each(args, function(v){
			if (ag.dirty[v] != undefined && ag.dirty[v]){
				isDirtyFound = true;
				return;
			}
		});
	}

	return isDirtyFound;
}

function checkRedirect()
{
    var hostname = window.location.hostname;
    if( (hostname.contains("[")) ||
        (first_install_status() == 1) ||
        ((customerId() != 7) && (customerId() != 20)) )
    {
        return;
    }

    if (attrs["conType"] && attrs["conType"].contains("LAN") && attrs["gwWan"] && attrs["gwWan"] == "f" )
    {
        if (parseInt(eRouterInitMode.get()) == 1)
        {
            return;
        }

        var lanGwIP = hexToIpv4(arLanGatewayIp.get(getPrimaryLAN()));
        if(!( hostname.contains("localhost") ||
              hostname.contains(lanGwIP) ) )
        {
            window.location.host = lanGwIP;
        }
    }
}

function setEditDeletePortTriggeringData(PortTriggeringData) {
    var PortTriggeringData_json = JSON.stringify(PortTriggeringData);
    $.ajax({
    type: "POST",
    url: "php/ajaxEditDel_porttriggering_data.php",
    data: { PortTriggeringData: PortTriggeringData_json },
    dataType: "text",
    success: function(msg) {
        //refresh();
        //console.log("success to set port triggering data: "/*+JSON.stringify(msg)*/);
    },
    async:false,
    cache:false,
    error: function(){
        //console.log("Failed to set port triggering data");
    }
    });
    return;
}

function setPortTriggeringData(PortTriggeringData) {
    var PortTriggeringData_json = JSON.stringify(PortTriggeringData);
    $.ajax({
    type: "POST",
    url: "php/ajaxSet_porttriggering_data.php",
    data: { PortTriggeringData: PortTriggeringData_json },
    dataType: "text",
    success: function(msg) {
        //refresh();
        //console.log("success to set port forwarding data: ");
    },
    async:false,
    cache:false,
    error: function(){
        //console.log("Failed to set port forwarding data");
    }
    });
    return;
}

function getPortTriggeringData(PortTriggeringData, callback) {
    var PortTriggeringData_json = JSON.stringify(PortTriggeringData);
    $.ajax({
    type: "POST",
    url: "php/ajaxGet_porttriggering_data.php",
    data: { PortTriggeringData: PortTriggeringData_json },
    dataType: "json",
    success: function(returnData) {
        if(returnData == 0)
        {
            logoutAndReload();
        }
        callback(returnData);
    },
        async:true,
    cache:false,
    error: function(){
    }
    });
    return;
}

function setPortMappingData(PortMappingData) {
    var PortMappingData_json = JSON.stringify(PortMappingData);
    $.ajax({
    type: "POST",
    url: "php/ajaxSet_portforwarding_data.php",
    data: { PortMappingData: PortMappingData_json },
    dataType: "text",
    success: function(msg) {
        //refresh();
    	console.log("success to set port forwarding data: "/*+JSON.stringify(msg)*/);
    },
    async:false,
    cache:false,
    error: function(){
    	console.log("Failed to set port forwarding data");
    }
    });
    return;
}

function getPortMappingData(PortMappingData, callback) {
    var PortMappingData_json = JSON.stringify(PortMappingData);
    $.ajax({
    type: "POST",
    url: "php/ajaxGet_portforwarding_data.php",
    data: { PortMappingData: PortMappingData_json },
    dataType: "json",
    success: function(returnData) {
        if(returnData == 0)
        {
            logoutAndReload();
        }
        callback(returnData);
    },
        async:true,
    cache:false,
    error: function(){
    	/*console.log("Failed to get pfwd devices data");*/
    }
    });
    return;
}

function setIpFilterData(key, bEnable, bDelete, bIpV6) {
    var ipFilterDelOrEnable = {"Key": "", "Enable": "", "Delete": "", "IPV6": ""};
    ipFilterDelOrEnable['Key'] = key;
    ipFilterDelOrEnable['Enable'] = (bEnable==1) ? "true" : "false";
    ipFilterDelOrEnable['Delete'] = (bDelete==1) ? "true" : "false";
    ipFilterDelOrEnable['IPV6'] = (bIpV6==1) ? "true" : "false";
    var ipFilterDelOrEnable_json = JSON.stringify(ipFilterDelOrEnable);
    $.ajax({
        type: "POST",
        url: "php/ajaxSet_ipfilter_data.php",
        data: { ipFilterDelOrEnable: ipFilterDelOrEnable_json },
        dataType: "text",
        success: function(msg) {
            //refresh();
        //console.log("success setting ip filter data: ");
    },
    async:false,
    cache:false,
    error: function(){
        //console.log("Failed setting ip filter data");
    }
    });
    return;
}

function setEditDeletePortMappingData(PortMappingData) {
    var PortMappingData_json = JSON.stringify(PortMappingData);
    $.ajax({
    type: "POST",
    url: "php/ajaxEditDel_portforwarding_data.php",
    data: { PortMappingData: PortMappingData_json },
    dataType: "text",
    success: function(msg) {
        //refresh();
    	console.log("success to set port forwarding data: "/*+JSON.stringify(msg)*/);
    },
    async:false,
    cache:false,
    error: function(){
    	console.log("Failed to set port forwarding data");
    }
    });
    return;
}

function setIPFilterV4Data(IPFilter_V4_Data) {
    var IPFilter_V4_Data_json = JSON.stringify(IPFilter_V4_Data);
    $.ajax({
        type: "POST",
        url: "php/ajaxSet_ipv4_filter_data.php",
        data: { IPFilter_V4_Data: IPFilter_V4_Data_json },
        dataType: "text",
        success: function(msg) {
          //  refresh();
        //console.log("success to set IPFilter_V4_Data data: "/*+JSON.stringify(msg)*/);
    },
    async:false,
    cache:false,
    error: function(){
        //console.log("Failed to set port IPFilter_V4_Data");
    }
    });
    return;
}

function getIPFilterV4Data(IPFilter_V4_Data, callback) {
    var IPFilter_V4_Data_json = JSON.stringify(IPFilter_V4_Data);
    $.ajax({
        type: "POST",
        url: "php/ajaxGet_ipv4_filter_data.php",
        data: { IPFilter_V4_Data: IPFilter_V4_Data_json },
        dataType: "json",
        success: function(returnData) {
            if(returnData == 0) {
                logoutAndReload();
            }
            callback(returnData);
    },
    async:true,
    cache:false,
    error: function(){
        //console.log("Failed to get IPFilter_V4_Data");
    }
    });
    return;
}

function setIPFilterV6Data(IPFilter_V6_Data) {
    var IPFilter_V6_Data_json = JSON.stringify(IPFilter_V6_Data);
    $.ajax({
        type: "POST",
        url: "php/ajaxSet_ipv6_filter_data.php",
        data: { IPFilter_V6_Data: IPFilter_V6_Data_json },
        dataType: "text",
        success: function(msg) {
         //   refresh();
        //console.log("success to set IPFilter_V6_Data data: "/*+JSON.stringify(msg)*/);
    },
    async:false,
    cache:false,
    error: function(){
        //console.log("Failed to set port IPFilter_V6_Data");
    }
    });
    return;
}

function getIPFilterV6Data(IPFilter_V6_Data, callback) {
    var IPFilter_V6_Data_json = JSON.stringify(IPFilter_V6_Data);
    $.ajax({
        type: "POST",
        url: "php/ajaxGet_ipv6_filter_data.php",
        data: { IPFilter_V6_Data: IPFilter_V6_Data_json },
        dataType: "json",
        success: function(returnData) {
        if(returnData == 0) {
            logoutAndReload();
        }
        callback(returnData);
    },
    async:true,
    cache:false,
    error: function(){
        //console.log("Failed to get IPFilter_V6_Data");
    }
    });
    return;
}

function setBlockTimeData(blockTimeData) {
    var blockTimeData_json = JSON.stringify(blockTimeData);
    $.ajax({
            type: "POST",
            url: "php/ip_blocktime.php",
            data: { blockTimeData: blockTimeData_json,
                    opType: "WRITE" },
            dataType: "json",
            success: function(msg) {
                if(msg == 0)
                {
                    logoutAndReload();
                }
            },
            async:true,
            cache:false,
            error: function(){
                console.log("Failed to set block time data");
            }
    });
    return;
}

function setMacBlockTimeData(blockTimeData) {
    var blockTimeData_json = JSON.stringify(blockTimeData);
    $.ajax({
            type: "POST",
            url: "php/mac_blocktime.php",
            data: { blockTimeData: blockTimeData_json,
                    opType: "WRITE" },
            dataType: "json",
            success: function(msg) {
                if(msg == 0)
                {
                    logoutAndReload();
                }
            },
            async:true,
            cache:false,
            error: function(){
                console.log("Failed to set block time data");
            }
    });
    return;
}

function getBlockTimeData(blockTimeData) {
    var data;

    $.ajax({
        type: "POST",
        url: "php/ip_blocktime.php",
        data: { blockTimeData: blockTimeData,
                        opType: "READ" },
        dataType: "json",
        success: function(msg) {
            if(msg == 0)
            {
                logoutAndReload();
            }
            data = msg;
        },
        async:false,
        cache:false,
        error: function(){
                    console.log("Failed to get block time data");
        }
    });
    return data;
}

function getMacBlockTimeData(blockTimeData) {
    var data;

    $.ajax({
        type: "POST",
        url: "php/mac_blocktime.php",
        data: { blockTimeData: blockTimeData,
                opType: "READ" },
        dataType: "json",
        success: function(msg) {
            if(msg == 0)
            {
                logoutAndReload();
            }
            data = msg;
        },
        async:false,
        cache:false,
        error: function(){
                    console.log("Failed to get mac filtering block time data");
        }
    });
    return data;
}

function setLightRingData(lightRing) {
    var lightRing_json = JSON.stringify(lightRing);
    $.ajax({
            type: "POST",
            url: "php/ajaxSet_lightring_data.php",
            data: { lightRing: lightRing_json,
                    opType: "WRITE" },
            dataType: "json",
            success: function(msg) {
                if(msg == 0)
                {
                    logoutAndReload();
                }
            },
            async:true,
            cache:false,
            error: function(){
                console.log("Failed to set light ring brightness");
            }
    });
    return;
}

function redirectBlank()
{
        clearLoginCredential();
        clearSessionStorage();
        window.open('about:blank','_parent','');
        window.close();
}

function spinnerSuccess()
{
        $('#mainpage').children().children().not(':first-child').show();
        var confirmWizard = _div("class:settings-updates-success",
                                _div("id:confirm-wizard", "align:center",

                                    _div("class:confirm-wizard-text", "text:{{SpinnerSuccess}}")
                            ));
        $(confirmWizard.toHTML()).insertAfter($("#mainpage .form_header"));
}

function setDDNSdata(DDNSdata) {
    DDNSdata = encryptData(DDNSdata);
    var DDNSdata_json = JSON.stringify(DDNSdata);
    $.ajax({
        type: "POST",
        url: "php/ajaxSet_ddns.php",
        data: { DDNSdata: DDNSdata_json,
                        opType: "WRITE" },
        dataType: "json",
        success: function(msg) {
            //successfully set the DDNS data
            if(msg == 0)
            {
                logoutAndReload();
            }
        },
        async:true,
        cache:false,
        error: function(){
            // failed
            console.log("Failed to set DDNS data");
        }
    });
    return;
}

// LGI ADD START
function loadConnectionScreen(status)
{
    if(status.IntstatusToShown == "NoRFSignalDetected")
    {
        $("#noRF").show();
        $("#noInternet").hide();
        $("#noIntPersist").hide();
    }
    else if (status.IntstatusToShown != "Online")
    {
        if($("#noInternet").is(":visible")){
            $("#noRF").hide();
            $("#noInternet").hide();
            $("#noIntPersist").show();
        }
        else if($("#noIntPersist").is(":visible") || $("#noRF").is(":visible")){
            $("#noRF").hide();
            $("#noInternet").show();
            $("#noIntPersist").hide();
        }
    }
    else
    {
        window.location.href = '/?home&mid=Home';
    }
}

function connectionStatus(data)
{
    var regValue = data.js_cm_reg_value;//ag.setValue("regValue" ,  arCmDoc30SwRegistrationState.get());
    var operationalVal = data.js_cm_oper_value;//ag.setValue("operationalVal" ,  arCmDoc30SwOperStatus.get());
    var timeOfDayStatus =0;//ag.setValue("timeOfDayStatus", arCmDoc30BaseTodStatus.get());
    var esafeRouterMode = 4;//eRouterInitMode.get());
    var WANIPProvMode = data.js_wan_ip_prov_mode;//arWanIPProvMode.get());
    var PartialServiceDSVal = 0;//ag.setValue("PartialServiceDSVal" ,  arCmDoc30SetupSecDsLossReinitEnable.get());
    var PartialServiceUSVal = 0;//ag.setValue("PartialServiceUSVal" ,  arCmDoc30SetupPartServiceFallback20.get());
    var networkStandbyMode = false;//ardocsIf3CmStatusEnergyMgt1x1OperStatus.get());
    var failSafeMode = data.js_fail_safe_mode;//arHorizOvertempProtModeState.get());
    var NoRFSignalDetected = data.js_NoRF_Detected;//arIfOperStatus.get(3));
    var IntstatusToShown = "";
    var internetStatus = false;

    if( regValue == 1 )
    {
        IntstatusToShown = "DSScanning";
        internetStatus = true;
    }
    else if( regValue == 3 )
    {
        IntstatusToShown = "USRanging";
        internetStatus = true;
    }
    else if( regValue == 4 )
    {
        IntstatusToShown = "RequestingCMIPAddress";
        internetStatus = true;
    }
    else if( timeOfDayStatus == 4 )
    {
        IntstatusToShown = "ObtainingTOD";
        internetStatus = true;
    }
    else if( regValue == 5 )
    {
        IntstatusToShown = "ObtainingConfigurationFile";
        internetStatus = true;
    }
    else if( operationalVal == 1 )
    {
        IntstatusToShown = "SoftwareDownloadActive";
        internetStatus = true;
    }
        else if( WANIPProvMode == 0 /*esafeRouterMode == 1 || (isZiggo() && WANIPProvMode  == 0)*/ )
        {
        IntstatusToShown = "ModemMode";
        internetStatus = true;
    }
    else if( ( PartialServiceDSVal == 1 ) && ( PartialServiceUSVal == 1 )  )
    {
        IntstatusToShown = "PartialServiceUSDS";
        internetStatus = true;
    }
    else if( PartialServiceDSVal == 1 )
    {
        IntstatusToShown = "PartialServiceDSOnly";
        internetStatus = true;
    }
    else if( PartialServiceUSVal == 1 )
    {
        IntstatusToShown = "PartialServiceUSonly";
        internetStatus = true;
    }
    else if( regValue < 2 )
    {
        IntstatusToShown = "NoDSDetected";
        internetStatus = false;
    }
    else if( regValue < 6 )
    {
        IntstatusToShown = "RegistrationFailure";
        internetStatus = false;
    }
    // make fail-safe (heating case) as higher priority than standby or normal operation
    else if( failSafeMode > 1 )
    {
        IntstatusToShown = "FailSafeMode";
        internetStatus = false;
    }
    // make standby as higher priority than normal operation
    else if( networkStandbyMode == 1 )
    {
        IntstatusToShown = "NetworkStandbyMode";
        internetStatus = true;
    }
    else if( regValue >= 6 )
    {
        IntstatusToShown = "Online";
        internetStatus = true;
    }

    // "No RF signal detected" is assumed to be of highest priority and last state checked
    if( NoRFSignalDetected == 2 )
    {
        IntstatusToShown = "NoRFSignalDetected";
        internetStatus = false;
    }
    var status = {'IntstatusToShown': IntstatusToShown, 'internetStatus': internetStatus};
    var connectionState = !((IntstatusToShown == "NoRFSignalDetected") || (IntstatusToShown != "Online"));

    var getData = {"cloud_ui_mode": "", "troubleshootWizardEnable":""};
    var data = getUserData(getData);
    var cloud_ui_mode = data['cloud_ui_mode'];
    var cloud_ui_url = data['cloud_ui_url'];
    var troubleshootWizardEnable = data['troubleshootWizardEnable'];
    cloud_ui_url = cloud_ui_url.replace(/&#039;/g, "'");
    cloud_ui_url = cloud_ui_url.replace(/'/g,'');

    var curMenuId = getCurMenuId();

    if(curMenuId == 'ConnectionStatus')
        loadConnectionScreen(status);
    else if(curMenuId != 'Troubleshoot')
    {
        if(cloud_ui_mode == 'true')
        {
            if((troubleshootWizardEnable != 1) && (!connectionState))
            {
                window.location.href = '/?connection_troubleshoot&mid=ConnectionStatus';
            }
            else
            {
                if(cloud_ui_url == '')
                    window.location.href="about:blank";
                if(cloud_ui_url != "http://127.0.0.1/")
                {
                   if (cloud_ui_url.indexOf('http://') && cloud_ui_url.indexOf('https://'))
                   {
                        cloud_ui_url = "http://" + cloud_ui_url;
                   }
                   window.location.href = cloud_ui_url;
                }
            }
        }
        else
        {
            if((troubleshootWizardEnable != 1) && (!connectionState))
            {
                window.location.href = '/?tool_troubleshoot&mid=Troubleshoot';
            }
        }
    }
}

function checkConnection() {
    var connectionData = JSON.stringify({connectionData:''});
    $.ajax({
        type: "POST",
        url: "php/connection_troubleshoot_data.php",
        dataType: "json",
        data: { userData: connectionData },
        success: function(msg) {
            connectionStatus(msg);
        },
        async:false,
        cache:false,
        error: function(e){
            console.log(e);
        }
    });
}
// LGI ADD END
