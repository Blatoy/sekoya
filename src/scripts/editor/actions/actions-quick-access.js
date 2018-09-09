const quickAccessActions = require(editorFolderPath + "/quick-access/types/quick-access-actions.js");
const quickAccessBlocks = require(editorFolderPath + "/quick-access/types/quick-access-blocks.js");
const quickAccess = require(editorFolderPath + "/quick-access/quick-access.js");

// name, doAction, setData = () => {}, undoAction = false, priority = 0, displayable = true, preventTriggerWhenInputFocused = true
module.exports.registerActions = () => {
  actionHandler.addAction("quick access bar: add block dialog", () => {
    return quickAccessBlocks.display();
  }, false, false, 500, true, false);

  actionHandler.addAction({
    name: "quick access bar: add block dialog",
    action: () => {return quickAccessBlocks.display();},
    priority: 500,
  });

  // We want an action for each user defined type
  for(let i = 0; i < config.connectionsTypes.length; ++i) {
    actionHandler.addAction({
      name: "quick access bar: add linked " + config.connectionsTypes[i].name + " block dialog",
      action: () => {return quickAccessBlocks.displayLinked(i);},
      priority: 500,
    });
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
