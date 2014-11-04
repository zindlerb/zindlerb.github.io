//Stolen from Bret Victor's tangle.
//Right now needs to be in render loop, but can I change this?
//Deal with spaces? maybe?
(function Scrubber(scrub){
    var scrubbers = {};
    var scrubOn = false;

    //bad name
    function numberPlace(num) {
      var result = 1;
      if(num <= 9 && num >= 1){
        return 1
      } else {

        if(num == 0){
          return 1;
        } if(num < 1){
          result *= ( numberPlace(num * 10) * .1) ;
        } else {
          result *= ( numberPlace(num/10) * 10);
        }
      }
      return result;
    }

    scrub.toggle = function(){
       if(scrubOn){
           var scrubNode = document.getElementById("scrubbers");
           scrubNode.parentNode.removeChild(scrubNode);
       } else {
           //Add HTML
           var scrubDiv =  document.createElement("div");
           scrubDiv.id = "scrubbers"
           document.body.appendChild(scrubDiv);
           var htmlStr = '';

           for(var k in scrubbers){
             htmlStr += "<div id='scrubberBox" + k + "'><p class='unselectable'>" + scrubbers[k].varName + ": <span class='scrubberStyle' id='scrubber" + k + "'>" + scrubbers[k].value + "</span></p></div>"
           }

           document.getElementById('scrubbers').innerHTML += htmlStr;



           //Apply Events
           //Damn k is overwriting itself. with for loop due to delayed execution
           for(var k in scrubbers){
             var scrubSpan = document.getElementById('scrubber' + k);
             //console.log(k);
             (function(){
                var drag = false;
                var mouseDownPos = {x: 0, y: 0};
                var mouseMovePos = {x: 0, y: 0};
                var scrubOriginal
                var scopedK = k;
                document.body.addEventListener("mousemove", function(e){

                   if(drag){

                      mouseMovePos = {x: e.offsetX, y: e.offsetY};
                      scrubbers[scopedK].value = scrubOriginal + ((mouseDownPos.x - mouseMovePos.x) * scrubbers[scopedK].scrubScale);
                      document.getElementById('scrubber' + scopedK).innerHTML = scrubbers[scopedK].value;

                    }
                })

                scrubSpan.addEventListener("mousedown", function(e){

                    //console.log(scrubbers[scopedK].value);
                    mouseDownPos = {x: e.offsetX, y: e.offsetY};
                    scrubOriginal = scrubbers[scopedK].value;
                    mouseMovePos = mouseDownPos;
                    drag = true;
                });

                document.body.addEventListener("mouseup", function(e){

                    drag = false;
                })
             })()
          }
       }

       scrubOn = !scrubOn;
    }

    scrub.new = function(varName, initVal, description){

        if(!(varName in scrubbers)){

          initVal = (typeof initVal === 'undefined') ? 1 : initVal;

          //console.log(initVal);

          if(numberPlace(initVal) > 1){
            var scrubScale = 1;
          } else {
            var scrubScale = numberPlace(initVal);
          }

          scrubbers[varName] = {varName: varName,
                                value: initVal,
                                description: description,
                                scrubScale: scrubScale};

        }

        return scrubbers[varName].value;
    }

    var ready = setInterval(function() {
        if (document.readyState !== 'complete') return;
            clearInterval( ready );

        var bodyNode = document.body;
        bodyNode.addEventListener("keypress", function(e){

           //Default key is shift-2
           if(e.keyCode === 64){
              scrub.toggle();
           }
        })
    }, 100);

    })(this.scrubber = {});


