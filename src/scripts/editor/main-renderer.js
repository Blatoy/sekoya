const canvas = document.getElementById("main-canvas");
const ctx = canvas.getContext("2d");

const blocks = require(basePath + '/src/scripts/editor/data-manager.js').getBlocks();

const actionHandler = require(basePath + "/src/scripts/utils/action-handler.js");

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for(let i = 0; i < blocks.length; ++i) {
    blocks[i].renderConnections(ctx, false, canvasMousePos);
    blocks[i].render(ctx, false, canvasMousePos);
  }

  requestAnimationFrame(render);
}

module.exports.startRendering = function() {
  render();
}
