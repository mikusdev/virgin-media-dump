//(c) Copyright 2018, ARRIS Group, Inc., All rights reserved.
// Loaded by Dialog widget, this file must provide below hooks:
// 		dialog_loadData() for data loading,
//		dialog_build() for building page elements.

// Flag to store the ping result
var pingResult = -1;
// Separate flags to store the result of each step of diagnostics procedure
var connectionCheckStatus = -1;
var telephoneCheckStatus = -1;
var ethernetCheckStatus = -1;
var wifiCheckStatus = -1;
// Flag to store the final result of diagnostics procedure
var diagnosticResultsStatus = -1;

var resultMsg = "";

// Setters for the different flags
function setPingResultStatus(result) {
    pingResult = result;
}

function setConnectionCheckStatus(status) {
    connectionCheckStatus = status;
}

function setTelephoneCheckStatus(status) {
    telephoneCheckStatus = status;
}

function setEthernetCheckStatus(status) {
    ethernetCheckStatus = status;
}

function setWifiCheckStatus(status) {
    wifiCheckStatus = status;
}
function setDiagnosticsResultsStatus(status) {
    diagnosticResultsStatus = status;
}
var TSdata = {"DhcpCmIpAddr": "", "RouterWANIPPRovMode": "", "WanIP6Addr": "", "WanIPAddr": ""};

function checkBroadbandService(iterId) {
    TSdata = getTroubleshootData(TSdata);
    // CM is not online
    if (nullIp("" + TSdata['DhcpCmIpAddr']) == 1) {
        addStatusMsg(customerName("CheckCoaxialCable",1), iterId);
        setPingResultStatus(0);
        proceedWithTempCheck(iterId);
    }
    else { // CM is online
        addStatusMsg(xlate("BroadbandConnectionUp"), iterId);
        // Assuming we are in router mode, as there is no diagnostics wizard in bridge mode
        // Checking provisioning mode
        rs = TSdata['RouterWANIPPRovMode'];
        if (rs == 2) {
            // ipv6 provisioned
            followIpv6ProvisionedPath(iterId);
        }
        else if (rs == 1) {
            // ipv4 provisioned
            followIpv4ProvisionedPath(iterId);
        }
        else if (rs == 3) {
            // dual stack provisioned
            followDualStackProvisionedPath(iterId);
        }
    }
}

function followIpv6ProvisionedPath(iterId) {
	rs = TSdata['WanIP6Addr'];
    if((rs === "") || (rs === "::")) { // invalid ipv6 address
        addStatusMsg(xlate("Ipv6AddressNotValid"), iterId);
        setPingResultStatus(0);
        addStatusMsg(customerName("NoBroadbandConnection",1), iterId);
        proceedWithTempCheck(iterId);
    }
    else { // valid ipv6 address
        addStatusMsg(xlate("Ipv6AddressValid"), iterId);
        checkPing(2, "ipv6.google.com", iterId);
    }
}

function followIpv4ProvisionedPath(iterId) {
	rs = TSdata['WanIPAddr'];
    if (nullIp(rs)) {
        // invalid ipv4 address
        addStatusMsg(xlate("Ipv4AddressNotValid"), iterId);
        setPingResultStatus(0);
        addStatusMsg(customerName("NoBroadbandConnection",1), iterId);
        proceedWithTempCheck(iterId);
    }
    else {
        // valid ipv4 address
        addStatusMsg(xlate("Ipv4AddressValid"), iterId);
        checkPing(1, "google.com", iterId);
    }
}

