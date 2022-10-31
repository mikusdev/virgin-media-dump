//(c) Copyright 2011-2012, ARRIS Group, Inc., All rights reserved.
var times = [
    "0:00:00",
    "1:01:00",
    "2:02:00",
    "3:03:00",
    "4:04:00",
    "5:05:00",
    "6:06:00",
    "7:07:00",
    "8:08:00",
    "9:09:00",
    "10:10:00",
    "11:11:00",
    "12:12:00",
    "13:13:00",
    "14:14:00",
    "15:15:00",
    "16:16:00",
    "17:17:00",
    "18:18:00",
    "19:19:00",
    "20:20:00",
    "21:21:00",
    "22:22:00",
    "23:23:00",
    "24:24:00"
];
var days = [ "0:Sun", "1:Mon","2:Tue","3:Wed", "4:Thu","5:Fri","6:Sat", "7:Sun"];
var timezones = [
    "0:(GMT-12:00) Eniwetok,Kwajalein",
    "2:(GMT-11:00) Midway Island,Samoa",
    "4:(GMT-10:00) Hawaii",
    "6:(GMT-09:00) Alaska",
    "8:(GMT-08:00) Pacific Time(US, Canada); Tijuana",
    "10.0:(GMT-07:00) Arizona",
    "10.1:(GMT-07:00) Mountain Time(US, Canada)",
    "12.0:(GMT-06:00) Central Time(US, Canada)",
    "12.1:(GMT-06:00) Mexico City, Tegucigalpa",
    "12.2:(GMT-06:00) Saskatchewan",
    "14.0:(GMT-05:00) Bogota, Lima, Quito",
    "14.1:(GMT-05:00) Eastern Time(US, Canada)",
    "14.2:(GMT-05:00) Indiana(East)",
    "16.0:(GMT-04:00) Atlantic Time(Canada)",
    "16.1:(GMT-04:00) Caracas, La Paz",
    "16.2:(GMT-04:00) Santiago",
    "17:(GMT-03:30) Newfoundland",
    "18.0:(GMT-03:00) Brasilia",
    "18.1:(GMT-03:00) Buenos Aires, Georgetown",
    "20:(GMT-02:00) Mid-Atlantic",
    "22:(GMT-01:00) Azores, Cape Verde Is.",
    "24.0:(GMT) Casablanca, Monrovia",
    "24.1:(GMT) Greenwich Mean Time : Edinburgh, London",
    "26.0:(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Vienna",
    "26.1:(GMT+01:00) Belgrade, Budapest, Ljubljana, Prague",
    "26.2:(GMT+01:00) Brussels, Copenhagen, Madrid, Paris",
    "26.3:(GMT+01:00) Sarajevo, Skopje, Sofija, Warsaw",
    "28.0:(GMT+02:00) Athens, Istanbul, Minsk",
    "28.1:(GMT+02:00) Bucharest",
    "28.2:(GMT+02:00) Cairo",
    "28.3:(GMT+02:00) Harare, Pretoria",
    "28.4:(GMT+02:00) Helsinki, Riga, Tallinn",
    "28.5:(GMT+02:00) Israel",
    "30.0:(GMT+03:00) Baghdad, Kuwait, Riyadh",
    "30.1:(GMT+03:00) Moscow, St. Petersburg, Volgograd",
    "30.2:(GMT+03:00) Nairobi",
    "31:(GMT+03:30) Tehran",
    "32.0:(GMT+04:00) Abu Dhabi, Muscat",
    "32.1:(GMT+04:00) Baku, Tbilisi",
    "33:(GMT+04:30) Kabul",
    "34.0:(GMT+05:00) Ekaterinburg",
    "34.1:(GMT+05:00) Islamabad, Karachi, Tashkent",
    "35:(GMT+05:30) Bombay, Calcutta, Madras, New Delhi",
    "36.0:(GMT+06:00) Almaty, Dhaka",
    "36.1:(GMT+06:00) Colombo",
    "38:(GMT+07:00) Bangkok, Hanoi, Jakarta",
    "40.0:(GMT+08:00) Beijing, Chongqing, Hong Kong",
    "40.1:(GMT+08:00) Perth",
    "40.2:(GMT+08:00) Singapore",
    "40.3:(GMT+08:00) Taipei",
    "42.0:(GMT+09:00) Osaka, Sapporo, Tokyo",
    "42.1:(GMT+09:00) Seoul",
    "42.2:(GMT+09:00) Yakutsk",
    "43.0:(GMT+09:30) Adelaide",
    "43.1:(GMT+09:30) Darwin",
    "44.0:(GMT+10:00) Brisbane",
    "44.1:(GMT+10:00) Canberra, Melbourne, Sydney",
    "44.2:(GMT+10:00) Guam, Port Moresby",
    "44.3:(GMT+10:00) Hobart",
    "44.4:(GMT+10:00) Vladivostok",
    "46:(GMT+11:00) Magadan, Solomon Is., New Caledonia",
    "48:(GMT+12:00) Auckland, Wellington"
];

//"sd\"msds\"".replace(/"/g,"\\\"")
//function dump() {
//    var keys = [];
//    var s = "";
//    _.each(_text, function(e,k) {
//        keys.push(k);
//    });
//    keys.sort();
//    _.each(keys, function(k) {
//        e = _text[k];
//        s += k+":\""+e.text+"\",\n";
//        if (e.help)
//            s += k+"_tt:\""+e.help+"\",\n";
//    });
//    $.log(s);
//}


// Click the WPS icon after entering the enrollee??s PIN to configure the network connection to the device.


var _xlate = {
};

var _msgs = [

   ];

var CustNameVTR = "Nextgen WiFi";
var CustNameVM = "Hub 4";
var CustNameVMIE = "Hub 2.0";
var CustNameLGI = "Connect Box";
var CustNameZiggo = "Connectbox Giga";
var CustNameTMAustria = "Internet Fiber Box";

for (var i=0; i<_msgs.length;i++)
    _xlate[_msgs[i]] = _msgs[i];


function dump_po() {
    _.each(_xlate, function(v,k) {
        k = k.replace(/"/g,'\\"');
        k = k.replace(/\\/g,"\\\\");
        $.log("msgid \""+k+"\"");
        v = v.replace(/"/g,'\\"');
        v = v.replace(/\\/g,"\\\\");
        $.log("msgstr \""+v+"\"");
        $.log("");
    });
}


function dumpit() {
    var keys = _.keys(_xlate).sort();
    var _xlate_en = { };
    _.each(keys, function(k) {
        _xlate_en[k] = _xlate[k];
    });
    $.getScript("text_es.js", function() {
        $.getScript("text_fr.js", function() {
            $.getScript("text_de.js", function() {
                $.getScript("text_pt.js", function() {
		var keys = _.keys(_xlate_en).sort();
                _.each(keys, function(k) {
                    $.log(k+"~"+_xlate_en[k]+"~"+(_xlate_es[k] || '')+"~"+(_xlate_fr[k]||'')+"~"+(_xlate_de[k]||'')+"~"+(_xlate_ptbr[k]||''));
                    })
               })
            })
        })
    });
}


function dump_txt() {
    _.each(_xlate, function(v,k) {
        k = k.replace(/"/g,'\\"');
        k = k.replace(/\\/g,"\\\\");
        //$.log(k);
        v = v.replace(/"/g,'\\"');
        v = v.replace(/\\/g,"\\\\");
        $.log(k+"~"+v);
       // $.log("");
    });
}
