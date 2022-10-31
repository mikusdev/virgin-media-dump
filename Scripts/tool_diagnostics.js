//(c) Copyright 2014, ARRIS Group, Inc., All rights reserved.
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
var bDiagCloseRequest = false;
var percent = 0;

function setDiagCloseRequest()
{
    //request to close
    bDiagCloseRequest = true;
    if (percent >= 100)
    {
        //close on diagnostic complete
        closeDiagnostics();
        bDiagCloseRequest = false;
    }
}

function ChecknCloseDiagnostics()
{
    if (bDiagCloseRequest)
    {
        //close request, close it immediately
        closeDiagnostics();
        bDiagCloseRequest = false;
    }

    return bDiagCloseRequest;
}

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

function checkBroadbandService(iterId) {
    // CM is not online
    if (nullIp("" + ag.getValue("DhcpCmIpAddr")) == 1) {
        addStatusMsg(customerName("CheckCoaxialCable",1), iterId);
        setPingResultStatus(0);
        addStatusMsg(customerName("NoBroadbandConnection",1), iterId);
        proceedWithTempCheck(iterId);
    }
    else { // CM is online
        addStatusMsg(xlate("BroadbandConnectionUp"), iterId);
        // Assuming we are in router mode, as there is no diagnostics wizard in bridge mode
        // Checking provisioning mode
        rs = ag.getValue("RouterWANIPPRovMode");
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
    rs = ag.getValue("WanIP6Addr");
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
    rs = ag.getValue("WanIPAddr");
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
    rs = ag.getValue("WanIPAddr");
    rs1 = ag.getValue("WanIP6Addr");
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
    mtaState = ag.getValue("mtaAdminState");

    if (mtaState.contains("NOLINE")) {
        addStatusMsg(xlate("NoVoiceService"),iterId);
        setTelephoneCheckStatus(0);
        setDiagnosticsResultsStatus(0);
    } else {
        CallPState1 = ag.getValue("teleStatus1");
        CallPState2 = ag.getValue("teleStatus2");
        OpStatus1 = ag.getValue("telephonyStatus1");
        OpStatus2 = ag.getValue("telephonyStatus2");
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
    originalLinkStatus = [];
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
            //TODO:: is the below check valid? if so, handle it.
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

    // Check WiFi 2.4G interface status
    if (!ag.getValue("WiFi24")) {
        wifi24Down = 1;
        addStatusMsg(xlate("PrimaryWifi24Disabled"), iterId);
    }

    // Check WiFi 5G interface status
    if (!ag.getValue("WiFi50")) {
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
            var data = {"WiFiClientCount": "", "WiFiClientSignal": "", "WiFiClientAddr":""};
            getAssocDevData(data, function(data) {
                var clientCount = parseInt(data["WiFiClientCount"]);
                for (var i=0; i<clientCount; i++) {
                    if (parseInt(data["WiFiClientSignal"][i]) < -60) {
                        clientsWithLowRSSI++;
                        // show the low signal message for this client (with mac id)
                        var msgLowSignal = xlate("DeviceHasLowSignal",data["WiFiClientAddr"][i]);
                        msgLowSignal = replaceCustomerName(msgLowSignal, 2);
                        addStatusMsg(msgLowSignal, iterId);
                    }
                }

                if (clientsWithLowRSSI >= 1) {
                    addStatusMsg(customerName("PlaceWifiDeviceNear", 1), iterId);
                    setWifiCheckStatus(0);
                    setDiagnosticsResultsStatus(0);
                }
            });
        }
    }, 15000);
}

var originalLinkStatus = [];
function checkEthernetPortSpeed(result) {
    var data = {"LanPortStatus": "", "LanPortSpeed": ""};
    getAssocDevData(data, function(data) {
        for (var i=0; i<4; i++) {
            if ((data["LanPortStatus"][i] === "Up") && (parseInt(data["LanPortSpeed"][i]) < 1)) {
                result = 1;
                break;
            }
        }
    });
}

function checkEthernetLinkStatus(result) {
    var data = {"LanPortStatus": ""};
    getAssocDevData(data, function(data) {
        for (var i=0; i<4; i++) {
            if (!(data["LanPortStatus"][i] === originalLinkStatus[i])) {
                result = 1;
                break;
            }
        }
    });
}

