window.current="";
window.testbed="";
window.node="";
window.capability="";
window.websocket="closed";
chrome.browserAction.setIcon({path:"ulogo48.png"});


function show(val) {
  var time = /(..)(:..)/.exec(new Date());     // The prettyprinted time.
  var hour = time[1] % 12 || 12;               // The prettyprinted hour.
  var period = time[1] < 12 ? 'a.m.' : 'p.m.'; // The period of the day.
  var notification = window.webkitNotifications.createNotification(
    "newswitch"+val+".0.png",                      // The image.
    hour + time[2] + ' ' + period, // The title.
    'Device Status Changed: '+val      // The body.
  );
  notification.show();
}

function loadSettings(obj){
      
        info = obj.data.split("+");
        window.testbed = info[0];
        window.node = info[1];
        window.capability = info[2];
	
	var url="http://uberdust.cti.gr/rest/testbed/"+ window.testbed +"/node/"+ window.node +"/capability/"+ window.capability +"/latestreading";
        $.get(url,function(data){
            var latest=data.split('\t');
            window.current= latest[1];
            chrome.browserAction.setIcon({path:"newswitch" + window.current + ".png"});
        });//end of $.get
        if(window.websocket=="closed"){
            console.log("first connection "+window.node);
            connect("uberdust.cti.gr",window.node,window.capability,function(value2add){
                console.log(value2add);
                var val=value2add.split(" ");
                chrome.browserAction.setIcon({path:"newswitch"+val[8]+".png"});
		if (window.current!=val[8]){
		  show(val[8]);
		}
                window.current=val[8];
            });
          window.websocket="open";
        }
}

function updateIcon() {
  chrome.storage.local.get('data', loadSettings );

    if(window.current==null){alert("null!");}
    if ( window.current == "0.0" ){
             $.post( "http://uberdust.cti.gr/rest/testbed/"+window.testbed+"/node/"+window.node+"/capability/" +window.capability+"/1/",function(){})
         .done(function() {
           })
         .fail(function() { alert("error"); });

    }
    else if(window.current == "1.0") {
        $.post( "http://uberdust.cti.gr/rest/testbed/"+window.testbed+"/node/"+window.node+"/capability/" +window.capability +"/0/",function(){})
            .done(function() {
            })
                .fail(function() { alert("error"); });

    } else if(window.current==""){ alert("No device is selected.Please select a device from the options menu.");}



}

chrome.storage.local.get('data', loadSettings );
chrome.browserAction.onClicked.addListener(updateIcon);

