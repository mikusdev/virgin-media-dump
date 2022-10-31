/* JS Entry of Skin */

jQuery.logLGI = function(msg){
	$.log("[LGI] " + msg);
};


(function(){
    try {
        if (doReload == undefined || doReload != "cacheVersion1") {
            location.reload(true);
        }
    } catch(e) {
        location.reload(true);
    }
})();

function handleDiagClose(){
    setDiagCloseRequest();
    $(".ui-dialog-titlebar").css("visibility","hidden");
}

/**
 * Overwrite jQuery.fn.hide/show, it will extend to set the ag.ctrl.hidden attribute.
 */

var LGICodeLangSet = {en: "English", tk: "Turkish", fr: "French", de: "German", ru: "Russian", nl: "Dutch", ro: "Romanian", it: "Italian", pl: "Polish", hu: "Hungarian", cz: "Czech", es: "Spanish", sk: "Slovakian"};
var LGISkinSet = {6: "vtr", 7: "lgi", 8: "vm", 20: "ziggo", 23: "lipr", 26: "flow", 27: "master"};
/*
  Password and Confirm Password validation flags to validate the password fields entered.
*/
var passwordValidate = 0;
var confirmPasswordValidate = 0;
var validFields = {};
var UserName = {};
function getIPModeDDNSStatus(){
    var getData = {"deviceMode": "", "ddnsEnable": ""};
    data = getUserData(getData);
    var IPMode = parseInt(data['deviceMode']);
    var DDNSEnable = data['ddnsEnable'];
    var DDNSHide = ((IPMode == 2) || (DDNSEnable == false)) ? true : false;
    return DDNSHide;
}
function getCSRLoginMode(){
    var getData = {"loginCSRMode": "","UserName": ""};
    var data = getUserData(getData);
    var loginCSRMode = parseInt(data['loginCSRMode']);
    UserName = data['UserName'];
    return loginCSRMode;
}
function getDNSEnabled(){
    var getData = {"DNSEnable": ""};
    var data = getUserData(getData);
    var DNSEnable = parseInt(data['DNSEnable']);
    return DNSEnable;
}
function getCmOperationState(){
    var getData = {"cmOperationState": ""};
    var data = getUserData(getData);
    var cmOperationState = parseInt(data['cmOperationState']);
    return cmOperationState;
}

function getModemMode(){
    var getData = {"deviceMode": ""};
    var data = getUserData(getData);
    var g_modemMode = parseInt(data['deviceMode']);
    return g_modemMode;
}
function getLanguagesLgi() {
    //var LgiLanguages = ["English:{{English}}", "Turkish:{{Turkish}}", "French:{{French}}", "German:{{German}}","Dutch:{{Dutch}}","Romanian:{{Romanian}}","Italian:{{Italian}}","Polish:{{Polish}}","Hungarian:{{Hungarian}}","Czech:{{Czech}}","Spanish:{{Spanish}}","Slovakian:{{Slovakian}}"];
    var getData = {"availableLang": ""};
    data = getUserData(getData);
    var languages = data["availableLang"].split(",");
    var LgiLanguages = [];
    for (var i=0; i<languages.length; i++) {
	if (languages[i]=="fr") {
            LgiLanguages.push( LGICodeLangSet[ languages[i] ] + ":{{Francais}}");
	}
	else {
            LgiLanguages.push( LGICodeLangSet[ languages[i] ] + ":{{" + LGICodeLangSet[ languages[i] ] + "}}");
	}
    }
    return LgiLanguages;
}

function getLangCode(){
    //var def_lang = {"English":"en","Spanish":"es", "French":"fr", "German":"de", "Portuguese":"pt-br", "Dutch":"nl", "Romanian":"ro", "Italian":"it", "Polish":"pl", "Hungarian":"hu", "Czech":"cz", "Slovakian":"sk","Turkish":"tk"};
    var lang = language();
    //return def_lang[lang];
    return lang;
}

function getPrimaryLAN()
{
    return 200;
}

function getGuestLAN()
{
    return 203;
}

function getPrimary24G()
{
    return (Ifindex24G()+1);
}

function getPrimary50G()
{
    return (Ifindex50G()+1);
}

function getGuest24G()
{
    return (Ifindex24G()+4);
}

function getGuest50G()
{
    return (Ifindex50G()+4);
}

function  _showExt(bShow){
	var descendant = $("#"+$(this).attr("id")+" *");
	$.each(descendant, function (k, v) {
        var id = $(v).attr("id");
        if (id && ag[id] && ag[id].ctrl){
        	if (bShow){
        		ag[id].ctrl.hidden = false;
        	}else{
        		ag[id].ctrl.hidden = true;
        	}
        	$.log("CtrlShow: ag["+id+"].ctrl.hidden="+ag[id].ctrl.hidden);
        }
        var name = $(v).attr("name");
        if (name && ag[name] && ag[name].ctrl){
        	if (bShow){
        		ag[name].ctrl.hidden = false;
        	}else{
        		ag[name].ctrl.hidden = true;
        	}
        	$.log("CtrlShow: ag["+name+"].ctrl.hidden="+ag[name].ctrl.hidden);
        }

    });

};
var _jQuery_show = jQuery.fn.show;
jQuery.fn.show = function(){
	_showExt.call(this, true);
	return _jQuery_show.apply(this, arguments);
};
var _jQuery_hide = jQuery.fn.hide;
jQuery.fn.hide = function(bHide){
	_showExt.call(this, false);
	return _jQuery_hide.apply(this,arguments);
};
/**
 * Check Whether exist unsaved value, before leave,
 * For now, just use the old mechanism, it will pop up user defined dialog. see userWarning alternatively.
 */
//$(document).ready(function(){
//	$(window).bind("beforeunload",function(){
//		if (ag.checkDirties()){
//			return xlate("Unsaved");
//		}
//	});
//});

function onRenderred(){
	$.logLGI("onRenderred ...");
	$('body').NiceIt();
}

var menuStateLoaded = false;
function loadMenus() {
    if (!menuStateLoaded
        //&& (getSessionStorage("ar_hide") === undefined || !getSessionStorage("ar_hide"))
        ) {

        menuStateLoaded = true;
        var table = [ ] ; // table stopped working WebAccessTable.getTable([arWebAccessPage]);

        var getData = {"deviceMode": "", "eRouterMode": "", "dsliteMode": "", "ddnsEnable": ""};
        data = getUserData(getData);
        var IPMode = parseInt(data['deviceMode']);//parseInt(attrs["provMode"]);
        var modemMode = parseInt(data['eRouterMode']);//parseInt(attrs["modemMode"]);
        var DSLite = parseInt(data['dsliteMode']);//parseInt(attrs["DSLite"]);
        var ddnsEnable = data['ddnsEnable'];

        var ipv4Page = ";disable:wan_dynamic;disable:wan_static;disable:lan_settings;disable:firewall_ip;disable:wan_routing;disable:firewall_dmz;disable:firewall_virt";
        var ipv6Page = ";disable:wan_dynamicv6;disable:wan_staticv6;disable:lan_settingsv6;disable:firewall_ipv6";

        first_install_status(); // Do it now to create session storage once.
        /*checkRedirect();

        if( modemMode == 1 || (isZiggo() && IPMode == 0)){
            var gwFields = ";hide:ParentalControl;hide:ConnectedDevices;hide:Wireless;hide:Security;hide:dhcp_setting;hide:upnp_setting;hide:tool_ping;hide:tool_trace;hide:tool_mtu;hide:home_wizardfields;hide:home_conn_devices_field;hide:remote_access;";
            table.push([gwFields]);
            if( isVM() )
            {
                table.push([";hide:remote_access"]);
            }
        }*/

        var custID = customerId();
        //if(custID != 7)
        //{
        //    var LGISkin = ";skin:"+LGISkinSet[custID]+";";
        //    table.push([LGISkin]);
        //}

        if(isVM())
        {
            var hideVM = ";hide:ParentalControl;";
            table.push([hideVM]);
        }

        if(IPMode == 1)
        {
            var IPv6fields = ";hide:device_status_WANIPv6Info;hide:device_status_WANDSLiteInfo;hide:dhcp_setting_DHCPv6serverContainer;hide:firewall_IPv6Firewall;hide:ipfilter_ipv6Container";
            table.push([IPv6fields]);
        }
        else if(IPMode == 2) // IPv6 mode
        {
            if(DSLite == 1) //DSLite enabled
            {
                var IPv4fields = ";hide:upnp_setting;hide:device_status_WANIPv4Info;hide:firewall_IPv4Firewall;hide:ipfilter_ipv4Container";
            }
            else // DSLite disabled
            {
                var IPv4fields = ";hide:security_dmz;hide:upnp_setting;hide:device_status_WANDSLiteInfo;hide:porttriggering;hide:portforwarding;hide:device_status_WANIPv4Info;hide:dhcp_setting_DHCPv4Container;hide:firewall_IPv4Firewall;hide:ipfilter_ipv4Container";
            }
            table.push([IPv4fields]);
        }

	//Hide changepassword page in case of the user login from gateway interface, but CSR agent is able to access it
        if(!isTechnician() && isRouterConnection())
        {
            var Passwordfield = ";hide:change_password;";
            table.push([Passwordfield]);
        }

        if( IPMode == 1 )
        {
            table.push([ipv6Page]);
        }
        else if( IPMode == 2 )
        {
            table.push([ipv4Page]);
        }

        if(ddnsEnable != "true" || DSLite == 1)
        {
           var ddns_page = ";hide:ddns_setting";
           table.push([ddns_page]);
        }
        if( custID == 5 && !isTechnician() )
        {
            var hide_page = ";hide:wan_static;hide:wan_staticv6";
            table.push([hide_page]);
        }

        /*WebAccessTable.getTable([arWebAccessPage, arWebAccessLevel, arWebAccessRowStatus], function(index, row, key)
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
        });*/

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

        if(isLoggedIn()!=null)
	{
		if(DSLite == 1)
		{
			 hides += "Modem;security_dmz;porttriggering;portforwarding;";
		}
    }
        setSessionStorage("ar_hide",  hides);
        //setSessionStorage("ar_disable",  disables);

    } else {

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
    }
}

function logoDisplay() {
    var webUiSkin = getSkin();
    if (webUiSkin == "unitymedia")
        $(".wiz_logo_container").addClass("wiz_country_kbw");
    else if (webUiSkin == "upc")
        $(".wiz_logo_container").addClass("wiz_country_bgm");
    else if (webUiSkin == "vm")
        $(".wiz_logo_container").addClass("wiz_country_vm");
    else if (webUiSkin == "ziggo")
        $(".wiz_logo_container").addClass("wiz_country_ziggo");
    else if (webUiSkin == "vtr")
        $(".wiz_logo_container").addClass("wiz_country_vtr");
    else if (webUiSkin == "lipr")
        $(".wiz_logo_container").addClass("wiz_country_lipr");
    else if (webUiSkin == "flow")
        $(".wiz_logo_container").addClass("wiz_country_flow");
    else if (webUiSkin == "master")
        $(".wiz_logo_container").addClass("wiz_country_master");
    else
        $(".wiz_logo_container").addClass("wiz_country_bgm");
}

function disableControls(inputsel, bDisable){
	$(inputsel).each(function() {
        if ( !$(this).hasClass(".read_only")) {
        	if ($(this).CtrlDisable != undefined ) {
        		$(this).CtrlDisable(bDisable);
        	}else{
	            if (!bDisable) {
	                $(this).removeClass("input_disabled");
	                $(this).removeAttr("disabled");
	            } else {
	                $(this).addClass("input_disabled");
	                $(this).attr("disabled", "disabled");
	            }
        	}
        }
    });
}

function updateDisabledState(checkboxsel, inputsel, invert) {
    var on = $(checkboxsel).attr("checked") && !$(checkboxsel).attr("disabled");
    $.log("updateDisabledState on="+ on);
    if (invert)
        on = !on;
    var id = $(checkboxsel).attr("id");
    $(inputsel).each(function() {
        if ($(this).attr("id") != id && !$(this).hasClass(".read_only")) {
        	if ($(this).CtrlDisable != undefined ) {
        		$(this).CtrlDisable(!on);
        	}else{
	            if (on) {
	                $(this).removeClass("input_disabled");
	                $(this).removeAttr("disabled");
	            } else {
	                $(this).addClass("input_disabled");
	                $(this).attr("disabled", "disabled");
	            }
        	}
        }
    });
    $(inputsel).each(function() {
        if ($(this).attr("id") != id && !$(this).hasClass(".read_only")) {
            //if ($(this).is(':checkbox')) {
                $(this).trigger("change");
            //}
        }
    });
}

function setupCheck(checkboxsel, inputsel, invert) {
    function updater() {
        if (invert)
            updateDisabledState(checkboxsel, inputsel, true);
        else updateDisabledState(checkboxsel, inputsel);

      //  $(checkboxsel).NiceIt();
    }
    afterBuild(function() {
        $(checkboxsel).bind("click", updater);
        updater();
    });
}


// Setup default page.
function getDefaultPage(){ return "home";}
var _reqest_params = {};
function parseReqParams(){
	if (_reqest_params["basePage"]) {
		return;
	}
	var pos = location.href.lastIndexOf('?');
    if (pos == -1)
        return "";
    var posamp = location.href.lastIndexOf('&');
    if (posamp == -1)
        return "";
    var p = location.href.split("?");
    if(p.length > 2)
       return "";
    var s = p[1].split("&");
    if(s.length > 2)
       return "";
    _reqest_params.basePage = s[0];
        if (s[1].startsWith("debug")) {
            debug(s[1].substr(5));
        }else if (s[1].startsWith("mid=")) {
            _reqest_params.curMid = s[1].substr(4);
        }
}

function getCurMenuId(){
	parseReqParams();
    return _reqest_params["curMid"];
}
function getCurBasePage() {
	parseReqParams();
    return _reqest_params["basePage"];
}
function getCurMenu(){
	var curMid = getCurMenuId();
	var curPage = getCurBasePage();
	var m = menu();
	var found = null;
	function recurse(m){
		_.each(m, function(item) {
			if (item.page == curPage && (curMid?(item.id == curMid):false)){
				found = item;
				return true;
			}
			if (item.children) {  recurse(item.children);}
		});
	}
	recurse(m);
	return found;
}

var menuMap = { };

function filterMenu(m){
	$.logLGI("filterMenu: m="+m);
    m = _.select(m, function(m) { return m && menuVisible(m.id); });

    function makeMenuMap(m){
        _.each(m, function(menu) {
            if (!menu || !menu.children) return;
            menuMap[menu.page] = menu;
            menu.children = _.select(menu.children, function(m) { return  m && submenuVisible(m.page) && submenuVisible(m.id); });
            _.each(menu.children, function f(m2) {
            	menuMap[m2.page] = m2; m2["parent"]=menu; makeMenuMap(menu.children);
            });
        });
    }
    makeMenuMap(m);

    return m;
}

function isSelectedMenu(item){
	var page = getCurBasePage();
	var mid = getCurMenuId();
	if (!menuMap[page]) return false;
	if (menuMap[page] && page == item["page"] && (mid?(mid==item.id):true)){
		return true;
	}
	var pItem =  menuMap[page].parent;
	while (pItem) {
		if (pItem.id == item.id){
			return true;
		}
		pItem = pItem.parent;
	}
	return false;
}

function getMenuById(m, id){
	var found = null;
	function recurse(m){
		_.each(m, function(item) {
			if (item.id == id){found = item; return true;}
			if (item.children) {  recurse(item.children);}
		});
	}
	recurse(m);
	return found;
}
function expandCurMenu(m){
	var curMenu = getMenuById(m, getCurMenuId());
	if (!curMenu) return;
	while (curMenu){
		var mctrl = $("#mctrl_"+curMenu.id);
		if (mctrl) {
    		$(mctrl).next().css("display","block");
    		$(mctrl).removeClass("submenu_ctrl_hide");
		}
		curMenu = curMenu["parent"];
	}
}

function fmtUrladdr(args) {
    var e = { };
    e.id  = "";
    e = formatter(args);
    var baseValidate = e.validate;
    e.validate = function(v) {
        if((baseValidate!=undefined) && !baseValidate(v))
        {
           return false;
        }


        else if(/^[a-zA-Z0-9.:\-]*$/.test(v) == false || v.trim() == "")
        {
           this.errMsg = xlate("Invalid input, enter IP address or name");
           return false;
        }
        else if(!checkIpV6Addr(v) && !checkIpV4Addr(v))
        {
            return true;
        }
        else
        {
            if(e.ProvMode == 3)
            {
                return true;
            }
            else if(e.ProvMode == 2)
            {
                if((e.DSLite == 2) && checkIpV4Addr(v))
                {
                    this.errMsg = xlate("IPv4 address is not acceptable");
                    return false;
                }
                else
                {
                    return true;
                }
            }
            else
            {
                if(checkIpV6Addr(v))
                {
                    this.errMsg = xlate("IPv6 address is not acceptable");
                    return false;
                }
                else
                {
                    return true;
                }
            }
        }
    };
    return e;
}

function autoPassword(length) {
    var iteration = 0;
    var password = "";
    var randomNumber;
    var numCount=0;
    var charCount=0;
    var splCharCount=0;
    var get24GPass = data['prim24gpassphrase'];//arWPAPreSharedKey.get(10001);
    var get5GPass = data['prim5gpassphrase'];//arWPAPreSharedKey.get(10101);

    while(iteration < length){
        randomNumber = (Math.floor((Math.random() * 100)) % 94) + 33;
        if( (randomNumber >= 32) && (randomNumber <= 126)) {
            if ( ((randomNumber >=32) && (randomNumber <=47)) || ((randomNumber >=58) && (randomNumber <=64))
                 || ((randomNumber >=91) && (randomNumber <=96)) || ( (randomNumber >=123) && (randomNumber <=126) )) {
                if (splCharCount == 1) {
                    continue;
                }
                splCharCount++;
            }
            if ((randomNumber >=48) && (randomNumber <=57)) {
                if (numCount == 3) {
                    continue;
                }
                numCount++;
            }
            if ((randomNumber >=65) && (randomNumber <=90)) {
                if (charCount == 3) {
                    continue;
                }
                charCount++;
            }
        }
        iteration++;
        password += String.fromCharCode(randomNumber);
	if(iteration == length) {
            if( (numCount != 3) || (charCount != 3) || (splCharCount != 1) || (password == get24GPass) || (password == get5GPass) ) {
                iteration=0;
                splCharCount=0;
                numCount=0;
                charCount=0;
                password="";
                continue;
            }
        }
    }
    return(password);
}

var userWarning = null;
function isUserWarning(){
	if (getCurMenuId() == "ParentalControl"){ //ParentControl will not use ag.checkDirties, due to the page is not supported.
		return (userWarning != null);
	}

	var dirtyObj = ag.checkDirties();
	var bDirty= dirtyObj.bDirty;
	if (bDirty){userWarning = displayWarning;}
	return bDirty;
}
/**
* API to trigger "Apply" from "Ignore and continue" dialog
* Based on the ID of the dirty check field and its common field-set class, finds out field set has buttons based on its visibility.
* If yes, checks for the button classes "submitBtn" and "submitNoBg" and triggers the respective apply button
* If no, triggers next available visible "submitBtn" button.
**/
function triggerApplyChanges(){
	 var bDirtykey = ag.checkDirties();
	 if(bDirtykey.keyID){
		 var keyID = bDirtykey.keyID;
		 var BtnVisibleFieldset = $('#'+keyID).closest('.common_fieldset, .common_table_2, .common_fieldset_align_style').find('input[type=button]:visible');
		 if($(BtnVisibleFieldset).length>=1){
			if($(BtnVisibleFieldset).hasClass('submitBtn')){
				$(BtnVisibleFieldset).closest('.submitBtn').click();
			 }
			else if($(BtnVisibleFieldset).hasClass('submitNoBg')){
				$(BtnVisibleFieldset).closest('.submitNoBg').click();
			}
		}
		else{
			$('.submitBtn:visible').click();
		}
	 }
}
function displayWarning(evt, goto_action, url_or_func)
{
    $.log("displayWarning: goto_action = " + goto_action);
    //$.log("displayWarning: index = " + url_or_func.indexOf("javascript"));


    if((goto_action === "url") && (url_or_func.indexOf("javascript") != -1 )) return;

    evt ? evt.preventDefault() : null;

    function urlNavigation(){
	if(goto_action === "url")
            window.location = url_or_func;
        else
            url_or_func();
    }

    $("#warningWizard").remove();
    var warningWizard = new WizardFrames("warningWizard",
         [
            {
                info:xlate("Unsaved", xlate(getCurMenuId())),
                btns:[
                    buttons(
                        [
                            {
                                value:xlate("Ignore"),
                                class: "wizard_close",
                                func:function onclick() {
                                    userWarning = null;
                                    urlNavigation();
                                }
                            },
                            {
                                value:xlate("ApplyChanges"),
                                class: "wizard_button",
                                func:function onclick() {
                                    warningWizard.close();
				    setTimeout(function(){
				    	triggerApplyChanges();
					if( !($('.errorTip').length!=0 && $('.errorTip').is(':visible'))){
						setTimeout(function(){
							urlNavigation();
						},300);
					}
				    },500);
                                }
                            }
                        ]
                    )
                ]
            }
        ]);
    warningWizard.open();
}

function addUserWarningEvent()
{
    var ignoreList = ["home", "tool_ping", "tool_trace"];
    $.log("getCurBasePage = " + getCurBasePage());
    $.log("ignoreList.indexOf(getCurBasePage()) = " + ignoreList.indexOf(getCurBasePage()));
    if( (!getCurBasePage()) || ( ignoreList.indexOf(getCurBasePage()) != -1 ) ) return ;
    $(":input").change(function(){
        $.log("Something changed...");
        userWarning = displayWarning;
    });

    $("input:checkbox").bind("click", function(e){
        $.log("Checkbox Something changed...");
        userWarning = displayWarning;
    });
}

function clearUserWarningEvent()
{
    $.log("Clearing user warning!!");
    userWarning = null;
}


/**
 * Overwrite
 */
function buildShell() {
    $.logLGI("buildShell");

    //id page children
    var m = filterMenu(menu());
    $.logLGI("load menu OK.");



    $.logLGI("begin parsing menu="+m);

    var navs = "<ul id='menu'>";
    var level = 1;
    function makeMenu(m){
	    _.each(m, function(item) {
	    	if (item["menuHide"]) return;
	        var href = (item["page"])? ("/?"+item["page"] + "&mid="+item.id):"javascript:;";
	        var sel = "";
            if (isSelectedMenu(item)){
                if (/*! item.children*/ item.page ){
                    sel = " selected";
                }
             }
	        var subMenuCtl = "";
                /* Ananth : Drop down not required for level 1 and 2 */
	        if (item.children /*&& level > 2*/) {
	        	subMenuCtl = "<div class='submenu_ctrl' id='mctrl_" + item.id + "' ></div>";
	        }

	        var act = "";
	        if (item["display"] && item["display"] == "wizard"){
	        	act = " onclick=\"wz_dialog('wizard_dialog', {pageId:'"+item["page"]+"'} )\" ";
	        	href = "javascript:;";
	        }
	        navs += "<li id='"+item.id+"' class='level"+level+" "+sel+"'><a href='"+href+"' "+act+">"+xlate(item.id)+"</a>"+ subMenuCtl;
	        if (item.children) {
	        	navs += "<ul>";
	        	level ++;
	        	makeMenu(item.children);
	        	level --;
	        	navs += "</ul>";
	        }

	        navs +="</li>";
	    });
    };
    makeMenu(m);
    navs += "</ul>";

    $.logLGI("Built navigation:" + navs);

    var topNavigation = _div("id:topNavigation","class:top-nav",
                    _div("id:logo_container", "class:logo_container"),
                    _div("id:logout", "class:logout", _img("src:skins/lgi/css/images/Logout-icon.svg", "height:24px", "class:skipSVG"),
                        _a("text:{{Logout}}",
                            function onclick(){
                                logoutAndReload();
                            }
                        )),
                    _div("language", "class:language", _a("text:{{Language}}"), _select("id:selectLanguage", "class: skipjniceit", getLanguagesList(), "onchange:changeLanguage()"))/*,
                    _div("class:skin", _a("text:{{Skin}}"), _select("id:selectSkin", "class: skipjniceit", getSkinsList(), "onchange:changeSkin()"))*/);


    var shell = _div("class:content_holder",
                _div("id:navigation","class:navigation"),
		            _div("class:content-container",
		            		_div("id:mainpage")),
/*
		            _div("id:walk-dialog", "title:", "style:display: none;"),
		            _div("id:action-dialog", "title:", "style:display: none;"),
		            _div("id:error-dialog", "title:", "style:display: none;"),
*/
		            _div("id:wait-dialog", "title:", "style:display: none;", "text:Applying Changes..."));

    $("body").addClass("body_background");
    $(topNavigation.toHTML()).appendTo("body");
    $(shell.toHTML()).appendTo("body");
    $(navs).appendTo($("#navigation"));

    /* Ananth: Collapse the side menu. Expanded menu looks too big */
    $(".submenu_ctrl").next().css("display","none");
    $(".submenu_ctrl").addClass("submenu_ctrl_hide");
    //$("#Settings").next().css("display","block");

/*
    $(".submenu_ctrl").bind("click", function(evt){
    	$.logLGI("submenu_ctrl clicked.");
    	if ($(this).next().css("display") == "none"){
    		$(this).next().css("display","block");
    		$(this).removeClass("submenu_ctrl_hide");
    	}else{
    		$(this).next().css("display","none");
    		$(this).addClass("submenu_ctrl_hide");
    	}
    });
*/

    $(".level1 a, .level2 a, .level3 a").bind("click", function(evt){
    	$.logLGI("level3 clicked.");

        isUserWarning() ? userWarning(evt, "url", $(this).attr('href')) : null;
    	if ($(this).next().next().css("display") == "none"){
            //$(this).next().next().css("display","block");
           $(this).parent().parent().find("li ul").hide(500);
            $(this).next().next().show(500);
    		$(this).next().removeClass("submenu_ctrl_hide");
    	}else{
    		//$(this).next().next().css("display","none");
            $(this).next().next().hide(300);
    		$(this).next().addClass("submenu_ctrl_hide");
    	}
    });
    var loader = _div("id:loading-dialog", _div("id:loading-icon"));
    //$(loader.toHTML()).appendTo($("#mainpage"));

    expandCurMenu(m);
    $("<div id='copyrights_container'></div>").appendTo($("#navigation"));
    // make sure menus fit
//    $(".sidenav a").truncateTextToFit();
}

