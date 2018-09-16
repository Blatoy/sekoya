module.exports.registerActions = () => {
  // Moving block / layout
  actionHandler.addAction({
    name: "blocks: auto layout",
    action: () => {
      rootBlock.sortChildrenByYPosition();
      rootBlock.autoLayout();
    }
  });

  actionHandler.addAction({
    name: "blocks: fold all",
    action: () => {
      actionHandler.separateMergeUndo();

      let allBlocks = rootBlock.getChildrenRecursively();
      for (let i = 0; i < allBlocks.length; ++i) {
        if (!allBlocks[i].minimized) {
          actionHandler.trigger("blocks: toggle folding", {
            block: allBlocks[i]
          }, false, true, true);
        }
      }
    }
  });

  actionHandler.addAction({
    name: "blocks: unfold all",
    action: () => {
      actionHandler.separateMergeUndo();

      let allBlocks = rootBlock.getChildrenRecursively();
      for (let i = 0; i < allBlocks.length; ++i) {
        if (allBlocks[i].minimized) {
          actionHandler.trigger("blocks: toggle folding", {
            block: allBlocks[i]
          }, false, true, true);
        }
      }
    }
  });

  actionHandler.addAction({
    name: "blocks: toggle folding",
    action: (data, actionHandlerParameters) => {
      if (data.block.isRoot || data.block.children.length <= 0) {
        actionHandlerParameters.cancelUndo = true;
        return false;
      }

      data.block.minimized = !data.minimizedState;
      data.block.parent.autoLayout(true);
      return true;
    },
    setData: (data = {}) => {
      let block = data.block;

      if (block === undefined) {
        block = Block.getSelectedBlock();
      }

      return {
        block: block,
        minimizedState: block.minimized
      };
    },
    undoAction: (data) => {
      data.block.minimized = data.minimizedState;
      Block.getSelectedBlock().parent.autoLayout(true);
    }
  });


  actionHandler.addAction({
    name: "blocks: move block",
    action: (data, actionHandlerParameters) => {
      if (data.newPosition.x === data.oldPosition.x && data.newPosition.y === data.oldPosition.y) {
        actionHandlerParameters.cancelUndo = true;
      } else {
        tabManager.setFileModified();
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
      tabManager.setFileModified();
    },
    displayable: false,
    preventTriggerWhenInputFocused: false,
    preventTriggerWhenDialogOpen: false
  });

  // Add / remove blocks
  actionHandler.addAction({
    name: "blocks: delete selected",
    action: (data) => {
      for (let i = 0; i < data.length; ++i) {
        data[i].block.delete();
      }

      tabManager.setFileModified();
    },
    setData: () => {
      let selectedBlocks = rootBlock.getSelectedForGroupAction();

      // We delete the selected block only if there was no selected block for group action
      if (selectedBlocks.length === 0) {
        selectedBlocks = [Block.getSelectedBlock()];
      }

      let deletedBlocks = [];
      for (let i = 0; i < selectedBlocks.length; ++i) {
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

      tabManager.setFileModified();
      return deletedBlocks;
    },
    undoAction: (data) => {
      for (let i = 0; i < data.length; ++i) {
        let blockInfo = data[i];
        // Using addChild is fine here since the block is deleted
        blockInfo.block.parent.addChild(blockInfo.block, blockInfo.block.linkToParentType, blockInfo.index);

        for (let j = 0; j < blockInfo.children.length; ++j) {
          blockInfo.children[j].child.changeParent(blockInfo.block, blockInfo.children[j].linkToParentType, blockInfo.children[j].index);
        }

        blockInfo.block.setSelected(true);
      }
    }
  });

  actionHandler.addAction({
    name: "blocks: delete selected and children",
    action: (data) => {
      data.block.deleteRecursive();
      tabManager.setFileModified();
      //rootBlock.autoLayout();
    },
    setData: () => {
      let selectedBlock = Block.getSelectedBlock();

      return {
        block: selectedBlock,
        index: selectedBlock.parent.children.indexOf(selectedBlock)
      };
    },
    undoAction: (data) => {
      data.block.parent.addChild(data.block, data.block.linkToParentType, data.index);
      //rootBlock.autoLayout();
      data.block.setSelected(true);
      tabManager.setFileModified();
    }
  });

  actionHandler.addAction({
    name: "blocks: add block",
    displayable: false,
    action: (data) => {
      if (data.block.isNewDraggedBlock) {
        rootBlock.unselectAll();
      }

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

      //if (!data.block.isTerminalNode()) {
      // New dragged block are set to selected with the mouse down event
      data.block.setSelected(!data.block.isNewDraggedBlock && !data.block.preventCameraCentering);
      tabManager.setFileModified();
      //}
    },
    setData: (data) => {
      return {
        block: data.block,
        parent: data.parent,
        linkType: data.linkType
      };
    },
    undoAction: (data) => {
      data.block.delete();
      tabManager.setFileModified();
    }
  });

  // Block linking
  actionHandler.addAction({
    name: "blocks: change current linking type",
    action: () => {
      if (Block.getSelectedBlock().linkingInProgress) {
        Block.getSelectedBlock().switchLinkingLinkType();
        return true;
      } else {
        return false;
      }
      tabManager.setFileModified();
    }
  });

  actionHandler.addAction({
    name: "blocks: cancel block linking",
    action: () => {
      if (Block.getSelectedBlock().linkingInProgress) {
        Block.getSelectedBlock().cancelBlockLinking();
        return true;
      } else {
        return false;
      }
    }
  });

  actionHandler.addAction({
    name: "blocks: unlink selected block",
    action: () => {
      actionHandler.trigger("blocks: link block", {
        parentBlock: rootBlock,
        targetBlock: Block.getSelectedBlock()
      });
    }
  });


  actionHandler.addAction({
    name: "blocks: link block",
    displayable: false,
    action: (data, actionHandlerParameters) => {
      if (!data.targetBlock.changeParent(data.parentBlock, data.linkType)) {
        actionHandlerParameters.cancelUndo = true;
        return false;
      }

      actionHandler.trigger("blocks: sort children using position - no undo", {
        parentBlock: data.parentBlock
      });

      tabManager.setFileModified();
      return true;
    },
    setData: (data) => {
      let oldParent = data.targetBlock.parent;
      let oldLinkingType = data.targetBlock.linkToParentType;

      tabManager.setFileModified();
      return {
        oldParent: data.targetBlock.parent,
        oldLinkingType: oldLinkingType,
        targetBlock: data.targetBlock,
        parentBlock: data.parentBlock,
        linkType: data.linkType
      };
    },
    undoAction: (data) => {
      data.targetBlock.changeParent(data.oldParent, data.oldLinkingType);
    }
  });

  actionHandler.addAction({
    name: "blocks: toggle commented",
    mergeUndoByDefault: true,
    action: (data, actionHandlerParameter) => {
      if(!data.noUndoMerge) {
        actionHandler.separateMergeUndo();
      }
      if(data.block && !data.block.isRoot && !data.block.isRecursiveParentCommented()) {
        data.block.uncommentAllChildren();
        data.block.commented = !data.block.commented;
        return true;
      }

      actionHandlerParameter.cancelUndo = true;
      return false;
    },
    setData: (data = {noUndoMerge: false}) => {
      if(data.block === undefined) {
        data.block = Block.getSelectedBlock();
      }
      return {block: data.block, noUndoMerge: data.noUndoMerge};
    },
    undoAction: (data) => {
      data.block.commented = !data.block.commented;
    }
  });

  // Block selection
  actionHandler.addAction({
    name: "blocks: unselect all",
    action: () => {
      rootBlock.unselectAll();
    },
    preventTriggerWhenInputFocused: false,
    preventTriggerWhenDialogOpen: false
  });

  // Block settings
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
    name: "blocks: close settings dialog and save changes",
    action: (data, actionHandlerParameters) => {
      if (data === false) {
        actionHandlerParameters.cancelUndo = true;
        return false;
      }

      data.block.setAttributes(data.newAttributes);
      data.block.closePropertyWindow();
      tabManager.setFileModified();
      return true;
    },
    setData: () => {
      if (document.getElementById("block-properties-background").style.display === "none") {
        return false;
      }

      let attributes = {};
      // Get all "normal" attributes
      let propertyElementList = document.getElementsByClassName("__property-value");

      for (let i = 0; i < propertyElementList.length; ++i) {
        let propertyElement = propertyElementList[i];
        // I think it would make it way cleaner to store the type into the object itself instead of doing that...
        if (!attributes[propertyElement.dataset.attributeType]) {
          attributes[propertyElement.dataset.attributeType] = {};
        }
        attributes[propertyElement.dataset.attributeType][propertyElement.dataset.attributeName] = propertyElement.value;
      }

      // Get all "checkboxes" attributes
      let propertyCheckboxList = document.getElementsByClassName("__property-value-checkbox");
      let checkedValues = [];
      let lastType = "",
        lastName = "";

      for (let i = 0; i < propertyCheckboxList.length; ++i) {
        let checkbox = propertyCheckboxList[i];
        if (lastName !== checkbox.dataset.attributeName) {
          if (lastName !== "") {
            if (!attributes[lastType]) {
              attributes[lastType] = {};
            }
            attributes[lastType][lastName] = checkedValues.join(config.multiSelectSeparator);
            checkedValues = [];
          }
          lastName = checkbox.dataset.attributeName;
          lastType = checkbox.dataset.attributeType;
        }
        if (checkbox.checked) {
          checkedValues.push(checkbox.value);
        }
      }

      if (lastName !== "") {
        if (!attributes[lastType]) {
          attributes[lastType] = {};
        }
        attributes[lastType][lastName] = checkedValues.join(config.multiSelectSeparator);
      }

      return {
        newAttributes: attributes,
        block: Block.getSelectedBlock(),
        oldAttributes: Block.getSelectedBlock().getAttributesCopy()
      };
    },
    undoAction: (data) => {
      data.block.setAttributes(data.oldAttributes);
      tabManager.setFileModified();
    },
    displayable: false,
    preventTriggerWhenInputFocused: false,
    preventTriggerWhenDialogOpen: false,
    priority: 1000
  });

  actionHandler.addAction({
    name: "blocks: display settings for selected block",
    action: () => {
      if (!Block.getSelectedBlock().linkingInProgress && !global.dialogOpen) {
        Block.getSelectedBlock().displayPropertyWindow();
        return true;
      } else {
        return false;
      }
    }
  });

  actionHandler.addAction({
    name: "blocks: sort children using position - no undo",
    displayable: false,
    action: (data) => {
      data.parentBlock.sortChildrenByYPosition();
    }
  });

  actionHandler.addAction({
    name: "blocks: sort children using position",
    action: (data) => {
      if (data.parentBlock.sortChildrenByYPosition()) {
        tabManager.setFileModified();
      }
    }
  });

  let copiedBlocks = [];

  actionHandler.addAction({
    name: "blocks: copy selection",
    action: (data) => {
      let selectedBlocks = rootBlock.getSelectedForGroupAction();

      copiedBlocks = [];
      // We delete the selected block only if there was no selected block for group action
      if (selectedBlocks.length === 0) {
        selectedBlocks = [Block.getSelectedBlock()];
      }

      copiedBlocks = [];
      for (let i = 0; i < selectedBlocks.length; ++i) {
        copiedBlocks.push(selectedBlocks[i].getCopy());
      }
    }
  });

  actionHandler.addAction({
    name: "blocks: cut selection",
    action: (data) => {
      actionHandler.trigger("blocks: copy selection");
      actionHandler.trigger("blocks: delete selected");
      tabManager.setFileModified();
    }
  });

  actionHandler.addAction({
    name: "blocks: paste selection",
    action: (data) => {
      if (copiedBlocks.length < 1) return false;
      rootBlock.unselectAll();

      let leftestPosition = {
        x: copiedBlocks[0].position.x,
        y: copiedBlocks[0].position.y
      };
      for (let i = 0; i < copiedBlocks.length; ++i) {
        if (leftestPosition.x > copiedBlocks[i].position.x) {
          leftestPosition.x = copiedBlocks[i].position.x;
          leftestPosition.y = copiedBlocks[i].position.y;
        }
      }

      actionHandler.separateMergeUndo();
      for (let i = 0; i < copiedBlocks.length; ++i) {
        let newBlock = copiedBlocks[i].getCopy()
        newBlock.position.x += global.mouse.cameraX - leftestPosition.x;
        newBlock.position.y += global.mouse.cameraY - leftestPosition.y;
        if (copiedBlocks.length > 1) {
          newBlock.selectedForGroupAction = true;
        }
        newBlock.preventCameraCentering = true;
        // TODO: Merge with previous or something like this
        actionHandler.trigger("blocks: add block", {
          block: newBlock
        }, false, false, true);
      }

      tabManager.setFileModified();
    }
  });

  // Block moving: closest one
  actionHandler.addAction({
    name: "blocks: select block below",
    action: () => {
      Block.getSelectedBlock().moveSelectedUpDown(1);
    }
  });

  actionHandler.addAction({
    name: "blocks: select block above",
    action: () => {
      Block.getSelectedBlock().moveSelectedUpDown(-1);
    }
  });

  actionHandler.addAction({
    name: "blocks: select left block",
    action: () => {
      Block.getSelectedBlock().moveSelectedLeftRight(-1);
    }
  });

  actionHandler.addAction({
    name: "blocks: select right block",
    action: () => {
      Block.getSelectedBlock().moveSelectedLeftRight(1);
    }
  });

  actionHandler.addAction({
    name: "blocks: select nearest to screen center",
    action: () => {
      Block.setSelectedCenterView();
    }
  });

  // Block moving: using tree
  actionHandler.addAction({
    name: "blocks: select first sibling",
    action: () => {
      Block.getSelectedBlock().setSelectedFirstSibling();
    }
  });

  actionHandler.addAction({
    name: "blocks: select last sibling",
    action: () => {
      Block.getSelectedBlock().setSelectedLastSibling();
    }
  });

  actionHandler.addAction({
    name: "blocks: tab next",
    action: () => {
      if (!Block.getSelectedBlock().setSelectedChild()) {
        Block.getSelectedBlock().setSelectedNextSibling();
      }
    }
  });

  actionHandler.addAction({
    name: "blocks: tab previous",
    action: () => {
      if (!Block.getSelectedBlock().setSelectedPreviousSibling()) {
        Block.getSelectedBlock().setSelectedParent();
      }
    }
  });

  actionHandler.addAction({
    name: "blocks: select parent",
    action: () => {
      Block.getSelectedBlock().setSelectedParent();
    }
  });

  actionHandler.addAction({
    name: "blocks: select child",
    action: () => {
      Block.getSelectedBlock().setSelectedChild();
    }
  });

  // Quick sibling move
  actionHandler.addAction({
    name: "blocks: select previous sibling",
    action: () => {
      Block.getSelectedBlock().setSelectedPreviousSibling();
    }
  });

  actionHandler.addAction({
    name: "blocks: select next sibling",
    action: () => {
      Block.getSelectedBlock().setSelectedNextSibling();
    }
  });
};
