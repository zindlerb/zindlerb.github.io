(function(){
  //To DO:
//Add Title
//Add Transitions
//Add bolding on touch
//DONE!


var svgW = 850,
    svgH = 350,
    paddingX = 200,
    paddingY = 100,
    radius = 55;



//Start Bar Chart Vars


var formatPercent = d3.format(".0%");
var x = d3.scale.ordinal()
    .rangeRoundBands([0, 300], .3, .4);
var y = d3.scale.linear()
    .range([radius*2, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(formatPercent);





//End Bar Chart Vars

var color = d3.scale.category10();

var arc = d3.svg.arc()
            .outerRadius(radius)
            .innerRadius(radius - 20);

var pie = d3.layout.pie()
            .sort(null)
            .value(function(d) { return d.students; });

var svg = d3.select("#pie").append("svg")
                           .attr("width", svgW)
                           .attr("height", svgH)

var chart = svg.append("g")
               .attr("transform", "translate(" + paddingX + "," + paddingY + ")");

d3.csv("opendata/luGrads2012.csv", function(error, dataCSV) {
  var allData = [];
  var majors = _.uniq(_.pluck(dataCSV, "major"));

  var fullData = _.reduce(majors, function(mem, str) {
                                   var filtered = _.filter(dataCSV, function(obj){
                                          return str == obj.major;
                                   });
                                   mem[str] = filtered;
                                   return mem;
                        }, {});



  //fix the all chart




  fullData.all = dataCSV;


  fullData = _.reduce(fullData, function(mem , student, key) {
                 mem[key] = percentage(counting(student, key));
                 return mem;
          }, {});



 function updateBar(data){

      d3.selectAll("g.barHolder").remove()

      x.domain(data.sort(function(a,b){ return b.percent - a.percent; }).map(function(d) { return d.major; }));
      y.domain([0, d3.max(data, function(d) { return (d.percent/100); })]);

      var height = radius * 2;
      var barChart = chart.append("g").attr("class", "barHolder");
      barChart.append("g")
           .attr("class", "x axis")
           .attr("transform", "translate(0," + height +")")
           .call(xAxis);

      barChart.append("g")
           .attr("class", "y axis")
           .call(yAxis)
           .append("text")
           .attr("transform", "rotate(-90)")
           .attr("y", 6)
           .attr("dy", ".71em")
           .style("text-anchor", "end")
           .text("Frequency");

      barChart.selectAll(".bar")
           .data(data)
           .enter().append("rect")
           .attr("class", "bar")
           .attr("x", function(d) { return x(d.major); })
           .attr("width", x.rangeBand())
           .attr("y", function(d) { return y(d.percent/100); })
           .attr("height", function(d) { return height - y(d.percent/100);})
           .attr("class", function(d) { return d.class })
           .style("fill", function(d) { return color(d.status)});

      barChart.attr("transform", function(d) {return "translate("+ 360 +"," + 90 + ")"});


      return barChart;
 }


 updateBar(transformBar(fullData, "none"));


 function fullUpdate(piesData){
      var countX = 0;
      var countY = 0;
      svg.selectAll("text.title").remove();

      //This might break if I change the data.
      var pairedData = _.pairs(piesData);
      var last = _.last(pairedData);
      pairedData.pop();
      pairedData.push(pairedData[0]);
      pairedData[0] = last;


        _.each(pairedData, function(arr, ind) {
            var spacingTop = 2.6;
            var spacingSides = 2.4;
            var key = arr[0];
            var g = pieUpdate(arr[1], key);


            if(countX%4 == 0 && countX > 0 ){
              countY = countY + 1;
              countX = 0;
            }

            chart.append("text").attr("class", "title")
                              .attr("x", 0)
                              .attr("y", 0 )
                              .style("text-anchor", "middle")
                              .attr("font-size", "12px")
                              .text(capitaliseFirstLetter(key))
                              .attr("transform", function(d) { return "translate(" + (spacingSides * radius * countX) + "," + (spacingTop * countY * radius + 2) + ")"; });

            g.attr("transform", function(d, i) { return "translate(" + ( spacingSides * radius * countX) + "," + (spacingTop * countY * radius) + ")"; });

            countX = countX + 1;
       });

     function pieUpdate(pieData, key) {
            chart.selectAll(".arc" + key).remove();

            var g = chart.selectAll(".arc" + key)
                         .data(pie(pieData))
                         .enter().append("g")
                         .attr("class", "arc" + key);

            g.append("path")
             .attr("d", arc)
             .attr("id", function(d) { return d.data.status })
             .attr("class", function(d) { return d.data.class})
             .style("fill", function(d) { return color(d.data.status); });

            g.append("text")
             .attr("transform", function(d) {
                  var c = arc.centroid(d),
                      x = c[0],
                      y = c[1],
                      labelr = radius + 8,
                      // pythagorean theorem for hypotenuse

                      h = Math.sqrt(x*x + y*y);
                  return "translate(" + (x/h * labelr) +  ',' + (y/h * labelr) +  ")";
             })
             .attr("dy", ".35em")
             .attr("text-anchor", "middle")
             .text(function(d) { return d.data.percent; });

            g.on("mouseenter", function(statusObj){
              var dat = allButt(piesData, statusObj.data, "light");
              //possible method for bolding?

              //highlight selected. I need to know what major has been moused over


              updateBar(transformBar(fullData, statusObj.data.status, statusObj.data.major));
              fullUpdate(dat);
            });

            g.on("mouseleave", function(maj){
              piesData = allButt(fullData, maj.data ,"full");
              updateBar(transformBar(fullData, "none"));
              fullUpdate(piesData);
            });

            return g;
     }
 }


 fullUpdate(fullData);




          //abstract legend with pie update put mouse stuff in there too.

 function updateLegend(data) {
      svg.selectAll("g.legend").remove();
      var legend = svg.selectAll(".legend")
                      .data(data)
                      .enter().append("g")
                      .attr("class", "legend")
                      .attr("transform", function(d, i) { return "translate(50," + ((i * 20) + paddingY) + ")"; });

      legend.append("rect")
            .attr("x", 20)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", function(d) {return color(d.status)});

      legend.append("text")
            .attr("x", 17)
            .attr("y", 9)
            .attr("dy", ".35em")
            .attr("class", function(d) { return d.status; })
            .style("text-anchor", "end")
            .text(function(d) { return simpleReplace(d.status,"_"," "); });

      legend.on("mouseenter", function(statusObj){
            var dat = allButt(fullData, statusObj, "light");
            updateBar(transformBar(fullData, statusObj.status));
            fullUpdate(dat);
      });

      legend.on("mouseleave", function(maj){

            fullData = allButt(fullData, maj ,"full");
            fullUpdate(fullData);
      })

      return legend;
}

updateLegend(fullData.all);



          //fixing this requires having a mouse in on the outer box, and changing the nature of the inner mouse out.
          // add this interaction for touching the actual graph
});

//Functions

function allButt(data, checker, str) {
          return _.reduce(data, function(mem ,arr, key) {
                               mem[key] = _.map(arr, function(val, ind){
                                                       if(checker.status != val.status) {
                                                          val.class = str;
                                                       }
                                                       return val;
                                                   });
                               return mem;
                             }, {});
}

function counting(data, major) {
    return _.reduce(data, function(memo ,obj){
                var notExist = true;

                if(_.isEmpty(memo)){
                  memo.push({
                    status: obj.status,
                    students: 1,
                    major: major
                  });
                  return memo;
                } else {
                    memo = _.map(memo, function(x) {
                    if(x.status == obj.status) {
                       x.students = x.students + 1;
                      notExist = false;
                      return x;
                    } else {
                      return x;
                    }
                  });
                }


                if(notExist){
                  memo.push({
                    status: obj.status,
                    students: 1,
                    major: major
                  });

                }

                return memo;
    }, []);
}

function percentage(data) {
          var total = _.reduce(data, function(memo, section) {
                    return memo + section.students;
          }, 0);

          //abstract percantages. probs combine with total

          return _.map(data, function(sect, index, list){
              sect.percent = Math.round(Math.floor((sect.students/total)*1000)/10);
              sect.class = "full";
              return sect;
          })
}

        //      sect.status = simpleReplace(sect.status, "_", " ");

function simpleReplace(str, lookup, replace) {
              var splitStr = str.split(lookup);
              var result = "";
              _.each(splitStr, function(str) {
                  if(result == "") {
                    result = result + str
                  } else {
                    result = result + replace + str;
                  }
              });

              return result;
}

function transformBar(data, status){
     var highlight = false;
     if(arguments.length > 2) {
       highlight = true;
       var majorHighlight = arguments[2];
     }

     data = _.pairs(data);
     return _.reduce(data, function(mem, arr, ind) {
         var cl;
         if(highlight){
           if(arr[0] == majorHighlight) {
            cl = "normal"
           } else {
            cl = "faint";
           }
         } else {
           cl = "normal";
         }

         var statusObj = _.find(arr[1], function(obj) { return obj.status == status});

         if(statusObj == undefined) {
           statusObj = {};
           statusObj.percent = 0;
         }



       mem.push({major: shortMajor(arr[0]), percent: statusObj.percent, status: status, class: cl});
         return mem;
       }, []);
}

function shortMajor(str){
  if(str == "psychology"){
    return "psych"
  } else if(str == "economics") {
    return "econ"
  } else {
    return str;
  }
}

function capitaliseFirstLetter(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}


})();

