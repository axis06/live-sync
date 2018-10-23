$(function(){
  let localStream;
  var connecting_flag = false;
  var self_pos = "headset";
  var dataConnection; 
  var self_connect;
  var time = 0;
  var x,y,z = 0;


  $("#Headset").click(function() {
    $("#menu").hide();
    $("#headset_side").show();
  });

  $("#Computational").click(function() {
    $("#menu").hide();
    $("#clomputatuional_side").show();
    self_pos = "computational"

    peer.listAllPeers(peers => {
      $.each( peers, function( key, value ) {
        if(peer.id != value){
          const call = peer.call(value,localStream);
          self_connect = peer.connect(value)
          self_connect.on('data', data => get_command(data));

          call.on('stream', stream => {
            const el = $('#video').get(0);
            el.srcObject = stream;
            el.play();

            connecting_flag = true;
            view_connecting()
          });
      
          call.on('close', () => {
            console.log('connection closed');
          });
        }
      });
    });
  });

  const peer = new Peer({
    key:   "64584427-b066-4ec8-89d4-02db55ae61a3",
    debug: 3,
  });

  peer.on('open', () => {
    view_connecting()
  });

  peer.on('connection', c => {
    self_connect = c;
    c.on('open')
    c.on('data', data => console.log(data));
  });

  navigator.mediaDevices.getUserMedia({audio: true, video: true}).then(stream => {
    $('#local').get(0).srcObject = stream;
    localStream = stream;
  }).catch(err => {
    console.error(err);
  });

  peer.on('call', call => {
    call.answer(localStream);
    call.on('stream', stream => {
      const el = $('#video').get(0);
      el.srcObject = stream;
      el.play();


      connecting_flag = true
      view_connecting()
    });

  });

  peer.on('error', err => {
    alert(err.message);
    connecting_flag = false;
    view_connecting()
  });

  function view_connecting(){
    var status = "no connect"
    if(connecting_flag == true){status = "connected"}

    $('.connect-info').html(
      "CONNECTING<br>" +
      "[PeerID] " + peer.id + "<br>" +
      "[Status] " + status + "<br>" +
      "[Ping] " + time  + "ms<br>"
      );
  }


  function view_data(){
    if(connecting_flag){
    $('.data-info').html(
      "CONNECTING<br>" +
      "[x] " + x + "<br>" +
      "[y] " + y + "<br>" +
      "[z] " + z + "<br>"
      );
    }
  }

  function get_command(data){
    time = Date.now() - data.time;
    x = data.x;
    y = data.y;
    z = data.z;


    var json_parse = JSON.stringify({"osc":"WsOscSend","path":"/wek/inputs","type":"fff","data":[data.x,data.y,data.z]});


    sock.send(json_parse);

    view_connecting();
    view_data();
  }

  var sock = new WebSocket('ws://127.0.0.1:3100');

  sock.addEventListener('open',function(e){
      console.log('Socket Connecting');
  });

  window.addEventListener("devicemotion", function(evt){

    self_connect.send({
      "time": Date.now(),
      "x": evt.accelerationIncludingGravity.x,
      "y": evt.accelerationIncludingGravity.y,
      "z": evt.accelerationIncludingGravity.z});
    
  }, true);


}); 
