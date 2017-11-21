


let last = 0;
let capture;
var r, g, b;
let lastSample;


function setup(){

  r = 0;
  g = 0;
  b = 0;
  lastSample = millis();

	createCanvas(520,520);

  // navigator.mediaDevices.enumerateDevices()
  //   .then(function(devices) {
  //     devices.forEach(function(device) {
  //       console.log(device.kind + ": " + device.label +
  //                   " id = " + device.deviceId);
  //     });
  //   })
  //   .catch(function(err) {
  //     console.log(err.name + ": " + err.message);
  //   });

	capture = createCapture({
    audio: false,
    video: {
       optional: [{
        sourceId: 'be81bfce5d1f2f9423b11a5d530feded417a4553d4621877dff7fc2313c75675'
       }]
     }
  });
  capture.size(320, 240);
	capture.hide();
};

function draw(){
  image(capture, 0,0 , 320, 240);


  if(millis() - lastSample > 200){

    let sum = 0;
    capture.loadPixels();
    const pixels = capture.pixels;
    for (let i=0;i<capture.height;i+=20){
      for (let j=0;j<capture.width;j+=20){
        const c = (i*capture.width + j)*4;
        var rT = pixels[c];
        var gT = pixels[c + 1];
        var bT = pixels[c + 2];
        sum = (abs(r-rT) + abs(g - gT) + abs(b - bT));
        r=rT,g=gT,b=bT;
      }
    }

    if(sum >30){
      // console.log("Hand Detected");
    }

    // console.log(sum);
    last = sum;
    lastSample = millis();
  }
};
