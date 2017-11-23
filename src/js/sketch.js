function Plant(numLeaves, id) {
  this.numLeaves = numLeaves;
  this.id = id;
  //this.addButton = createButton('+');
  //this.addButton.mousePressed(this.addLeaf);

}

Plant.prototype.drawLeaves = function(img) {

  if (this.numLeaves < 8) {
    var across = numberOf;
    var down = 1;
  } else {
    var down = ceil(this.numLeaves / 8);
    var across = 8;

  }
  push();


  translate(width / 8, this.id * 200 + 50);
  stroke(255);
  fill(255);

  var rows = 12;
  var cols = 8;
  var total = rows * cols;
  var i = 0;
  var lastRow = 0;
  while (i < this.numLeaves) {
    var posX = Math.floor(i / cols);
    var posY = i % cols;

    image(img, 40 * posY+40, 40 * posX + 30, 25, 25);
    lastRow = posY * 40;

    i++;
  }
  textFont(myFont);
  textSize(40);
  text("PLANT " + this.id.toString(), windowWidth / 8, lastRow+100);
  pop();
  //this.drawControls(lastRow);
  //this.layoutButtons(lastRow);

}

Plant.prototype.drawControls = function(lastRow) {

  textAlign(CENTER);
  textFont(myFont);
  textSize(70);
  text(this.numLeaves.toString(), windowWidth / 4, windowHeight - 240);
  textSize(35);
  stroke(255, 0, 0);
  fill(255, 0, 0);
  text("-5", windowWidth / 4+40, windowHeight - 250);
  stroke(255);
  fill(255);
  textFont(openSans);
  textSize(12);
  text("Number of Leaves", windowWidth / 4, windowHeight - 220);


}

Plant.prototype.addLeaf = function() {
  console.log(this.numLeaves);
  this.numLeaves += 1;

}

Plant.prototype.removeLeaf = function() {
  this.numLeaves -= 1;
}

// Plant.prototype.layoutButtons = function(lastRow) {
//   this.addButton.position(windowWidth /3 - 70 , windowHeight - 165);
//
// }



var img;

var myFont;
var openSans;
var button;
var numberOf = 20;
var cnv;
var plantArray = [];

let last = 0;
let capture;
let previousPixels;
let isDetecting = true;



function preload() {
  img = loadImage("./assets/leaf.png");
  myFont = loadFont('./css/LabMedium.ttf');
  openSans = loadFont('./css/OpenSans-Light.ttf');
  var plant = new Plant(20, 0);
  plantArray.push(plant);
  console.log(plantArray);
}

var backgroundPixels;

function resetBackground() {
    backgroundPixels = undefined;
}

function setup() {


  r = 0;
  g = 0;
  b = 0;
  lastSample = millis();


  var elt = document.getElementById("plant");
  cnv = createCanvas(0.4 * windowWidth, 0.8 * windowHeight);
  cnv.parent('plant');
  //getWebcamDetails();

  capture = createCapture({
    audio: false,
    video: {
       optional: [{
        sourceId: 'a8d2153b58f95afaeb2a7c293d4a8d6501ccc5f91157c8cd086dcf6acada66ed'
       }]
     }
  });
  capture.size(320, 240);
  capture.hide();

  document.getElementById("closeModal").addEventListener("click", function(){
      isDetecting = true;
  });

}

function getWebcamDetails(){
  navigator.mediaDevices.enumerateDevices()
    .then(function(devices) {
      devices.forEach(function(device) {
        console.log(device.kind + ": " + device.label +
                    " id = " + device.deviceId);
      });
    })
    .catch(function(err) {
      console.log(err.name + ": " + err.message);
    });
}



function draw() {


    capture.loadPixels();
    var total = 0;
    if (capture.pixels.length > 0) { // don't forget this!
        if (!previousPixels) {
            previousPixels = copyImage(capture.pixels, previousPixels);
        } else {
            var w = capture.width,
                h = capture.height;
            var i = 0;
            var pixels = capture.pixels;
            var thresholdAmount = 25;
            thresholdAmount *= 3; // 3 for r, g, b
            for (var y = 0; y < h; y++) {
                for (var x = 0; x < w; x++) {
                    // calculate the differences
                    var rdiff = Math.abs(pixels[i + 0] - previousPixels[i + 0]);
                    var gdiff = Math.abs(pixels[i + 1] - previousPixels[i + 1]);
                    var bdiff = Math.abs(pixels[i + 2] - previousPixels[i + 2]);
                    // copy the current pixels to previousPixels
                    previousPixels[i + 0] = pixels[i + 0];
                    previousPixels[i + 1] = pixels[i + 1];
                    previousPixels[i + 2] = pixels[i + 2];
                    var diffs = rdiff + gdiff + bdiff;
                    var output = 0;
                    if (diffs > thresholdAmount) {
                        output = 255;
                        total += diffs;
                    }
                    pixels[i++] = output;
                    pixels[i++] = output;
                    pixels[i++] = output;
                    // also try this:
                    // pixels[i++] = rdiff;
                    // pixels[i++] = gdiff;
                    // pixels[i++] = bdiff;
                    i++; // skip alpha
                }
            }
        }
    }
    // need this because sometimes the frames are repeated
    if (total > 2000 && !$('#myModal').hasClass('in')) {
        $('#myModal').modal('show');
        console.log("The threshold that triggered it was:", total);
    }
    if(total > 0){
      capture.updatePixels();
      background("#1b1f22");
      image(capture, windowWidth/20, windowHeight-320, 160, 120);
    }
  }

function copyImage(src, dst) {
    var n = src.length;
    if (!dst || dst.length != n) {
        dst = new src.constructor(n);
    }
    while (n--) {
        dst[n] = src[n];
    }
    return dst;
}


// function draw() {
//   background(28, 31, 34);
//   for (var i = 0; i < plantArray.length; i++) {
//     let plant = plantArray[i];
//     plant.drawLeaves(img);
//   }
//
//   push();
//   stroke(255);
//   strokeWeight(0.5);
//   line(0.35*windowWidth-5, 0, 0.35*windowWidth-5, 0.8*windowHeight);
//   pop();
//
//   image(capture, windowWidth/20, windowHeight-320, 160, 120);
//
//
//   if(millis() - lastSample > 200 && isDetecting === true){
//
//     let sum = 0;
//     capture.loadPixels();
//     const pixels = capture.pixels;
//     for (let i=0;i<capture.height;i+=20){
//       for (let j=0;j<capture.width;j+=20){
//         const c = (i*capture.width + j)*4;
//         var rT = pixels[c];
//         var gT = pixels[c + 1];
//         var bT = pixels[c + 2];
//         sum = (abs(r-rT) + abs(g - gT) + abs(b - bT));
//         r=rT,g=gT,b=bT;
//       }
//     }
//
//     if(sum < 6 && $('#myModal').hasClass('in')){
//       console.log("Hand Detected");
//       isDetection = false;
//       $('#myModal').modal('show');
//     }
//
//     console.log(sum);
//     last = sum;
//     lastSample = millis();
//   }
//
// }
