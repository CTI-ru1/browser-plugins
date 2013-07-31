chrome.storage.local.get('data', function (obj) {

    info = obj.data.split("+");
    var testbed = info[0];
    var node = info[1];
    var capability = info[2];
    document.getElementById("selected").innerHTML="Selected Device:";
    document.getElementById("t").innerHTML=" Testbed:"+testbed;
    document.getElementById("n").innerHTML=" Node:"+node;
    document.getElementById("c").innerHTML=" Capability:"+capability;
});
// get testbed
    var testbed =document.getElementById("testbed");
    testbed.addEventListener('change', function(){
    console.log("Testbed "+testbed.value);
    var url='http://uberdust.cti.gr/rest/testbed/'+testbed.value+'/node/raw';
    $.get(url,function(data){

        var nodes=data.split("\n");

        var node = document.getElementById("nodes");

        if(testbed.value =="0"){
            node.options[0]=new Option("Select Node:","0");
            node.options.length=1;
        }else{
            node.options[0]=new Option("Select Node:","0");
            for(var i=0;i<nodes.length;i++){
                node.options[i+1]=new Option(nodes[i], nodes[i]);
            }
            node.options.length=nodes.length;
        }
    }).fail(function() { alert("error"); })

    }, false);

    //get node
    var node =document.getElementById("nodes");
    node.addEventListener('change', function(){
        console.log("Node "+node.value);
        var url='http://uberdust.cti.gr/rest/testbed/'+testbed.value+'/node/raw';
        $.get(url,function(data){
            var capability= new Array();
            var cap = document.getElementById("capabilities");
            if(node.value =="0"){
                cap.options[0]= new Option("Select Capability:","0");
                cap.options.length=1;
            }else{
                var testbed= document.getElementById("testbed").value;
                var url='http://uberdust.cti.gr/rest/testbed/'+testbed+'/node/'+node.value+'/capabilities';
                $.get(url,function(data){
                    var lines=data.split('\n');
                    var i, j, k=0;
                    cap.options[0]=new Option("Select Capability:","0");
                    for(i=0;i<lines.length;i++){
                        var urn = lines[i].split(":");
                        if(urn[0]=="urn"){
                            k++;
                            capability[k]="";
                            for(j=0;j<(urn.length-1);j++){
                                capability[k]=capability[k]+urn[j]+':';
                            }
                            var name = urn[urn.length-1];
                            var value = capability[k]+urn[urn.length-1];
                            cap.options[k]= new Option(name,value);
                        }
                    }
                    document.capform.capabilities.options.length=capability.length;
                });

            }
        }).fail(function() { alert("error"); })

    }, false);
        var form=document.getElementById("theForm");
        form.addEventListener("submit", function(){

        var data = document.getElementById("testbed").value+"+"+document.getElementById("nodes").value+"+"+document.getElementById("capabilities").value;
        chrome.storage.local.set({'data': data}); //contact with your background page and send the form data.

    });




