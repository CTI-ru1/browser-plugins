function getUberdustServer() {
    return window.localStorage.getItem("server");
}
function settings(){
	window.localStorage.setItem("server",$('#inputServer').val());
	window.localStorage.setItem("username",$('#inputUsername').val());
	window.localStorage.setItem("password",$('#inputPassword1').val());
	$('#username').text('Username: '+window.localStorage.getItem("username"));
	$('#server').text('Server: '+window.localStorage.getItem("server"));
}

function change(e) {
    var encodedDevice = e.target.id.split("-")[1];
    var nodes = null;
    try {
        nodes = JSON.parse(window.localStorage.getItem("nodes"));
    } catch (err) {
    }
    if (nodes === null || nodes.constructor !== Array) {
        nodes = new Array();
    }
    for (var i = 0; i < nodes.length; i++) {
        var testbed = nodes[i]["testbed"];
        var nodename = nodes[i]["node"];
        var capability = nodes[i]["capability"];
        var value = window.nodes[i]["value"];
        console.log("hadValue" + value);
        var encodedId = nodes[i]["id"];
        var imgid = "img-" + encodedId;
		var server = window.localStorage.getItem("server");
        if (encodedDevice == encodedId) {
            window.nodes = nodes;
            window.i = i;
            if (window.nodes[i]["value"] == 1.0) {
                value = 0;
            } else {
                value = 1;
            }
			
            console.log("post "+server +" "+ value);
            $("#" + imgid).attr("src", "/img/loading.gif");
            $.post("http://" + getUberdustServer() + "/rest/testbed/" + testbed + "/node/" + nodename + "/capability/" + capability + "/" + value + "/", function () {
            });
            break;
        }	
    }
}

function getTestbeds() {
    var getAllTestbeds = "http://" + getUberdustServer() + "/rest/testbed/json";
    $.getJSON(getAllTestbeds, function (data) {
        console.log("got the testbeds");
        var testbed = document.getElementById("testbed");
        testbed.options[0] = new Option("Select Testbed:", "0");
        for (var i = 0; i < data.length; i++) {
            var obj = data[i];
            testbed.options[i + 1] = new Option(obj["testbedName"], obj["testbedId"]);
        }
    });
};


function getNodes() {
    var testbed = document.getElementById("testbed").value;
    var url = "http://" + getUberdustServer() + '/rest/testbed/' + testbed + '/virtualnode/raw';
    $.get(url,function (data) {

        var nodes = data.split("\n");

        var node = document.getElementById("nodes");

        if (testbed.value == "0") {
            node.options[0] = new Option("Select Node:", "0");
            node.options.length = 1;
        } else {
            node.options[0] = new Option("Select Node:", "0");
            for (var i = 0; i < nodes.length; i++) {
                node.options[i + 1] = new Option(nodes[i], nodes[i]);
            }
            node.options.length = nodes.length;
        }
    }).fail(function (data) {
            showToast(testbed);
        })

};


function getCapabilities() {
    var testbed = document.getElementById("testbed").value;
    var node = document.getElementById("nodes").value;
    var url = "http://" + getUberdustServer() + "/rest/testbed/" + testbed + "/node/raw";
    $.get(url,function (data) {
        var capability = new Array();
        var cap = document.getElementById("capabilities");
        if (node.value == "0") {
            cap.options[0] = new Option("Select Capability:", "0");
            cap.options.length = 1;
        } else {
            var testbed = document.getElementById("testbed").value;
            var url = "http://" + getUberdustServer() + '/rest/testbed/' + testbed + '/node/' + node + '/capabilities';
            $.get(url, function (data) {
                var lines = data.split('\n');
                var i, j, k = 0;
                cap.options[0] = new Option("Select Capability:", "0");
                for (i = 0; i < lines.length; i++) {
                    var urn = lines[i].split(":");
                    if (urn[0] == "urn") {
                        k++;
                        capability[k] = "";
                        for (j = 0; j < (urn.length - 1); j++) {
                            capability[k] = capability[k] + urn[j] + ':';
                        }
                        var name = urn[urn.length - 1];
                        var value = capability[k] + urn[urn.length - 1];
                        cap.options[k] = new Option(name, value);
                    }
                }
                //document.capform.capabilities.options.length = capability.length;
            });
        }
    }).fail(function (data) {
            showToast(data);
        })

};

function replaceAll(find, replace, str) {
    return str.replace(new RegExp(find, 'g'), replace);
}
function addtolist() {
    var nodes = null;
    try {
        nodes = JSON.parse(window.localStorage.getItem("nodes"));
    } catch (err) {
    }
    if (nodes === null || nodes.constructor !== Array) {
        nodes = new Array();
    }
    var encodedNodeName = replaceAll("\\.", "", replaceAll(":", "", $('#nodes :selected').val()));
    var encodedCapability = replaceAll("\\.", "", replaceAll(":", "", $('#capabilities :selected').val()));
    var encodedId = encodedNodeName + encodedCapability;

    nodes.push(
        {'testbed': $('#testbed :selected').val(),
            'node': $('#nodes :selected').val(),
            'capability': $('#capabilities :selected').val(),
            'value': 1,
            'id': encodedId,
            'socket': ""
        }
    );

    window.localStorage.setItem("nodes", JSON.stringify(nodes));
    window.location.reload();
}

