var stage = null;
var interval = null;
var stage_element = null;
var socket;

function setupGame() {
  /* Event listeners */
  stage_element = document.getElementById("stage");
  stage_element.addEventListener("mousemove", pointWeapon);
  stage_element.addEventListener("click", shootWeapon);
  stage = new Stage(stage_element);
  document.addEventListener("keydown", moveByKey);
  document.addEventListener("keyup", resetByKey);
  document.addEventListener("visibilitychange", clearMoves);

  /* Connect to WebSocket */
  socket = new WebSocket("ws://localhost:3000");
  socket.onopen = function (event) {
    document.addEventListener("keydown", moveByKey);
  };

  socket.onclose = function (event) {
    alert("Server closed!");
  };

  socket.onmessage = function (event) {
    var e = JSON.parse(event.data);
    switch (e.type) {
      case "user":
        stage.cid = e.cid;
        break;
      case "begin":
        stage.actors = [];
        break;
      case "draw":
        stage.draw();
        break;
      case "player":
        stage.addPlayer(
          new Pair(e.x, e.y),
          e.colour,
          e.cid,
          e.health,
          e.ammo,
          e.kills
        );
        stage.actors[stage.actors.length - 1].pointWeapon(e.ex, e.ey);
        break;
      case "ammo":
        stage.addAmmo(new Pair(e.x, e.y));
        break;
      case "obstacle":
        stage.addObstacle(new Pair(e.x, e.y), e.radius);
        break;
      case "bullet":
        stage.addBullet(new Pair(e.x, e.y));
        break;
      case "death":
        if (e.cid == stage.cid) hasLost();
        break;
    }
  };
}

function clearMoves() {
  socket.send(
    JSON.stringify({
      type: "move",
      cid: stage.cid,
      x: 0,
      y: 0,
    })
  );
}

function moveByKey(event) {
  var key = event.key;
  var moveMap = {
    w: { dx: "default", dy: -1 },
    a: { dx: -1, dy: "default" },
    s: { dx: "default", dy: 1 },
    d: { dx: 1, dy: "default" },
  };

  if (key in moveMap) {
    socket.send(
      JSON.stringify({
        type: "move",
        cid: stage.cid,
        x: moveMap[key].dx,
        y: moveMap[key].dy,
      })
    );
  }
}

function resetByKey(event) {
  var key = event.key;
  var moveMap = {
    w: { dx: "default", dy: 0 },
    a: { dx: 0, dy: "default" },
    s: { dx: "default", dy: 0 },
    d: { dx: 0, dy: "default" },
  };

  if (key in moveMap) {
    socket.send(
      JSON.stringify({
        type: "move",
        cid: stage.cid,
        x: moveMap[key].dx,
        y: moveMap[key].dy,
      })
    );
  }
}

function pointWeapon(event) {
  var mousePos = mousePosition(event);
  stage.moveCross(mousePos.x, mousePos.y);
  socket.send(
    JSON.stringify({
      type: "point",
      cid: stage.cid,
      x: mousePos.x,
      y: mousePos.y,
    })
  );
}

function shootWeapon(event) {
  var mousePos = mousePosition(event);
  socket.send(
    JSON.stringify({
      type: "shoot",
      cid: stage.cid,
      x: mousePos.x + stage.offsetX,
      y: mousePos.y + stage.offsetY,
    })
  );
}

function mousePosition(event) {
  var x;
  var y;
  var canvasX = stage_element.offsetLeft;
  var canvasY = stage_element.offsetTop;

  if (event.pageX || event.pageY) {
    x = event.pageX;
    y = event.pageY;
  } else {
    x =
      event.clientX +
      document.body.scrollLeft +
      document.documentElement.scrollLeft;
    y =
      event.clientY +
      document.body.scrollTop +
      document.documentElement.scrollTop;
  }
  x -= canvasX;
  y -= canvasY;
  return new Pair(x, y);
}

/* Leaderboard functions */
function addKill() {
  // Add a kill to profile
  $.ajax({
    method: "PUT",
    url: "/ftd/api/kills/" + profileUser + "/",
    data: {},
  })
    .done(function (data, text_status, jqXHR) {
      console.log(JSON.stringify(data));
      console.log(text_status);
      console.log(jqXHR.status);
    })
    .fail(function (err) {
      console.log(err.status);
      console.log(JSON.stringify(err.responseJSON));
    });
}
function hasLost() {
  alert("You Lost");

  // Add 1 to numDeaths
  $.ajax({
    method: "PUT",
    url: "/ftd/api/deaths/" + profileUser + "/",
    data: {},
  })
    .done(function (data, text_status, jqXHR) {
      console.log(JSON.stringify(data));
      console.log(text_status);
      console.log(jqXHR.status);
    })
    .fail(function (err) {
      console.log(err.status);
      console.log(JSON.stringify(err.responseJSON));
    });
}

///////////////////////////////////////////////////////////////////////////////////////////

// Member management functions Begin

///////////////////////////////////////////////////////////////////////////////////////////

// This is executed when the document is ready (the DOM for this document is loaded)
$(function () {
  // Display leaderboard
  populateLeaderboard();
});

// populate the leaderboard
function populateLeaderboard() {
  $.ajax({
    method: "GET",
    url: "/ftd/api/leaderboard/",
  }).done(function (data) {
    var leaderBoard = "";
    for (i = 0; i < data["leaders"].length; i++) {
      leaderBoard +=
        "<br/>" +
        data["leaders"][i].userName +
        "......" +
        data["leaders"][i].numKills;
    }
    $("#leaderboard").html(leaderBoard);
  });
}

// Switch to game
function toGame(serverNum) {
  sid = serverNum;
  console.log("Sid chosen as #", sid);
  setupGame();
}
