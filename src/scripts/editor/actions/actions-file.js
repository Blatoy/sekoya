
module.exports.registerActions = () => {
  actionHandler.addAction("file: open", () => {
    fileManager.openWithDialog();
  });

  actionHandler.addAction("file: save", () => {
    fileManager.save(tabManager.getCurrentTab(), tabManager.getCurrentTab().getFileLocation());
  });

  actionHandler.addAction("file: save as", () => {
    fileManager.saveAs(tabManager.getCurrentTab());
  });
};
