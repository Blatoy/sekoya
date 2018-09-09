const remote = require("electron").remote;
const basePath = remote.app.getAppPath();

const config = require(basePath + "/config/general.json");
const canvas = document.getElementById("main-canvas");

const editorFolderPath = basePath + "/src/scripts/editor/";
const utilsFolderPath = basePath + "/src/scripts/utils/";
const actionsFolderPath = basePath + "/src/scripts/editor/actions/";

const actionHandler = require(basePath + "/src/scripts/utils/action-handler.js");
const themeLoader = require(basePath + '/src/scripts/utils/theme-loader.js');
const blockLoader = require(editorFolderPath + "block-loader.js");
const tabManager = require(editorFolderPath + "tab-manager.js");
const fileManager = require(editorFolderPath + "file-manager.js");
const camera = require(editorFolderPath + "camera.js");

const fs = require('fs');

const STYLE = {
  BLOCKS: themeLoader.blocksStyle,
  LINKS: themeLoader.linkStyles
};

const {
  Block,
  rootBlock,
  selectedBlock
} = require(editorFolderPath + "classes/block.js");

themeLoader.addCSSToCurrentPage();
blockLoader.loadBlockDefinitions(() => {
  require(editorFolderPath + "display/block-list-display.js").addBlocksToLeftMenu();
  tabManager.init();
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
require(editorFolderPath + "/menus/menu-top-bar.js").setMenu();
// It's not really planned to add the context menu back because right click is
// already used to link blocks
// require(editorFolderPath + "/menus/menu-context.js").setMenu();

window.onerror = (msg, script, line) => {
  let errorMessage = "[" + script + ":" + line +"] " + msg + "\n";

  fs.appendFile('sekoya-errors.log', errorMessage, function (err) {
    if (err) throw err;
  });
};
