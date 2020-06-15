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

    /* Canvas height & width */
    this.width = canvas.width;
    this.height = canvas.height;

    /* Player visual range */
    this.rangeX = document.getElementById("canvasdiv").clientWidth / 2;
    this.rangeY = document.getElementById("canvasdiv").clientHeight / 2;

    this.waterSize = 200; // Size of water terrain
    this.scaleFactor = 10; // Minimap scale factor

    /* Randomize player spawn location */
    var posX = Math.floor(Math.random() * (this.width - 100) + 100);
    var posY = Math.floor(Math.random() * (this.height - 100) + 100);
    var playerPos = new Pair(Math.floor(posX), Math.floor(posY));
    this.addPlayer(new Player(this, playerPos));

    /* Add enemies */
    this.numEnemies = 5;
    var total = this.numEnemies;
    while (total > 0) {
      var x = Math.floor(Math.random() * this.width);
      var y = Math.floor(Math.random() * this.height);
      var position = new Pair(x, y);
      var enemy = new Enemy(this, position);
      if (enemy.getCloseActors(5).length == 0) {
        this.addActor(enemy);
        total--;
      }
    }

    /* Add obstacles */
    var total = 10;
    while (total > 0) {
      var x = Math.floor(Math.random() * this.width);
      var y = Math.floor(Math.random() * this.height);
      var position = new Pair(x, y);
      var obs = new Obstacle(this, position);
      if (obs.getCloseActors(5).length == 0) {
        this.addActor(obs);
        total--;
      }
    }

    /* Add ammo */
    var total = 10;
    while (total > 0) {
      var x = Math.floor(Math.random() * this.width);
      var y = Math.floor(Math.random() * this.height);
      var position = new Pair(x, y);
      var ammo = new Ammo(this, position);
      if (ammo.getCloseActors(5).length == 0) {
        this.addActor(ammo);
        total--;
      }
    }
  }

  addPlayer(player) {
    this.addActor(player);
    this.player = player;
  }

  removePlayer() {
    this.removeActor(this.player);
    this.player = null;
    alert("You lost.");
  }

  addActor(actor) {
    this.actors.push(actor);
  }

  removeActor(actor) {
    var index = this.actors.indexOf(actor);
    if (index != -1) {
      if (this.actors[index] instanceof Enemy) this.numEnemies--;
      this.actors.splice(index, 1);
    }

    if (this.numEnemies == 0 && this.player.health > 0) {
      alert("You won!");
    }
  }

  /* Move crosshair location */
  moveCross(x, y) {
    this.crossX = x;
    this.crossY = y;
  }

  step() {
    for (var i = 0; i < this.actors.length; i++) {
      if (this.actors[i].step()) {
        if (this.actors[i] instanceof Player) {
          this.removePlayer();
          return;
        }
        this.removeActor(this.actors[i]);
      }
    }
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

    /* Draw all actors within player's range */
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
      "Health: " + this.player.health,
      this.offsetX + 20,
      this.offsetY + 30
    );
    context.fillText(
      "Ammo: " + this.player.ammo,
      this.offsetX + 20,
      this.offsetY + 60
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
    context.strokeStyle = "rgba(22,75,156,0.7)";
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

    context.fillStyle = "rgba(179,175,120,0.7)";
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
      } else if (
        this.actors[i] instanceof Enemy ||
        this.actors[i] instanceof Player
      ) {
        context.beginPath();
        context.arc(x, y, radius, 0, 2 * Math.PI, false);
        context.fill();
      }
    }
  }

  getActor(x, y) {
    for (var i = 0; i < this.actors.length; i++) {
      if (this.actors[i].x == x && this.actors[i].y == y) {
        return this.actors[i];
      }
    }
    return null;
  }
}

class Pair {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  normalize() {
    var magnitude = Math.sqrt(this.x * this.x + this.y * this.y);
    this.x = this.x / magnitude;
    this.y = this.y / magnitude;
  }

  hyp() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  vecSub(other) {
    return new Pair(this.x - other.x, this.y - other.y);
  }
}

class Actor {
  constructor(stage, position, colour, radius) {
    this.stage = stage;
    this.colour = colour;
    this.position = position;
    this.radius = radius;
    this.intPosition();
  }

  intPosition() {
    this.x = Math.round(this.position.x);
    this.y = Math.round(this.position.y);
  }

  isClose(other, delta) {
    var distance = this.position.vecSub(other.position).hyp();
    return distance <= this.radius + other.radius + delta;
  }

  getCloseActors(delta) {
    var closeActors = [];
    for (var i in this.stage.actors) {
      var other = this.stage.actors[i];
      if (other == this) continue;
      else if (this.isClose(other, delta)) closeActors.push(other);
    }
    return closeActors;
  }
}

class Obstacle extends Actor {
  constructor(stage, position) {
    super(stage, position, "#78552f", 40);
    this.health = 4;
  }

  step() {
    this.radius = 10 * this.health;
    if (this.health <= 0) {
      return true;
    }
    return false;
  }

  draw(context) {
    context.fillStyle = this.colour;
    var x = this.x - this.radius;
    var y = this.y - this.radius;
    var width = 2 * this.radius;
    context.fillRect(x, y, width, width);
    context.strokeStyle = "black";
    context.strokeRect(x, y, width, width);
  }
}

class Ammo extends Actor {
  constructor(stage, position) {
    super(stage, position, "green", 10);
  }

  step() {
    var closeActors = this.getCloseActors(0);
    for (var i in closeActors) {
      if (closeActors[i] instanceof Player) {
        closeActors[i].ammo += 10;
        closeActors[i].health += 10;
        return true;
      }
    }
    return false;
  }

