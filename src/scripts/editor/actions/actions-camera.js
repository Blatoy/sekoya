module.exports.registerActions = () => {
  actionHandler.addAction("camera: move up", () => {
    camera.setMoveUp(true);
    camera.setMoveFast(false);
  }, () => {}, false, 0, true, true, () => {
    camera.setMoveUp(false);
  });

  actionHandler.addAction("camera: move down", () => {
    camera.setMoveDown(true);
    camera.setMoveFast(false);
  }, () => {}, false, 0, true, true, () => {
    camera.setMoveDown(false);
  });

  actionHandler.addAction("camera: move left", () => {
    camera.setMoveLeft(true);
    camera.setMoveFast(false);
  }, () => {}, false, 0, true, true, () => {
    camera.setMoveLeft(false);
  });

  actionHandler.addAction("camera: move right", () => {
    camera.setMoveRight(true);
    camera.setMoveFast(false);
  }, () => {}, false, 0, true, true, () => {
    camera.setMoveRight(false);
  });


  actionHandler.addAction("camera: move up fast", () => {
    camera.setMoveFast(true);
    camera.setMoveUp(true);
  }, () => {}, false, 1, true, true, () => {
    camera.setMoveUp(false);
  });

  actionHandler.addAction("camera: move down fast", () => {
    camera.setMoveFast(true);
    camera.setMoveDown(true);
  }, () => {}, false, 1, true, true, () => {
    camera.setMoveDown(false);
  });

  actionHandler.addAction("camera: move left fast", () => {
    camera.setMoveFast(true);
    camera.setMoveLeft(true);
  }, () => {}, false, 1, true, true, () => {
    camera.setMoveLeft(false);
  });

  actionHandler.addAction("camera: move right fast", () => {
    camera.setMoveFast(true);
    camera.setMoveRight(true);
  }, () => {}, false, 1, true, true, () => {
    camera.setMoveRight(false);
  });

  actionHandler.addAction("camera: notify move fast", () => {
    camera.setMoveFast(true);
  }, () => {}, false, 1, true, true, () => {
    camera.setMoveFast(false);
  });


  actionHandler.addAction("camera: reset position", () => {
    camera.resetPosition();
  });

  actionHandler.addAction("camera: reset zoom", () => {
    camera.resetZoom();
  });
};

// function addAction(name, doAction, setData = () => {}, undoAction = false, priority = 0, displayable = true, preventTriggerWhenInputFocused = true, onShortcutRelease = () => {})
