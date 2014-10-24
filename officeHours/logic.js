var mute = false;

var QueueMaker = function () {
   var array = [],
       head = 0,
       tail = -1;
   return {
     pushTail: function (value) {
       return array[tail += 1] = value
     },
     pullHead: function () {
       var value;

       if(tail >= head) {
         value = array[head];
         array[head] = void 0;
         head += 1;
         return value
       }
     },
     isEmpty: function () {
       return tail < head
     },
     readArray: function() {
       return array
     }
   }
};

var bites = [["What are you working on?","whatworking-SS2013"],
            ["So precisely what does your startup do?","precise-SS11"],
            ["How did you arrive at this idea?", "arrive-SS11"],
             {q: ["Is it launched yet?","launchYet-SS2013"],
              No: [["Why don't you just launch it?","launch-DR"],
                   ["Why don't you just launch?","lunch-DR"],
                   ["What is the typical use case?","typicalusecase-SS2013"]],
              Yes: [["What is the feature users are most excited about?","whatdo-DR"]]},
            ["Who is going to want this the most?","the most-SS11"],
            ["Is this the biggest problem you've found in the world?","biggest-SS11"],
            ["Do you have any evidence that people actually like this?","evidenceb-DR"],
            ["What's your growth rate like?","growth-DR"],
            ["How many people do you have?","howmanypeepl-SS2013"],
            ["How did you meet?","howmeet-SS2013"],
            ["How will you make money?","money-SS2013"],
            ["How much will you make per customer?","howmuchmake-SS2013"],
            ["Where does your current market top out?","topout-DR"],
            ["How did you start working on this?","howstart-SS2013"],
            ["Why this problem?","whyy-DR"],
            ["Why did you do this as your startup?","whyyy-DR"],
            ["How you are using your product right now?","howusing-DR"],
            ["In your first 100 users which type will be the most common?","mostcommon-SS11"],
            ["Do you have a plan for getting users?","users-DR"],
            ["What do you think will be the most popular things?","popular-SS2013"],
            ["Why doesn't it already exist?","nobodythought-SS11"],
            ["What's special about what you're doing?","speacial-SS11"],
            ["Why would someone use it?","whyuse-DR"],
            ["Why has no one done this before?","whynoonbefore-SS2013"],
            ["The end!","end-SS2013"]];

var loader = QueueMaker();
var displayer = QueueMaker();


_.each(bites, function(bite){
    if(bite.q == null){
       loader.pushTail({
          q: bite
        });
    } else {
     loader.pushTail(bite);
    }
});



var pastSound =  null;

$("#question").click(function(e){
  e.preventDefault();
});

$("#stack").click(function(e){
    mute
    if(mute){
      mute = false;
      $("#mute").remove();
    } else {
      mute = true;
      $("#stack").append("<i id='mute' class='fa fa-ban fa-stack-2x text-danger'></i>")
    }
    e.stopPropagation();
})


displayer.pushTail(loader.pullHead())

$("body").click(function(){
  var current = displayer.pullHead();
  nonQuestion(current);
  question(current);
});



function playSound(bite) {
  if(!mute){
      if(pastSound != null) {
        pastSound.stop();
      }

      var sound = new Howl({
        urls: [formatSound(bite[1])]
      })

      sound.play()

      sound.fade({
        from: 0.0,
        to: 1.0,
        duration: 60000
      });

      pastSound = sound;
    }
}

function nonQuestion(bite){
   if(_.size(bite) == 1) {
    bite = bite.q;
    playSound(bite);
    $("#question").text(bite[0]);
    if(displayer.isEmpty()) {
      var head = loader.pullHead();
      displayer.pushTail(head);
    }

  }
}

function question(bite) {
  if(_.size(bite) > 1){
     $("body").unbind("click");
     playSound(bite.q);
     $("#question").text(bite.q[0]);



     _.each(bite, function(arr, key){
       if(key != "q") {
         $("#answer").append("<div class='col-6-12 middle'><p class='question' id='"+  key  +"' >" + key + "</p></div>")
         $("#" + key).click(function(e){
              $(".question").remove();
              _.each(arr, function(message){
                displayer.pushTail({q: message});
              });

              if(arr.length == 0) {
                displayer.pushTail(loader.pullHead())
              }


              $("body").click(function(){
                var current = displayer.pullHead();
                displayer.readArray()
                nonQuestion(current);
                question(current);
              });

         })
       }

     });

  }
}

$("body").click();

function formatSound(str){
    return "sounds/" + str + ".mp3";
}

