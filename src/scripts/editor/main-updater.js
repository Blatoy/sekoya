let selectedBlock = false;

function update() {
  let blocks = require(basePath + '/src/scripts/editor/data-manager.js').getBlocks();

  // Unselect all blocks
  if(!isMouseDown && selectedBlock) {
    selectedBlock.isSelected = false;
    selectedBlock = false;
  }

  if(selectedBlock) {
    let blockSize = selectedBlock.getSize();
    selectedBlock.position.x = canvasMousePos.x - blockSize.w / 2;
    selectedBlock.position.y = canvasMousePos.y - blockSize.h / 2;
  }

  for (let i = 0; i < blocks.length; ++i) {
    let hoveredBlock = blocks[i].getBlockAtMousePos(canvasMousePos);
    // If nothing is selected and hover a block and mouse down select the current bock
    if(!selectedBlock && hoveredBlock && isMouseDown && hoveredBlock.type != "root") {
      selectedBlock = hoveredBlock;
    }

    // Prevent selecting multiple main node block
    if(hoveredBlock != false) {
      break;
    }
  }

/*
  if(selectedBlock && isMouseDown) {
    selectedBlock.selected = true;


    selectedBlock.position.x = canvasMousePos.x - blockSize.w / 2;
    selectedBlock.position.y = canvasMousePos.y - blockSize.h / 2;
  }

  if(selectedBlock.selected) {

  }*/
}

function startUpdateTimer() {
  setInterval(update, 10);
}

module.exports.startUpdating = function() {
  startUpdateTimer();
}
