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

  let menuHidden = false;
  actionHandler.addAction({
    name: "core: toggle block list",
    action: () => {
      if (!menuHidden) {
        document.getElementById("block-list").style.display = "none";
        document.getElementById("tab-list-container").style.float = "left";
        document.getElementById("tab-list-container").style.width = "calc(100% - 1px)";
        document.getElementsByTagName("main")[0].style.float = "left";
        document.getElementsByTagName("main")[0].style.width = "calc(100% - 1px)";
      } else {
        document.getElementById("block-list").style.display = "block";
        document.getElementById("tab-list-container").style.float = "right";
        document.getElementById("tab-list-container").style.width = "calc(100% - 251px)";
        document.getElementsByTagName("main")[0].style.float = "right";
        document.getElementsByTagName("main")[0].style.width = "calc(100% - 251px)";
      }
      menuHidden = !menuHidden;
      require(utilsFolderPath + "event-handler.js").setCanvasSize();
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