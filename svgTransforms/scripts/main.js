var types = ["translate", "scale", "rotate", "skewX", "skewY"];

var CANVAS_WIDTH = 200;
var CANVAS_HEIGHT = 200;
var DEGREE_CONVERSION = 57.2957795;

function makeTransformDatum(type) {
  var transformData = {
    translate: {x: 0, y: 0},
    scale: {x: 1, y: 1},
    rotate: {degrees: 0, x: undefined, y: undefined, rotatedPoint: {x: 30, y: 30}},
    skewX: 0,
    skewY: 0
  }

  return transformData[type];
}

function circleToPoint(circle) {
  return {x: circle.cx, y: circle.cy};
}

function makeCircleDrag(dragFunc) {
  return d3.behavior.drag()
           .origin(function(d) { return {x: d.cx, y: d.cy}; })
           .on("drag", dragFunc);
}

function transformBlock(type, renderFunc) {
  var cWidth = CANVAS_WIDTH;
  var cHeight = CANVAS_HEIGHT;
  if(type === "skewX") {
    cWidth = cWidth * 2;
  } else if(type === "skewY") {
    cHeight = cHeight * 2;
  }

  var svgContainer = d3.select("." + type + "Container")
                       .insert("svg", ":first-child")
                       .attr("width", cWidth)
                       .attr("height", cHeight)
                       .attr("class", type + "SVG");

  var bottomContainer = d3.selectAll("." + type + "SVG").append("g")
                                                        .attr("class", type + "Top");

  var topContainer = d3.selectAll("." + type + "SVG").append("g")
                                                     .attr("class", type + "Bottom");



  var examplePos = {x: 40, y: 70};
  var exampleData = [{x: examplePos.x , y: examplePos.y, width: 20, height: 25}]
  var transformDatum = makeTransformDatum(type);

  //Init Example Location
  d3.select("." + type + "CX").text(examplePos.x);
  d3.select("." + type + "CY").text(examplePos.y);
  
  function updateExample(data, type, svgContainer) {
    function dragmoveCircle(d) {

     //Get mouse position and check drag from there. Dont use shape coords.
      var mouse = d3.mouse(this);
      function dragEdge(shape, diff, axis) {
        var sizeAttr;
        var canvasAttr;

        if(axis === "x") {
          sizeAttr = "width";
          canvasAttr = CANVAS_WIDTH;
        } else if (axis === "y") {
          sizeAttr = "height";
          canvasAttr = CANVAS_HEIGHT;
        }

        if(mouse[0] < 0 || mouse[1] < 0 || mouse[0] > CANVAS_WIDTH || mouse[1] > CANVAS_HEIGHT) {
          return 0;
        }
      
        if(shape[axis] < 0) {
          if(0 < diff) {
            return diff;
          } else {
            return 0
          }
        } else if(shape[axis] + shape[sizeAttr] > canvasAttr) {
          if(0 > diff) {
            return diff;
          } else {
            return 0
          }
        } else {
          return diff;
        }
      }

      d3.select(this)
        .attr("x", d.x += d3.event.dx)
        .attr("y", d.y += d3.event.dy);
    
    
      d3.select("." + type + "CX").text(d.x);
      d3.select("." + type + "CY").text(d.y);

    }
    
    var dragExample = d3.behavior.drag()
                        .origin(function(d) { return {x: d.cx, y: d.cy}; })
                        .on("drag", dragmoveCircle);

    var exampleRect = svgContainer.selectAll("rect." + type + "example").data(data);
  
    exampleRect.enter().append("rect");

    exampleRect.attr("x", function (d) { return d.x; })
               .attr("y", function (d) { return d.y; })
               .attr("width", function (d) { return d.width; })
               .attr("height", function (d) { return d.height; })
               .attr("class", type + "example")
               .style("fill", function (d) { return "pink"; })
               .call(dragExample);
  }

  updateExample(exampleData, type, topContainer);
  renderFunc(bottomContainer, transformDatum, type, svgContainer);
}
//pass in axis render function, drag function
function renderCircle(svgContainer, circlesData, dragFunc) {
  var circlesData = svgContainer.selectAll("circle." + circlesData.type + "example")
                                .data(circlesData)

  
  var circles = circlesData.enter()
                           .append("circle");


 
  var circleAttributes = circlesData
                         .attr("cx", function (d) { return d.cx; })
                         .attr("cy", function (d) { return d.cy; })
                         .attr("r", function (d) { return d.radius; })
                         .style("fill", function (d) { return "gray"; })
                         .attr("class", function(d) { return  d.type + "example"})
                         .call(dragFunc);
}

