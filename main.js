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


  function view_connecting(){
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

    view_connecting()
  }


  window.addEventListener("devicemotion", function(evt){
    var xg = evt.accelerationIncludingGravity.x; // 横方向の傾斜
    var yg = evt.accelerationIncludingGravity.y; // 縦方向の傾斜
    var zg = evt.accelerationIncludingGravity.z; // 上下方向の傾斜
    var angle={};
    angle.y = Math.floor(Math.atan2(yg,zg)/Math.PI * 180);
    angle.x = Math.floor(Math.atan2(xg,zg)/Math.PI * 180);
    angle.z = Math.floor(Math.atan2(yg,xg)/Math.PI * 180);
    if(angle.x < 0){
      angle.x += 360;
    }
    if(angle.y < 0){
      angle.y += 360;
    }
    if(angle.z < 0){
      angle.z += 360;
    }

    
    self_connect.send({
      "time": Date.now(),
      "x": angle.x,
      "y": angle.y,
      "z": angle.z}
    );

  }, true);




}); 
