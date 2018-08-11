const {remote} = require('electron');
const {Menu, MenuItem, globalShortcut} = remote;
const contextMenu = require(basePath + "/config/menu.json").contextMenu;

const menu = new Menu();

module.exports.setMenu = function() {
  for(let i = 0; i < contextMenu.length; ++i) {
    let menuItem = contextMenu[i];
    if(menuItem.type === "separator") {
        menu.append(new MenuItem({type: "separator"}));
    }
    else {
      console.log( menuItem.doNotUseAccelerator);
      menu.append(
        new MenuItem(
          {
            label: menuItem.label,
            accelerator: menuItem.doNotUseAccelerator ? "" : actionHandler.getActionAccelerator(menuItem.action),
            click() {
              actionHandler.trigger(menuItem.action);
            }
          }
        )
      );
    }
  }


  window.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    menu.popup({window: remote.getCurrentWindow()})
  }, false)
};