function buildLoginShell(){
	$.logLGI("buildLoginShell");
    $("body").empty();
	$("body").addClass("login_background");
    var overlay = _div("class:overlay");
	var shell = _div("id:login_box", "class:overlaycontainer", _div("id:mainpage"));
	var logo = _div("class:login_logo overlaycontainer");
    $(overlay.toHTML()).appendTo("body");
	$(shell.toHTML()).appendTo("body");
    $(logo.toHTML()).appendTo("body");
    if(isVM()){
        buildrouterStatusWiz();
    }
}

function logoutAndReload()
{
    function doLogoutAndReload(){
        logout();
        clearLoginCredential();
        clearSessionStorage();
        refresh();
    }

    if(isUserWarning())
    {
        userWarning(null, "func", doLogoutAndReload);
        return;
    }
    doLogoutAndReload();
}

function togglePassword()
{
    var temp = document.getElementById("Password");
    if (temp.type === "password") {
        temp.type = "text";
        $('#PasswordVisibility').text(xlate("Hide"));
        $('#Password').removeClass("hiddenPwd");
     } else {
         temp.type = "password";
         $('#PasswordVisibility').text(xlate("Show"));
         $('#Password').addClass("hiddenPwd");
     }
}

function loginbuild() {
    //ag.UserName = isSuddenlink() ? "" : "admin";
    ag.setValue("UserName","");
    ag.setValue("Password", "");

    if (hasCookie("username"))
    	ag.setValue("UserName", readCookie("username") );

    var isCSREnabled  = /*(snmpGet1(arAuthAccountEnabled.oid+".2") == "1") ? true:*/ false;
    //ag.setValue("UserName", "admin"/*isCSREnabled ? arAuthUserName.get(2):arAuthUserName.get(1)*/);

    $.log("UserName = " + ag.getValue("UserName"));
    doLogin = function() {
        if(handleLogin(UserName, $("#Password").val(), "Password", isCSREnabled))
            window.location.href="/";
    }

    afterBuild(function() {
        $(document).keyup(function(event){
            var keycode = (event.keyCode ? event.keyCode : event.which);
            if(keycode == '13'){
                doLogin();
            }
        });
    });
/*Temproray commented out as per CR-020
    var forgotPass = forgotPasswordWizard();

    OpenforgotPasswordWiz = function(){
        forgotPass.open();
    }*/

    return _div("id:Login", _div("class:login_title", "text:{{Welcomeback}}"), _div("class:login_title_info","text:{{" +customerName("LoginText",2)+ "}}"),
    		fieldset("LoginBody",
                    [//text("UserName",{isBuildTable:true}),
                     text("Password",{isBuildTable:true, type:"password",label: customerName("WelcomeBack_Password",1), helpTextVisible:false})
                    ], {level:3,isBuildTable:true}),_br(),
            _div("class:login_buttons", _input("type:button", "value:{{Next}}", "class:submitBtn", function onclick() {
                doLogin();
            }))
            );
}

function launchUpgradeStatusPopup() {
    var UpgradeWizard = new WizardFrames("updating" ,
         [
            {
               elements:[
                    _div("class:overlaycontent-title"),
                    _h5("text:{{" +customerName("updateMessage1",1)+ "}}"),
                    _br(),
                    _h5("text:{{updateMessage2}}"),
                    _br(),
                    _h5("text:{{" +customerName("LightRingStoppedBlinking",1)+ "}}")
                ],
                btns:[
                    buttons(
                        [{
                            value:xlate("Refresh"),
                            func:function onclick() {
                                var fwUpgradeStatus = getCmOperationState();
                                if (fwUpgradeStatus != 1) {
                                    UpgradeWizard.close();
                                }
                            }
                        }], {btnClass:"wizard_button"})
               ]
            }
        ], {noClose:true}
    );
    UpgradeWizard.open();
}


function render() {
    $("#loading-dialog").remove();
    var ret = buildShell();

    if(first_install_status() != 1 && (!getCSRLoginMode()))
    {
        $.logLGI("loading first install.");
        $("body").empty();
        firstInstallbuild();
        WiFiWizardBuild();
    }
    else
    {
        if (getCmOperationState() == 1) {
            launchUpgradeStatusPopup();
        }
        if (!isLoggedIn()) {
            buildLoginShell();
        }
        var def = isLoggedIn() ? build() : loginbuild();
        $(def.toHTML()).appendTo($("#mainpage"));
    }

    $(render2());
    // Hook on renderred.

    // Need to change only logo for cablecom

    checkForCablecom();

    changeSVG();

    if (onRenderred != undefined ) onRenderred();

    if (getCurMenuId() == "ParentalControl"){ // Only for ParentControl.
    	addUserWarningEvent();
    }
}

function formatter(args) {
    var f = { };
    f.errMsgId = null;
    f.errMsg = "";
    f.label = "";
    f.id = "";
    f.isGuest = false;
    var getData = {"isguestssid": ""};
    data = getUserData(getData);
    guestEnabled = data['isguestssid'];
    /*
    f.load = function(v) {
        return v === undefined || v === null ? "" : v;
    };
    f.store = function(v) {
        return v === undefined || v === null ? "" : v;
    };
    */
    f.setErrMsg = function(errMsgId){
    	if (!errMsgId){
    		f.errMsgId = "";
    	    f.errMsg = "";
    	    return;
    	}
    	f.errMsgId = errMsgId;
    	f.errMsg = xlate.apply(this, arguments);
    	$.log("setErrMsg: f.errMsgId=" + f.errMsgId+"; errMsg="+f.errMsg);
    };
    f.validate = function(v) {;
    	if (f.isRequired && _.isEmpty(v)){
                    validFields[this.id] = 0;
		    if(f.id == "CurrentPassword")
				f.setErrMsg("errMsg_PasswordRequired", xlate(f.label));
			else if(f.id == "RemotePort" || f.id == "IPv4SrcPortStart" || f.id == "IPv4SrcPortEnd" || f.id == "IPv4DestPortStart" || f.id == "IPv4DestPortEnd")
				return true;
			else
				f.setErrMsg("errMsg_IsRequired", xlate(f.label));
    		return false;
    	}

    	if (f.maxLength && _.size(v)>f.maxLength){
                if(f.id == "FriendlyName")
                {
                    f.setErrMsg("deviceNameLimit", xlate(f.label));
                }
                else
                {
                    f.setErrMsg("errMsg_overMaxLen", xlate(f.label), f.maxLength);
                }
    		return false;
    	}
        validFields[this.id] = 1;
        return true;
    };
    f.storeAndValidate = function(v) {
        return f.store(f.validate(v));
    };
    f.format = function(val){
    	return val;
    };
    f.unformat = function(fVal){
    	return fVal;
    };
    if (args) {
    	_.extend(f, args);
    }
    return f;
}

var tmp;
function fmtLGISSID(args) {
   var f = formatter(args);
    var baseValidate = f.validate;

    f.validate = function(v) {
        if(v!=""){
            showTickMark(f.pid,true);
        }
        if($('#'+this.id).val().search(/^\s{1}/) != -1) {
            this.errMsg = xlate("errMsg_SSIDRequired", v );
            validFields[this.id] = 0;
            $("#tickMark_"+f.pid+" "+" img.check-icon").css("display","none");
            return false;
        }
        if ( $('#'+this.id).val().match(/^\s+|\s+$/g, "") ) {
            this.errMsg = xlate("errMsg_SSIDRequired", v );
            validFields[this.id] = 0;
            $("#tickMark_"+f.pid+" "+" img.check-icon").css("display","none");
            return false;
        }

        var managedNetworks = ["libertyglobal","telenet","virginmedia","ziggo","horizonwi-free","telenethomespot","telenetwifree","telenetsecure","upcwifispots","upcwi-free","unitymediawifispot","unitymediapublicwifispot","vtr","libertypr"];
        var escapeStrings = ["<script", "</script>", "<iframe", "</iframe>", ".src" ];
		/* remove white-space and convert to lowercase*/
        var trimmedSSID = v.replace(/\s/g, "").toLowerCase();

        if (f.isRequired && _.isEmpty(v)) {
            f.errMsg = xlate("errMsg_SSIDRequired", xlate(f.label));
            $("#tickMark_"+f.pid+" "+" img.check-icon").css("display","none");
            validFields[this.id] = 0;
            return false;
        }

        if (f.maxLength && _.size(v)>f.maxLength) {
            f.errMsg = xlate("errMsg_SSIDRequired", xlate(f.label), f.maxLength);
            validFields[this.id] = 0;
            $("#tickMark_"+f.pid+" "+" img.check-icon").css("display","none");
            return false;
        }

        for( var index=0; index < managedNetworks.length; index++ ) {
            if( trimmedSSID == managedNetworks[index] ) {
            this.errMsg = xlate("errMsg_SSIDRequired", v );
            validFields[this.id] = 0;
            $("#tickMark_"+f.pid+" "+" img.check-icon").css("display","none");
            return false;
        }
        }

        for( var index=0; index < escapeStrings.length; index++ ) {
            if( trimmedSSID.indexOf( escapeStrings[index] ) != -1 ) {
            this.errMsg = xlate("IsInvalid", v );
            validFields[this.id] = 0;
            $("#tickMark_"+f.pid+" "+" img.check-icon").css("display","none");
            return false;
            }
        }
        tmp = f.pid;
        $("#tickMark_"+f.pid+" "+" img.check-icon").css("display","block");
        validFields[this.id] = 1;
 		return true;
    };

    return f;
}

function fmtIPv4(args) {
        var f = { };
        f.id = "";
	f = formatter(args);
	var baseValidate = f.validate;
	f.validate = function(v) {
		if (baseValidate!=undefined && !baseValidate(v)){
            this.errMsg = xlate("errMsg_IPInvalid", xlate(f.id));
            return false;
		}
		var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
        if (!reg.test(v)) {
              var oct = v.split('.');
              if((!oct[2]) || (!oct[3])){
                  this.errMsg = xlate("errMsg_IPInvalid", xlate(f.id));
              } else {
                  this.errMsg = xlate("errMsg_InvalidIP", v );
                  return false;
              }
        }
        if(v =="0.0.0.0"||v == "255.255.255.255"){
            this.errMsg = xlate("errMsg_InvalidIP", v );
            return false;
        }
        //    throw xlate("%s%s is an invalid IP address", f.label?xlate(f.label)+": ":"", v );

        return true;
	};
	f.format = function (val) {
		return hexToIp(val);
	};
	f.unformat = function(fVal){
		return ipToHex(fVal, " ");
	};
	f.size = 16;

	return f;
}

function fmtIPv6(args) {
        var f = { };
        f.id = "";
	f = formatter(args);
	var baseValidate = f.validate;
	f.validate = function(v) {
		if ( baseValidate!=undefined && !baseValidate(v) ){
			return false;
		}
		// IPv6 validate.
	    if (!checkIpV6Addr(v)) {
	    	f.setErrMsg("errMsg_InvalidIP", v);
	    	return false;
	    }

        return true;
	};
	f.format = function (val) {
		return hexToIpv6(val);
	};
	f.unformat = function(fVal){
		return ipv6ToHex(fVal, " ");
	};
	f.size = 40;

	return f;
}

/**
 * fmtNumber,
 * 		options:	isInteger	---- true/false
 * 					min			---- number
 * 					max			---- number
 * 					largerThan	---- It should be larger than another #ID
 */
function fmtNumber(args) {
	var f = formatter(args);
	var baseValidate = f.validate;
	f.validate = function(v) {
		var v = v.trim();
		$.logLGI("fmtNumber.validate...v="+v);
		if ( baseValidate!=undefined && !baseValidate(v) ){
			f.setErrMsg("errMsg_IsNumber", v);
			return false;
		}
		$.logLGI("validate isNumber.");
    	if (! /^[0-9]+([\.][0-9]+){0,1}$/.test(v)){
    		f.setErrMsg("errMsg_IsNumber", v);
    		return false;
    	}
    	if (f.isInteger) {
    		$.logLGI("fmtNumber parsed Int=" + v);
    		if (! /^[0-9]+$/.test(v)){
    			f.setErrMsg("errMsg_IsInteger", v);
    			return false;
    		}
    	}

    	$.logLGI("this.min=" + f.min + "; this.max=" + f.max );

		if (f.min != undefined && f.max != undefined){
			if ( v >f.max || v < f.min){
				f.setErrMsg("errMsg_Between", v, f.min, f.max);
				return false;
			}
		}

		if (f.largerThan != undefined ) {
			var other = f.largerThan;
			if (other.startWith("#")) {//It's control ID.
				var otherV = $(other).val().trim();
				var otherId = other.substring(1);
				var otherLabel = ag.getFormatter(otherId)==null?"":ag.getFormatter(otherId).label;
				if (Number(v) <= Number(otherV) ){
					f.setErrMsg("errMsg_largerThan", f.label, otherLabel);
					return false;
				}
			}
		}

		if (f.largerEqualThan != undefined ) {
			var other = f.largerEqualThan;
			if (other.indexOf("#")==0) {//It's a control ID.
				var otherV = $(other).val().trim();
				var otherId = other.substring(1);
				var otherLabel = ag.getFormatter(otherId)==null?"":ag.getFormatter(otherId).label;
				if (Number(v) < Number(otherV)){
					f.setErrMsg("errMsg_largerEqualThan", f.label, otherLabel);
					$.logLGI("Validate failed: "+ f.errMsg);
					return false;
				}
			}
		}


        return true;
	};

	return f;
}

function fmtGenBetween(args) {
	var f = formatter(args);
	var baseValidate = f.validate;
	f.validate = function(v) {
		var v = v.trim();
		if ( baseValidate!=undefined && !baseValidate(v) ){
			return false;
		}
		if (! /^[0-9]+([\.][0-9]+){0,1}$/.test(v)){
    		f.setErrMsg("errMsg_IsNumber", v);
    		return false;
    	}
    	if (f.isInteger) {
    		$.logLGI("fmtNumber parsed Int=" + v);
    		if (! /^[0-9]+$/.test(v)){
    			f.setErrMsg("errMsg_IsInteger", v);
    			return false;
    		}
    	}


		if (f.min != undefined && f.max != undefined){
			if ( v >f.max || v < f.min){
				if(f.str == "PingSize")
					f.setErrMsg("errMsg_Ping", f.min, f.max);
				else if(f.str == "MaxHopes")
					f.setErrMsg("errMsg_MaxHopes", f.min, f.max);
				else if(f.str == "BasePort")
					f.setErrMsg("errMsg_BasePort", f.min, f.max);
				return false;
			}
		}
		return true;
	};

	return f;
}

function fmtPort(args) {
	var f = fmtNumber(args);

	if (!f.min) f.min = 1;
	if (!f.max) f.max = 65535;
	var baseValidate = f.validate;
	f.validate = function(v) {
		var v = v.trim();
		$.logLGI("fmtPort.validate...v="+v);
		if ( baseValidate!=undefined && !baseValidate(v) ){
			if (f.errMsgId == "errMsg_IsNumber" || f.errMsgId == "errMsg_IsInteger" || f.errMsgId == "errMsg_Between") {
				f.setErrMsg("errMsg_InvalidPort", v);
			}
			return false;
		}
        var protocol = f.selProtocol;
        if(f.blockPort!= undefined){
            if(f.blockPort == true && (v == 25 || v == 53 || v == 135|| v == 137 || v == 138|| v == 139 || v == 161 || v == 162 || v == 445 || v == 1080) ){
               var errMsg_PortTCP = errMsg_Port + ": " + blockPort.toString();
               this.errMsg = xlate(errMsg_PortTCP, v);
               return false;
            }
        }
        if (f.largerEqualThan != undefined ) {
          var other = f.largerEqualThan;
          if (other.indexOf("#")==0) {//It's a control ID.
            var otherV = $(other).val().trim();
            var otherId = other.substring(1);
            var otherLabel = ag.getFormatter(otherId)==null?"":ag.getFormatter(otherId).label;
            if(($(f.selPolicy).is(':checked') && $(f.selBound).is(':checked')) || f.restriction ){
              if($(protocol).val() == 1 || $(protocol).val() == 2){
                var blockPort=[25,53,135,137,138,139,161,162,445,1080];
                for(var i=0; i<=blockPort.length; i++){
                    if(blockPort[i] >= otherV && blockPort[i]<=v ){
                        var errMsg_PortTCP = xlate("errMsg_Port") + ": " + blockPort.toString();
                        f.setErrMsg(errMsg_PortTCP, blockPort[i], otherV, v);
                        return false;
                    }
                }
              }
              if($(protocol).val() == 0){
                var blockPort=[53,135,137,139,161,162];
                for(var i=0; i<=blockPort.length; i++){
                    if(blockPort[i] >= otherV && blockPort[i]<=v ){
                        var errMsg_PortUDP = xlate("errMsg_Port") + ": " + blockPort.toString();
                        f.setErrMsg(errMsg_PortUDP, blockPort[i], otherV, v);
                        return false;
                    }
                }
              }
          }
        }
        }
        return true;
	};

	return f;
}

function fmtEmail(args) {
    var e = formatter(args);
    //var baseValidate = e.validate;
    e.validate = function(v) {
        var atpos = v.indexOf("@");
        var dotpos = v.lastIndexOf(".");
        if (atpos<1 || dotpos<atpos+2 || dotpos+2>=v.length) {
            this.errMsg = xlate("Please enter your e-mail address", v );
        } else {
            return true;
        }
    };
    return e;
}
function fmtReenterPassword(args) {
    var o = formatter(args);
    o.validate = function(v) {
         if(v!=""){
			confirmPasswordValidate = 1;
			var newpassword;
			if(isVM()){
				newpassword = $("#NewPassword13").val();
			}
			else{
				newpassword = $("#NewPassword").val();
			}
			var confirmPassword = $("#"+o.pid).val();
			if (newpassword != confirmPassword){
				this.errMsg = xlate("errMsg_PasswordMismatch", v);
				return false;
			}
			else{
				return true;
			}
        }
		else{
			confirmPasswordValidate = 0;
                this.errMsg = xlate("errMsg_PasswordMismatch", v );
		}

    };
    return o;
}
function fmtModemPassword(args) {
    $.log("fmtModemPassword args= " + args);
    var o = formatter(args);
    o.validate = function(v) {
        if(v!=""){
            showStrengthBar(o.pid,true);
        }
        var modemPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[\x21-\x7E]{8,32}$/;
        var oldPassword;
        if(isVM()) {
            oldPassword = $("#LoginPassword13").val();
        }
        else {
            oldPassword = $("#LoginPassword1").val();
        }
        if(v.length != 0){
            passwordValidate = 1;
            if(modemPass.test(v)){
                if(v != oldPassword) {
                  // Valid - Passwords are different
                  $("#tickMark_"+o.pid+" "+" img.check-icon").css("display","block");
                }
                else {
                  // Invalid - Same Password has been entered again
                  this.errMsg = xlate("errMsg_sameAsOldPassword", v );
                  $("#tickMark_"+o.pid+" "+" img.check-icon").css("display","none");
                  return false;
                }
            } else {
                this.errMsg = xlate("errMsg_WeakPassword", v );
                $("#tickMark_"+o.pid+" "+" img.check-icon").css("display","none");
                return false;
            }
	} else {
            this.errMsg = xlate("errMsg_WeakPassword", v );
            $("#tickMark_"+o.pid+" "+" img.check-icon").css("display","none");
            passwordValidate = 0;
            return false;
        }
        return true;
    };
    return o;
}

