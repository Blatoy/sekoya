const quickAccessActions = require(editorFolderPath + "/quick-access/types/quick-access-actions.js");
const quickAccessBlocks = require(editorFolderPath + "/quick-access/types/quick-access-blocks.js");
const quickAccess = require(editorFolderPath + "/quick-access/quick-access.js");

// name, doAction, setData = () => {}, undoAction = false, priority = 0, displayable = true, preventTriggerWhenInputFocused = true
module.exports.registerActions = () => {
  actionHandler.addAction({
    name: "quick access bar: display add block dialog",
    priority: 500,
    action: () => {
      return quickAccessBlocks.display();
    },
  });

  // We want an action for each user defined type
  for (let i = 0; i < config.connectionsTypes.length; ++i) {
    actionHandler.addAction({
      name: "quick access bar: display add linked " + config.connectionsTypes[i].name + " block dialog",
      priority: 500,
      action: () => {
        return quickAccessBlocks.displayLinked(i);
      },
    });
  }

  actionHandler.addAction({
    name: "quick access bar: display execute action dialog",
    preventTriggerWhenInputFocused: false,
    action: () => {
      quickAccessActions.display();
    }
  });

  actionHandler.addAction({
    name: "quick access bar: execute selected result",
    priority: 1000,
    displayable: false,
    preventTriggerWhenInputFocused: false,
    preventTriggerWhenDialogOpen: false,
    action: () => {
      return quickAccess.executeSelectedAction();
    }
  });

  actionHandler.addAction({
    name: "quick access bar: next result",
    priority: 1000,
    displayable: false,
    preventTriggerWhenInputFocused: false,
    preventTriggerWhenDialogOpen: false,
    action: () => {
      return quickAccess.switchSelectedResult(1);
    },
  });

  actionHandler.addAction({
    name: "quick access bar: previous result",
    priority: 1000,
    displayable: false,
    preventTriggerWhenInputFocused: false,
    preventTriggerWhenDialogOpen: false,
    action: () => {
      return quickAccess.switchSelectedResult(-1);
    }
  });

  actionHandler.addAction({
    name: "quick access bar: hide dialog",
    preventTriggerWhenInputFocused: false,
    preventTriggerWhenDialogOpen: false,
    action: () => {
      return quickAccess.hide();
    }
  });
};
