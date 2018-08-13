module.exports.registerActions = () => {
  actionHandler.addAction("blocks: auto layout", () => {
    rootBlock.sortChildrenByYPosition();
    rootBlock.autoLayout();
  });

  actionHandler.addAction("blocks: change current linking type", () => {
    Block.getSelectedBlock().switchLinkingLinkType();
  });

  actionHandler.addAction("blocks: cancel block linking", () => {
    Block.getSelectedBlock().cancelBlockLinking();
  });

  actionHandler.addAction("blocks: unlink selected block", () => {
    actionHandler.trigger("blocks: link block", {parentBlock: rootBlock, targetBlock: Block.getSelectedBlock()});
  });

  actionHandler.addAction("blocks: link block", (data, actionHandlerParameters) => {
    if(!data.targetBlock.changeParent(data.parentBlock, data.linkType)) {
      actionHandlerParameters.cancelUndo = true;
      return false;
    }

    return true;
  }, (data) => {
    let oldParent = data.targetBlock.parent;
    let oldLinkingType = data.targetBlock.linkToParentType;
    return {
      oldParent: data.targetBlock.parent,
      oldLinkingType: oldLinkingType,
      targetBlock: data.targetBlock,
      parentBlock: data.parentBlock,
      linkType: data.linkType
    };
  }, (data) => {
    data.targetBlock.changeParent(data.oldParent, data.oldLinkingType);
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
    for (let i = 0; i < selectedBlock.children.length; ++i) {
      children.push({
        child: selectedBlock.children[i],
        linkToParentType: selectedBlock.children[i].linkToParentType
      });
    }

    return {
      block: selectedBlock,
      children: children,
      index: blockIndex
    };
  }, (data) => {

    // Using addChild is fine here since the block is deleted
    data.block.parent.addChild(data.block, data.block.linkToParentType, data.index);

    for (let i = 0; i < data.children.length; ++i) {
      data.children[i].child.changeParent(data.block, data.children[i].linkToParentType);
    }

    rootBlock.autoLayout();
    data.block.setSelected(true);
  });

  actionHandler.addAction("blocks: delete selected and children", (data) => {
    data.block.deleteRecursive();
    rootBlock.autoLayout();
  }, () => {
    let selectedBlock = Block.getSelectedBlock();

    return {
      block: selectedBlock,
      index: selectedBlock.parent.children.indexOf(selectedBlock)
    };
  }, (data) => {
    data.block.parent.addChild(data.block, data.block.linkToParentType, data.index);
    rootBlock.autoLayout();
    data.block.setSelected(true);
  });

  actionHandler.addAction("blocks: add block", (data) => {
    // Deleted block are kept until they are deleted from the history
    if (data.block.isDeleted) {
      if (data.parent) {
        data.block.parent.addChild(data.block, data.linkType);
      } else {
        data.block.parent.addChild(data.block);
      }
    } else {
      if (data.parent) {
        data.block.changeParent(data.parent, data.linkType);
      } else {
        data.block.changeParent(rootBlock);
      }
    }

    if (!data.block.isNewDraggedBlock) {
      rootBlock.autoLayout();
    }


    if (!data.block.isTerminalNode()) {
      // New dragged block are set to selected with the mouse down event
      data.block.setSelected(!data.block.isNewDraggedBlock);
    }

  }, (data) => {
    return {
      block: data.block,
      parent: data.parent,
      linkType: data.linkType
    };
  }, (data) => {
    data.block.delete();
    rootBlock.autoLayout();
    /*  data.block.parent.addChild(data.block, data.block.linkToParentType, data.index);
      data.block.setSelected();
      rootBlock.autoLayout();*/
  });

  actionHandler.addAction("blocks: exchange block order", (data) => {

  }, () => {

  }, (data) => {

  });

  actionHandler.addAction("blocks: sort children using position - no undo", (data) => {
    data.parentBlock.sortChildrenByYPosition();
  });

  actionHandler.addAction("blocks: sort children using position", (data) => {
    data.parentBlock.children = data.newChildOrder;
    data.parentBlock.autoLayout();
  }, (data, actionHandlerParameters) => {
    let originalChildOrder = [];
    let newChildOrder = [];

    for (let i = 0; i < data.parentBlock.children.length; ++i) {
      originalChildOrder.push(data.parentBlock.children[i]);
    }

    data.parentBlock.sortChildrenByYPosition();

    actionHandlerParameters.cancelUndo = true;

    for (let i = 0; i < data.parentBlock.children.length; ++i) {
      newChildOrder.push(data.parentBlock.children[i]);
      // Add action to undo stack only if any changes occured
      if (actionHandlerParameters.cancelUndo && newChildOrder[i] !== originalChildOrder[i]) {
        actionHandlerParameters.cancelUndo = false;
      }
    }

    return {
      parentBlock: data.parentBlock,
      newChildOrder: newChildOrder,
      originalChildOrder: originalChildOrder
    };
  }, (data) => {
    data.parentBlock.children = data.originalChildOrder;
    data.parentBlock.autoLayout();
  });

  // Block moving: closest one
  actionHandler.addAction("blocks: select block below", () => {
    Block.getSelectedBlock().moveSelectedUpDown(1);
  });

  actionHandler.addAction("blocks: select block above", () => {
    Block.getSelectedBlock().moveSelectedUpDown(-1);
  });


  actionHandler.addAction("blocks: select left block", () => {
    Block.getSelectedBlock().moveSelectedLeftRight(-1);
  });

  actionHandler.addAction("blocks: select right block", () => {
    Block.getSelectedBlock().moveSelectedLeftRight(1);
  });

  // Block moving: using tree
  actionHandler.addAction("blocks: select first sibling", () => {
    Block.getSelectedBlock().setSelectedFirstSibling();
  });

  actionHandler.addAction("blocks: select last sibling", () => {
    Block.getSelectedBlock().setSelectedLastSibling();
  });


  actionHandler.addAction("blocks: select parent", () => {
    Block.getSelectedBlock().setSelectedParent();
  });

  actionHandler.addAction("blocks: select child", () => {
    Block.getSelectedBlock().setSelectedChild();
  });

  // Quick sibling move
  actionHandler.addAction("blocks: select previous sibling", () => {
    Block.getSelectedBlock().setSelectedPreviousSibling();
  });

  actionHandler.addAction("blocks: select next sibling", () => {
    Block.getSelectedBlock().setSelectedNextSibling();
  });
};
