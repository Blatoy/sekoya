const canvas = document.getElementById("main-canvas");
const ctx = canvas.getContext("2d");

let blocks = [];

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for(let i = 0; i < blocks.length; ++i) {
    blocks[i].render(ctx);
  }
  requestAnimationFrame(render);
}

module.exports.setBlocks = function(blocks_) {
  blocks = blocks_;
}

module.exports.startRendering = function() {
  render();
}
