const ctx = canvas.getContext("2d");
global.tick = 0;

function mainLoop() {
  global.tick++,
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // NOTE: It could be an idea to set a fixed update speed in case the renderer is too slow, shouldn't happen but still
  camera.update();
  rootBlock.update();

  camera.applyTransforms(ctx);
  rootBlock.render(ctx);
  rootBlock.renderConnections(ctx);
  camera.resetTransforms(ctx);
  requestAnimationFrame(mainLoop);
}

module.exports.startMainLoop = function() {
  mainLoop();
}
