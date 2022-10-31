//(c) Copyright 2011-2017, ARRIS Group, Inc., All rights reserved.
/* PEGA ci test */
var walk = { };
var loads = [];
var stores = [];
var table = { };
var container = { };
var oidsRead = [ ];
var mib = { };
var bulkLoading = false;
var bulkList = [ ];
var wpspinoid   = "1.3.6.1.4.1.4115.1.20.1.1.3.30.10.0";
var wps50pinoid = "1.3.6.1.4.1.4115.1.20.1.1.3.65.10.0";
var bulkSetList = [];

function sliceOid(oid, start, end) {
    var oids = oid.split(".");
    if (start < 0) {
        start = oids.length + start;
        end = oids.length;
    } else {
        end = (end === undefined ? oids.length : end);
    }
    if (end < 0) {
        end = oids.length + end;
    }
   return _(oids.slice(start, end)).reduce(function(acc, next) {
   return acc ? acc + "." + next : next;
    });
}

if (window["preWalk"])
    walk = window["preWalk"];
/*
function afterLoad(f) {
    {
        f.loaded = true;
        if (f.afterLoad) f.afterLoad();
    }
}

function load1(f, json) {
    if (json === undefined)
        json = snmpWalk([ f.oid ]);
    _(json).each(function(val, oid) {
        walk[oid] = val;
    });
    {
        f.loaded = true;
        if (f.afterLoad) f.afterLoad();
    }
}

function loadFake() {
    var args = _(_.toArray(arguments));
    args.each(function(f) {
        f.loaded = true;
        if (f.afterLoad) f.afterLoad();
    })
}

function loadOids(oa) {
    function doget(a) {
        var json = snmpWalk(a);
        _(json).each(function(val, oid) {
            walk[oid] = val;
        });
    }

    var soa = [ ];
    _.each(oa, function(o) {
        soa.push(o);
        if (soa.length > 5) {
            doget(soa);
            soa = [ ];
        }
    });
    if (soa.length)
        doget(soa);
}
*/
function listAccessed() {
    _.each(_.extend({}, container, table), function(f) {
        if (f.accessed) $.log(f.name);
    });
}

function decodeOid(oid) {
    var d = "";
    var match = { oid: "" };
    _.each(_.extend({}, container, table), function(f) {
        _.each(f.children, function(e) {
            if (oid.startsWith(e.oid + ".") && e.oid.length > match.oid.length) {
                match = e;
            }
        })
    });
    return match.oid ? match.name + oid.substr(match.oid.length) : "???" + oid;
}
/*
function dumpOidsRead() {
    _.each(oidsRead, function(o) {
        $.log(o);
    });
}

function oidValuesEqual(a,b) {
    if ((""+a).startsWith("$") && (""+b).startsWith("$")) {
        return a.replace(/ /g,"") === b.replace(/ /g,"")
    }
    return a == b;
}
*/
function Container(name, oid) {
    this.name = name;
    this.oid = oid;
    mib[oid] = this;
    container[oid] = this;
    this.parent = mib[sliceOid(oid, 0, -1)];
    if (this.parent)
        this.parent.children.push(this);
    this.children = [ ];
    this.loaded = false;
    this.accessed = false;
    this.dump = function(f) {
        var or = oidsRead.slice(0);
        if (f === undefined)
            f = $.log;
        accessed = this.accessed;
        f(name + " ===============");
        _.each(this.children, function(v) {
            if (v !== undefined && v.scalar)
                f(v.name + ":" + v.get());
        });
        this.accessed = accessed;
        oidsRead = or;
    };
    this.json = function() {
        return { name:this.name,type:"container",oid:this.oid,
            children: _.map(this.children, function(f) {
                return f.json();
            }) };
    }
}

