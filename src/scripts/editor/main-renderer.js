const canvas = document.getElementById("main-canvas");
const ctx = canvas.getContext("2d");

const blockStyle = require(basePath + '/src/scripts/utils/theme-loader.js').blockStyle;

function render() {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, 50, 50);
  requestAnimationFrame(render);
}

module.exports.startRendering = function() {
  render();
}
