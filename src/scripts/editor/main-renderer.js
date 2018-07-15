const canvas = document.getElementById("main-canvas");
const ctx = canvas.getContext("2d");

const blocks = require(basePath + '/src/scripts/editor/data-manager.js').getBlocks();

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for(let i = 0; i < blocks.length; ++i) {
    blocks[i].renderConnections(ctx);
    blocks[i].render(ctx);
  }
  requestAnimationFrame(render);
}

module.exports.startRendering = function() {
  render();
}
