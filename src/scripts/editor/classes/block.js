// TODO: Add memoization to improve performances

// Note: do not confuse the "displayed" root that is specific to awesomenauts block definition and
// the hidden root that all blocks must be attached to
let root;
let selectedBlock;

let mouseIsOverBlock = false;
let anyBlockBeingDragged = false;

let mouseClickPositionRelativeToBlock = {
  x: 0,
  y: 0
};

let mouseClickPosition = {
  x: 0,
  y: 0
};

function blockLinkToParentComparison(a, b) {
  // TODO: Allows to set a custom order for block type as it's super sad, or just use the order in the def file
  // TODO: Fix that block margin may be by "all" instead of allowing or block to works as expected
  if (a.linkToParentType < b.linkToParentType) {
    return 1;
  } else {
    return -1;
  }
}

function blockPositionYComparison(a, b) {
  if (a.position.y > b.position.y) {
    return 1;
  } else {
    return -1;
  }
}

function getLinkStyleProperty(type, property) {
  if (STYLE.LINKS[type] && STYLE.LINKS[type][property]) {
    return STYLE.LINKS[type][property];
  } else {
    return STYLE.LINKS["all"][property];
  }
}

function getBlockStyleProperty(type, property) {
  if (STYLE.BLOCKS[type] && STYLE.BLOCKS[type][property]) {
    return STYLE.BLOCKS[type][property];
  } else {
    return STYLE.BLOCKS["all"][property];
  }
}

class Block {
  constructor(blockDefinition, parent = false, linkToParentType = false, children = [], position = {
    x: 0,
    y: 0
  }) {
    this.name = blockDefinition.name;
    this.type = blockDefinition.type;
    this.children = children;
    this.parent = parent;
    this.isRoot = blockDefinition.isRoot || false;
    this.attributes = {};

    this.attributeCount = 0;

    this.isNewDraggedBlock = false;
    this.mouseOver = false;
    this.selected = false;
    this.dragged = false;

    this.linkingInProgress = false;
    this.linkingLinkTypeIndex = 0;
    this.startLinkingLinkAllowed = true;

    this.position = position;

    this.size = getBlockStyleProperty(this.type, "size");
    this.color = getBlockStyleProperty(this.type, "color");
    this.font = getBlockStyleProperty(this.type, "font");
    this.margin = getBlockStyleProperty(this.type, "margin");
    this.selectedStyle = getBlockStyleProperty(this.type, "selectedBorder");

    // Blocks cannot be orphan
    if (!parent && !blockDefinition.isRoot) {
      this.parent = root;
    }

    if (this.parent) {
      this.parent.addChild(this, linkToParentType);
    }

    this.setLinkToParentType(linkToParentType);

    // Set everything to their default value and create the attribute object by copying everything
    for (let type in blockDefinition.blockPropertiesGroupedByType) {
      for (let i = 0; i < blockDefinition.blockPropertiesGroupedByType[type].length; ++i) {
        if (!this.attributes[type]) {
          this.attributes[type] = [];
        }

        let templateAttribute = blockDefinition.blockPropertiesGroupedByType[type][i];
        let defaultValue = templateAttribute.defaultvalue;

        if (!templateAttribute.defaultvalue) {
          if (config.defaultEmptyValues[type] !== undefined) {
            defaultValue = config.defaultEmptyValues[type];
          } else {
            defaultValue = "";
          }
        }

        let attribute = {
          value: defaultValue,
          defaultValue: templateAttribute.defaultvalue,
          name: templateAttribute.name,
          shortName: templateAttribute.shortName,
          predefinedValues: templateAttribute.values,
        };

        this.attributeCount++;
        this.attributes[type].push(attribute);
      }
    }

    // Eventually add a comment attribute
    if (config.commentAttributeName !== "") {
      if (this.attributes["string"] === undefined) {
        this.attributes["string"] = [];
      }
      this.attributeCount++;
      this.attributes["string"].push({
        value: "",
        name: config.commentAttributeName
      });
    }
  }


  getRoot() {
    if (this.parent === false) {
      return this;
    } else {
      return this.parent.getRoot();
    }
  }

  getBlockAttributes() {
    return this.attributes;
  }

