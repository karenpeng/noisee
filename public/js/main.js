(function (exports) {

  var gravity = new PVector(0, 8);
  var left = new PVector(-50, 0);
  var right = new PVector(50, 0);
  var mashes = [];
  var connectCount;
  var red = 0;
  var green = 0;
  var blue = 0;
  exports.over = false;
  var userPitch, userVolume;
  exports.iAmInit;
  var animate = true;

  function beCenter(w, selector) {
    var windowWidth = window.innerWidth;
    var gap = (windowWidth - w) / 2;
    var gapString = gap.toString();
    var gapCss = gapString + 'px';
    $(selector).css("margin-left", gapCss);
  }

  exports.setup = function () {
    $("#word").hide();
    $("#countDown").hide();
    $("#intro").show();
    createGraphics(1100, 600);
    beCenter(width, "canvas");
    beCenter(width, "#intro");
    beCenter(width, "#word");
    exports.width = width;
    exports.iAmInit = false;
    exports.boundary = width;
    connectCount = 0;

    smooth();
    frameRate(24);

    mashes.push(new Mash(19, 4, 50, width / 2, height / 4));
    red = mashes[0].red;
    green = mashes[0].green;
    blue = mashes[0].blue;

    userPitch = new getUserValue(100, 220);
    userVolume = new getUserValue(128, 133);
  };

  exports.reStart = function () {
    animate = false;
    $("#word").hide();
    mashes = [];
    $("#countDown").fadeIn();
    setTimeout(
      function () {
        //nothing
      }, 2000);
    setTimeout(
      function () {
        $("#countDown").css("font-size", "60px");
        $("#countDown").css("text-align", "center");
        $("#countDown").html(5);
      }, 3000);
    setTimeout(
      function () {
        $("#countDown").html(4);
      }, 4000);
    setTimeout(
      function () {
        $("#countDown").html(3);
      }, 5000);
    setTimeout(
      function () {
        $("#countDown").html(2);
      }, 6000);
    setTimeout(
      function () {
        $("#countDown").html(1);
      }, 7000);
    setTimeout(
      function () {
        $("#countDown").fadeOut();
        animate = true;
      }, 8000);

    if (exports.iAmInit) {
      mashes[0] = new Mash(19, 4, 50, width / 6, height / 4);
      mashes[0].red = red;
      mashes[0].green = green;
      mashes[0].blue = blue;
      mashes[0].me = true;
      mashes[1] = new Mash(19, 4, 50, width * 5 / 6, height / 4);
      mashes[1].left = false;
    } else {
      mashes[0] = new Mash(19, 4, 50, width * 5 / 6, height / 4);
      mashes[0].red = red;
      mashes[0].green = green;
      mashes[0].blue = blue;
      mashes[0].me = true;
      mashes[0].left = false;
      mashes[1] = new Mash(19, 4, 50, width / 6, height / 4);
    }
    exports.boundary = width / 2;
    exports.mashes = mashes;
    var colorData = {
      rr: red,
      gg: green,
      bb: blue
    };
    sendWithType('colorData', colorData);
  };

  exports.draw = function () {
    $(window).resize(function () {
      beCenter(width, "canvas");
      beCenter(width, "#intro");
      beCenter(width, "#word");
    });

    background(255);

    for (var i = 20; i < width; i += 30) {
      for (var j = 20; j < height; j += 30) {
        noStroke();
        fill(250);
        rect(i, j, 10, 10);
      }
    }
    if (mashes.length > 1) {
      stroke(0);
      line(width / 2, 0, width / 2, height);
    }
    mashes.forEach(function (item) {
      item.renew();
      item.show();
      item.shoot();
      item.getCenter();
      if (!item.up) {
        item.addF(gravity);
      }
    });
    if (animate) {
      mashes[0].goUp(mapPitch(pitchDetector.pitch));
    }

    if (myConnectAlready && hisConnectAlready) {
      connectCount++;
    }

    if (mashes.length > 1) {
      mashes[0].check(mashes[1]);
      mashes[1].check(mashes[0]);
      drawBoundary();
      gameOver();
      mashes.forEach(function (item) {
        if (item.me && connectCount <= 80) {
          fill(255);
          text("YOU", item.center.x - 10, item.center.y);
        }
      });
    }
    // textSize(60);
    // fill(0);
    // text(connectCount, 50, 50);
  };

  function mapPitch(input) {
    var pitch;
    if (input < 50 || input > 700 || input === undefined) {
      pitch = 0;
    } else {
      var pitchResult = userPitch.update(input);
      pitch = map(input, pitchResult.mininmum, pitchResult.maxinmum * 0.6, 0,
        86);
      //console.log(pitchResult.mininmum, pitchResult.maxinmum * 0.6);
    }
    pitch = constrain(pitch, 0, 90);
    return pitch;
  }

  function mapVolume(input) {
    var volume;
    if (input < 120 || input > 140 || input === undefined) {
      volume = 0;
    } else {
      var volumeResult = userVolume.update(input);
      if (connectCount > 500) {
        volume = map(input, volumeResult.mininmum + 1, volumeResult.maxinmum,
          0,
          22);
      } else {
        volume = map(input, volumeResult.mininmum, volumeResult.maxinmum,
          0,
          37);
      }
      console.log(volume);
    }
    volume = constrain(volume, 0, 50);
    return volume;
  }

  function drawBoundary() {
    fill(0);
    noStroke();
    if (mashes[0].left) {
      rect(0, 0, mashes[0].hit, height);
      rect(width - mashes[1].hit, 0, mashes[1].hit, height);
    } else {
      rect(0, 0, mashes[1].hit, height);
      rect(width - mashes[0].hit, 0, mashes[0].hit, height);
    }
  }

  function gameOver() {
    mashes.forEach(function (item) {
      if (item.hit >= width / 2 - 20) {
        textSize(60);
        fill(246, 10, 10);
        noStroke();
        if (item.me) {
          if (item.center.x > width / 2) {
            text("YOU LOSE", width - 420, height / 2);
          } else {
            text("YOU LOSE", 100, height / 2);
          }
        } else {
          if (item.center.x > width / 2) {
            text("YOU WIN", 140, height / 2);
          } else {
            text("YOU WIN", width - 400, height / 2);
          }
        }
        noLoop();
        exports.over = true;
      }
    })
  }
  /////////////////////////////////////////////////////////////////

  $(window).keydown(function (event) {
    //event.preventDefault();
    if (event.which === 32) {
      if (!mashes[0].hurt && !over && animate) {
        var r = mapVolume(pitchDetector.volume);
        mashes[0].bullets.push(new Bullet(mashes[0].center.x, mashes[0].center
          .y,
          r, mashes[0].left));

        if (myConnectAlready && hisConnectAlready) {
          var bulletInfo = {
            bulletX: mashes[0].center.x,
            bulletY: mashes[0].center.y,
            bulletR: r,
            bulletL: mashes[0].left
          };
          sendWithType('bulletInfo', bulletInfo);
        }
      }
    }
  });

  $(window).keydown(function (event) {
    //event.preventDefault();
    if (event.which === 37 && !over && animate) {
      mashes[0].addF(left);
      if (myConnectAlready && hisConnectAlready) {
        var leftData = {
          left: true
        };
        sendWithType('leftData', leftData);
      }
    }
  });

  $(window).keydown(function (event) {
    //event.preventDefault();
    if (event.which === 39 && !over && animate) {
      mashes[0].addF(right);
      if (myConnectAlready && hisConnectAlready) {
        var rightData = {
          right: true
        };
        sendWithType('rightData', rightData);
      }
    }
  });
  exports.right = right;
  exports.left = left;
})(this);