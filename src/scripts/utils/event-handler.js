global.mouse = {
  x: 0,
  y: 0,
  canvasX: 0,
  canvasY: 0,
  buttons: {}
};

function setMousePosition(e) {
  var rect = canvas.getBoundingClientRect();
  global.mouse.x = e.clientX;
  global.mouse.y = e.clientY;
  global.mouse.canvasX = e.clientX - rect.left;
  global.mouse.canvasY = e.clientY - rect.top;
}

function setCanvasSize() {
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;
}

module.exports.addEditorEvents = () => {
  window.addEventListener("mousedown", (e) => {
    global.mouse.buttons[e.which] = true;
  });

  window.addEventListener("mouseup", (e) => {
    global.mouse.buttons[e.which] = false;
  });

  window.addEventListener("keydown", (e) => {
    actionHandler.handleKeyDown(e);
  });

  window.addEventListener("keyup", (e) => {
    actionHandler.handleKeyUp(e);
  });


  window.addEventListener("resize", (e) => {
    setCanvasSize();
  });

  window.addEventListener("mousemove", (e) => {
    setMousePosition(e);
  });

  setCanvasSize();
};