function get_schedules(){
	var server = window.localStorage.getItem("server");
    var getSchedules = "http://" + getUberdustServer() + "/rest/schedule/json";
    $.getJSON(getSchedules, function (data) {
        console.log("got schedules");
        for (var i = 0; i < data.length; i++) {
            var obj = data[i];
            console.log("schedule "+obj['id']);
        }

    })

}

function addschedule(e) {
    $("#time").text("");
    $("#device").text("");
    $("#sdate").text("");
    var check=1;
    var jcode= new Object();
    if($('input[name=device]:checked').val()==null){
        $("#device").text("Select device!");
        check=0;
    }else
    {
        var id = $('input[name=device]:checked').val().split(" ");
        jcode.node=id[0];
        jcode.capability=id[1];
    }
    if($('#time1').val()==""){
        $("#time").text("Insert time!");
        check=0;
    }else
    {
        timefrom=$('#time1').val().split(":");
        jcode.hour=timefrom[0];
        jcode.minute=timefrom[1];
    }

    jcode.payload=$('input[name=payload]:checked').val();
    jcode.second="0";
    jcode.month="*";
    jcode.dom="*";
    jcode.dow="*";
    if($('#repeat').val()=="true"){
        jcode.type="cron";
        if($('input[name=freq]:checked').val()=="weekly"){
            jcode.dow=$("#dow").val();
        }else if($('input[name=freq]:checked').val()=="monthly"){
            jcode.dom=$("#dom").val();
        }
    }
    else{
        if($("#datepicker1").val()==""){
            $("#sdate").text("Insert date!");
            check=0;
        }
        jcode.type="oneoff";
    }

    console.log(JSON.stringify(jcode));

	server = window.localStorage.getItem("server");
    if(check){
                try {
            $("#output").text("Planning...");
                    $.ajax({
                        url: server+'/rest/schedule/add',
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify(jcode),
                        processData: false,
                        dataType: 'json'
                });
            $("#output").text("Ok!");
        } catch (err) {
            $("#output").text("Rule is not complete.");
        }

    }else $("#output").text("Try again...");
}


function repeatfreq(e){
    if(repeat.checked)
    {
        $("#frequency").show();
        $('#repeat').val('true');
        $("#date").hide();

    }
    else  {
        $("#date").show();
        $("#frequency").hide();
        $('#repeat').val('false');
    }

}

function disableform(e){
    if ( $('input[name=freq]:checked').val()=="weekly")
    {   $("#dayofmonth").hide();
        $("#dayofweek").show();
    }
    else if ( $('input[name=freq]:checked').val()=="monthly"){
        $("#dayofweek").hide();
        $("#dayofmonth").show();
    }
    else {
         $("#dayofweek").hide();
         $("#dayofmonth").hide();
    }


}
function removeElement(e) {
    removeli = "li-" + e.target.id.split("-")[1];
    $("#" + removeli).remove();
    console.log("remove element " + removeli + " socket " + e.target.socket);
    var nodes = null;
    try {
        nodes = JSON.parse(window.localStorage.getItem("nodes"));
    } catch (err) {
    }
    if (nodes === null || nodes.constructor !== Array) {
        nodes = new Array();
    }
    for (var i = 0; i < nodes.length; i++) {
        var nodename = nodes[i]["node"];
        var encodedNodeName = replaceAll("\\.", "", replaceAll(":", "", nodename));
        var capability = nodes[i]["capability"];
        var encodedCapability = replaceAll("\\.", "", replaceAll(":", "", capability));
        var encodedId = nodes[i]["id"];
        var id = "li-" + encodedId;
        var removeid = "remove-" + encodedId;
        var scheduleid = "schedule-" + encodedId;
        var imgid = "img-" + encodedId;

        if (id == removeli) {
            console.log("first:" + id);
            console.log("second:" + removeli);
            var index = nodes.indexOf(nodes[i]);
            nodes.splice(index, 1);
            break;
        }
    }
    window.localStorage.setItem("nodes", JSON.stringify(nodes));
}