function setOriginalLinkStatus() {
    var data = {"LanPortStatus": ""};
    getAssocDevData(data, function(data) {
        for (var i=0; i<4; i++) {
            originalLinkStatus[i] = data["LanPortStatus"][i];
        }
    });
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
    if (ag.getValue("failSafeMode") > 1) {
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
        pingData = {"getting":"DNSQuery", "TargetAddress":"", "status":""};
        pingData['TargetAddress'] = targetAddress;
        execStatus = getPingData(pingData);
        if (execStatus['status'] == 0 || (execStatus['status'] == 1 && execStatus['getting'] == "DNSQuery")) {
            targetAddress = "google.com";
        }
    }

    pingData = {"settings": "Requested", "Host": "", "NoofPings": "", "PingSize": ""};
    pingData['Host'] = targetAddress;
    pingData['NoofPings'] = "4";
    pingData['PingSize'] = "64";
    setPingData(pingData);
    setTimeout(function() {
        pingData = {"getting":"status", "status":"", "SuccessCount":"", "FailureCount":""};
        execStatus = getPingData(pingData);
        if (execStatus['status'] == "Complete") {
            if (execStatus['SuccessCount'] > 0) {
                setPingResultStatus(1);
                addStatusMsg(customerName("BroadbandConnectionReady",1), iterId);
            } else {
                setPingResultStatus(0);
                addStatusMsg(customerName("NoBroadbandConnection",1), iterId);
            }
        }
        proceedWithTempCheck(iterId);
    }, 5000);
}

function toggleEthernetLink() {
    var data = {"LanPortLinkDownUp": []};
    setAssocDevData(data);
}

function dialog_beforeClose()
{
    if (tmrId != 0) {clearTimeout(tmrId);}
    tmrId = 0;
    var itId = ag.getValue("iterationId");
    ++itId;
    ag.setValue("iterationId", itId);
}

function dialog_loadData() {
    verifyLoginCredential();
}

var tmrId = 0;
var bPercent35 = false;
var bPercent50 = false;
var bPercent66 = false;
var bPercent75 = false;
var bPercent100 = false;

