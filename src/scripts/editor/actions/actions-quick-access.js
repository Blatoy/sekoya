const quickAccessActions = require(editorFolderPath + "/quick-access/types/quick-access-actions.js");
const quickAccessBlocks = require(editorFolderPath + "/quick-access/types/quick-access-blocks.js");
const quickAccess = require(editorFolderPath + "/quick-access/quick-access.js");

// name, doAction, setData = () => {}, undoAction = false, priority = 0, displayable = true, preventTriggerWhenInputFocused = true
module.exports.registerActions = () => {
  actionHandler.addAction("quick access bar: add block dialog", () => {
    return quickAccessBlocks.display();
  }, false, false, 500, true, false);

  // We want an action for each user defined type
  for(let i = 0; i < config.connectionsTypes.length; ++i) {
    actionHandler.addAction("quick access bar: add linked " + config.connectionsTypes[i].name + " block dialog", () => {
        return quickAccessBlocks.displayLinked(i);
    }, false, false, 500, true, false);
  }

  actionHandler.addAction("quick access bar: execute action dialog", () => {
    quickAccessActions.display();
  }, false, false, 0, true, false, () => {}, false);

  actionHandler.addAction("quick access bar: execute selected result", () => {
    return quickAccess.executeSelectedAction();
  }, false, false, 1000, false, false, () => {}, false);

  actionHandler.addAction("quick access bar: next result", () => {
    return quickAccess.switchSelectedResult(1);
  }, false, false, 1000, false, false, () => {}, false);

  actionHandler.addAction("quick access bar: previous result", () => {
    return quickAccess.switchSelectedResult(-1);
  }, false, false, 1000, false, false, () => {}, false);

  actionHandler.addAction("quick access bar: hide dialog", () => {
    return quickAccess.hide();
  }, false, false, 0, false, false, () => {}, false);
};
/*
actionHandler.addAction("quick access bar add block", () => {
  type = SEARCH_TYPES.BLOCKS;
  return displayQuickBar();
});

actionHandler.addAction("quick access bar add linked block", () => {
  type = SEARCH_TYPES.LINKED_BLOCKS;
  return displayQuickBar();
});

actionHandler.addAction("quick access bar add linked else block", () => {
  type = SEARCH_TYPES.LINKED_ELSE_BLOCKS;
  return displayQuickBar();
});

actionHandler.addAction("quick access bar previous result", () => {
  return handleSelectedResult(-1);
});

actionHandler.addAction("quick access bar next result", () => {
  return handleSelectedResult(1);
});

actionHandler.addAction("quick access bar display", () => {
  type = SEARCH_TYPES.ACTIONS;
  return displayQuickBar();
});

actionHandler.addAction("quick access bar select action", () => {
  if (!accessBarVisible) return false;
  return executeSelectedAction();
}, 1000);

actionHandler.addAction("quick access bar hide", () => {
  return hideQuickBar();
  //  closeTab(tabs.indexOf(getCurrentTab()));
}, 1000);*/
