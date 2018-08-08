module.exports.registerActions = () => {
  actionHandler.addAction("blocks: auto layout", () => {
    rootBlock.autoLayout();
  });

  actionHandler.addAction("blocks: delete selected", (data) => {
    data.block.delete();
    rootBlock.autoLayout();
  }, () => {
    let children = [];
    let selectedBlock = Block.getSelectedBlock();
    // We have to restore it at the right position
    let blockIndex = selectedBlock.parent.children.indexOf(selectedBlock);

    // We must track a reference to all the children since they are manually deleted from the block
    for(let i = 0; i < selectedBlock.children.length; ++i) {
      children.push({child: selectedBlock.children[i], linkToParentType: selectedBlock.children[i].linkToParentType});
    }

    return {block: selectedBlock, children: children, index: blockIndex};
  }, (data) => {

    // Using addChild is fine here since the block is deleted
    data.block.parent.addChild(data.block, data.block.linkToParentType, data.index);

    for(let i = 0; i < data.children.length; ++i) {
      data.children[i].child.changeParent(data.block, data.children[i].linkToParentType);
    }

    data.block.setSelected();
    rootBlock.autoLayout();
  });

  actionHandler.addAction("blocks: delete selected and children", (data) => {
    data.block.deleteRecursive();
    rootBlock.autoLayout();
  }, () => {
    let selectedBlock = Block.getSelectedBlock();

    return {block: selectedBlock, index: selectedBlock.parent.children.indexOf(selectedBlock)};
  }, (data) => {
    data.block.parent.addChild(data.block, data.block.linkToParentType, data.index);
    data.block.setSelected();
    rootBlock.autoLayout();
  });

  actionHandler.addAction("blocks: add block", (data) => {
    if(data.block.isDeleted) {
      if(data.parent) {
        data.block.parent.addChild(data.block, data.linkType);
      }
      else {
        data.block.parent.addChild(data.block);
      }
    }
    else {
      if(data.parent) {
        data.block.changeParent(data.parent, data.linkType);
      }
      else {
        data.block.changeParent(rootBlock);
      }
    }
  }, (data) => {
    return {block: data.block, parent: data.parent, linkType: data.linkType};
  }, (data) => {
    data.block.delete();
  /*  data.block.parent.addChild(data.block, data.block.linkToParentType, data.index);
    data.block.setSelected();
    rootBlock.autoLayout();*/
  });

  actionHandler.addAction("blocks: exchange block order", (data) => {

  }, () => {

  }, (data) => {

  });

  actionHandler.addAction("blocks: sort children using position", (data) => {
    data.parentBlock.children = data.newChildOrder;
    data.parentBlock.autoLayout();
  }, (data) => {
    let originalChildOrder = [];
    let newChildOrder = [];

    for(let i = 0; i < data.parentBlock.children.length; ++i) {
      originalChildOrder.push(data.parentBlock.children[i]);
    }

    data.parentBlock.sortChildrenByYPosition();

    for(let i = 0; i < data.parentBlock.children.length; ++i) {
      newChildOrder.push(data.parentBlock.children[i]);
    }

    return {parentBlock: data.parentBlock, newChildOrder: newChildOrder, originalChildOrder: originalChildOrder};
  }, (data) => {
    data.parentBlock.children = data.originalChildOrder;
    data.parentBlock.autoLayout();
  });

  // TODO: To tomorrow self, u fucking idiot, quick-access-block should trigger an action with an args
  // otherwise it CANNOT be undoable

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
