const quickAccess = require("../quick-access.js");

function display() {
  let sourceArray = [];
  let actionList = actionHandler.getActions();

  if (!global.debugEnabled) {
    for (let actionName in actionList) {
      if (actionList[actionName].displayable) {
        sourceArray.push({
          actionName: actionName,
          displayName: actionName
        });
      }
    }
  } else {
    for (let actionName in actionList) {
      let executationState = "";
      switch (actionList[actionName].executionState) {
        case 1:
          executationState = "❌ ";
          break;
        case 2:
          executationState = "✅ ";
          break;
        case 3:
          executationState = "❓ ";
          break;
      }

      if (actionList[actionName].displayable) {
        sourceArray.push({
          actionName: actionName,
          displayName: executationState + actionName
        });
      } else {
        sourceArray.push({
          actionName: actionName,
          displayName: executationState + "((H)) " + actionName
        });
      }
    }
  }

  quickAccess.attachType("Quick action", sourceArray, onResultSelected);
  quickAccess.display();
}

function onResultSelected(action) {
  actionHandler.trigger(action, undefined, false, true);
}

module.exports.display = display;