function followDualStackProvisionedPath(iterId) {
    rs = TSdata['WanIPAddr'];
    rs1 = TSdata['WanIP6Addr'];
    if (!nullIp(rs) && !(rs1 === "") && !(rs1 === "::")) {
        // Dual ip are valid addresses, do IPv6 DNS Query and run ping test
        addStatusMsg(xlate("Ipv6Ipv4AddressValid"), iterId);
        checkPing(2, "ipv6.google.com", iterId);
    }
    else {
        // Check if partial ip is a valid address
        if(!nullIp(rs)) {
            // Partial ip - ipv4 is a valid address
            addStatusMsg(xlate("Ipv4AddressValid"), iterId);
            addStatusMsg(xlate("Ipv6AddressNotValid"), iterId);
            checkPing(1, "google.com", iterId);
        }
        else if(!(rs1 === "") && !(rs1 === "::")) {
            // Partial ip - ipv6 is a valid address, run ping test
            addStatusMsg(xlate("Ipv6AddressValid"), iterId);
            addStatusMsg(xlate("Ipv4AddressNotValid"), iterId);
            checkPing(1, "ipv6.google.com", iterId);
        }
        else {
            // Partial ips are not valid addresses
            addStatusMsg(xlate("Ipv4AddressNotValid"), iterId);
            addStatusMsg(xlate("Ipv6AddressNotValid"), iterId);
            setPingResultStatus(0);
            addStatusMsg(customerName("NoBroadbandConnection",1), iterId);
            proceedWithTempCheck(iterId);
        }
    }
}


function checkTelephoneConnections(iterId) {
    var MTAdata = {"line1Status":"","line2Status":"","Call1Status":"","Call2Status":"","mtaAdminState":""};
    MTAdata = getTroubleshootData(MTAdata);
    mtaState = MTAdata['mtaAdminState'];
    if (mtaState.contains("NOLINE")) {
        addStatusMsg(xlate("NoVoiceService"),iterId);
    } else {
	CallPState1 = MTAdata['Line1Status'];
        CallPState2 = MTAdata['Line2Status'];
        OpStatus1 = MTAdata['Call1Status'];
        OpStatus2 = MTAdata['Call2Status'];
        if (mtaState.contains("Both")) {
            if (OpStatus1 != 1 || CallPState1 == 26 || CallPState1 == 25) {
                addStatusMsg(xlate("TelephonyLineStatus", "1") + " " + xlate("NotReadyTEL"),iterId);
                setTelephoneCheckStatus(0);
                setDiagnosticsResultsStatus(0);
            }
            if (OpStatus2 != 1 || CallPState2 == 26 || CallPState2 == 25) {
                addStatusMsg(xlate("TelephonyLineStatus", "2") + " " + xlate("NotReadyTEL"),iterId);
                setTelephoneCheckStatus(0);
                setDiagnosticsResultsStatus(0);
            }
        } else if(mtaState.contains("LINE1") && (OpStatus1 != 1 || CallPState1 == 26 || CallPState1 == 25)) {
            addStatusMsg(xlate("TelephonyLineStatus", "1") + " " + xlate("NotReadyTEL"),iterId);
            setTelephoneCheckStatus(0);
            setDiagnosticsResultsStatus(0);
        } else if(mtaState.contains("LINE2") && (OpStatus2 != 1 || CallPState2 == 26 || CallPState2 == 25)) {
            addStatusMsg(xlate("TelephonyLineStatus", "2") + " " + xlate("NotReadyTEL"),iterId);
            setTelephoneCheckStatus(0);
            setDiagnosticsResultsStatus(0);
        }
    }
}

function checkEthernetConnections(iterId) {
    var ethernetPortSpeedSlow = 0;
    checkEthernetPortSpeed(ethernetPortSpeedSlow);
    setOriginalLinkStatus();
    // Check for port speed after some time
    setTimeout(function() {
        if (ethernetPortSpeedSlow == 1) {
            addStatusMsg(xlate("LimitedInHomeConnectivity"), iterId);
            setEthernetCheckStatus(0);
            setDiagnosticsResultsStatus(0);
        }
        else {
            //Check link up and down status only when it is connected through CM IP using WAN or eRouter IP using LAN
            // Link up and down for every ethernet client link
            toggleEthernetLink();
            setTimeout(function() {
                toggleEthernetLink();
                setTimeout(function() {
                    toggleEthernetLink();
                    // Check for link status after some time
                    var ethernetLinkDown = 0;
                    setTimeout(function() {
                        checkEthernetLinkStatus(ethernetLinkDown);
                        setTimeout(function() {
                            if (ethernetLinkDown == 1) {
                                addStatusMsg(xlate("CheckEthernetCableForDamage"), iterId);
                                setEthernetCheckStatus(0);
                                setDiagnosticsResultsStatus(0);
                            }
                            else {
                                setEthernetCheckStatus(1);
                            }
                        }, 5000);
                    }, 20000);
                }, 10000);
            }, 10000);
        }
    }, 5000);
}