  setBlockAttributes(attributes) {
    for (let i = 0; i < attributes.length; ++i) {

    }
  }

  // Used to auto layout the blocks
  getMaxRecursiveDepth(previousDepth = 0) {
    if (this.children.length <= 0) {
      return 0;
    } else {
      let maxChildCount = this.children.length - 1;
      for (let i = 0; i < this.children.length; ++i) {
        let maxRecursiveDepth = this.children[i].getMaxRecursiveDepth(maxChildCount);
        if (maxRecursiveDepth > maxChildCount) {
          maxChildCount = maxRecursiveDepth;
        }
      }
      return maxChildCount + previousDepth;
    }
  }

  linkableTo(linkType) {
    if (config.connectionsTypes.length === 0) {
      return true;
    } else {
      for (let i = 0; i < config.connectionsTypes.length; ++i) {
        if (config.connectionsTypes[i].name === linkType) {
          return config.connectionsTypes[i].linkableTo.includes(this.type);
        }
      }
    }
    return false;
  }

  // TODO: Make it take into account comment and properties
  getFullHeight() {
    let extraHeight = 0;

    // Attributes
    extraHeight += this.attributeCount * this.font.size;

    // Everything displayed below the parents count as the block's height
    this.children.map((child) => {
      if (getLinkStyleProperty(child.linkToParentType, "displayBelowParent")) {
        extraHeight += child.getFullHeight();
      }
    });

    /*  if (this.parent) {
        let nextSibling = this.parent.children[this.parent.children.indexOf(this) + 1];
        if (nextSibling && nextSibling.linkToParentType != this.linkToParentType) {
          extraHeight += getLinkStyleProperty(nextSibling.linkToParentType, "firstBlockMargin");
        }
      }

      const displayBelowParent = getLinkStyleProperty(this.linkToParentType, "displayBelowParent");
      if (displayBelowParent) {
        if (this.parent.children.indexOf(this) === 0) {
          extraHeight += getBlockStyleProperty(this.type, "belowParentBlockMargin");
        }
      }*/
    return this.size.height + this.margin.y + extraHeight;
  }

  getMaxRecursiveHeight(previousHeight = 0) {
    let childrenTotalHeight = 0;
    this.children.map((child) => {
      // This is already taken into account in the getFullHeight()
      if (!getLinkStyleProperty(child.linkToParentType, "displayBelowParent")) {
        childrenTotalHeight += child.getMaxRecursiveHeight();
      }
    });
    return Math.max(childrenTotalHeight, this.getFullHeight());
  }
  // getFullHeight
  // Changes the link linking this block to its parent
  // Note that a "false" link doesn't means there's no link
  setLinkToParentType(linkToParentType = false) {
    if (!linkToParentType) {
      // If not link specified, use the default one or false
      if (config.connectionsTypes[0]) {
        this.linkToParentType = config.connectionsTypes[0].name;
      } else {
        this.linkToParentType = false;
      }
    } else {
      this.linkToParentType = linkToParentType;
    }
  }

  changeParent(newParent, linkToParentType = false) {
    if (newParent === this || newParent === this.parent || !newParent) return false;

    // Removes from current parent
    this.parent.children.splice(this.parent.children.indexOf(this), 1);

    this.parent = newParent;
    newParent.children.push(this);
    this.setLinkToParentType(linkToParentType);
  }

  // Should not really be used except in the constructor
  // Use changeParent instead! This will duplicate block and add sadness if used badly
  addChild(child, linkToParentType = false, insertionIndex = -1) {
    child.parent = this;
    if (insertionIndex === -1) {
      this.children.push(child);
    } else {
      this.children.splice(insertionIndex, 0, child);
    }

    if (this.isRoot && this.children.length === 1) {
      child.setSelected(true);
    }
  }

  getSibling(direction) {
    if (this.parent) {
      let blockIndex = this.parent.children.indexOf(this);
      if (this.parent.children[blockIndex + direction] !== undefined) {
        return this.parent.children[blockIndex + direction];
      } else {
        return false;
      }
    }
  }

