function draw(){
    var canvas = document.getElementById('rain');
    var width = 6;
    var height = 18;
    var personPos = 30;
    var personVelocity = 0;

    var keyCodes = {right: 39, left: 37};

    function Point(x,y){
        this.x = x;
        this.y = y;
    }

    function getRandomArbitrary(min, max) {
      return Math.random() * (max - min) + min;
    }

    if (canvas.getContext){
      var ctx = canvas.getContext('2d');
      var drops = [];


      function renderRainDrop(point){
          var width = 6;
          var height = scrubber.new("Rain Height", 18);
          ctx.fillStyle = zpicker.add("rainColor", "#2D4571");
          ctx.fillRect(point.x, point.y, width, height);
      }

      function rainColumn(x){
         interval.new(function(){
            drops.push(new Point(x, 0));
         }, getRandomArbitrary(500, 3000));
      }

      function randomDrops(){
          var cols = _.range(0, 500, width);
          _.each(cols, rainColumn)
      }

      function moon(){
        ctx.beginPath();
        ctx.fillStyle = zpicker.add("moon", "white"); ;
        ctx.arc(450, 30, scrubber.new("Moon Radius", 90), 0, 2 * Math.PI, false);
        ctx.fill();
      }

      function person(x){
        function umbrella(){

        }
        var height = 60
        var width = 30;
        var headSize = 20;
        ctx.fillStyle = "#FFEBAE"
        ctx.fillRect(x, 500 - height, width, height);
        ctx.fillStyle = "#FF6F55"
        ctx.fillRect(x, 500 - height + headSize, width, height - headSize);

      }


      randomDrops();

      interval.new(function(){
          ctx.clearRect(0,0,500,500);

          ctx.fillStyle = zpicker.add("sky", "black");
          ctx.fillRect(0,0,500,500);

          moon();
          personPos += personVelocity;

          person(personPos);

          var newDrops = [];

          for(var i = 0; i < drops.length; i++){
             if(drops[i].y < 500){
               drops[i].y = drops[i].y + height;
               newDrops.push(drops[i]);

             }
          }

          drops = newDrops;

          _.each(drops, renderRainDrop);
      }, 1000/60);

    $("body").keydown(function(e){

        if(e.keyCode === keyCodes.right) {
          personVelocity = 3;
        }else if(e.keyCode === keyCodes.left) {
          personVelocity = -3;
        }

    })

    $("body").keyup(function(){
        personVelocity = 0;
    })

    } else {
        console.log("Canvas is unsupported :(")
    }
};


$(document).ready(function(){
    draw();
});



