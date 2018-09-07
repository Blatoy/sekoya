const Tab = require(editorFolderPath + "classes/tab.js");
const tabDisplay = require(editorFolderPath + "display/tab-display.js");

const {
  dialog
} = require('electron').remote;

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
  if (name === "") {
    name = DEFAULT_TAB_NAME + tabs.length + DEFAULT_TAB_EXTENSION;
  }

  let tab = new Tab(name, blocks, fileLocation, selected);

  if (blocks.length === 0) {
    // blockManager.initTab(tab);
  }

  tabs.push(tab);

  if (selected) {
    selectTab(tabs.length - 1);
  } else {
    // Display is handled in selectTab otherwise
    notifyTabDisplayer();
  }

  if (!fileLocation) {
    if (config.defaultBlock) {
      new Block(blockLoader.getDefinitionByName(config.defaultBlock));
    }
    rootBlock.autoLayout(true);
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
  if(!tabs[index].saved) {
    switch(dialog.showMessageBox({
      type: "question",
      buttons: ["Save", "Discard changes", "Cancel"],
      title: "You have unsaved changes",
      message: "Your changes will be lost if you close this without saving, proceed?"
    })) {
      case 0:
        fileManager.save(tabs[index], tabs[index].getFileLocation(), () => {
          console.log("Callbaked");
          closeTab(index)
        });
        return false;
        break;
      case 1:
        // Close anyway
        break;
      case 2:
      return false;
        break;
    }
  }
  if (tabs.length > 1) {
    if (selectedTabIndex === index) {
      if (index >= tabs.length - 1) {
        selectTab(tabs.length - 2);
      } else {
        selectTab(index + 1);
        selectedTabIndex--;
      }
    } else {
      if (index < selectedTabIndex) {
        selectedTabIndex--;
      }
    }
    tabs.splice(index, 1);
    notifyTabDisplayer();
  }

}

module.exports.handleNewTab = (fileName, fileLocation) => {
  let tabIndex = getTabIndexFromFileLocation(fileLocation + fileName);
  if (tabIndex === -1) {
    tabManager.newTab(fileName, [], fileLocation);
    return true;
  } else {
    selectTab(tabIndex);
    return false;
  }
};

function getTabIndexFromFileLocation(fileLocation) {
  for (let i = 0; i < tabs.length; ++i) {
    if (tabs[i].getFileLocation() === fileLocation) {
      return i;
    }
  }
  return -1;
}

function openTab() {
  // Open file dialog, pr
}

function selectTab(index) {
  // Allow cycling using switchTab
  if (index > tabs.length - 1) {
    index = 0;
  } else if (index < 0) {
    index = tabs.length - 1;
  }

  let previousSelectedTab = tabs[selectedTabIndex];
  let newSelectedTab = tabs[index];

  if (previousSelectedTab && index !== selectedTabIndex) {
    previousSelectedTab.setSelected(false);
    previousSelectedTab.cameraState = {
      x: camera.getPosition().x,
      y: camera.getPosition().y,
      scaling: camera.getScaling()
    };
    previousSelectedTab.history = actionHandler.setHistory(newSelectedTab.history);

    let selectedBlock = Block.getSelectedBlock();
    if (selectedBlock && selectedBlock.parent) {
      previousSelectedTab.selectedBlock = selectedBlock;
    }
  }


  selectedTabIndex = index;

  camera.setPosition(newSelectedTab.cameraState.x, newSelectedTab.cameraState.y);
  camera.setScaling(newSelectedTab.cameraState.scaling);

  newSelectedTab.setSelected(true);
  rootBlock.children = newSelectedTab.blocks;

  if (newSelectedTab.selectedBlock) {
    newSelectedTab.selectedBlock.setSelected();
  }

  // blockManager.setCurrentTab();


  notifyTabDisplayer();
}

function notifyTabDisplayer() {
  tabDisplay.refreshView(tabs, selectTab, closeTab, renameTab);
}

module.exports.getCurrentTab = () => {
  return tabs[selectedTabIndex];
};

module.exports.setFileModified = () => {
  tabs[selectedTabIndex].setSaved(false);
  notifyTabDisplayer();
};

module.exports.notifyTabDisplayer = notifyTabDisplayer;
module.exports.switchTab = switchTab;
module.exports.newTab = newTab;
module.exports.closeCurrentTab = closeCurrentTab;
module.exports.closeTab = closeTab;
module.exports.init = init;
