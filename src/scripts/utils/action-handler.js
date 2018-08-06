const keybinds = require(basePath + "/config/keybinds.js");
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

    // e.code = KeyZ, e.key = Y, thus why we try to avoid e.code except if we don't have a choice
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
        if (actions[keybind.action].preventTriggerWhenInputFocused && document.activeElement.tagName === "INPUT") {
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
        if (actions[keybind.action].preventTriggerWhenInputFocused && document.activeElement.tagName === "INPUT") {
          continue;
        } else {
          actions[keybind.action].onShortcutRelease();
        }
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
    actions[actionHistory.actionName].undoAction(actionHistory.parameters);
  }
}

function redo() {
  if (redoStack.length > 0) {
    let actionHistory = redoStack.pop();
    undoStack.push(actionHistory);
    actions[actionHistory.actionName].doAction(actionHistory.parameters);
  }
}

function trigger(name, args, ignoreCommandHistory = false) {
  if (actions[name] !== undefined) {
    let action = actions[name];

    if (typeof action.setData !== "function") {
      action.setData = () => {};
    }

    let parameters = action.setData(args);

    if (action.undoAction && !ignoreCommandHistory) {
      undoStack.push({
        actionName: name,
        parameters: parameters
      });
      redoStack = [];
    }


    return actions[name].doAction(parameters);
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
function addAction(name, doAction, setData = () => {}, undoAction = false, priority = 0, displayable = true, preventTriggerWhenInputFocused = true, onShortcutRelease = () => {}) {
  actions[name] = {
    name: name,
    doAction: doAction,
    setData: setData,
    undoAction: undoAction,
    priority: priority,
    displayable: displayable,
    onShortcutRelease: onShortcutRelease,
    preventTriggerWhenInputFocused: preventTriggerWhenInputFocused
  };
}

function setHistory(undo, redo) {
  let currentHistory = {
    undo: undoStack,
    redo: redoStack
  };
  undoStack = undo;
  redoStack = redo;

  return currentHistory;
}

module.exports.getActions = () => {
  return actions;
};

module.exports.handleKeyUp = handleKeyUp;
module.exports.handleKeyDown = handleKeyDown;
module.exports.setHistory = setHistory;
module.exports.addAction = addAction;
module.exports.trigger = trigger;
module.exports.undo = undo;
module.exports.redo = redo;
