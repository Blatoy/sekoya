// TODO: Add memoization to improve performances

// Note: do not confuse the "displayed" root that is specific to awesomenauts block definition and
// the hidden root that all blocks must be attached to
let root;
let selectedBlock;

let mouseOverAnyBlock = false;
let blockLinkingInProgress = false;

let mouseClickPositionRelativeToBlock = {
  x: 0,
  y: 0
};

let mouseClickPosition = {
  x: 0,
  y: 0
};

function compare(a, b) {
  if (a < b) {
    return -1;
  } else if (a > b) {
    return 1;
  } else {
    return 0;
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
    this.attributes = {};
    this.attributeCount = 0;

    this.children = children;
    this.parent = parent;
    this.isRoot = blockDefinition.isRoot || false;

    this.isNewDraggedBlock = false;
    this.mouseOver = false;
    this.selected = false;
    this.dragged = false;

    this.linkingInProgress = false;
    this.linkingLinkTypeIndex = 0;
    this.linkToParentType = "";
    this.linkToParentProperties = {};
    this.startLinkingLinkAllowed = true;

    this.position = position;
    this.size = getBlockStyleProperty(this.type, "size");

    this.style = {
      attributeColor: getBlockStyleProperty(this.type, "attributeColor"),
      color: getBlockStyleProperty(this.type, "color"),
      margin: getBlockStyleProperty(this.type, "margin"),
      font: getBlockStyleProperty(this.type, "font"),
      selected: getBlockStyleProperty(this.type, "selectedBorder"),
      blockBelowParentMargin: getBlockStyleProperty(this.type, "blockBelowParentMargin"),
    };

    // Blocks cannot be orphan
    if (!parent && !blockDefinition.isRoot) {
      this.parent = root;
    }

    if (this.parent) {
      this.parent.addChild(this, linkToParentType);
    }

    // CLEANING: Check if it's truly necessary
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
        this.attributes[type][templateAttribute.name] = (attribute);
      }
    }

    // Eventually add a comment attribute
    if (config.commentAttributeName !== "") {
      if (this.attributes["string"] === undefined) {
        this.attributes["string"] = [];
      }

      this.attributeCount++;
      this.attributes["string"][config.commentAttributeName] = ({
        value: "",
        name: config.commentAttributeName
      });
    }
  }

  // Returns true if linkType can be a child link of this block
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
    extraHeight += this.attributeCount * this.style.font.size;

    // Everything displayed below the parents count as the block's height
    this.children.map((child) => {
      if (getLinkStyleProperty(child.linkToParentType, "displayBelowParent")) {
        extraHeight += child.getFullHeight();
      }
    });

    return this.size.height + this.style.margin.y + extraHeight;
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

  // Changes the link linking this block to its parent
  // Note that a "false" link doesn't means there's no link
  setLinkToParentType(linkToParentType = false) {
    if (!linkToParentType) {
      // If not link specified, use the default one or false
      if (config.connectionsTypes[0]) {
        this.linkToParentType = config.connectionsTypes[0].name;
        this.linkToParentProperties = config.connectionsTypes[0];
      } else {
        this.linkToParentType = false;
      }
    } else {
      for (let i = 0; i < config.connectionsTypes.length; ++i) {
        if (config.connectionsTypes[i].name === linkToParentType) {
          this.linkToParentProperties = config.connectionsTypes[i];
          break;
        }
      }
      this.linkToParentType = linkToParentType;
    }
  }

  changeParent(newParent, linkToParentType = false) {
    if (newParent === this || (newParent === this.parent && this.linkToParentType === linkToParentType) || !newParent) {
      return false;
    }

    if (this.parent === newParent) {
      this.setLinkToParentType(linkToParentType);
      return true;
    }

    // Removes from current parent
    this.parent.children.splice(this.parent.children.indexOf(this), 1);

    this.parent = newParent;
    newParent.children.push(this);
    this.setLinkToParentType(linkToParentType);
    return true;
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

    while (this.children.length > 0) {
      this.children[0].changeParent(rootBlock);
    }

    // Note: delete recusive only delete this block since we removed all children
    this.deleteRecursive();
  }

  sortChildrenByYPosition() {
    this.children.sort((a, b) => {
      let sortOrderA = parseInt(a.linkToParentProperties.sortOrder);
      let sortOrderB = parseInt(b.linkToParentProperties.sortOrder);

      if (sortOrderA === sortOrderB) {
        return compare(a.position.y, b.position.y);
      } else {
        return compare(sortOrderA, sortOrderB);
      }
    });
    /*  this.children.sort(positionYComparator);
      this.children = stable(this.children, linkToParentComparator);*/
  }

  autoLayout() {
    if (this.isRoot) {
      const rootPosition = getBlockStyleProperty("all", "rootPosition");
      this.position.x = rootPosition.x - this.style.margin.x;
      this.position.y = rootPosition.y;
    }

    let totalRecursiveHeightCount = 0;
    let belowParentHeight = this.style.blockBelowParentMargin.y;
    let previousBlock = false;
    let previousIsBelowParent = false;

    for (let i = 0; i < this.children.length; ++i) {
      if (getLinkStyleProperty(this.children[i].linkToParentType, "displayBelowParent") === true) {
        this.children[i].position.x = this.position.x + this.style.blockBelowParentMargin.x;
        this.children[i].position.y = belowParentHeight + this.position.y;
        belowParentHeight += this.children[i].getFullHeight();
      } else {
        if (previousBlock) {
          totalRecursiveHeightCount += previousBlock.getMaxRecursiveHeight();
        }

        this.children[i].position.x = this.style.margin.x + this.position.x;
        this.children[i].position.y = totalRecursiveHeightCount + this.position.y;

        previousBlock = this.children[i];
      }

      this.children[i].autoLayout();
    }
  }

  isPositionOver(x, y) {
    return y > this.position.y && y < this.position.y + this.size.height && x > this.position.x &&
      x < this.position.x + this.size.width;
  }

  setSelected(moveCamera = false) {
    if (this.isRoot) {
      if (this.children[1]) {
        if (selectedBlock) {
          selectedBlock.cancelBlockLinking();
          selectedBlock.selected = false;
        }
        this.children[1].setSelected();
        return;
      } else {
        return false;
      }
    } else {
      if (selectedBlock) {
        selectedBlock.cancelBlockLinking();
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
      if (vy === 0) {
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

  setChildrenPositionRelative() {
    let totalRecursiveHeightCount = 0;
    this.children.map((child, i) => {
      if (i > 0) {
        totalRecursiveHeightCount += this.children[i - 1].getMaxRecursiveHeight();
      }

      child.position.x = this.style.margin.x + this.position.x;
      child.position.y = totalRecursiveHeightCount + this.position.y;
      child.setChildrenPositionRelative();
    });
  }

  cancelBlockLinking() {
    blockLinkingInProgress = false;
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
  }

  /*
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
  */

  // Handle block clicking and block double-clicking
  /*  handleBlockSelection(mousePosition, leftClickState, rightClickState) {
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

            let linkChanged = actionHandler.trigger("blocks: link block", {
              targetBlock: this,
              parentBlock: selectedBlock,
              linkType: config.connectionsTypes[selectedBlock.linkingLinkTypeIndex] ? config.connectionsTypes[selectedBlock.linkingLinkTypeIndex].name : "all"
            });

            //this.changeParent(selectedBlock, config.connectionsTypes[selectedBlock.linkingLinkTypeIndex] ? config.connectionsTypes[selectedBlock.linkingLinkTypeIndex].name : "all")
            //  this.parent.autoLayout();
            if (!global.metaKeys.ctrl && linkChanged) {
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
  */

  handleMouseInteraction() {
    this.mouseOver = false;

    // Skip blocks if something was found
    if (!mouseOverAnyBlock && (!selectedBlock.dragged || this.dragged)) {
      // Handle mouse over display
      if (this.isPositionOver(global.mouse.cameraX, global.mouse.cameraY)) {
        if (!this.isRoot) {
          this.mouseOver = true;
          mouseOverAnyBlock = true;

          if (!this.dragged) {
            this.dragged = true;
            mouseClickPositionRelativeToBlock = {
              x: this.position.x - global.mouse.cameraX,
              y: this.position.y - global.mouse.cameraY
            };
          }

          if (selectedBlock.linkingInProgress && (global.mouse.buttons[1] || global.mouse.buttons[3]) && !this.linkingInProgress && !selectedBlock.isRecursiveChild(this)) {
            this.startLinkingLinkAllowed = false;
            let linkChanged = actionHandler.trigger("blocks: link block", {
              targetBlock: this,
              parentBlock: selectedBlock,
              linkType: config.connectionsTypes[selectedBlock.linkingLinkTypeIndex] ? config.connectionsTypes[selectedBlock.linkingLinkTypeIndex].name : false
            });

            if (!global.metaKeys.ctrl && linkChanged) {
              selectedBlock.cancelBlockLinking();
            }
          }

          if (global.mouse.buttons[1] && !this.selected) {
            this.setSelected();
          }

          if (global.mouse.buttons[3] && !blockLinkingInProgress && this.startLinkingLinkAllowed) {
            this.setSelected();
            if (!this.isTerminalNode()) {
              blockLinkingInProgress = true;
              this.linkingInProgress = true;
            }
          }
        }
      }
    }

    if (this.dragged && !global.mouse.buttons[1]) {
      this.dragged = false;

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
    }

    if (!global.mouse.buttons[3]) {
      this.startLinkingLinkAllowed = true;
    }

    this.children.map((child) => {
      child.handleMouseInteraction();
    });
  }

  update() {
    mouseOverAnyBlock = false;
    this.handleMouseInteraction();

    if (selectedBlock.dragged) {
      selectedBlock.position.x = mouseClickPositionRelativeToBlock.x + global.mouse.cameraX;
      selectedBlock.position.y = mouseClickPositionRelativeToBlock.y + global.mouse.cameraY;
    }

    if (mouseOverAnyBlock) {
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

      // Move to block
      ctx.moveTo(this.position.x + this.size.width, this.position.y + this.size.height * 0.5);

      // Draw an arrow at the end of the line
      let x = (this.position.x + this.size.width) - global.mouse.cameraX;
      let y = (this.position.y + this.size.height * 0.5) - global.mouse.cameraY;
      let angle = Math.atan2(y, x);

      ctx.lineTo(global.mouse.cameraX, global.mouse.cameraY);
      ctx.lineTo(global.mouse.cameraX + 20 * Math.cos(angle - Math.PI / 5), global.mouse.cameraY + 20 * Math.sin(angle - Math.PI / 5));
      ctx.moveTo(global.mouse.cameraX, global.mouse.cameraY);
      ctx.lineTo(global.mouse.cameraX + 20 * Math.cos(angle + Math.PI / 5), global.mouse.cameraY + 20 * Math.sin(angle + Math.PI / 5));

      ctx.stroke();
    }
    // Render links
    this.children.map((child, i) => {
      // We don't want to draw the connection from the hidden root to its children, except for the first element
      if (!this.isRoot || i == 0) {
        const dashInterval = getLinkStyleProperty(child.linkToParentType, "dashInterval");
        const baseLinkLength = getLinkStyleProperty(child.linkToParentType, "baseLength");

        ctx.strokeStyle = getLinkStyleProperty(child.linkToParentType, "color");
        ctx.lineWidth = getLinkStyleProperty(child.linkToParentType, "lineWidth");

        if (dashInterval == 0) {
          ctx.setLineDash([]);
        } else {
          ctx.setLineDash([dashInterval]);
        }

        ctx.beginPath();
        // Blocks displayed below their parent are styled in another manner
        if (!getLinkStyleProperty(child.linkToParentType, "displayBelowParent")) {
          camera.drawSegment(ctx, this.position.x + this.size.width, this.position.y + this.size.height * 0.5,
            this.position.x + this.size.width + baseLinkLength, this.position.y + this.size.height * 0.5);
          camera.drawSegment(ctx, this.position.x + this.size.width + baseLinkLength, this.position.y + this.size.height * 0.5,
            this.position.x + this.size.width + baseLinkLength, child.position.y + child.size.height * 0.5);
          camera.drawSegment(ctx, this.position.x + this.size.width + baseLinkLength, child.position.y + child.size.height * 0.5,
            child.position.x, child.position.y + child.size.height * 0.5);
        } else {
          ctx.moveTo(this.position.x, this.position.y + this.size.height);
          ctx.lineTo(this.position.x, child.position.y + child.size.height * 0.5);
          ctx.lineTo(child.position.x, child.position.y + child.size.height * 0.5);
        }

        ctx.stroke();
      }

      child.renderConnections(ctx);
    });
  }

  getCommentLines() {
    let lines = [];
    if (!this.attributes["string"] || !this.attributes["string"][config.commentAttributeName]) {
      return lines;
    } else {
      let words = this.attributes["string"][config.commentAttributeName].split(" ");
    }
  }

  isInView() {
    let bounds = camera.getBounds();
    if (this.position.x > bounds.x + bounds.width || this.position.y > bounds.y + bounds.height) {
      return false;
    }

    if (this.position.x + this.size.width < bounds.x || this.position.y + this.getFullHeight() < bounds.y) {
      return false;
    }

    return true;
  }

  render(ctx) {
    if (!this.isRoot && this.isInView(camera)) {
        let commentHeight = 0;
        if (this.attributes["string"] && this.attributes["string"][config.commentAttributeName] && this.attributes["string"][config.commentAttributeName].value) {
          // commentHeight = 150;
          ctx.fillStyle = "lime";
          ctx.font = "15px"
          ctx.fillRect(this.position.x + 5, this.position.y - 25, this.size.width - 5, 50);
          ctx.fillStyle = "black";
          ctx.fillText(this.attributes["string"][config.commentAttributeName].value, this.position.x + 10, this.position.y - 20);
        }

      // Render block
      ctx.fillStyle = this.style.color;
      ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);

      // Selection border
      if (this.selected) {
        ctx.strokeStyle = this.style.color;
        ctx.setLineDash([this.style.selected.dashInterval]);
        ctx.lineDashOffset = tick / this.style.selected.speedDivider;
        ctx.lineWidth = this.style.selected.width;

        ctx.strokeRect(this.position.x - this.style.selected.padding,
          this.position.y - this.style.selected.padding,
          this.size.width + this.style.selected.padding * 2,
          this.size.height + this.style.selected.padding * 2);

        ctx.lineDashOffset = 0;
      }

      // Mouse over color
      if (this.mouseOver) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
      }

      // Text is white or black depending on the colour of the block
      const textColour = ((
          parseInt(ctx.fillStyle.slice(1, 3), 16) +
          parseInt(ctx.fillStyle.slice(3, 5), 16) +
          parseInt(ctx.fillStyle.slice(5, 7), 16)) /
        3) < 127 ? "white" : "black";

      ctx.fillStyle = textColour;

      // Text
      ctx.font = this.style.font.size + "px " + this.style.font.family;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      // DEBUG: Display blocks real height
      /*      ctx.setLineDash([]);
            ctx.lineWidth = 1;
            ctx.strokeStyle = "red";
            ctx.strokeRect(this.position.x, this.position.y, this.size.width, this.getFullHeight());
            ctx.strokeStyle = "blue";
            ctx.strokeRect(this.position.x, this.position.y, this.size.width, this.getMaxRecursiveHeight());
      */
      ctx.fillText(this.name/* + " - " + this.parent.children.indexOf(this) *//* + " - " + selectedBlock.isRecursiveChild(this)  + " - " + this.getMaxRecursiveHeight() + " (" + this.getFullHeight() + ")"*/ , this.position.x + this.size.width * 0.5, this.position.y + this.size.height * 0.5);

      ctx.textAlign = "left";
      ctx.fillStyle = this.style.attributeColor;
      ctx.textBaseline = "top";

      let lineCounter = 0;
      // Render attributes
      for (let type in this.attributes) {
        for (let i in this.attributes[type]) {
          // Skip comment (TODO: Skip IsMinimized)
          if (this.attributes[type][i].name !== config.commentAttributeName) {
            // Draw rect instead of text when zoomed out too much to increase performances
            if (camera.getScaling() < 0.4) {
              ctx.fillRect(this.position.x, this.size.height + this.position.y + this.style.font.size * lineCounter, this.attributes[type][i].name.length * 5, 2);
            } else {
              ctx.fillText((this.attributes[type][i].shortName || this.attributes[type][i].name) + ": " + this.attributes[type][i].value, this.position.x, this.size.height + this.position.y + this.style.font.size * lineCounter);
            }
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

root.autoLayout();

selectedBlock = root;

module.exports.rootBlock = root;
module.exports.Block = Block;
