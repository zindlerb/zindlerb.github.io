function ViewModel(){
    var self = this;

    self.quickView = subjects;

    var classesT = _.map(classes, function(val, ind){
        return new Class(val);
    });

    self.totalClasses = classesT

    self.chosenSubject = ko.observable();

    self.visibleClasses = ko.observableArray([]);

    self.selectedClasses = ko.observableArray([]);

    self.goToSubject = function(subject){
        self.visibleClasses.removeAll();
        self.chosenSubject(subject);
        var subjectEdit = between(subject, "(", ")");

        _.each(self.totalClasses, function(val, ind){
          var subj = val.course.split(" ");
          if(subj[0] == subjectEdit){
            self.visibleClasses.push(val);
          }
        });
    }

    self.addClass = function(cl){
      if(self.selectedClasses().indexOf(cl) == -1){
        self.selectedClasses.push(cl);

        _.map(self.visibleClasses(), function(val, index){
            if(cl.time == val.time){
              val.conflict = true;
            }
            return val;
        });
       var subj = cl.course.split(" ");
       subj = "("+ subj[0] +")";

       var result = searchSubjects(subj);
       self.goToSubject(result);
      }
    }

    self.dropClass = function(cl){
      _.map(self.visibleClasses(), function(val, index){
            if(cl.time == val.time){
              val.conflict = false;
            }
            return val;
      });
      var subj = cl.course.split(" ");
      subj = "("+ subj[0] +")";

      var result = searchSubjects(subj);
      self.goToSubject(result);

      self.selectedClasses.remove(cl);
    }



    self.attributeClass = function(attr){
      return "label-" + attr;
    };

}

function between(str, start, end) {
  var ind1 = str.indexOf(start);
  var ind2 = str.indexOf(end);
  return str.slice(ind1 + 1, ind2);
}



function Class(classObj) {
    var self = this;
    _.each(classObj, function(val, key){
      if(key == "time"){
        var broken = val.split(" ");
        self[key] = broken[0];
        self["M"] = "";
        self["T"] = "";
        self["W"] = "";
        self["R"] = "";
        self["F"] = "";



        var weekArr = broken[1].split("");

        _.each(weekArr, function(val, ind){
            var weekday = getWeekDay(val);
            self[val] = weekday;
        });

        self["room"] = broken[2] + " " + broken[3];
      } else if(key == "attributes"){
        self[key] = _.map(val, function(attr){
              return attributeDictionary(attr);
        });
      } else {
        self[key] = val;
      }

    });

    self.conflict = false;
}



function Subj(subject){
    var self = this;
    self.name = subject;
}

function getWeekDay(str){
  if(str == "M"){
    return "Monday";
  } else if(str == "T"){
    return "Tuesday";
  } else if(str == "W"){
    return "Wednesday";
  } else if(str == "R"){
    return "Thursday";
  } else if(str == "F"){
    return "Friday";
  }
}

function attributeDictionary(str){
  function returnOpposite(lookup ,str1, str2){
    if(str == str1) {
        return str2;
      } else if (str == str2) {
        return str1;
      } else {
        return "none";
      }
  }

  var result;

  var attrList = [["Social Science Div GER (01cr)", "SSD"],
                  ["Diversity-Global GER (01cr)", "DG"],
                  ["Diversity-Dimens GER (01cr)", "DD"],
                  ["BM Social Science (01cr)", "BM-SS"],
                  ["Introductory Course", "Intro"]];

  _.each(attrList, function(val, ind){
     var opposite = returnOpposite(str , val[0], val[1]);
     if( opposite != "none"){
       result = opposite;
     }
  });

  return result;
}

function searchSubjects(lookup) {
    return _.find(subjects, function(str) {
          return (str.indexOf(lookup) != -1);
    })
}


ko.applyBindings(new ViewModel());
