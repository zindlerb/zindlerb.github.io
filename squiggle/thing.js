//To Do:
//Select mode: only drag, no draw. (color, and somethin else)
//Move to.
//Ability to select part of a path. (active path) (damn I don't think this is possible) (inside path function.)

//Close path.




//Do it in the dumbest way possible.

//Color last stop.
//Be able to add to path.


//How to store the shape data.
//They are paths so an array out steps?
//Each step has the diff of the prev step. (or maybe just the new point.)


//Each dot is mapped to an index. and the dot modifies the index with the new x, y of the dot.


//take that list of instructions
//And turn it into shape text. This will only comprise the body of the function.

function pathToStr(pathObj) {
  var funcStr = 'ctx.';
  var x = 'x + ' + pathObj.x
  var y = 'y + ' + pathObj.y

  if(pathObj.type === 'start'){
    funcStr += 'moveTo(x, y);';
  }

  if(pathObj.type === 'arc') {
    var args = [x, y, pathObj.r, pathObj.startAngle, pathObj.endAngle, pathObj.isAntiClockwise]
    funcStr += 'arc(' + args.join(', ') + ');';
  }

  if(pathObj.type === 'line') {
    funcStr += 'lineTo(' + x + ', ' + y + ');';
  }

  if(pathObj.type === 'moveTo') {
    funcStr += 'moveTo(' + x + ', ' + y + ');';
  }

  if(pathObj.type === 'quadratic') {
    var args = ['x + ' + pathObj.cp1x, 'y + ' + pathObj.cp1y, x, y];
    funcStr += 'quadraticCurveTo(' + args.join(', ') + ');';
  }

  return funcStr;
}

function genCode(pathArr){
  var code = [];
  code.push("var canvas = document.getElementById('canvas');");
  code.push("var ctx = canvas.getContext('2d');");
  code.push("function draw(x,y,ctx) {");
  code.push("  ctx.beginPath();");
  _.each(pathArr, function(path) {
    code.push("  " + pathToStr(path));
  });
  code.push("  ctx.lineWidth = 2;");
  code.push("  ctx.strokeStyle = '#003300';");
  code.push("  ctx.stroke();");
  code.push("  ctx.closePath();");
  code.push("}");
  if(pathArr.length > 0) {
    code.push("draw(" + pathArr[0].x + ", " + pathArr[0].y + ", ctx);");
  }

  return code.join('\n');
}


var myCodeMirror = CodeMirror($('#code')[0], {
  value: genCode([]),
  mode:  "javascript",
  lineNumbers: true,
  readOnly: true
});

//Interaction mode specifies the way that the user draws things.
//Shoule be able to do move to.

var uiData = {mouseX: 0, mouseY: 0, mouseDown: false, action: false, interactionMode: 'select'};


/*
  Where do I check for a new shape being created?
  How do I check the new line part added?

  What mode am I in?
  Am I the last node?

  Are there any nodes?
*/



var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

function pointInsideCircle(cx, cy, r, x, y) {
  return (cx - r < x) && (cx + r > x) && (cy + r > y) && (cy - r < y);
}

function renderPath(pathPoint, ctx, origin) {
  var x = origin.x + pathPoint.x;
  var y = origin.y + pathPoint.y;

  if(pathPoint.type === 'start') {
    ctx.moveTo(pathPoint.x, pathPoint.y);
  }

  if(pathPoint.type === 'arc') {
    ctx.arc(x, y, pathPoint.r, pathPoint.startAngle, pathPoint.endAngle, pathPoint.isAntiClockwise);
  }

  if(pathPoint.type === 'line') {
    ctx.lineTo(x, y);
  }

  if(pathPoint.type === 'quadratic') {
    ctx.quadraticCurveTo(origin.x + pathPoint.cp1x, origin.y + pathPoint.cp1y, x, y);
  }

  if(pathPoint.type === 'moveTo') {
    ctx.moveTo(x,y);
  }

}

function renderDot(x,y,type, r, ctx, id, length) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI, false);

  if(uiData.interactionMode === 'select') {
    ctx.fillStyle = 'gray';
  } else {
    if(type === 'start'){
      ctx.fillStyle = 'pink';
    } else if(id === (length - 1)){
      ctx.fillStyle = 'yellow';
    } else {
      ctx.fillStyle = 'green';
    }
  }

  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#003300';
  ctx.stroke();
}

