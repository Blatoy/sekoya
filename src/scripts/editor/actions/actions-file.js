
module.exports.registerActions = () => {
  actionHandler.addAction("file: open", () => {
    fileManager.openWithDialog();
  });
};
