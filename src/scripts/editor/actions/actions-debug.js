const DISPLAY_DEBUG_COMMANDS = true;

global.debugEnabled = false;

module.exports.registerActions = () => {
  actionHandler.addAction({
    name: "debug: reload",
    action: () => {
      if(global.debugEnabled) {
        global.forceAppReload = true;
        location.reload();
      }
    },
    displayable: global.debugEnabled,
    preventTriggerWhenDialogOpen: false,
    preventTriggerWhenInputFocused: false
  });

  actionHandler.addAction({
    name: "debug: toggle dev tools",
    action: () => {
        require("electron").remote.getCurrentWindow().toggleDevTools();
    },
    displayable: DISPLAY_DEBUG_COMMANDS,
    preventTriggerWhenDialogOpen: false,
    preventTriggerWhenInputFocused: false
  });

  actionHandler.addAction({
    name: "debug: toggle debug info",
    action: () => {
      global.debugEnabled = !global.debugEnabled;
    },
    displayable: DISPLAY_DEBUG_COMMANDS,
    preventTriggerWhenDialogOpen: false,
    preventTriggerWhenInputFocused: false
  });
};