function startDiagnosticsProcedure(){

    if (tmrId != 0) {clearTimeout(tmrId);}

    function setFinishOKMsg(){
        if (diagnosticResultsStatus == 0) {
            $(".wz_msg").find("img[id='img_base']").attr("src","i/error-icon.svg");
        }
        else {
            $(".wz_msg").find("img[id='img_base']").attr("src","i/allgood-icon.svg");
        }
        $(".wz_msg").find("img[id='img_base']").show();
        $(".submitBtn").remove();
        $(".wz_msg").find(".wz_msg_h1").addClass("success");
        if (diagnosticResultsStatus == 0) {
            $(".wz_msg").find(".wz_msg_h1").html(xlate("HomeNwHasProblems"));
        }
        else {
            $(".wz_msg").find(".wz_msg_h1").html(customerName("BroadbandConnectionWorking",1));
        }
        $(".wz_msg").find(".wz_msg_diag_results[id='debug']").html(xlate("IfSomethingIsWrong"));
        $(".wz_msg").find(".wz_msg_diag_results[id='debug']").show();
        $(".wz_msg").find("#messageTableBody").show();

        
        if (tmrId != 0) {clearTimeout(tmrId);}
        tmrId = 0;
    }

    var allButOneMsg;
    function queryStatus(){
        percent++;
        if (percent>100) percent = 100;
        if(percent < 35) {
            prepareStepStatusMsg("", 2, 1);
            prepareStepStatusMsg(xlate("CheckInternet"), 0, 1);
            $(".wz_msg").find(".wz_msg_diag_results[id='steps']").html(resultMsg); 
            if (!bPercent35)
            {
                bPercent35 = true;

                //check for close request
                if (ChecknCloseDiagnostics())
                    return;
            }
        }
        else if(percent < 100) {
            if (pingResult == 0) {
                // clear the entire step results message
                prepareStepStatusMsg("", 2, 1); 
                if (percent < 66) {
                    prepareStepStatusMsg(xlate("CheckInternet"), 0, 0);
                    prepareStepStatusMsg(xlate("CheckLanSettngs"), 0, 1);
                    $(".wz_msg").find(".wz_msg_diag_results[id='steps']").html(resultMsg);
                    if (!bPercent66)
                    {
                        bPercent66 = true;

                        //check for close request
                        if (ChecknCloseDiagnostics())
                            return;
                    }
                }
                else if (percent < 100) {
                    prepareStepStatusMsg(xlate("CheckInternet"), 0, 0);
                    if (ethernetCheckStatus == 0) {
                        prepareStepStatusMsg(xlate("CheckLanSettngs"), 0, 0);
                    }
                    else {
                        prepareStepStatusMsg(xlate("CheckLanSettngs"), 1, 0);
                    }
                    allButOneMsg = resultMsg;
                    prepareStepStatusMsg(xlate("CheckWirelessSettings"), 0, 1);
                    $(".wz_msg").find(".wz_msg_diag_results[id='steps']").html(resultMsg);

                    if (!bPercent100)
                    {
                        bPercent100 = true;

                        //check for close request
                        if (ChecknCloseDiagnostics())
                            return;
                    }
                }
            }
            else {
                prepareStepStatusMsg("", 2, 1);
                $(".wz_msg").find(".wz_msg_diag_results[id='steps']").html(resultMsg);
                if (percent < 50 ) {
                    if(connectionCheckStatus == 0) {
                        prepareStepStatusMsg(xlate("CheckInternet"), 0, 0);
                    }
                    else {
                        prepareStepStatusMsg(xlate("CheckInternet"), 1, 0);
                    }
                    prepareStepStatusMsg(xlate("CheckTelephony"), 0, 1);
                    $(".wz_msg").find(".wz_msg_diag_results[id='steps']").html(resultMsg);

                    if (!bPercent50)
                    {
                        bPercent50 = true;

                        //check for close request
                        if (ChecknCloseDiagnostics())
                            return;
                    }
                }
                else if (percent < 75) {
                    if(connectionCheckStatus == 0) {
                        prepareStepStatusMsg(xlate("CheckInternet"), 0, 0);
                    }
                    else {
                        prepareStepStatusMsg(xlate("CheckInternet"), 1, 0);
                    }
                    if (telephoneCheckStatus == 0) {
                        prepareStepStatusMsg(xlate("CheckTelephony"), 0, 0);
                    }
                    else {
                        prepareStepStatusMsg(xlate("CheckTelephony"), 1, 0);
                    }
                    prepareStepStatusMsg(xlate("CheckLanSettngs"), 0, 1);
                    $(".wz_msg").find(".wz_msg_diag_results[id='steps']").html(resultMsg);

                    if (!bPercent75)
                    {
                        bPercent75 = true;

                        //check for close request
                        if (ChecknCloseDiagnostics())
                            return;
                    }
                }
                else if (percent < 100) {
                    if(connectionCheckStatus == 0) {
                        prepareStepStatusMsg(xlate("CheckInternet"), 0, 0);
                    }
                    else {
                        prepareStepStatusMsg(xlate("CheckInternet"), 1, 0);
                    }
                    if (telephoneCheckStatus == 0) {
                        prepareStepStatusMsg(xlate("CheckTelephony"), 0, 0);
                    }
                    else {
                        prepareStepStatusMsg(xlate("CheckTelephony"), 1, 0);
                    }
                    if (ethernetCheckStatus == 0) {
                        prepareStepStatusMsg(xlate("CheckLanSettngs"), 0, 0);
                    }
                    else {
                        prepareStepStatusMsg(xlate("CheckLanSettngs"), 1, 0);
                    }
                    allButOneMsg = resultMsg;
                    prepareStepStatusMsg(xlate("CheckWirelessSettings"), 0, 1);
                    $(".wz_msg").find(".wz_msg_diag_results[id='steps']").html(resultMsg);

                    if (!bPercent100)
                    {
                        bPercent100 = true;

                        //check for close request
                        if (ChecknCloseDiagnostics())
                            return;
                    }
                }
            }
        }
        ag.getObj("ProcessIndicator").setPos(percent);
        if (percent == 100){
            prepareStepStatusMsg("", 2, 1);
            if (wifiCheckStatus == 0) {
                prepareStepStatusMsg(xlate("CheckWirelessSettings"), 0, 0);
            }
            else {
                prepareStepStatusMsg(xlate("CheckWirelessSettings"), 1, 0);    
            }
            $(".wz_msg").find(".wz_msg_diag_results[id='steps']").html(allButOneMsg + resultMsg);
            $(".wz_msg").find(".wz_msg_diag_results[id='steps']").css({"border": "none"});
            setFinishOKMsg();

            //check for close request
            if (ChecknCloseDiagnostics())
                return;
        }
        else{
            tmrId = setTimeout(queryStatus, 1000);
        }
    }
	
    queryStatus();
    ag.getObj("ProcessIndicator").start();
    $(".wz_msg").find("img[id='img_base']").hide();
    $(".wz_msg").find(".wz_msg_h1").html(xlate("RunningDiagnostics"));
    $(".wz_msg").find(".wz_msg_diag_results[id='steps']").css({"border-top": "1px solid #666", "margin": "10px"});
    $(".wz_msg").find(".wz_msg_diag_results[id='steps']").html("");
    $(".wz_msg").find(".wz_msg_diag_results[id='debug']").css({"color": "#666", "font-size":"20px"});
    $(".wz_msg").find(".wz_msg_diag_results[id='debug']").html("");
    $(".wz_msg").find("#messageTableBody").hide();

    if (typeof ag["iterationId"] === 'undefined') {
        ag.setValue("iterationId", 1);
    }
    checkBroadbandService(ag.getValue("iterationId"));

    checkEthernetConnections(ag.getValue("iterationId"));

    checkWiFiConnections(ag.getValue("iterationId"));
}

