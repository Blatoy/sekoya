
const remote = require("electron").remote;
const basePath = remote.app.getAppPath();

const config = require(basePath + "/config/general.json");
const canvas = document.getElementById("main-canvas");
const canvasMousePos = {x: 0, y: 0}, mousePos = {x: 0, y: 0}, mouseButtons = [false, false, false];

const editorFolderPath = basePath + "/src/scripts/editor/";
const utilsFolderPath = basePath + "/src/scripts/utils/";
const actionsFolderPath = basePath + "/src/scripts/editor/actions/";

const actionHandler = require(basePath + "/src/scripts/utils/action-handler.js");
const themeLoader = require(basePath + '/src/scripts/utils/theme-loader.js');
const blockLoader = require(editorFolderPath + "block-loader.js");
const tabManager = require(editorFolderPath + "tab-manager.js");
const camera = require(editorFolderPath + "camera.js");

const STYLE = {BLOCKS: themeLoader.blocksStyle, LINKS: themeLoader.linkStyles};

const {Block, rootBlock, selectedBlock} = require(editorFolderPath + "classes/block.js");

// TODO: Load real menu
remote.Menu.setApplicationMenu(null);

themeLoader.addCSSToCurrentPage();
tabManager.init();
blockLoader.loadBlockDefinitions(() => {
  require(editorFolderPath + "display/block-list-display.js").addBlocksToLeftMenu();

  // DEBUG

  let r = new Block({type: "root", name: "root"});
  let c = new Block(blockLoader.getBlockDefinitions().test["1"], r);
  let d= new Block(blockLoader.getBlockDefinitions().test["2"], r);
  new Block(blockLoader.getBlockDefinitions().test["3"], r);
  new Block(blockLoader.getBlockDefinitions().condition.branch);
  new Block(blockLoader.getBlockDefinitions().test["1"], c);
  new Block(blockLoader.getBlockDefinitions().test["2"], c);
  new Block(blockLoader.getBlockDefinitions().test["3"], c);
  new Block(blockLoader.getBlockDefinitions().test["4"], c);
  c.getRoot().autoLayout()
});

require(actionsFolderPath + "actions-tab.js").registerActions();
require(actionsFolderPath + "actions-debug.js").registerActions();
require(actionsFolderPath + "actions-block.js").registerActions();
require(actionsFolderPath + "actions-core.js").registerActions();
require(actionsFolderPath + "actions-file.js").registerActions();
require(actionsFolderPath + "actions-quick-access.js").registerActions();
require(actionsFolderPath + "actions-camera.js").registerActions();
require(utilsFolderPath + "event-handler.js").addEditorEvents();
require(editorFolderPath + "quick-access/quick-access-display.js").addEvents();
require(editorFolderPath + "main-loop.js").startMainLoop();


/*const {remote} = require("electron");
const basePath = remote.app.getAppPath();
const config = require(basePath + "/config/general.json");
const actionHandler = require(basePath + "/src/scripts/utils/action-handler.js");

let canvasMousePos = {x: 0, y: 0}, mousePos = {x: 0, y: 0}, mouseButtons = [false, false, false];
let canvas = document.getElementById("main-canvas");

const dataManager = require(basePath + '/src/scripts/editor/data-manager.js');
require(basePath + '/src/scripts/editor/main-renderer.js').startRendering();
require(basePath + '/src/scripts/editor/main-updater.js').startUpdating();
require(basePath + '/src/scripts/utils/theme-loader.js');
require(basePath + "/src/scripts/editor/menu.js").setMenu();
require(basePath + '/src/scripts/editor/menu-block-loader.js').load();
require(basePath + '/src/scripts/editor/mouse-handler.js');
require(basePath + '/src/scripts/editor/quick-access-bar.js');

// Make sure the canvas is always using max space, called on resize
function setCanvasSize() {

}

window.addEventListener("resize", () => {
  setCanvasSize();
});

setCanvasSize();

if(config.playFrenchSoundOnError) {
  let errorAudio = new Audio();
  errorAudio.src = "https://orikaru.net/dl/cul.mp3";
  window.onerror = () => {
    errorAudio.play();
  };
}
*/

if(config.playFrenchSoundOnError) {
  let errorAudio = new Audio();
  errorAudio.src = "https://orikaru.net/dl/cul.mp3";
  window.onerror = () => {
    errorAudio.play();
  };
}
