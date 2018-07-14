const {remote} = require('electron');
const basePath = remote.app.getAppPath();

const renderer = require(basePath + '/src/scripts/editor/main-renderer.js');
const dataManager = require(basePath + '/src/scripts/editor/data-manager.js');
require(basePath + '/src/scripts/utils/theme-loader.js');
require(basePath + '/src/scripts/editor/menu.js').setMenu();
require(basePath + '/src/scripts/editor/menu-block-loader.js').load();


//renderer.setBlocks(currentBlocks);

// Make sure the canvas is always using max space, called on resize
function setCanvasSize() {
  let canvas = document.getElementById("main-canvas");
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;
}

window.addEventListener("resize", () => {
  setCanvasSize();
});

setCanvasSize();