function prepareStepStatusMsg(msg, success, noImage) {
    var image;
    if(success == 1)
    {
        if (noImage == 1) {
            image = "" + "&nbsp" + "&nbsp" + "&nbsp" + "&nbsp";
        }
        else {
            image = "<img width='20px' height='15px' src='skins/lgi/css/images/icon-check.svg'></img>";
        }
        resultMsg += (image + "&nbsp" + msg + "<br>");
    }
    else if(success == 2)
    {
        resultMsg = "";
    }
    else
    {
        if (noImage == 1) {
            image = "" + "&nbsp" + "&nbsp" + "&nbsp" + "&nbsp";
        }
        else {
            image = "<img width='20px'height='15px' src='skins/lgi/css/images/error-icon.svg'></img>";
        }
        
        resultMsg += (image + "&nbsp" + msg + "<br>");
    }
}

var stepCount = 0;
function addStatusMsg(msg,iterId)
{
    var image;
    if(msg.length == 0)
        return;
    if(iterId >= ag.getValue("iterationId")) {
        ++stepCount;
        $(_tr(_td("text:" + stepCount, "class:steps", "align:center", "valign:top"),
              _td("text:" + msg, "class:steps-copy", "align:left")).toHTML()).appendTo($("#messageTableBody"));
    }      
}

function dialog_build() {
    dialog_afterBuild(function(){		
        //$("#ProcessIndicator").click(function(){
		$.log("Clicked me.");
		if(tmrId == 0){
		    startDiagnosticsProcedure();
		    }
		$(".wz_process_ind_cycle").css("cursor","default"); 
		$("#ProcessIndicator").unbind();
	//});
    });
    return 	_div(ctrlProcessIndicator("ProcessIndicator",{style:"green", text: ""}),
    			 _div("class:wz_msg", _img("id:img_base", "height:60", "width:120", "style:display:none;"),_br(),
    					_div("class:wz_msg_h1 wz_msg_h1_green"),_br(),
                        _div(_input("type:button", "id:diagCancel", "value:{{Cancel}}", "class:submitBtn ts_Button", function onclick() {
                            $("#diagCancel").css("visibility","hidden");

                            setDiagCloseRequest();

                           /* $(".wz_dialog").remove();
                           if (tmrId != 0) {clearTimeout(tmrId);}
                           var itId = ag.getValue("iterationId");
                           ++itId;
                           ag.setValue("iterationId", itId);*/
                         })),
                        _div("class:wz_msg_diag_results", "id:steps"),
                        _div("class:wz_msg_diag_results", "id:debug"),
                        _table("id:messageTable", "align:center", "cellpadding:0", "cellspacing:0", _tbody("id:messageTableBody")))
			);
}
