//Functions
function equalTriangle(start, size) {
    var p1 = start;
    var height = (Math.sqrt(3)*size)/2
    var p2 = {x: p1.x + (size/2), y: p1.y + height};
    var p3 = {x: p1.x - (size/2), y: p1.y + height};
  return {p1: p1, p2: p2,p3: p3};
}

function hexagonSVG(size, tag, cl){

  function equalTriangle(startX, startY, size, svg) {
    var str;
    var p1 = {x: startX, y: startY};
    var height = (Math.sqrt(3)*size)/2
    var p2 = {x: p1.x - height, y: p1.y - (size/2) };
    var p3 = {x: p1.x - height, y: p1.y + (size/2)};


    return svg.polygon(p1.x + "," + p1.y + " " +
                       p2.x + "," + p2.y + " " +
                       p3.x + "," + p3.y );
  }

  var draw = SVG(tag).size(size*2, size*2)
  var color = cl;
  for(var i = 0; i < 6; i++){
    equalTriangle(size, size, size, draw).fill(color)
                                         .attr('id', 'tri' + (i + 1))
                                         .attr('class', 'hex')
                                         .stroke({ color: color, width: 1 })
                                         .transform({rotation: 60 * i, cx: size, cy:size});
  }

}


function homeHex() {
  var col = "#FF8100"
  var s = 10;

  hexagonSVG(s, 'projects',col);
  hexagonSVG(s, 'essays', col);
  hexagonSVG(s, 'data',col);

}


homeHex();


