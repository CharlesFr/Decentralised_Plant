var img;

var myFont;
var openSans;
var button;
var numberOf = 20;


function preload() {
  img = loadImage("./assets/leaf.png");
  myFont = loadFont('./css/LabThin.ttf');
  openSans = loadFont('./css/OpenSans-Light.ttf');
}

function setup() {

  var elt = document.getElementById("plant");
  console.log(elt.style.height);

  cnv = createCanvas(400, 600);
  cnv.parent('plant');

  button = createButton('+');
  button.parent('plant');
  button.mouseReleased(addLeaf);
  drawLeaves(numberOf, 1);


}

function drawLeaves(numberOf, plantID) {

  if (numberOf < 8) {
    var across = numberOf;
    var down = 1;
  } else {
    var down = ceil(numberOf / 8);
    var across = 8;

  }
  push();

  translate(0, 100);
  stroke(255);
  fill(255);
  textSize(25);
  textFont(myFont);
  text("PLANT " + plantID.toString(), 0, -30);
  var rows = 8;
  var cols = 5;
  var total = rows * cols;
  var i = 0;
  var lastRow = 0;
  while (i < numberOf) {
    var posX = Math.floor(i / rows);
    var posY = i % rows;

    image(img, 50 * posY, 50 * posX, 25, 25);
    lastRow = posY * 50;

    i++;
  }
  textAlign(CENTER);

  textSize(70)
  text(numberOf.toString(), 150, 150 + 100);
  textSize(35);
  stroke(255, 0, 0);
  fill(255, 0, 0);
  text("-5", 200, 150 + 90);
  stroke(255);
  fill(255);
  textFont(openSans);
  textSize(12);
  text("Number of Leaves", 150, 150 + 130);
  button.position(40, 150+155);


  pop();


}

function addLeaf(){
  numberOf+=1;

}


function draw() {
  background(28,31,34);
  drawLeaves(numberOf, 1);


}
