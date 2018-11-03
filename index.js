$(function(){
  let localStream;
  var connecting_flag = false;
  var dataConnection; 
  var x,y,z = 0;
  let existingCall;
  var self_connect

  const peer = new Peer({
    key:   "64584427-b066-4ec8-89d4-02db55ae61a3",
    debug: 0,
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
    c.on('data', data => {console.log(data)})
    );
  });


  const audioSelect = $('#audioSource');
  const videoSelect = $('#videoSource');
  const selectors = [audioSelect];

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
      const el = $('#their-video').get(0);
      el.srcObject = stream;
      el.play();
    });

    existingCall = call;

  }


  function auto_connect(){
    peer.listAllPeers(peers => {
      $.each( peers, function( key, value ) {
        if(peer.id != value){

          console.log("c:"+value)
          const call = peer.call(value, localStream);
          self_connect = peer.connect(value)
          self_connect.on('data', data => get_command(data));
          connection_data(call)

          call.on('close', () => {
            console.log('connection closed');
          });
        }
      });
    });
  }


 $(".a-enter-vr-button").click(function() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen(); 
    }
  }
});

  var count = 0;

  AFRAME.registerComponent('camera-devise', {
    init: function () {
      this.currentPosition= new THREE.Quaternion();
    },
    tick: function () {
      count += 1;
      if(count >= 10){
        count = 0;
        var currentPosition = this.currentPosition;
        this.el.object3D.updateMatrixWorld();
        currentPosition = this.el.object3D.quaternion;
        
        if(self_connect != null){
          self_connect.send({
            "time": Date.now(),
            "x": currentPosition.x,
            "y": currentPosition.y,
            "z": currentPosition.z,
            "w": currentPosition.w
          });
        }
      }

    },
  
  });
});
