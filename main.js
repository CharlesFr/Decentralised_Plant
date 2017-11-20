var csv = require('./dataParser.js');

var data = [
  ['date', 'close']
];
var dataBufferSize = 25
var count = 0;
var five = require("johnny-five");
var board = new five.Board({
  repl: false
});

board.on("ready", function() {

  // Create a new generic sensor instance for
  // a sensor connected to an analog (ADC) pin
  var sensor = new five.Sensor({
    pin: "A0",
    freq: 5000
  });
  this.samplingInterval(5000);

  // When the sensor value changes, log the value
  sensor.on("data", function(value) {
// Keep size of file to 25 entries
    if (count < dataBufferSize) {
      var moisture = (0.9 - value / 1024) * 100;
      console.log("Moisture = " + moisture + "%");
      data.push([stringifyDate(), moisture.toString()])
      csv.writeDataToCSV(data, "./src/data.csv");
      count += 1
    } else {
      data.splice(2,1);
      var moisture = (0.9 - value / 1024) * 100;
      console.log("Moisture = " + moisture + "%");
      data.push([stringifyDate(), moisture.toString()])
      csv.writeDataToCSV(data, "./src/data.csv");


    }


  });
});


function stringifyDate() {
  var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var today = new Date();
  var hh = today.getHours();
  var ms = today.getMinutes();
  var ss = today.getSeconds();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear() - 2000;


  if (dd < 10) {
    dd = '0' + dd
  }

  if (ss < 10) {
    ss = '0' + ss
  }

  if (mm < 10) {
    mm = '0' + mm
  }

  today = hh + ":" + ms + ":" + ss + " " + dd + "/" + mm + "/" + yyyy;
  return today;
}
