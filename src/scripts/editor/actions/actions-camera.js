module.exports.registerActions = () => {
  actionHandler.addAction({
    name: "camera: move up",
    displayable: false,
    action: () => {
      camera.setMoveUp(true);
      camera.setMoveFast(false);
    },
    onShortcutRelease: () => {
      camera.setMoveUp(false);
    }
  });

  actionHandler.addAction({
    name: "camera: move down",
    displayable: false,
    action: () => {
      camera.setMoveDown(true);
      camera.setMoveFast(false);
    },
    onShortcutRelease: () => {
      camera.setMoveDown(false);
    }
  });

  actionHandler.addAction({
    name: "camera: move left",
    displayable: false,
    action: () => {
      camera.setMoveLeft(true);
      camera.setMoveFast(false);
    },
    onShortcutRelease: () => {
      camera.setMoveLeft(false);
    }
  });

  actionHandler.addAction({
    name: "camera: move right",
    displayable: false,
    action: () => {
      camera.setMoveRight(true);
      camera.setMoveFast(false);
    },
    onShortcutRelease: () => {
      camera.setMoveRight(false);
    }
  });

  actionHandler.addAction({
    name: "camera: move up fast",
    displayable: false,
    action: () => {
      camera.setMoveFast(true);
      camera.setMoveUp(true);
    },
    onShortcutRelease: () => {
      camera.setMoveUp(false);
    }
  });

  actionHandler.addAction({
    name: "camera: move down fast",
    displayable: false,
    action: () => {
      camera.setMoveFast(true);
      camera.setMoveDown(true);
    },
    onShortcutRelease: () => {
      camera.setMoveDown(false);
    }
  });

  actionHandler.addAction({
    name: "camera: move left fast",
    displayable: false,
    action: () => {
      camera.setMoveFast(true);
      camera.setMoveLeft(true);
    },
    onShortcutRelease: () => {
      camera.setMoveLeft(false);
    }
  });

  actionHandler.addAction({
    name: "camera: move right fast",
    displayable: false,
    action: () => {
      camera.setMoveFast(true);
      camera.setMoveRight(true);
    },
    onShortcutRelease: () => {
      camera.setMoveRight(false);
    }
  });

  actionHandler.addAction({
    name: "camera: notify move fast",
    displayable: false,
    action: () => {
      camera.setMoveFast(true);
    },
    onShortcutRelease: () => {
      camera.setMoveFast(false);
    }
  });

  actionHandler.addAction("camera: reset position", () => {
    camera.resetPosition();
  });

  actionHandler.addAction("camera: reset zoom", () => {
    camera.resetZoom();
  });
};

// function addAction(name, doAction, setData = () => {}, undoAction = false, priority = 0, displayable = true, preventTriggerWhenInputFocused = true, onShortcutRelease = () => {})
