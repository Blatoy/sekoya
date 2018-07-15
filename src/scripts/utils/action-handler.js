const keybinds = require(basePath + "/config/keybinds.js");
let actions = {};

window.addEventListener("keydown", (e) => {
  for (let i = 0; i < keybinds.length; ++i) {
    let keybind = keybinds[i];
    if (keybind.key == e.key &&
      keybind.ctrl == e.ctrlKey &&
      keybind.shift == e.shiftKey &&
      keybind.alt == e.altKey) {

      if(actions[keybind.action]) {
        actions[keybind.action]();
      }

    }
  }
});

module.exports.addAction = function(name, action) {
  actions[name] = action;
}
