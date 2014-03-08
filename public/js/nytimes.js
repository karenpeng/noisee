var i = 1;
var articleObj;
var asyncCount = 0;

function getNYTimesData() {
  articleObj = [];
  asyncCount = 0;
  "use strict";
  var nyTimesSearchURL =
    'http://api.nytimes.com/svc/search/v2/articlesearch.json?q=new+york+times&page=' +
    i + '1&sort=newest&api-key=';
  var myNYKey = '38ca745c014db64d4d8be1fc7dbfbc94:10:68849499';

  $.ajax({
    url: nyTimesSearchURL + myNYKey,
    type: 'GET',
    dataType: 'json',
    error: function (data) {
      console.log("Wegot problem");
      console.log(data.status);
    },
    success: function (data) {
      var nyTimesArticles;
      if (!(data.response.docs instanceof Array)) {
        console.log("Huh??? Not an array");
        return;
      } else {
        nyTimesArticles = data.response.docs;
      }
      for (var i = 0; i < nyTimesArticles.length; i++) {
        articleObj.push(nyTimesArticles[i].headline
          .main);
        asyncCount++;
      }
    }
  });
  i++;
}