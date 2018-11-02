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
const camera = require(editorFolderPath + "camera.js");
const scrollBars = require(editorFolderPath + "scroll-bars.js");

const tabManager = require(editorFolderPath + "tab-manager.js");

const fs = require('fs');

const STYLE = {
  BLOCKS: themeLoader.blocksStyle,
  LINKS: themeLoader.linkStyles
};

const Block = require(editorFolderPath + "classes/block.js").Block;
const rootBlock = require(editorFolderPath + "classes/block.js").rootBlock;
const selectedBlock = require(editorFolderPath + "classes/block.js").selectedBlock;
const fileManager = require(editorFolderPath + "file-manager.js");

themeLoader.addCSSToCurrentPage();
blockLoader.loadBlocksDefinitions().then(() => {
  require(editorFolderPath + "classes/block.js").init();

  require(editorFolderPath + "display/block-list-display.js").setLeftMenuBlocks(config.defaultBlocksDefinition);
  require(actionsFolderPath + "actions-quick-access.js").registerActions();
  tabManager.init();
  require(editorFolderPath + "main-loop.js").startMainLoop();
});

require(actionsFolderPath + "actions-tab.js").registerActions();
require(actionsFolderPath + "actions-debug.js").registerActions();
require(actionsFolderPath + "actions-block.js").registerActions();
require(actionsFolderPath + "actions-search.js").registerActions();
require(actionsFolderPath + "actions-core.js").registerActions();
require(actionsFolderPath + "actions-file.js").registerActions();
require(actionsFolderPath + "actions-camera.js").registerActions();
require(utilsFolderPath + "event-handler.js").addEditorEvents();
require(editorFolderPath + "quick-access/quick-access-display.js").addEvents();
require(editorFolderPath + "/menus/menu-top-bar.js").setMenu();

if (!localStorage.firstLaunchDone) {
  document.getElementById("about-background").style.display = "block";
}

window.onerror = (msg, script, line) => {
  let errorMessage = (new Date()) + " " + script + ":" + line + " --- " + msg + "\n";

  fs.appendFile('sekoya-errors.log', errorMessage, function(err) {
    if (err) throw err;
  });
};