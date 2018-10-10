$(function(){
  $("#Headset").click(function() {
    $("#menu").hide();
    $("#headset_side").show();
  });

  $("#Computational").click(function() {
    $("#menu").hide();
    $("#clomputatuional_side").show();
  });


  // Peer object
  const peer = new Peer({
    key:   "64584427-b066-4ec8-89d4-02db55ae61a3",
    debug: 3,
  });

  let localStream;

  peer.on('open', () => {
    $('#connect-info').html(
      "CONNECTING<br>" +
      "[PeerID]" + peer.id + "<br>"
      );
  });

  // Receiving a call
  peer.on('call', cal => {
    call.answer(localStream);
  });

  peer.on('error', err => {
    alert(err.message);
  });


}); 