function Table(name, oid) {
    this.oid = oid;
    this.name = name;
    mib[oid] = this;
    table[oid] = this;
    this.parent = mib[sliceOid(oid, 0, -1)];
    if (this.parent)
        this.parent.children.push(this);
    this.key = [];
    this.children = [ ];
    this.loaded = false;
    this.accessed = false;
    this.rowStatus = null;
    this.rowVisibleMask = 1; // 0x00000001: active(1)
                             // 0x00000002: notInService(2)
                             // set mask to 3 if notInService needs to be visible.
    this.rowVisible = function(key) {
        var vis = true;
        if (this.rowStatus) {
            if(this.rowVisibleMask & 0x01){
                vis =  this.rowStatus.getOid(key) == 1;
            }
            if(!vis && (this.rowVisibleMask & 0x02)){
                vis =  this.rowStatus.getOid(key) == 2;
            }
            if (!vis)
                $.log(name+"."+key+" not visible: "+this.rowStatus.getOid(key));
        }
        return vis;
    };
    this.length = function() {
        return this.key.length;
    };
    this.afterLoad = function() {
        var hash = { };
        _.each(walk, function(v, k) {
            if (k.startsWith(oid + ".")) {
                var testKey = sliceOid(k.substr(oid.length + 1), 2);
                if (testKey && !hash[testKey]) {
                    hash[testKey] = testKey;
                    this.key.push(testKey);
                }
            }
        }, this);
        this.loaded = true;
       // loadRowStatus();
    }
    this.dumpGroupRow = true;
    this.dump = function(f) {
        var or = oidsRead.slice(0);
        if (f === undefined)
            f = $.log;
        accessed = this.accessed;
        var rv = "";
        for (var i = 0; i < this.length(); i++) {
            rv += this.key[i] + ";";
        }
        f("table " + name + " size=" + this.length() + "  " + rv);
        var rv = "";
        for (var i = 0; i < this.length(); i++) {
            $.each(this.children, function(k, v) {
                if (v.get(i)) {
                    rv += (v.name + ":" + v.get(i) + ";");
                    if (!this.dumpGroupRow) {
                        f("===" + this.table.key[i] + "==>" + rv);
                        rv = "";
                    }
                }
            });
            if (rv.length && this.dumpGroupRow)
                f("===" + this.key[i] + "==>" + rv);
        }
        this.accessed = accessed;
        oidsRead = or;
        f("rowStatus: "+ (this.rowStatus ? this.rowStatus.name : ""));
    }
    this.json = function() {
        return { name:this.name,type:"table",oid:this.oid,
            children: _.map(this.children, function(f) {
                return f.json();
            }) };
    }
    this.getTable = function(cola, func) {
        var oidToWalk = this.oid;
	if (cola && (cola.length == 1))
	    oidToWalk = cola[0].oid;

	if (walk[oidToWalk] === undefined) {
        walk[oidToWalk] = "";
        _.extend(walk, snmpWalk([oidToWalk]));
        this.afterLoad();
        }
        var or = oidsRead.slice(0);
        var table = [ ];
        if (!cola)
            cola = this.children;
        for (var i = 0; i < this.length(); i++) {
            if (!this.rowVisible(this.key[i]))
                continue;
            var row = [];
            _.each(cola, function(c) {
                row.push(c.get(c.table.key[i]));
            });
            if (func) {
                row = func(i, row, this.key[i]);
                if (row)
                    table.push(row);
            }
            else table.push(row);
        }
        oidsRead = or;
        return table;
    }

    this.getTableAsync = function(cola, func, callback_done) {
        var mytable = this;
        function handleAsyncResponse(rs){
            if(rs)
            {
                _.extend(walk, rs);
                $.log("walk = " + JSON.stringify(walk));
                //$.log("mytable = " + JSON.stringify(mytable));
                mytable.afterLoad();
            }
            var or = oidsRead.slice(0);
            var table = [ ];
            if (!cola)
                cola = mytable.children;
            for (var i = 0; i < mytable.length(); i++) {
                if (!mytable.rowVisible(mytable.key[i]))
                    continue;
                var row = [];
                _.each(cola, function(c) {
                    row.push(c.get(c.table.key[i]));
                });
                if (func) {
                    row = func(i, row, mytable.key[i]);
                    if (row)
                        table.push(row);
                }
                else table.push(row);
            }
            oidsRead = or;
            if(callback_done)
                callback_done();
        }
        var oidToWalk = this.oid;
        if (cola && (cola.length == 1))
            oidToWalk = cola[0].oid;

        if (walk[oidToWalk] === undefined) {
            walk[oidToWalk] = "";
            snmpWalkAsync([oidToWalk], handleAsyncResponse);
        }
        else
        {
            handleAsyncResponse();
        }
    }

    this.getPartTableAsync = function(cola, func, callback_done) {	
        var mytable = this;
        function handleAsyncResponse(rs){
            if(rs)
            {
                _.extend(walk, rs);
                $.log("walk = " + JSON.stringify(walk));
                mytable.afterLoad();
            }
            var or = oidsRead.slice(0);
            var table = [ ];
            if (!cola)
                cola = mytable.children;
            for (var i = 0; i < mytable.length(); i++) {
                if (!mytable.rowVisible(mytable.key[i]))
                    continue;
                var row = [];
                _.each(cola, function(c) {
                    row.push(c.get(c.table.key[i]));
                });
                if (func) {
                    row = func(i, row, mytable.key[i]);
                    if (row)
                        table.push(row);
                }
                else table.push(row);
            }
            oidsRead = or;
            if(callback_done)
                callback_done();
        }
        var oidToWalk = [];
        _.each(cola, function(element) {
             oidToWalk.push(element.oid);
        });
        if (walk[oidToWalk] === undefined) {
            walk[oidToWalk] = "";
            snmpWalkAsync(oidToWalk, handleAsyncResponse);
        }
        else
        {
            handleAsyncResponse();
        }
    }
    this.deleteVisible = function(index) {
        for (var i=0;i<this.key.length;i++) {
            if (this.rowVisible(this.key[i])) {
                if (index===0) {
                    this.rowStatus.set(this.key[i],"6"); // delete
                    return;
                } else {
                    index--;
                }
            }
        }
    }
    this.findLowestFree = function(col, max) {
        var or = oidsRead.slice(0);
        var keyMap = { };
        _.each(this.key, function(k, i) {
            var index = k.lastIndexOf(".");
            index = index == -1 ? k : k.substr(index+1);
            keyMap["" + index] = col.get(k);
        });
        var key = _.detect(_.range(1, max + 1), function(i) {
            return keyMap["" + i] === undefined
        });
        if (key == max)
            alert("Table " + this.name + " is full");
        oidsRead = or;
        return key;
    }
    this.addRow = function(rowKey, cva, label) {

       stores = [];

        try {
            this.beforeAddRow(rowKey);
            for (var i = 0; i < cva.length / 2; i++) {
                var col = cva[i * 2];
                var val = cva[i * 2 + 1];
                if (col.table && col.table != this)
                    throw "Wrong table " + this.name + " for " + col.name;
                stores.push({oid:col.oid + "." + rowKey, value:val, type:col.type});

                $.log("addRow " + col.name + "." + rowKey + "=" + val);
            }
            this.afterAddRow(rowKey);
            _.each(stores, function(kvt) {
                try {
                    snmpSet1(kvt.oid, kvt.value, kvt.type);
                } catch (e) {
                    if (e == "unauthorized")
                        refresh();
                    else if (label)
                       throw { oid:kvt.oid, label:label };
                    throw e;
                }
            });
        } finally {
            stores = [];
        }

    }
    this.beforeAddRow = function(key) {
        if (this.rowStatus) {
                stores.push({oid:this.rowStatus.oid + "." + key, value:5, type:this.rowStatus.type}); // createAndWait
        }
    };
    this.afterAddRow = function(key) {
        if (this.rowStatus)
            stores.push({oid:this.rowStatus.oid + "." + key, value:1, type:this.rowStatus.type}); // active
    };
}

