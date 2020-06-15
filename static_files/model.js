function randint(n) {
  return Math.round(Math.random() * n);
}
function rand(n) {
  return Math.random() * n;
}

class Stage {
  constructor(canvas) {
    this.canvas = canvas;

    this.actors = [];
    this.player = null;

    /* User info*/
    this.health;
    this.ammo;
    this.kills;
    this.cid;

    /* Canvas height & width */
    this.width = canvas.width;
    this.height = canvas.height;

    /* Player visual range */
    this.rangeX = document.getElementById("canvasdiv").clientWidth / 2;
    this.rangeY = document.getElementById("canvasdiv").clientHeight / 2;

    this.waterSize = 200; // Size of water terrain
    this.scaleFactor = 10; // Minimap scale factor
  }

  addActor(actor) {
    this.actors.push(actor);
  }

  addPlayer(position, colour, cid, health, ammo, kills) {
    var player = new Player(this, position, colour);
    this.addActor(player);
    if (cid == this.cid) {
      this.player = player;
      this.health = health;
      this.ammo = ammo;
      this.kills = kills;
    }
  }

  addAmmo(position) {
    this.addActor(new Ammo(position));
  }

  addObstacle(position, radius) {
    this.addActor(new Obstacle(position, radius));
  }

  addBullet(position) {
    this.addActor(new Bullet(position));
  }

  getActor(x, y) {
    for (var i = 0; i < this.actors.length; i++) {
      if (this.actors[i].x == x && this.actors[i].y == y) {
        return this.actors[i];
      }
    }
    return null;
  }

  moveCross(x, y) {
    this.crossX = x;
    this.crossY = y;
  }

  draw() {
    var context = this.canvas.getContext("2d");
    context.resetTransform();
    context.clearRect(0, 0, this.width, this.height);

    context.translate(
      -this.player.x + this.rangeX,
      -this.player.y + this.rangeY
    );

    this.offsetX = this.player.x - this.rangeX;
    this.offsetY = this.player.y - this.rangeY;

    /* Draw terrain */
    context.strokeStyle = "#1f66d1";
    context.lineWidth = this.waterSize;
    context.strokeRect(
      this.waterSize / 2,
      this.waterSize / 2,
      this.width - this.waterSize,
      this.height - this.waterSize
    );

    context.fillStyle = "#918c40";
    context.fillRect(
      this.waterSize,
      this.waterSize,
      this.width - this.waterSize * 2,
      this.height - this.waterSize * 2
    );

    /* Draw all actors within player's visual range */
    for (var i = 0; i < this.actors.length; i++) {
      var distVector = this.actors[i].position.vecSub(this.player.position);
      if (
        Math.abs(distVector.x) <= this.rangeX + 50 &&
        Math.abs(distVector.y) <= this.rangeY + 50
      )
        this.actors[i].draw(context);
    }

    /* Display player stats */
    context.font = "20px Comic Sans MS";
    context.fillStyle = "white";
    context.fillText(
      "Health: " + this.health,
      this.offsetX + 20,
      this.offsetY + 30
    );
    context.fillText(
      "Ammo: " + this.ammo,
      this.offsetX + 20,
      this.offsetY + 60
    );
    context.fillText(
      "Kills: " + this.kills,
      this.offsetX + 20,
      this.offsetY + 90
    );

    /* Display crosshair */
    context.fillStyle = "red";
    context.beginPath();
    context.arc(
      this.offsetX + this.crossX,
      this.offsetY + this.crossY,
      3,
      0,
      2 * Math.PI,
      false
    );
    context.fill();

    this.drawMinimap(context);
  }

  drawMinimap(context) {
    context.strokeStyle = "rgba(22,75,156,0.7)"; //#164b9c
    var mapWidth = this.width / this.scaleFactor;
    var mapHeight = this.height / this.scaleFactor;
    var miniWater = this.waterSize / this.scaleFactor; //Minimap water width
    context.lineWidth = miniWater;
    context.strokeRect(
      this.offsetX + 40 + miniWater / 2,
      this.offsetY + 450 + miniWater / 2,
      mapWidth - miniWater,
      mapHeight - miniWater
    );

    context.fillStyle = "rgba(179,175,120,0.7)"; //#918c40
    context.fillRect(
      this.offsetX + 40 + miniWater,
      this.offsetY + 450 + miniWater,
      mapWidth - 2 * miniWater,
      mapHeight - 2 * miniWater
    );

    for (var i = 0; i < this.actors.length; i++) {
      var x = this.offsetX + 40 + (this.actors[i].x / this.width) * mapWidth;
      var y = this.offsetY + 450 + (this.actors[i].y / this.height) * mapHeight;
      var radius = (this.actors[i].radius / this.scaleFactor) * 2.5;
      context.fillStyle = this.actors[i].colour;
      if (
        this.actors[i] instanceof Obstacle ||
        this.actors[i] instanceof Ammo
      ) {
        context.fillRect(x, y, radius, radius);
      } else if (this.actors[i] instanceof Player) {
        context.beginPath();
        context.arc(x, y, radius, 0, 2 * Math.PI, false);
        context.fill();
      }
    }
  }
}

class Pair {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  vecSub(other) {
    return new Pair(this.x - other.x, this.y - other.y);
  }
}

class Actor {
  constructor(position, colour, radius) {
    this.colour = colour;
    this.position = position;
    this.radius = radius;
    this.intPosition();
  }

  intPosition() {
    this.x = Math.round(this.position.x);
    this.y = Math.round(this.position.y);
  }
}

class Ball extends Actor {
  constructor(position, colour, radius) {
    super(position, colour, radius);
  }

  draw(context) {
    context.fillStyle = this.colour;
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    context.fill();
  }
}

class Obstacle extends Actor {
  constructor(position, radius) {
    super(position, "#78552f", radius);
  }

  draw(context) {
    context.fillStyle = this.colour;
    var x = this.x - this.radius;
    var y = this.y - this.radius;
    var width = 2 * this.radius;
    context.fillRect(x, y, width, width);

    context.strokeStyle = "black";
    context.lineWidth = 2;
    context.strokeRect(x, y, width, width);
  }
}

class Ammo extends Actor {
  constructor(position) {
    super(position, "green", 10);
  }

  draw(context) {
    context.fillStyle = this.colour;
    var x = this.x - this.radius;
    var y = this.y - this.radius;
    var width = 2 * this.radius;
    context.fillRect(x, y, width, width);

    context.lineWidth = 2;
    context.strokeStyle = "black";
    context.strokeRect(x, y, width, width);
  }
}

class Player extends Ball {
  constructor(stage, position, colour) {
    super(position, colour, 25);
    this.stage = stage;
    this.offset = new Pair(
      this.x - this.stage.rangeX,
      this.y - this.stage.rangeY
    );
  }

  pointWeapon(x, y) {
    this.ex = x;
    this.ey = y;
  }

  draw(context) {
    super.draw(context);
    /* Get turret position for drawing */
    var dx = this.offset.x + this.ex - this.x;
    var dy = this.offset.y + this.ey - this.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    var t = this.radius + 20;
    var ratio = distance / t;
    var tx = dx / ratio;
    var ty = dy / ratio;

    context.strokeStyle = this.colour;
    context.beginPath();
    context.moveTo(this.x, this.y);
    context.lineWidth = 10;
    context.lineTo(this.x + tx, this.y + ty);
    context.stroke();
    context.lineWidth = 2;
  }
}

class Bullet extends Ball {
  constructor(position) {
    super(position, "black", 5);
  }
}
