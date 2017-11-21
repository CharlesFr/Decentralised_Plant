function Plant(numLeaves, id) {
  this.numLeaves = numLeaves;
  this.id = id;
  this.addButton = createButton('+');
  this.addButton.mousePressed(this.addLeaf);

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
  this.drawControls(lastRow);
  this.layoutButtons(lastRow);



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

Plant.prototype.layoutButtons = function(lastRow) {
  this.addButton.position(windowWidth /3 - 70 , windowHeight - 165);

}



var img;

var myFont;
var openSans;
var button;
var numberOf = 20;
var cnv;
var plantArray = [];

let last = 0;
let capture;
var r, g, b;
let lastSample;
var isDetecting = true;



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
  // getWebcamDetails();

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
  background(28, 31, 34);
  for (var i = 0; i < plantArray.length; i++) {
    let plant = plantArray[i];
    plant.drawLeaves(img);
  }

  push();
  stroke(255);
  strokeWeight(0.5);
  line(0.35*windowWidth-5, 0, 0.35*windowWidth-5, 0.8*windowHeight);
  pop();

  image(capture, windowWidth/20, windowHeight-320, 160, 120);


  if(millis() - lastSample > 200 && isDetecting === true){

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

    if(sum < 6){
      console.log("Hand Detected");
      isDetection = false;
      $('#myModal').modal('show');


    }

    console.log(sum);
    last = sum;
    lastSample = millis();
  }

}
