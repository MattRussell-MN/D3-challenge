
var svgWidth = window.innerWidth;
var svgHeight = window.innerHeight;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "age";
var chosenYAxis = "obesity";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.
    ])
    .range([0, width]);
  return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
      d3.max(data, d => d[chosenYAxis]) * 1.2])
    .range([height, 0]);

  return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr('cx', d => newXScale(d[chosenXAxis]))
    .attr('cy', d => newYScale(d[chosenYAxis]));
    
  return circlesGroup;
}


// function used for updating circles group with a transition to new circles

function renderStates(textsGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  textsGroup.transition()
    .duration(1000)
    .attr('x', d => newXScale(d[chosenXAxis]))
    .attr('y', d => newYScale(d[chosenYAxis]));
  
  return textsGroup;
}
  
// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, textsGroup) {

  if (chosenXAxis === "poverty") {
    var xlabel = "Poverty:";
  }
  else if (chosenXAxis === "age") {
    var xlabel = "Age:"
  }
  else {
    var xlabel = "Income";
  }

  if (chosenYAxis === "obesity") {
    var ylabel = "Obesity:";
  }
  else if (chosenYAxis === "smokes") {
    var ylabel = "Smokes:"
  }
  else {
    var ylabel = "Healthcare";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
    });

  textsGroup.call(toolTip);

  textsGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return textsGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("../assets/data/data.csv").then(function(data, err) {
  if (err) throw err;

  // parse data
  data.forEach(function(data) {
    data.age = +data.age;
    data.smokes = +data.smokes;
    data.income = +data.income;
    data.obesity = +data.obesity;
    data.healthcare = +data.healthcare;
    data.poverty = +data.poverty;
  });

  // xLinearScale and yLinearScale function above csv import
  var xLinearScale = xScale(data, chosenXAxis);

  var yLinearScale = yScale(data, chosenYAxis);

  // // Create y scale function
  // var yLinearScale = d3.scaleLinear()
  //   .domain([0, d3.max(data, d => d.num_hits)])
  //   .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .attr("fill", "blue")
    .attr("opacity", ".5");

  var textsGroup = chartGroup.selectAll("null")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "stateText")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .text(d =>d.abbr); 

  // Create group for x-axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`)
    .attr("class", "aText");

    var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "poverty") // value to grab for event listener
    .classed("atext", true)
    .classed("inactive", true)
    .text("In Poverty (%)");

  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "age") // value to grab for event listener
    .classed("atext", true)
    .classed("active", true)
    .text("Average Age (Median)");

  var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "income") // value to grab for event listener
    .classed("atext", true)
    .classed("inactive", true)
    .text("Average Income (Median)");

  // append y axis
  var ylabelsGroup = chartGroup.append("g")
    .attr('transform', `translate(${0 - margin.left/4}, ${(height/2)})`);


  // Create group for y-axis labels
  var obesityLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - 20)
    .attr("x", 0)
    .attr("dy", "1em")
    .attr("value", "obesity") // value to grab for event listener
    .classed("active", true)
    .classed("atext", true)
    .text("Obese (%)");

  var smokesLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - 50)
    .attr("x", 0)
    .attr("dy", "1em")
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .classed("atext", true)
    .text("Smoking (%)");

  var healthcareLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - 80)
    .attr("x", 0)
    .attr("dy", "1em")
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .classed("atext", true)
    .text("Lacks Healthcare (%)");


  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;
        xLinearScale = xScale(data, chosenXAxis);
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates states with new info
        textsGroup = renderStates(textsGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

// changes classes to change bold text
      if (chosenXAxis === "poverty") {
        povertyLabel
          .classed("active", true)
          .classed("inactive", false);
        ageLabel
          .classed("active", false)
          .classed("inactive", true);
        incomeLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else if (chosenXAxis === "age") {
        povertyLabel
          .classed("active", false)
          .classed("inactive", true);
        ageLabel
          .classed("active", true)
          .classed("inactive", false);
        incomeLabel
          .classed("active", false)
          .classed("inactive", true);
      }                        
      else {
        povertyLabel
          .classed("active", false)
          .classed("inactive", true);
        ageLabel
          .classed("active", false)
          .classed("inactive", true);
        incomeLabel
          .classed("active", true)
          .classed("inactive", false);            
      }
    }
  });

  ylabelsGroup.selectAll("text")
  .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {

      // replaces chosenYAxis with value
      chosenYAxis = value;
      yLinearScale = yScale(data, chosenYAxis);
      yAxis = renderYAxes(yLinearScale, yAxis);

      // updates circles with new x values
      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

      // updates tooltips with new info
      textsGroup = renderStates(textsGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

// changes classes to change bold text
    if (chosenYAxis === "obesity") {
      obesityLabel
        .classed("active", true)
        .classed("inactive", false);
      smokesLabel
        .classed("active", false)
        .classed("inactive", true);
      healthcareLabel
        .classed("active", false)
        .classed("inactive", true);
    }
    else if (chosenYAxis === "smokes") {
      obesityLabel
        .classed("active", false)
        .classed("inactive", true);
      smokesLabel
        .classed("active", true)
        .classed("inactive", false);
      healthcareLabel
        .classed("active", false)
        .classed("inactive", true);
    }                        
    else {
      obesityLabel
        .classed("active", false)
        .classed("inactive", true);
      smokesLabel
        .classed("active", false)
        .classed("inactive", true);
      healthcareLabel
        .classed("active", true)
        .classed("inactive", false);            
    }
          
      }
});


}).catch(function(error) {
  console.log(error);
});