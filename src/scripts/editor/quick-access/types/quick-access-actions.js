const quickAccess = require("../quick-access.js");

function display() {
  let sourceArray = [];
  let actionList = actionHandler.getActions();

  for(let actionName in actionList) {
    if(actionList[actionName].displayable) {
      sourceArray.push({actionName: actionName, displayName: actionName});
    }
  }

  quickAccess.attachType("Quick action", sourceArray, onResultSelected);
  quickAccess.display();
}

function onResultSelected(action) {
  actionHandler.trigger(action, undefined, false, true);
}

module.exports.display = display;
