const canvasStyle = require(basePath + '/src/scripts/utils/theme-loader.js').canvasStyle;

class Block {
  constructor(name, type, position = {
    x: 0,
    y: 0
  }, link = "normal", properties = {}, children = [], parent = false, selected = false) {
    this.link = link;
    this.name = name;
    this.type = type;
    this.position = position;
    this.properties = properties;
    this.children = children;
    this.parent = parent;
        console.log(this.parent);
    this.selected = selected;
    this._isMouseOver = false;
  }

  isMouseOver(mousePos) {
    let position = this.getPosition();
    let size = this.getSize();
    return (mousePos.x > position.x && mousePos.x < position.x + size.w && mousePos.y > position.y && mousePos.y < position.y + size.h);
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

  renderConnections(ctx, camera) {

    let position = this.getPosition();
    let size = this.getSize();

    ctx.strokeStyle = canvasStyle.connections.colour;
    ctx.lineWidth = canvasStyle.connections.lineWidth;

    if (this.type == "root") {
      ctx.beginPath();
      ctx.moveTo(0, position.y + size.h / 2);
      ctx.lineTo(position.x, position.y + size.h / 2);
      ctx.stroke();
    }
    // Draw connections to childs
    for (let i = 0; i < this.children.length; ++i) {
      let child = this.children[i];

      ctx.beginPath();
      // Block end
      ctx.moveTo(position.x + size.w, position.y + size.h / 2);
      // Move away from the block
      ctx.lineTo(position.x + size.w + canvasStyle.connections.baseLength, position.y + size.h / 2);
      ctx.lineTo(position.x + size.w + canvasStyle.connections.baseLength, child.getPosition(position).y + size.h / 2);
      // Connect to the other block
      ctx.lineTo(child.getPosition(position).x, child.getPosition(position).y + size.h / 2);
      ctx.stroke();

      child.renderConnections(ctx, position);
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

    if(this._isMouseOver) {
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

    ctx.fillText(this.name,
      position.x + size.w / 2,
      position.y + size.h / 2, size.w);

    // Render children
    for (let i = 0; i < this.children.length; ++i) {
      this.children[i].render(ctx, {}, position);
    }

  }
}

module.exports = Block;
