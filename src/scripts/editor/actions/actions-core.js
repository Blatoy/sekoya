module.exports.registerActions = () => {
  actionHandler.addAction({
    name: "core: display about",
    action: () => {
      document.getElementById("about-background").style.display = "block";
    }
  });

  actionHandler.addAction({
    name: "core: hide about",
    action: () => {
      if (document.getElementById("about-background").style.display === "block") {
        document.getElementById("about-background").style.display = "none";
        localStorage.firstLaunchDone = true;
      }
    }
  });

  actionHandler.addAction({
    name: "core: undo",
    action: () => {
      actionHandler.undo();
    }
  });

  actionHandler.addAction({
    name: "core: redo",
    action: () => {
      actionHandler.redo();
    }
  });
};
