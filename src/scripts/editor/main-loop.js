const ctx = canvas.getContext("2d");
global.tick = 0;

let fps = 0, displayedFps = 0;

function mainLoop() {
  fps++;
  if(document.hasFocus()) {
    global.tick++,
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // NOTE: It could be an idea to set a fixed update speed in case the renderer is too slow, shouldn't happen but still
    camera.update();
    rootBlock.update();

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
