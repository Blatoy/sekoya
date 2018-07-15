const canvasStyle = require(basePath + '/src/scripts/utils/theme-loader.js').canvasStyle;

class Block {
  constructor(name, type, position = {x: 0, y: 0}, properties = {}, children = []) {
    this.name = name;
    this.type = type;
    this.position = position;
    this.properties = properties;
    this.children = children;
  }

  render(ctx, camera, parentOffset = {x: 0, y: 0}) {
    let position = {x: this.position.x + parentOffset.x, y: this.position.y + parentOffset.y};
    let size = {w: canvasStyle.blocks.size.width, h: canvasStyle.blocks.size.height};
    // Draw block base
    ctx.fillStyle = canvasStyle.blocks.colours[this.type];
    ctx.fillRect(position.x,
      position.y,
      size.w,
      size.h
    );

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
      position.y + size.h / 2);


    ctx.strokeStyle = canvasStyle.connections.colour;
    ctx.lineWidth = canvasStyle.connections.lineWidth;

    for(let i = 0; i < this.children.length; ++i) {
      let child = this.children[i];

      // Draw connections to child
      ctx.beginPath();

      ctx.moveTo(position.x + size.w, position.y + size.h / 2);
      ctx.lineTo((child.position.x + 2 * position.x + size.w) / 2,  position.y + size.h / 2);
      ctx.lineTo((child.position.x + 2 * position.x + size.w) / 2, child.position.y + position.y + size.h / 2);
      ctx.lineTo(child.position.x + position.x, child.position.y + position.y + size.h / 2);
      ctx.stroke();
      child.render(ctx, {}, position);
    }

  }
}

module.exports = Block;
