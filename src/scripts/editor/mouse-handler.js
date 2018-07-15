
function setMousePosition(e) {
  var rect = canvas.getBoundingClientRect();
  canvasMousePos = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

window.addEventListener("mousedown", (e) => {
  isMouseDown = true;
});

window.addEventListener("mouseup", (e) => {
  isMouseDown = false;
});

window.addEventListener("mousemove", (e) => {
  setMousePosition(e);
});
