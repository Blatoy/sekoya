module.exports.registerActions = () => {
  actionHandler.addAction("tabs: create new tab", () => {
    tabManager.newTab();
  });

  actionHandler.addAction("tabs: close current tab", () => {
    tabManager.closeCurrentTab();
  });

  actionHandler.addAction("tabs: switch to previous tab", () => {
    tabManager.switchTab(-1);
  });

  actionHandler.addAction("tabs: switch to next tab", () => {
    tabManager.switchTab(1);
  });

  actionHandler.addAction("tabs: close tab", (index) => {
    tabManager.closeTab(index);
  }, setData = (index) => {
    return index;
  }, false, 0, false);
};