function makeGridData(scaleValue) {

  var xRange = _.range(0, CANVAS_WIDTH, 10 * scaleValue.x);
 
  xRange = _.map(xRange, function(xPos, ind) {
    return {x1: xPos, x2: xPos, y1: 0, y2: CANVAS_HEIGHT};  
  });
 
  var yRange = _.range(0, CANVAS_HEIGHT, 10 * scaleValue.y);
 
  yRange = _.map(yRange, function(yPos) {
   return {x1: 0, x2: CANVAS_WIDTH, y1: yPos, y2: yPos};
  });

  return xRange.concat(yRange);
}

function renderGrid(svgContainer, axisOrigin, scaleValue, type, options) {

  if(options === undefined) {
    options = {};
  }

  var gridData = makeGridData(scaleValue);

  var lines = svgContainer.selectAll("line." + type + "axis")
                          .data(gridData);


  lines.enter().append("line");

  var transformString = "";

  if(options.skewType === "x") {
    transformString = " skewX(" + options.skewAngle + ")";
  }

  if(options.skewType === "y") {
    transformString = " skewY(" + options.skewAngle + ")";
  }

  if (options.rotateAmount) {
    transformString = " rotate(" + options.rotateAmount + ")";
  };

  lines.attr("x1", function (d) { return d.x1; })
       .attr("y1", function (d) { return d.y1; })
       .attr("x2", function (d) { return d.x2; })
       .attr("y2", function (d) { return d.y2; })
       .attr("stroke", "gray")
       .attr("stroke-width", 1)
       .attr("stroke-opacity", .3)
       .attr("transform", "translate(" + axisOrigin.x + "," + axisOrigin.y + ")" + transformString)
       .attr("class", type + "axis");

  lines.exit().remove();
}


/* EXAMPLES  */

function renderTranslate(bottomContainer, transformData, type, svgContainer) {
  var circleData = [
    {cx: transformData.x, cy: transformData.y, radius: 8, type: type}
  ];

  var dragTranslate = d3.behavior.drag()
                        .origin(function(d) { return {x: d.cx, y: d.cy}; })
                        .on("drag", dragMoveTranslate);

  
  d3.select("." + type + "X").text(0);
  d3.select("." + type + "Y").text(0);
  
  function dragMoveTranslate(d) {
    d3.select(this)
      .attr("cx", d.cx += d3.event.dx)
      .attr("cy", d.cy += d3.event.dy);
  
    d3.select("." + type + "X").text(d.cx);
    d3.select("." + type + "Y").text(d.cy);

    renderGrid(svgContainer, {x: d.cx, y: d.cy}, {x: 1, y: 1}, type);

    svgContainer.selectAll("rect." + type + "example").attr("transform", "translate(" + d.cx + ", " + d.cy + ")");
  }

  renderCircle(svgContainer, circleData, dragTranslate);
  
  renderGrid(bottomContainer, transformData, {x: 1, y: 1}, type);
}



transformBlock("translate", renderTranslate);