function dotWithDrag(pathPoint, id, r, ctx, dragFunc, origin, allDots) {
 if(id > 0) {
  var pX = origin.x + pathPoint.x;
  var pY = origin.y + pathPoint.y;
 } else {
  var pX = pathPoint.x;
  var pY = pathPoint.y;
 }

 renderDot(pX, pY, pathPoint.type , r, ctx, id, allDots.length);

 if(pathPoint.type === 'quadratic') {
   renderDot(origin.x + pathPoint.cp1x, origin.y + pathPoint.cp1y, pathPoint.type, r, ctx, id, allDots.length);
 }


 if(uiData.action === false && uiData.mouseDown) {
   if(pointInsideCircle(pX, pY, r, uiData.mouseX, uiData.mouseY)){
     if( (id === (allDots.length - 1)) && uiData.interactionMode !== 'select') {
       shape.newDot(uiData.interactionMode, {x: uiData.mouseX, y: uiData.mouseY});
       uiData.action = {type: 'draw', lineType: uiData.interactionMode};
     } else {
       uiData.action = {type: 'drag', id: id, dragStartX: uiData.mouseX, dragStartY: uiData.mouseY};
     }
   }

   if(pathPoint.type === 'quadratic') {
     if(pointInsideCircle(origin.x + pathPoint.cp1x, origin.y + pathPoint.cp1y, r, uiData.mouseX, uiData.mouseY)){
       uiData.action = {type: 'drag', id: id, dotType: 'controlPoint'};
     }
   }
 }

 if(uiData) {
  if(uiData.action.id === id) {
   dragFunc(uiData.mouseX, uiData.mouseY, uiData.action.dotType);
   myCodeMirror.setValue(genCode(allDots));
  }
 }
}

//Two passes draw path, and draw dots
//Refactor this to data and functions transacting on the data. Having an object hiding the state is not helpful
function Dots(x,y,ctx){
  var that = this;
  //mouse move.
  //mouse down, mouse up.
  this.r = 5;
  var origin = {type: 'start', x: x, y: y};
  this.dots = [origin];
  //Test evals with global, can it be bound with this to get the local ctx?
  this.render = function() {
    ctx.clearRect(0, 0, 500, 500);
    ctx.beginPath();
    that.dots.forEach(function(pathPoint, id) {
      renderPath(pathPoint, ctx, origin);
    });

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#003300';
    ctx.stroke();
    ctx.closePath();

    if(uiData.interactionMode !== 'display'){
    that.dots.forEach(function(pathPoint, id) {
      var dragFunc;

      if(['line', 'quadratic', 'arc', 'moveTo'].indexOf(pathPoint.type) > -1) {
        dragFunc = function(x, y) {
          pathPoint.x = x - origin.x;
          pathPoint.y = y - origin.y;
        }
      }

      if(pathPoint.type === 'quadratic') {
        dragFunc = function(x, y, dotType) {
          if(dotType === 'controlPoint'){
            pathPoint.cp1x = x - origin.x;
            pathPoint.cp1y = y - origin.y;
          } else {
            pathPoint.x = x - origin.x;
            pathPoint.y = y - origin.y;
          }
        }
      }

      if(pathPoint.type === 'start') {
        dragFunc = function(x, y) {
          if(uiData.interactionMode === 'select'){
            if(pathPoint.x !== x && pathPoint.y !== y) {
              _.each(that.dots, function(dot, ind){
                if(ind > 0) {
                  dot.x = dot.x + (pathPoint.x - x);
                  dot.y = dot.y + (pathPoint.y - y);
                }
              })
              pathPoint.x = x;
              pathPoint.y = y;
            }
          } else {
            pathPoint.x = x;
            pathPoint.y = y;
          }



        }
      }
      dotWithDrag(pathPoint, id, that.r, ctx, dragFunc, origin, that.dots);
    })
    }
  }

  setInterval(this.render.bind(this), 1000/60);

}

//Make defaults for these.
Dots.prototype.newDot = function(type, data) {
  var dotObj = {type: type};
  var that = this;

  data.x -= this.dots[0].x;
  data.y -= this.dots[0].y;
  var defaults = {
    line: {},
    moveTo: {},
    arc: {
      r: 20,
      startAngle: 0,
      endAngle: Math.PI*2,
      isAntiClockwise: false
    },
    quadratic: {
      cp1x: data.x - 5,
      cp1y: data.y - 5
    }
  }

  _.extend(dotObj, data);
  _.defaults(dotObj, defaults[type]);
  this.dots.push(dotObj);
}

var shape;

/*
----------------- GLOBAL EVENTS ------------------------
*/

$('#canvas').mousedown(function(e) {
  uiData.mouseDown = true;
  if(shape === undefined && ['select', 'display'].indexOf(uiData.interactionMode) === -1) {
    shape = new Dots(uiData.mouseX, uiData.mouseY, ctx);
    //Beginning Drag
    shape.newDot(uiData.interactionMode, {x: uiData.mouseX, y: uiData.mouseY});
    uiData.action = {type: 'draw', lineType: uiData.interactionMode};
  }
});