  // Removes the block and all children
  deleteRecursive() {
    // root cannot be deleted
    if (this.parent) {
      this.isDeleted = true; // Used by undo add block to track what wants to be done
      if (this.selected) {
        let nextSibling = this.getSibling(1);
        let previousSibling = this.getSibling(-1);

        if (nextSibling !== false) {
          nextSibling.setSelected();
        } else if (previousSibling !== false) {
          previousSibling.setSelected();
        } else {
          this.parent.setSelected(true);
        }
      }

      return this.parent.children.splice(this.parent.children.indexOf(this), 1);
    }
  }

  // Delete the block and attach the orphan to root
  delete() {
    if (this.isRoot) return false; // no

    let root = this.getRoot();

    while (this.children.length > 0) {
      this.children[0].changeParent(root);
    }

    // Note: delete recusive only delete this block since we removed all children
    this.deleteRecursive();
  }

  sortChildrenByYPosition() {
    this.children.sort(blockPositionYComparison);
    // this.children.sort(blockLinkToParentComparison);
  }

  getConnectionType() {
    for (let i = 0; i < config.connectionsTypes.length; ++i) {
      if (config.connectionsTypes[i].name === this.linkToParentType) {
        return config.connectionsTypes[i].name;
      }
    }
    return "all";
  }

  autoLayout() {
    if (this.isRoot) {
      const rootPosition = getBlockStyleProperty("all", "rootPosition");
      this.position.x = rootPosition.x - this.margin.x;
      this.position.y = rootPosition.y;
    }

    const belowParentBlockMargin = getBlockStyleProperty(this.linkToParentType, "belowParentBlockMargin");

    let totalRecursiveHeightCount = 0;
    let belowParentHeight = belowParentBlockMargin.y;
    let previousBlock = false;
    let previousIsBelowParent = false;

    for (let i = 0; i < this.children.length; ++i) {
      const displayBelowParent = getLinkStyleProperty(this.children[i].linkToParentType, "displayBelowParent");

      if (displayBelowParent === true) {
        this.children[i].position.x = this.position.x + belowParentBlockMargin.x;
        this.children[i].position.y = belowParentHeight + this.position.y;
        belowParentHeight += this.children[i].getFullHeight();
      } else {
        if (previousBlock) {
          totalRecursiveHeightCount += previousBlock.getMaxRecursiveHeight();
        }

        this.children[i].position.x = this.margin.x + this.position.x;
        this.children[i].position.y = totalRecursiveHeightCount + this.position.y;

        previousBlock = this.children[i];
      }

      this.children[i].autoLayout();
    }
  }


  isPositionOver(position) {
    return position.x > this.position.x && position.y > this.position.y &&
      position.x < this.position.x + this.size.width && position.y < this.position.y + this.size.height;
  }

  setSelected(moveCamera = false) {
    if (this.isRoot) {
      if (this.children[1]) {
        if (selectedBlock) {
          selectedBlock.linkingInProgress = false;
          selectedBlock.selected = false;
        }
        this.children[1].setSelected();
        return;
      } else {
        return false;
      }
    } else {
      if (selectedBlock) {
        selectedBlock.linkingInProgress = false;
        selectedBlock.selected = false;
      }

      if (moveCamera) {
        camera.centerOnSmooth(this.position.x + this.size.width / 2, this.position.y + this.size.height / 2);
      }

      this.selected = true;
      selectedBlock = this;
    }
  }

  isTerminalNode() {
    // TODO: Check for stuff like orblock that also has terminal nodes
    // and implement htis in the linking part
    //  let isTerminalNode = true;
    if (config.connectionsTypes.length <= 0) {
      return false;
    } else {
      // Is terminal node because of childrenAreTerminalNodes ?
      for (let i = 0; i < config.connectionsTypes.length; ++i) {
        if (this.linkToParentType === config.connectionsTypes[i].name && config.connectionsTypes[i].childrenAreTerminalNodes) {
          return true;
        }
      }

      // Can this be linked to anything?
      for (let i = 0; i < config.connectionsTypes.length; ++i) {
        if (config.connectionsTypes[i].linkableTo.includes(this.type)) {
          return false;
        }
      }
      return true;
    }
  }

  switchLinkingLinkType() {
    if (!this.linkingInProgress || config.connectionsTypes.length <= 0) {
      return false;
    }

    do {
      this.linkingLinkTypeIndex++;
      if (this.linkingLinkTypeIndex >= config.connectionsTypes.length) {
        this.linkingLinkTypeIndex = 0;
      }

    } while (!config.connectionsTypes[this.linkingLinkTypeIndex].linkableTo.includes(this.type));
  }

