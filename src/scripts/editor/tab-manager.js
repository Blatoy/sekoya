const Tab = require(editorFolderPath + "classes/tab.js");
const tabDisplay = require(editorFolderPath + "display/tab-display.js");

const tabs = [];
const DEFAULT_TAB_NAME = "untitled";
const DEFAULT_TAB_EXTENSION = ".xml";

let selectedTabIndex = 0;

function init() {
  newTab();
}

function switchTab(direction = 0) {
  selectTab(selectedTabIndex + direction);
}

function newTab(name = "", blocks = [], fileLocation = "", selected = true) {
  if(name === "") {
    name = DEFAULT_TAB_NAME + tabs.length + DEFAULT_TAB_EXTENSION;
  }

  let tab = new Tab(name, blocks, fileLocation, selected);

  if(blocks.length === 0) {
    // blockManager.initTab(tab);
  }

  tabs.push(tab);

  if(selected) {
    selectTab(tabs.length - 1);
  }
  else {
    // Display is handled in selectTab otherwise
    notifyTabDisplayer();
  }
}

function closeCurrentTab() {
  closeTab(selectedTabIndex);
}

function renameTab(index, name) {
  tabs[index].setName(name);
  notifyTabDisplayer();
}

function closeTab(index = 0) {
  if(tabs.length > 1) {
    tabs.splice(index, 1);
    if(selectedTabIndex === index) {
      if(index >= tabs.length) {
        selectTab(tabs.length - 1);
      }
      else {
        selectTab(index);
      }
    }
    else {
      if(index < selectedTabIndex) {
        selectedTabIndex--;
      }
      notifyTabDisplayer();
    }
  }

}

function openTab() {
  // Open file dialog, pr
}

function selectTab(index) {
  // Allow cycling using switchTab
  if(index > tabs.length - 1) {
    index = 0;
  }
  else if(index < 0){
    index = tabs.length - 1;
  }

  let previousSelectedTab = tabs[selectedTabIndex];
  let newSelectedTab = tabs[index];

  if(previousSelectedTab) {
    previousSelectedTab.setSelected(false);
    previousSelectedTab.cameraState = {x: camera.getPosition().x, y: camera.getPosition().y, scaling: camera.getScaling()};
    previousSelectedTab.history = actionHandler.setHistory(newSelectedTab.history);

    let selectedBlock = Block.getSelectedBlock();
    if(selectedBlock && selectedBlock.parent) {
      previousSelectedTab.selectedBlock = selectedBlock;
    }
  }


  selectedTabIndex = index;

  camera.setPosition(newSelectedTab.cameraState.x, newSelectedTab.cameraState.y);
  camera.setScaling(newSelectedTab.cameraState.scaling);

  newSelectedTab.setSelected(true);
  rootBlock.children = newSelectedTab.blocks;

  if(newSelectedTab.selectedBlock) {
    newSelectedTab.selectedBlock.setSelected();
  }

  // blockManager.setCurrentTab();


  notifyTabDisplayer();
}

function notifyTabDisplayer() {
  tabDisplay.refreshView(tabs, selectTab, closeTab, renameTab);
}

module.exports.switchTab = switchTab;
module.exports.newTab = newTab;
module.exports.closeCurrentTab = closeCurrentTab;
module.exports.closeTab = closeTab;
module.exports.init = init;
