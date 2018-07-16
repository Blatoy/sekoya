// Change keybinds here
// Available actions: undo, redo, save, autoLayout
// Key must be a valid "event.key" char
// You can get the "event.key" value of any key there: http://keycode.info/

// Default:
// ctrl-z         => undo
// ctrl-y         => redo
// ctrl-s         => save
// r              => auto block layout
// ctrl-t         => open new tab
// ctrl-w         => close current tab
// ctrl-Tab       => switch to next tab
// ctrl-shift-Tab => switch to previous tab
// Delete         => delete selected block
// Delete         => delete selected link
// ctrl-Delete    => delete selected block and children
// Escape         => cancel block linking

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
    key: 't',
    ctrl: true,
    alt: false,
    shift: false,
    action: "open new tab"
  },
  {
    key: 'w',
    ctrl: true,
    alt: false,
    shift: false,
    action: "close current tab"
  },
  {
    key: 'Tab',
    ctrl: true,
    alt: false,
    shift: false,
    action: "switch to next tab"
  },
  {
    key: 'Tab',
    ctrl: true,
    alt: false,
    shift: true,
    action: "switch to previous tab"
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
