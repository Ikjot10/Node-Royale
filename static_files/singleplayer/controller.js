var stage = null;
view = null;
interval = null;
var stage_element = null;
pause_stage = null;

function setupGame() {
  stage_element = document.getElementById("stage");
  stage_element.addEventListener("mousemove", pointWeapon);
  stage_element.addEventListener("click", shootWeapon);
  stage = new Stage(stage_element);
  document.addEventListener("keydown", moveByKey);
  document.addEventListener("keyup", resetByKey);
  document.addEventListener("visibilitychange", clearMoves);

  let HOST = location.origin.replace(/^http/, 'ws')
  let ws = new WebSocket(HOST);

  ws.onmessage = (event) => {
    console.log("SOCKET STATE:", ws.readyState)
    console.log(event.data)
  };
}

function startGame() {
  if (pause_stage != null) {
    stage = pause_stage;
    pause_stage = null;
  }
  interval = setInterval(function () {
    stage.step();
    stage.draw();
  }, 20);
}

function newGame() {
  if (pause_stage != null) startGame();
  setupGame();
}

function pauseGame() {
  clearInterval(interval);
  interval = null;
  pause_stage = stage;
  stage = new Stage(document.getElementById("stage"));
}

function moveByKey(event) {
  var key = event.key;
  var moveMap = {
    w: { dx: stage.player.direction.x, dy: -1 },
    a: { dx: -1, dy: stage.player.direction.y },
    s: { dx: stage.player.direction.x, dy: 1 },
    d: { dx: 1, dy: stage.player.direction.y },
  };

  if (key in moveMap) {
    stage.player.setDirection(moveMap[key].dx, moveMap[key].dy);
  }

  if (key == "p") {
    if (pause_stage != null) startGame();
    else pauseGame();
  }

  if (key == "n") {
    newGame();
  }
}

function resetByKey(event) {
  var key = event.key;
  var moveMap = {
    w: { dx: stage.player.direction.x, dy: 0 },
    a: { dx: 0, dy: stage.player.direction.y },
    s: { dx: stage.player.direction.x, dy: 0 },
    d: { dx: 0, dy: stage.player.direction.y },
  };

  if (key in moveMap) {
    stage.player.setDirection(moveMap[key].dx, moveMap[key].dy);
  }
}

function clearMoves() {
  stage.player.setDirection(0, 0);
}

function pointWeapon(event) {
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

  stage.player.pointWeapon(x, y);
  stage.moveCross(x, y);
}

function shootWeapon(event) {
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

  stage.player.shoot(x + stage.offsetX, y + stage.offsetY);
}