  // ooof it's way too late i'm probaly doing zork
  getNearestBlock(direction, axis, targetBlock = false, initialBlock = false, results = {
    bestDistance: Infinity,
    bestBlock: false
  }) {
    if (!initialBlock) {
      initialBlock = rootBlock;
    }

    if (!targetBlock) {
      targetBlock = this;
    }

    let bestBlock = this;

    initialBlock.children.map((child) => {
      let vx = child.position.x - targetBlock.position.x;
      let vy = child.position.y - targetBlock.position.y;
      let dist = Math.sqrt(vx ** 2 + vy ** 2);
      // crappy workaround for or blocks
      if(vy === 0) {
        dist /= 100;
      }
      if (axis === "y" && (direction * child.position.y > direction * targetBlock.position.y) ||
        axis === "x" && (direction * child.position.x > direction * targetBlock.position.x)) {
        if (dist < results.bestDistance && child !== targetBlock) {
          results.bestDistance = dist;
          results.bestBlock = child;
        }
      }
      child.getNearestBlock(direction, axis, targetBlock, child, results);
    });

    return results;
  }

  // Move to previous / next sibling
  moveSelectedUpDown(direction) {
    let closestBlock = this.getNearestBlock(direction, "y").bestBlock;
    if (closestBlock) {
      closestBlock.setSelected(true);
    }

    /*
    let indexInParentArray = this.parent.children.indexOf(this);

    if (direction < 0 && indexInParentArray > 0) {
      this.parent.children[indexInParentArray - 1].setSelected(true);
    }
    if (direction > 0 && indexInParentArray < this.parent.children.length - 1) {
      this.parent.children[indexInParentArray + 1].setSelected(true);
    }
    */
  }

  // Move to parent / first child
  moveSelectedLeftRight(direction) {
    let closestBlock = this.getNearestBlock(direction, "x").bestBlock;
    if (closestBlock) {
      closestBlock.setSelected(true);
    }
  }

  setSelectedChild() {
    if (this.children.length > 0) {
      this.children[0].setSelected(true);
    }
  }

  setSelectedParent() {
    if (!this.parent.isRoot) {
      this.parent.setSelected(true);
    }
  }

  setSelectedNextSibling() {
    let indexInParentArray = this.parent.children.indexOf(this);

    if (indexInParentArray < this.parent.children.length - 1) {
      this.parent.children[indexInParentArray + 1].setSelected(true);
    }
  }

  setSelectedPreviousSibling() {
    let indexInParentArray = this.parent.children.indexOf(this);

    if (indexInParentArray > 0) {
      this.parent.children[indexInParentArray - 1].setSelected(true);
    }
  }

  setSelectedLastSibling() {
    this.parent.children[this.parent.children.length - 1].setSelected(true);
  }

  setSelectedFirstSibling() {
    this.parent.children[0].setSelected(true);
  }

  handleMouseOverBlock(mousePosition) {
    this.mouseOver = false;

    // Found a block that is hovered, no need to proceed further
    if (mouseIsOverBlock) {
      return;
    } else {
      if (this.isPositionOver(mousePosition)) {
        if (!this.isRoot) {
          this.mouseOver = true;
          mouseIsOverBlock = true;
        }
        return;
      }
    }

    this.children.map((child) => {
      child.handleMouseOverBlock(mousePosition);
    });
  }

  setChildrenPositionRelative() {
    let totalRecursiveHeightCount = 0;
    this.children.map((child, i) => {
      if (i > 0) {
        totalRecursiveHeightCount += this.children[i - 1].getMaxRecursiveHeight();
      }

      child.position.x = this.margin.x + this.position.x;
      child.position.y = totalRecursiveHeightCount + this.position.y;
      child.setChildrenPositionRelative();
    });
  }

  cancelBlockLinking() {
    this.linkingInProgress = false;
    this.linkingLinkTypeIndex = 0;
  }

