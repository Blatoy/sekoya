const {remote} = require('electron');
const {Menu, MenuItem} = remote;

const menu = new Menu();

module.exports.setMenu = function() {
  menu.append(new MenuItem({label: 'File', submenu: [
    new MenuItem({label: 'MenuItem 1', click() { console.log('item 1 clicked') }}),
    new MenuItem({label: 'MenuItem 2', click() { console.log('item 1 clicked') }}),
    new MenuItem({label: 'MenuItem 3', click() { console.log('item 1 clicked') }})
  ]}));

  menu.append(new MenuItem({label: 'Edit', submenu: [
    new MenuItem({label: 'MenuItem 1', click() { console.log('item 1 clicked') }}),
    new MenuItem({label: 'MenuItem 2', click() { console.log('item 1 clicked') }}),
    new MenuItem({label: 'MenuItem 3', click() { console.log('item 1 clicked') }})
  ]}));

  menu.append(new MenuItem({label: 'Settings', submenu: [
    new MenuItem({label: 'MenuItem 1', click() { console.log('item 1 clicked') }}),
    new MenuItem({label: 'MenuItem 2', click() { console.log('item 1 clicked') }}),
    new MenuItem({label: 'MenuItem 3', click() { console.log('item 1 clicked') }})
  ]}));

  menu.append(new MenuItem({label: 'About', submenu: [
    new MenuItem({label: 'MenuItem 1', click() { console.log('item 1 clicked') }}),
    new MenuItem({label: 'MenuItem 2', click() { console.log('item 1 clicked') }}),
    new MenuItem({label: 'MenuItem 3', click() { console.log('item 1 clicked') }})
  ]}));

  Menu.setApplicationMenu(menu);
};
