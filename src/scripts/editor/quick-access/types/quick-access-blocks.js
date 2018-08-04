const quickAccess = require("../quick-access.js");
let lastLinkedIndex = 0;


function getSourceArray() {
  let sourceArray = [];
  let blockDefinitions = blockLoader.getBlockDefinitions();

  for(let actionType in blockDefinitions) {
    for(let blockName in blockDefinitions[actionType]) {
      sourceArray.push({actionName: blockName});
    }
  }

  return sourceArray;
}

function displayLinked(index) {
  lastLinkedIndex = index;
  quickAccess.attachType("Add \"" + config.connectionsTypes[index].name  + "\" block", getSourceArray(), onResultSelected);
  return quickAccess.display();
}

function display() {
  quickAccess.attachType("Add block", getSourceArray(), onResultSelected);
  return quickAccess.display();
}

function onResultSelected(blockName) {
  console.log(blockName + " - " + "added")
}

module.exports.display = display;
module.exports.displayLinked = displayLinked;
