
module.exports.registerActions = () => {
  actionHandler.addAction("file: open", () => {
    fileManager.openWithDialog();
  });

  actionHandler.addAction("file: save", () => {
    // fileManager.openWithDialog();
  });

  actionHandler.addAction("file: save as", () => {
    // fileManager.openWithDialog();
  });
};