function populate(i, nodes) {
    if (i >= nodes.length) return;
    var nodename = nodes[i]["node"];
    var testbed = nodes[i]["testbed"];
    var capability = nodes[i]["capability"];
    var encodedId = nodes[i]["id"];
    var id = "li-" + encodedId;
    var removeid = "remove-" + encodedId;
    var imgid = "img-" + encodedId;	
    $("#scheduleForm").append("<input type ='radio' value ='"+nodename+" "+capability+"'name='device'>"+nodename+" "+capability+" </input></br>");
    $("#controls ul").append('<li id="' + id + '" class="media"><img id="' + imgid + '" class="media-object pull-left" src="img/newswitch1.0.png" alt="1" style="width:100px"><div class="media-body"><h4 class="media-heading">' + nodename + '</h4>' + capability + '   Value: <span id="'+imgid+'value"></span><button class="btn btn-danger removeitem" id="' + removeid + '" >Delete</button></div></li>');
    socket = connect(getUberdustServer(), nodename, capability, function (value2add) {
        var val = value2add.split(" ");
        window.nodes[window.i]["value"] = val[8];
        var nodes = null;
        try {
            nodes = JSON.parse(window.localStorage.getItem("nodes"));
        } catch (err) {
        }
        if (nodes === null || nodes.constructor !== Array) {
            nodes = new Array();
        }
        for (var i = 0; i < nodes.length; i++) {
            var ctestbed = nodes[i]["testbed"];
            var cnodename = nodes[i]["node"];
            var ccapability = nodes[i]["capability"];
            var encodedId = nodes[i]["id"];
            var imgid = "img-" + encodedId;
            if ((nodename == cnodename) && (capability == ccapability)) {
                nodes[i]["value"] = val[8];
                if (capability.match(".*:[1-9]r") || capability.match(".*:[1-9]ac") || capability.match(".*:lz[1-9]")) {
                    $("#" + imgid).attr("src", "img/newswitch" + parseInt(val[8]) + ".0.png");
                }else{
                    $("#"+imgid+"value").text(val[8]);
                }
            }
        }
        window.localStorage.setItem("nodes", JSON.stringify(nodes));

    });
    nodes[i]['socket'] = socket;

    var url = "http://" + getUberdustServer() + "/rest/testbed/" + testbed + "/node/" + nodename + "/capability/" + capability + "/latestreading";
    window.nodes = nodes;
    window.i = i;
    document.querySelector('#' + imgid).addEventListener('click', change);
    $.get(url, function (data) {
        var latest = data.split('\t')[1];
        console.log(parseInt(data.split('\t')[1]));
        window.nodes[window.i]["value"] = parseInt(latest);

        if (capability.match(".*:[1-9]r") || capability.match(".*:[1-9]ac") || capability.match(".*:lz[1-9]")) {
            $("#" + imgid).attr("src", "img/newswitch" + window.nodes[window.i]["value"] + ".0.png");
        } else {
            $("#" + imgid).attr("src", "img/sensor.png");
            $("#" + imgid + "value").text(latest);
        }
        //document.capform.capabilities.options.length = capability.length;
        console.log(imgid);
        window.localStorage.setItem("nodes", JSON.stringify(window.nodes));
        populate(i + 1, nodes);
    });//end of $.get
    document.querySelector('#' + removeid).addEventListener('click', removeElement);
    //  document.querySelector('#' + scheduleid).addEventListener('click', scheduleElement);
}

function populateMedia() {
    var nodes = null;
    try {
        nodes = JSON.parse(window.localStorage.getItem("nodes"));
    } catch (err) {
    }
    window.nodes = nodes;
    if (nodes === null || nodes.constructor !== Array) {
        nodes = new Array();
    }
    console.log(nodes.length);
    if (nodes.length > 0) {
        $("#collapseOne").removeClass("in");
    }

    var i = 0;
    populate(i, nodes);
    var url = "";
    $.get(url,function (data) {

        var nodes = data.split("\n");

        var node = document.getElementById("nodes");

        if (testbed.value == "0") {
            node.options[0] = new Option("Select Node:", "0");
            node.options.length = 1;
        } else {
            node.options[0] = new Option("Select Node:", "0");
            for (var i = 0; i < nodes.length; i++) {
                node.options[i + 1] = new Option(nodes[i], nodes[i]);
            }
            node.options.length = nodes.length;
        }
    })

    $.get("http://uberdust.cti.gr/rest/username", function (data) {
       // $( "#username" ).text("You are logged in as "+data);
    })
    $("#dayofweek").hide();
    $("#dayofmonth").hide();
    $("#frequency").hide();
    $("#disabledate").hide();
}

function init() {
	if(typeof(window.localStorage.getItem("server"))== "undefined" || window.localStorage.getItem("server") == null){
		window.localStorage.setItem("server","http://uberdust.cti.gr");
	}
	
	$('#username').text('Username: '+window.localStorage.getItem("username"));
	$('#server').text('Server: '+window.localStorage.getItem("server"));
    populateMedia();
    getTestbeds();
    $( "#datepicker1" ).datepicker();
    $( "#datepicker2" ).datepicker();
    get_schedules();
}

// Add event listeners once the DOM has fully loaded by listening for the
// `DOMContentLoaded` event on the document, and adding your listeners to
// specific elements when it triggers.
document.addEventListener('DOMContentLoaded', function () {
    init();
//    document.querySelector('img').addEventListener('click', change);
    document.querySelector('#testbed').addEventListener('change', getNodes);
    document.querySelector('#nodes').addEventListener('change', getCapabilities);
    document.querySelector('#addtolist').addEventListener('click', addtolist);
    document.querySelector('#addschedule').addEventListener('click',addschedule );
    document.querySelector('#repeat').addEventListener('click',repeatfreq );
    document.querySelector('#frequency').addEventListener('click',disableform );
});

