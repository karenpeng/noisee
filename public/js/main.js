(function (exports) {

  var gravity = new PVector(0, 7);
  var left = new PVector(-50, 0);
  var right = new PVector(50, 0);
  var threshold;
  var invisibleSpring;
  var counter;
  var mashes = [];
  var blocks = [];
  var bullets = [];
  var wat = 0.01;
  exports.hit = 0;
  var blockCount = 0;
  var theta = 0;
  var connectCount;
  exports.iAmInit;
  // var shootCount = 0;
  var headLine;
  var interval;

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
    connectCount = 0;
    interval = 80;

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
      mashes[0] = new Mash(19, 4, 50, width / 4, height / 4);
      mashes[0].me = true;
      mashes[1] = new Mash(19, 4, 50, width * 3 / 4, height / 4);
    } else {
      mashes[0] = new Mash(19, 4, 50, width * 3 / 4, height / 4);
      mashes[0].me = true;
      mashes[1] = new Mash(19, 4, 50, width / 4, height / 4);
    }
    bullets = [];
    exports.mashes = mashes;
  };

  exports.draw = function () {
    $(window).resize(function () {
      beCenter(width, "canvas");
    });

    background(255);
    mashes.forEach(function (item) {
      item.renew();
      item.show();
      item.getCenter();
      if (!item.up) {
        item.addF(gravity);
      }
    });
    mashes[0].goUp(mapPitch(pitchDetector.pitch));

    // if (wat >= 1) {
    //   wat -= 0.00001;
    // }
    if (interval < 4) {
      interval = 4;
    }

    if (connectAlready) {
      // wat += 0.00001;
      interval -= 0.004;
      theta++;
      connectCount++;
      console.log(interval);

      //if (map(cos(theta), -1, 1, 0, 1) < wat) {
      if (connectCount % Math.round(interval) === 0) {
        //if (connectCount * 4 % 200 === 0) {
        getText();
        if (headLine) {
          blocks.push(new Block(headLine, theta));
        }
      }
    }

    for (var i = blocks.length - 1; i > -1; i--) {
      blocks[i].die();
      if (blocks[i].isDead) {
        blocks.splice(i, 1);
      } else {
        blocks[i].move();
        blocks[i].show();
        mashes.forEach(function (item) {
          blocks[i].check(item);
        })
      }
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
    for (var j = bullets.length - 1; j > -1; j--) {
      bullets[j].die();
      if (bullets[j].isDead) {
        bullets.splice(j, 1);
      } else {
        bullets[j].update();
        bullets[j].show();
        blocks.forEach(function (item) {
          bullets[j].check(item);
        })
      }
    }

    if (mashes[0].hurt) {
      exports.hit += 0.6;
    }
    drawBoundary();

    if (exports.hit >= height / 2) {
      textSize(60);
      fill(255);
      text("GAME OVER", width / 2 - 180, height / 2);
      noLoop();
    }

    fill(0);
    var c = connectCount.toString();
    text(c, mashes[0].center.x, mashes[0].center.y);
    exports.bullets = bullets;

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

  function getText() {
    if ((asyncCount === 0 && blockCount === 0) || asyncCount - blockCount < 0) {
      getNYTimesData();
      blockCount = 0;
    }
    headLine = articleObj[blockCount];
    if (asyncCount >= blockCount) {
      blockCount++;
    }
  }

  function drawBoundary() {
    fill(34);
    noStroke();
    rect(0, 0, width, exports.hit);
    rect(0, height - exports.hit, width, exports.hit);
    rect(0, 0, exports.hit, height);
    rect(width - exports.hit, 0, exports.hit, height);
  }

  /////////////////////////////////////////////////////////////////

  $(window).keydown(function (event) {
    //event.preventDefault();
    if (event.which === 32) {
      if (!mashes[0].hurt) {
        var r = mapVolume(pitchDetector.volume);
        bullets.push(new Bullet(mashes[0].center.x, mashes[0].center.y,
          r));

        if (connectAlready) {
          var bulletInfo = {
            bulletX: mashes[0].center.x,
            bulletY: mashes[0].center.y,
            bulletR: r
          };
          sendWithType('bulletInfo', bulletInfo);

          // if (shootCount < 1) {
          //   var shootingData = {
          //     heShoots: true
          //   };
          //   sendWithType('shootingData', shootingData);
          //   shootCount++;
          // }
        }
      }
    }
  });

  // $(window).keyup(function (event) {
  //   if (connectAlready) {
  //     var shootingData = {
  //       heShoots: false
  //     };
  //     sendWithType('shootingData', shootingData);
  //     shootCount = 0;
  //   }
  // });

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