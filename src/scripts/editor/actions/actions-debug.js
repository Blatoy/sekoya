const DISPLAY_DEBUG_COMMANDS = true;

global.debugEnabled = config.debugEnabled;

module.exports.registerActions = () => {
  actionHandler.addAction({
    name: "debug: reload",
    action: () => {
      if(global.debugEnabled) {
        global.forceAppReload = true;
        location.reload();
      }
    },
    debug: true,
    displayable: global.debugEnabled,
    preventTriggerWhenDialogOpen: false,
    preventTriggerWhenInputFocused: false
  });

  actionHandler.addAction({
    name: "debug: toggle dev tools",
    action: () => {
        require("electron").remote.getCurrentWindow().toggleDevTools();
    },
    debug: true,
    displayable: DISPLAY_DEBUG_COMMANDS,
    preventTriggerWhenDialogOpen: false,
    preventTriggerWhenInputFocused: false
  });

  actionHandler.addAction({
    name: "debug: execute all non-hidden actions",
    action: () => {
      let actions = actionHandler.getActions();
        for(let k in actions) {
          if(/*actions[k].displayable && */!actions[k].debug) {
            setTimeout(() => {
              actionHandler.trigger(k, undefined, false, true);
            });
          }
        }
    },
    debug: true,
    displayable: DISPLAY_DEBUG_COMMANDS,
    preventTriggerWhenDialogOpen: false,
    preventTriggerWhenInputFocused: false
  });

  actionHandler.addAction({
    name: "debug: toggle debug info",
    action: () => {
      global.debugEnabled = !global.debugEnabled;
    },
    debug: true,
    displayable: DISPLAY_DEBUG_COMMANDS,
    preventTriggerWhenDialogOpen: false,
    preventTriggerWhenInputFocused: false
  });
};
