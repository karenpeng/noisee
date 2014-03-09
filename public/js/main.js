(function (exports) {

  var gravity = new PVector(0, 7);
  var left = new PVector(-50, 0);
  var right = new PVector(50, 0);
  var threshold;
  var invisibleSpring;
  var counter;
  var mashes = [];
  var theta = 0;
  var connectCount;
  exports.iAmInit;

  function beCenter(w, selector) {
    var windowWidth = window.innerWidth;
    var gap = (windowWidth - w) / 2;
    var gapString = gap.toString();
    var gapCss = gapString + 'px';
    $(selector).css("margin-left", gapCss);
  }

  exports.setup = function () {
    createGraphics(1204, 620);
    beCenter(width, "canvas");
    exports.width = width;
    exports.iAmInit = false;
    exports.boundary = width;
    connectCount = 0;

    smooth();
    frameRate(24);

    mashes.push(new Mash(19, 4, 50, width / 2, height / 4));
    invisible = 30;
    invisibleSpring = [];
    counter = 0;
  };

  exports.reStart = function () {
    mashes = [];
    if (exports.iAmInit) {
      mashes[0] = new Mash(19, 4, 50, width / 6, height / 4);
      mashes[0].me = true;
      mashes[1] = new Mash(19, 4, 50, width * 5 / 6, height / 4);
      mashes[1].left = false;
    } else {
      mashes[0] = new Mash(19, 4, 50, width * 5 / 6, height / 4);
      mashes[0].me = true;
      mashes[0].left = false;
      mashes[1] = new Mash(19, 4, 50, width / 6, height / 4);
    }
    exports.boundary = width / 2;
    exports.mashes = mashes;
  };

  exports.draw = function () {
    $(window).resize(function () {
      beCenter(width, "canvas");
    });

    background(255);
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
    mashes[0].goUp(mapPitch(pitchDetector.pitch));

    if (connectAlready) {
      theta++;
      connectCount++;
    }

    /*
  mash.b.forEach(function (item) {
    jumper.b.forEach(function (key) {
      var sub = PVector.sub(item.loc, key.loc);
      var dis = sub.mag();
      if (!item.check && !key.check && dis < invisible && abs(item.loc.x -
        key.loc.x) < 10) {
        invisibleSpring.push(new Spring(item, key));
        item.check = true;
        key.check = true;
      }
    });
  });
*/
    /*
  for (var j = 0; j < mash.b.length; j++) {
    for (var k = 0; k < jumper.b.length; k++) {
      var sub = PVector.sub(mash.b[j].loc, jumper.b[k].loc);
      var dis = sub.mag();
      if (!mash.b[j].check && !jumper.b[k].check && dis <= invisible && abs(
        mash
        .b[j].loc.x -
        jumper.b[k].loc.x) < 10) {
        invisibleSpring.push(new Spring(mash.b[j], jumper.b[k]));
        mash.b[j].check = true;
        jumper.b[k].check = true;
        invisibleSpring[counter].b1Num = j;
        invisibleSpring[counter].b2Num = k;
        invisibleSpring[counter].max *= 0.8;
        invisibleSpring[counter].min *= 1.2;
        counter++;
      }
    }
  }
  */
    /*
  //for (var i = invisibleSpring.length - 1; i > -1; i--) {
  for (var i = 0; i < invisibleSpring.length; i++) {
    invisibleSpring[i].connect();
    invisibleSpring[i].displayLine();
    invisibleSpring[i].constrainLength();
    var sub1 = PVector.sub(invisibleSpring[i].b1.loc, invisibleSpring[i].b2.loc);
    var dis1 = sub1.mag();
    if (dis1 > invisible) {
      mash.b[invisibleSpring[i].b1Num].check = false;
      jumper.b[invisibleSpring[i].b2Num].check = false;
      invisibleSpring.splice(i, 1);
    }
  }
*/
    if (mashes.length > 1) {
      mashes[0].check(mashes[1]);
      mashes[1].check(mashes[0]);
      gameOver();
      drawBoundary();
    }

    fill(0);
    var c = connectCount.toString();
    text(c, mashes[0].center.x, mashes[0].center.y);
  };

  function mapPitch(input) {
    var pitch;
    if (input < 10 || input > 1000) {
      pitch = 0;
    } else {
      pitch = map(input, 40, 700, 0, 55);
      pitch = constrain(pitch, 0, 60);
    }
    return pitch;
  }

  function mapVolume(input) {
    var volume;
    if (input < 127 || input > 140) {
      volume = 0;
    } else {
      volume = map(input, 127.5, 140, 0, 70);
      volume = constrain(volume, 0, 100);
    }
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
    if (mashes[0].hit >= width / 2 - mashes[0].size) {
      textSize(60);
      fill(0);
      text("YOU WIN", mashes[1].center.x - mashes[1].size / 2, height / 2);
      noLoop();
    }
    if (mashes[1].hit >= width / 2 - mashes[0].size) {
      textSize(60);
      fill(0);
      text("YOU WIN", mashes[0].center.x - mashes[0].size / 2, height / 2);
      noLoop();
    }
  }
  /////////////////////////////////////////////////////////////////

  $(window).keydown(function (event) {
    //event.preventDefault();
    if (event.which === 32) {
      if (!mashes[0].hurt) {
        var r = mapVolume(pitchDetector.volume);
        mashes[0].bullets.push(new Bullet(mashes[0].center.x, mashes[0].center
          .y,
          r, mashes[0].left));

        if (connectAlready) {
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
    if (event.which === 37) {
      mashes[0].addF(left);
      if (connectAlready) {
        var leftData = {
          left: true
        };
        sendWithType('leftData', leftData);
      }
    }
  });

  $(window).keydown(function (event) {
    //event.preventDefault();
    if (event.which === 39) {
      mashes[0].addF(right);
      if (connectAlready) {
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