function fmtPassphrase(args) {
    $.log("fmtPassphrase args= " + args);
    if(isLoggedIn())
    {
        //Getting WiFi passphrase from the back-end before the validation starts
        var data = {"prim24gpassphrase": "", "prim5gpassphrase": "", "GuestWizPassphrase": ""};
        data = getWifiData(data);
        var get24GPass = data['prim24gpassphrase']; //arWPAPreSharedKey.get(10001);
        var get5GPass = data['prim5gpassphrase']; //arWPAPreSharedKey.get(10101);
        var getGuestPass = data['GuestWizPassphrase'];
    }

    var o = formatter(args);
    var baseValidate = o.validate;
    o.validate = function(v) {
		if(v!=""){
			showStrengthBar(o.pid,true);
		}
        var strength = 0;
        var ASCII_33to126 = /^[\x21-\x7E]+$/;
        var lowerLength = v.replace(/[^a-z]/g, "").length;
        var upperLength = v.replace(/[^A-Z]/g, "").length;
        var numberLength = v.replace(/[^0-9]/g, "").length;
        var splcharLen = v.replace(/[^-!@#$%^&*()_+|~=`{}\[\]:\\";'<>? ,.\/]/g, "").length;
        var isInvalidPassword = false;

        if ( baseValidate!=undefined && !baseValidate(v) ){
            validFields[this.id] = 0;
            return false;
        }

        var escapeStrings = ["<script", "</script>", "<iframe", "</iframe>", ".src", " " ];
        for( var index=0; index < escapeStrings.length; index++ ) {
            if( v.indexOf( escapeStrings[index] ) != -1 ) {
                this.errMsg = xlate("IsInvalid", v );
                isInvalidPassword = true;
            }
        }
        if( !isInvalidPassword) {
            // Read the current password
            var oldPassword;
            oldPassword = $("#WiFiPassword").val();
            var guestCheckId = document.getElementById("EnableGuest");
            var isGuestChecked;
            if ( guestCheckId != null )
            {
                isGuestChecked = guestCheckId.checked;
            }
            if(v.length != 0 && (v.length <= 63)){
                if(ASCII_33to126.test(v)){
                    if(v == oldPassword) {
                        // Same password set again.  Reject.
                        strength = -1;
                        this.errMsg = xlate("errMsg_sameAsOldPassword", v );
                    }
                    else
                    {
                        if( ( (v.length >= 14) &&
                            (lowerLength >= 3) && (upperLength >= 3) && (numberLength >= 3) && (splcharLen > 0) )
                            || ( (v.length >= 30) && (lowerLength >= 3) && (upperLength >= 3) ) ) {
                                strength = 3;
                        }
                        else if( (v.length >=12) &&
                            (lowerLength >= 2) && (upperLength >= 2) && (numberLength >= 2) ) {
                                strength = 2;
                        }
                        else if( (v.length >= 10) &&
                            (lowerLength >= 1) && (upperLength >= 1) && (numberLength >= 1) ) {
                                strength = 1;
                        }

                        if( (guestEnabled == "true") || (isGuestChecked == true) )
                        {
                            if( o.isGuest && ((v == get24GPass) || (v == get5GPass)) ) {
                                strength = -1;
                                this.errMsg = xlate("errMsg_SameAsPrimaryNetwork", v );
                            }
                            else if( o.isGuest == false && ( v == getGuestPass )) {
                                strength = -1;
                                this.errMsg = xlate("errMsg_SameAsGuestNetwork", v );
                            }
                        }
                    }

                    if(strength == 1)
                    {
		        var GoodTxt = xlate("Good");
                        $("#strengthBar_"+o.pid+" "+".pass_arrow").attr("class", "pass_arrow medium yellow");
                        $("#strengthBar_"+o.pid+" "+".pass_text").attr("class", "pass_text medium");
                        $("#strengthBar_"+o.pid+" "+".pass_text").text(GoodTxt);
                        $("#tickMark_"+o.pid+" "+" img.check-icon").css("display","block");
                        validFields[this.id] = 1;
                        return true;
                    }
                    else if(strength == 2)
                    {
		        var StrongTxt = xlate("Strong");
                        $("#strengthBar_"+o.pid+" "+".pass_arrow").attr("class", "pass_arrow strong yellow");
                        $("#strengthBar_"+o.pid+" "+".pass_text").attr("class", "pass_text strong");
                        $("#strengthBar_"+o.pid+" "+".pass_text").text(StrongTxt);
                        $("#tickMark_"+o.pid+" "+" img.check-icon").css("display","block");
                        validFields[this.id] = 1;
                        return true;
                    }
                    else if(strength == 3)
                    {
		        var veryStrongTxt = xlate("VeryStrong");
                        $("#strengthBar_"+o.pid+" "+".pass_arrow").attr("class", "pass_arrow good green");
                        $("#strengthBar_"+o.pid+" "+".pass_text").attr("class", "pass_text good");
                        $("#strengthBar_"+o.pid+" "+".pass_text").text(veryStrongTxt);
                        $("#tickMark_"+o.pid+" "+" img.check-icon").css("display","block");
                        validFields[this.id] = 1;
                        return true;
                    }
                    else
                    {
		        var NotSufficient = xlate("NotSufficient");
                        $("#strengthBar_"+o.pid+" "+".pass_arrow").attr("class", "pass_arrow invalid red");
                        $("#strengthBar_"+o.pid+" "+".pass_text").attr("class", "pass_text invalid");
                        $("#strengthBar_"+o.pid+" "+".pass_text").text(NotSufficient);
                        $("#tickMark_"+o.pid+" "+" img.check-icon").css("display","none");
		        if(strength == -1){validFields[this.id] = 0;return false;}
		        else{
                   	     this.errMsg = xlate("errMsg_WeakPassword", v );
                             validFields[this.id] = 0;
                             return false;
		        }
                     }
                 }
            }
        }
        if (strength == 0 || isInvalidPassword) {
            if( !isInvalidPassword ) {
                if(v.length == 0){
                    this.errMsg = xlate("errMsg_PasswordRequired", v );
                } else {
                    this.errMsg = xlate("errMsg_WeakPassword", v );
                }
            }
            var NotSufficient =  xlate("NotSufficient");
            $("#strengthBar_"+o.pid+" "+".pass_arrow").attr("class", "pass_arrow invalid red");
            $("#strengthBar_"+o.pid+" "+".pass_text").attr("class", "pass_text invalid");
            $("#strengthBar_"+o.pid+" "+".pass_text").text(NotSufficient);
        }
        $("#tickMark_"+o.pid+" "+" img.check-icon").css("display","none");
        validFields[this.id] = 0;
        return false;
    };
    return o;
}

/*-----------Function password validation Ends - Nikitha---------*/

function fmtMacAddr(args) {
    var o = formatter(args);

    $.logLGI("fmtMacAddr:o="+JSON.stringify(o));

    var baseValidate = o.validate;
    o.format = function(v) {
        if (!v){
        	v = ag[o.id].value;
        }
    	return hexToMac(v);
    };
    o.unformat = function(v) {
        return macToHex(v);
    };
    o.validate = function(v) {
    	if ( baseValidate!=undefined && !baseValidate(v) ){
			return false;
		}
		var reg = /^[0-9A-Fa-f][0-9A-Fa-f](:[0-9A-Fa-f][0-9A-Fa-f]){5}$/;
        if (!reg.test(v) || v == "00:00:00:00:00:00" ){
        	o.errMsg = xlate("errMsg_InvalidMAC", v );
        	return false;
        }

        return true;
    };
    return o;
}

function fmtDeviceName(args) {
    var o = formatter(args);
    var baseValidate = o.validate;
    o.validate = function(v) {
        if ( baseValidate!=undefined && !baseValidate(v) ){
            return false;
        }
        var reg = /^[A-Za-z0-9_-]*$/;
        if (!reg.test(v)){
            o.errMsg = xlate("errMsg_InvalidDeviceName", v );
            return false;
        }

        return true;
    };
    return o;
}

function snmpTimeToString(ticks) {
    var seconds = parseInt(((ticks/(100)) % 60), 10);
    var minutes = parseInt(((ticks/(100 * 60)) % 60), 10);
    var hours = parseInt(((ticks/(100 * 60 * 60)) % 24), 10);
    var days = parseInt(((ticks/(100 * 60 * 60 * 24)) % 24), 10);

    $.log(days + " days " + hours + "h:" + minutes + "m:" + seconds + "s");
    return (days + " days " + hours + "h:" + minutes + "m:" + seconds + "s");
}

function fmtDate(args) {
    var o = formatter(args);

    $.log("fmtDate:o="+JSON.stringify(o));

    o.format = function(v) {
        if (!v){
        	v = ag[o.id].value;
        }
        return snmpDateToString(v);
    };

    return o;
}

function fmtTime(args) {
    var o = formatter(args);

    $.log("fmtTime:o="+JSON.stringify(o));

    o.format = function(v) {
        if (!v){
        	v = ag[o.id].value;
        }
        return snmpTimeToString(v);
    };

    return o;
}

/**
 * Base data controller object.
 * ag structure define =
 * {
		id:{ // Object ID. In the page session, it should be unique.
			origValue: [String] //Store the original value, it should be set in loadData period.
			value: [String] // Current stored value. will also initialized in loadData period.
			ctrl:{ // Represent the UI element
				getValue() // Get UI element value
				setValue() // Set UI element value
			},
			formatter:{} // Used to validate input and transfer data between ctrl.value and value.
		}
	}
 */
var ag = {
		_createAg:function(id){ if (ag[id]) return ag[id]; ag[id] = {}; return ag[id];},
		getObj: function(id){ return this._createAg(id);},
		isDirty: function (id){
			if (!ag[id]) return false;
			var o = ag[id];
			if (o.opts && o.opts.checkDirty) {
                                if (o.ctrl && o.ctrl.getValue && _.isFunction(o.ctrl.getValue) && typeof o.ctrl.getValue() !== 'undefined'){
                                        if (typeof o.ctrl.hidden !== 'undefined' && o.ctrl.hidden) return false;
					var _origV = o.formatter?o.formatter.format(o.origValue):o.origValue;
					var _curV =	o.ctrl.getValue();
					$.log("ag["+id+"]._origV="+_origV+"; _curV="+_curV);
					return (_origV != _curV);
				}else{
					return (o.origValue != o.value);
				}
			}
			return false;
		},
		checkDirties: function(){
			var bDirty = false;
			var keyID;
			_.map(this, function(value, key){
				if (_.isFunction(value)){
					return;
				}
				if (ag.isDirty(key)){
					bDirty = true;
					keyID=key;
					_.breakLoop();
				}
			});
			return {
				bDirty:bDirty,
				keyID:keyID
				};
		},
		getValue: function(id){
			this._createAg(id);

			return ag[id].value;
		},
		setValue: function(id, val){
			this._createAg(id);
			if (typeof ag[id].origValue === 'undefined') ag[id].origValue = val;
			ag[id].value = val;
		},
		select: function(grpId, id){
			this._createAg(grpId);
			ag[id].selId = id;
		},
		getSelectedValue: function(grpId){
			if (!ag[grpId] || !ag[grpId].value) return null;
			return ag[ag[grpId].value].value;
		},
		attachFormatter: function(id, formatter){
			this._createAg(id);
			formatter.id = id;
			ag[id].formatter = formatter;
		},
		getFormatter: function(id){
			if (!ag[id]) return null;
			return ag[id].formatter;
		},
		getFormatedValue: function(id){
			if (!ag[id]) return null;
			if (ag[id]["formatter"]){
				if (ag[id]["formatter"]["format"]){
					return ag[id]["formatter"].format(ag[id].value);
				}
			}else{
				return ag[id].value;
			}
		}


	};


// Default options for all controls.
var _controlDefaultOpts = {
		label:null,
		helpText: null,
	   	withoutLabel: false,
	   	withoutHelpTxt: false,
	   	class:"none",
	   	style:null,
	   	/* applyHook, All controls should traverse this array to validate its value.
	   	            The default array "_afterApply" was inheritted from ARRIS/base.js
	   	            We can also replace this option for specified controllers to change this default behavior
	   	*/
	   	applyHook:(_afterApply == undefined)?new Array() : _afterApply
};

function buildOptions(id, opts){
	var opt = {id:id};
    _.extend(opt, _controlDefaultOpts);
    _.extend(opt, opts);
	$.logLGI("buildOptions:"+id+"; opt="+JSON.stringify(opt) );

    if (technicianOnly(id) && !isTechnician())
        return null;
    if (!fieldsetVisible(id))
        afterBuild(function() { $("#" + id).hide(); });
    if  (!fieldsetEnabled(id))
        afterBuild(function() { $("#" + id + " *").attr('disabled', true); });

    return opt;
}

function showErrorTips(id, bShow, opts) {
	var opt = _.extend({ctrl:$("#fmInp-"+id),
						maskShow:3,				// 1, only show error controller; 2, only show error tips; 3, both of them.
						errTipPos:{top:null,left:null,width:null, height:null}
						},opts);
	var ctrl = $("#"+id);
	//$.logLGI("showErrorTips: id="+id+"; bShow="+ bShow+ "; opt=" + opt );
	if (!ctrl) return null;
	var nCtrl = opt.ctrl;
	var errCtrl = opt.ctrl;
	var errTipId = "errTip_" + id;
	if (bShow){
		if (opt.maskShow & 2) {
			if (!$("#"+errTipId).get(0)){
				//$(nCtrl).after("<div id='"+errTipId+"' class='errorTip'><div class='arrow'></div><div class='body'><div id='errClose-"+id+"' class='errTipClose'></div><span></span></div></div>");
	            $(nCtrl).after("<div id='"+errTipId+"' class='errorTip'><div class='body'><div id='errClose-"+id+"' class='errTipClose'></div><span></span></div></div>");
		       // $("#"+errTipId).css('z-index',"10000");
		        //$("#"+errTipId).css('top', $(nCtrl).position().top+31);
		        $.log("position: " + $(nCtrl).position().left);
	            $.log("offset: " + $(nCtrl).offset().left);
	            if (opt.errTipPos.left) {
	            	$("#"+errTipId).css('left', opt.errTipPos.left );
	            }else{ // Caculate default left value.
					if(($(nCtrl).offset().left)!= 0){
						if($('.errorTip').parent().css('padding-left') !=null){
							$("#"+errTipId).css('left',($(nCtrl).offset().left - $(nCtrl).parent().offset().left - parseInt($('.errorTip').parent().css('padding-left'))));
						}
						else{
							$("#"+errTipId).css('left',$(nCtrl).offset().left - $(nCtrl).parent().offset().left );
						}
					}
					else{
						$("#"+errTipId).css('left',0 );
					}
	            }

	            var tipWidth = 200;
	            if (opt.errTipPos.width) { tipWidth = opt.errTipPos.width;}
	            $("#"+errTipId).css('width',Math.max($(nCtrl).width(), tipWidth));
			}

			var msg = ag[id].formatter.errMsg;
			$.logLGI("errTipId="+ errTipId + "; msg=" + msg);
	        $("#"+errTipId+" span").text(msg);

	        $("#"+errTipId).show();
		}
		if (opt.maskShow & 1) {
			$(errCtrl).addClass("fmInError");
		}

        $("#errClose-"+id).click(function(){
        	//$("#"+errTipId).remove();
        });
	}else{
	    $("#"+errTipId) ? $("#"+errTipId).remove() : null;
		$(errCtrl).removeClass("fmInError");
	}
}

function showTickMark(id, bShow) {
    var ctrl = $("#"+id);
    if (!ctrl) return null;
    var InCtrl = $("#fmInp-"+id);
    var tickMark = "tickMark_"+id;
    if (bShow){
        if (!$("#"+tickMark).get(0)){
            $(InCtrl).after("<div id='"+tickMark+"' class='Check-icon'><img class='skipSVG check-icon' src='skins/lgi/css/images/icon-check.svg' width='18px' /></div>");
        }
    }
    else{
        $(tickMark) ? $(tickMark).remove() : null;
    }
}

function showStrengthBar(id, bShow) {
	var ctrl = $("#"+id);
	if (!ctrl) return null;
	var InCtrl = $("#fmInp-"+id);
	var strengthId = "strengthBar_" + id;
	var tickMark = "tickMark_"+id;
	   if (bShow){
		if ((getCurMenuId() == "ChangePassword")||($('#perfectStrengthPage').length== 1 && $('#wifi_firstInstall').is(':visible')== false )){
		   if (!$("#"+tickMark).get(0)){
		    $(InCtrl).after("<div id='"+tickMark+"' class='Check-icon'><img class='skipSVG check-icon' src='skins/lgi/css/images/icon-check.svg' width='18px' /></div>");
		   }
        	   $(InCtrl).addClass("fmInStrengthBar1");
		   var fmInpwidth = $('#fmInp-'+id+'.fmInStrengthBar1').width();
		   $('.fmInStrengthBar1').parent().addClass('PassStrengthBar_'+id+" "+'PassStrengthBar');
		   var tickmarkCalc = $('.fmInStrengthBar1').position().left + fmInpwidth +20;
		   $('.PassStrengthBar_'+id+""+' .Check-icon').css('left',tickmarkCalc+30);
		}
		else{
		if (!$("#"+strengthId).get(0)){
			$(InCtrl).after("<div id='"+tickMark+"' class='Check-icon'><img class='skipSVG check-icon' src='skins/lgi/css/images/icon-check.svg' width='18px' /></div>");
            	$(InCtrl).after("<div id='"+strengthId+"' class='strengthBar'><table><tr><td><img class='pass_strength skipSVG' src='skins/lgi/css/images/password-strength-bar.svg' style='width:240px' /></td></tr><tr><td><img id='passarrow_wifi' class='pass_arrow red' src='skins/lgi/css/images/password-strength-bar-arrow.svg' style='width:7px' /></td></tr><tr><td><a id='passtext_wifi' class='pass_text' >Invalid</a></td></tr></div>");
			if(($(InCtrl).offset().left) != 0){
				if($('.strengthBar').parent().css('padding-left') !=null){
					$("#"+strengthId).css('left',($(InCtrl).offset().left - $(InCtrl).parent().offset().left - parseInt($('.strengthBar').parent().css('padding-left'))));
				}
				else{
					$("#"+strengthId).css('left',$(InCtrl).offset().left - $(InCtrl).parent().offset().left );
				}
			}
			else{
				$("#"+strengthId).css('left',0 );
			}
		}
        	$("#"+strengthId).show();
		$(InCtrl).removeClass("fmInStrengthBar1");
        	$(InCtrl).addClass("fmInStrengthBar");
		$('.PassStrengthBar_'+id+""+' .Check-icon').css('left','');
		var fmInpwidth = $('#fmInp-'+id+'.fmInStrengthBar').width();
		$('.fmInStrengthBar').parent().addClass('PassStrengthBar_'+id+" "+'PassStrengthBar');
		var tooltipCalc = $('.PassStrengthBar_'+id+" "+"#"+strengthId).position().left + fmInpwidth +20;
		$('.PassStrengthBar_'+id+""+' .Check-icon').css('left',tooltipCalc+30);
		}
	}
	else{
	    $("#"+strengthId) ? $("#"+strengthId).remove() : null;
		$(InCtrl).removeClass("fmInStrengthBar");
		$('#tickMark_'+id) ? $('#tickMark_'+id).remove() : null;
	}
}
/**
 * Overwrite
 */
function helpTag(id, label, text, isVisible) {
    var t = xlate(text || helpText(label));

    afterBuild(function() {
        $("#"+id+"_image_tt").mouseenter(function(e) {
            $("body").append("<div id='ttip' class='toolTip'></div>");
            $("#ttip").html(t);
            $("#ttip").css('z-index',"11000");
            $("#ttip").css('top', $(this).offset().top);
            $("#ttip").css('left',$(this).offset().left+32);
            $("#ttip").show();
        });
        $("#"+id+"_image_tt").mouseleave(function(e) {
           $("#ttip").remove();
        });
    });
    //var imgSrc = "i/help.png";
    //if (getSkin()) imgSrc = "skins/"+getSkin()+"/i/help.png";
    //return   _div("style:display:inline;", _img("id:"+label.word()+"_image_tt", "src:"+imgSrc,"class:tooltip_icon") );
    //return   _div("class:div_tooltip", _img("id:"+id+"_image_tt", "width:23","height:25","src:"+imgSrc,"class:tooltip_icon") );
    return   _div((isVisible===false?"style:visibility:hidden":null), "id:"+id+"_image_tt","class:div_tooltip" );
}

function form(label, contents, opts) {
    var opt = {description:null};
    _.extend(opt, opts);
    var descr = (opt.description)? [_br(),_div("text:{{" + opt.description+"}}", "class:form_descr"), _a("class:td_tiptool",(opt.HelpTxtDesc)?helpTag(label, label, opt.helpText):null), _br()]:null;
    return _div(_div("class:form_header", _div(_h3("id:label_"+label,"text:{{" + label+"}}",(opt.displayInline)?"style:display:inline":null), _a("class:td_tiptool",(opt.HelpTxtForm)?helpTag(label,label, opt.HelpTxtForm):null)), descr , _div("class:clear")),
            contents, _br(), _br());
}

/**
 *
 * @param id
 * @param contents
 * @param opts   --- 	isBuildTable:true or false
 * 						level: Filedset header level candidates are 0, 4,5, if set to 0, no fieldtitle set.
 * @returns
 */
function fieldset(id, contents, opts) {
	if (!_.isArray(contents)) {$.logError("fieldset arguement contents must be an Array type.");return null;}
    var optFielset = {label:id,
    		isBuildTable:false,
			class:"common_fieldset",
    		level:4};
    var opt = buildOptions(id, _.extend(optFielset, opts)); if (!opt) {return null;}
    var label = opt.label;

    var headline = null;

    if (opt.level ==5 ) {
    	headline = _h5("id:label_"+id,"text:{{" + label+"}}");
    }else if (opt.level == 4){
    	headline = _h4("id:label_"+id,"text:{{" + label+"}}", _a("class:td_tiptool",(opt.HelpTxtHead)?helpTag(id, label, opt.helpText):null));
    }else if (opt.level == 6){
    	headline = _h6("id:label_"+id,"text:{{" + label+"}}");
    }
    var body = "";
    if (opt.isBuildTable){
    	body = _table("class:common_table_2", _tbody(contents));
    }else{
    	body = _div("class:"+opt.class, contents);
    }
    return _div("id:" + id, headline, body );
}

function buttons(btns, opts){
	if (!_.isArray(btns)) {$.logError("buttons arguement btns must be an Array type.");return null;}
    var opt = {class:"div_buttons" };
    _.extend(opt, opts);
    var clz = opt.class;
    var buttonClass = opt.btnClass ? opt.btnClass : "submitBtn";
    $.log("button class is " + buttonClass);

    var buttons = [];
	_.each(btns, function(arg, i){
		var btn = [];
		_.map(arg, function(value, key){
			if (_.isFunction(value)){
				btn.push(value);
			}else{
				btn.push(""+key+":"+value);
			}
		});
		 buttons.push(_input("type:button", "class:" + buttonClass, btn));
	});

	return _div("class:"+clz, buttons);
}

/**
 * Rewrite DoApply function, which inherited from ARRIS/base.js
 * @param args
 */
function DoApply(args) {
	var opt = _.extend({storeFun:(typeof storeData === "undefined")?null:storeData, storeParams:null,
			withoutApplyAllSettings:false,
			onApplyFinished:null,
			delayClose:0,
			refreshPage:true
			},args);
	try{
		$.log("DoApply, opt="+JSON.stringify( opt ));
		if (_.isFunction(opt.storeFun)){
			opt.storeFun(opt.storeParams);
		}

        if (!opt.withoutApplyAllSettings){
        	if (snmpSet_stat.total_submits>0){
                PollAndApply();
        		//MibObjects.ApplyAllSettings.set(1,"",true);
        	}
        }

        if (opt.resetCtrlsAfterApply) {
        	$.each(opt.applyHook, function (k, v) {
    			if (_.isString(v)){ // Take string arg as a Controler ID.
    				var id = v;
    				var o = ag.getObj(id);
    				ag.setValue(id, o.origValue);
    				if (o.ctrl && o.ctrl.reset){
    					o.ctrl.reset();
    				}else if (o.ctrl && o.ctrl.setValue){
    					var ov = (o.formatter)?o.formatter.format(o.origValue):o.origValue;
    					o.ctrl.setValue(ov);
    				}
    			}
    	    });
        }else{
        	$.each(opt.applyHook, function (k, v) {
    			if (_.isString(v)){ // Take string arg as a Controler ID.
    				var id = v;
    				var o = ag.getObj(id);
    				o.origValue = o.value;
    			}
    	    });
        }

        if (_.isFunction(opt.onApplyFinished) ){
        	opt.onApplyFinished();
        }

        // Delay close wait dialog to make sure that ApplyAllSettings status has been changed.
        if (opt.delayClose > 0){
            setTimeout(function(){
                WaitDialogCommon.close(opt.refreshPage);
                WaitDialogCustom.close(opt.refreshPage);
            }, opt.delayClose);
        }else{
            WaitDialogCommon.close(opt.refreshPage);
        	WaitDialogCustom.close(opt.refreshPage);
        }

        var getData = {"deviceMode": "", "dsliteMode": ""};
        data = getUserData(getData);
        var IPMode = parseInt(data['deviceMode']);
        var DSLite = parseInt(data['dsliteMode']);
        if(IPMode == 1)
        {
            if($('#IPv6Firewall').css('display') != null &&
                $('#IPv6Firewall').css('display') != 'none')
            {
                $("#IPv6Firewall").hide();
            }
        }
        else if(IPMode == 2 && (DSLite == 0) ) // IPv6 mode and DSLite Disabled
        {
            if($('#IPv4Firewall').css('display') != null &&
                $('#IPv4Firewall').css('display') != 'none')
            {
                $("#IPv4Firewall").hide();
            }
        }
        else if(IPMode == 2 && (DSLite == 1) ) // IPv6 mode and DSLite Enable
        {
            if($('#IPv4Firewall').css('display') != null &&
                $('#IPv4Firewall').css('display') != 'none')
            {
                $("#IPv4Firewall").hide();
            }
        }
        if($('#HideContentLimitation').css('display') != null &&
            $('#HideContentLimitation').css('display') != 'none')
        {
            $('#HideContentLimitation').hide();
        }
	}catch(e){
        if(args.loading != undefined && args.loading){
                WaitDialogCustom.closeImmediately(false);
            }else if(args.loading == undefined || args.loading != false){
                 WaitDialogCommon.closeImmediately(false);
            }

        if (e == "cancel"){ return;}
        if (e.msg != undefined) {
        	if (e.id && ag[e.id] && ag[e.id].formatter) {
        		ag[e.id].formatter.errMsg = e.msg;
        		showErrorTips(e.id, true);
        	}
        	if (e.id1 && ag[e.id1] && ag[e.id1].formatter) {
        		ag[e.id1].formatter.errMsg = e.msg;
        		showErrorTips(e.id1, true);
        	}
        	return;
        }
        handleError(e);
	}
}

/**
 * Rewrite Apply function, which inherited from ARRIS/base.js
 * @param args
 */
function Apply(args) {
	var opt = _.extend({applyHook:_afterApply, noWaitDialog:false}, args);
	try {
		var failedValids = 0;
		$.each(opt.applyHook, function (k, v) {
			var validator = null;
			if (_.isFunction(v) ){ // Compatible with old mechanism.
				validator = v;
			}else if (_.isString(v)){ // Take string arg as a Controler ID.
				var o = ag.getObj(v);
				if (!o.onApply || !_.isFunction(o.onApply)){
					$.logError("Error applyhook,ag["+v+"].onApply"+o.onApply); return;
				}else{
					validator = o.onApply;
				}
			}
			if (null==validator){
				$.logError("Error applyhook, v="+v); return;
			}
	        var ret = validator();
	        if (ret==false){$.log("Validation failed opt.applyHook:"+v);failedValids++;}
	    });
        if(args.dfs !=undefined && !args.dfs){
            return
        }
		if (failedValids>0){$.logError("Validation failures "+failedValids+". Break submitting.");return;} // Return back, if in any invalid value.
		if(!opt.noWaitDialog){
            if(args.loading != undefined && args.loading){
                WaitDialogCustom.open(args.loaderText);
            }else if(args.loading == undefined || args.loading != false){
                WaitDialogCommon.open();
            }
        }
	    window.setTimeout(function(){
	    	DoApply(opt);
	    }, 100);

	} catch (e) {
		$.logError("Apply error="+e);
		WaitDialogCommon.closeImmediately(false);
		WaitDialogCustom.closeImmediately(false);
        if (e != "cancel")
            handleError(e);
    }

}
function removeConfirmWizardAll(){
    $('#mainpage .errTipClose').remove();
    $(".content-container .settings-updates-success").remove();
    $(".content-container .settings-updates-error").remove();
    $(".content-container #confirm-loading-dialog").remove();
}

function removeConfirmWizard(){
    $(".content-container .settings-updates-success").remove();
    $(".content-container .settings-updates-error").remove();
    $(".content-container #confirm-loading-dialog").remove();
}

function bulkLoadAsync(load_func, callback) {
    bulkLoading = true;
    bulkList = [];
    load_func();
    bulkLoading = false;
    if (bulkList.length === 0)
        return;
    var url = hooks.buildGetURL(bulkList);
    snmpGetJsonAsync(url, function(v) {
        _.each(v, function (val, key) {
            walk[key] = val;
        });
        if(callback) {
            callback();
        }
    });
}

function snmpGetJsonAsync(url, callback, opts) {
    var outJson = {};
    snmpBaseAjax(_.extend({
        url:url,
        success:function (result) {
            outJson = JSON.parse(result);
            $.log("snmpGetJsonAsync["+url+"]:\n"+JSON.stringify(outJson));
	    if(callback) {
                callback(outJson);
	    }
        },
        dataType:"text",
        async:true,
        cache:false
    }, opts));
}

var WaitDialogCustom = new function(params){
    this.waitInterval = 1; // sec.
    this.timeout = 0; // sec.
    this.checkApplyStatus = false;
    this.checkApplyStatusInterval = 10;//sec.
    this.refreshPage = true;
    this.onCloseBefore = null;
    this.onCloseAfter = null;
    this._WaitDialogCustom = null;
    this._initialized = false;
    this._timerId = 0;
    this._timeElapsed = 0;
    this._checkApplyStatusTimerId = 0;
    this._isOpened = false;
    this.init = function(params){
        this.setParams(params);

        if (!this._initialized){
            this._WaitDialogCustom = $("#wait-dialog");
            this._initialized = true;
        }
    };
    this.open = function(params){
        if (this._timerId != 0) return;
        this.init(params);
        $('#mainpage').children().children().not(':first-child').hide();
        var loader = _div("id:confirm-loading-dialog", _div("id:loading-icon-confirm-wizard"));
        $(loader.toHTML()).appendTo($(".content-container"));
        $(".content-container #confirm-loading-dialog").prepend("</br></br></br><h6>"+xlate("ApplyingChanges")+"</h6></br></br>");
        this._isOpened = true;
        this._timerId = window.setInterval(WaitDialogCustom.onInterval, WaitDialogCustom.waitInterval * 1000);

    };
    this.setParams = function(params){
        if (params == undefined) return;
        _.each(params, function(v, k) {
            WaitDialogCustom[k] = v;
            if (k == "width"){
                $("#wait-dialog").dialog("option","width",v);
            }else if (k == "height"){
                $("#wait-dialog").dialog("option","height",v);
            }else if (k == "content"){
                $("#wait-dialog").text( WaitDialogCustom._parseMsg(v) );
            }
        });
    };

    this.onInterval = function(){
        WaitDialogCustom._timeElapsed += WaitDialogCustom.waitInterval;
        $.log("WaitDialogCustom._timeElapsed:"+WaitDialogCustom._timeElapsed);
        if (WaitDialogCustom.timeout!=0 && WaitDialogCustom._timeElapsed>WaitDialogCustom.timeout){
            WaitDialogCustom.closeImmediately();
            return;
        }
    };

    this.onCheckApplyStatusInterval = function(){
        $.log("WaitDialogCustom.onCheckApplyStatusInterval:");
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
            WaitDialogCustom.closeImmediately();
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
        $.log("WaitDialogCustom.timeout=" + this.timeout);

        if (this.checkApplyStatus){
            this._checkApplyStatusTimerId = window.setInterval(WaitDialogCustom.onCheckApplyStatusInterval, WaitDialogCustom.checkApplyStatusInterval * 1000);
        }

        if (this.timeout==0 && this._isOpened){
            this.closeImmediately(isNeedRefresh);
            this._isOpened = false;
        }
    };
    this.closeImmediately = function(isNeedRefresh){
        var getData = {"deviceMode": "", "dsliteMode": ""};
        data = getUserData(getData);
        var IPMode = parseInt(data['deviceMode']);//parseInt(attrs["provMode"]);
        var DSLite = parseInt(data['dsliteMode']);//parseInt(attrs["DSLite"]);

        removeConfirmWizard();
        $('#mainpage').children().children().not(':first-child').show();
        var confirmWizard = _div("class:settings-updates-success",
                                _div("id:confirm-wizard", "align:center",

                                    _img("width:30", "src:i/allgood-icon.svg"),
                                    _div("class:confirm-wizard-text", "text:{{SpinnerSuccess}}")
                                ));
         var confirmWizardError = _div("class:settings-updates-success settings-updates-error",
                                _div("id:confirm-wizard", "align:center",

                                    _img("width:30", "src:i/error-icon.svg"),
                                    _div("class:confirm-wizard-text", "text:{{SpinnerFailure}}")
                                ));

        if(IPMode == 1)
        {
            $("#ipv6Container").hide();
            $("#DHCPv6serverContainer").hide();
        }
        else if(IPMode == 2 && (DSLite == 0) ) // IPv6 mode and DSLite Disabled
        {
            $("#ipv4Container").hide();
            $("#DHCPv4Container").hide();
        }

	else if(IPMode == 2 && (DSLite == 1) ) // IPv6 mode and DSLite Enable
        {
            $("#ipv4Container").hide();
        }

        if($('.errTipClose').length > 0 || $('#errTip_TimeWarning').length > 0){
            $(confirmWizardError.toHTML()).insertAfter($("#mainpage .form_header"));
        }else{
            $(confirmWizard.toHTML()).insertAfter($("#mainpage .form_header"));
        }

        this.clearInterval();
        if (this.onCloseBefore && _.isFunction(this.onCloseBefore)){
            this.onCloseBefore.apply(this);
        }
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

var WaitDialogCommon = new function(params){
    this.waitInterval = 1; // sec.
    this.timeout = 0; // sec.
    this.checkApplyStatus = false;
    this.checkApplyStatusInterval = 10;//sec.
    this.refreshPage = true;
    this.onCloseBefore = null;
    this.onCloseAfter = null;
    this._WaitDialogCommon = null;
    this._initialized = false;
    this._timerId = 0;
    this._timeElapsed = 0;
    this._checkApplyStatusTimerId = 0;
    this._isOpened = false;
    this.init = function(params){
        this.setParams(params);

        if (!this._initialized){
            this._WaitDialogCommon = $("#wait-dialog");
            this._initialized = true;
        }
    };
    this.open = function(params){
        if (this._timerId != 0) return;
        this.init(params);
        $('#mainpage').children().children().not(':first-child').hide();
        var loader = _div("id:confirm-loading-dialog", _div("id:loading-icon-confirm-wizard"));
        $(loader.toHTML()).appendTo($(".content-container"));
        $(".content-container #confirm-loading-dialog").prepend("</br></br></br><h6>"+xlate("ApplyingChanges")+"</h6></br></br>")

        this._isOpened = true;
        this._timerId = window.setInterval(WaitDialogCommon.onInterval, WaitDialogCommon.waitInterval * 1000);

    };
    this.setParams = function(params){
        if (params == undefined) return;
        _.each(params, function(v, k) {
            WaitDialogCommon[k] = v;
            if (k == "width"){
                $("#wait-dialog").dialog("option","width",v);
            }else if (k == "height"){
                $("#wait-dialog").dialog("option","height",v);
            }else if (k == "content"){
                $("#wait-dialog").text( WaitDialogCommon._parseMsg(v) );
            }
        });
    };

    this.onInterval = function(){
        WaitDialogCommon._timeElapsed += WaitDialogCommon.waitInterval;
        $.log("WaitDialogCommon._timeElapsed:"+WaitDialogCommon._timeElapsed);
        if (WaitDialogCommon.timeout!=0 && WaitDialogCommon._timeElapsed>WaitDialogCommon.timeout){
            WaitDialogCommon.closeImmediately();
            return;
        }
    };

    this.onCheckApplyStatusInterval = function(){
        $.log("WaitDialogCommon.onCheckApplyStatusInterval:");
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
            WaitDialogCommon.closeImmediately();
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
        $.log("WaitDialogCommon.timeout=" + this.timeout);

        if (this.checkApplyStatus){
            this._checkApplyStatusTimerId = window.setInterval(WaitDialogCommon.onCheckApplyStatusInterval, WaitDialogCommon.checkApplyStatusInterval * 1000);
        }

        if (this.timeout==0 && this._isOpened){
            this.closeImmediately(isNeedRefresh);
            this._isOpened = false;
        }
    };
    this.closeImmediately = function(isNeedRefresh){
        var getData = {"deviceMode": "", "dsliteMode": ""};
        data = getUserData(getData);
        var IPMode = parseInt(data['deviceMode']);//parseInt(attrs["provMode"]);
        var DSLite = parseInt(data['dsliteMode']);//parseInt(attrs["DSLite"]);

        removeConfirmWizard();
        $('#mainpage').children().children().not(':first-child').show();

        if((ag.getObj("IPv4PortFiltering").currentIndex || ag.getObj("IPv6PortFiltering").currentIndex) == 1 ){
            $('#ContentLimitation').hide();
           $('.Delete_apply').hide();
        }

        if(IPMode == 1)
        {
            $("#ipv6Container").hide();
            $("#DHCPv6serverContainer").hide();
        }
        else if(IPMode == 2 && (DSLite == 0) ) // IPv6 mode and DSLite Disabled
        {
            $("#ipv4Container").hide();
            $("#DHCPv4Container").hide();
        }

	else if(IPMode == 2 && (DSLite == 1) ) // IPv6 mode and DSLite Enable
        {
            $("#ipv4Container").hide();
        }

        this.clearInterval();
        if (this.onCloseBefore && _.isFunction(this.onCloseBefore)){
            this.onCloseBefore.apply(this);
        }
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

function ApplyButton(opt) {
    return _div(_br(),buttons([{value:"{{ApplyChanges}}", func: function onclick(event) {
        Apply(opt);
    }}], {class:"div_apply_buttons"} ));
}

function createCtrlObject(id){
	var ctrl = {"id":id};
	ctrl.getValue = function(){
    	return $("#" + id ).valOrChecked();
    };
    ctrl.setValue = function(v){
    	$("#" + id ).val(v);
    };
    ctrl.reset = function(){
    	if (!ag[id]) return;
    	var f = (ag[id].opts && ag[id].opts.format)?ag[id].opts.format:null;
    	this.setValue((f!=null)?f.format(ag[id].origValue):ag[id].origValue );
    };
    ctrl.isDisabled = function(){
    	return $("#"+id ).attr("disabled");
    };
	return ctrl;
}

function text(id, opts) {
    var optText = {label:id,
            helpText: null,
    		format:formatter(),
 		   	onchange: null,
 		   	type:"text",
 		   	value:"",
 		   	readonly:false,
 		    isBuildTable:false,
 		   	class:"div_text",
 		    labelPos:"front",
            isTrimRequired:true,
            append:""};

    var opt = buildOptions(id, _.extend(optText, opts)); if (!opt) {return null;}

    var label = opt.label;
	var helpText = (opt.helpText)?opt.helpText:label+"_tt";
    var isTrimRequired = opt.isTrimRequired;
	var append = opt.append;

    var f = opt.format;
    ag.attachFormatter(id, f);

    ag.getObj(id).opts = opt;
    ag.getObj(id).ctrl = createCtrlObject(id);

    if (!ag.getObj(id).value){
    	ag.setValue(id, opt.value);
    }

    afterBuild(function() {
        $("#"+id).keyup(function(evt){
            $.logLGI("ID:"+id+"  onblur event occurs.");
            showErrorTips(id, false);
            var v = $("#" + id).valOrChecked();
            if(isTrimRequired) {
                v = v.trim();
            }
            if (!f.validate(v)) {
                // Do nothing
            }
        });
    });

    ag.getObj(id).onApply = function() {
    	if (!ag[id].ctrl.isDisabled() && !ag[id].ctrl.hidden) {
            var v = $("#" + id).valOrChecked();
            if(isTrimRequired) {
                v = v.trim();
            }
            if (!f.validate(v)) {
                showErrorTips(id, true);
                return false;
            }
            else{
                showErrorTips(id, false);
            }
            ag.setValue(id, f.unformat(v) );
            return true;
        }
    };

    if (opt.applyHook){
    	if (!_.isArray(opt.applyHook)) {$.logError("opt.applyHook is not an array.");return null;}
    	opt.applyHook.push(id);
    }

    f.label = xlate(label) + append;
    label = f.label;

    if (opt.isBuildTable){
        return _tr("id:tr_"+id,_td("width:35%", "text:{{"+((opt.withoutLabel)?null:label)+"}}"), _td(
        		_input("type:" + opt.type, "id:" + id,
                (f.size ? "size:" + f.size : null),
                ((opt.width)? "width:"+opt.width:null),
                (opt.type == "password" ? "autocomplete:off" : null),
                opt.readonly ? "readonly:readonly":null,
                opt.readonly ? "class:read_only":null,
                "value:" + htmlEscape("" + ag.getFormatedValue(id) )), _a("class:td_tiptool",(opt.withoutHelpTxt)?null:helpTag(id, label, helpText, opt.helpTextVisible)),
                opt.link ? _a("onclick:" + opt.linkAct,"class:link",_img("src:skins/lgi/css/images/arrow-blue-grad.svg", "height:12px", "width:7px"), _span("text:{{" + opt.linkText + "}}")):null)
                );
    }else{
            return _div("id:tr_"+id, "class:"+opt.class,
            (opt.withoutLabel)?null:_label("text:{{" + label+"}}"),
            _input("id:" + id, "type:" + opt.type,
            (f.size ? "size:" + f.size : null),
            (f.size ? "maxlength:" + f.size : null),
            (opt.type == "password" ? "autocomplete:off" : null),
            opt.readonly ? "readonly:readonly":null,
            opt.readonly ? "class:read_only":null,
            ((opt.width)? "width:"+opt.width:null),
            "value:" + htmlEscape("" + ag.getFormatedValue(id) )),
            (opt.withoutHelpTxt)?null:helpTag(id, label, helpText, opt.helpTextVisible));
    }

}

function checkbox(id, opts) {
	var optChkbox = {label:id,
            helpText: null,
 		   	onchange: null,
 		   	class:"div_checkbox",
 		   labelPos:"front"};

    var opt = buildOptions(id, _.extend(optChkbox, opts)); if (!opt) {return null;}

    ag.getObj(id).opts = opt;
    ag.getObj(id).ctrl = createCtrlObject(id);
    ag.getObj(id).ctrl.getValue = function(){
    	return $("#" + id ).valOrChecked();
    };
    ag.getObj(id).ctrl.setValue = function(v){
    	if (v){
    		$("#" + id ).attr("checked","checked");
    	}else{
    		$("#" + id ).attr("checked","");
    	}
    };
    ag.getObj(id).onApply = function() {
    	if (!ag[id].ctrl.isDisabled() && !ag[id].ctrl.hidden) {
    		var v = $("#" + id).valOrChecked();
            ag.setValue(id, v);
            return true;
        }
    };

    if (opt.applyHook){
    	if (!_.isArray(opt.applyHook)) {$.logError("opt.applyHook is not an array.");return null;}
    	opt.applyHook.push(id);
    }

    var label = opt.label;
    var helpText = (opt.helpText)?opt.helpText:label+"_tt";


    var l = parseLabel(label);
    var checked = ag.getValue(id);
    if (checked == undefined && opt.value != undefined){
    	ag.setValue(id, opt.value);
    	checked = ag.getValue(id);
    }

    if (opt.render && _.isFunction(opt.render)){
    	return opt.render(opt);
    }

    return _div("id:tr_"+id, "class:"+opt.class,
            _input("type:checkbox", "id:" + id, ((checked == true)?"checked:true":null), (opt.group)?"name:"+opt.group:null, opt.onchange),
            (opt.withoutLabel)?null:_label("text:{{" + label+"}}", "for:"+id),
            (opt.withoutHelpTxt)?null:helpTag(id, label, opt.helpText));
}


function radio(id, group, opts) {
    var optRadio = {label:id,
    		helpText: null,
    		group: group,
 		   	onchange: null,
 		   	class:"div_radiobox",
 		   	labelPos:"tail"};
    var opt = buildOptions(id, _.extend(optRadio, opts)); if (!opt) {return null;}
    if (opt.withoutHelpTxt && !opts.class){
    	opt.class = "div_radiobox_without_tt";
    }

    var grpObj = ag.getObj(opt.group);
    if (!grpObj.opts) grpObj.opts = opt;
    if (!grpObj.ctrl) {
    	grpObj.ctrl = createCtrlObject(opt.group);
    	grpObj.ctrl.getValue = function(){
    		if (grpObj.members) {
    			for (var i=0; i<grpObj.members.length; i++) {
    				if ($("#" + grpObj.members[i] ).attr("checked")) {
    					return $("#" + grpObj.members[i] ).val();
    				}
    			}
    		}
    		return null;
    	};
    	grpObj.ctrl.setValue = function(v){
    		if (grpObj.members) {
    			for (var i=0; i<grpObj.members.length; i++) {
    				if ($("#" + grpObj.members[i] ).val() == v) {
    					$("#" + grpObj.members[i] ).attr("checked","checked");
    					return;
    				}
    			}
    		}
    	};
    	grpObj.ctrl.isDisabled = function(){
    		if (grpObj.members) {
    			for (var i=0; i<grpObj.members.length; i++) {
    				if (! $("#" + grpObj.members[i] ).attr("disabled") ) {
    					return false;
    				}
    			}
    			return true;
    		}
    		return false;
    	};

    }
    if (!grpObj.members) grpObj.members = [];
    grpObj.members.push(id);

    grpObj.onApply = function() {
    	if (!grpObj.ctrl.isDisabled() && !grpObj.ctrl.hidden) {
    		if (grpObj.members) {
    			for (var i=0; i<grpObj.members.length; i++) {
    				if ($("#" + grpObj.members[i] ).attr("checked")) {
    					ag.select(opt.group, grpObj.members[i]);
    					ag.setValue(opt.group, $("#" + grpObj.members[i] ).val());
    					return true;
    				}
    			}
    		}
            return true;
        }
    };

    if (opt.applyHook) {
    	opt.applyHook.push(opt.group);
    }

    var label = opt.label;
    var helpText = (opt.helpText)?opt.helpText:label+"_tt";

    var l = parseLabel(label);
    var v = ag.getValue(id);
    if (!v && opt.value != undefined){
    	v = opt.value;
    }
    var checked = (ag.getValue(opt.group) == v);

    return _div("id:tr_"+id, "class:"+opt.class,
            _input("type:radio", "id:" + id, (checked?"checked:true":null), "value:"+v, "name:"+opt.group, opt.onchange),
            (opt.withoutLabel)?null:_label("text:{{" + label+"}}", "for:"+id),
            (opt.withoutHelpTxt)?null:helpTag(id, label, opt.helpText));
}


function select(id, vals, opts) {
	if (!_.isArray(vals)) {$.logError("select arguement vals must be an Array type.");return null;}
    var optSelect = {label:id,
    		helpText: null,
    		selectedValue: null,
 		   	onchange: null,
 		   	class:"div_select",
 		   	labelPos:"tail"};
    var opt = buildOptions(id, _.extend(optSelect, opts)); if (!opt) {return null;}

    ag.getObj(id).opts = opt;
    ag.getObj(id).ctrl = createCtrlObject(id);
    ag.getObj(id).onApply = function() {
    	if (!ag[id].ctrl.isDisabled() && !ag[id].ctrl.hidden) {
    		var v = $("#" + id).valOrChecked();
            ag.setValue(id, v);
            return true;
        }
    };

    if (opt.applyHook){
    	if (!_.isArray(opt.applyHook)) {$.logError("opt.applyHook is not an array.");return null;}
    	opt.applyHook.push(id);
    }

    var label = opt.label;
    var helpText = (opt.helpText)?opt.helpText:label+"_tt";

    vals = _.without(vals, null);
    var l = parseLabel(label);
    var selectedVal = opt.selectedValue || ag.getValue(id);
    if (!selectedVal){
    	selectedVal = _.values(vals[0])[0];
    	ag.setValue(id, selectedVal);
    }

    var options = _.map(vals, function(optv, index) {
        var optstr = null;
    	_.map(optv, function( val, key){
        	if (val == selectedVal) {
        		optstr = _option("value:" + val, "text:" + htmlEscape(xlate(key)), "selected:selected");
        	}else {
        		optstr = _option("value:" + val, "text:" + htmlEscape(xlate(key)));
        	}
        });
    	return optstr;
    });


    if (opt.isBuildTable){
        return _tr("id:tr_"+id,_td("width:35%", "text:{{"+((opt.withoutLabel)?null:label)+"}}"), _td(
               _select("id:" + id, options, opt.onchange),
    		_a("class:td_tiptool",(opt.withoutHelpTxt)?null:helpTag(id, label, opt.helpText))) );
        }
    else{
    return _div("id:tr_"+id, "class:"+opt.class,
            (opt.withoutLabel)?null:_label("text:{{" + label+"}}"),
            _select("id:" + id, options, opt.onchange),
    		(opt.withoutHelpTxt)?null:helpTag(id, label, opt.helpText));
    }
}

function statictext(id, opts) {
    var optStatic = {label:id,
    		helpText: null,
    		format:formatter(),
 		   	class:"div_statictext",
 		   	labelPos:"front"};
    var opt = buildOptions(id, _.extend(optStatic, opts)); if (!opt) {return null;}

    var label = opt.label;
    var helpText = (opt.helpText)?opt.helpText:label+"_tt";

    var f = opt.format;
    ag.attachFormatter(id, f);

    if (opt.isBuildTable){
        return _tr("id:tr_"+id,_td("width:35%", "text:{{"+((opt.withoutLabel)?null:label)+"}}"), _td(
        		_span("id:" + id, "text:" + htmlEscape("" + ag.getFormatedValue(id) ) ), _a("class:td_tiptool",(opt.withoutHelpTxt)?null:helpTag(id, label, helpText))) );
        }
    else{
    return _div("id:tr_"+id, "class:"+opt.class,
            (opt.withoutLabel)?null:_label("text:{{" + label+"}}"),
            _span("id:" + id, "text:" + htmlEscape("" + ag.getFormatedValue(id) ) ),
            (opt.withoutHelpTxt)?null:helpTag(id, label, opt.helpText));
        }
}

function button(id, opts) {
    var optBtn = {label:id,
 		   	class:"submitBtn",
    		withoutHelpTxt:true };
    var opt = buildOptions(id, _.extend(optBtn, opts)); if (!opt) {return null;}

    var val = opt.value?opt.value:opt.label;
    var id = opt.id;

    var btn = [];
	_.map(opt, function(value, key){
		if (_.isFunction(value)){
			btn.push(value);
		}
	});

    return _div("id:tr_"+id,
            _input("id:" + id, "type:button", "value:"+xlate(val), "class:"+opt.class, btn),
            (opt.withoutHelpTxt)?null:helpTag(id, opt.label, opt.helpText));
}

/**
 * Clone and extend the obj.
 */
_.cloneExtend = function(obj) {
	var o =_.clone(obj);
	_.extend(o,arguments[1]);
	return o;
};
/**
 * Controller of Mac Address.
 * @param id
 * @param opts
 * @returns
 */
function ctrlMacAddress(id, opts) {
    var _opt = {label: id,
                class: "ctrl_macAddress",
                format:fmtMacAddr(),
                withoutHelpTxt: true };
    var opt = buildOptions(id, _.extend(_opt, opts)); if (!opt) {return null;}


    var label = opt.label;
    var helpText = (opt.helpText)?opt.helpText:label+"_tt";

    var f = opt.format;
    ag.attachFormatter(id, f);

    ag.getObj(id).opts = opt;
    ag.getObj(id).ctrl = {};
    ag.getObj(id).ctrl.getValue = function(){
    	var fStr = $("#" + id+"_0").valOrChecked();
    	for (var i=1; i<6; i++){
    		fStr += ":"+$("#" + id+"_"+i).valOrChecked();
    	}
    	return fStr;
    };
    ag.getObj(id).ctrl.setValue = function(v){
        var arr = v.split(":");
        if (arr.length!=6){
        	$.logError(v + " is invalid MAC.");
        }
    	for (var i=0; i<6; i++){
    		$("#" + id+"_"+i).val(arr[i]);
    	}
    };
    ag.getObj(id).ctrl.reset = function(){
    	this.setValue(f.format(ag[id].origValue) );
    };
    ag.getObj(id).ctrl.isDisabled = function(){
    	return $("#"+id +" :input").attr("disabled");
    };

    var val = ag.getFormatedValue(id);
    if (!val || val.split(":").length!=6){
    	val = "00:00:00:00:00:00";
    	ag.setValue(id, f.unformat(val));
    }
    var arr = [];
    var arrIP = val.split(":");
    if (arrIP.length!=6){
    	$.logError(val + " is invalid MAC.");
    }
    for (var i=0; i<6; i++){
    	arr.push(_input("id:"+id+"_"+i,"type:text","maxlength:2","macIndex:"+i,"width:30", "value:"+arrIP[i]));
    	if (i!=5){
        	arr.push(_span("class:span_dot", "text:{{:}}") );
        }
    }

    function isValidMacCh(v){
    	return /^[0-9A-Fa-f][0-9A-Fa-f]$/.test(v);
    }
    function validateInputValue(){
        var errFlags = 0;
    	for (var i=0; i<6; i++){
            var v = $("#" + id+"_"+i).valOrChecked();

            if (!isValidMacCh(v)) {
            	errFlags |= 1<<i;
            	showErrorTips(id+"_"+i, true, {maskShow:1});
            }else{
            	errFlags &= ~(1<<i);
            	showErrorTips(id+"_"+i, false, {maskShow:1});
            }

    	}

    	var fStr = "";
    	for (var i=0; i<6; i++){
    		var v = $("#" + id+"_"+i).valOrChecked();
			fStr += v;
			if (i!=5) fStr += ":";
    	}
    	var isFmtValid = f.validate(fStr);

    	if (errFlags != 0 || !isFmtValid) {
    		var _left = $("#" + id+"_"+0).offset().left - $("#" + id ).offset().left;
			showErrorTips(id, true, {maskShow:2, ctrl:$("#"+id), errTipPos:{left:_left} });
			fStr ="";
    	}else{
    		showErrorTips(id, false, {maskShow:2, ctrl:$("#"+id)});
    	}
    	return fStr;
    }
    afterBuild(function() {
    	for (var i=0; i<6; i++){
			$("#" + id+"_"+i).blur(function(evt){
				validateInputValue();
			});
    	}
    });

    ag.getObj(id).onApply = function() {
        if (!ag[id].ctrl.isDisabled() && !ag[id].ctrl.hidden) {
        	var fStr = validateInputValue();
        	if ("" == fStr){
        		return false;
        	}else{
        		ag.setValue(id, f.unformat(fStr) );
        		return true;
        	}

        }
    };

    if (opt.applyHook){
    	if (!_.isArray(opt.applyHook)) {$.logError("opt.applyHook is not an array.");return null;}
    	opt.applyHook.push(id);
    }

    return _div("id:"+id, "class:"+opt.class,
            (opt.withoutLabel)?null:_label("text:{{" + label+"}}"),
            arr,
            (opt.withoutHelpTxt)?null:helpTag(id, label, opt.helpText) );

}
/**
 * Controller of IPv4 Address.
 * @param id
 * @param opts
 * @returns
 */
function ctrlIPv4Address(id, opts) {
    var _opt = {label: id,
                class: "ctrl_ipv4Address",
                format:fmtIPv4(),
                withoutHelpTxt: true,
                maskFieldEditable:15                  // editable, 1: section1, 2:section2, 4:section3, 8:section4, 15, all of them are editable
                };
    var opt = buildOptions(id, _.extend(_opt, opts)); if (!opt) {return null;}

    var label = opt.label;
    var helpText = (opt.helpText)?opt.helpText:label+"_tt";

    var f = opt.format;
    ag.attachFormatter(id, f);

    ag.getObj(id).opts = opt;
    ag.getObj(id).ctrl = {};
    ag.getObj(id).ctrl.getValue = function(){
    	var fStr = "";
    	for (var i=0; i<4; i++){
    		var v = $("#" + id+"_"+i).valOrChecked();
    		var mask = 1 << i;
            if (!(opt.maskFieldEditable & mask)){
            	v = $("#" + id+"_"+i).text();
            }
			fStr += v;
			if (i!=3) fStr += ".";
    	}
    	return fStr;
    };
    ag.getObj(id).ctrl.setValue = function(v){
        var arrIP = v.split(".");
        if (arrIP.length!=4){
        	$.logError(v + " is invalid IPv4.");
        }
    	for (var i=0; i<4; i++){
    		var mask = 1 << i;
            if (!(opt.maskFieldEditable & mask)){
            	$("#" + id+"_"+i).text(arrIP[i]);
            }else{
            	$("#" + id+"_"+i).val(arrIP[i]);
            }
    	}
    };
    ag.getObj(id).ctrl.reset = function(){
    	this.setValue(f.format(ag[id].origValue) );
    };
    ag.getObj(id).ctrl.isDisabled = function(){
    	return $("#"+id +" :input").attr("disabled");
    };

    var val = ag.getFormatedValue(id);
    if (!val || val.split(".").length!=4){
    	val = "0.0.0.0";
    }
    var arr = [];
    var arrIP = val.split(".");
    if (arrIP.length!=4){
    	$.logError(val + " is invalid IPv4.");
    }
    for (var i=0; i<4; i++){
    	var mask = 1 << i;
    	$.log("opt.maskFieldEditable="+opt.maskFieldEditable+"; mask="+mask+"; ==>" + (opt.maskFieldEditable & mask));
        if (opt.maskFieldEditable & mask){
        	arr.push(_input("id:"+id+"_"+ i,"type:text","maxlength:3","width:36", "value:"+arrIP[i]));
        }else{
        	arr.push(_span("class:span_digit","id:"+id+"_"+i, "text:"+arrIP[i]) );
        }
        if (i!=3){
        	arr.push(_span("class:span_dot", "text:{{.}}") );
        }
    }

    function isValidIpCh(v){
    	return /^[0-9]{1,3}$/.test(v);
    }
    function validateInputValue(){
        var errFlags = 0;
    	for (var i=0; i<4; i++){
            var v = $("#" + id+"_"+i).valOrChecked();
            var mask = 1 << i;
            if (!(opt.maskFieldEditable & mask)){
            	continue;
            }
            if (!isValidIpCh(v)) {
            	errFlags |= 1<<i;
            	showErrorTips(id+"_"+i, true, {maskShow:1});
            }else{
            	errFlags &= ~(1<<i);
            	showErrorTips(id+"_"+i, false, {maskShow:1});
            }

    	}

    	var fStr = "";
    	for (var i=0; i<4; i++){
    		var v = $("#" + id+"_"+i).valOrChecked();
    		var mask = 1 << i;
            if (!(opt.maskFieldEditable & mask)){
            	v = $("#" + id+"_"+i).text();
            }
			fStr += v;
			if (i!=3) fStr += ".";
    	}
    	var isFmtValid = f.validate(fStr);

    	if (errFlags != 0 || !isFmtValid) {
    		var _left = $("#" + id+"_"+0).offset().left;// - $("#" + id ).offset().left;
    		showErrorTips(id, true, {maskShow:2, ctrl:$("#"+id)/*, errTipPos:{left:_left}*/ });
			fStr ="";
    	}else{
    		showErrorTips(id, false, {maskShow:2, ctrl:$("#"+id)});
    	}
    	return fStr;
    }

    afterBuild(function() {
    	for (var i=0; i<4; i++){
    		var mask = 1 << i;
            if (!(opt.maskFieldEditable & mask)){
            	continue;
            }
			$("#" + id+"_"+i).blur(function(evt){
				validateInputValue();
			});
    	}
    });

    ag.getObj(id).onApply = function() {
        if (!ag[id].ctrl.isDisabled() && !ag[id].ctrl.hidden) {
        	var fStr = validateInputValue();
        	if ("" == fStr){
        		return false;
        	}else{
        		ag.setValue(id, f.unformat(fStr) );
        		return true;
        	}

        }
    };

    if (opt.applyHook){
    	if (!_.isArray(opt.applyHook)) {$.logError("opt.applyHook is not an array.");return null;}
    	opt.applyHook.push(id);
    }

    return _div("id:"+id, "class:"+opt.class,
            (opt.withoutLabel)?null:_label("text:{{" + label+"}}"),
            arr,
            (opt.withoutHelpTxt)?null:helpTag(id, label, opt.helpText) );

}

function ctrlIPv6Address(id, opts) {
    var _opt = {label: id,
                class: "ctrl_macAddress",
                format: fmtIPv6(),
                withoutHelpTxt: true };
    var opt = buildOptions(id, _.extend(_opt, opts)); if (!opt) {return null;}
    var label = opt.label;
    var helpText = (opt.helpText)?opt.helpText:label+"_tt";
    var f = opt.format;
    ag.attachFormatter(id, f);
    ag.getObj(id).opts = opt;
    ag.getObj(id).ctrl = {};

    var prefixAddr = js_lan_start_dhcp_v6; //hexToIpv6(arLanStartDHCPV6.get(getPrimaryLAN()));
    var prefixLen = js_lan_prefix_length_v6; //arLanPrefixLengthV6.get(getPrimaryLAN())
    var prefixBytes = prefixLen/16;

    ag.getObj(id).ctrl.reset = function() {
        for (var i=0; i<8; i++){
            if(opt.prefix && i<prefixBytes) {
                continue;
            }
            $("#"+ id +"_" +i).val("");
        }
    };

    var val = ag.getFormatedValue(id);
    var arr = [];

    if(opt.prefix){
        if (!val || val == "::"){
            val = prefixAddr + ":::"
            ag.setValue(id, f.unformat(val));
        }

        var arrIP = val.split(":");
        var arrIP0 = prefixAddr.split(":");
        var arrIP0 = arrIP0.slice(0,prefixBytes);

        for(var i=0; i<prefixBytes; i++){
           if(arrIP0[i] != undefined && arrIP0[i] != "") {
               arr.push(_span("class:span_digit","id:"+id+"_"+i, "text:"+arrIP0[i]));
           } else {
               arr.push(_span("class:span_digit","id:"+id+"_"+i, "text:"+ "0"));
               arrIP0[i] = "0"
           }
           arr.push(_span("class:span_dot", "text:{{:}}") );
        }

        prefixAddr = arrIP0.join(":");
        prefixAddr = prefixAddr + ":";
    } else {
        if (!val || val == "::"){
            val = ":::::::"
            ag.setValue(id, f.unformat(val));
        }
        var arrIP = val.split(":");
        prefixBytes = 0;
    }

    for (var i=prefixBytes; i<8; i++){
        arr.push(_input("id:"+id+"_"+i,"type:text","maxlength:4","macIndex:"+i,"width:45", "value:"+arrIP[i]));
        if (i!=7){
            arr.push(_span("class:span_dot", "text:{{:}}") );
        }
    }

    function isValidIP(v){
        return /^[0-9A-Fa-f]+$/.test(v);
    }

    function validateInputValue(){
        var errFlags = 0;
        var fStr;

        if(opt.prefix) {
            fStr = prefixAddr;
        } else {
            fStr = "";
        }

        for (var i=0; i<8; i++){
            if(opt.prefix == true && i<prefixBytes) {
                continue;
            }
            var v = $("#" + id+"_"+i).valOrChecked().trim();
            if (opt.type == "range" && i != 0 && (v == undefined || v.trim() == "")) {
                v = 0;
            }
            fStr += v;
            if (i!=7) {
                fStr += ":";
            }
            if (!isValidIP(v)) {
                errFlags |= 1<<i;
                showErrorTips(id+"_"+i, true, {maskShow:1});
            } else {
                errFlags &= ~(1<<i);
                showErrorTips(id+"_"+i, false, {maskShow:1});
            }
        }

        var isFmtValid = f.validate(fStr);
        if (errFlags != 0 || !isFmtValid) {
            var _left = $("#" + id+"_"+0).offset().left - $("#" + id ).offset().left;
            showErrorTips(id, true, {maskShow:2, ctrl:$("#"+id), errTipPos:{left:_left} });
            fStr ="";
        }else{
            showErrorTips(id, false, {maskShow:2, ctrl:$("#"+id)});
        }
        return fStr;
    }

    afterBuild(function() {
        for (var i=0; i<8; i++) (function(i) {
            $("#" + id+"_"+i).blur(function(evt){
                var v = $("#" + id+"_"+i).valOrChecked().trim();
                if (isValidIP(v)) {
                    showErrorTips(id+"_"+i, false, {maskShow:1});
                }
                showErrorTips(id, false, {maskShow:2, ctrl:$("#"+id)});
            });
        })(i);
    });

     ag.getObj(id).onApply = function() {
         if ( ag[id].ctrl.validate && !ag[id].ctrl.hidden) {
             var fStr = validateInputValue();
             if ("" == fStr){
                 return false;
             } else {
                 ag.setValue(id, f.unformat(fStr) );
                 return true;
             }
         }
    };

    if (opt.applyHook){
        if (!_.isArray(opt.applyHook)) {$.logError("opt.applyHook is not an array.");return null;}
        opt.applyHook.push(id);
    }

    return _div("id:"+id, "class:"+opt.class, "style:padding-bottom:50px;",
               (opt.withoutLabel)?null:_label("text:{{" + label+"}}", "style:padding-right:30px"),
                arr,
               (opt.withoutHelpTxt)?null:helpTag(id, label, opt.helpText) );
}


/**
 * Controller of Table.
 * @param id
 * @param opts
 * @returns
 */
function ctrlTable(id,opts){
	var _opt = {label:id,
 		   	class:"common_table",
 		    loadData: null,					// Load table data.
    		customizeHeader: null,
    		columns:[],
    		emptyTips:null,					// Empty data tips. shows when the data is empty.
 		    withoutHelpTxt:true };
    var opt = buildOptions(id, _.extend(_opt, opts)); if (!opt) {return null;}

    var obj = ag.getObj(id);
    if (null!=opt.loadData) obj.loadData = opt.loadData;
    if (obj.loadDataAsync) obj.asyncLoad = true;
    obj.load = function(bForce){
    	if (obj.loadData){
    		obj.data = obj.loadData(bForce);
    	}
    };
    obj.columns = {};

	function getBodyHtml() {
	    var body = [];
	    if (!obj.data) obj.data=[];
	    if (!obj.columns){
	    	_.map(obj.columns, function(v, k){
	    		_.each(v.dataObjs, function(id){
	    			delete ag[id];
	    		});
	    	});
	    	obj.columns = {};
	    }
		_.each(obj.data, function(v, i) {
			var tds = [];

	    	_.each(opt.columns, function(col, colIdx){
	    		var td = [];
	    		var colName = col.name?col.name:col.text;
	    		var colType = col.type;
	    		if (colType == "checkbox"){
                    var cellId = id+"-"+colName+"-"+i;

                    if(id == "portForwardingTable"){

                        if(v[colIdx] == "isUpNp"){

                             td.push(_td("id:"+cellId,"colspan:3","text:"+ xlate("upnpAdded")));


                        }else if(v[colIdx] != "Ignore"){

                            td.push(_td(
                                checkbox(cellId, _.extend({"group":colName, "value":(v[colIdx]==1 ? true : false), render:function(opt){
                                        return _input("type:checkbox", "id:"+cellId, "name:"+colName, (opt.value?"checked:checked" : null), opt.onchange );
                                }}, col) )
                                ));
                        }

                    }else{
                        td.push(_td(
                             checkbox(cellId, _.extend({"group":colName, "value":(v[colIdx]==1 ? true : false), render:function(opt){
                                       return _input("type:checkbox", "id:"+cellId, "name:"+colName, (opt.value?"checked:checked" : null), opt.onchange );
                               }}, col) )
                               ));
                    	}
                        if (!obj.columns[colName]) obj.columns[colName] = {dataObjs:[]};
	    		    obj.columns[colName].dataObjs.push(cellId);
	    		}else if (col.render){
	    			if (!_.isFunction(col.render)){
	    				$.logError("ctrlTable: col.render is none-function. col.render="+col.render);
	    				td.push(_td("text:"+ v[colIdx]));
	    			}else{
	    				td.push(_td(col.render( v[colIdx] )) );
	    			}
	    		}else{
	    			td.push(_td("text:"+ v[colIdx]));
	    		}
	    		tds.push(td);
	        });
	        body.push( _tr("class:dataRow", tds ) );
	    });
        if(obj.asyncLoad)
        {
            body.push( _tr("class:dataRow", _td("colspan:"+opt.columns.length, "align:center", "text:"+xlate("Updating.."),
                _img("src:skins/lgi/css/images/loading.gif", "height:20px", "width:20px", "class:skipSVG")) ) );
        }
		else if (body.length == 0 && opt.emptyTips!=null){
			body.push( _tr("class:dataRow", _td("colspan:"+opt.columns.length, "align:center", "text:"+xlate(opt.emptyTips)) ) );
		}
		return body;
	};

    obj.reload = function(bForce){
    	$.logLGI("ctrlTable["+id+"].reload("+bForce+") ...");
    	var _bForce = (bForce != undefined)? bForce:true;
    	this.load(_bForce);

    	$("#"+id+"_body").empty();
    	var trHtmls = getBodyHtml();
    	var trs = "";
    	_.each(trHtmls, function(v, i) {
    		trs += v.toHTML();
    	});

    	$("#"+id+"_body").append(trs);
    	$("#"+id+"_body").NiceIt();
    };

    obj.reloadAsync = function(bForce){
        $.logLGI("ctrlTable["+id+"].reloadAsync("+bForce+") ...");
        var _bForce = (bForce != undefined)? bForce:true;
        if(obj.asyncLoad) return;
        if(this.loadDataAsync)
        {
            obj.asyncLoad = true;
            obj.data.length = 0;
            obj.redrawTable(true);

            obj.asyncLoad = true;
            this.loadDataAsync(_bForce);
        }
    };

    obj.redrawTable = function(asyncLoading){
        if(!asyncLoading) obj.asyncLoad = false;

        $("#"+id+"_body").empty();
        var trHtmls = getBodyHtml();
        var trs = "";
        _.each(trHtmls, function(v, i) {
            trs += v.toHTML();
        });

        $("#"+id+"_body").append(trs);
        $("#"+id+"_body").NiceIt();
    }


    var headers = null;
    if (opt.customizeHeader != null){
    	headers = opt.customizeHeader;
    }else{
    	var ths = [];
    	_.each(opt.columns, function(col, i){
    		var th = [];
    		_.map(col, function(value, key){
    			if (key=="type" || key=="render") return;
    			if (key=="text" || key=="name"){
    				th.push(""+key+":"+xlate(value));
    			}
    		});
    		ths.push(_th(th));
        });
    	headers = _tr("class:dataRow", ths );
    }

    return _table("id:"+id, "class:"+opt.class,
            _thead(
            	headers
			),
            _tbody("id:"+id+"_body",
            	getBodyHtml()
            )
        );


}
/**
 * Layout as Cards.
 * @param id
 * @param elements	array of cards
 * @param opts
 */
function layoutCard(id, elements, opts) {
	if (!_.isArray(elements)) {$.logError("layoutCard: arguement elements must be an Array type.");return null;}
    var _opt = {label:id,
 		   	class:"layout_card",
 		   	defaultDisplayIndex:0,
    		withoutHelpTxt:true };
    var opt = buildOptions(id, _.extend(_opt, opts)); if (!opt) {return null;}

    var obj = ag.getObj(id);
    obj.show = function(index){
    	if (index<0 || index>=elements.length){$.logError("layoutCard: index "+index+" is out of range.");return;}
    	//var htmlObj = $("#"+id+"_card_"+index);
    	_.each(elements, function(elem, i){
        	if (i != index){
        		$("#"+id+"_card_"+i).hide();
        	}else{
        		$("#"+id+"_card_"+i).show();
        	}
        });
    };
    obj.currentIndex = 0;
    obj.showPrev = function(){
    	obj.currentIndex --; if (obj.currentIndex<0) obj.currentIndex=0;
    	this.show(obj.currentIndex);
    };
    obj.showNext = function(){
    	obj.currentIndex ++; if (obj.currentIndex>elements.length-1) obj.currentIndex=elements.length-1;
    	this.show(obj.currentIndex);
    };
    obj.store = function(opts){
    	Apply(opts);
    };
    var htmlObjs = [];
    _.each(elements, function(elem, i){
    	var display = null;
    	if (i != opt.defaultDisplayIndex){
    		display = "style:display:none;";
    	}else{
    		obj.currentIndex = i;
    	}
    	htmlObjs.push(_div("id:"+id+"_card_"+i, display, elem) );
    });

    return _div("id:"+id, htmlObjs);
}


function dialog(id, title, elements, okName, okAction, opts) {

    window["dialog_" + id] = {
        autoOpen: false, width:500, modal: true,
        dialogClass: "fieldgrp",
        open: function(){
    		$('.ui-dialog-buttonpane').find('button').attr("class",'submitBtn');
    	},
        buttons: [
            {
            	text:xlate(okName),
            	click: function(){
	            	try {
	                    okAction.apply(this);
	                } catch (e) {
	                    handleError(e);
	                }
            	},
            	class: "submitBtn"
            },{
            	text:xlate("Cancel"),
            	click: function(){
            		$(this).dialog("close");
            	}
            }
        ]
    };

    return _div("id:" + id, "class:div_dialog", "title:" + xlate(title), _table("class:common_table_2", _tbody(elements)));
}
var _dialog_afterBuild = [];
function dialog_afterBuild(f){
	_dialog_afterBuild.push(f);
}
// Dialog for wizard.
function wz_dialog(id, opts) {
	var optDef = {autoOpen:true,
				pageId: null,
				modal: true,
				resizable:false,
				draggable:false,
				width:690,
				minHeight:519,
				noTitleBar:false,
				dialogClass:"wz_dialog",
				show:{effect:"fadeIn",delay:1000}
				};
	var opt = _.extend(optDef, opts);
	if (!opt.pageId){
		$.logError("For now, it only support renderring from sperate module JS file.");
		return;
	}
	var dom = $("#"+id).get(0);
	$.logLGI("wz_dialog: dom="+dom);
	if (!dom){
		$.logLGI("Not found #"+id+", create new one.");
		$(_div("id:"+id, "style:display:hidden").toHTML()).appendTo("body");
	}
	opt.open = function(){
		$.logLGI("wz_dialog open...");
		$("#"+id).empty();
		$(".ui-widget-overlay").addClass("overlay");
		var d = $("#"+id).parent();

		d.css("top","40px");
                if(isVM()){
                    var curm = getCurMenu();
                    if (curm && curm["display"]=="wizard" && (((!isLoggedIn())&&curm["noAuth"]) || isLoggedIn()) ||
                        curm && curm["display"]=="blank" && (((!isLoggedIn())&&curm["noAuth"]) || isLoggedIn()) )
                        d.css("font-family","Lato-Light");
                }
                if(isZiggo()){
                    var curm = getCurMenu();
                    if (curm && curm["display"]=="wizard" && (((!isLoggedIn())&&curm["noAuth"]) || isLoggedIn()) ||
                        curm && curm["display"]=="blank" && (((!isLoggedIn())&&curm["noAuth"]) || isLoggedIn()) )
                        d.css("font-family","Lato-Regular");
                }
		d.removeClass("ui-corner-all");
		if (opt.noTitleBar){
			d.find(".ui-dialog-titlebar").remove();
		}else{
			var tbar =d.find(".ui-dialog-titlebar");
			tbar.find("span").remove();
			tbar.addClass("wz_titlebar");
                        $(".ui-button").css("visibility","hidden");
                        tbar.append('<div class="ui-dialog-titlebar wz_titlebar"><div style="right: 0px;height: 45px;text-align: right;"><a onclick="handleDiagClose();"><img src="i/close.png" style="float:left; margin-top: 0px;"><div style="float: right;padding: 10px 15px 0px;font-size: 28px;color: #666;background: #fff;margin-left: 2px;height: 35px;">'+xlate("Close")+'</div></a></div></div>');
		}
		$(document).scrollTop(0);

		if (opt.pageId){
			$.logLGI("Loading opt.pageId="+opt.pageId);
			var url = "/"+opt.pageId+".js";
			$.getScript(url, function(res){
				renderDialog();
			}).fail(function(){
				//$.logError("Load module file: " + url + " failed.");
				//errorMsg("Load module file: " + url + " failed.");
                                //reload the script
                                $.getScript(url, function(res){renderDialog();});
			});
		}

	};
	opt.beforeClose = function(){
		/*$.logLGI("wz_dialog close...");
		$(".ui-widget-overlay").removeClass("overlay");
		_dialog_afterBuild.splice(0,_dialog_afterBuild.length);
		if(dialog_beforeClose != undefined) dialog_beforeClose();*/
                setDiagCloseRequest();

                $(".ui-dialog-titlebar").css("visibility","hidden");

                return false;
	};
	if (opt.autoOpen) {
		$("#"+id).dialog(opt);
	}

	function renderDialog(){
		if (dialog_loadData != undefined) dialog_loadData();
		var con = (dialog_build != undefined)? dialog_build():null;
		$("#"+id).empty();
		if (!con){
			$.logError("Could not found dialog_build function.");
			errorMsg("ModuleInvalid");
		}else{
			$("#"+id).append(con.toHTML());
		}

	    $.each(_dialog_afterBuild, function(k, v) {
	        v();
	    });

	}
	function errorMsg(msg){
		$("#"+id).empty();
		$("#"+id).append(_div("text:"+xlate(msg)).toHTML());
	}
}

// function to close the diagnostic wizard
function closeDiagnostics()
{
    var itId = ag.getValue("iterationId");

    $(".ui-widget-overlay").removeClass("overlay");
    _dialog_afterBuild.splice(0,_dialog_afterBuild.length);
    $(".wz_dialog").remove();
    $("#wizard_dialog").remove();
    if (tmrId != 0)
    {
        clearTimeout(tmrId);
    }
    ++itId;
    ag.setValue("iterationId", itId);
}

function ctrlProcessIndicator(id, opts){
    var optDef = {
 		   	class:"wz_process_indicator",
 		   	outlineClass:"wz_process_ind_outline",
 		   	innerClass:"wz_process_ind_cycle",
 		   	style:"red", //red, green
			contentInit: xlate(opts.text) + _p("").toHTML(),
 		   	contentRunning: "{pos}%<br/><p>",
 		   	contentDone: "{pos}%<br/><p>"
 		   		};
    var opt = buildOptions(id, _.extend(optDef, opts)); if (!opt) {return null;}
    //ag.getObj(id).opts = opt;
    ag.getObj(id).pos = 0;
    ag.getObj(id).status = "success";
    ag.getObj(id).setPos = function (pos){
    	this.pos = pos;
    	updateMsg();
    };
    ag.getObj(id).getPos = function (){
    	return this.pos;
    };
    ag.getObj(id).start = function (){
    	this.pos = 0;
    	updateMsg();
    };
    ag.getObj(id).pause = function (){
    	updateMsg();
    };
    ag.getObj(id).stop = function (){
    	this.setPos(0);
    };
    ag.getObj(id).done = function (rs){
    	if (rs=="error"){
    		this.status = "error";
    		this.setPos(100);
    	}
    };

    function parseMsg(msg){
    	return msg.replace("{pos}",ag.getObj(id).getPos());
    }
    var startx = 0,starty=0;
    function updateMsg(){
    	var pos = ag.getObj(id).getPos();
    	var sta = ag.getObj(id).status;
    	if (pos == 0){
    		$("."+opt.innerClass+" td").html(parseMsg(opt.contentInit) );
    	}else if (pos == 100){
    		$("."+opt.innerClass+" td").html(parseMsg(opt.contentDone) );
    	}else{
    		$("."+opt.innerClass+" td").html(parseMsg(opt.contentRunning) );
    	}
    	var svg = $("#ctrlProcessOutline"+id).find("svg");
    	var centerX = parseFloat(svg.find("circle").attr("cx"));
    	var centerY = parseFloat(svg.find("circle").attr("cy"));
    	var radius = parseFloat(svg.find("circle").attr("r"))+37;

    	var arcW = 28;
    	var arc = 360*(pos)/100;
    	var arc2 = 0;
    	//var pathSel = 1;
    	//if (arc>=360) arc = 359.99999;
    	var startx = centerX, starty=centerY-radius;
    	var radians = (arc-90)*Math.PI/180;
    	if (arc >180){

    		arc2 = arc - 180;
    		//pathSel = 2;
    		//radians = (arc+90)*Math.PI/180;
    	}

    	function caculatePath(radians){
	    	$.log("cos("+radians+")="+Math.cos(radians)+"; sin("+radians+")="+Math.sin(radians));
	    	var endx = centerX + radius * Math.cos(radians);
	    	var endy = centerY + radius * Math.sin(radians);
            var largeArc = 0;

	    	var r2 = radius - arcW;
	    	var startX2 = r2 * Math.cos(radians) + centerX;
	    	var startY2 = r2 * Math.sin(radians) + centerY;

	    	var endX2 = (centerX-startx)*arcW/radius+startx, endY2=(centerY-starty)*arcW/radius + starty;

	    	var m = "M"+startx+" "+starty+" A"+radius+" "+radius+" 0 "+largeArc+" 1 "+endx+" "+endy+" L"+startX2+" "+startY2+"A"+r2+" "+r2+" 0 "+largeArc+" 0 "+endX2+" "+endY2+"  Z";
	    	return m;
    	}
    	if (arc2==0){
        	svg.find("#path_1_dyn").attr("d", caculatePath(radians));
    	}else{
    		svg.find("#path_1_dyn").attr("d", caculatePath((180-90)*Math.PI/180));
    		starty=centerY + radius;
    		svg.find("#path_2_dyn").attr("d", caculatePath((arc2+90)*Math.PI/180));

    	}
    	//$.log("arc="+arc+";centerX="+centerX+";centerY="+centerY+";radius="+radius+"; m=" + m);
    	//path = "M"+startx+","+starty+" A"+radius+","+radius+", 0, "+largeArc+",1, "+endx+","+endy;
    	//var pathId = (pathSel == 1)?"path_1_dyn":"path_2_dyn";

    	//svg.find("#"+pathId).attr("d", m);
    	if (pos==0 ){
            var i = 0;
    		svg.find("#path_1_dyn").attr("d", "");
    		svg.find("#path_2_dyn").attr("d", "");
            svg.find('stop').attr('style',"stop-color:" + gradientColors[i++]);
    	}
    	var circle = svg.find("#circle" );
    	var expectedColor = null;
    	if (pos<25){ expectedColor = cycleColors[0];}
    	else if (pos<50){ expectedColor = cycleColors[1];}
    	else if (pos<75){ expectedColor = cycleColors[2];}
    	else if (pos<100){ expectedColor = cycleColors[3];}
    	if (expectedColor != circle.attr("fill")){
    		circle.attr("class","cycle_fadeIn");
    		circle.attr("fill", expectedColor);
        }
    	if (pos==100){
    		var c = (sta == "error")?"#cc0022":"#11aa44";
    		circle.attr("class","cycle_fadeIn");
    		circle.attr("fill", c);
            svg.find('stop').attr('style',"stop-color:" + c);
    	}

    }

	var cycleColor = "#cc0022";
	var gradientColors = ["#FFBC1D","#FFA200","#FF6C16","#DB3021","#D54414","#EF5D15","#FF6C16"];
	var cycleColors = ["#ffbb1c","#ff9e02","#ff6f15","#d74614","#cc0022"];
	if (opt.style=="green"){
		cycleColor = "#11aa44";
		gradientColors = ["#DEEC14","#CDCB14","#D3CB2F","#67AD2F","#A9C82F","#A9CB2F","#D3CB2F"];
		cycleColors = ["#ddea14","#cdcc14","#d3cb2e","#a9ca2f","#11aa44"];
	}

	var outlineHtml = "<div  class=\""+opt.outlineClass+"\" id=\"ctrlProcessOutline"+id+"\" ><svg  version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"  width=\"220px\" height=\"220px\"  x=\"0px\" y=\"0px\" "+
	 "viewBox=\"0 0 595.3 595.3\" enable-background=\"new 0 0 595.3 595.3\"  xml:space=\"preserve\">";
	outlineHtml += "<defs>";

	outlineHtml += "<linearGradient id=\"SVGID_1_"+id+"\" gradientUnits=\"userSpaceOnUse\"  x1=\"429.2354\" y1=\"34.4494\" x2=\"429.2354\" y2=\"560.8306\">";
	outlineHtml += "<stop  offset=\"0\" style=\"stop-color:"+gradientColors[0]+"\"/>";
	outlineHtml += "<stop  offset=\"0.5\" style=\"stop-color:"+gradientColors[1]+"\"/>";
	outlineHtml += "<stop  offset=\"1\" style=\"stop-color:"+gradientColors[2]+"\"/>";
	outlineHtml += "</linearGradient>";

	outlineHtml += "<linearGradient id=\"SVGID_2_"+id+"\" gradientUnits=\"userSpaceOnUse\" x1=\"166.276\" y1=\"34.4494\" x2=\"166.276\" y2=\"560.8306\">";
	outlineHtml += "<stop  offset=\"0\" style=\"stop-color:"+gradientColors[3]+"\"/>"
				  +"<stop  offset=\"0.3546\" style=\"stop-color:"+gradientColors[4]+"\"/>"
				  +"<stop  offset=\"0.6507\" style=\"stop-color:"+gradientColors[5]+"\"/>"
				  +"<stop  offset=\"1\" style=\"stop-color:"+gradientColors[6]+"\"/>"
				  +"</linearGradient>";
	outlineHtml += "</defs>";
	//outlineHtml += "<path id='path_1' style=\"stoke-width:0px\" fill=\"#AAA\" d=\"M297.6 32.900000000000034 A264.7 264.7 0 1 1 297.59995380113475 32.90000000000407 L297.59995868805663 60.900000000003644A236.7 236.7 0 1 0 297.6 60.900000000000034  Z\"/>";
	outlineHtml += "<path id='path_1_dyn'  fill=\"url(#SVGID_1_"+id+")\" d=\"\"/>";
	outlineHtml += "<path id='path_2_dyn'  fill=\"url(#SVGID_2_"+id+")\" d=\"\"/>";

	outlineHtml += "<circle id='circle' class='wz_process_ind_cycle' fill=\""+cycleColor+"\"  cx=\"297.6\" cy=\"297.6\" r=\"227.7\"/>";
	outlineHtml += "</svg></div>";

	$.log("obj:id="+id+", obj=" + ag.getObj(id) + ":JSON=" + JSON.stringify( ag.getObj(id) ) );


	return _div("id:"+id,"class:"+opt.class,"text:"+outlineHtml,
			_div("class:"+opt.innerClass,_table(_tr(_td("valign:middle","align:center","text:"+opt.contentInit ) )) )
 			);
}

function setLabelValue(id, labelValue) {
	if (id.startsWith("label_")){
		$("#"+id).text(xlate(labelValue));
	}else{
		$("#tr_"+id+" label").text(xlate(labelValue));
	}
}


function snmpTextAreaId(label1, val, id) {
    return _tr(_td("width:50%", "text:{{" + label1+"}}"), _td(_textarea("rows:6", "cols:50", "class:read_only","name:name2","id:"+id, "readonly:readonly", "text:" + val // UNIHAN MOD, PROD00216938
            )));
}

function rotext(id, opts) {
    var _opts = _.extend({}, opts);
    _.extend(_opts, {readonly:true, isBuildTable:true});
    return text(id, _opts);
}

function getLangfromCode(code) {
    var language = LGICodeLangSet[code] ? LGICodeLangSet[code]: "English";
    return language;
}

function getCodefromLang(language) {
    var code = "en";
    for(key in LGICodeLangSet){
        if (LGICodeLangSet[key]===language) {
           code = key;
        }
    }
    return code;
}

function getLanguagesList()
{
    var langlist = [];
    var options = [];

    var langs = getLanguagesLgi();
    //var selectedVal = arLanguage.get();
    //var selectedVal = language();
    var selectedVal = getLangfromCode(language());

    // LGI ADD START
    var selectedLanguage = getLocalStorage('selectedLanguage');
    if(getCurMenuId() == 'ConnectionStatus' && typeof selectedLanguage !== 'undefined')
        selectedVal = selectedLanguage;
    // LGI ADD END

    options.push(_.map(langs, function(langs) {
        langs = langs.split(":");
        if(langs[0] == selectedVal)
            return _option("value:" + langs[0], "text:" + htmlEscape(langs[1]), "selected:selected");
        else
            return _option("value:" + langs[0], "text:" + htmlEscape(langs[1]));
    }));
    return options;
}


function changeLanguage()
{
    // Blocking the language change for now. return needs to be removed when all language strings are in.
   // return;

    $.log("selectLang: " + $("#selectLanguage").val());
    $.log("ar_language " + getSessionStorage("ar_language"));
    function doChangeLanguage(){
        clearLanguage();
        var code = getCodefromLang($("#selectLanguage").val());
        var data = {"lang": code};
        setUserData(data);
        refresh();
    }
    var language = getLangfromCode(getSessionStorage("ar_language"));

    // LGI MOD START
    var selectedLanguage = $("#selectLanguage").val();
    if(getCurMenuId() == 'ConnectionStatus' && typeof selectedLanguage !== 'undefined')
    {
        setLocalStorage('selectedLanguage', $("#selectLanguage").val());
        refresh();
    }
    else if($("#selectLanguage").val() != language)
    // LGI MOD END
    {
        if(isUserWarning())
        {
            userWarning(null, "func", doChangeLanguage);
            return;
        }
        doChangeLanguage();
    }
}

function getSkinsList()
{
    var options = [];
    var condidates = ["lgi:lgi","vm:vm","ziggo:ziggo","unitymedia:unitymedia","cablecom:cablecom"];
    var selectedVal = getSkin();

    options.push(_.map(condidates, function(optstr) {
    	optstr = optstr.split(":");
        if(optstr[0] == selectedVal)
            return _option("value:" + optstr[0], "text:" + htmlEscape(optstr[1]), "selected:selected");
        else
            return _option("value:" + optstr[0], "text:" + htmlEscape(optstr[1]));
    }));
    return options;
}
function changeSkin()
{
	var skin = $("#selectSkin").val();
    if(skin != getSkin())
    {
        if(isUserWarning())
        {
            userWarning(null, "func", changeSkin);
            return;
        }
    	setSessionStorage("ar_hide",  "");
    	setSessionStorage("ar_skin",  "");
    	var origVal = arWebAccessPage.get(1);
    	var newVal = origVal;
    	var idxSkinKey = origVal.indexOf("skin:");
    	if (idxSkinKey>=0){
    		newVal = origVal.substr(0,idxSkinKey+5) + skin ;
    		var semiIdx = origVal.indexOf(";", idxSkinKey);
    		if (semiIdx>=0){
    			newVal += origVal.substr(semiIdx);
    		}
    	}else{
            var sepCh;
    		if(origVal.length)
                sepCh = origVal.substr(origVal.length-1) == ";"?"":";";
    		else
                sepCh = "";

    		newVal = origVal + sepCh +"skin:"+skin+";";
    	}
    	$.logLGI("arWebAccessPage:newVal=" + newVal);
    	arWebAccessPage.set(1, newVal);
        store();
        refresh();
    }
}

function WizardFrames(id, frames, opts) {
    if (!_.isArray(frames)) {$.logError("WizardFrames arguement frames must be an Array type.");return null;}

    var _opts = _.extend({}, opts);

    this.id = id;
    this.currentframe = 0;
    this.maxframe = frames.length;
    this.open = function open(){
        verifyLoginCredential();
        $.log("calling open " + this.id);
        $("#" + this.id).show();
        $(".wizardClass").hide();
        $("#" + this.id + "_Frame_0").show();
        this.currentframe = 0;
    }

    this.close = function close(){
        $.log("calling close " + this.id);
        $("#" + this.id).fadeOut();
        this.currentframe = 0;
    }

    this.next = function next(){
        $.log("calling next " + this.id);
        if(this.currentframe != (this.maxframe - 1))
        {
            $("#" + this.id + "_Frame_" + this.currentframe).hide();
            $("#" + this.id + "_Frame_" + (++this.currentframe)).show();
        }
    }

    this.gotoframe = function gotoframe(frame_to_go){
       if(frame_to_go <= (this.maxframe - 1)) {
            this.frame_to_go = frame_to_go;
            $("#" + this.id + "_Frame_" + this.currentframe).hide();
            $("#" + this.id + "_Frame_" + (this.frame_to_go)).show();
            this.currentframe = frame_to_go;
        }
    }

    this.prev = function prev(){
        $.log("calling prev " + this.id);
        if(this.currentframe > 0)
        {
           $("#" + this.id + "_Frame_" + this.currentframe).hide();
           $("#" + this.id + "_Frame_" + (--this.currentframe)).show();
        }
    }

    var wizard_frame = [];

    $.each(frames, function(k, v) {
    $.logLGI("k="+k+"; v="+v);
        wizard_frame.push(_div("id:" + id + "_Frame_" + k, "class:wizardClass",
                (v.info)? _div("class:overlaycontent-infotext", "text:{{" + v.info + "}}") : null,
                (v.elements)? _div("class:overlaycontent", _table(_tbody(v.elements))) : null,
                (v.btns)?_div(v.btns):null
            ));
    });

    $.log("in wizards");
    var overlay_clz = _opts.overlayCls ? _opts.overlayCls : "overlay";
    var overlay_cholder =  _opts.overlayCls ? "overlaycontent_holder_90":"overlaycontent_holder";
    var overlay_title = 1;
    if(isVM() || isZiggo()){
        var curm = getCurMenu();
        if (curm && curm["display"]=="blank" && (((!isLoggedIn())&&curm["noAuth"]) || isLoggedIn()) ){
            overlay_title = 0;
        }
    }
    var shell= _div("id:" + id , "style:display:none;", _div("class:" + overlay_clz),
        _div("class:overlaycontainer",
            _opts.noClose ? null : _div("class:close", _a("onclick:$('#" +this.id + "').fadeOut();", _img("src:skins/lgi/css/images/close.png"), _div("class:closetext", "text:{{Close}}"))),

            _div("class:" + overlay_cholder,
                _opts.noTitle ? null : _div(overlay_title?"class:overlaycontent-title":"class:routerstatus-title", "text:{{" + id + "}}"),
                wizard_frame
            )
        ),
        _div("class:wiz_logo_container")
    );
    $(shell.toHTML()).appendTo($("body"));

    return this;

}

function convertSSIDName(k) {
    return "$"+stringToHex(k);
}

var isNewPassword = false;

var StartWizards = null;
function FirstInstallShow()
{
    $.log("FirstInstallShow.id is " + StartWizards.id);
    StartWizards.open();
}

function ModemPasswordValidation(id, passvalue){
    var isCSREnabled  = /*(snmpGet1(arAuthAccountEnabled.oid+".2") == "1") ? true:*/ false;
    ag.setValue("UserName", "admin"/*isCSREnabled ? arAuthUserName.get(2):arAuthUserName.get(1)*/);

    return handleLogin(ag.getValue("UserName"), passvalue, id, isCSREnabled);
}


function showNewPassword() {
    $("#tr_NewPassword").show();
    $("#tr_EmailAddress").show();
    $(".changeCancel").show();
    $('#EmailAddress').val("");
    $("#NewPassword").val("");
	$("#NewPassword13").val("");
	$("#ReenterPassword").val("");
    showErrorTips("EmailAddress", false);
    showErrorTips("NewPassword", false);
	showErrorTips("NewPassword13", false);
	showErrorTips("ReenterPassword", false);
    showStrengthBar("NewPassword", false);
    isNewPassword = true;
     $(".firstInstall_skip").show();
            $(".firstInstall_next").hide();
}

function hideNewPassword() {
    $(".firstInstall_skip").show();
    $(".firstInstall_next").hide();
    isNewPassword = false;
    $("#NewPassword").val("");
	$("#NewPassword13").val("");
	$("#ReenterPassword").val("");
    modemPasswordChanged = false;
    showStrengthBar("NewPassword",false);
    showErrorTips("NewPassword", false);
	showErrorTips("NewPassword13", false);
	showErrorTips("ReenterPassword", false);
}

var current_banner = 1;
var max_banners = 4;
var temp = false;
function showBanners()
{
    $.log("showBanners(): current_banner = " + current_banner);
    if(current_banner >= max_banners)
        return;
    if(customerId() == "6" || customerId() == "23"
		|| customerId() == "26" || customerId() == "27")
    {
        var next, prev;
        if(!temp)
        {
           next = current_banner + 1;
           prev = current_banner - 1;
           StartWizards.next();
           $('#FirstInstall .overlaycontent_holder_90').hide();
           $('#FirstInstall .fi_overlay_bg' + current_banner).addClass("fi_overlay_bg" + next);
        }
        else{
           next = current_banner + 2;
           prev = current_banner - 2;
           StartWizards.next();
           StartWizards.next();
           $('#FirstInstall .overlaycontent_holder_90').hide();
           $('#FirstInstall .fi_overlay_bg' + current_banner).addClass("fi_overlay_bg" + next);
           $('#FirstInstall').removeClass("fi_overlay_bg0").removeClass("fi_overlay_bg1") ;
        }
   }
   else{
        var next = current_banner + 1;
         var prev = current_banner - 1;
        StartWizards.next();
        $('#FirstInstall .overlaycontent_holder_90').hide();
         $('#FirstInstall .fi_overlay_bg' + current_banner).addClass("fi_overlay_bg" + next);
    }

    $('#FirstInstall').removeClass("fi_overlay_bg" + prev).addClass("fi_overlay_bg" + current_banner);
    $("#FirstInstall .fi_overlay_bg" + next).hide();
    $("#FirstInstall .fi_overlay_bg" + next).animate();
    $("#FirstInstall .fi_overlay_bg" + next).removeClass("fi_overlay_bg" + current_banner);
    $('#FirstInstall .fi_overlay_bg' + next).fadeIn(2000);
    $('#FirstInstall .overlaycontent_holder_90').delay(500).fadeIn(1000);

    setTimeout(showBanners, 6000);
     if(customerId() == "6" || customerId() == "23"
	 	|| customerId() == "26" || customerId() == "27")
     {
        if(!temp){
            current_banner++;
            temp = true;
        }else{
            current_banner++;
            current_banner++;
        }
    }
    else{
        current_banner++;
    }

}

function showWait(){
     WiFiWizard.next();
    setTimeout(function(){
         WiFiWizard.next();
    },3000);
}

function setParentalControlBtn(){
    if(wifiName || wifiPassword || modemPasswordChanged){
        $(".wizard_next").show();
        $(".wizard_finish").hide();
    }else{
        $(".wizard_next").hide();
        $(".wizard_finish").show();
    }
}


var tempLanguage = "English";
var langCode = "en";
function wizChangeLanguage()
{
    // Blocking the language change for now. return needs to be removed when all language strings are in.
   // return;

    var lgiLang = ["English","Turkish","French","German","Dutch","Romanian","Italian","Polish","Hungarian","Czech","Spanish","Slovakian","Russian"];
    for (var i = 0; i < lgiLang.length; i++) {
        idl = "fmRbtn-" + lgiLang[i];
        var radioLang = document.getElementById(idl);
        if(radioLang.className.indexOf('checked') != -1)
        {
            langCode = getCodefromLang(lgiLang[i]);
            selLanguage = lgiLang[i];
            break;
        }
    }
    setSessionStorage("ar_language", langCode);
    $.log("First Install lang = "  + selLanguage);

    //var def_lang = {"Turkish":"tk", "French":"fr", "German":"de", "Russian":"ru", "Dutch":"nl", "Romanian":"ro", "Italian":"it", "Polish":"pl", "Hungarian":"hu", "Czech":"cz", "Spanish":"es", "Slovakian":"sk"};
    //var lang_code = def_lang[selLanguage];
    $.log("First Install lang code = "  + langCode);
    if (langCode)
    {
        $.cachedScript("text_"+langCode+".js", null, {async:false});
    }
    else
    {
        $.cachedScript("text_en.js", null, {async:false});
    }

    if(selLanguage != tempLanguage)
    {
        $("body").empty();
        tempLanguage = selLanguage;
    }
    render();
}

function wizSetLanguage()
{
    // Blocking the language change for now. return needs to be removed when all language strings are in.
    //return;

    $.log("wizSetLanguage: Setting language " + selLanguage);
    clearLanguage();
    //arLanguage.set(tempLanguage, "Language");
    var data = {"lang": langCode};
    setUserData(data);
}

var store_modem_Password = {};
var modemPasswordChanged = false;

//var wifiPasswordChanged = false;
var wifiName = false;
var wifiPassword = false;

function firstInstallbuild()
{
    afterBuild(function(){
	$(".bottomLabel").hide();
	logoDisplay();
        $("#LoginPassword").val("");
        $("#NewPassword").val("");
        $("#EmailAddress").val("");
        //if(getSessionStorage("ar_language")){
        uncheckAllLanguage();
        var langCode = getSessionStorage("ar_language");
        if(langCode){
            //$("#"+getSessionStorage("ar_language")).attr("checked","true");
	    var language = getLangfromCode(langCode);
            $("#"+language).attr("checked","true");
        }else{
            $("#English").attr("checked","true");
        }
        $("#LoginPassword2").val("");
        $("#LoginPassword3").val("");
        $("#stored_wifi_username").val("");
        $("#stored_wifi_username").val("");
        $("#email").val("");
        $(".firstInstall_next").hide();
       	$('#FirstInstall_Frame_2 .overlaycontent .td_tiptool').css({'padding-left': '0', 'margin-right': '25px'});
	$('#FirstInstall_Frame_2 #tr_NewPassword td:first-child, #FirstInstall_Frame_2 #tr_ReenterPassword td:first-child').addClass('factoryPassword');
	$("#welcomeOverlay ~ table").addClass('FirstInstallPassTable');

        $(document).keyup(function(event){
            var keycode = (event.keyCode ? event.keyCode : event.which);
            if((StartWizards.currentframe == 1) && keycode == '13' && ModemPasswordValidation("LoginPassword", $("#LoginPassword").val())){
                 $("#LoginPassword1").val($("#LoginPassword").val());
				 $("#LoginPassword13").val($("#LoginPassword").val());
                if(isVM()){
					StartWizards.gotoframe(12);
				}
				else{
					StartWizards.next();
				}
            }

           if(($('#FirstInstall_Frame_10:visible').length!= 0) && keycode == '13' && ModemPasswordValidation("LoginPassword12", $("#LoginPassword12").val()))
	    {
	          //arFirstInstallWizardCompletionStatus.set("1");
                  MibObjects.ApplyAllSettings.set(1, "", true);
                  StartWizards.close();
                  refresh();
	     }

        });
    });

	var _email_pass_hook = [];
	var _reenter_pass_hook = [];
	var _applyHook_forgotemail = [];

     StartWizards = new WizardFrames("FirstInstall",
        [
            // 00
            {
                elements:[
                    _div("class:overlaycontent-title", "text:{{Hello}}"),
                    _h5("text:{{" +customerName("LanguageDescr",1)+ "}}"),
                    _br(),
                    _tr(
                        _td("style:width:30%;",
                            radio("English", "languageGroup", {withoutHelpTxt:true, class:"wizard_radio"}),
                            radio("Turkish", "languageGroup", {withoutHelpTxt:true, class:"wizard_radio"}),
                            radio("French", "languageGroup", {withoutHelpTxt:true, class:"wizard_radio"}),
                            radio("German", "languageGroup", {withoutHelpTxt:true, class:"wizard_radio"})
                        ),
                        _td("style:width:30%;",
                            radio("Dutch", "languageGroup", {withoutHelpTxt:true, class:"wizard_radio"}),
                            radio("Romanian", "languageGroup", {withoutHelpTxt:true, class:"wizard_radio"}),
                            radio("Italian", "languageGroup", {withoutHelpTxt:true, class:"wizard_radio"}),
                            radio("Polish", "languageGroup", {withoutHelpTxt:true, class:"wizard_radio"})
                        ),
                        _td("style:width:30%;",
                            radio("Hungarian", "languageGroup", {withoutHelpTxt:true, class:"wizard_radio"}),
                            radio("Czech", "languageGroup", {withoutHelpTxt:true, class:"wizard_radio"}),
                            radio("Spanish", "languageGroup", {withoutHelpTxt:true, class:"wizard_radio"}),
                            radio("Slovakian", "languageGroup", {withoutHelpTxt:true, class:"wizard_radio"})
                        )
                    ),

                ],
                btns:[
                    buttons(
                        [{
                            value:xlate("Next"),
                            func:function onclick() {
                                if (getCmOperationState() == 1) {
                                    wizChangeLanguage();
                                    wizSetLanguage();
                                    StartWizards.gotoframe(14);
                                } else {
                                    //Set language MIB
                                    wizChangeLanguage();
                                    StartWizards.next();
                                }
                            }
                        }], {btnClass:"wizard_button"})
                ]
            },
            // 01
            {
                elements:[
                   _div("class:overlaycontent-title", "text:{{Welcome}}", "id:welcomeOverlay"),
                    _h5("text:{{" +customerName("LoginModemPassword",3)+ "}}",
                    _a("class: showMe", _span("text:{{" + xlate("Showme") + "}}", "class:btmBorder"), function onclick() { $(".bottomLabel").toggle(); })),
                   _div("style:padding-top:25px", _img("class: bottomLabel", "src:skins/lgi/css/images/settings-password.png")),
                    _br(),
                    text("LoginPassword", {withoutHelpTxt:true, label:customerName("Password",1), isBuildTable:true})
                ],
                btns:[
                    buttons(
                        [{
                            value:xlate("Back"),
                            class: "wizard_back",
                            func:function onclick() {
                                disableControls("#LoginPassword",false);
                                $(".csr_active_msg").remove();
                                showErrorTips("LoginPassword", false);
                                $("#LoginPassword").val("");
                                StartWizards.gotoframe(0);
                            }
                        },
                        {
                            value:xlate("Next"),
                            func:function onclick() {
                                if(ModemPasswordValidation("LoginPassword", $("#LoginPassword").val()))
                                {
                                  $("#LoginPassword1").val($("#LoginPassword").val());
								  $("#LoginPassword13").val($("#LoginPassword").val());

                                    if(isVM())
									{
										StartWizards.gotoframe(12);
									}
									else{
										StartWizards.next();
									}
                                }
                                showNewPassword();
                            }
                        }], {btnClass:"wizard_button"})
                ]
            },
            // 02
            {
                elements:[
                    _div("class:overlaycontent-title", "text:{{perfect}}", "id:perfectStrengthPage"),
                    _h5("text:{{" +customerName("perfectpage",1)+ "}}"),
                    _br(),
                    text("LoginPassword1", {withoutHelpTxt:true, readonly:true, label:"currentpassword", isBuildTable:true, width:"55%", append:": "}),
                    text("NewPassword",  { label:"enternewpassword", isBuildTable:true, width:"55%",applyHook:_email_pass_hook, format:fmtModemPassword({pid:'NewPassword'}), append:": " }),
                    _a("class: changeCancel",  _img("src:skins/lgi/css/images/arrow-blue-grad.svg", "height:12px"),  _span("text:{{Cancel}}", "class:btmBorder"), function onclick() {hideNewPassword();  }),

                ],
                btns:[
                    buttons(
                        [{
                            value:xlate("Back"),
                            class: "wizard_back",
                            func:function onclick() {
                                StartWizards.gotoframe(0)
                            }
                        },
                        {
                            value:xlate("Skip"),
                            class: "firstInstall_skip",
                            func:function onclick() {
                                if(isVM())
                                {
                                    StartWizards.gotoframe(13);
                                }
                                else{
                                     if(getModemMode() == 0)
                                     {
                                        StartWizards.gotoframe(13);
                                     }
                                     else
                                     {
                                         current_banner = 1;
                                         temp = false;
                                         showBanners();
                                     }
                                }
                            }
                        },
                        {
                            value:xlate("Next"),
                            class: "firstInstall_next",
                            func:function onclick() {

                                var opt = {applyHook:_email_pass_hook,
                                    refreshPage:false,
                                    withoutApplyAllSettings:true,
                                    noWaitDialog:true,
                                    storeFun:function(){
                                         modemPasswordChanged = true;
                                         $(".stored_modem").text($("#NewPassword").val());
                                         store_modem_Password["modem_password"] = $("#NewPassword").val();
                                         showStrengthBar("NewPassword",false);
                                        if(isVM() &&  modemPasswordChanged)
                                        {
                                         StartWizards.gotoframe(8);
                                        }
                                        else
                                        {
                                            if(getModemMode() == 0)
                                            {
                                                StartWizards.gotoframe(8);
                                            }
                                            else
                                            {
                                                current_banner = 1;
                                                temp = false;
                                                showBanners();
                                            }
                                        }
                                    }
                                };
                                Apply(opt);
                            }
                        }], {btnClass:"wizard_button"})
                ]
            },
            // 03
            {
                elements:[
                        _div("class:overlaycontent-title", "text:{{TopTip}}"),
                        _h5("text:{{" +customerName("TopTip_tt",3)+ "}}")
                ]
            },
            // 04
			{
                elements:[
                        _div("class:overlaycontent-title", "text:{{StrongWiFi}}"),
                        _h5("text:{{StrongWiFi_tt}}")
                ]
            },
            // 05
			{
                elements:[
                        _div("class:overlaycontent-title", "text:{{moreTips}}"),
                        _h5("text:{{moreTips_tt}}")
                ],
                btns:[
                    buttons(
                        [{
                            value:xlate("Continue"),
                            func:function onclick() {
                                hideNewWifi();
                                hideNewWifiPass();
                                setTimeout(wizSetLanguage, 1000);
                                  StartWizards.close();
                                 WifiWizardShow(true);
                            }
                        }], {btnClass:"wizard_button"})
                ]
            },
            // 06
            {/*
                elements:[
                        _div("class:overlaycontent-title", "text:{{InternetEverywhere}}"),
                        _h5("text:{{WifiSpots}}")
                ]
            */},
            // 07
            {/*
                 elements:[
                        _div("class:overlaycontent-title", "text:{{" +customerName("Ready",1)+ "}}"),
                        _h5("text:{{" +customerName("ModemReady",1)+ "}}")
                ],
                btns:[
                    buttons(
                        [{
                            value:xlate("Continue"),
                            func:function onclick() {
                                setTimeout(wizSetLanguage, 1000);
                                  StartWizards.close();
                                 WifiWizardShow(true);
                            }
                        }], {btnClass:"wizard_button"})
                ]
            */},
            // 08
	    {
		//If modem password is changed for VM customers
                elements:[
                   _div("class:overlaycontent-title", "text:{{seeyousoon}}"),
                   _h5("text:{{" +customerName("seeyousoonpage",1)+ "}}"),
                   _br(),
                   _h6("text:{{" +xlate("yournewcredentials") + ": "+ "}}"),
                   _div("text: {{" +customerName("Password",1)+ "}}", _div("class:container_stored_modem","text:: " , _div("class:stored_modem" )  ))
                ],
                btns:[
                    buttons(
                        [{
                            value:xlate("Back"),
                            class: "wizard_back",
                            func:function onclick() {
                                if(getModemMode() == 0 && (!isVM()))
                                   StartWizards.gotoframe(2);
                                else
                                   StartWizards.gotoframe(12);
                            }
                        },
                        {
                            value:xlate("Finish"),
                            func:function onclick() {
                                //arFirstInstallWizardCompletionStatus.set("1");
                                var data = {"firstInstallStatus": "true"};
                                setUserData(data);
                                changePassword($("#LoginPassword13").val(), store_modem_Password.modem_password);
                                //arEmailSend.set(2);
                                StartWizards.gotoframe(10);
                            }
                        }], {btnClass:"wizard_button"})
                ]
            },
            // 09
            {
                elements:[
                         _br(),
                        _div("class:loadingWait"),
                        _br(),
                        _br(),
                        _br(),
                        _br()
                ]
            },
            // 10
            {
                elements:[
                   _div("class:overlaycontent-title", "text:{{" +customerName("Iamready",1)+ "}}"),
                   _h5("text:{{" +customerName("Iamreadypage1",1)+ "}}"),
                   text("LoginPassword12",{label:customerName("Password",1), withoutHelpTxt:true, isBuildTable:true, width:"45%", type:"text"})

                ],
                btns:[
                    buttons(
                        [{
                            value:xlate("Close"),
                            class: "wizard_close",
                            func:function onclick() {
                                closeFirstInstall();
                            }
                        },
                        {
                            value:xlate("Continue"),
                            func:function onclick() {
                                setTimeout(wizSetLanguage, 1000);
                                if(ModemPasswordValidation("LoginPassword12", $("#LoginPassword12").val()))
                                {
                                    //arFirstInstallWizardCompletionStatus.set("1");
                                    var data = {"firstInstallStatus": "true"};
                                    setUserData(data);
                                    //PollAndApply();
                                    StartWizards.close();
                                    refresh();
                                }
                            }
                        }], {btnClass:"wizard_button"})
                ]
            },
            // 11
		//Forgot password wizard
	    {/*
                elements:[
                    _div("class:overlaycontent-title", "text:{{forgotpassword}}"),
                    _h5("text:{{forgotpasswordpage}}"),
                    _br(),
                    text("email", {withoutHelpTxt:true, label:"email", isBuildTable:true, width:"60%", applyHook:_applyHook_forgotemail, format:fmtEmail()})


                ],
                btns:[
                    buttons(
                        [{
                            value:xlate("Back"),
                            class: "wizard_back",
                            func:function onclick() {
                                StartWizards.prev();
                            }
                        },
                        {
                            value:xlate("Continue"),
                            func:function onclick() {
                                var opt = {applyHook:_applyHook_forgotemail,
                                    refreshPage:false,
                                    withoutApplyAllSettings:true,
                                    noWaitDialog:true,
                                    storeFun:function(){
                                        $.logLGI("Sending email details..");
                                        setTimeout(function(){
                                            arEmailAddress.set($('#email').val(), "", true);
                                            arEmailApplySettings.set(1, "", true);
                                            arEmailSend.set(2, "", true);
                                        }, 2000);
                                        StartWizards.gotoframe(10);
                                    }
                                };
                                Apply(opt);
                            }
                        }], {btnClass:"wizard_button"})
                ]
            */
            },
            // 12
			{
                elements:[
                    _div("class:overlaycontent-title", "text:{{perfect}}", "id:perfectStrengthPage"),
                    _h5("text:{{" +customerName("perfectpage",1)+ "}}"),
                    _br(),
                    text("LoginPassword13", {withoutHelpTxt:true, readonly:true, label:"currentpassword", isBuildTable:true, width:"55%", append:": "}),
                    text("NewPassword13",  { label:"enternewpassword", isBuildTable:true, width:"55%",applyHook:_reenter_pass_hook, format:fmtModemPassword({pid:'NewPassword13'}), append:": " }),
                    _a("class: changeCancel",  _img("src:skins/lgi/css/images/arrow-blue-grad.svg", "height:12px"),  _span("text:{{Cancel}}", "class:btmBorder"), function onclick() {hideNewPassword();  }),
					 text("ReenterPassword",  { label:"reenternewpassword", isBuildTable:true, width:"55%", applyHook:_reenter_pass_hook, format:fmtReenterPassword({pid:'ReenterPassword'}),  withoutHelpTxt:true, append:": " })

                ],
                btns:[
                    buttons(
                        [{
                            value:xlate("Back"),
                            class: "wizard_back",
                            func:function onclick() {
                                StartWizards.gotoframe(0);
                            }
                        },
                        {
                            value:xlate("Skip"),
                            class: "firstInstall_skip",
                            func:function onclick() {
                                 //arFirstInstallWizardCompletionStatus.set("1");
                                 var data = {"firstInstallStatus": "true"};
                                 setUserData(data);
                                 StartWizards.gotoframe(13);
                            }
                        },
                        {
                            value:xlate("Next"),
                            class: "firstInstall_next",
                            func:function onclick() {

                                var opt = {applyHook:_reenter_pass_hook,
                                    refreshPage:false,
                                    withoutApplyAllSettings:true,
                                    noWaitDialog:true,
                                    storeFun:function(){
                                         modemPasswordChanged = true;
                                         $(".stored_modem").text($("#NewPassword13").val());
                                         store_modem_Password["modem_password"] = $("#NewPassword13").val();
                                         showStrengthBar("NewPassword13",false);
                                        if(isVM() &&  modemPasswordChanged)
                                        {
                                         StartWizards.gotoframe(8);
                                        }
                                        else{
					    current_banner = 1;
                                            temp = false;
                                            showBanners();
                                        }
                                    }
                                };
                                Apply(opt);
                            }
                        }], {btnClass:"wizard_button"})
                ]
            },
            // 13
	    {
                elements:[
                   _div("class:overlaycontent-title", "text:{{" +customerName("Iamready",1)+ "}}"),
                    _h5("text:{{" +customerName("Iamreadypage",1)+ "}}")
                ],
                btns:[
                    buttons(
                        [{
                            value:xlate("Exit"),
                            class: "wizard_close",
                            func:function onclick() {
                                closeFirstInstall();
                            }
                        },
                        {
                            value:customerName("gotohome",1),
                            func:function onclick() {
                                //arFirstInstallWizardCompletionStatus.set("1");
                                var data = {"firstInstallStatus": "true"};
                                setUserData(data);
                                //MibObjects.ApplyAllSettings.set(1, "", true);
                                wizSetLanguage();
                                //PollAndApply();
                                StartWizards.close();
                                refresh();
                            }
                        }], {btnClass:"wizard_button"})
                ]
            },
            //14
            {
               elements:[
                    _div("class:overlaycontent-title", "text:{{updating}}"),
                    _h5("text:{{" +customerName("updateMessage1",1)+ "}}"),
                    _br(),
                    _h5("text:{{updateMessage2}}"),
                    _br(),
                    _h5("text:{{" +customerName("LightRingStoppedBlinking",1)+ "}}")
                ],
                btns:[
                    buttons(
                        [{
                            value:xlate("Refresh"),
                            func:function onclick() {
                                var fwUpgradeStatus = getCmOperationState();
                                if (fwUpgradeStatus == 2 || fwUpgradeStatus == 3) {
                                    StartWizards.gotoframe(0);
                                } else if ( fwUpgradeStatus == 4 || fwUpgradeStatus == 5) {
                                    StartWizards.gotoframe(1);
                                }
                            }
                        }], {btnClass:"wizard_button"})
                 ]
            }
        ],
        {noTitle:true, noClose:true, overlayCls:"fi_overlay_bg1"}
    );

    FirstInstallShow();
    $('#NewPassword, #EmailAddress, #NewPassword13, #ReenterPassword').focus(function() {
        $(".firstInstall_skip").hide();
        $(".firstInstall_next").show();
    });

    $('#NewPassword, #EmailAddress, #NewPassword13, #ReenterPassword').blur(function() {
        //if($('#NewPassword').val().length <= 0 && $('#EmailAddress').val().length <= 0){
        if(isVM()){
           if(!passwordValidate && !confirmPasswordValidate){
              $(".firstInstall_skip").show();
              $(".firstInstall_next").hide();
           }
        } else{
           if($('#NewPassword').val().length <= 0){
              $(".firstInstall_skip").show();
              $(".firstInstall_next").hide();
	   }
        }
    });
}


var WiFiWizard;

//Wireless Connection Configration Wizard Starts
function WifiWizardShow(doGet)
{
    if(doGet)
    {
        var data = {"prim24gssid": "", "prim24gpassphrase": ""};
        data = getWifiData(data);
        $("#WiFiNetworkName").val(data['prim24gssid']); //arBssSSID.get(getPrimary24G()));
        $("#NewWiFiNetworkName").val(data['prim24gssid']);//arBssSSID.get(getPrimary24G()));
        $("#WiFiPassword").val(data['prim24gpassphrase']);//arWPAPreSharedKey.get(getPrimary24G()));
        $("#NewWiFiPassword").val(data['prim24gpassphrase']);//arWPAPreSharedKey.get(getPrimary24G()));

	//var parentalCtrl = arEnableParentalCont.get();
	parentalCtrl = 2;
        if(parentalCtrl=="1") {
            $("#ParentalControlEnable").attr('checked', 'checked');
            $("#fmChbx-ParentalControlEnable").addClass('checked');
	} else {
            $("#ParentalControlEnable").removeAttr('checked');
            $("#fmChbx-ParentalControlEnable").removeClass('checked');
        }
    }

    disableControls("#NewWiFiNetworkName, #NewWiFiPassword", true);
    WiFiWizard.open();
}

function disableWifiApplyBtn(){
    if(wifiName || wifiPassword ){
        $("#wifi_apply").prop('disabled', false);
        $("#wifi_apply").removeClass('disabled');
    }else{
        $("#wifi_apply").prop('disabled', true);
        $("#wifi_apply").addClass('disabled');
    }
}

// Function for change and cancel button
function showNewWifi() {
    $(".newWifiNetwork").show();
    $(".changeWifiBtn").hide();
    $("#NewWiFiNetworkName").val("");
    disableControls("#NewWiFiNetworkName", false);
    wifiName = true;
    disableWifiApplyBtn();
}

function hideNewWifi() {
    $(".newWifiNetwork").hide();
    $(".changeWifiBtn").show();
    $("#NewWiFiNetworkName").val($("#WiFiNetworkName").val());
    disableControls("#NewWiFiNetworkName", true);
     showErrorTips("NewWiFiNetworkName", false);
     wifiName = false;
    $("#tickMark_"+tmp+" "+" img.check-icon").css("display","none");
     disableWifiApplyBtn();
}

function showNewWifiPass() {
    $(".newWiFiPassword").show();
    $(".changeWifiPassBtn").hide();
    $("#NewWiFiPassword").val("");
    disableControls("#NewWiFiPassword", false);
    $("#WiFiNetwork .pass_strength").show();
    $("#WiFiNetwork .pass_arrow").show();
    $("#WiFiNetwork .pass_text").show();
    wifiPassword = true;
    disableWifiApplyBtn();
}

function hideNewWifiPass() {
    $(".newWiFiPassword").hide();
    $(".changeWifiPassBtn").show();
    $("#WiFiNetwork .pass_strength").hide();
    $("#WiFiNetwork .pass_arrow").hide();
    $("#WiFiNetwork .pass_text").hide();
    $("#NewWiFiPassword").val($("#WiFiPassword").val());
    disableControls("#NewWiFiPassword", true);
    showErrorTips("NewWiFiPassword", false);
    showStrengthBar("NewWiFiPassword", false);
    wifiPassword = false;
    disableWifiApplyBtn();
}
// Function for change and cancel button ends
var isWifiDevice = false;
function checkConnectedDeviceType(){
	WiFiClientInfoTable.getTable([
		arWiFiClientInfoIPAddrTextual
	],
	function(index, row) {
		ipAddress = row[0];
		if ( ipAddress == attrs["remoteAddr"] )
			isWifiDevice = true;
	});
}

function WiFiWizardBuild() {

     var _applyHook_wifi = [];
     var _applyHook_forgotemail = [];
     //checkConnectedDeviceType();

     $(document).keyup(function(event){
      var keycode = (event.keyCode ? event.keyCode : event.which);
      if(($('#WiFiNetwork_Frame_5:visible').length != 0) && keycode == '13' && ModemPasswordValidation("LoginPassword2", $("#LoginPassword2").val()))
      {
          //arFirstInstallWizardCompletionStatus.set("1");
          MibObjects.ApplyAllSettings.set(1, "", true);
          WiFiWizard.close();
          refresh();
      }
      });
    // WiFi Network Wizard Function
    WiFiWizard = new WizardFrames("WiFiNetwork",
        [
            //00
            {
                elements:[
						_div("class:overlaycontent-title", "text:{{WiFiNetwork}}", "id:wifi_firstInstall"),
                        _h5("class:title-wifiwizard-firstinstall", "text:{{WiFiNetworkDescr4}}"),
                        _br(),
                        _table("class:wifiWizardTable",
                            _tr(
                                _td(text("WiFiNetworkName", {readonly:true, withoutHelpTxt:true, append:": "})),
                                _td(_a("onclick:showNewWifi()", "class:changeWifiBtn changeCancel",_img("src:skins/lgi/css/images/arrow-blue-grad.svg", "height:12px"), _span("text:{{Change}}", "class:btmBorder")))
                            ),
                             _tr("class:newWifiNetwork", "style:display:none;",
                                _td(text("NewWiFiNetworkName", {applyHook:_applyHook_wifi, format:fmtLGISSID({pid:'NewWiFiNetworkName',isRequired:true,maxLength:32}), isTrimRequired:false, append:": "})),
                                _td(_a("onclick:hideNewWifi()","class:changeCancel", _img("src:skins/lgi/css/images/arrow-blue-grad.svg", "height:12px"), _span("text:{{Cancel}}", "class:btmBorder")))
                            ),
                             _tr(
                                _td(text("WiFiPassword", {readonly:true, withoutHelpTxt:true, append:": "})),
                                _td(_a("onclick:showNewWifiPass()", "class:changeWifiPassBtn changeCancel",_img("src:skins/lgi/css/images/arrow-blue-grad.svg", "height:12px"), _span("text:{{Change}}", "class:btmBorder")))
                            ),
                            _tr("class:newWiFiPassword", "style:display:none;",
                                _td(text("NewWiFiPassword", {applyHook:_applyHook_wifi, format:fmtPassphrase({pid:'NewWiFiPassword'}), isTrimRequired:false, append:": "})),
                                _td(_a("onclick:hideNewWifiPass()","class:changeCancel", _img("src:skins/lgi/css/images/arrow-blue-grad.svg", "height:12px"), _span("text:{{Cancel}}", "class:btmBorder"))
                                )
                                )
                        ),
                ],
                btns:[
                    buttons(
                        [{
                            value:xlate("Back"),
                            class: "wizard_back",
                            func:function onclick() {
                                WiFiWizard.close();
                                StartWizards.open();
                                StartWizards.gotoframe(2);
                				showStrengthBar("NewPassword",false);
                				showErrorTips("NewPassword", false);
                				showErrorTips("EmailAddress", false);
                               	$('#FirstInstall .fi_overlay_bg4').removeClass("fi_overlay_bg4").addClass("fi_overlay_bg1");
					            $('#FirstInstall.fi_overlay_bg3').removeClass("fi_overlay_bg3");
				                showStrengthBar("NewWiFiPassword",false);
                            }
                        },
                        {
                            value:xlate("Next"),
                            func:function onclick() {
                                var opt = {applyHook:_applyHook_wifi,
                                    refreshPage:false,
                                    withoutApplyAllSettings:true,
                                    noWaitDialog:true,
                                    storeFun:function(){
                                        $(".stored_wifi_username").text($("#NewWiFiNetworkName").val());
                                        $(".stored_wifi_password").text($("#NewWiFiPassword").val());
                                        store_modem_Password["NewWiFiNetworkName"] = $("#NewWiFiNetworkName").val();
                                        store_modem_Password["NewWiFiPassword"] =$("#NewWiFiPassword").val();
                                        if(modemPasswordChanged == true && (wifiName == true || wifiPassword == true) ){
                                             WiFiWizard.gotoframe(8);
                                        }else if(modemPasswordChanged){
                                            WiFiWizard.gotoframe(2);
                                         }else if(wifiName == true || wifiPassword == true){
                                                WiFiWizard.gotoframe(5);
                                        }else{
                                            WiFiWizard.next();
                                        }
                                    }
                                };
                                Apply(opt);
                            }
                        }], {btnClass:"wizard_button"}
                    )
                ]
            },
            //If nothing is changed
            //01 page 17
            {
                elements:[
                   _div("class:overlaycontent-title", "text:{{" +customerName("Iamready",1)+ "}}"),
                    _h5("text:{{" +customerName("Iamreadypage",1)+ "}}")
                ],
                btns:[
                    buttons(
                        [{
                            value:xlate("Exit"),
                            class: "wizard_close",
                            func:function onclick() {
                                closeFirstInstall();
                            }
                        },
                        {
                            value:customerName("gotohome",1),
                            func:function onclick() {
                                //arFirstInstallWizardCompletionStatus.set("1");
                                var data = {"firstInstallStatus": "true"};
                                setUserData(data);
                                //MibObjects.ApplyAllSettings.set(1, "", true);
                                wizSetLanguage();
                                //PollAndApply();
                                WiFiWizard.close();
                                refresh();
                            }
                        }], {btnClass:"wizard_button"})
                ]
            },
            //02 page 18 If modem password is changed
            {
                elements:[
                   _div("class:overlaycontent-title", "text:{{seeyousoon}}"),
                    _h5("text:{{" +customerName("tour",1)+ "}}"),
                    _h5("text:{{" +customerName("seeyousoonpage",1)+ "}}"),
                    _br(),
                     _h6("text:{{" +xlate("yournewcredentials") + ": "+ "}}"),
                     _div("text: {{" +customerName("Password",1)+ "}}", _div("class:container_stored_modem","text:: " , _div("class:stored_modem" )  ))
                ],
                btns:[
                    buttons(
                        [{
                            value:xlate("Back"),
                            class: "wizard_back",
                            func:function onclick() {
                                WiFiWizard.gotoframe(0);
                            }
                        },
                        {
                            value: xlate("Finish"),
                            func:function onclick() {
                                changePassword($("#LoginPassword1").val(), store_modem_Password.modem_password);
                                //arEmailSend.set(2);
                                WiFiWizard.gotoframe(4);
                            }
                        }], {btnClass:"wizard_button"})
                ]
            },
            //03  page 19
            {
                elements:[
                         _br(),
                        _div("class:loadingWait"),
                        _br(),
                        _br(),
                        _br(),
                        _br()
                ]
            },
            //04 page 20
            {
                elements:[
                   _div("class:overlaycontent-title", "text:{{" +customerName("Iamready",1)+ "}}"),
                    _h5("text:{{" +customerName("Iamreadypage1",1)+ "}}"),
                    _br(),
                    text("LoginPassword2",{label:customerName("Password",1), withoutHelpTxt:true, isBuildTable:true, width:"45%", type:"text"})

                ],
                btns:[
                    buttons(
                        [{
                            value:xlate("Exit"),
                            class: "wizard_close",
                            func:function onclick() {
                                closeFirstInstall();
                            }
                        },
                        {
                            value:xlate("Next"),
                            func:function onclick() {

                                if(ModemPasswordValidation("LoginPassword2", $("#LoginPassword2").val()))
                                {
                                    //arFirstInstallWizardCompletionStatus.set("1");
                                    var data = {"firstInstallStatus": "true"};
                                    setUserData(data);
                                    //PollAndApply();
                                    WiFiWizard.close();
                                    refresh();
                                }
                            }
                        }], {btnClass:"wizard_button"})
                ]
            },

            //05 page 21 If wifi password is changed
            {
                elements:[
                   _div("class:overlaycontent-title", "text:{{seeyousoon}}"),
                    _h5("text:{{" +customerName("tour",1)+ "}}"),
                    _h5("text:{{" +customerName("seeyousoonpage1",1)+ "}}"),
                     _h6("text:{{yournewwificredentials}}"),
                     _div("text: {{SSID}}", _div("class:container_stored_wifi_username","text:: " , _div("class:stored_wifi_username" )  )),
                     _div("text: {{" +customerName("Password",1)+ "}}", _div("class:container_stored_wifi_username","text:: " , _div("class:stored_wifi_password" )  ))
                ],
                btns:[
                    buttons(
                        [{
                            value:xlate("Back"),
                            class: "wizard_back",
                            func:function onclick() {
                                WiFiWizard.gotoframe(0);
                            }
                        },
                        {
                            value:xlate("Finish"),
                            func:function onclick() {
                                //arFirstInstallWizardCompletionStatus.set("1");
                                var data = {"firstInstallStatus": "true"};
                                setUserData(data);
                                //ConfigureWiFi(store_modem_Password.NewWiFiNetworkName, store_modem_Password.NewWiFiPassword);
				var data = {"prim24gssid": store_modem_Password.NewWiFiNetworkName, "prim24gpassphrase": store_modem_Password.NewWiFiPassword,"prim5gssid": store_modem_Password.NewWiFiNetworkName, "prim5gpassphrase": store_modem_Password.NewWiFiPassword};
                                setWifiData(data);
                               WiFiWizard.gotoframe(7);
                            }
                        }], {btnClass:"wizard_button"})
                ]
            },
            //06 page 22
            {
                elements:[
                         _br(),
                        _div("class:loadingWait"),
                        _br(),
                        _br(),
                        _br(),
                        _br()
                ]
            },
            //07 page 23
            {
                elements:[
                   _div("class:overlaycontent-title", "text:{{congrats}}"),
                     _h5("text:{{" +customerName("newsettings",1)+ "}}"),
                    _h5("text:{{" +customerName("wifilostpage",2)+ "}}"),
                    _br(),
                     _h6("text:{{yournewwificredentials}}"),
                      _div("text: {{SSID}}", _div("class:container_stored_wifi_username","text:: " , _div("class:stored_wifi_username" )  )),
                     _div("text: {{" +customerName("Password",1)+ "}}", _div("class:container_stored_wifi_password","text:: " , _div("class:stored_wifi_password" )  ))
                ],
                btns:[
                    buttons(
                        [{
                            value:xlate("Close"),
                            class: "wizard_close",
                            func:function onclick() {
                                if (!isWifiDevice) {
                                    closeFirstInstall();
                                }else{
                                    closeFirstInstallWifi();
                                }
                             }
                        },
                        {
                            value:xlate("Continue"),
                            func:function onclick() {
                                if (!isWifiDevice) {
                                    WiFiWizard.close();
                                    refresh();
                                }else{
                                    closeFirstInstallWifi();
                                }
                            }
                        }], {btnClass:"wizard_button"})
                ]
            },
             //08 page 24 If both modem password and wifi password is changed
             {
                elements:[
                   _div("class:overlaycontent-title", "text:{{seeyousoon}}"),
                    _h5("text:{{" +customerName("tour",1)+ "}} {{" +customerName("seeyousoonpage2",1)+ "}}"),
                    _br(),
                    _h6("text:{{" +xlate("yournewcredentials") + ": "+ "}}"),
                    _div("text: {{" +customerName("Password",1)+ "}}", _div("class:container_stored_modem","text:: " , _div("class:stored_modem" )  )),
                    _br(),
                     _h6("text:{{yournewwificredentials}}"),
                      _div("text: {{SSID}}", _div("class:container_stored_wifi_username","text:: " , _div("class:stored_wifi_username" )  )),
                     _div("text: {{" +customerName("Password",1)+ "}}", _div("class:container_stored_wifi_password","text:: " , _div("class:stored_wifi_password" )  ))
                ],
                btns:[
                    buttons(
                        [{
                            value:xlate("Back"),
                            class: "wizard_back",
                            func:function onclick() {
                                WiFiWizard.gotoframe(0);
                            }
                        },
                        {
                            value:xlate("Finish"),
                            func:function onclick() {
                                //Move changePassword down after setWifiData.  changePassword causes immediate relogin
                                //nullifying the old CSRF nonce causing the CSRF check to fail for setWifiData.
                                //changePassword($("#LoginPassword1").val(), store_modem_Password.modem_password);
                                //ConfigureWiFi(store_modem_Password.NewWiFiNetworkName, store_modem_Password.NewWiFiPassword, WiFiWizard);
                                var firstInstallData = {"firstInstallStatus": "true"};
                                setUserData(firstInstallData);
                                WiFiWizard.next();
                                setTimeout(setWifiAndPasswordData,1000);
                            }
                        }], {btnClass:"wizard_button"})
                ]
            },
            //09 page 25
            {
                elements:[
                         _br(),
                        _h5("text:{{"+ xlate("ApplyingChanges") +"}}"),
                        _div("class:loadingWait"),
                        _br(),
                        _br(),
                        _br(),
                        _br()
                ]
            },
            //10 page 26
            {
                elements:[
                   _div("class:overlaycontent-title", "text:{{congrats}}"),
                    _h5("text:{{" +customerName("newsettings",1)+ "}}"),
                    _h5("text:{{connectionlostpage}}"),
                    _br(),
                    _h6("text:{{" +xlate("yournewcredentials") + ": "+ "}}"),
                    _div("text: {{" +customerName("Password",1)+ "}}", _div("class:container_stored_modem","text:: " , _div("class:stored_modem" )  )),
                    _br(),
                     _h6("text:{{yournewwificredentials}}"),
                     _div("text: {{SSID}}", _div("class:container_stored_wifi_username","text:: " , _div("class:stored_wifi_username" )  )),
                     _div("text: {{" +customerName("Password",1)+ "}}", _div("class:container_stored_wifi_password","text:: " , _div("class:stored_wifi_password" )  ))
                ],
                btns:[
                    buttons(
                        [{
                            value:xlate("Close"),
                            class: "wizard_close",
                            func:function onclick() {
                                 closeFirstInstall();
                            }
                        },
                        {
                            value:xlate("Continue"),
                            func:function onclick() {
                                 WiFiWizard.next();
                            }
                        }], {btnClass:"wizard_button"})
                ]
            },
            //11 page 27
            {
                elements:[
                   _div("class:overlaycontent-title", "text:{{" +customerName("Iamready",1)+ "}}"),
                    _h5("text:{{" +customerName("Iamreadypage1",1)+ "}}"),
                    _br(),
                    text("LoginPassword3",{label:customerName("Password",1), isBuildTable:true, width:"45%", withoutHelpTxt:true})
                ],
                btns:[
                    buttons(
                        [{
                            value:xlate("Exit"),
                            class: "wizard_close",
                            func:function onclick() {
                                closeFirstInstall();
                            }
                        },
                        {
                            value:xlate("Next"),
                            func:function onclick() {

                                if(ModemPasswordValidation("LoginPassword3", $("#LoginPassword3").val()))
                                {
                                    //arFirstInstallWizardCompletionStatus.set("1");
                                    var data = {"firstInstallStatus": "true"};
                                    setUserData(data);
                                    //MibObjects.ApplyAllSettings.set(1, "", true);
                                    //PollAndApply();
                                    WiFiWizard.close();
                                    refresh();
                                }
                            }
                        }], {btnClass:"wizard_button"})
                ]
            },
            //12 page 28 forgot password

            {/*
                elements:[
                    _div("class:overlaycontent-title", "text:{{forgotpassword}}"),
                    _h5("text:{{" +customerName("forgotpasswordpage",1)+ "}}"),
                    _br(),
                    text("email", {withoutHelpTxt:true, label:"email", isBuildTable:true, width:"60%", applyHook:_applyHook_forgotemail, format:fmtEmail()})


                ],
                btns:[
                    buttons(
                        [{
                            value:xlate("Back"),
                            class: "wizard_back",
                            func:function onclick() {
                                WiFiWizard.prev();
                            }
                        },
                        {
                            value:xlate("Continue"),
                            func:function onclick() {
                                var opt = {applyHook:_applyHook_forgotemail,
                                    refreshPage:false,
                                    withoutApplyAllSettings:true,
                                    noWaitDialog:true,
                                    storeFun:function(){
                                        $.logLGI("Sending email details..");
                                        setTimeout(function(){
                                            arEmailAddress.set($('#email').val(), "", true);
                                            arEmailApplySettings.set(1, "", true);
                                            arEmailSend.set(2, "", true);
                                        }, 2000);
                                        WiFiWizard.gotoframe(12);
                                    }
                                };
                                Apply(opt);
                            }
                        }], {btnClass:"wizard_button"})
                ]
            */},
            //13
            {/*
                elements:[
                        _div("class:overlaycontent-title", "text:{{WiFiNetwork}}"),
                        _h5("text:{{" +customerName("WiFiNetworkDescr2",1)+ "}}"),
                        _h5("text:{{" +customerName("WiFiNetworkDescr3",1)+ "}}"),
                        _br(),
                        _h5("text:{{thankYou}}"),
                         _br(),
                        _div("class:loadingWait")
                ]
            */},

        ],
        {noTitle:true, noClose:true, overlayCls:"overlay_modemBG"}
    );
}

function ConfigureWiFi(newName, newPass)
{
	return;
    arBssActive.set(getPrimary24G(), 1);
    arBssActive.set(getPrimary50G(), 1);

    arBssSSID.set(getPrimary24G(), convertSSIDName(newName), "NewWiFiNetworkName", true);
    arBssSSID.set(getPrimary50G(), convertSSIDName(newName), "NewWiFiNetworkName", true);

    arBssSecurityMode.set(getPrimary24G(), 3);
    arBssSecurityMode.set(getPrimary50G(), 3);

    arWPAAlgorithm.set(getPrimary24G(),2);
    arWPAAlgorithm.set(getPrimary50G(),2);

    arWPAPreSharedKey.set(getPrimary24G(), newPass);
    arWPAPreSharedKey.set(getPrimary50G(), newPass);

    //MibObjects.ApplyAllSettings.set(1, "", true);
    PollAndApply();
}

function enableParentalControl(pvalue)
{
    arEnableParentalCont.set(pvalue?1:2);
    //MibObjects.ApplyAllSettings.set(1, "", true);
    PollAndApply();
}

function closeFirstInstall()
{
    // save
    //arFirstInstallWizardCompletionStatus.set("1");
    var data = {"firstInstallStatus": "true"};
    setUserData(data);
    //MibObjects.ApplyAllSettings.set(1, "", true);
    //PollAndApply();
    // clear everything.
    $('body').empty();
    logout();
    clearLoginCredential();
    clearSessionStorage();
    window.open('about:blank','_parent','');
    window.close();
}

function closeFirstInstallWifi() {
    logout();
    clearLoginCredential();
    clearSessionStorage();
    window.open('about:blank','_parent','');
    window.close();
}

function checkForCablecom()
{
    if(getSessionStorage("ar_skin") === "cablecom")
    {
        $(".login_logo").removeClass("login_logo").addClass("login_logo_ucom");
        $(".logo_container").removeClass().addClass("logo_container_ucom");
    }
}

function changeSVG(){

        jQuery('img[src$=".svg"]').each(function(){
            var $img = jQuery(this);
            var imgID = $img.attr('id');
            var imgClass = $img.attr('class');
            var imgURL = $img.attr('src');

        //if(imgClass == 'skipSVG')
        if(imgClass && imgClass.contains('skipSVG'))
        {
            $.log("skipping SVG conversion for " + imgURL);
            return;
        }

      var dimensions = {
        w: $img.attr('width'),
        h: $img.attr('height')
      };
            $.log("SVG inline conversion.. url: " + imgURL + "w = " + dimensions.w + " h= " + dimensions.h);
            jQuery.get(imgURL, function(data) {

                var $svg = jQuery(data).find('svg');
                $.log("inline() " + $svg);

                if(typeof imgID !== 'undefined') {
                    $svg = $svg.attr('id', imgID);
                }

                if(typeof imgClass !== 'undefined') {
                    $svg = $svg.attr('class', imgClass+' replaced-svg');
                }

              $svg = $svg.attr('width', dimensions.w);
              $svg = $svg.attr('height', dimensions.h);

              $svg = $svg.removeAttr('xmlns:a');


                $img.replaceWith($svg);

            }, 'xml');

        });
}


function showErrorTipsButton(btnId , message, bShow, custom) {
    var ctrl = $("#" + btnId);
    var ctrlParent = $(ctrl).parent();
    if (!ctrl) return null;
    var errTipId = "errTip_" + btnId;

    if(bShow)
    {
        if($("#" + errTipId).length == 0) {
              $(ctrlParent).after("<div id='"+errTipId+"' class='errorTip'><div class='body'><div id='errClose-"+btnId+"' class='errTipClose'></div><span></span></div></div>");
        }
        var msg = (custom != "undefined" ? message : xlate(message));
        $("#"+errTipId).show();
        $("#"+errTipId+" span").text(msg);
        $("#"+errTipId).css('width', "250px");
    }
    else
    {
        $("#" + errTipId).length ? $("#"+errTipId).remove() : null;
    }
}

/*Temprory commented out as per CR-020
function forgotPasswordWizard()
{
    var _hook = [];
    var forgotPasswordWiz = new WizardFrames("forgotPasswordWiz",
         [
            {
                info:"forgotpasswordpage",
                elements:[
                    text("recoveryEmail", {isBuildTable:true, withoutHelpTxt:true, label:"email", applyHook:_hook, format:fmtEmail()})
                ],
                btns:[
                    buttons(
                        [
			    {
				value:xlate("Back"),
				class: "wizard_back",
				func:function onclick() {
				forgotPasswordWiz.close();
								}
			    },
                            {
                                value:xlate("Continue"),
                                class: "wizard_button",
                                func:function onclick() {
                                    var opt = {applyHook:_hook,
                                        refreshPage:false,
                                        withoutApplyAllSettings:true,
                                        noWaitDialog:true,
                                        storeFun:function(){
                                            $.log("Setting email details");
                                            setTimeout(function(){
                                                    arEmailAddress.set($('#recoveryEmail').val(), "", true);
                                                    arEmailApplySettings.set(1, "", true);
                                                    arEmailSend.set(2, "", true);
                                                }, 2000);
                                            forgotPasswordWiz.close();
                                        }
                                    };
                                    Apply(opt);
                                }
                            }
                        ]
                    )
                ]
            }
        ], {noClose:true}
    );

    $("#recoveryEmail").val("");
    return forgotPasswordWiz;
}*/

function routerStatusWizard()
{
    var routerStatusdWiz = new WizardFrames("RouterStatusTitle",
         [
            {
                elements:[
				_div("id:routerMainPage")
                ]
            }
        ], {noClose:true}
    );
    return routerStatusdWiz;
}

function loadStatusData(netdata) {
    //load the js variables
    js_acquiredDownstreamChannel = netdata[0];
    js_rangedUpstreamChannel = netdata[1];
    js_acquiredDownstreamChannelStatus = netdata[2];
    js_rangedUpstreamChannelStatus = netdata[3];
    js_provisioningState = netdata[4];
    js_networkAccess = netdata[5];
    js_maxCpeAllowed = netdata[6];
    js_bpiState = netdata[7];
    js_docsisVersion = netdata[8];
    js_bootFileName = netdata[9];
    js_downStreamSFID = netdata[10];
    js_downStreamMaxTrafficRate = netdata[11];
    js_downStreamMaxTrafficBurst = netdata[12];
    js_downStreamMinTrafficRate = netdata[13];
    js_upStreamSFID = netdata[14];
    js_upStreamMaxTrafficRate = netdata[15];
    js_upStreamMaxTrafficBurst = netdata[16];
    js_upStreamMinTrafficRate = netdata[17];
    js_upStreamMaxConBurst = netdata[18];
    js_schedulingType = netdata[19];
    js_downStreamChannel = JSON.parse(netdata[20]);
    js_upStreamChannel = JSON.parse(netdata[21]);
    js_networkData = JSON.parse(netdata[22]);
    js_downStreamChannel31 = JSON.parse(netdata[23]);
    js_upStreamChannel31 = JSON.parse(netdata[24]);
    js_UpStreamNumber = netdata[25];
    js_DownStreamNumber = netdata[26];
    js_UpStream31Number = netdata[27];
    js_DownStream31Number = netdata[28];
    js_primaryDSChannelType = netdata[29];

    ag.setValue("PrimaryFreq", js_acquiredDownstreamChannel);
    ag.setValue("PrimaryUpFreq", js_rangedUpstreamChannel);
    ag.setValue("DownstreamStatus", js_acquiredDownstreamChannelStatus);
    ag.setValue("rangedUpstream", js_rangedUpstreamChannelStatus);
    ag.setValue("ProvisioningState", (parseInt(js_provisioningState) >= 6) ? xlate("Online") : xlate("Offline"));

    ag.setValue("networkAccess", js_networkAccess);
    ag.setValue("maxnoCPE", js_maxCpeAllowed);
    ag.setValue("baseLineprivacy", js_bpiState);
    ag.setValue("docsisMode", js_docsisVersion);
    ag.setValue("serverConfigFile", js_bootFileName);

    ag.setValue("DWsfid", js_downStreamSFID);
    ag.setValue("DWmaxRate", js_downStreamMaxTrafficRate);
    ag.setValue("DWmaxBurst", js_downStreamMaxTrafficBurst);
    ag.setValue("DWminRate", js_downStreamMinTrafficRate);
    ag.setValue("UPsfid", js_upStreamSFID);
    ag.setValue("UPmaxRate", js_upStreamMaxTrafficRate);
    ag.setValue("UPmaxBurst", js_upStreamMaxTrafficBurst);
    ag.setValue("UPminRate", js_upStreamMinTrafficRate);
    ag.setValue("UPmaxConBurst", js_upStreamMaxConBurst);
    ag.setValue("UPschedType", js_schedulingType);

    ag.setValue("DownStreamChannel", js_downStreamChannel);
    ag.setValue("UpStreamChannel", js_upStreamChannel);
    ag.setValue("NetworkLog", js_networkData);

    ag.setValue("UpStreamNumber", js_UpStreamNumber);
    ag.setValue("DownStreamNumber", js_DownStreamNumber);
    ag.setValue("UpStream31Number", js_UpStream31Number);
    ag.setValue("DownStream31Number", js_DownStream31Number);
    ag.setValue("docsisXMode", "DOCSIS ".concat(js_docsisVersion));
    ag.setValue("DownstreamType", js_primaryDSChannelType);
}

function buildrouterStatusWiz() {
    var routerStat = routerStatusWizard();
    var loaderImgae = _img("src:skins/lgi/css/images/loading.gif", "height:100px", "width:100px");
    var data;

    //request status through ajax call
    $.ajax({
        type: "POST",
        url: "php/ajaxGet_device_networkstatus_data.php",
        dataType: "json",
        success: function(msg) {
            data = msg;
            $.cachedScript("device_networkstatus_data.js");
            $.cachedScript("device_networkstatus.js");

            OpenrouterStatusWiz = function(){
                $('.RSextra-button').hide();
                $("#routerMainPage").empty();
                $(loaderImgae.toHTML()).appendTo($("#routerMainPage"));

                setTimeout(function(){
                    //if(clearNwMIBData) clearNwMIBData();
                    if(loadStatusData) loadStatusData(data);
                    if(buildRouterStatus)
                    {
                        $("#routerMainPage").empty();
                        var networkStatus = buildRouterStatus(0);
                        $(networkStatus.toHTML()).appendTo($("#routerMainPage"));
                    }
                    $('<div class="routerBackBtn"><input type="button" value="Back" class="wizard_back CMS"></div>').insertAfter('#roustatus #cableModemStatus');
                    $('.routerBackBtn .CMS').bind('click', function(e){
                        $('#routerMainPage').empty();
                        routerStat.close();
                        $('.RSextra-button').show();
                    });
                routerStatusBind();
                changeSVG();
                }, 1000);
                routerStat.open();
            }
            var routerStatusLink = _div("class:RSextra-button",_a("onclick: OpenrouterStatusWiz()", _span("text:{{CheckRouterStatus}}")));
            $(routerStatusLink.toHTML()).appendTo("body");
        },
        async:false,
        cache:false,
        error: function(){
        }
    });
}

function verifyLoginCredential() {
	/*
    function verify(){
        if (!readCookie("credential"))
            refresh();
    }
    if (readCookie("credential"))
    {
        snmpGet1Async(arCurrentTime.oid+".0", verify, verify);
    }
    else
        return true;
	*/
	 return true;
}

function isAdminDefPasswdChanged()
{
    if (attrs["DefPasswdChanged"] && attrs["DefPasswdChanged"].contains("YES"))
    {
        return true;
    }
    else
    {
        return false;
    }
}

function isRemotelyLoggedIn()
{
    if (attrs["gwWan"].contains("t") && !isTechnician() )
    {
        return true;
    }
    else
    {
        return false;
    }
}

function isMultiLogin(isloggedin, errorID) {
    if( isloggedin == '1' )
    {
        ag.getFormatter(errorID).errMsg = xlate("Local user has already logged in, please wait...");
    }
    else if( isloggedin == '2' )
    {
        ag.getFormatter(errorID).errMsg = xlate("Remote user has already logged in, please wait...");
    }
    else if( isloggedin == '3' )
    {
        ag.getFormatter(errorID).errMsg = xlate("Other local user has already logged in, please wait...");
    }
    else if( isloggedin == '4' )
    {
        ag.getFormatter(errorID).errMsg = xlate("Other remote user has already logged in, please wait...");
    }
    else
    {
        return false;
    }
    return true;
}

function LoginNoticeWizard()
{
    var loginNoticeWiz = new WizardFrames("NoticeTitle",
         [
            {
                elements:[
				_div("text:{{}}")
                ],
                btns:[
                    buttons(
                        [
                            {
                                value:xlate("Back"),
                                class: "wizard_back",
                                func:function onclick() {
                                    loginNoticeWiz.close();
                                }
                            },
                            {
                                value:xlate("Exit"),
                                class: "wizard_button",
                                func:function onclick() {
                                    clearSessionStorage();
                                    window.open('about:blank','_parent','');
                                    window.close();
                                }
                            }
                        ]
                    )
                ]
            }
        ], {noClose:true}
    );
    return loginNoticeWiz;
}

function handleLogin(username, password, id, csrEnabled)
{
    clearSessionStorage();
    login(username, password);
    if (UserName == "upccsr")
    {
        console.log("cpsuser message");

        var loggedInVal = isLoggedIn();
       if ((loggedInVal == false) )
          {
           ag.getFormatter(id).errMsg = xlate("errMsg_InvalidPassword");
           showErrorTips(id, true);
           return false;
          }
        if ( isMultiLogin(loggedInVal, id) ){
            //            clearLoginCredential();
            if (loggedInVal == 3) {
                var loginNotice = LoginNoticeWizard();
                loginNotice.open();
                $('.overlaycontent').text(customerName("CsrActiveMsg",1));
            } else {
                showErrorTips(id, true);
            }
            return false;
        }
    }
    else
    {
        if (!isLoggedIn()) {
            if( csrEnabled )
            {
                disableControls("#" + id,true);
                ag.getFormatter(id).errMsg = xlate("CsrActiveMsg");
                var loginNotice = LoginNoticeWizard();
                loginNotice.open();
                $('.overlaycontent').text(customerName("CsrActiveMsg",1));
            }
            // PEGATRON ADD START , PD9900
            else if(ag.isGUIblocked)
            {
                ag.getFormatter(id).errMsg = xlate("Locked Out");
                showErrorTips(id, true);
            }
            // PEGATRON ADD END , PD9900
            else
            {
                ag.getFormatter(id).errMsg = xlate("errMsg_InvalidPassword");
                showErrorTips(id, true);
            }
            return false;
        }
        else
        {
            var loggedInVal = isLoggedIn();
            if ((loggedInVal == false))
               {
                ag.getFormatter(id).errMsg = xlate("errMsg_InvalidPassword");
                showErrorTips(id, true);
                return false;
               }
            if ( isMultiLogin(loggedInVal, id) ){
                //            clearLoginCredential();
                if (loggedInVal == 3) {
                    var loginNotice = LoginNoticeWizard();
                    loginNotice.open();
                    $('.overlaycontent').text(customerName("AnotherUserActiveMsg",1));
                } else {
                    showErrorTips(id, true);
                }
                return false;
            }
        }
    }
    return true;
}
function replaceCustomerName(str,arg1){
    // replace the string with %s to corresponding customer name
    while(arg1 != 0){
        if (customerId() == 8) {
            str = str.replace("%s",CustNameVM);
        } else if (customerId() == 41) {
            str = str.replace("%s",CustNameVMIE);
        } else if (customerId() == 6) {
            str = str.replace("%s",CustNameVTR);
        } else if (customerId() == 20) {
            str = str.replace("%s",CustNameZiggo);
        } else if (customerId() == 44) {
            str = str.replace("%s",CustNameTMAustria);
        } else {
            str = str.replace("%s",CustNameLGI);
        }
        arg1--;
    }
    return str;
}
function customerName(id,arg1){
    var o = _xlate [id];

    while(arg1 != 0){
        if (customerId() == 8) {
            o = o.replace("%s",CustNameVM);
        } else if (customerId() == 41) {
            o = o.replace("%s",CustNameVMIE);
        } else if (customerId() == 6) {
            o = o.replace("%s",CustNameVTR);
        } else if (customerId() == 20) {
            o = o.replace("%s",CustNameZiggo);
        } else if (customerId() == 44) {
            o = o.replace("%s",CustNameTMAustria);
        } else {
            o =  o.replace("%s",CustNameLGI);
        }
        arg1--;
    }
    return o;
}
Array.prototype.unique = function()
{
    var n = {},r=[];
    for(var i = 0; i < this.length; i++)
    {
        if (!n[this[i]])
        {
            n[this[i]] = true;
            r.push(this[i]);
        }
    }
    return r;
}

function PollAndApply() {
    var retryCount = 1;
    var timeout = false;
    var initTime = new Date().getTime();
    var currentTime;

    function getStatus(){
        var strTmp = "";
        try {
            strTmp = snmpGet1(arApplyAllSettings.oid+".0");
        } catch (e) {
            strTmp = "";
        }

        $.log("PollAndApply(): arApplyAllSettings = " + strTmp);
        return strTmp;
    }

    while (  timeout == false )
    {
        if(getStatus() != 1){
            currentTime = new Date().getTime();
            $.log("PollAndApply(): timeElapsed = " + (currentTime-initTime)/1000);
            if( Math.floor((currentTime-initTime)/1000) > 125){ timeout = true; }
        }
        else{
            break;
        }
    }

    if (  timeout == true)
    {
        $.log("arReinitStatus max retries reached.. " + retryCount);
        alert("Router Not Ready!!");
        throw("error");
    }
    else
    {
        MibObjects.ApplyAllSettings.set(1,"",true);
    }
}
function check_Admin_Status(asyncValue, callback) {
     var rv = { adminStatus:"", regF:"" };
     jQuery.ajax({
        url:"checkAdminStatus",
        success:function (result) {
            rv = result;
            var o = JSON.parse(rv);
            attrs["adminStatus"] = o["adminStatus"];
            attrs["regF"] = o["regF"];
            if(callback) {
                callback();
            }
         },
         dataType:"text",
         async:asyncValue,
         cache:false
     });
}

function check_ConType() {
    var rv = { conType:"", gwWan:"", remoteAddr:"", lang:"", provMode:"", dsLite:"", modemMode:"", firstInstall:""};
    /*jQuery.ajax({
        url:"checkConnType",
        success:function (result) {
            rv = result;
        },
        dataType:"text",
        async:false,
        cache:false
    });*/

    rv = '{ "conType":"LAN", "gwWan":"f", "remoteAddr":"10.237.10.68", "lang":"English", "provMode":"3", "dsLite":"0", "modemMode":"5", "firstInstall":"0"}';
    var o = JSON.parse(rv);
    attrs["conType"] = o["conType"];
    attrs["gwWan"] = o["gwWan"];
    attrs["remoteAddr"] = o["remoteAddr"];
    attrs["provMode"] = o["provMode"];
    attrs["DSLite"] = o["dsLite"];
    attrs["modemMode"] = o["modemMode"];
    //setSessionStorage("ar_language",  o["lang"] || "English");
    //setSessionStorage("ar_first_install",  o["firstInstall"] || "0");
    // LGI MOD START
    var getData = {"lang": "", "firstInstallStatus": "", "firstInstallState": ""};
    // LGI MOD END
    data = getUserData(getData);
    setSessionStorage("ar_language",  data["lang"] || "en");
    // LGI MOD START
    var firstInstall = (data['firstInstallStatus'] == 0 && data['firstInstallState'] == 0)?0:1;
    setSessionStorage("ar_first_install",  firstInstall || "0");
    // LGI MOD END
}

function getNetworkAccess() {
    if (!(eRouterInitMode.get() == 1 || (isZiggo() && arWanIPProvMode.get() == 0))){  // if not in modem mode, check for eRouter IP
        return (nullIp("" + arWanCurrentIPAddr.get(1)) == 1) && (nullIp("" + arWanCurrentIPAddr.get(2)) == 1);
    }
    else { // if in modem mode, first check for 'NetworkAccess' parameter in config file then check for CM IP
       return (arDevNetworkAccess.get() == "0") || (nullIp("" + arCmDoc30DhcpCmIpAddr.get()) == 1);
    }
}

function prefixLength(n) {
    var count = 0;
    while(n > 0) {
        count = count + 1;
        n = n & (n-1);
    }
    return count;
}
function encode_Html(str){
	return str.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
                .replace(/'/g, "&#039;");
}

function decode_Html(str)
{
    var map =
    {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#039;': "'"
    };
    return str.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, function(m) {return map[m];});
}

function setWifiAndPasswordData() {
    var data = {"prim24gssid": store_modem_Password.NewWiFiNetworkName, "prim24gpassphrase": store_modem_Password.NewWiFiPassword, "prim5gssid": store_modem_Password.NewWiFiNetworkName, "prim5gpassphrase": store_modem_Password.NewWiFiPassword};
    setWifiData(data);
    poll();
}

//This function request send every seconds untill page response get success
function poll() {
        $.ajax({
                type: "GET",
                url: "php/wifi_data.php",
                data: { opType: "READ" },
                dataType: "text",
                success: function(msg) {
                        changePassword($("#LoginPassword1").val(), store_modem_Password.modem_password);
                        WiFiWizard.gotoframe(10);
                },
                timeout: 1000,
                error: function(){
                        console.log("Error to get");
                        setTimeout(poll,5000);
                }
        });
}

function pollLastError() {
        $.ajax({
                type: "GET",
                url: "php/ddns_setting_data.php",
                data: { opType: "READ" },
                dataType: "text",
                success: function(msg) {
                    WaitDialogCustom.closeImmediately(false);
                    var ddnsLastError = msg.match(/'[^']*'/g);
                    ddnsLastError[5] = ddnsLastError[5].replace(/\'/gi,'');
                    if( ddnsLastError[5] != "NO_ERROR")
                    {
                        $('.settings-updates-success').css('border','1px solid #333');
                        $('#confirm-wizard').find('img').attr('src','i/error-icon.svg');
                        var ErrMsg = (ddnsLastError[5] == "AUTHENTICATION_ERROR") ? "AuthenticationFailed" : "SpinnerFailure";
                        $('.confirm-wizard-text').text(xlate(ErrMsg));
                    }
                },
                timeout: 1000,
                error: function(){
                        WaitDialogCustom.closeImmediately(false);
                        console.log("Error to get");
                }
        });
}

function uncheckAllLanguage() {
    for(key in LGICodeLangSet)
    {
        var lang = getLangfromCode(key);
        $("#"+lang).attr("checked",false);
    }
}

function updateDirtyCheckBeforePushTable(tableName,numberOfRow)
{
    j=0;
    while (j < numberOfRow)
    {
        var id = tableName + "-Delete-" + j;
        if (typeof ag[id] == "undefined")
            break;
        else
        {
            ag[id].origValue = 0;
            ag[id].value = 0;
        }
        ++j;
    }
    j=0;
    while (j < 32)
    {
        var id = tableName + "-Enabled-" + j;
        if (typeof ag[id] == "undefined")
            break;
        else
        {
            ag[id].origValue = ag[id].ctrl.getValue();
        }
        ++j;
    }
}

function updateDirtyCheckPushTable(tableName, rowNumber, enableVal)
{
    var item = tableName + "-Enabled-" + (rowNumber-1);
    if (typeof ag[item] != "undefined")
    {
        if (enableVal == "true")
            ag[item].origValue = 1;
        else
            ag[item].origValue = 0;
        ag[item].ctrl.setValue(ag[item].origValue);
    }
}

function updateDirtyCheckAfterPushTable(tableName)
{
    j=0;
    while (j < 32)
    {
        var id1 = tableName + "-Enabled-" + j;
        if (typeof ag[id1] == "undefined")
            break;
        else
        {
            if (typeof ag[id1].origValue == "undefined")
            {
                ag[id1].origValue = ag[id1].value;
            }
        }
        ++j;
    }
}
