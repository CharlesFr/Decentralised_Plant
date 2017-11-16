var fs = require('fs');
var csv = require('fast-csv');


module.exports = {
  writeDataToCSV: function(data, filename) {
    console.log("Writing to CSV " + filename);
    var ws = fs.createWriteStream(filename);
    csv.write(data, {
        headers: true
      })
      .pipe(ws);
  }

}
