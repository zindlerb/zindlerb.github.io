

  (function Interval(interval){

    var intervals = [];
    var stopped = false;
    var tid = setInterval(function() {

        if (document.readyState !== 'complete') return;
            clearInterval( tid );

        var bodyNode = document.body;
        bodyNode.addEventListener("keypress", function(e){
           if(e.keyCode === 96){
               stopped = !stopped;
           }
        })

    }, 100);

    interval.new = function(func, millis){
        intervals.push(setInterval(function(){
            if(!stopped){
               func();
            }

        }, millis));
    }




    interval.start = function(){
        stopped = false;
    }

    interval.stop = function(){
        stopped = false;
    }

    })(this.interval = {})