  isRecursiveChild(block) {
    if (this === block || this.parent === block) {
      return true;
    } else if (this.isRoot) {
      return false;
    } else {
      return this.parent.isRecursiveChild(block);
    }

    //    return false;
    /*

        if(this.isRoot) {
          return false;
        }

        if(this === block) {
          return true;
        }


        return this.parent.isRecursiveChild(block);*/
    /*if(this === block || (this === block.parent && !block.parent.isRoot)) {
      return true;
    }
    else {
      if(block.parent) {
        if(block.parent.isRoot) {
          return false;
        }
        else {
          return block.parent.isRecursiveChild(this);
        }
      }
      else {
        return false;
      }
    }*/
  }

  // Handle block clicking and block double-clicking
  handleBlockSelection(mousePosition, leftClickState, rightClickState) {
    if (!anyBlockBeingDragged || this.dragged) {
      if (this.dragged && !leftClickState) {
        // Stop block dragging

        if (this.isNewDraggedBlock) {
          this.isNewDraggedBlock = false;
          actionHandler.trigger("blocks: sort children using position - no undo", {
            parentBlock: this.parent
          });
        } else {
          actionHandler.trigger("blocks: sort children using position", {
            parentBlock: this.parent
          });
        }

        this.dragged = false;
        anyBlockBeingDragged = false;
      } else if (!this.dragged && leftClickState && this.mouseOver && !selectedBlock.linkingInProgress) {
        // Start block dragging

        this.dragged = true;
        this.setSelected();

        anyBlockBeingDragged = true;

        mouseClickPosition = {
          x: this.position.x,
          y: this.position.y
        };

        mouseClickPositionRelativeToBlock = {
          x: this.position.x - mousePosition.x,
          y: this.position.y - mousePosition.y
        };
      } else if (!this.dragged && (rightClickState || leftClickState) && this.mouseOver && this.startLinkingLinkAllowed) {
        if (!selectedBlock.linkingInProgress && !this.isTerminalNode()) {
          // Start block linking
          this.setSelected();
          this.linkingInProgress = true;
        } else if (!selectedBlock.isRecursiveChild(this) && selectedBlock.linkingInProgress) {
          // Link blocks

          this.startLinkingLinkAllowed = false;

          actionHandler.trigger("blocks: link block", {
            targetBlock: this,
            parentBlock: selectedBlock,
            linkType: config.connectionsTypes[selectedBlock.linkingLinkTypeIndex] ? config.connectionsTypes[selectedBlock.linkingLinkTypeIndex].name : "all"
          });

          //this.changeParent(selectedBlock, config.connectionsTypes[selectedBlock.linkingLinkTypeIndex] ? config.connectionsTypes[selectedBlock.linkingLinkTypeIndex].name : "all")
          //  this.parent.autoLayout();

          if (!global.metaKeys.ctrl) {
            selectedBlock.cancelBlockLinking();
          }
        }
      } else if (this.dragged && leftClickState) {
        this.setChildrenPositionRelative();
      }


    }

    if (!rightClickState) {
      this.startLinkingLinkAllowed = true;
    }


    this.children.map((child) => {
      child.handleBlockSelection(mousePosition, leftClickState, rightClickState);
    });
  }

  handleBlockDragging(mousePosition) {
    if (this.dragged) {
      this.position.x = mouseClickPositionRelativeToBlock.x + mousePosition.x;
      this.position.y = mouseClickPositionRelativeToBlock.y + mousePosition.y;
    }

    this.children.map((child) => {
      child.handleBlockDragging(mousePosition);
    });
  }

  update() {
    mouseIsOverBlock = false;

    this.children.map((child) => {

      this.handleMouseOverBlock({
        x: global.mouse.cameraX,
        y: global.mouse.cameraY
      });

      this.handleBlockSelection({
        x: global.mouse.cameraX,
        y: global.mouse.cameraY
      }, global.mouse.buttons[1], global.mouse.buttons[3]);

      this.handleBlockDragging({
        x: global.mouse.cameraX,
        y: global.mouse.cameraY
      });

    });


    if (mouseIsOverBlock) {
      document.getElementById("main-canvas").style.cursor = "pointer";
    } else {
      document.getElementById("main-canvas").style.cursor = "default";
    }
  }

