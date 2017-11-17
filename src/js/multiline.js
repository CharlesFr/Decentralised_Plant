function Chart(data, divId, title) {

<<<<<<< HEAD
    ///////////////////////////////////////////////////
    //////////// Initialize variables /////////////////
    ///////////////////////////////////////////////////

    d3.selection.prototype.moveToFront = function() {  
      return this.each(function(){
        this.parentNode.appendChild(this);
      });
    };

    var clientWidth = document.getElementById(divId).clientWidth;
    var clientHeight = document.getElementById(divId).clientHeight;

    // Set the dimensions of the canvas / graph
    var margin = { top: 100, right: 80, bottom: 50, left: 80 },
        width = clientWidth - margin.left - margin.right,
        height = clientHeight - margin.top - margin.bottom;

    // Parse the date / time
    var parseDate = d3.time.format("%H:%M:%S %d/%m/%Y").parse, //%H:%M:%S %d/%m/%Y "%d-%b-%y"
        formatDate = d3.time.format("%H:%M:%S"), //        formatDateCursor = d3.time.format("%a %b %e %H:%M:%S"),
        bisectDate = d3.bisector(function(d) { return d.date; }).left;

    ///////////////////////////////////////////////////
    /////////////// Set the scales ////////////////////
    ///////////////////////////////////////////////////

    // Set the ranges
    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);

    // Define the axes
    var xAxis = d3.svg.axis().scale(x)
        .orient("bottom").ticks(10).outerTickSize(10);

    // Define the line
    var valueline = d3.svg.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.close); });

    //Initiate the area line function
    var areaFunction = d3.svg.area()
        .interpolate("monotone")
        .x(function(d) { return x(d.date); })
        .y0(height)
        .y1(function(d) { return y(d.close); });

    ///////////////////////////////////////////////////
    ///////////// Initialize the SVG //////////////////
    ///////////////////////////////////////////////////

    // Adds the svg canvas
    var svg = d3.select("#" + divId)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    svg.append("text")
        .attr("class", "title")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text(title);

    var lineSvg = svg.append("g"); 



    ///////////////////////////////////////////////////
    ///////////// Create the Gradient /////////////////
    ///////////////////////////////////////////////////


    var areaGradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "areaGradient")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "0%").attr("y2", "100%");

    //Append the first stop - the color at the top                  
    areaGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "white")
        .attr("stop-opacity", 0.6);

    //Append the second stop - white transparant almost at the end      
    areaGradient.append("stop")
        .attr("offset", "80%")
        .attr("stop-color", "#282828")
        .attr("stop-opacity", 0);

    var focus = svg.append("g")
        .style("display", "none");


    ///////////////////////////////////////////////////
    ////////////// Create the Graph ///////////////////
    ///////////////////////////////////////////////////

    // Get the data
    d3.csv(data, function(error, data) {
        data.forEach(function(d) {
            d.date = parseDate(d.date);
            d.close = +d.close;
        });

        // Scale the range of the data
        x.domain(d3.extent(data, function(d) { return d.date; }));
        y.domain([0, d3.max(data, function(d) { return d.close; })]);

        // Add the X Axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis.tickFormat(d3.time.format("%b %e")));

        //Draw the underlying area chart filled with the gradient
        lineSvg.append("path")
            .attr("class", "area")
            .style("fill", "url(#areaGradient)")
            .attr("d", areaFunction(data));

        // Add the valueline path.
        lineSvg.append("path")
            .attr("class", "line")
            .attr("d", valueline(data));

        // Add the dots on each reading
        svg.selectAll("dot")
            .data(data)
            .enter().append("circle")
            .attr("r", 3)
            .attr("cx", function(d) { return x(d.date); })
            .attr("cy", function(d) { return y(d.close); })
            .attr("class", "title");

        // append the rectangle to capture mouse
        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mouseover", function() { focus.style("display", null); })
            .on("mouseout", function() { focus.style("display", "none"); })
            .on("mousemove", mousemove);

        // append the circle at the intersection
        focus.append("circle")
            .attr("class", "y")
            .style("fill", "none")
            .style("stroke", "red")
            .style("stroke-width", 2)
            .attr("r", 5);

        // append the x line
        focus.append("line")
            .attr("class", "x")
            .style("stroke", "white")
            .style("stroke-dasharray", "3,3")
            .style("opacity", 0.5)
            .attr("y1", 0)
            .attr("y2", height);

        // place the value at the intersection
        focus.append("text")
            .attr("class", "y1")
            .attr("dx", width-100)
            .attr("dy", -30)
            .style("fill", "white");

        // place the date at the intersection
        focus.append("text")
            .attr("class", "y2")
            .attr("dx", width-100)
            .attr("dy", -15)
            .style("fill", "white");

        // Function for interactivity
        function mousemove() {
            var x0 = x.invert(d3.mouse(this)[0]),
                i = bisectDate(data, x0, 1),
                d0 = data[i - 1],
                d1 = data[i],
                d = x0 - d0.date > d1.date - x0 ? d1 : d0;

            focus.select("circle.y")
                .attr("transform",
                    "translate(" + x(d.date) + "," +
                    y(d.close) + ")");

            focus.select("text.y1")
                .text("Price: " + d.close);

            focus.select("text.y2")
                .text("Date: " + formatDate(d.date));

            focus.select(".x")
                .attr("transform",
                    "translate(" + x(d.date) + "," +
                    y(d.close) + ")")
                .attr("y2", height - y(d.close));
        }

    });

    this.setLabelY = function(title) {
        svg.append("text")
            .attr("text-anchor", "middle") // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate(" + (-margin.left * 0.6) + "," + (height / 2) + ")rotate(-90)") // text is drawn off the screen top left, move down and out and rotate
            .text(title)
            .attr("class", "axis");
    }

    this.setLabelX = function(title) {
        svg.append("text")
            .attr("text-anchor", "middle") // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate(" + (width / 2) + "," + (height + (margin.bottom * 0.7)) + ")") // centre below axis
            .text("Date")
            .attr("class", "axis");
    }



}
=======
  ///////////////////////////////////////////////////
  //////////// Initialize variables /////////////////
  ///////////////////////////////////////////////////

  var clientWidth = document.getElementById(divId).clientWidth;
  var clientHeight = document.getElementById(divId).clientHeight / 1.4;

  // Set the dimensions of the canvas / graph
  var margin = {
      top: 50,
      right: 40,
      bottom: 50,
      left: 40
    },
    width = clientWidth - margin.left - margin.right,
    height = clientHeight - margin.top - margin.bottom;

  // Parse the date / time
  var parseDate = d3.time.format("%d-%b-%y").parse,
    formatDate = d3.time.format("%d-%b"),
    bisectDate = d3.bisector(function(d) {
      return d.date;
    }).left;

  ///////////////////////////////////////////////////
  /////////////// Set the scales ////////////////////
  ///////////////////////////////////////////////////

  // Set the ranges
  var x = d3.time.scale().range([0, width]);
  var y = d3.scale.linear().range([height, 0]);

  // Define the axes
  var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").ticks(5);

  var yAxis = d3.svg.axis().scale(y)
    .orient("left").ticks(5).innerTickSize(-width);

  // Define the line
  var valueline = d3.svg.line()
    .x(function(d) {
      return x(d.date);
    })
    .y(function(d) {
      return y(d.close);
    });

  //Initiate the area line function
  var areaFunction = d3.svg.area()
    .interpolate("monotone")
    .x(function(d) {
      return x(d.date);
    })
    .y0(height)
    .y1(function(d) {
      return y(d.close);
    });

  ///////////////////////////////////////////////////
  ///////////// Initialize the SVG //////////////////
  ///////////////////////////////////////////////////

  // Adds the svg canvas
  var svg = d3.select("#" + divId)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  ///////////////////////////////////////////////////
  ///////////// Create the Gradient /////////////////
  ///////////////////////////////////////////////////

  var areaGradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", "areaGradient")
    .attr("x1", "0%").attr("y1", "0%")
    .attr("x2", "0%").attr("y2", "100%");

  //Append the first stop - the color at the top
  areaGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "white")
    .attr("stop-opacity", 0.8);

  //Append the second stop - white transparant almost at the end
  areaGradient.append("stop")
    .attr("offset", "80%")
    .attr("stop-color", "#282828")
    .attr("stop-opacity", 0);

  svg.append("text")
    .attr("class", "title")
    .attr("x", (width / 2))
    .attr("y", 0 - (margin.top / 2))
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text(title);

  var focus = svg.append("g")
    .style("display", "none");

  ///////////////////////////////////////////////////
  ////////////// Create the Graph ///////////////////
  ///////////////////////////////////////////////////


  var inter = setInterval(function() {
    updateData(data);
  }, 500);

  function updateData(data) {
    // Get the data again
    d3.csv(data, function(error, data) {
      data.forEach(function(d) {
        d.date = parseDate(d.date);
        d.close = +d.close;
      });

      // Scale the range of the data again
      x.domain(d3.extent(data, function(d) {
        return d.date;
      }));
      y.domain([0, d3.max(data, function(d) {
        return d.close;
      })]);

      // Select the section we want to apply our changes to
      var svg = d3.select("body").transition();

      // Make the changes
      svg.select(".line") // change the line
        .duration(750)
        .attr("d", valueline(data));
      svg.select(".x.axis") // change the x axis
        .duration(750)
        .call(xAxis);
      svg.select(".y.axis") // change the y axis
        .duration(750)
        .call(yAxis);

    });

  }


  // Get the data
  d3.csv(data, function(error, data) {
    data.forEach(function(d) {
      d.date = parseDate(d.date);
      d.close = +d.close;
    });

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) {
      return d.date;
    }));
    y.domain([0, d3.max(data, function(d) {
      return d.close;
    })]);



    // // Add the Y Axis
    // svg.append("g")
    //     .attr("class", "y axis")
    //     .call(yAxis)
    //     .selectAll("text").attr("x", -10);

    // Add the X Axis
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    //Draw the underlying area chart filled with the gradient
    svg.append("path")
      .attr("class", "area")
      .style("fill", "url(#areaGradient)")
      .attr("d", areaFunction(data));

    // Add the valueline path.
    svg.append("path")
      .attr("class", "line")
      .attr("d", valueline(data));


    // Add the dots on each reading
    svg.selectAll("dot")
      .data(data)
      .enter().append("circle")
      .attr("r", 3)
      .attr("cx", function(d) {
        return x(d.date);
      })
      .attr("cy", function(d) {
        return y(d.close);
      })
      .attr("class", "title");

    // append the x line
    focus.append("line")
      .attr("class", "x")
      .style("stroke", "white")
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.5)
      .attr("y1", 0)
      .attr("y2", height);

    // append the y line
    focus.append("line")
      .attr("class", "y")
      .style("stroke", "white")
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.5)
      .attr("x1", width)
      .attr("x2", width);

    // append the circle at the intersection
    focus.append("circle")
      .attr("class", "y")
      .style("fill", "none")
      .style("stroke", "red")
      .style("stroke-width", 2)
      .attr("r", 5);

    // place the value at the intersection
    focus.append("text")
      .attr("class", "y2")
      .attr("dx", 8)
      .attr("dy", "-.3em")
      .style("fill", "white");

    // place the date at the intersection
    focus.append("text")
      .attr("class", "y4")
      .attr("dx", 8)
      .attr("dy", "1em")
      .style("fill", "white");

    // append the rectangle to capture mouse
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseover", function() {
        focus.style("display", null);
      })
      .on("mouseout", function() {
        focus.style("display", "none");
      })
      .on("mousemove", mousemove);

    // Function for interactivity
    function mousemove() {
      var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectDate(data, x0, 1),
        d0 = data[i - 1],
        d1 = data[i],
        d = x0 - d0.date > d1.date - x0 ? d1 : d0;

      focus.select("circle.y")
        .attr("transform",
          "translate(" + x(d.date) + "," +
          y(d.close) + ")");

      focus.select("text.y1")
        .attr("transform",
          "translate(" + x(d.date) + "," +
          y(d.close) + ")")
        .text(d.close);

      focus.select("text.y2")
        .attr("transform",
          "translate(" + x(d.date) + "," +
          y(d.close) + ")")
        .text(d.close);

      focus.select("text.y3")
        .attr("transform",
          "translate(" + x(d.date) + "," +
          y(d.close) + ")")
        .text(formatDate(d.date));

      focus.select("text.y4")
        .attr("transform",
          "translate(" + x(d.date) + "," +
          y(d.close) + ")")
        .text(formatDate(d.date));

      focus.select(".x")
        .attr("transform",
          "translate(" + x(d.date) + "," +
          y(d.close) + ")")
        .attr("y2", height - y(d.close));

      focus.select(".y")
        .attr("transform",
          "translate(" + width * -1 + "," +
          y(d.close) + ")")
        .attr("x2", width + width);
    }

  });

  // this.setLabelY = function(title){
  //     svg.append("text")
  //         .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
  //         .attr("transform", "translate("+ (-margin.left*0.6) +","+(height/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
  //         .text(title)
  //         .attr("class", "axis");
  // }
  //
  // this.setLabelX = function(title){
  //     svg.append("text")
  //         .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
  //         .attr("transform", "translate("+ (width/2) +","+(height+(margin.bottom*0.7))+")")  // centre below axis
  //         .text("Date")
  //         .attr("class", "axis");
  // }

}
>>>>>>> develop
