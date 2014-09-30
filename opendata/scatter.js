(function(){
  var margin = {top: 20, right: 100, bottom: 30, left: 60},
    width = 700 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var svg = d3.select("#scatter").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



d3.csv("opendata/luGrads2012.csv", function(d) {
  return {
    year:	+d.year,
    status:	d.status,
    major:	d.major,
    gender:	d.gender,
    gpa:	+d.gpa,
    salary: d.salary
  };
}, function(error, data) {

  data = _.filter(data, function(obj) {
    return obj.salary != "none";
  });

  data = _.map(data, function(obj){
      obj.salary = +obj.salary;
      return obj;
  });

  x.domain(d3.extent(data, function(d) { return d.gpa; })).nice();
  y.domain(d3.extent(data, function(d) { return d.salary; })).nice();

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("GPA");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Salary")

  update(data);

  function update(dat){
    svg.selectAll(".dot").remove();

    var points = svg.selectAll(".dot")
      .data(dat)

    points.enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", function(d) { return x(d.gpa); })
      .attr("cy", function(d) { return y(d.salary); })
      .style("fill", function(d) { return color(d.major); });
  }

  var legend = svg.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("class", "major")
      .attr("transform", function(d, i) { return "translate(85," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });

  legend.on("mouseenter", function(maj){
      var newData = _.filter(data, function(stu) {
        return stu.major == maj;
      });
      update(newData);
  });

  legend.on("mouseleave", function(maj){
     update(data);
  })

});



})();

