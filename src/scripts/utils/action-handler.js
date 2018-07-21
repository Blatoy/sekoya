const keybinds = require(basePath + "/config/keybinds.js");
let actions = {};

window.addEventListener("keydown", (e) => {
  let suitableActions = [];
  let highestActionPriority = 0;

  // Find if the shortcuts should trigger an action
  for (let i = 0; i < keybinds.length; ++i) {
    let keybind = keybinds[i];
    if (
      (keybind.key.toLowerCase() == e.code.toLowerCase() || keybind.key.toLowerCase() == e.key.toLowerCase()) &&
      keybind.ctrl == e.ctrlKey &&
      keybind.shift == e.shiftKey &&
      keybind.alt == e.altKey) {

      if (actions[keybind.action]) {
        suitableActions.push(actions[keybind.action]);
      }
    }
  }

  suitableActions.sort(compareActionPriority);

  for(let i = 0; i < suitableActions.length; ++i) {
    let currentAction = suitableActions[i];
    let nextAction = suitableActions[i + 1];

    if(currentAction.action() && nextAction !== undefined && nextAction.priority < currentAction.priority) {
      break;
    }
  }
});

function compareActionPriority(a, b) {
  if(a.priority > b.priority) {
    return -1;
  }
  else {
    return 1;
  }
}

module.exports.executeAction = (name) => {
  if(actions[name]) {
    actions[name].action();
  }
};

module.exports.getActions = () => {
  return actions;
};

module.exports.addAction = (name, action, priority = 0) => {
  actions[name] = {
    action: action,
    priority: priority
  };
}
