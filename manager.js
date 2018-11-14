$(function(){
  let localStream;
  var x,y,z = 0;
  let existingCall;


  const peer = new Peer({
    key:   "64584427-b066-4ec8-89d4-02db55ae61a3",
    debug: 0,
  });


  var sock = new WebSocket('ws://127.0.0.1:3120');

  sock.addEventListener('open',function(e){
      console.log('Socket Connecting');
  });

  peer.on('call', call => {
    call.answer(localStream);
    connection_data(call);
  });


  peer.on('error', err => {
    console.error(err.message);
  });

  peer.on('open', () => { 
    console.log(peer.id)   
    source_select();
  });

  peer.on('connection', c => {
    c.on('open', () => 
    c.on('data', data => {render_console(data)})
    );
  });



  source_select()
  const audioSelect = $('#audioSource');
  const videoSelect = $('#videoSource');
  const selectors = [audioSelect,videoSelect];

  navigator.mediaDevices.enumerateDevices()
    .then(deviceInfos => {
      const values = selectors.map(select => select.val() || '');
      selectors.forEach(select => {
        const children = select.children(':first');
        while (children.length) {
          select.remove(children);
        }
      });

      for (let i = 0; i !== deviceInfos.length; ++i) {
        const deviceInfo = deviceInfos[i];
        const option = $('<option>').val(deviceInfo.deviceId);

        if (deviceInfo.kind === 'audioinput') {
          option.text(deviceInfo.label ||
            'Microphone ' + (audioSelect.children().length + 1));
          audioSelect.append(option);
        } else if (deviceInfo.kind === 'videoinput') {
          option.text(deviceInfo.label ||
            'Camera ' + (videoSelect.children().length + 1));
          videoSelect.append(option);
        }
      }

      selectors.forEach((select, selectorIndex) => {
        if (Array.prototype.slice.call(select.children()).some(n => {
          return n.value === values[selectorIndex];
        })) {
          select.val(values[selectorIndex]);
        }
      });

      audioSelect.on('change', source_select);
      videoSelect.on('change', source_select);
    });



  function source_select() {
    // Get audio/video stream
    const audioSource = $('#audioSource').val();
    const videoSource = $('#videoSource').val();
    const constraints = {
      audio: {deviceId: audioSource ? {exact: audioSource} : true},
      video: {deviceId: videoSource ? {exact: videoSource} : true},
    }

    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
      $('#local').get(0).srcObject = stream;
      localStream = stream;

      if (existingCall) {
        existingCall.replaceStream(stream);
        return;
      }

      auto_connect();

    }).catch(err => {
      $('#step1-error').show();
      console.error(err);
    });
  }

  function connection_data(call){
    if (existingCall) {
      existingCall.close();
    }
    call.on('stream', stream => {
      console.log(stream.getAudioTracks());
      const el = $('#their-video').get(0);
      el.srcObject = stream;
      setTimeout( function() {
        const el = $('#their-video').get(0);
        el.play();
    }, 1);
    });

    existingCall = call;

  }

  function render_console(data){
    time = Date.now() - data.time;
    x = data.x.toFixed(6);
    y = data.y.toFixed(6);
    z = data.z.toFixed(6);
    w = data.w.toFixed(6);

    var json_parse = JSON.stringify({"osc":"WsOscSend","path":"/wek/inputs","type":"ffff","data":[x,y,z,w]});
    sock.send(json_parse);


    $("#console-window").html("[Log]"+time+","+x+","+y+","+z+","+w+"<br>")
  }

  function auto_connect(){
    peer.listAllPeers(peers => {
      $.each( peers, function( key, value ) {
        if(peer.id != value){

          console.log("c:"+value)
          const call = peer.call(value, localStream);
          self_connect = peer.connect(value)
          self_connect.on('data', data => render_console(data));
          connection_data(call)

          call.on('close', () => {
            console.log('connection closed');
          });
        }
      });
    });
  }

});

