'use strict';

const express = require('express');
var process = require('process');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes');

const { Server } = require('ws');

const PORT = process.env.PORT || 3000;
const server = express()
  .use('/', express.static('static_files/'))
  .use(cookieParser())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .use('/', routes)
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new Server({ server });

/******************** SOCKET CODE ********************/
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
    this.deaths = [];

    /* Canvas height & width */
    this.width = 3000;
    this.height = 1600;

    /* Player visual range */
    this.rangeX = 1100 / 2;
    this.rangeY = 650 / 2;

    this.waterSize = 200; // Size of water terrain
    this.scaleFactor = 10; // Minimap scale factor

    /* Add obstacles */
    var total = 15;
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
    var total = 15;
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

  addActor(actor) {
    this.actors.push(actor);
  }

  addPlayer(cid) {
    var posX = Math.floor(Math.random() * (this.width - 100) + 100);
    var posY = Math.floor(Math.random() * (this.height - 100) + 100);
    var playerPos = new Pair(Math.floor(posX), Math.floor(posY));
    var player = new Player(this, playerPos, cid);

    while (player.getCloseActors(5).length > 0) {
      posX = Math.floor(Math.random() * (this.width - 100) + 100);
      posY = Math.floor(Math.random() * (this.height - 100) + 100);
      playerPos = new Pair(Math.floor(posX), Math.floor(posY));
      player = new Player(this, playerPos, cid);
    }

    /* Randomize player colour */
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    var colour = "rgba(" + r + "," + g + "," + b + ",1)";
    player.colour = colour;
    this.addActor(player);
  }

  getActor(x, y) {
    for (var i = 0; i < this.actors.length; i++) {
      if (this.actors[i].x == x && this.actors[i].y == y) {
        return this.actors[i];
      }
    }
    return null;
  }

  getPlayer(cid) {
    for (var i = 0; i < this.actors.length; i++) {
      if (this.actors[i] instanceof Player) {
        if (this.actors[i].cid == cid) return this.actors[i];
      }
    }
    return null;
  }

  removePlayer() {
    this.removeActor(this.player);
    this.player = null;
    alert("You lost.");
  }

  removeActor(actor) {
    var index = this.actors.indexOf(actor);
    if (index != -1) {
      if (this.actors[index] instanceof Player)
        this.deaths.push(this.actors[index]);
      this.actors.splice(index, 1);
    }
  }

  step() {
    for (var i = 0; i < this.actors.length; i++) {
      if (this.actors[i].step()) {
        this.removeActor(this.actors[i]);
      }
    }
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

  getCloseActors(delta) {
    var closeActors = [];
    for (var i in this.stage.actors) {
      var other = this.stage.actors[i];
      if (other == this) continue;
      var distance = this.position.vecSub(other.position).hyp();
      if (distance <= this.radius + other.radius + delta) {
        closeActors.push(other);
      }
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
}

class Player extends Ball {
  constructor(stage, position, cid) {
    super(stage, position, new Pair(4, 4), "red", 25);
    this.cid = cid;
    this.health = 10;
    this.ammo = 50;
    this.kills = 0;

    this.range = 20;
    this.direction = new Pair(0, 0);
    this.speed = new Pair(0, 0);

    this.ex = this.x;
    this.ey = this.y;
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

  //Set mouse location
  pointWeapon(x, y) {
    this.ex = x;
    this.ey = y;
  }

  shoot(x, y) {
    if (this.ammo == 0) return;

    /* Initialize bullet to be fired */
    var bulletPos = new Pair(this.x, this.y);
    var bullet = new Bullet(
      this.stage,
      bulletPos,
      this.range,
      new Pair(x, y),
      this.cid
    );

    this.ammo--;
    this.stage.addActor(bullet);
  }
}

class Bullet extends Ball {
  constructor(stage, position, range, target, cid) {
    super(stage, position, new Pair(0, 0), "black", 5);
    this.cid = cid;
    this.steps = 0;
    this.range = range;
    this.headTo(target);
  }

  headTo(target) {
    super.headTo(target);
    this.velocity.x = this.velocity.x * 15;
    this.velocity.y = this.velocity.y * 15;
    this.step();
    this.steps = 0;
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
      if (closeActors[i] instanceof Obstacle) {
        closeActors[i].health--;
        this.steps = this.range;
      }

      if (closeActors[i] instanceof Player) {
        if (closeActors[i].cid != this.cid) {
          closeActors[i].health--;
          this.steps = this.range;
          if (closeActors[i].health <= 0) {
            stage.getPlayer(this.cid).kills++;
          }
        }
      }
    }

    this.steps++;
    return false;
  }
}

/******************************* Websocket & Stage Setup *******************************/

var stage = new Stage();
var cid = 0; // Client ID, to keep track of clients

var interval = setInterval(function () {
  stage.step();
  /* Send all current actors to new connection */
  wss.broadcast(
    JSON.stringify({
      type: "begin",
    })
  );

  var actor;
  var type;
  for (var i = 0; i < stage.actors.length; i++) {
    actor = stage.actors[i];
    if (actor instanceof Ammo) type = "ammo";
    else if (actor instanceof Obstacle) type = "obstacle";
    else if (actor instanceof Bullet) type = "bullet";
    else {
      type = "player";
      wss.broadcast(
        JSON.stringify({
          type: type,
          cid: actor.cid,
          x: actor.x,
          y: actor.y,
          colour: actor.colour,
          health: actor.health,
          kills: actor.kills,
          ammo: actor.ammo,
          ex: actor.ex,
          ey: actor.ey,
        })
      );
      continue;
    }

    wss.broadcast(
      JSON.stringify({
        type: type,
        x: actor.x,
        y: actor.y,
        radius: actor.radius,
      })
    );
  }

  for (var i = 0; i < stage.deaths.length; i++) {
    wss.broadcast(
      JSON.stringify({
        type: "death",
        cid: stage.deaths[i].cid,
      })
    );
  }
  stage.deaths = []; // Clear player deaths

  wss.broadcast(
    JSON.stringify({
      type: "draw",
    })
  );
}, 20);

wss.on("close", function () {
  console.log("disconnected");
});

wss.broadcast = function (message) {
  for (let ws of this.clients) {
    ws.send(message);
  }
};

wss.on("connection", function (ws) {
  /* Assign client ID to new connection */
  stage.addPlayer(cid);
  ws.send(
    JSON.stringify({
      type: "user",
      cid: cid,
    })
  );

  /* Send all current actors to new connection */
  var actor;
  var type;
  for (var i = 0; i < stage.actors.length - 1; i++) {
    actor = stage.actors[i];
    if (actor instanceof Ammo) type = "ammo";
    else if (actor instanceof Obstacle) type = "obstacle";
    else if (actor instanceof Bullet) type = "bullet";
    else {
      ws.send(
        JSON.stringify({
          type: type,
          cid: actor.cid,
          x: actor.x,
          y: actor.y,
          colour: actor.colour,
          health: actor.health,
          ammo: actor.ammo,
        })
      );
      continue;
    }

    ws.send(
      JSON.stringify({
        type: type,
        x: actor.x,
        y: actor.y,
        radius: actor.radius,
      })
    );
  }

  ws.send(
    JSON.stringify({
      type: "draw",
    })
  );

  cid++; // Increment cid to make IDs unique

  ws.on("message", function (message) {
    var e = JSON.parse(message);
    switch (e.type) {
      case "move":
        var player = stage.getPlayer(e.cid);
        var x;
        var y;
        if (e.x == "default") x = player.direction.x;
        else x = e.x;
        if (e.y == "default") y = player.direction.y;
        else y = e.y;
        player.setDirection(x, y);
        break;
      case "shoot":
        stage.getPlayer(e.cid).shoot(e.x, e.y);
        break;
      case "point":
        stage.getPlayer(e.cid).pointWeapon(e.x, e.y);
        break;
    }
    wss.broadcast(message);
  });
});
