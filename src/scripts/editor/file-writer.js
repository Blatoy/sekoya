const dialog = require('electron').remote.dialog;
const fs = require("fs");
const path = require("path");
const remote = require('electron').remote;


// Open the "Save as" dialog and saves the file
function saveAs(tab, callback = () => {}) {
  dialog.showSaveDialog(remote.getCurrentWindow(), {
    title: "Save as...",
    defaultPath: tab.getFileLocation(),
    filters: [{
      name: "",
      extensions: blocksParser.FILE_EXTENSIONS
    }]
  }, (location) => {
    if (location) {
      tab.fileLocation = path.dirname(location) + path.sep;
      tab.name = path.basename(location);

      save(tab, location, callback);
    }
  });
}

// Save the file using the current blocks parser
function save(tab, path = false, callback = () => {}) {
  // Check if file location exists
  fs.lstat(path, (err, stats) => {
    if (!stats && tab.fileLocation === "") {
      saveAs(tab, callback);
    } else {

      const stringToSave = blocksParser.convertToString();

      fs.writeFile(path, stringToSave, function() {
        tab.setSaved(true);
        tabManager.notifyTabDisplayer();
        callback();
      });
    }
  });
}

module.exports.save = save;
module.exports.saveAs = saveAs;
