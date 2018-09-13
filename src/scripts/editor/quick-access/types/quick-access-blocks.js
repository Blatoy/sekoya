const quickAccess = require("../quick-access.js");
let lastLinkedIndex = -1;
let linkType = "";

function getSourceArray() {
  let sourceArray = [];
  let blockDefinitions = blockLoader.getBlockDefinitions();

  for (let actionType in blockDefinitions) {
    for (let blockName in blockDefinitions[actionType]) {
      if(!blockDefinitions[actionType][blockName].hidden) {
        sourceArray.push({
          displayName: blockDefinitions[actionType][blockName].displayName || blockDefinitions[actionType][blockName].name,
          actionName: blockDefinitions[actionType][blockName].name
        });
      }
    }
  }

  return sourceArray;
}

function displayLinked(index) {
  lastLinkedIndex = index;
  linkType = config.connectionsTypes[index].name;
  if(!Block.getSelectedBlock().linkableTo(linkType) || Block.getSelectedBlock().isTerminalNode()) {
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
  let selectedBlock = Block.getSelectedBlock();
  let newBlock = new Block(blockLoader.getDefinitionByName(blockName), false, false, [], {
    x: selectedBlock.style.margin.x + selectedBlock.position.x,
    y: selectedBlock.children.length > 0 ? selectedBlock.getYPosition() + selectedBlock.getMaxRecursiveHeight() : selectedBlock.getYPosition()
  });

  if(lastLinkedIndex === -1) {
    actionHandler.trigger("blocks: add block", {block: newBlock}, false, true);
  }
  else {
    actionHandler.trigger("blocks: add block", {block: newBlock, parent: Block.getSelectedBlock(), linkType: linkType}, false, true);
  }

}

module.exports.display = display;
module.exports.displayLinked = displayLinked;
