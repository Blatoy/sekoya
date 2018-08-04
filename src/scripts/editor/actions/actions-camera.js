module.exports.registerActions = () => {
  actionHandler.addAction("camera: move up", () => {
    camera.setMoveUp(true);
  }, () => {}, false, 0, true, true, () => {
    camera.setMoveUp(false);
  });

  actionHandler.addAction("camera: move down", () => {
    camera.setMoveDown(true);
  }, () => {}, false, 0, true, true, () => {
    camera.setMoveDown(false);
  });

  actionHandler.addAction("camera: move left", () => {
    camera.setMoveLeft(true);
  }, () => {}, false, 0, true, true, () => {
    camera.setMoveLeft(false);
  });

  actionHandler.addAction("camera: move right", () => {
    camera.setMoveRight(true);
  }, () => {}, false, 0, true, true, () => {
    camera.setMoveRight(false);
  });

  actionHandler.addAction("camera: reset position", () => {
    camera.resetPosition();
  });

  actionHandler.addAction("camera: reset zoom", () => {
    camera.resetPosition();
  });
};

// function addAction(name, doAction, setData = () => {}, undoAction = false, priority = 0, displayable = true, preventTriggerWhenInputFocused = true, onShortcutRelease = () => {})
