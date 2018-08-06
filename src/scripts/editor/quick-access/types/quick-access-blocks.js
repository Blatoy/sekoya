const quickAccess = require("../quick-access.js");
let lastLinkedIndex = -1;
let linkType = "";

function getSourceArray() {
  let sourceArray = [];
  let blockDefinitions = blockLoader.getBlockDefinitions();

  for (let actionType in blockDefinitions) {
    for (let blockName in blockDefinitions[actionType]) {
      sourceArray.push({
        actionName: blockName
      });
    }
  }

  return sourceArray;
}

function displayLinked(index) {
  lastLinkedIndex = index;
  linkType = config.connectionsTypes[index].name;
  quickAccess.attachType("Add \"" + linkType + "\" block", getSourceArray(), onResultSelected);
  return quickAccess.display();
}

function display() {
  lastLinkedIndex = -1;
  quickAccess.attachType("Add block", getSourceArray(), onResultSelected);
  return quickAccess.display();
}

function onResultSelected(blockName) {
  let newBlock = new Block(blockLoader.getDefinitionByName(blockName), false, false, [], {
    x: global.mouse.cameraX,
    y: global.mouse.cameraY
  });

  if(lastLinkedIndex !== -1) {
    newBlock.changeParent(Block.getSelectedBlock(), linkType);
  }

}

module.exports.display = display;
module.exports.displayLinked = displayLinked;