function Scalar(name, oid, type) {
    mib[oid] = this;
    this.name = name;
    this.oid = oid;
    this.type = type;
    this.scalar = true;
    this.parent = container[sliceOid(oid, 0, -1)];
    if (!this.parent)
        alert("container for" + name + ":" + oid + " not found");
    this.parent.children.push(this);
    this.get = function() {
        if (arguments.length !== 0)
            alert("unexpected index for scalar " + this.name);
        var oid = this.oid+".0";
        if (bulkLoading) {
            bulkList.push(oid);
            return "";
        }
        if (walk[oid] === undefined)
            walk[oid] = snmpGet1(oid) || "";
        else
        {
            if( exception_oid( oid ) == true )
            {
                walk[oid] = snmpGet1(oid) || "";
            }
        }
        return walk[oid];
        if (!this.parent.loaded)
            $.log(this.parent.name + " not loaded");//alert(this.parent.name + " not loaded"); // MOD for PROD00202247
        this.parent.accessed = true;
        oidsRead.push(oid + ".0");
        return walk[oid + ".0"] || "";
    };
    this.set = function(v, label, forceSubmit) {
        try {
            snmpSet1(this.oid + ".0", v, this.type, forceSubmit);
        } catch (e) {
            if (e == "unauthorized")
            	throw e;
            else if (label)
                throw { oid:this.oid + ".0", label:label };
            throw e;
        }
    };
    this.defined = function(index) {
        return walk[oid + ".0"] !== undefined;
    }
    this.json = function() {
        return { name:this.name,type:"scalar",oid:this.oid };
    }
}

