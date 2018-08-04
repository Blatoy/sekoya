// TODO: Add memoization to improve performances

// Note: do not confuse the "displayed" root that is specific to awesomenauts block definition and
// the hidden root that all blocks must be attached to
let root;
let selectedBlock = root;

let mouseIsOverBlock = false;
let anyBlockBeingDragged = false;
let mouseClickPosition = {
  x: 0,
  y: 0
};
let mouseClickPositionRelativeToBlock = {
  x: 0,
  y: 0
};

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

    this.mouseOver = false;
    this.selected = false;
    this.dragged = false;
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
      this.parent.addChild(this);
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

        this.attributes[type].push(attribute);
      }
    }

    // Eventually add a comment attribute
    if (config.commentAttributeName !== "") {
      if (this.attributes["string"] === undefined) {
        this.attributes["string"] = [];
      }
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

  getMaxRecursiveDepth(previousDepth = 0) {
    if (this.children.length <= 0) {
      return 0;
    } else {
      let maxChildCount = this.children.length - 1; // "-1" because we don't need to increase the y pos if there's only 1 child
      for (let i = 0; i < this.children.length; ++i) {
        let maxRecursiveDepth = this.children[i].getMaxRecursiveDepth(maxChildCount);
        if (maxRecursiveDepth > maxChildCount) {
          maxChildCount = maxRecursiveDepth;
        }
      }
      return maxChildCount + previousDepth;
    }
  }

  setLinkToParentType(linkToParentType = false) {
    if (!linkToParentType) {
      if (config.connectionsTypes[0]) {
        this.linkToParentType = config.connectionsTypes[0].name;
      } else {
        this.linkToParentType = false;
      }
    }
  }

  addChild(child, linkToParentType = false) {
    child.setLinkToParentType(linkToParentType);
    child.parent = this;
    this.children.push(child);
  }

  // Removes the block and all children
  deleteRecursive() {
    // root cannot be deleted
    if (this.parent) {
      this.parent.children.splice(this.parent.children.indexOf(this), 1);
    }
  }

  // Delete the block and attach the orphan to root
  delete() {
    let root = this.getRoot();
    while (this.children.length > 0) {
      root.addChild(this.children.splice(0, 1)[0]);
    }

    this.destroy();
  }

  sortChildrenByYPosition() {
    this.children.sort(blockPositionYComparison);
  }

  autoLayout() {
    // Make sure everything is in the intended order
    this.sortChildrenByYPosition();

    if (this.isRoot) {
      const rootPosition = getBlockStyleProperty("all", "rootPosition");
      this.position.x = rootPosition.x - this.margin.x;
      this.position.y = rootPosition.y;
    }

    let totalRecursiveDepthCount = 0;
    for (let i = 0; i < this.children.length; ++i) {

      if (i > 0) {
        totalRecursiveDepthCount += this.children[i - 1].getMaxRecursiveDepth();
      }

      this.children[i].position.x = this.margin.x + this.position.x;
      this.children[i].position.y = this.margin.y * (i + totalRecursiveDepthCount) + this.position.y;

      this.children[i].autoLayout();
    }
  }

  isPositionOver(position) {
    return position.x > this.position.x && position.y > this.position.y &&
      position.x < this.position.x + this.size.width && position.y < this.position.y + this.size.height;
  }

  setSelected() {
    if(this.isRoot) {
      return;
    }
    if(selectedBlock) {
      selectedBlock.selected = false;
    }

    this.selected = true;
    selectedBlock = this;
  }

  moveSelectedUpDown(direction) {
    let indexInParentArray = this.parent.children.indexOf(this);
    console.log(indexInParentArray);
    if(direction < 0 && indexInParentArray > 0) {
      this.parent.children[indexInParentArray - 1].setSelected();
    }
    if(direction > 0 && indexInParentArray < this.parent.children.length - 1) {
      this.parent.children[indexInParentArray + 1].setSelected();
    }
  }

  moveSelectedLeftRight(direction) {
    if(direction < 0 && !this.parent.isRoot) {
      this.parent.setSelected();
    }
    else if(direction > 0 && this.children.length > 0) {
      this.children[0].setSelected();
    }
  }

  setSelectedLastSibling() {
    this.parent.children[this.parent.children.length - 1].setSelected();
  }

  setSelectedFirstSibling() {
    this.parent.children[0].setSelected();
  }

  handleMouseOverBlock(mousePosition) {
    this.mouseOver = false;
    if (mouseIsOverBlock) {
      return;
    } else {
      if (this.isPositionOver(mousePosition)) {
        this.mouseOver = true;
        mouseIsOverBlock = true;
        return;
      }
    }

    this.children.map((child) => {
      child.handleMouseOverBlock(mousePosition);
    });
  }

  handleBlockSelection(mousePosition, leftClickState) {
    if (!anyBlockBeingDragged || this.dragged) {
      if (this.dragged && !leftClickState) {
        // Stop block dragging
        this.parent.sortChildrenByYPosition();
        this.dragged = false;
        anyBlockBeingDragged = false;
      } else if (!this.dragged && leftClickState && this.mouseOver) {
        // Start block dragging
        this.dragged = true;
        this.setSelected();
        anyBlockBeingDragged = true;
        mouseClickPositionRelativeToBlock = {
          x: this.position.x - mousePosition.x,
          y: this.position.y - mousePosition.y
        };
      }
    }

    this.children.map((child) => {
      child.handleBlockSelection(mousePosition, leftClickState);
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
      }, global.mouse.buttons[1]);
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

    /*mouseIsOverBlock = false;

    this.children.map((child) => {
      if(!mouseIsOverBlock && child.isPositionOver()) {
        document.getElementById("main-canvas").style.cursor = "pointer";
        mouseIsOverBlock = true;
      }

      child.update();
    });*/
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
      }

      if (this.mouseOver) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
      }

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

      ctx.fillText(this.name, this.position.x + this.size.width * 0.5, this.position.y + this.size.height * 0.5);

    }


    this.children.map((child, i) => {
      // Render links
      const childSize = getBlockStyleProperty(child.type, "size");

      ctx.strokeStyle = getLinkStyleProperty(child.linkToParentType, "color");
      ctx.lineWidth = getLinkStyleProperty(child.linkToParentType, "lineWidth");

      const dashInterval = getLinkStyleProperty(child.linkToParentType, "dashInterval");

      if (dashInterval == 0) {
        ctx.setLineDash([]);
      } else {
        ctx.setLineDash([dashInterval]);
      }

      const baseLinkLength = getLinkStyleProperty(child.linkToParentType, "baseLength");

      // Render links
      ctx.beginPath();

      ctx.moveTo(this.position.x + this.size.width, this.position.y + this.size.height * 0.5);
      ctx.lineTo(this.position.x + this.size.width + baseLinkLength, this.position.y + this.size.height * 0.5);
      ctx.lineTo(this.position.x + this.size.width + baseLinkLength, child.position.y + childSize.height * 0.5);
      ctx.lineTo(child.position.x, child.position.y + childSize.height * 0.5);

      ctx.stroke();

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
  isRecursiveChild(block) {
    if(this == block.parent) {
      return true;
    }
    else {
      if(block.parent) {
        return block.parent.isRecursiveChild(this);
      }
      else {
        return false;
      }
    }
  }

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