function renderScale(bottomContainer, transformData, type, svgContainer) {
  var armLength = CANVAS_WIDTH / 2;
  var scaleAmount = {x: 1, y: 1};

  var circleData = [
    {cx: armLength, cy: 3, radius: 5, sliderType: "x", type: "scale"},
    {cx: 3, cy: armLength, radius: 5, sliderType: "y", type: "scale"}
  ]

  var dragScale = d3.behavior.drag()
                    .origin(function(d) { return {x: d.cx, y: d.cy}; })
                    .on("drag", dragMoveScale);

  d3.select("." + type + "X").text(0);
  d3.select("." + type + "Y").text(0);                    
  
  function dragMoveScale(d) {
    var domNode = d3.select(this);
    var scaleX = scaleAmount.x;
    var scaleY = scaleAmount.y;
    if(d.sliderType === "x") {
      domNode.attr("cx", d.cx += d3.event.dx)
      scaleAmount.x = (d.cx / (CANVAS_WIDTH / 2));
    }
    
    if(d.sliderType === "y") {
      domNode.attr("cy", d.cy += d3.event.dy);
      scaleAmount.y = (d.cy / (CANVAS_HEIGHT / 2));      
    }

    d3.select("." + type + "X").text(Math.round10(scaleAmount.x, -1));
    d3.select("." + type + "Y").text(Math.round10(scaleAmount.y, -1));
  
    renderGrid(svgContainer, {x: 0, y: 0}, {x: scaleAmount.x, y: scaleAmount.y}, type);
    svgContainer.selectAll("rect." + type + "example").attr("transform","scale(" + scaleAmount.x + ", " + scaleAmount.y + ")");
  }  
  
  renderCircle(svgContainer, circleData, dragScale);
  renderGrid(bottomContainer, transformData, {x: 1, y: 1}, type) 
}

transformBlock("scale", renderScale);

function renderRotate(bottomContainer, transformData, type, svgContainer) {
  var rotateAngle = 0;
  var armLength = 30;
  
  var translateCircle = [{cx: 0, cy: 0, radius: 8, sliderType: "translate"}];
  var rotateCircle = [{cx: armLength, cy: armLength, radius: 5, sliderType: "rotate"}];
  
  d3.select("." + type + "X").text(0);
  d3.select("." + type + "Y").text(0);
  d3.select(".degrees").text(0);


  function rotatePoint(point, center, angle){
    //The angle will come in in radians.
    angle = angle  //* (Math.PI/180); Convert to radians
    var rotatedX = Math.cos(angle) * (point.x - center.x) - Math.sin(angle) * (point.y-center.y) + center.x;
    var rotatedY = Math.sin(angle) * (point.x - center.x) + Math.cos(angle) * (point.y - center.y) + center.y;
     
    return {x: rotatedX, y: rotatedY};
  }
  
  function angleBetweenTwoPoints(p1, p2) {
  
    function normalizeAngle(angleRad) {
      if(angleRad < 0) {
        return (Math.PI * 2) + angleRad;
      } else {
        return angleRad;
      }
    }
  
    var deltaX = p2.x - p1.x;
    var deltaY = p1.y - p2.y;
    return normalizeAngle(Math.atan( deltaY / deltaX));
  }
  
  function angleBetweenTwoAngles(origin, p1, p2) {
    return angleBetweenTwoPoints(origin, p1) - angleBetweenTwoPoints(origin, p2);
  }
  
  var rotateDrag = makeCircleDrag(function(d) {
    //Need to both update attributes on example, and rotate axis circles
    var domNode = d3.select(this);
    var diffX = d3.event.dx;
    var diffY = d3.event.dy;
    
    var angleDiff = angleBetweenTwoAngles(circleToPoint(translateCircle[0]), {x: d.cx, y: d.cy}, {x: d.cx + diffX, y: d.cy + diffY});
    
    rotateAngle += angleDiff;
    
    rotatedPoint = rotatePoint(circleToPoint(d), circleToPoint(translateCircle[0]), rotateAngle);

    d3.select(".degrees").text(Math.round10(rotateAngle, -2));    

     var rotateAngleDegrees = (rotateAngle * DEGREE_CONVERSION);
    
    renderGrid(svgContainer, {x: 0, y: 0}, {x: 1, y: 1}, type, {rotateAmount: rotateAngleDegrees});

    svgContainer.selectAll("rect." + type + "example").attr("transform","rotate(" + rotateAngleDegrees + ")");

    domNode.attr("cx", rotatedPoint.x);
    domNode.attr("cy", rotatedPoint.y);
  });

  var translateDrag = makeCircleDrag(function(d) {
    
  });

  renderCircle(svgContainer, rotateCircle, rotateDrag);
  renderGrid(bottomContainer, {x: 0, y: 0}, {x: 1, y: 1}, type);
}

transformBlock("rotate", renderRotate);


var lineFunction = d3.svg.line()
                           .x(function(d) { return d.cx; })
                           .y(function(d) { return d.cy; })
                           .interpolate("linear");

