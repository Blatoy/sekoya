let position = {x: 0, y: 0};
let scaling = 1;
let moveUp = false, moveDown = false, moveRight = false, moveLeft = false;

const SPEED = 10;
const SCROLL_SPEED = 50;
const ZOOM_VELOCITY = 0.1;

module.exports.setMoveUp = (state) => {
  moveUp = state;
};

module.exports.setMoveDown = (state) => {
  moveDown = state;
};

module.exports.resetPosition = () => {
  position.x = 0;
  position.y = 0;
};

module.exports.onScroll = (deltaX, deltaY, ctrlPressed) => {
  if(!ctrlPressed) {
    // Scroll the view
    position.x -= deltaX;
    position.y -= deltaY;
  }
  else {
    let targetScaling = scaling;
    // Zoom in/out
    if(deltaY > 0) {
      targetScaling *= 1 - ZOOM_VELOCITY;
    }
    else {
      targetScaling *= 1 + ZOOM_VELOCITY;
    }

    let relativeScaling = targetScaling / scaling;
    let scalingPoint = {
      x: (global.mouse.canvasX),
      y: (global.mouse.canvasY)
    };

    position.x = -(-position.x * relativeScaling + scalingPoint.x * (relativeScaling - 1));
    position.y = -(-position.y * relativeScaling + scalingPoint.y * (relativeScaling - 1));

    scaling = targetScaling;
  }
};

module.exports.resetZoom = () => {
  scaling = 1;
};

module.exports.setMoveRight = (state) => {
  moveRight = state;
};

module.exports.setMoveLeft = (state) => {
  moveLeft = state;
};

module.exports.update = () => {
  if(moveUp) position.y += SPEED;
  if(moveDown) position.y -= SPEED;
  if(moveLeft) position.x += SPEED;
  if(moveRight) position.x -= SPEED;

  position.x = Math.min(position.x, 0);
  position.y = Math.min(position.y, 0);

  global.mouse.cameraX = (global.mouse.canvasX - position.x) / scaling;
  global.mouse.cameraY = (global.mouse.canvasY - position.y) / scaling;
};

module.exports.getBounds = () => {

};

module.exports.applyTransforms = (ctx) => {
  ctx.translate(position.x, position.y);
  ctx.scale(scaling, scaling);
};

module.exports.resetTransforms = (ctx) => {
  ctx.scale(1 / scaling, 1 / scaling);
  ctx.translate(-position.x, -position.y);
};