  draw(context) {
    context.fillStyle = this.colour;
    var x = this.x - this.radius;
    var y = this.y - this.radius;
    var width = 2 * this.radius;
    context.fillRect(x, y, width, width);
    context.strokeStyle = "black";
    context.strokeRect(x, y, width, width);
  }
}

class Ball extends Actor {
  constructor(stage, position, velocity, colour, radius) {
    super(stage, position, colour, radius);
    this.velocity = velocity;
  }

  headTo(position) {
    this.velocity.x = position.x - this.position.x;
    this.velocity.y = position.y - this.position.y;
    this.velocity.normalize();
  }

  draw(context) {
    context.fillStyle = this.colour;
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    context.fill();
  }
}

class Bullet extends Ball {
  constructor(stage, position, range, target) {
    super(stage, position, new Pair(0, 0), "black", 5);
    this.steps = 0;
    this.range = range;
    this.headTo(target);
  }

  headTo(target) {
    super.headTo(target);
    this.velocity.x = this.velocity.x * 15;
    this.velocity.y = this.velocity.y * 15;
  }

  step() {
    if (this.steps > this.range) {
      return true;
    }

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.intPosition();

    /* Bullet collisions with obstacles & players */
    var closeActors = this.getCloseActors(0);
    for (var i in closeActors) {
      if (
        closeActors[i] instanceof Obstacle ||
        closeActors[i] instanceof Enemy
      ) {
        closeActors[i].health--;
        this.steps = this.range;
      }
    }

    this.steps++;
    return false;
  }
}

class Player extends Ball {
  constructor(stage, position) {
    super(stage, position, new Pair(4, 4), "red", 25);
    this.health = 50;
    this.range = 20;
    this.ammo = 50;
    this.direction = new Pair(0, 0);
    this.speed = new Pair(0, 0);
  }

  step() {
    if (this.health <= 0) {
      return true;
    }

    var newX =
      this.position.x + this.direction.x * (this.velocity.x - this.speed.x);
    var newY =
      this.position.y + this.direction.y * (this.velocity.y - this.speed.y);

    /* Out-of-bounds detection */
    if (
      newX < 0 ||
      newX > this.stage.width ||
      newY < 0 ||
      newY > this.stage.height
    ) {
      return false;
    }

    /* Set speed based on terrain */
    if (
      newX < this.stage.waterSize ||
      newX > this.stage.width - this.stage.waterSize ||
      newY < this.stage.waterSize ||
      newY > this.stage.height - this.stage.waterSize
    ) {
      this.speed = new Pair(2, 2);
    } else {
      this.speed = new Pair(0, 0);
    }

    /* Collision detection */
    for (var i in this.stage.actors) {
      var newPosition = new Pair(newX, newY);
      var other = this.stage.actors[i];
      if (other == this) continue;
      var distance = newPosition.vecSub(other.position).hyp();
      if (distance <= this.radius + other.radius) {
        if (other instanceof Obstacle) {
          return false;
        }
      }
    }

    this.position.x = newX;
    this.position.y = newY;
    this.intPosition();

    return false;
  }

  setDirection(dx, dy) {
    this.direction.x = dx;
    this.direction.y = dy;
  }

  /* Set mouse location */
  pointWeapon(x, y) {
    this.ex = x;
    this.ey = y;
  }

  shoot(x, y) {
    if (this.ammo == 0) return;

    /* Initialize bullet to be fired */
    var bulletPos = new Pair(this.x + this.tx, this.y + this.ty);
    var bullet = new Bullet(this.stage, bulletPos, this.range, new Pair(x, y));

    this.ammo--;
    this.stage.addActor(bullet);
  }

  draw(context) {
    super.draw(context);
    /* Get turret position for drawing */
    var dx = this.stage.offsetX + this.ex - this.x;
    var dy = this.stage.offsetY + this.ey - this.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    var t = this.radius + 20;
    var ratio = distance / t;
    this.tx = dx / ratio;
    this.ty = dy / ratio;

    context.strokeStyle = "red";
    context.beginPath();
    context.moveTo(this.x, this.y);
    context.lineWidth = 10;
    context.lineTo(this.x + this.tx, this.y + this.ty);
    context.stroke();
    context.lineWidth = 2;
  }
}

class Enemy extends Ball {
  constructor(stage, position) {
    super(stage, position, new Pair(1, 1), "grey", 20);
    this.health = 10;
    this.hostile = false;
  }

  step() {
    if (this.health <= 0) {
      return true;
    }

    /* AI */
    if (this.isClose(stage.player, 250)) {
      this.headTo(stage.player.position);
      this.hostile = true;
      if (this.isClose(stage.player, 0)) {
        this.stage.player.health--;
      }
    } else {
      this.hostile = false;
    }

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    /* Bounce off the walls */
    if (this.position.x < 0) {
      this.position.x = 0;
      this.velocity.x = Math.abs(this.velocity.x);
    }
    if (this.position.x > this.stage.width) {
      this.position.x = this.stage.width;
      this.velocity.x = -Math.abs(this.velocity.x);
    }
    if (this.position.y < 0) {
      this.position.y = 0;
      this.velocity.y = Math.abs(this.velocity.y);
    }
    if (this.position.y > this.stage.height) {
      this.position.y = this.stage.height;
      this.velocity.y = -Math.abs(this.velocity.y);
    }
    this.intPosition();
    return false;
  }

  draw(context) {
    super.draw(context);
    if (this.hostile) {
      context.fillStyle = "yellow";
      context.font = "50px Comic Sans MS";
      context.fillText("!", this.x, this.y);
    }
  }
}
