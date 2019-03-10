let errfunc = function(err){
    console.log("Error : ", err);
};

let remoteContainer = document.getElementById("remote-container");

//To add video stream to the container.
function addVideoStream(streamId){
    let strDiv = document.createElement("div"); 
    strDiv.id = streamId;                       
    strDiv.style.transform = "rotateY(180deg)"; 
    remoteContainer.appendChild(strDiv);      
}

//To remove the video stream from the container.
function removeVideoStream (event) {
    let stream = event.stream;
    stream.stop();
    let remDiv = document.getElementById(stream.getId());
    remDiv.parentNode.removeChild(remDiv);
    console.log("Remote stream is removed " + stream.getId());
}

//
let client = AgoraRTC.createClient({
    mode : 'live',
    codec : "h264"
});

//Initializing client
client.init("3297051f59d6438c9011ed11254b828e", function(){
    console.log("Initialized successfully!");
});

//Joining the client
client.join(null, 'video-demo', null, function(uid){

    let lstream = AgoraRTC.createStream({
        streamID : uid,
        audio : false,
        video : true,
        screen : false
    });

    //Publishing the stream.
    lstream.init(function(){
        lstream.play('me');
        client.publish(lstream, errfunc);

        client.on('stream-added', (event)=>{
            client.subscribe(event.stream,errfunc);
        });

        client.on('stream-subscribed', (event)=>{
            let stream = event.stream;
            addVideoStream(stream.getId());
            stream.play(stream.getId());
        });
        client.on('stream-removed', removeVideoStream);
    },errfunc);

},errfunc);
