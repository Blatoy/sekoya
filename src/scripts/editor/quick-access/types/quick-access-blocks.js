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
  if(!Block.getSelectedBlock().linkableTo(linkType)) {
    return false;
  }
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

  if(lastLinkedIndex === -1) {
    actionHandler.trigger("blocks: add block", {block: newBlock});
  }
  else {
    actionHandler.trigger("blocks: add block", {block: newBlock, parent: Block.getSelectedBlock(), linkType: linkType});
  }

}

module.exports.display = display;
module.exports.displayLinked = displayLinked;
