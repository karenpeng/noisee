(function (exports) {

  function Ball(x, y, m) {
    this.loc = new PVector(x, y);
    this.vel = new PVector();
    this.acc = new PVector();
    this.dragOffset = new PVector();
    this.damping = 0.98;
    this.dragging = false;
    this.mass = m;
    this.check = false;
  }
  Ball.prototype.update = function (hit, left) {
    this.vel.add(this.acc);
    this.vel.mult(this.damping);
    this.loc.add(this.vel);
    this.acc.mult(0);
    if (left) {
      if (this.loc.x <= this.mass + hit || this.loc.x >= boundary -
        this.mass) {
        this.vel.x *= -0.9;
      }
      if (this.loc.y <= this.mass || this.loc.y >= height - this.mass) {
        this.vel.y *= -0.9;
      }
      this.loc.x = constrain(this.loc.x, this.mass + hit, boundary -
        this.mass);
      this.loc.y = constrain(this.loc.y, this.mass, height - this.mass);
    } else {
      if (this.loc.x <= width - boundary + this.mass || this.loc.x >= width -
        this.mass -
        hit) {
        this.vel.x *= -0.9;
      }
      if (this.loc.y <= this.mass || this.loc.y >= height - this.mass) {
        this.vel.y *= -0.9;
      }
      this.loc.x = constrain(this.loc.x, width - boundary + this.mass, width -
        this.mass -
        hit);
      this.loc.y = constrain(this.loc.y, this.mass, height - this.mass);
    }
  };

  Ball.prototype.applyForce = function (force) {
    var f = force.get();
    f.div(this.mass);
    this.acc.add(f);
  };

  Ball.prototype.render = function (r, g, b) {
    stroke(30);
    fill(r, g, b);
    ellipse(this.loc.x, this.loc.y, this.mass * 2, this.mass * 2);
  };

  ///////////////////////////////////////////////////////////////

  function Spring(b1, b2) {
    this.k = 0.2;
    this.b1 = b1;
    this.b2 = b2;
    this.len = PVector.sub(b1.loc, b2.loc);
    this.len = this.len.mag();
    this.min = this.len * 0.4;
    this.max = this.len * 1.6;
  }

  Spring.prototype.connect = function () {
    var f, d, strech;
    f = PVector.sub(this.b1.loc, this.b2.loc);
    d = f.mag();
    stretch = d - this.len;
    f.normalize();
    f.mult(-1 * this.k * stretch);
    //wow do sth to the ball in spring
    this.b1.applyForce(f);
    f.mult(-1);
    this.b2.applyForce(f);
  };

  Spring.prototype.constrainLength = function () {
    var dir, d;
    dir = PVector.sub(this.b1.loc, this.b2.loc);
    d = dir.mag();
    if (d < this.min) {
      dir.normalize();
      dir.mult(this.min);
      this.b1.loc = PVector.add(this.b2.loc, dir);
      this.b1.vel.mult(0);
    } else if (d > this.max) {
      dir.normalize();
      dir.mult(this.max);
      this.b1.loc = PVector.add(this.b2.loc, dir);
      this.b1.vel.mult(0);
    }
  };

  Spring.prototype.displayLine = function () {
    strokeWeight(1);
    stroke(0);
    line(this.b1.loc.x, this.b1.loc.y, this.b2.loc.x, this.b2.loc.y);
  };

  /////////////////////////////////////////////////////

  function Bullet(x, y, r, left) {
    this.left = left;
    this.life = 30;
    this.loc = new PVector(x, y);
    if (this.left) {
      this.vel = new PVector(2, 0);
      this.acc = new PVector(2, 0);
    } else {
      this.vel = new PVector(-2, 0);
      this.acc = new PVector(-2, 0);

    }
    this.radius = r;
    this.isDead = false;
  }

  Bullet.prototype.update = function () {
    this.life--;
    this.radius -= 0.2;
    this.loc.add(this.vel);
    this.vel.add(this.acc);
  };

  Bullet.prototype.die = function () {
    if (this.life <= 0) {
      this.isDead = true;
    }
    if (this.left) {
      if (this.loc.x - this.radius > width) {
        this.isDead = true;
      }
    } else {
      if (this.loc.x + this.radius < 0) {
        this.isDead = true;
      }
    }
  };

  Bullet.prototype.show = function () {
    noFill();
    strokeWeight(1);
    stroke(30);
    ellipse(this.loc.x, this.loc.y, this.radius * 2, this.radius * 2);
  };

  ///////////////////////////////////////////////////////////////////

  function Mash(number, bones, size, x, y) {
    this.left = true;
    this.b = [];
    this.s = [];
    this.bullets = [];
    this.center = new PVector();
    this.n = number;
    this.up = false;
    this.hurt = false;
    this.counter = 0;
    this.preH = 0;
    this.me = true;
    this.size = size;
    this.red = random(80, 150);
    this.green = random(80, 150);
    this.blue = random(80, 150);
    this.hit = 0;
    this.score = 0;

    for (var j = 0; j < this.n; j++) {
      this.b.push(new Ball(x + cos(j * PI / this.n * 2) * size, y +
        sin(j * PI /
          this.n * 2) * size, 8));
    }
    for (var i = 0; i < this.n - 1; i++) {
      this.s.push(new Spring(this.b[i], this.b[i + 1]));
    }
    for (var k = 0; k < Math.floor(this.n / bones); k++) {
      this.link((k + 1) * bones, this.n);
    }
  }

  Mash.prototype.link = function (interval, n) {

    for (var j = 0; j < n - interval; j++) {
      this.s.push(new Spring(this.b[j], this.b[j + interval]));
    }
    var m = 0;
    for (var k = n - interval; k < n; k++) {
      this.s.push(new Spring(this.b[k], this.b[m]));
      m++;
    }
  };

  Mash.prototype.renew = function () {
    var that = this;
    if (this.hurt) {
      this.counter++;
      if (this.counter > 1) {
        this.hurt = false;
        this.counter = 0;
      }
    }
    if (this.hurt) {
      this.hit += 0.6;
    }
    this.b.forEach(function (item) {
      item.update(that.hit, that.left);
      item.render(that.red + 100, that.green + 100, that.blue + 100);
    });
    this.s.forEach(function (item) {
      item.connect();
      item.constrainLength();
    });
  };

  Mash.prototype.shoot = function () {
    for (var j = this.bullets.length - 1; j > -1; j--) {
      this.bullets[j].die();
      if (this.bullets[j].isDead) {
        this.bullets.splice(j, 1);
      } else {
        this.bullets[j].update();
        this.bullets[j].show();
      }
    }
  };

  Mash.prototype.getCenter = function () {
    var sumX = 0;
    var sumY = 0;
    this.b.forEach(function (item) {
      sumX += item.loc.x;
      sumY += item.loc.y;
    });
    var aveX = 0;
    var aveY = 0;
    aveX = sumX / this.b.length;
    aveY = sumY / this.b.length;
    this.center = new PVector(aveX, aveY);
  };

  Mash.prototype.addF = function (f) {
    this.b.forEach(function (item) {
      var force = new PVector(f.x, f.y);
      item.applyForce(force);
    });
  };

  Mash.prototype.goUp = function (h) {
    // var he = Math.floor(h);
    // if (abs(he - this.preH) > 2) {
    //   var up = new PVector(0, -he);
    //   this.addF(up);
    //   this.up = true;
    //   this.preH = he;
    // } else {
    //   this.up = false;
    // }
    // if (this.me && pitchDetector.turnOn) {
    //   var upData = {
    //     hh: he
    //   };
    //   sendWithType('upData', upData);
    //   console.log(he);
    // }
    if (this.me) {
      var he = Math.floor(h);
      if (abs(he - this.preH) > 2) {
        var up = new PVector(0, -he);
        this.up = true;
        this.addF(up);
        this.preH = he;
        if (pitchDetector.turnOn && hisConnectAlready && myConnectAlready) {
          var upData = {
            hh: he
          };
          sendWithType('upData', upData);
          //console.log(he);
        }
      } else {
        this.up = false;
      }
    } else {
      if (hisConnectAlready && myConnectAlready) {
        var up2 = new PVector(0, -h);
        var antiGravity = new PVector(0, -8);
        this.addF(up2);
        this.addF(antiGravity);
        //console.log(h);
      }
    }
  };

  Mash.prototype.check = function (otherMash) {
    var that = this
    if (otherMash.bullets.length > 0) {
      otherMash.bullets.forEach(function (item) {
        if (item.radius > 0.2) {
          var dis = PVector.sub(item.loc, that.center);
          var disL = dis.mag();
          if (disL < item.radius + that.size) {
            that.hurt = true;
            var thick = map(item.radius, 0, 60, 0, 18);
            thick = constrain(thick, 0, 20);
            // var thick = map(item.radius, 0, 60, 0, 100);
            // thick = constrain(thick, 0, 100);
            that.hit += thick;
            //otherMash.score++;
            var f = item.vel.mult(0.2);
            that.addF(f);
            item.isDead = true;
          }
        }
      })
    }
    if (that.hurt) {
      otherMash.score++;
    }
  }

  Mash.prototype.show = function () {
    stroke(30);
    if (!this.hurt) {
      fill(this.red, this.green, this.blue);
    } else {
      fill(250);
    }
    beginShape();
    for (var k = 0; k < this.n; k++) {
      vertex(this.b[k].loc.x, this.b[k].loc.y);
    }
    endShape(CLOSE);
  };

  //////////////////////////////////////////////////////////////
  function getUserValue(a, b) {
    this.min = a;
    this.max = b;
  }

  getUserValue.prototype.update = function (input) {
    if (this.min > input) {
      this.min = input;
    }
    if (this.max < input) {
      this.max = input;
    }
    return {
      mininmum: this.min,
      maxinmum: this.max
    };
  };

  exports.Ball = Ball;
  exports.Spring = Spring;
  exports.Mash = Mash;
  exports.Bullet = Bullet;
  exports.getUserValue = getUserValue;

})(this);