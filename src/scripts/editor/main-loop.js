const ctx = canvas.getContext("2d");

let fps = 0, displayedFps = 0;
global.tick = 0;

function mainLoop() {
  global.tick++,

  rootBlock.update();
  camera.update();

  if(document.hasFocus() || global.tick % 10 === 0 || global.tabDown) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    camera.applyTransforms(ctx);
    rootBlock.renderConnections(ctx, camera);
    rootBlock.render(ctx, camera);
    camera.resetTransforms(ctx);

    if(global.debugEnabled) {
      fps++;

      let currentHistory = actionHandler.setHistory({undo: [], redo: []});
      let lineCount = 1;

      ctx.fillStyle = "gray";
      ctx.textAlign = "right";
      ctx.fillText("Sekoya - Alpha 0.0.2", canvas.width - 10, lineCount++ * 10);
      ctx.fillText("FPS: " + displayedFps, canvas.width - 10, lineCount++ * 10);
      lineCount++;
      ctx.fillText("== HISTORY ==", canvas.width - 10, lineCount++ * 10);

      for(let i = 0; i < currentHistory.undo.length; ++i) {
        if(currentHistory.undo[i]) {
          ctx.fillText(" ("+i+") " + (currentHistory.undo[i].actionName || currentHistory.undo[i][0].actionName), canvas.width - 10, lineCount++ * 10)
        }
      }
      actionHandler.setHistory(currentHistory);
    }

    /// END DEBUG

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
