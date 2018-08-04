const DISPLAY_DEBUG_COMMANDS = true;

module.exports.registerActions = () => {
  actionHandler.addAction("debug: reload", () => {
    location.reload();
  }, false, false, 0, DISPLAY_DEBUG_COMMANDS, false);

  actionHandler.addAction("debug: log definitions", () => {
    console.log(blockLoader.getBlockDefinitions())
  }, false, false, 0, DISPLAY_DEBUG_COMMANDS, false);

  // undo stack test that doesn't make any sense to keep anyway
  /*actionHandler.addAction("debug: add log to undo stack", (num) => {
    console.log("Added " + num + " to history");
  }, () => {
    return Math.round(Math.random() * 100);
  }, (num) => {
    console.log("Removed " + num + " from history");
  }, 0, DISPLAY_DEBUG_COMMANDS);*/

  actionHandler.addAction("debug: log undo stack", () => {
    let currentHistory = actionHandler.setHistory({}, {});
    console.log(currentHistory);
    actionHandler.setHistory(currentHistory.undo, currentHistory.redo);

  }, false, false, 0, DISPLAY_DEBUG_COMMANDS, false);
};
