const quickAccess = require("../quick-access.js");

function display() {
  let sourceArray = [];
  let actionList = actionHandler.getActions();

  let passed = 0,
    failed = 0,
    unknown = 0,
    total = 0;

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

      if (!actionList[actionName].debug) {
        total++;


        switch (actionList[actionName].executionState) {
          case 1:
            executationState = "❌ ";
            failed++;
            break;
          case 2:
            executationState = "✅ ";
            passed++;
            break;
          case 3:
            executationState = "❓ ";
            unknown++;
            break;
        }
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
  if (global.debugEnabled) {
    let divQuickAccessContainer = document.getElementById("quick-access-bar-container");

    let e = document.getElementById("debug-test-results");
    if (e) {
      document.getElementById("debug-test-results").innerHTML = "";
    } else {
      e = document.createElement('div');
      e.id = "debug-test-results";
    }

    e.innerHTML = "<br>Tests executed: " + (failed + passed + unknown) + " / " + total + " <br>" +
      "<span style='width: 190px; display: inline-block;'>Failed ❌</span>" + failed + "<br>" +
      "<span style='width: 190px; display: inline-block;'>Returned false ❓</span>" + unknown + "<br>" +
      "<span style='width: 190px; display: inline-block;'>Passed ✅</span>" + passed;
    divQuickAccessContainer.append(e);
  }
}

function onResultSelected(action) {
  actionHandler.trigger(action, undefined, false, true);
}

module.exports.display = display;