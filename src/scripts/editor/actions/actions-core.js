/*
actionHandler.addAction("open new tab", () => {
  addTab("untitled" + tabs.length + ".xml", [], true);
});

actionHandler.addAction("close current tab", () => {
  closeTab(tabs.indexOf(getCurrentTab()));
});

actionHandler.addAction("switch to next tab", () => {
  switchTab();
});

actionHandler.addAction("switch to previous tab", () => {
  switchTab(true);
});
*/
module.exports.registerActions = () => {
  actionHandler.addAction("core: display about", () => {
    document.getElementById("about-background").style.display = "block";
  });

  actionHandler.addAction("core: hide about", () => {
    if(document.getElementById("about-background").style.display === "block") {
      document.getElementById("about-background").style.display = "none";
      localStorage.firstLaunchDone = true;
    }
  });

  actionHandler.addAction("core: undo", () => {
    actionHandler.undo();
  });

  actionHandler.addAction("core: redo", () => {
    actionHandler.redo();
  });
};