function checkWiFiConnections(iterId) {
    var wifi24Down = 0;
    var wifi50Down = 0;
    var WiFidata = {"WLAN24GStatus":"","WLAN5GStatus":"","WiFiClientCount":"","WiFiClientSignal":"","WiFiClientAddr":""};

    WiFidata = getTroubleshootData(WiFidata);
    // Check WiFi 2.4G interface status
    if (!(WiFidata['WLAN24GStatus'])) {
        wifi24Down = 1;
        addStatusMsg(xlate("PrimaryWifi24Disabled"), iterId);
    }

    // Check WiFi 5G interface status
    if (!(WiFidata['WLAN5GStatus'])) {
        wifi50Down = 1;
        addStatusMsg(xlate("PrimaryWifi50Disabled"), iterId);
    }

    setTimeout(function() {
        if (wifi24Down == 1 && wifi50Down == 1) {
            setWifiCheckStatus(0);
            setDiagnosticsResultsStatus(0);
        }
    }, 10000);

    setTimeout(function() {
        // Check WiFi linked clients signal strength only if both interfaces are not down
        if (wifi24Down != 1 || wifi50Down != 1) {
            var name;
            var clientsWithLowRSSI = 0;
            var WiFidata = {"WiFiClientCount": "", "WiFiClientSignal": "", "WiFiClientAddr":""};
            WiFidata = getTroubleshootData(WiFidata);
            var clientCount = parseInt(WiFidata["WiFiClientCount"]);
            for (var i=0; i<clientCount; i++) {
                if (parseInt(WiFidata["WiFiClientSignal"][i]) < -60) {
                    clientsWithLowRSSI++;
                    // show the low signal message for this client (with mac id)
                    var msgLowSignal = xlate("DeviceHasLowSignal",WiFidata["WiFiClientAddr"][i]);
                    msgLowSignal = replaceCustomerName(msgLowSignal, 2);
                    addStatusMsg(msgLowSignal, iterId);
                }
            }

                if (clientsWithLowRSSI >= 1) {
                    addStatusMsg(customerName("PlaceWifiDeviceNear", 1), iterId);
                    setWifiCheckStatus(0);
                    setDiagnosticsResultsStatus(0);
                }
        }
    }, 15000);
}

var originalLinkStatus = [];
function checkEthernetPortSpeed(result) {
    var data = {"LanPortStatus": "", "LanPortSpeed": ""};
    data = getTroubleshootData(data);
    for (var i=0; i<4; i++) {
        if ((data["LanPortStatus"][i] === "Up") && (parseInt(data["LanPortSpeed"][i]) < 1)) {
            result = 1;
            break;
        }
    }
}

function checkEthernetLinkStatus(result) {
    var data = {"LanPortStatus": ""};
    data = getTroubleshootData(data);
    for (var i=0; i<4; i++) {
        if (!(data["LanPortStatus"][i] === originalLinkStatus[i])) {
            result = 1;
            break;
        }
    }
}

function setOriginalLinkStatus() {
    var data = {"LanPortStatus": ""};
    data = getTroubleshootData(data);
    for (var i=0; i<4; i++) {
        originalLinkStatus[i] = data["LanPortStatus"][i];
    }
}

