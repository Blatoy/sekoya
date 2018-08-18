const {remote} = require('electron');
const {Menu, MenuItem, globalShortcut} = remote;
const topMenuItems = require(basePath + "/config/menu.json").topMenu;

const menu = new Menu();

module.exports.setMenu = function() {
  for(let i = 0 ; i < topMenuItems.length; ++i) {

    let menuItems = [];
    for(let j = 0; j < topMenuItems[i].items.length; ++j) {
      let menuItem = topMenuItems[i].items[j];
      if(menuItem.type === "separator") {
          menuItems.push(new MenuItem({type: "separator"}));
      }
      else {
        let accelerator = menuItem.doNotUseAccelerator ? "" : actionHandler.getActionAccelerator(menuItem.action);
        menuItem.registeredAccelerator = accelerator;
        menuItems.push(
          new MenuItem(
            {
              label: menuItem.label,
              accelerator: accelerator,
              click(e) {
                actionHandler.trigger(menuItem.action);
              }
            }
          )
        );
      }
    }
    menu.append(new MenuItem({label: topMenuItems[i].label, submenu: menuItems}));
  }

  remote.Menu.setApplicationMenu(menu);
};