  renderConnections(ctx) {
    if (this.linkingInProgress) {
      const linkingType = config.connectionsTypes[this.linkingLinkTypeIndex] ? config.connectionsTypes[this.linkingLinkTypeIndex].name : "all";
      const dashInterval = getLinkStyleProperty(linkingType, "dashInterval");
      const baseLinkLength = getLinkStyleProperty(linkingType, "baseLength");

      ctx.strokeStyle = getLinkStyleProperty(linkingType, "color");
      ctx.lineWidth = getLinkStyleProperty(linkingType, "lineWidth");

      if (dashInterval == 0) {
        ctx.setLineDash([]);
      } else {
        ctx.setLineDash([dashInterval]);
      }

      ctx.beginPath();

      ctx.moveTo(this.position.x + this.size.width, this.position.y + this.size.height * 0.5);

      // why didn't I use vectore in the first place, I'm so dumb
      let x = (this.position.x + this.size.width) - global.mouse.cameraX;
      let y = (this.position.y + this.size.height * 0.5) - global.mouse.cameraY;
      let angle = Math.atan2(y, x);

      // TODO: Allows styling arrow in config
      ctx.lineTo(global.mouse.cameraX, global.mouse.cameraY);
      ctx.lineTo(global.mouse.cameraX + 20 * Math.cos(angle - Math.PI / 5), global.mouse.cameraY + 20 * Math.sin(angle - Math.PI / 5));
      ctx.moveTo(global.mouse.cameraX, global.mouse.cameraY);
      ctx.lineTo(global.mouse.cameraX + 20 * Math.cos(angle + Math.PI / 5), global.mouse.cameraY + 20 * Math.sin(angle + Math.PI / 5));

      ctx.stroke();
    }

    this.children.map((child, i) => {
      // Render links
      // TODO: Allows "unconnected" effect selection in config since it's not always great
      if (!this.isRoot || i == 0) {
        const childSize = getBlockStyleProperty(child.type, "size");
        const dashInterval = getLinkStyleProperty(child.linkToParentType, "dashInterval");
        const baseLinkLength = getLinkStyleProperty(child.linkToParentType, "baseLength");

        ctx.strokeStyle = getLinkStyleProperty(child.linkToParentType, "color");
        ctx.lineWidth = getLinkStyleProperty(child.linkToParentType, "lineWidth");

        // This could be an interesting feature to add, currently disabled becuase it doesn't look super good
        /*if(selectedBlock.isRecursiveChild(child)) {
          ctx.lineWidth = getLinkStyleProperty(child.linkToParentType, "lineWidth") * 3;
        }*/

        if (dashInterval == 0) {
          ctx.setLineDash([]);
        } else {
          ctx.setLineDash([dashInterval]);
        }


        ctx.beginPath();

        const displayBelowParent = getLinkStyleProperty(child.linkToParentType, "displayBelowParent");

        if (!displayBelowParent) {
          ctx.moveTo(this.position.x + this.size.width, this.position.y + this.size.height * 0.5);
          ctx.lineTo(this.position.x + this.size.width + baseLinkLength, this.position.y + this.size.height * 0.5);

          if (this.position.x + this.size.width + baseLinkLength > child.position.x) {
            if (this.position.x + this.size.width + baseLinkLength > child.position.x + childSize.width) {
              ctx.lineTo(this.position.x + this.size.width + baseLinkLength, child.position.y + childSize.height * 0.5);
              ctx.lineTo(child.position.x + childSize.width, child.position.y + childSize.height * 0.5);
            } else {
              if (child.position.y > this.position.y) {
                ctx.lineTo(this.position.x + this.size.width + baseLinkLength, child.position.y);
              } else {
                ctx.lineTo(this.position.x + this.size.width + baseLinkLength, child.position.y + childSize.height);
              }
              // ctx.lineTo(child.position.x + childSize.width / 2, child.position.y);
            }
          } else {
            // If the test make everything too laggy, just keep these 2 lines
            ctx.lineTo(this.position.x + this.size.width + baseLinkLength, child.position.y + childSize.height * 0.5);
            ctx.lineTo(child.position.x, child.position.y + childSize.height * 0.5);
          }
        } else {
          ctx.moveTo(this.position.x, this.position.y + this.size.height);
          ctx.lineTo(this.position.x, child.position.y + childSize.height * 0.5);
          ctx.lineTo(child.position.x, child.position.y + childSize.height * 0.5);
        }

        ctx.stroke();
      }

      child.renderConnections(ctx);
    });
  }

