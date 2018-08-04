module.exports.registerActions = () => {
  actionHandler.addAction("blocks: auto layout", () => {
    rootBlock.autoLayout();
  });

  actionHandler.addAction("blocks: select parent", () => {
    Block.getSelectedBlock().moveSelectedLeftRight(-1);
  });

  actionHandler.addAction("blocks: select child", () => {
    Block.getSelectedBlock().moveSelectedLeftRight(1);
  });

  actionHandler.addAction("blocks: select next sibling", () => {
    Block.getSelectedBlock().moveSelectedUpDown(1);
  });

  actionHandler.addAction("blocks: select previous sibling", () => {
    Block.getSelectedBlock().moveSelectedUpDown(-1);
  });

  actionHandler.addAction("blocks: select first sibling", () => {
    Block.getSelectedBlock().setSelectedFirstSibling();
  });

  actionHandler.addAction("blocks: select last sibling", () => {
    Block.getSelectedBlock().setSelectedLastSibling();
  });

};


/*
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
});*/