function renderSkew(svgContainer, circleData, skewDrag, skewType) {

  if(skewType === "x") {
    var lineData = circleData.concat([{cx: CANVAS_WIDTH, cy: 0}]);
  } else if(skewType === "y") {
    var lineData = circleData.concat([{cx: 0, cy: CANVAS_HEIGHT}]);
  }

  var lineGraph = svgContainer.append("path")
                              .attr("d", lineFunction(lineData))
                              .attr("stroke", "black")
                              .attr("stroke-width", 2)
                              .attr("fill", "none")
                              .attr("class", "skewX");                           

  renderCircle(svgContainer, circleData, skewDrag); 
}


function renderSkewX(bottomContainer, transformData, type, svgContainer) {
  var armLength = CANVAS_WIDTH / 2;
  var skewAmount = 0; 

  var circleData = [
    {cx: CANVAS_WIDTH, cy: CANVAS_HEIGHT - 3, radius: 5, sliderType: "x", type: "scale"},
  ];

  var skewDrag = makeCircleDrag(function(d) {
    //Need to both update attributes on example, and rotate axis circles
    var domNode = d3.select(this);
    var diffX = d3.event.dx;
    
    domNode.attr("cx", d.cx += diffX);


    skewAmount =  Math.atan((d.cx - CANVAS_WIDTH) / CANVAS_HEIGHT) * DEGREE_CONVERSION;

    d3.select(".skewXAmount").text(Math.round10(skewAmount, -2));    

    svgContainer.selectAll("path.skewX").attr("d", lineFunction([{cx: d.cx, cy: d.cy}, {cx: CANVAS_WIDTH, cy: 0}]));

    svgContainer.selectAll("rect." + type + "example").attr("transform", "translate(" + CANVAS_WIDTH + "," + 0 + ") skewX(" + skewAmount + ")");

    renderGrid(svgContainer, {x: CANVAS_WIDTH, y: 0}, {x: 1, y: 1}, type, {skewType: "x", skewAngle: skewAmount});

  });


  
  renderSkew(svgContainer, circleData, skewDrag, "x");
  renderGrid(bottomContainer, {x: CANVAS_WIDTH, y: 0}, {x: 1, y: 1}, type);

  svgContainer.selectAll("rect." + type + "example").attr("transform","translate(" + CANVAS_WIDTH + "," + 0 + ")");
}

transformBlock("skewX", renderSkewX);

function renderSkewY(bottomContainer, transformData, type, svgContainer) {
  var armLength = CANVAS_WIDTH / 2;
  var skewAmount = 0; 

  var circleData = [
    {cx: CANVAS_WIDTH, cy: CANVAS_HEIGHT, radius: 7, sliderType: "y", type: "scale"},
  ];

  var skewDrag = makeCircleDrag(function(d) {
    //Need to both update attributes on example, and rotate axis circles
    var domNode = d3.select(this);
    var diffY = d3.event.dy;
    
    domNode.attr("cy", d.cy += diffY);

    skewAmount =  Math.atan((d.cy - CANVAS_HEIGHT) / CANVAS_WIDTH) * DEGREE_CONVERSION;

    d3.select(".skewYAmount").text(Math.round10(skewAmount, -2));    

    svgContainer.selectAll("path.skewX").attr("d", lineFunction([{cx: d.cx, cy: d.cy}, {cx: 0, cy: CANVAS_HEIGHT}]));

    svgContainer.selectAll("rect." + type + "example").attr("transform", "translate(" + 0 + "," + CANVAS_HEIGHT + ") skewY(" + skewAmount + ")");

    renderGrid(svgContainer, {x: 0, y: CANVAS_HEIGHT}, {x: 1, y: 1}, type, {skewType: "y", skewAngle: skewAmount});

  });


  
  renderSkew(svgContainer, circleData, skewDrag, "y");
  renderGrid(bottomContainer, {x: 0, y: CANVAS_HEIGHT}, {x: 1, y: 1}, type);

  svgContainer.selectAll("rect." + type + "example").attr("transform","translate(" + 0 + "," + CANVAS_HEIGHT + ")");
}

transformBlock("skewY", renderSkewY);


