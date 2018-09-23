const size = 10;

const SCROLL_STATES = {
  NONE_SELECTED: 0,
  VERTICAL_SELECTED: 1,
  HORIZONTAL_SELECTED: 2,
  VERTICAL_MOVING: 3,
  HORIZONTAL_MOVING: 4
};

let clickOffsetY = 0;
let clickOffsetX = 0;

let scrollState = SCROLL_STATES.NONE_SELECTED;

function getScrollBarDisplayHeight() {
  return canvas.height - size;
}

function getScrollBarDisplayWidth() {
  return canvas.width - size
}

// Vertical scroll bar
function getMaximumHeight(ignoreCamera = false) {
  const cameraBounds = camera.getBounds();
  const lastBlock = rootBlock.children[rootBlock.children.length - 1];

  if (!lastBlock) {
    return 0;
  };

  if (ignoreCamera) {
    return lastBlock.getYPosition() + lastBlock.getMaxRecursiveHeight();
  } else {
    return Math.max(lastBlock.getYPosition() + lastBlock.getMaxRecursiveHeight(), cameraBounds.height + cameraBounds.y);
  }
}


function getScrollBarPositionY() {
  const cameraBounds = camera.getBounds();
  const maxHeight = getMaximumHeight();
  const scrollPercentageY = cameraBounds.y / maxHeight;

  return scrollPercentageY * getScrollBarDisplayHeight();
}

function getScrollBarHeight() {
  const cameraBounds = camera.getBounds();
  const maxHeight = getMaximumHeight();

  return (cameraBounds.height / maxHeight) * getScrollBarDisplayHeight();
}

// Horizontal scroll bar
function getMaximumWidth(ignoreCamera = false) {
  const cameraBounds = camera.getBounds();

  let maxWidth = 0;
  const allChildren = rootBlock.getChildrenRecursively();
  for (let i = 0; i < allChildren.length; ++i) {
    if (allChildren[i].position.x + allChildren[i].size.width > maxWidth) {
      maxWidth = allChildren[i].position.x + allChildren[i].size.width;
    }
  }

  if (ignoreCamera) {
    return maxWidth;
  } else {
    return Math.max(maxWidth, cameraBounds.x + cameraBounds.width);
  }
}


function getScrollBarWidth() {
  const cameraBounds = camera.getBounds();
  const maxWidth = getMaximumWidth();

  return (cameraBounds.width / maxWidth) * getScrollBarDisplayWidth();
}

function getScrollBarPositionX() {
  const cameraBounds = camera.getBounds();
  const maxWidth = getMaximumWidth();
  const scrollPercentageX = cameraBounds.x / maxWidth;

  return scrollPercentageX * getScrollBarDisplayWidth();
}

function isPositionOverVerticalScrollBar(position) {
  const scrollBarY = getScrollBarPositionY();
  const scrollbarHeight = getScrollBarHeight();
  if (position.x > canvas.width - size) {
    if (position.y > scrollBarY && position.y < scrollBarY + scrollbarHeight) {
      return true;
    }
  }
  return false;
}

function isPositionOverHorizontalScrollBar(position) {
  const scrollBarX = getScrollBarPositionX();
  const scrollbarWidth = getScrollBarWidth();
  if (position.y > canvas.height - size) {
    if (position.x > scrollBarX && position.x < scrollBarX + scrollbarWidth) {
      return true;
    }
  }
  return false;
}

module.exports.render = (ctx) => {
  const backgroundColor = "#282C34";
  const foregroundColor = "#4B5362";

  const x = canvas.width - size;
  const y = canvas.height - size;


  ctx.fillStyle = backgroundColor;
  // Scroll bar backgrounds (they still take all the place as we don't want a hole in the bottom part)
  // Vertical
  ctx.fillRect(x + size / 5, 0, size, canvas.height);
  // Horizontal
  ctx.fillRect(0, y + size / 4, canvas.width, size);

  // Scroll bar foreground
  // Vertical
  ctx.fillStyle = foregroundColor;
  const scrollBarPositionY = getScrollBarPositionY();
  const scrollbarHeight = getScrollBarHeight();
  if (scrollbarHeight < getScrollBarDisplayHeight()) {
    ctx.fillRect(x + size / 4, (scrollBarPositionY), size / 2, scrollbarHeight);
  }

  // Horizontal
  const scrollBarPositionX = getScrollBarPositionX();
  const scrollbarWidth = getScrollBarWidth();
  if (scrollbarWidth < getScrollBarDisplayWidth()) {
    ctx.fillRect((scrollBarPositionX), y + size / 4, scrollbarWidth, size / 2);
  }
};

module.exports.getScrollState = () => {
  return scrollState;
};

module.exports.SCROLL_STATES = SCROLL_STATES;

module.exports.update = () => {
  switch (scrollState) {
    case SCROLL_STATES.VERTICAL_SELECTED:
    camera.setPosition(
      global.camera.bounds.x * global.camera.scaling,
      Math.max(
        Math.min(
          (global.mouse.canvasY - clickOffsetY) / canvas.height * getMaximumHeight(true) * global.camera.scaling,
          (getMaximumHeight(true)) * global.camera.scaling - canvas.height
        ),
        0
      )
    );
      break;
    case SCROLL_STATES.HORIZONTAL_SELECTED:
      camera.setPosition(
        Math.max(
          Math.min(
            (global.mouse.canvasX - clickOffsetX) / canvas.width * getMaximumWidth(true) * global.camera.scaling,
            (getMaximumWidth(true)) * global.camera.scaling - canvas.width
          ),
          0
        ),
        global.camera.bounds.y * global.camera.scaling);
      break;
  }
};

module.exports.onMouseDown = () => {
  if (scrollState === SCROLL_STATES.NONE_SELECTED) {
    //console.log(global.canvas);
    if (isPositionOverVerticalScrollBar({
        x: global.mouse.canvasX,
        y: global.mouse.canvasY
      })) {
      clickOffsetY = global.mouse.canvasY - getScrollBarPositionY();
      scrollState = SCROLL_STATES.VERTICAL_SELECTED;
    } else if (isPositionOverHorizontalScrollBar({
        x: global.mouse.canvasX,
        y: global.mouse.canvasY
      })) {
      clickOffsetX = global.mouse.canvasX - getScrollBarPositionX();
      scrollState = SCROLL_STATES.HORIZONTAL_SELECTED;
    }
  }
};

module.exports.onMouseUp = () => {
  if (scrollState !== SCROLL_STATES.NONE_SELECTED) {
    scrollState = SCROLL_STATES.NONE_SELECTED;
  }
};
