module.exports.registerActions = () => {
  actionHandler.addAction("blocks: auto layout", () => {
    rootBlock.sortChildrenByYPosition();
    rootBlock.autoLayout();
  });

  actionHandler.addAction("blocks: change current linking type", () => {
    if (Block.getSelectedBlock().linkingInProgress) {
      Block.getSelectedBlock().switchLinkingLinkType();
      return true;
    } else {
      return false;
    }
  });

  actionHandler.addAction("blocks: cancel block linking", () => {
    if (Block.getSelectedBlock().linkingInProgress) {
      Block.getSelectedBlock().cancelBlockLinking();
      return true;
    } else {
      return false;
    }
  });

  actionHandler.addAction({
    name: "blocks: close settings dialog and discard changes",
    action: () => {
      Block.getSelectedBlock().closePropertyWindow(false);
    },
    displayable: false,
    preventTriggerWhenInputFocused: false,
    preventTriggerWhenDialogOpen: false
  });

  actionHandler.addAction({
    name: "blocks: close settings dialog",
    action: () => {
      Block.getSelectedBlock().closePropertyWindow();
    },
    displayable: false,
    preventTriggerWhenInputFocused: false,
    preventTriggerWhenDialogOpen: false
  });

  actionHandler.addAction({
    name: "blocks: move block",
    action: (data, actionHandlerParameters) => {
      if(data.newPosition.x === data.oldPosition.x && data.newPosition.y === data.oldPosition.y) {
        actionHandlerParameters.cancelUndo = true;
      }

      data.block.position.x = data.newPosition.x;
      data.block.position.y = data.newPosition.y;
    },
    setData: (data) => {
      return data;
    },
    undoAction: (data) => {
      data.block.position.x = data.oldPosition.x;
      data.block.position.y = data.oldPosition.y;
    },
    displayable: false,
    preventTriggerWhenInputFocused: false,
    preventTriggerWhenDialogOpen: false
  });

  actionHandler.addAction("blocks: display settings for selected block", () => {
    if (!Block.getSelectedBlock().linkingInProgress && !global.dialogOpen) {
      Block.getSelectedBlock().displayPropertyWindow();
      return true;
    } else {
      return false;
    }
  });

  actionHandler.addAction("blocks: unlink selected block", () => {
    actionHandler.trigger("blocks: link block", {
      parentBlock: rootBlock,
      targetBlock: Block.getSelectedBlock()
    });
  });

  actionHandler.addAction("blocks: link block", (data, actionHandlerParameters) => {
    if (!data.targetBlock.changeParent(data.parentBlock, data.linkType)) {
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
    for(let i = 0; i < data.length; ++i) {
      data[i].block.delete();
    }
    //  rootBlock.autoLayout();
  }, () => {
    let selectedBlocks = rootBlock.getSelectedForGroupAction();

    // We delete the selected block only if there was no selected block for group action
    if(selectedBlocks.length === 0) {
      selectedBlocks = [Block.getSelectedBlock()];
    }

    let deletedBlocks = [];
    for(let i = 0; i < selectedBlocks.length; ++i) {
      let children = [];
      let selectedBlock = selectedBlocks[i];
      // We have to restore it at the right position
      let blockIndex = selectedBlock.parent.children.indexOf(selectedBlock);
      selectedBlock.selectedForGroupAction = false;

      // We must keep a reference to all the children since they are manually deleted from the block
      for (let j = 0; j < selectedBlock.children.length; ++j) {
        let child = selectedBlock.children[j];
        let childIndex = child.parent.children.indexOf(child);
        selectedBlock.children[j].selectedForGroupAction = false;
        children.push({
          child: selectedBlock.children[j],
          linkToParentType: selectedBlock.children[j].linkToParentType,
          index: childIndex
        });
      }

      deletedBlocks.push({
        block: selectedBlock,
        children: children,
        index: blockIndex
      });
    }

    return deletedBlocks;
  }, (data) => {
    for(let i = 0; i < data.length ; ++i) {
      let blockInfo = data[i];
      // Using addChild is fine here since the block is deleted
      blockInfo.block.parent.addChild(blockInfo.block, blockInfo.block.linkToParentType, blockInfo.index);

      for (let j = 0; j < blockInfo.children.length; ++j) {
        blockInfo.children[j].child.changeParent(blockInfo.block, blockInfo.children[j].linkToParentType, blockInfo.children[j].index);
      }

      //  rootBlock.autoLayout();
      blockInfo.block.setSelected(true);
    }
  });

  actionHandler.addAction("blocks: delete selected and children", (data) => {
    data.block.deleteRecursive();
    //rootBlock.autoLayout();
  }, () => {
    let selectedBlock = Block.getSelectedBlock();

    return {
      block: selectedBlock,
      index: selectedBlock.parent.children.indexOf(selectedBlock)
    };
  }, (data) => {
    data.block.parent.addChild(data.block, data.block.linkToParentType, data.index);
    //rootBlock.autoLayout();
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
      //rootBlock.autoLayout();
    }

    //if (!data.block.isTerminalNode()) {
      // New dragged block are set to selected with the mouse down event
      data.block.setSelected(!data.block.isNewDraggedBlock);
    //}

  }, (data) => {
    return {
      block: data.block,
      parent: data.parent,
      linkType: data.linkType
    };
  }, (data) => {
    data.block.delete();
    // rootBlock.autoLayout();
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
    data.parentBlock.sortChildrenByYPosition();
  });

  // This is currently not in used as we now undo the position as well
  // This still may be useful in the future and since it's work
  // the code will only be deleted if it's reall proven useless
  /*actionHandler.addAction("blocks: sort children using position", (data) => {
    data.parentBlock.children = data.newChildOrder;
    // data.parentBlock.autoLayout();
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
    //data.parentBlock.autoLayout();
  });*/

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
