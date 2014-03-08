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
  Ball.prototype.update = function () {
    this.vel.add(this.acc);
    this.vel.mult(this.damping);
    this.loc.add(this.vel);
    this.acc.mult(0);
    if (this.loc.x <= this.mass + hit || this.loc.x >= width - this.mass -
      hit) {
      this.vel.x *= -0.9;
    }
    if (this.loc.y <= this.mass + hit || this.loc.y >= height - this.mass -
      hit) {
      this.vel.y *= -0.9;
    }
    this.loc.x = constrain(this.loc.x, this.mass + hit, width - this.mass -
      hit);
    this.loc.y = constrain(this.loc.y, this.mass + hit, height - this.mass -
      hit);
  };

  Ball.prototype.applyForce = function (force) {
    var f = force.get();
    f.div(this.mass);
    this.acc.add(f);
  };

  Ball.prototype.render = function () {
    stroke(30);
    fill(175);
    if (this.dragging) {
      fill(50);
    }
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

  ///////////////////////////////////////////////////////////////////

  function Mash(number, bones, size, x, y) {
    this.b = [];
    this.s = [];
    this.center = new PVector();
    this.n = number;
    this.up = false;
    this.hurt = false;
    this.counter = 0;
    this.preH = 0;
    this.me = false;

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
    if (this.hurt) {
      this.counter++;
      if (this.counter > 1) {
        this.hurt = false;
        this.counter = 0;
      }
    }
    this.b.forEach(function (item) {
      item.update();
      item.render();
    });
    this.s.forEach(function (item) {
      item.connect();
      item.constrainLength();
    });
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
    h = Math.floor(h);
    if (abs(h - this.preH) > 2) {
      //console.log(h, this.preH);
      var up = new PVector(0, -h);
      this.addF(up);
      this.up = true;
      // if (this.me && pitchDetector.turnOn) {
      //   var upData = {
      //     hh: h
      //   };
      //   sendWithType('upData', upData);
      // }
      this.preH = h;
    } else {
      this.up = false;
    }
    if (this.me && pitchDetector.turnOn) {
      var upData = {
        hh: h
      };
      sendWithType('upData', upData);
    }
  };

  Mash.prototype.show = function () {
    stroke(30);
    if (!this.hurt) {
      fill(100);
    } else {
      fill(250);
    }
    //noFill();
    beginShape();
    //curveVertex(0, 0);
    for (var k = 0; k < this.n; k++) {
      //curveVertex(this.b[j].loc.x, this.b[j].loc.y);
      vertex(this.b[k].loc.x, this.b[k].loc.y);
    }
    //curveVertex(0, 0);
    endShape(CLOSE);
  };

  exports.Ball = Ball;
  exports.Spring = Spring;
  exports.Mash = Mash;
})(this);