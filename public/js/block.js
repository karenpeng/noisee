(function (exports) {

  function Block(text, theta) {
    this.h = map(sin(theta), -1, 1, 12, 28);
    this.loc = new PVector(width, map(sin(theta), -1, 1, 0, height - this.h));
    this.vel = new PVector(map(cos(theta), -1, 1, -6, -46), 0);
    this.isDead = false;
    this.text = text;
  }

  Block.prototype.move = function () {
    this.loc.add(this.vel);
    this.loc.y = constrain(this.loc.y, hit, height - this.h - hit);
  };

  Block.prototype.die = function () {
    if (this.loc.x + this.w < 0) {
      this.isDead = true;
    }
  };

  Block.prototype.check = function (mash) {
    var that = this;
    mash.b.forEach(function (item) {
      if (item.loc.x + item.mass > that.loc.x && item.loc.x - item.mass +
        item
        .mass < that
        .loc.x + that.w) {
        if (item.loc.y + item.mass > that.loc.y && item.loc.y - item.mass <
          that.loc.y + that.h) {
          item.applyForce(that.vel);
          mash.hurt = true;
        }
      }
    });
  };

  Block.prototype.show = function () {
    noStroke();
    fill(30);
    textSize(this.h);
    text(this.text, this.loc.x, this.loc.y + this.h);
    this.w = textWidth(this.text);

    // stroke(0);
    // noFill();
    // rect(this.loc.x, this.loc.y, this.w, this.h);

  };
  //////////////////////////////////////////////////////////////

  function Bullet(x, y, r) {
    this.loc = new PVector(x, y);
    this.vel = new PVector(2, 0);
    this.acc = new PVector(2, 0);
    this.radius = r;
    this.isDead = false;
  }

  Bullet.prototype.update = function () {
    this.loc.add(this.vel);
    this.vel.add(this.acc);
  };

  Bullet.prototype.die = function () {
    if (this.loc.x - this.radius > width) {
      this.isDead = true;
    }
  };

  Bullet.prototype.check = function (block) {
    if (this.loc.x > block.loc.x - this.radius && this.loc.x < block.loc.x +
      block.w + this.radius) {
      if (this.loc.y > block.loc.y - this.radius && this.loc.y < block.loc.y +
        block.h + this.radius) {
        block.isDead = true;
      }
    }
  };

  Bullet.prototype.show = function () {
    noFill();
    strokeWeight(1);
    stroke(30);
    ellipse(this.loc.x, this.loc.y, this.radius * 2, this.radius * 2);
  };

  exports.Block = Block;
  exports.Bullet = Bullet;
})(this);