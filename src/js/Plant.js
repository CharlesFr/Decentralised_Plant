var tree, tf, xoff;

let capture;
let previousPixels;
let isDetecting = true;
let timer = 0;

function setup() {
  //getWebcamDetails();

  var clientWidth = document.getElementById('plant').clientWidth;
  var clientHeight = document.getElementById('plant').clientHeight;

  cnv = createCanvas(clientWidth, clientHeight);
  cnv.parent('plant');

  // This Object is just used to record the transformation matrix in the recursive Tree compute function for later manipulation
  tf = new Transformer();
  tree = new Tree({
    x: width * .5,
    y: height * 0.7
  }, 150);
  tree.compute();
  xoff = .0;

  capture = createCapture({
    audio: false,
    video: {
      optional: [{
        sourceId: 'a8d2153b58f95afaeb2a7c293d4a8d6501ccc5f91157c8cd086dcf6acada66ed' // This will change
      }]
    }
  });
  capture.size(320, 240);
  capture.hide();

  // We wait x seconds before detecting otherwise modal freezes - leaving the time for the plant to stop moving.
  document.getElementById("closeModal").addEventListener("click", function() {
    timer = millis();
  });
}

function draw() {
  background(28, 31, 34);
  tree.draw();
  detectMovement();
}

function detectMovement() {

  capture.loadPixels();
  image(capture, width / 2 - 80, height - 120, 160, 120);
  var total = 0;
  if (capture.pixels.length > 0) { // don't forget this!
    if (!previousPixels) {
      previousPixels = copyImage(capture.pixels, previousPixels);
    } else {
      var w = capture.width,
        h = capture.height;
      var i = 0;
      var pixels = capture.pixels;
      var thresholdAmount = 40;
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
          i++; // skip alpha
        }
      }
    }
  }

  if (total > 8000 && isDetecting && !$('#myModal').hasClass('in') && millis() > 10000) { // threshold gets triggered on initialisation -> wait 15sec
    $('#myModal').modal('show');
    console.log("The threshold that triggered it was:", total);
    isDetecting = false;
    timer = millis();
    console.log("Opening Modal:", isDetecting, millis() - timer, timer)
  }

  //We wait x Seconds after modal is closed to start detecting again (The plant keeps moving.)
  if (!isDetecting && millis() - timer > 3000 && !$('#myModal').hasClass('in')) {
    isDetecting = true;
    console.log("Two seconds passed:", isDetecting, millis() - timer, timer)
  }
  // need this because sometimes the frames are repeated
  if (total > 0) {
    capture.updatePixels();
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

function getWebcamDetails() {
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

function drawLeaf(x, y) {
  push();
  translate(x - 50, y - 100);
  rotate(this.angle);
  var controlPt1 = {
    x: 10,
    y: 15
  };
  var controlPt2 = {
    x: 10,
    y: 85
  };
  //strokeWeight(2);
  //stroke("#03994b");
  noStroke();
  fill("#008705"); //"#11d871");
  beginShape();
  vertex(50, 0);
  bezierVertex(controlPt1.x, controlPt1.y, controlPt2.x, controlPt2.y, 50, 100)
  vertex(50, 0)
  bezierVertex(100 - controlPt1.x, controlPt1.y, 100 - controlPt2.x, controlPt2.y, 50, 100)
  endShape();
  pop();
}

class Tree {

  constructor(_rootPos, _leaves) {

    this.rootPos = _rootPos;
    // The number of branches each branch splits into
    this.branchingFactor = 3;

    // The angle between the branches in degrees
    this.angleBetweenBranches = 30;

    // Controls how much smaller each level of the tree gets
    this.scaleFactor = .9;

    // The number of levels of the tree drawn
    this.numLevels = 4;

    // The length of the branches
    this.baseBranchLength = this.rootPos.x * .4;

    this.leaves = [];
    this.leavesAttr = [];
    this.branches = [];
    this.leavesNum = _leaves;
    this.leavesRemove = [];
  }

  compute() {

    tf.translate(this.rootPos.x, this.rootPos.y);
    this.computeTree(this.numLevels, this.baseBranchLength);
    resetMatrix();

    var count = 0;
    while (count < this.leavesNum) {

      let i = parseInt(random(0, this.leaves.length));
      if (Math.abs(this.leaves[i].d) != this.baseBranchLength) {

        this.leavesAttr.push({
          x: this.leaves[i].x,
          y: this.leaves[i].y,
          align: this.leaves[i].r,
          s: random(0.08, 0.22), // This is the leaf size variation
          offset: random(0, -this.leaves[i].d), // This is the offset position from the stem
          r: random(HALF_PI) - QUARTER_PI // Then we add a random starting rotation
        })

        count++;
      }
    }
  }

  draw() {
    for (var i = 0; i < this.branches.length - 1; i++) {
      let pos = this.branches[i];
      let posp = this.branches[i + 1];
      stroke("#008705"); //122, 112, 85);
      strokeWeight(pos.dp * 2);
      line(pos.x, pos.y, posp.x, posp.y);
    }


    for (var i = 0; i < this.leavesAttr.length; i++) {
      var n = noise((i / this.leavesNum) * 4 + xoff);
      let l = this.leavesAttr[i];
      push();
      translate(l.x, l.y); // -
      rotate(l.align);
      translate(0, l.offset);
      scale(l.s);
      rotate(l.r + n);
      drawLeaf(0, 0);
      pop();
    }
    xoff += 0.01;

    if (this.leavesRemove.length > 0) {
      var outOfSreen = [];
      try {
        for (var i = 0; i < this.leavesRemove.length; i++) {

          if (this.leavesAttr[this.leavesRemove[i]].y < -height * 0.5) outOfSreen.push(i);
          this.leavesAttr[this.leavesRemove[i]].y -= 2;
        }
      } catch (err) {
        console.log(err);
        console.log(this.leavesRemovem, outOfSreen)
      }

      outOfSreen.map(i => {
        //console.log("Before splice:", this.leavesRemove);
        this.leavesAttr.splice(this.leavesRemove[i], 1);
        for (var e = 0; e < this.leavesRemove.length; e++) {
          if (this.leavesRemove[e] > this.leavesRemove[i]) this.leavesRemove[e]--;
        }
        this.leavesRemove.splice(i, 1);
        //console.log("Splicing:", outOfSreen, this.leavesAttr, this.leavesRemove);
      });
    }
  }

  removeLeaves(num) {
    if (num + this.leavesRemove.length <= this.leavesAttr.length) {
      var newRem = this.leavesRemove.length + num;
      while (this.leavesRemove.length < newRem) {
        var r = Math.floor(random(0, this.leavesAttr.length));
        if (!this.leavesRemove.includes(r)) this.leavesRemove.push(r);
      }
    } else console.log("You're trying to remove more leaves than there are left!")
    //console.log(this.leavesRemove, num, this.leavesAttr.length);
  }


  forward(distance, depth) {
    this.leaves.push({
      x: tf.x,
      y: tf.y,
      dp: depth,
      d: (distance),
      r: tf.a
    });

    this.branches.push({
      x: tf.x,
      y: tf.y,
      dp: depth,
      d: distance
    });
    tf.translate(0, -distance);
  };

  back(distance) {
    this.forward(-distance);
  };

  right(angle) {
    tf.rotate((angle * PI / 180));
  };

  left(angle) {
    this.right(-angle);
  };

  computeTree(depth, length) {
    if (depth === 0) {
      return;
    }
    var totalAngle = this.angleBetweenBranches * (this.branchingFactor - 1);

    strokeWeight(depth);
    this.forward(length, depth);
    this.right(totalAngle / 2.0);
    for (var i = 0; i < this.branchingFactor; i += 1) {
      this.computeTree(depth - 1, length * this.scaleFactor);
      this.left(this.angleBetweenBranches);
    }
    this.right(totalAngle / 2.0 + this.angleBetweenBranches);
    this.back(length);
  };
}