  render(ctx) {
    if (!this.isRoot) {
      // Render block
      ctx.fillStyle = this.color;
      ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);

      // Selection border
      if (this.selected) {
        ctx.strokeStyle = this.color;
        ctx.setLineDash([this.selectedStyle.dashInterval]);
        ctx.lineDashOffset = tick / this.selectedStyle.speedDivider;
        ctx.lineWidth = this.selectedStyle.width;

        ctx.strokeRect(this.position.x - this.selectedStyle.padding,
          this.position.y - this.selectedStyle.padding,
          this.size.width + this.selectedStyle.padding * 2,
          this.size.height + this.selectedStyle.padding * 2);

        ctx.lineDashOffset = 0;
      }

      // Mouse over colour
      if (this.mouseOver) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
      }

      // Text
      // White or black depending on the colour of the block
      const textColour = ((
          parseInt(ctx.fillStyle.slice(1, 3), 16) +
          parseInt(ctx.fillStyle.slice(3, 5), 16) +
          parseInt(ctx.fillStyle.slice(5, 7), 16)) /
        3) < 127 ? "white" : "black";

      ctx.fillStyle = textColour;

      // Text
      ctx.font = this.font.size + "px " + this.font.family;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      // DEBUG: Display blocks real height
      /*ctx.setLineDash([]);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "red";
      ctx.strokeRect(this.position.x, this.position.y, this.size.width, this.getFullHeight());
      ctx.strokeStyle = "blue";
      ctx.strokeRect(this.position.x, this.position.y, this.size.width, this.getMaxRecursiveHeight());
      */
      ctx.fillText(this.name /* + " - " + selectedBlock.isRecursiveChild(this) */ + " - " + this.getMaxRecursiveHeight() + " (" + this.getFullHeight() + ")", this.position.x + this.size.width * 0.5, this.position.y + this.size.height * 0.5);

      ctx.textAlign = "left";
      ctx.fillStyle = "white";
      ctx.textBaseline = "top";

      let lineCounter = 0;
      for (let type in this.attributes) {
        for (let i = 0; i < this.attributes[type].length; ++i) {
          if (this.attributes[type][i].name !== config.commentAttributeName) {
            ctx.fillText(this.attributes[type][i].shortName || this.attributes[type][i].name, this.position.x, this.size.height + this.position.y + this.font.size * lineCounter);
            lineCounter++;
          }
        }
      }
    }

    this.children.map((child) => {
      child.render(ctx);
    });
  }
}

Block.getSelectedBlock = () => {
  return selectedBlock;
};

root = new Block({
  name: "root",
  type: "root",
  isRoot: true
}, false);

selectedBlock = root;

