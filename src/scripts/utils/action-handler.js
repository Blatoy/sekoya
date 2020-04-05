const keybinds = require(basePath + "/config/keybinds.json");
const accelerators = require(basePath + "/config/menu.json").topMenu;

let actions = {};
let undoStack = [];
let redoStack = [];

// Handle action triggered by shortcuts

function handleKeyDown(e) {
  let suitableActions = [];
  let keyPressed = "";

  // Find if the shortcuts should trigger an action
  for (let i = 0; i < keybinds.length; ++i) {
    let keybind = keybinds[i];

    // e.code = KeyZ, e.key = Y, we try to use the most appropriate choice
    if (keybind.key.length !== 1 || e.key === "" || e.key === undefined) {
      keyPressed = e.code;
    } else {
      keyPressed = e.key;
    }

    if ((keybind.key.toLowerCase() === keyPressed.toLowerCase()) &&
      keybind.ctrl === e.ctrlKey &&
      keybind.shift === e.shiftKey &&
      keybind.alt === e.altKey) {
      // Prevent the user to use inexisting shorcuts
      if (actions[keybind.action]) {
        if (
          (actions[keybind.action].preventTriggerWhenInputFocused &&
            (document.activeElement.tagName === "INPUT" ||
              document.activeElement.tagName === "SELECT" ||
              document.activeElement.tagName === "TEXTAREA")
          ) ||
          hasAccelerator(keybind.action, getAccelerator(keybind)) ||
          (actions[keybind.action].preventTriggerWhenDialogOpen && global.dialogOpen)
        ) {
          continue;
        } else {
          suitableActions.push(actions[keybind.action]);
        }
      } else {
        console.warn("Invalid action: '" + keybind.action + "'");
      }
    }
  }

  // Actions with higher priorities at top
  suitableActions.sort(compareActionPriority);

  for (let i = 0; i < suitableActions.length; ++i) {
    let currentAction = suitableActions[i];
    let nextAction = suitableActions[i + 1];

    // Actions should return true if they did something
    if (trigger(currentAction.name) && nextAction !== undefined && nextAction.priority < currentAction.priority) {
      break;
    }

  }
}

// Very similar to keydown, but is a lot more likely to be called
// as this will probably only be used for the camera or stuff that cannot be undone anyway
function handleKeyUp(e) {
  let suitableActions = [];
  let keyPressed = "";

  // Find if the shortcuts should trigger an action
  for (let i = 0; i < keybinds.length; ++i) {
    let keybind = keybinds[i];

    // e.code = KeyZ, e.key = Y, thus why we try to avoid e.code except if we don't have a choice
    if (keybind.key.length !== 1 || e.key === "" || e.key === undefined) {
      keyPressed = e.code;
    } else {
      keyPressed = e.key;
    }

    if ((keybind.key.toLowerCase() === keyPressed.toLowerCase())) {
      // Prevent the user to use inexisting shorcuts
      if (actions[keybind.action]) {
        // Most keyup should be executed even if there's something that should prevent it
        /*  if (actions[keybind.action].preventTriggerWhenInputFocused && document.activeElement.tagName === "INPUT") {
            continue;
          } else {*/
        actions[keybind.action].onShortcutRelease();
        //  }
      }
    }
  }
}

function compareActionPriority(a, b) {
  if (a.priority > b.priority) {
    return -1;
  } else {
    return 1;
  }
}

function undo() {
  if (undoStack.length > 0) {
    let actionHistory = undoStack.pop();
    redoStack.push(actionHistory);

    while (actionHistory && actionHistory.isDummy) {
      actionHistory = undoStack.pop();
      if (actionHistory !== undefined) {
        redoStack.push(actionHistory);
      }
    }

    if (actionHistory !== undefined) {
      if (!Array.isArray(actionHistory)) {
        actions[actionHistory.actionName].undoAction(actionHistory.parameters);
      } else {
        for (let i = 0; i < actionHistory.length; ++i) {
          actions[actionHistory[0].actionName].undoAction(actionHistory[i].parameters);
        }
      }
    }
  }
}

