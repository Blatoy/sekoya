let position = {
  x: 0,
  y: 0
};
let targetPosition = {
  x: 0,
  y: 0
};
let speed = 0.1;
let scaling = 1;
let moveUp = false,
  moveDown = false,
  moveRight = false,
  moveLeft = false;
const SPEED = 10;
const SCROLL_SPEED = 50;
const ZOOM_VELOCITY = 0.1;

function setPosition(x, y) {
  position.x = x;
  position.y = y;
  targetPosition.x = position.x;
  targetPosition.y = position.y;
}

module.exports.setMoveUp = (state) => {
  moveUp = state;
};

module.exports.setMoveDown = (state) => {
  moveDown = state;
};

module.exports.setMoveRight = (state) => {
  moveRight = state;
};

module.exports.setMoveLeft = (state) => {
  moveLeft = state;
};

module.exports.resetPosition = () => {
  setPosition(0, 0);
};

module.exports.resetZoom = () => {
  scaling = 1;
};

module.exports.centerOnSmooth = (x, y) => {
  targetPosition.x = x * scaling - (canvas.width / 2);
  targetPosition.x = Math.max(targetPosition.x, 0);
  targetPosition.y = y * scaling - (canvas.height / 2);
  targetPosition.y = Math.max(targetPosition.y, 0);
};

module.exports.centerOn = (x, y) => {
  setPosition(x * scaling - (canvas.width / 2), y * scaling - (canvas.height / 2));
};

module.exports.getBounds = () => {
  return {
    x: position.x,
    y: position.y,
    width: canvas.width / scaling,
    height: canvas.height / scaling
  };
};

module.exports.onScroll = (deltaX, deltaY, ctrlPressed, shiftPressed) => {
  if (!ctrlPressed) {
    // Scroll the view
    if (shiftPressed) {
      setPosition(position.x + deltaY, position.y);
    } else {
      setPosition(position.x + deltaX, position.y + deltaY);
    }
  } else {
    let targetScaling = scaling;
    // Zoom in/out
    if (deltaY > 0) {
      targetScaling *= 1 - ZOOM_VELOCITY;
    } else {
      targetScaling *= 1 + ZOOM_VELOCITY;
    }

    let relativeScaling = targetScaling / scaling;
    let scalingPoint = {
      x: (global.mouse.canvasX),
      y: (global.mouse.canvasY)
    };

    setPosition((position.x * relativeScaling + scalingPoint.x * (relativeScaling - 1)),
      (position.y * relativeScaling + scalingPoint.y * (relativeScaling - 1)));

    scaling = targetScaling;
  }
};

module.exports.update = () => {
  if (moveUp) setPosition(position.x, position.y - SPEED);
  if (moveDown) setPosition(position.x, position.y + SPEED);
  if (moveLeft) setPosition(position.x - SPEED,  position.y);
  if (moveRight) setPosition(position.x + SPEED, position.y);

  position.x += (targetPosition.x - position.x) * speed;
  position.y += (targetPosition.y - position.y) * speed;

  global.mouse.cameraX = (global.mouse.canvasX + position.x) / scaling;
  global.mouse.cameraY = (global.mouse.canvasY + position.y) / scaling;
};

module.exports.applyTransforms = (ctx) => {
/*  if(position.x < 0) {
    targetPosition.x = 0;
  }
  if(position.y < 0) {
    targetPosition.y = 0;
  }*/
  position.x = Math.max(position.x, 0);
  position.y = Math.max(position.y, 0);

  ctx.save();
  ctx.translate(-position.x, -position.y);
  ctx.scale(scaling, scaling);
};

module.exports.resetTransforms = (ctx) => {
  ctx.restore();
};