$('#canvas').mouseup(function(e) {
  uiData.mouseDown = false;
  uiData.action = false;
});

$('#canvas').mousemove(function(e) {
  uiData.mouseX = e.offsetX;
  uiData.mouseY = e.offsetY;
  if(uiData.action.type === 'draw') {
    var pathLength = shape.dots.length;
    shape.dots[pathLength - 1].x = uiData.mouseX - shape.dots[0].x;
    shape.dots[pathLength - 1].y = uiData.mouseY - shape.dots[0].y;

    if(shape.dots[pathLength - 1].type === 'quadratic') {

      var realX = shape.dots[0].x + shape.dots[pathLength - 1].x;
      var realY = shape.dots[0].y + shape.dots[pathLength - 1].y;

      if(pathLength - 2 === 0) {
        var realPastX = shape.dots[0].x;
        var realPastY = shape.dots[0].y;
      } else {
        var realPastX = shape.dots[0].x + shape.dots[pathLength - 2].x;
        var realPastY = shape.dots[0].y + shape.dots[pathLength - 2].y;
      }

      var realMiddlePointX = realPastX + ((realX - realPastX) / 2);
      var realMiddlePointY = realPastY + ((realY - realPastY) / 2);

      shape.dots[pathLength - 1].cp1x = realMiddlePointX - shape.dots[0].x;
      shape.dots[pathLength - 1].cp1y = realMiddlePointY - shape.dots[0].y;
    }

    myCodeMirror.setValue(genCode(shape.dots));
  }
});

$('body').keypress(function(e) {
  e.preventDefault();
  e.stopPropagation();
  if(e.charCode === 26 && e.ctrlKey === true) {
    //This leaves the event loop running when a new shape is made. This is very bad. This will be taken out in big refactor.
    if(shape.dots.length > 1) {
       shape.dots.pop();
       myCodeMirror.setValue(genCode(shape.dots));
    } else {
      shape.dots.pop();
      shape = undefined;
      myCodeMirror.setValue([]);
      ctx.clearRect(0,0,500,500);
    }
  }
  console.log(e);
});


var lineTypes = ['select', 'line', 'arc', 'quadratic', 'moveTo', 'display'];


//Is a draw in progress.
//Is a drag in progress

_.each(lineTypes, function(lineName, ind) {
  (function(){
    var lName = lineName;
    $('#' + lineName).click(function(){
      console.log('Clicked: ', lName);
      $('#' + lName).toggleClass('pure-menu-selected');
      $('#' + uiData.interactionMode).toggleClass('pure-menu-selected');
      uiData.interactionMode = lName;
    })
  })();
});

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
function draw(x,y,ctx) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + -53, y + 18, x + -12, y + 38);
  ctx.quadraticCurveTo(x + 27, y + 56, x + -17, y + 76);
  ctx.moveTo(x + 52, y + 50);
  ctx.quadraticCurveTo(x + 4, y + 35, x + 58, y + 12);
  ctx.lineTo(x + 59, y + 10);
  ctx.quadraticCurveTo(x + 35, y + 154, x + 85, y + 118);
  ctx.moveTo(x + 80, y + 28);
  ctx.quadraticCurveTo(x + 95, y + 83, x + 112, y + 31);
  ctx.moveTo(x + 139, y + 58);
  ctx.lineTo(x + 139, y + 28);
  ctx.moveTo(x + 158, y + -6);
  ctx.arc(x + 139, y + -6, 20, 0, 6.283185307179586, false);
  ctx.moveTo(x + 197, y + 61);
  ctx.quadraticCurveTo(x + 154, y + 45, x + 197, y + 29);
  ctx.quadraticCurveTo(x + 205, y + 93, x + 186, y + 119);
  ctx.quadraticCurveTo(x + 173, y + 139, x + 163, y + 105);
  ctx.moveTo(x + 240, y + 60);
  ctx.quadraticCurveTo(x + 200, y + 46, x + 238, y + 27);
  ctx.quadraticCurveTo(x + 256, y + 98, x + 238, y + 121);
  ctx.quadraticCurveTo(x + 223, y + 142, x + 211, y + 114);
  ctx.moveTo(x + 277, y + 65);
  ctx.lineTo(x + 277, y + -10);
  ctx.moveTo(x + 301, y + 40);
  ctx.quadraticCurveTo(x + 317, y + 6, x + 337, y + 40);
  ctx.lineTo(x + 301, y + 40);
  ctx.quadraticCurveTo(x + 296, y + 72, x + 314, y + 71);
  ctx.quadraticCurveTo(x + 336, y + 73, x + 337, y + 58);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#003300';
  ctx.stroke();
  ctx.closePath();
}
draw(91, 165, ctx);

