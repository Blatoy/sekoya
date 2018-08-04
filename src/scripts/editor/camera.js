let position = {x: 0, y: 0};
let scale = 1;
let moveUp = false, moveDown = false, moveRight = false, moveLeft = false;
let speed = 10;

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

module.exports.resetZoom = () => {
  scale = 1;
};

module.exports.setMoveRight = (state) => {
  moveRight = state;
};

module.exports.setMoveLeft = (state) => {
  moveLeft = state;
};

module.exports.update = () => {
  if(moveUp) position.y -= speed;
  if(moveDown) position.y += speed;
  if(moveLeft) position.x -= speed;
  if(moveRight) position.x += speed;

  position.x = Math.min(position.x, 0);
  position.y = Math.min(position.y, 0);

  global.mouse.cameraX = global.mouse.canvasX - position.x;
  global.mouse.cameraY = global.mouse.canvasY - position.y;
};

module.exports.getBounds = () => {

};

module.exports.applyTransforms = (ctx) => {
  ctx.translate(position.x, position.y);
};

module.exports.resetTransforms = (ctx) => {
  ctx.translate(-position.x, -position.y);
};
