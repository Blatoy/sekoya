const config = require(basePath + '/config/general.json');
const actionHandler = require(basePath + "/src/scripts/utils/action-handler.js");
const canvasStyle = require(basePath + '/src/scripts/utils/theme-loader.js').canvasStyle;
const dataManager = require(basePath + '/src/scripts/editor/data-manager.js');

let selectedBlock = false;
let hoveredBlock = false;
let lastSelectedBlock = false;
let linkingBlock = false;
let mousePositionWhenSelected = {
  x: 0,
  y: 0
};

actionHandler.addAction("auto block layout", () => {
  let blocks = dataManager.getBlocks();
  for (let i = 0; i < blocks.length; ++i) {
    blocks[i].selected = false;
    blocks[i].position.x = canvasStyle.blocks.rootPosition.x;
    blocks[i].position.y = canvasStyle.blocks.rootPosition.y + i * canvasStyle.blocks.margin.y;
    blocks[i].autoLayout();
  }
});

actionHandler.addAction("block select up", () => {
  if(lastSelectedBlock && lastSelectedBlock.parent && lastSelectedBlock.parent.children.indexOf(lastSelectedBlock) > 0) {
    lastSelectedBlock.lastSelected = false;
    lastSelectedBlock = lastSelectedBlock.parent.children[lastSelectedBlock.parent.children.indexOf(lastSelectedBlock) -1 ];
    lastSelectedBlock.lastSelected = true;
  }
});

actionHandler.addAction("block select down", () => {
  if(lastSelectedBlock && lastSelectedBlock.parent && lastSelectedBlock.parent.children.indexOf(lastSelectedBlock) < lastSelectedBlock.parent.children.length - 1) {
    lastSelectedBlock.lastSelected = false;
    lastSelectedBlock = lastSelectedBlock.parent.children[lastSelectedBlock.parent.children.indexOf(lastSelectedBlock) + 1];
    lastSelectedBlock.lastSelected = true;
  }
});

actionHandler.addAction("block select parent", () => {
  if(lastSelectedBlock && lastSelectedBlock.parent) {
    lastSelectedBlock.lastSelected = false;
    lastSelectedBlock = lastSelectedBlock.parent;
    lastSelectedBlock.lastSelected = true;
  }
});

actionHandler.addAction("block select child", () => {
  if(lastSelectedBlock && lastSelectedBlock.children[0]) {
    lastSelectedBlock.lastSelected = false;
    lastSelectedBlock = lastSelectedBlock.children[0];
    lastSelectedBlock.lastSelected = true;
  }
});

actionHandler.addAction("cancel block linking", () => {
  let blocks = dataManager.getBlocks();
  if (linkingBlock) {
    linkingBlock.linkingType = 0;
    linkingBlock = false;
  }
});

actionHandler.addAction("delete selected block and children", () => {
  let blocks = dataManager.getBlocks();
  if (hoveredBlock && hoveredBlock.type !== "root") {
    if (hoveredBlock.parent) {
      hoveredBlock.destroy();
    } else {
      // We have to remove it manually if it's not connected to root
      blocks.splice(blocks.indexOf(hoveredBlock), 1);
    }
    hoveredBlock = false;
  }
});

actionHandler.addAction("delete selected block", () => {
  let blocks = dataManager.getBlocks();
  if (hoveredBlock && hoveredBlock.type !== "root") {
    // If the items has no parent, delete cannot delete it
    if (!hoveredBlock.delete(blocks)) {
      blocks.splice(blocks.indexOf(hoveredBlock), 1);
      hoveredBlock = false;
    }
  }
});

let currentTab = dataManager.getCurrentTab();

function update() {
  let blocks = dataManager.getBlocks();
  // List of things to reset on tab change
  if (currentTab != dataManager.getCurrentTab()) {
    if (linkingBlock) {
      linkingBlock.linkingType = 0;
    }
    lastSelectedBlock = selectedBlock;
    lastSelectedBlock.lastSelected = true;
    selectedBlock = false;
    hoveredBlock = false;
    linkingBlock = false;
    currentTab = dataManager.getCurrentTab();
  }
  document.getElementById("main-canvas").style.cursor = "default";

  // Check for mouse over blocks
  for (let i = 0; i < blocks.length; ++i) {
    hoveredBlock = blocks[i].getBlockAtMousePos(canvasMousePos);
    if (!linkingBlock && !selectedBlock && hoveredBlock && mouseButtons[1] && hoveredBlock.type !== "root") {
      mousePositionWhenSelected = {
        x: canvasMousePos.x,
        y: canvasMousePos.y
      };
      // If nothing is selected and hover a block and mouse down select the current bock
      if (lastSelectedBlock) {
        lastSelectedBlock.lastSelected = false;
      }
      lastSelectedBlock = hoveredBlock;
      lastSelectedBlock.lastSelected = true;
      selectedBlock = hoveredBlock;
    } else if (!linkingBlock && !selectedBlock && hoveredBlock && mouseButtons[3] && config.conditionsTypes.includes(hoveredBlock.type)) {
      // Start block linking
      hoveredBlock.linkingType = 1;
      linkingBlock = hoveredBlock;
    } else if (linkingBlock !== false && hoveredBlock && (mouseButtons[3] || mouseButtons[1])) {
      // Link blocks
      if (linkingBlock.linkTo(hoveredBlock)) {
        blocks.splice(blocks.indexOf(hoveredBlock), 1); // Remove block from its roots
        linkingBlock.linkingType = 0;
        linkingBlock = false;
        mouseButtons[3] = false; // Make sure we don't restart path immetiately
      }
    }

    // Prevent selecting multiple main node block
    if (hoveredBlock != false) {
      document.getElementById("main-canvas").style.cursor = "pointer";
      break;
    }
  }

  // Mouse up => remove current selection
  if (!mouseButtons[1] && selectedBlock) {
    selectedBlock.selected = false;
    let parentBlock = selectedBlock.parent;

    if (parentBlock) {
      let blockSize = selectedBlock.getSize();
      let parentPosition = parentBlock.getPosition();

      if (mousePositionWhenSelected.x != canvasMousePos.x && mousePositionWhenSelected.y != canvasMousePos.y) {
        selectedBlock.position.x = canvasMousePos.x - blockSize.w / 2 - parentPosition.x;
        selectedBlock.position.y = canvasMousePos.y - blockSize.h / 2 - parentPosition.y;
      }
    }
    lastSelectedBlock = selectedBlock;
    lastSelectedBlock.lastSelected = true;
    selectedBlock = false;
  }

  // Move selected block
  if (selectedBlock) {
    let blockSize = selectedBlock.getSize();
    selectedBlock.selected = true;
    if (mousePositionWhenSelected.x != canvasMousePos.x && mousePositionWhenSelected.y != canvasMousePos.y) {
      selectedBlock.position.x = canvasMousePos.x - blockSize.w / 2;
      selectedBlock.position.y = canvasMousePos.y - blockSize.h / 2;
    }
  }

}

function startUpdateTimer() {
  setInterval(update, 5);
}

module.exports.setLastSelectedBlock = (block) => {
  lastSelectedBlock.lastSelected = false;
  lastSelectedBlock = block;
  lastSelectedBlock.lastSelected = true;
}

module.exports.getLastSelectedBlock = () => {
  return lastSelectedBlock;
};

module.exports.startUpdating = function() {
  startUpdateTimer();
}
