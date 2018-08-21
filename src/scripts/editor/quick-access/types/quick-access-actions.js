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


/*

switch (type) {
  case SEARCH_TYPES.BLOCKS:
    title = "Add block";
    break;
  case SEARCH_TYPES.ACTIONS:
    title = "Quick action";
    break;
  case SEARCH_TYPES.LINKED_BLOCKS:
    title = "Add linked block";
    break;
  case SEARCH_TYPES.LINKED_ELSE_BLOCKS:
    title = "Add linked else block";
    break

*/


/*
function setResultListContent(search) {
  // Clear current serach
  let results = [];

  switch (type) {
    case SEARCH_TYPES.ACTIONS:
      let actions = actionHandler.getActions();

      for (let key in actions) {
        results.push({
          text: key,
          searchResult: getSearchScoreAndMatchIndexes(search, key)
        });
      }
      break;
    case SEARCH_TYPES.LINKED_ELSE_BLOCKS:
    case SEARCH_TYPES.LINKED_BLOCKS:
    case SEARCH_TYPES.BLOCKS:
      let blockDefinitionList = blockLoader.getBlockDefinitionList();

      for (let key in blockDefinitionList) {
        results.push({
          text: key,
          searchResult: getSearchScoreAndMatchIndexes(search, blockDefinitionList[key].name)
        });
      }
      break;
  }

  }
}
*/
