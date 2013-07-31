window.current="";
window.testbed="";
window.node="";
window.capability="";
window.websocket="closed";
chrome.browserAction.setIcon({path:"ulogo48.png"});

function updateIcon() {

    chrome.storage.local.get('data', function (obj) {
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
                window.current=val[8];
                chrome.browserAction.setIcon({path:"newswitch"+val[8]+".png"});
            });
          window.websocket="open";
        }

    });//end storage get
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

    } else if(window.current==""){ alert("Set Options or Wait!");}



}
chrome.browserAction.onClicked.addListener(updateIcon);

