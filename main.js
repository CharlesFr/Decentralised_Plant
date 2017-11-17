var csv = require('./dataParser.js');

var data = [
  ['date','close']
];

var count = 0;
var five = require("johnny-five");
var board = new five.Board({repl: false});

board.on("ready", function() {

  // Create a new generic sensor instance for
  // a sensor connected to an analog (ADC) pin
  var sensor = new five.Sensor("A0");
  this.samplingInterval(20000);

  // When the sensor value changes, log the value
  sensor.on("change", function(value) {
    var moisture = (1 - value/1024) * 100;
    console.log("Moisture = " + moisture + "%");
    data.push([stringifyDate(), moisture.toString()])
    csv.writeDataToCSV(data, "./src/datatest.csv");


  });
});


function stringifyDate() {
  var monthNames = ['Jan', 'Feb', 'Mar', 'Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var today = new Date();
  var hh = today.getHours();
  var ms = today.getMinutes();
  var ss = today.getSeconds();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear() - 2000;
  count+=1;


  if (dd < 10) {
    dd = '0' + dd
  }

  if (mm < 10) {
    mm = '0' + mm
  }

  today = count%30 + '-' + monthNames[mm] + '-' + yyyy;
  return today;
}
