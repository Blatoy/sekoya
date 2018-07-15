const {remote} = require('electron');
const basePath = remote.app.getAppPath();

let canvasMousePos = {x: 0, y: 0}, isMouseDown = false;
let canvas = document.getElementById("main-canvas");

const dataManager = require(basePath + '/src/scripts/editor/data-manager.js');
require(basePath + '/src/scripts/editor/main-renderer.js').startRendering();
require(basePath + '/src/scripts/editor/main-updater.js').startUpdating();
require(basePath + '/src/scripts/utils/theme-loader.js');
require(basePath + '/src/scripts/editor/menu.js').setMenu();
require(basePath + '/src/scripts/editor/menu-block-loader.js').load();
require(basePath + '/src/scripts/editor/mouse-handler.js');

// Make sure the canvas is always using max space, called on resize
function setCanvasSize() {
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;
}

window.addEventListener("resize", () => {
  setCanvasSize();
});

setCanvasSize();