module.exports.rootBlock = root;
module.exports.Block = Block;
/*

const canvasStyle = require(basePath + '/src/scripts/utils/theme-loader.js').canvasStyle;



class Block {
  constructor(name, type, position = {
    x: 0,
    y: 0
  }, link = "", properties = {}, children = [], parent = false, selected = false) {
    this.link = link;
    this.name = name;
    this.type = type;
    this.position = position;
    this.properties = properties;
    this.children = children;
    this.parent = parent;
    this.lastSelected = false;
    this.selected = selected;
    this._isMouseOver = false;
    this.linkingType = 0;
  }

  // name copyright goes to marukyu


  linkTo(block) {
    // Make sure target isn't already connected
    if(block != this && block.parent === false && block.type != "root" && !block.isRecursiveChild(this)) {
      block.parent = this;
      this.children.push(block);
      return true;
    }
  }

  getName() {
    return this.name;
  }

  getBlockAtMousePos(mousePos) {
    this._isMouseOver = false;
    // Give priority to the deepest child
    for (let i = 0; i < this.children.length; ++i) {
      this.children[i]._isMouseOver = false;
      if (this.children[i].getBlockAtMousePos(mousePos) !== false) {
        return this.children[i].getBlockAtMousePos(mousePos);
      } else {
        if (this.children[i].isMouseOver(mousePos)) {
          this.children[i]._isMouseOver = true;
          return this.children[i];
        }
      }
    }

    // Reached a terminal node
    if(this.isMouseOver(mousePos)) {
      this._isMouseOver = true;
      return this;
    }
    else {
      return false;
    }
  }

  getSize() {
    return {
      w: canvasStyle.blocks.size.width,
      h: canvasStyle.blocks.size.height
    };
  }

  getPosition() {
    let position = {
      x: this.position.x,
      y: this.position.y
    };

    if (!this.selected && this.parent) {
      let parentPosition = this.parent.getPosition();
      position.x += parentPosition.x;
      position.y += parentPosition.y;
    }

    return position;
  }

  renderConnections(ctx, camera, mousePos) {

    let position = this.getPosition();
    let size = this.getSize();

    ctx.strokeStyle = canvasStyle.connections.colour;
    ctx.lineWidth = canvasStyle.connections.lineWidth;

    ctx.setLineDash([]);

    if (this.type == "root") {
      ctx.beginPath();
      ctx.moveTo(0, position.y + size.h * 0.5);
      ctx.lineTo(position.x, position.y + size.h * 0.5);
      ctx.stroke();
    }
    // TODO: Handle linking type
    if(this.linkingType != 0) {
      ctx.beginPath();
      // Block end
      ctx.moveTo(position.x + size.w, position.y + size.h * 0.5);
      // Move away from the block
      ctx.lineTo(position.x + size.w + canvasStyle.connections.baseLength, position.y + size.h * 0.5);
      ctx.lineTo(position.x + size.w + canvasStyle.connections.baseLength, mousePos.y);
      // Connect to the other block
      ctx.lineTo(mousePos.x, mousePos.y);
      ctx.stroke();
      ctx.strokeRect(mousePos.x - 3, mousePos.y - 3, 6, 6);
    }

    // Draw connections to childs
    for (let i = 0; i < this.children.length; ++i) {
      let child = this.children[i];

      ctx.beginPath();
      // Block end
      ctx.moveTo(position.x + size.w, position.y + size.h * 0.5);
      // Move away from the block
      ctx.lineTo(position.x + size.w + canvasStyle.connections.baseLength, position.y + size.h * 0.5);
      ctx.lineTo(position.x + size.w + canvasStyle.connections.baseLength, child.getPosition(position).y + size.h * 0.5);
      // Connect to the other block
      ctx.lineTo(child.getPosition(position).x, child.getPosition(position).y + size.h * 0.5);
      ctx.stroke();

      child.renderConnections(ctx, position, mousePos);
    }
  }

  render(ctx, camera) {

    let position = this.getPosition();
    let size = {
      w: canvasStyle.blocks.size.width,
      h: canvasStyle.blocks.size.height
    };

    // Draw block base
    ctx.fillStyle = canvasStyle.blocks.colours[this.type];
    ctx.fillRect(position.x,
      position.y,
      size.w,
      size.h
    );

    if(this.lastSelected) {
      ctx.strokeStyle = canvasStyle.blocks.colours[this.type];
      ctx.setLineDash([10]);
      ctx.lineDashOffset = tick / 5;
      ctx.lineWidth = 3;
      ctx.strokeRect(position.x - 1, position.y -1, size.w + 2, size.h + 2);
    }
    else if(this._isMouseOver) {
      ctx.fillRect(position.x - 2, position.y - 2, size.w + 4, size.h + 4);
    }


    // Calculate average colour and use white or black depending on the colour

    let textColour = ((parseInt(ctx.fillStyle.slice(1, 3), 16) +
      parseInt(ctx.fillStyle.slice(3, 5), 16) +
      parseInt(ctx.fillStyle.slice(5, 7), 16)) / 3) < 127 ? "white" : "black";

    ctx.fillStyle = textColour;

    // Text
    ctx.font = canvasStyle.blocks.font.size + "px " + canvasStyle.blocks.font.family;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    ctx.fillText(this.name/* + "(" + (this.getMaxRecursiveDepth() + 1) + ")"*/
/*,
      position.x + size.w * 0.5,
      position.y + size.h * 0.5, size.w);

    // Render children
    for (let i = 0; i < this.children.length; ++i) {
      this.children[i].render(ctx, {}, position);
    }

  }
}

module.exports = Block;*/