function proceedWithTempCheck(iterId) {
    var isOverTempReached = 0;
    if (checkCPUorTunerTemperature()) {
        // set flag for tuner temperature overhead
        isOverTempReached = 1;
        addStatusMsg(customerName("TemperatureTooHigh", 1), iterId);
        proceedWithConnectionFail(iterId);
    }
    else {
        addStatusMsg(customerName("TemperatureNormal", 1), iterId);
        if (pingResult == 1 && isOverTempReached == 0) {  // if ping success and over temp not reached, proceed with telephony check
            checkTelephoneConnections(iterId);
        }
        else {
            proceedWithConnectionFail(iterId);
        }
    }
}

function checkCPUorTunerTemperature() {
    var data = {"failSafeMode": ""};
    data = getTroubleshootData(data);
    if (data['failSafeMode'] > 1) {
        return 1;
    }
    else {
        return 0;
    }
}

function proceedWithConnectionFail(iterId) {
    setConnectionCheckFail(iterId);
    setDiagnosticsResultsStatus(0);
    if (pingResult == 1) {
        checkTelephoneConnections(iterId);
    }
}

function setConnectionCheckFail(iterId)
{
    setConnectionCheckStatus(0);
    setDiagnosticsResultsStatus(0);
    if (pingResult == 1) {
        checkTelephoneConnections(iterId);
    }
}

function checkPing(targetIPType, targetAddress, iterId) {
    var pingData = {};
    if (targetIPType == 2) {
        pingData = {"DNS":"DNSQuery", "TargetAddress":"", "status":""};
        pingData['TargetAddress'] = targetAddress;
        pingData = getTroubleshootData(pingData);
        if (pingData['status'] == 0) {
            targetAddress = "google.com";
        }
    }
    var getPing = {"getPing":"true"};
    pingData = getPingDataWithoutLogin(getPing);
    if (pingData['status'] == "Complete") {
        if (pingData['SuccessCount'] > 0) {
            setPingResultStatus(1);
            addStatusMsg(customerName("BroadbandConnectionReady",1), iterId);
        } else {
            setPingResultStatus(0);
            addStatusMsg(customerName("NoBroadbandConnection",1), iterId);
        }
    }
    proceedWithTempCheck(iterId);
}

function toggleEthernetLink() {
    var data = {"LanPortLinkDownUp":"Request"};
    data = setTroubleshootData(data);
}

function dialog_loadData() {

}

function dialog_beforeClose()
{
    if (tmrId != 0) {clearTimeout(tmrId);}
    tmrId = 0;
}

var tmrId = 0;
function startTroubleshoot(){
	if (tmrId != 0) {clearTimeout(tmrId);}

	function setFinishOKMsg(){
            if (diagnosticResultsStatus == 0) {
                $(".wz_msg").find("img").attr("src","i/error-icon.svg");
            } else {
                $(".wz_msg").find("img").attr("src","i/allgood-icon.svg");
            }
            $(".wz_msg").find("img").show();
            if (diagnosticResultsStatus == 0) {
                $(".wz_msg").find(".wz_msg_h1").html(xlate("CouldNotFixTheProblem"));
            } else {
                $(".wz_msg").find(".wz_msg_h1").html(customerName("BroadbandConnectionWorking",1));
            }
            //$(".wz_msg").find(".wz_msg_h1").addClass("wz_msg_h1_success");
            $(".wz_msg").find(".wz_msg_descr").text("");
            $(".wz_msg").find("#messageTableBody").show();
	}
	var percent	= 0;
	function queryStatus(){
		//snmpGet1Async(statusOid, function(rs){
			// 
			percent ++;
            //percent = percent + 10;
			if (percent>100) percent = 100;
			ag.getObj("ProcessIndicator").setPos(percent);
			//setProcessText(percent+"%<br/><p>"+xlate("Done")+"</p>");
			if (percent == 100){
				//setProcessText(percent+"%<br/><p>"+xlate("Done")+"</p>");
                ag.getObj("ProcessIndicator").done("error");
				setFinishOKMsg();
				
			}else{
				tmrId = setTimeout(queryStatus, 1000);
				
			}
		//});
	}
	$.log("ag="+JSON.stringify(ag));
	$.log("obj.ProcessIndicator" + ag.getObj("ProcessIndicator") + ":JSON=" + JSON.stringify(ag.getObj("ProcessIndicator")) );
	
	ag.getObj("ProcessIndicator").start();
    $(".wz_msg").find("#messageTableBody").hide();
	
	queryStatus();
    $(".wz_msg").find("img").hide();
    if (typeof ag["iterationId"] === 'undefined') {
        ag.setValue("iterationId", 1);
    }
    checkBroadbandService(ag.getValue("iterationId"));

    checkEthernetConnections(ag.getValue("iterationId"));

    checkWiFiConnections(ag.getValue("iterationId"));
}
/*
var stepCount = 0;
function addStatusMsg(msg,iterId)
{
    var image;
    if(msg.length == 0)
        return;
    if(iterId >= ag.getValue("tsIterationId")) {
        ++stepCount;
        $(_tr(_td("text:" + stepCount, "class:steps", "align:center", "valign:top"),
              _td("text:" + msg, "class:steps-copy", "align:left")).toHTML()).appendTo($("#messageTableBody"));
    }      
}
*/