function redo() {
  if (redoStack.length > 0) {
    let actionHistory = redoStack.pop();
    undoStack.push(actionHistory);

    while (actionHistory && actionHistory.isDummy) {
      actionHistory = redoStack.pop();
      if (actionHistory !== undefined) {
        undoStack.push(actionHistory);
      }
    }

    if (actionHistory !== undefined) {
      if (!Array.isArray(actionHistory)) {
        actions[actionHistory.actionName].doAction(actionHistory.parameters);
      } else {
        for (let i = 0; i < actionHistory.length; ++i) {
          actions[actionHistory[0].actionName].doAction(actionHistory[i].parameters);
        }
      }
    }
  }
}

function separateMergeUndo() {
  undoStack.push({
    actionName: "dummy",
    isDummy: true
  });
}

function trigger(name, args, ignoreCommandHistory = false, bypassChecks = false, mergeUndo = false) {
  if (actions[name] !== undefined) {

    let action = actions[name];

    // TODO: Fix the code in the keydown thingy to not have a duplicate here
    // this is also done here because of accelerators...
    if (!bypassChecks && (
        (action.preventTriggerWhenInputFocused &&
          (document.activeElement.tagName === "INPUT" ||
            document.activeElement.tagName === "SELECT" ||
            document.activeElement.tagName === "TEXTAREA"
          )
        ) ||
        (
          action.preventTriggerWhenDialogOpen && global.dialogOpen
        )
      )) {
      return false;
    }


    if (typeof action.setData !== "function") {
      action.setData = () => {};
    }

    let actionHandlerParameters = {
      cancelUndo: false
    };

    let parameters = action.setData(args, actionHandlerParameters);
    if (parameters === undefined) {
      parameters = args;
    }

    if (!actions[name].executionState) {
      actions[name].executionState = 1;
    }

    let actionReturnedValue = actions[name].doAction(parameters, actionHandlerParameters);

    if (actionReturnedValue !== false) {
      actions[name].executionState = 2;
    } else if (!actions[name].executionState) {
      actions[name].executionState = 3;
    }

    if (action.undoAction)
      if (!actionHandlerParameters.cancelUndo &&
        action.undoAction &&
        !ignoreCommandHistory
      ) {
        let previousUndo = undoStack[undoStack.length - 1];
        if (
          (mergeUndo || action.mergeUndoByDefault) &&
          previousUndo !== undefined &&
          (
            Array.isArray(previousUndo) &&
            previousUndo[0].actionName === name
          )
        ) {

          let previousUndo = undoStack[undoStack.length - 1];
          undoStack[undoStack.length - 1].push({
            parameters: parameters
          });
        } else {
          if (mergeUndo || action.mergeUndoByDefault) {
            undoStack.push([{
              actionName: name,
              parameters: parameters
            }]);
          } else {
            undoStack.push({
              actionName: name,
              parameters: parameters
            });
          }
        }
        redoStack = [];
      }

    return actionReturnedValue;

  } else {
    console.warn("Unknown action: '" + name + "'");
  }
}

/**
 * addAction - Register an action that can be triggered either from a menu, a shortcut or the quick display bar
 *
 * @param  {string} name                                   Unique name to identify the action
 * @param  {function} doAction                             Called when the action is triggered. The first arg of this function is either the value returned by setData or whatever was passed as an argument to the .trigger() method
 * @param  {function} [setData = function(){}]             A function called before calling doAction. Put the returned value in the history stack and give it as a parameter to doAction()
 * @param  {function/bool} [undoAction = false]            The function to call when the action is undone. Receives the value that was returned by setData as first argument. Must be set to false if the action cannot be undone
 * @param  {number} [priority = 0]                         Higher priority actions are triggered before lower one if there's a conflict in shortcuts. If the functions returns true, it won't trigger any action that has a lower level than this one
 * @param  {bool} [displayable = true]                     A property that can be used to hide this action in menu / quick access bars
 * @param  {bool} [preventTriggerWhenInputFocused = true]  Prevents the action to be triggered using shortcuts when an input is focused
 * @param  {bool} [onShortcutRelease = function(){}]                 Called when the shortcut is released... I hate my life, this arg is so far in the arg list >>
 */