function Column(name, oid, type) {
    mib[oid] = this;
    this.name = name;
    this.oid = oid;
    this.type = type;
    this.table = table[sliceOid(oid, 0, -2)];
    if (!this.table)
        alert("table for " + name + ":" + oid + " not found");
    this.table.children.push(this);
    this.length = function() {
        return this.table.length();
    };
    this.getKey = function(index) {
        if (!this.table.loaded)
            $.log(this.table.name + " not loaded");//alert(this.table.name + " not loaded"); // MOD for PROD00202247
        if (index < 0 || index > this.table.key.length)
            $.log("index " + index + " out of range for " + table.name);
        return this.table.key[index] || "";
    }
    this.get = function(index, index2) {
        if (!index || index.asInt() === 0)
           return "";
        if (index2 !== undefined)
            index += "."+index2;
        var oid = this.oid+"."+index;

        if (bulkLoading) {
            bulkList.push(oid);
            return;
        }
        if (walk[oid] === undefined)
            walk[oid] = snmpGet1(oid) || "";
        return walk[oid];
        if (arguments.length !== 1)
            alert("expected index for column " + this.name);
        if (!this.table.loaded)
            $.log(this.table.name + " not loaded");//alert(this.table.name + " not loaded"); // MOD for PROD00202247
        this.table.accessed = true;
        if (index < 0 || index > this.table.key.length) {
            $.log("index " + index + " out of existing range for " + table.name);
            oidsRead.push(oid + "." + (parseInt(index) + 1));
            return walk[oid + "." + (parseInt(index) + 1)] || "";
        }
        oidsRead.push(oid + "." + this.table.key[index]);
        return walk[oid + "." + this.table.key[index]] || "";
    }
    this.getOid = function(index) {
        if (arguments.length !== 1)
            alert("expected index for column " + this.name);
        if (!this.table.loaded)
            $.log(this.table.name + " not loaded");//alert(this.table.name + " not loaded"); // MOD for PROD00202247, PROD00202094
        oidsRead.push(oid + "." + index);
        $.log(this.name+"."+index+" = "+walk[oid + "." + index] || "");
        return walk[oid + "." + index] || "";
    }
    this.set = function(index, value, label, forceSubmit) {
        try {
            snmpSet1(this.oid + "."+index, value, this.type, forceSubmit);
        } catch (e) {
            if (e == "unauthorized")
                refresh();
            else if (label)
                throw { oid:this.oid + index, label:label };
            throw e;
        }
        return;
        if (v !== undefined)
            throw "this.set v WAS set";

        if (!index || index.asInt() === 0)
           return "";
        if (v !== undefined) {
            index += "."+index2;
        } else {
            v = index2;
        }
        if (arguments.length < 2)
            alert("expected index for column " + this.name);

        stores.push({oid: this.oid + "."+index,value:v, type:this.type});
        return;
        if (!this.table.loaded)
            $.log(this.table.name + " not loaded");//alert(this.table.name + " not loaded"); // MOD for PROD00202247
        var oid = this.oid;
        if (index < 0 || index > this.table.key.length) {
            $.log("index " + index + " out of existing range for " + table.name);
            oid += "." + (parseInt(index) + 1);
        } else {
            oid = this.oid + "." + this.getKey(index);
        }
            $.log("set " + name + "." + this.getKey(index) + ":" + v);
            stores.push({oid:oid,value:v, type:this.type});
    };

    this.addtoSetBulk = function(index, value, label, forceSubmit) {
        var found = false;
        var oid = this.oid + "." + index;
        var type = this.type;
        _.each(bulkSetList, function(element) {
            if((oid == element[0]) && (value == element[1]) && (type == element[2]))
            {
                $.log("addtoSetBulk: " + JSON.stringify([oid, value, type]) + " already exists");
                found = true;
                return false;
            }
        });
        if(!found)
        {
            $.log("addtoSetBulk = " + JSON.stringify([this.oid + "." + index, value, this.type]));
            bulkSetList.push([this.oid + "." + index, value, this.type]);
        }
    }

    this.defined = function(index) {
        if (index === undefined || index < 0 || index > this.table.key.length)
            return false;
        return walk[oid + "." + this.table.key[index]] !== undefined;
    }
    this.json = function() {
        return { name:this.name,type:"column",oid:this.oid };
    }
}

