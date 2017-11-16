var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

  // Create a new generic sensor instance for
  // a sensor connected to an analog (ADC) pin
  var sensor = new five.Sensor("A0");

  // When the sensor value changes, log the value
  sensor.on("change", function(value) {
    console.log(value);
  });
});
