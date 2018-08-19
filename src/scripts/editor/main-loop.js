const ctx = canvas.getContext("2d");
global.tick = 0;

let fps = 0, displayedFps = 0;

function mainLoop() {
  fps++;
  rootBlock.update();
  camera.update();

  if(document.hasFocus() || global.tick <= 3) {
    global.tick++,
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    camera.applyTransforms(ctx);
    rootBlock.renderConnections(ctx, camera);
    rootBlock.render(ctx, camera);
    camera.resetTransforms(ctx);

    let currentHistory = actionHandler.setHistory({undo: [], redo: []});
    ctx.fillStyle = "gray";
    ctx.fillText("FPS: " + displayedFps, canvas.width - 50, 10)
    for(let i = 0; i < currentHistory.undo.length; ++i) {
      let s = ctx.measureText(" - " + currentHistory.undo[i].actionName);
      ctx.fillText(" - " + currentHistory.undo[i].actionName, canvas.width - s.width - 10, 18 + i * 18)
    }
    actionHandler.setHistory(currentHistory);
  }
  requestAnimationFrame(mainLoop);
}

module.exports.startMainLoop = function() {

  setInterval(() => {
    displayedFps = fps;
    fps = 0;
  }, 1000);
  mainLoop();
}
