// Change keybinds here
// Available actions: undo, redo, save, autoLayout
// Key must be a valid "event.key" char
// You can get the "event.key" value of any key there: http://keycode.info/

module.exports = [{
    key: 'z',
    ctrl: true,
    alt: false,
    shift: false,
    action: "undo"
  },
  {
    key: 'y',
    ctrl: true,
    alt: false,
    shift: false,
    action: "redo"
  },
  {
    key: 's',
    ctrl: true,
    alt: false,
    shift: false,
    action: "save"
  },
  {
    key: 'r',
    ctrl: false,
    alt: false,
    shift: false,
    action: "auto block layout"
  },
  {
    key: 'Delete',
    ctrl: false,
    alt: false,
    shift: false,
    action: "delete selected block"
  },
  {
    key: 'Delete',
    ctrl: true,
    alt: false,
    shift: false,
    action: "delete selected block and children"
  },
  {
    key: 'Delete',
    ctrl: false,
    alt: false,
    shift: false,
    action: "delete selected link"
  },
  {
    key: 'Escape',
    ctrl: false,
    alt: false,
    shift: false,
    action: "cancel block linking"
  }
];