if (window["preWalk"]) {
    var foo = [];
    _.each(container, function(v) {
        foo.push(window[v.name]);
    });
    _.each(table, function(v) {
        foo.push(window[v.name]);
    });
    load.apply(this, foo);
}
/*
function dumpInC() {
    function dumpOneInC(o) {
        $.log("\"" + o.oid + ".\",\"" + o.name + "\",");
    }
    _.each(container, function(v) {
        _.each(v.children, function(v) {
            dumpOneInC(v);
        });
    });
    _.each(table, function(v) {
        _.each(v.children, function(v) {
            dumpOneInC(v);
        });
    });

}

var rowStatusCols = [
    arWanStaticDNSRowStatus,
    arLanDNSRowStatus,
    arLanClientRowStatus,
    arDeviceUpDownStatus,
    arLanCustomRowStatus,
    arWEP64BitKeyStatus,
    arWEP128BitKeyStatus,
    arMACAccessStatus,
    arWDSBridgeStatus,
    arFWVirtSrvRowStatus,
    arFWIPFilterRowStatus,
    arFWMACFilterRowStatus,
    arFWPortTrigRowStatus,
    arFWMACBridgeRowStatus,
    arKeywordBlkStatus,
    arBlackListStatus,
    arWhiteListStatus,
    arTrustedDeviceStatus,
    arSNTPServerStatus,
    arLanStaticClientRowStatus,
    arAirtimeCtrlClientRowStatus
];

function oidIsRowStatus(oid) {
    for (var i=0; i<rowStatusCols.length; i++)
        if (oid.startsWith(rowStatusCols[i].oid+"."))
            return true;
    return false;
}

var rowStatusLoaded = false;
function loadRowStatus() {
    if (rowStatusLoaded)
        return;
    rowStatusLoaded = true;
_.each(rowStatusCols,
        function(rs) {
            rs.table.rowStatus = rs;
        });
}
*/
var bsss = [ ];
var bssNames = { };
var bshc = [ ];
/*
function getHardCodeBss(index) {
        if (bshc.length === 0) {
        var bssString = "1@Bssid1&2@Bssid2&3@Bssid3&4@Bssid4&5@Bssid5&6@Bssid6&7@Bssid7&8@Bssid8&9@Bssid9&10@Bssid10&11@Bssid11&12@Bssid12&13@Bssid13&14@Bssid14&15@Bssid15&16@Bssid16";
        setSessionStorage("ar_bsss", bssString);
    }
    _.each(getSessionStorage("ar_bsss").split("&"), function(v) {
             v = v.split("@");
            bshc.push(v[0]);
            bssNames[v[0]] = v[1];
    });
    return index === undefined ? bshc : bshc[index];
}

function getEachBss(index) {
    if (bsss.length === 0) {
        if (!getSessionStorage("ar_bsss")) {
            var bl = bulkLoading;
            bulkLoading = false;
            var bssString = "";
            for (var i=Primary24GIndex(); i<=TotalSSIDs(); i++) {
                var name = arBssSSID.get(i);
                if( name === undefined)
                    name = "unknow";
                if (bssString)
                        bssString+="&";
                bssString += ""+i+"@"+name;
            }
            if (!bssString)
                bssString = "disabled"; // in case no bss table

            setSessionStorage("ar_bsss", bssString);
            bulkLoading = bl;
        }
        _.each(getSessionStorage("ar_bsss").split("&"), function(v) {
             v = v.split("@");
            bsss.push(v[0]);
            bssNames[v[0]] = v[1];
        });
    }
    return index === undefined ? bsss : bsss[index];
}
*/
function getBss(index) {
    if (bsss.length === 0) {
        if (!getSessionStorage("ar_bsss")) {
            var bl = bulkLoading;
            bulkLoading = false;
            var numSSID = 8;
            var bssString = BSSTable.getTable([arBssSSID], function(i, row, key) {
                if( (key > Ifindex24G()) && (key <= (Ifindex24G()+numSSID)) )
                {
                    return key+" @"+row[0];
                }
                if(isDBC())
                {
                    if( (key > Ifindex50G()) && (key <= (Ifindex50G()+numSSID)) )
                    {
                        return key+" @"+row[0];    
                    }
                }
            }).sort().join(" &");

            if (!bssString)
                bssString = "disabled"; // in case no bss table

            setSessionStorage("ar_bsss", bssString);
            bulkLoading = bl;
        }
        _.each(getSessionStorage("ar_bsss").split(" &"), function(v) {
             v = v.split(" @");
             var iIndex;
            if( v[0] < Ifindex50G() )
            {
               iIndex = v[0]-10001+Primary24GIndex();
            }
            else
            {
                iIndex = v[0]-10101+Primary5GIndex();
            }
            bsss.push( iIndex + "" );
            bssNames[iIndex] = v[1];
        });
    }
    return index === undefined ? bsss : bsss[index];
}
/*
function getBss2(index) {
    return isSimulateDBC() ? getBss(index) : getBss(index+8);
}
*/
function getBssName(bss) {
    return bss === undefined ? bssNames : (bssNames[bss] || "");
}
/*
function flushBss() {
    setSessionStorage("ar_bsss","");
    bsss = [];
    bssNames = { };
    BssSession.clearBSSTableSessionStorage();
}
*/
function exception_oid( oid )
{
    if( oid == wpspinoid )
    {
        return true;
    }
    else if( oid == wps50pinoid )
    {
        return true;
    }
    return false;
}
/**
 * Clear MIB table data, so that we can reload this table by table.getTable.
 * @param table
 */
function clearMibTableData(table){
 _.each(walk, function(v, k) {
        if (k.startsWith(table.oid)) {
    	delete walk[k];
        }
    });
 table.key = [];
 table.children = [ ];
 table.loaded = false;
}

function clearBulkSetList(){
    bulkSetList = [];
    bulkSetList.length = 0;
}
var lans = [ ];
var lanNames = { };
function getLan(index) {
    // UNIHAN REMOVE START
    /*
    if (index == 0)
        return "12";
    */
    // UNIHAN REMOVE END
    if (lans.length === 0) {
        if (!getSessionStorage("ar_lans")) {
            var bl = bulkLoading;
            bulkLoading = false;
            setSessionStorage("ar_lans", LanSrvTable.getTable([arLanName], function(i, row, key) {
               return key+"@"+row[0];
            }).sort().join("&")); // todo: verify sort
            bulkLoading = bl;
        }

        _.each(getSessionStorage("ar_lans").split("&"), function(v) {
             v = v.split("@");
            lans.push(v[0]);
            lanNames[v[0]] = v[1];
        });
    }
    return index === undefined ? lans : lans[index];
}
function getLanName(lan) {
    return lan === undefined ? lanNames : (lanNames[lan] || "");
}
/* END OF FILE */