function getPingDataWithoutLogin(getPing) {
    var data;
    $.ajax({
        type: "POST",
        url: "php/ajaxGet_ping_without_login.php",
        data: { PingData: getPing },
        dataType: "json",
        success: function(msg) {
            data = msg;
            //console.log("success to get PingData");
        },
        async:false,
        cache:false,
        error: function(){
            //console.log("Failed to get PingData");
        }
        });
    return data;
}

function getTroubleshootData(TroubleshootData) {
    var data;
    $.ajax({
        type: "POST",
        url: "php/tool_troubleshoot_data.php",
        data: { TroubleshootData: TroubleshootData, opType: "READ"},
        dataType: "json",
        success: function(msg) {
            data = msg;
            //console.log("success to get TroubleshootData");
        },
        async:false,
        cache:false,
        error: function(){
            //console.log("Failed to get TroubleshootData");
        }
        });
    return data;
}

function setTroubleshootData(TroubleshootData) {
    var data;
    $.ajax({
        type: "POST",
        url: "php/tool_troubleshoot_data.php",
        data: { TroubleshootData: TroubleshootData, opType: "WRITE"},
        dataType: "json",
        success: function(msg) {
            data = msg;
            //console.log("success to set TroubleshootData");
        },
        async:false,
        cache:false,
        error: function(){
            //console.log("Failed to set TroubleshootData");
        }
        });
    return data;
}

function dialog_build() {
		dialog_afterBuild(function(){
			$("#ProcessIndicator").click(function(){
			$.log("Clicked me.");
			//ajax call for troubleshoot wizard
            TSdata = getTroubleshootData(TSdata);
            if(tmrId == 0)
		 startTroubleshoot();
		$("#ProcessIndicator").unbind();
		});
	});
    return 	_div(ctrlProcessIndicator("ProcessIndicator", {text:"ClickMe"}),
    			 _div("class:wz_msg", _img("height:60", "width:120", "style:display:none;"),_br(),
    					_div("class:wz_msg_h1","text:{{ConnectionProblem}}"),_div("class:wz_msg_descr","text:{{TroubleHelpText1}} {{TroubleHelpText2}}"),
                        _div("class:wz_msg_diag_results", "id:steps"),
                        _table("id:messageTable", "align:center", "cellpadding:0", "cellspacing:0", _tbody("id:messageTableBody")),_br(),
                        _div(_input("type:button", "value:{{Skip}}", "class:submitBtn tts_button", function onclick() {
                           $(".wz_dialog").remove();
                           window.location.href = "/";
                           if (tmrId != 0) {clearTimeout(tmrId);}
                           var itId = ag.getValue("tsIterationId");
                           ++itId;
                           ag.setValue("tsIterationId", itId);
                        }))
                        )
			);
}

