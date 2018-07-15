
function setMousePosition(e) {
  var rect = canvas.getBoundingClientRect();
  mousePos = {
    x: e.clientX,
    y: e.clientY
  };
  canvasMousePos = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

window.addEventListener("mousedown", (e) => {
  mouseButtons[e.which] = true;
});

window.addEventListener("mouseup", (e) => {
  mouseButtons[e.which] = false;
});

window.addEventListener("mousemove", (e) => {
  setMousePosition(e);
});