function addAction(name, action, setData = () => {}, undoAction = false, priority = 0, displayable = true, preventTriggerWhenInputFocused = true, onShortcutRelease = () => {}, preventTriggerWhenDialogOpen = true) {
  if (typeof name === "object") {
    actions[name.name] = {
      name: name.name,
      debug: name.debug === undefined ? false : name.debug,
      doAction: name.action,
      setData: name.setData === undefined ? false : name.setData,
      undoAction: name.undoAction === undefined ? false : name.undoAction,
      priority: name.priority || 0,
      mergeUndoByDefault: name.mergeUndoByDefault === undefined ? false : name.mergeUndoByDefault,
      displayable: name.displayable === undefined ? true : name.displayable,
      onShortcutRelease: name.onShortcutRelease || (() => {}),
      preventTriggerWhenInputFocused: name.preventTriggerWhenInputFocused === undefined ? true : name.preventTriggerWhenInputFocused,
      preventTriggerWhenDialogOpen: name.preventTriggerWhenDialogOpen === undefined ? true : name.preventTriggerWhenDialogOpen
    };
  } else {
    actions[name] = {
      name: name,
      doAction: action,
      setData: setData,
      undoAction: undoAction,
      priority: priority,
      displayable: displayable,
      onShortcutRelease: onShortcutRelease,
      preventTriggerWhenInputFocused: preventTriggerWhenInputFocused,
      preventTriggerWhenDialogOpen: preventTriggerWhenDialogOpen
    };
  }
}

function setHistory(newHistory) {
  let currentHistory = {
    undo: undoStack,
    redo: redoStack
  };
  undoStack = newHistory.undo;
  redoStack = newHistory.redo;

  return currentHistory;
}

module.exports.getActions = () => {
  return actions;
};

function getAccelerator(keybind, prettyPrint = false) {
  let accelerator = "";
  if (keybind.ctrl) accelerator += !prettyPrint ? "CmdOrCtrl+" : "Ctrl + ";
  if (keybind.alt) accelerator += !prettyPrint ? "Alt+" : "Alt + ";
  if (keybind.shift) accelerator += !prettyPrint ? "Shift+" : "Shift + ";

  let key = keybind.key.replace(/key/i, "");
  if (prettyPrint && key.length == 1) {
    key = key.toUpperCase();
  }
  accelerator += key;
  return accelerator;
}

// Returns the first shortcut available
function getActionAccelerator(actionIdentifier, prettyPrint = false) {
  for (let i = 0; i < keybinds.length; ++i) {
    if (actionIdentifier === keybinds[i].action) {
      return getAccelerator(keybinds[i], prettyPrint);
    }
  }
  return "";
}

// Returns true if the action is associated to an accelerator
// If accelerator is specified, it checks that the action has an accelerator and that the accelerator is the same as the one specified
// This is to prevent triggering a shortcut twice if it has an accelerator
// The seconds arg allows to assign multiples shortcuts with only one accelerator
function hasAccelerator(action, accelerator = "") {
  for (let i = 0; i < accelerators.length; ++i) {
    for (let j = 0; j < accelerators[i].items.length; ++j) {
      if (accelerators[i].items[j].action === action && !accelerators[i].items[j].doNotUseAccelerator && (accelerator === "" || accelerators[i].items[j].registeredAccelerator === accelerator)) {
        return true;
      }
    }
  }

  return false;
}

module.exports.separateMergeUndo = separateMergeUndo;
module.exports.getActionAccelerator = getActionAccelerator;
module.exports.handleKeyUp = handleKeyUp;
module.exports.handleKeyDown = handleKeyDown;
module.exports.setHistory = setHistory;
module.exports.addAction = addAction;
module.exports.trigger = trigger;
module.exports.undo = undo;
module.exports.redo = redo;