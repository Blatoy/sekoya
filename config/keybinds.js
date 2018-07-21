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
    key: 'KeyZ',
    ctrl: true,
    alt: false,
    shift: false,
    action: "undo"
  },
  {
    key: 'KeyY',
    ctrl: true,
    alt: false,
    shift: false,
    action: "redo"
  },
  {
    key: 'KeyS',
    ctrl: true,
    alt: false,
    shift: false,
    action: "save"
  },
  {
    key: 'KeyR',
    ctrl: false,
    alt: false,
    shift: false,
    action: "auto block layout"
  },
  {
    key: 'KeyT',
    ctrl: true,
    alt: false,
    shift: false,
    action: "open new tab"
  },
  {
    key: 'KeyW',
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
  },
  {
    key: 'KeyP',
    ctrl: true,
    alt: false,
    shift: true,
    action: "quick access bar display"
  },
  {
    key: 'Enter',
    ctrl: false,
    alt: false,
    shift: false,
    action: "quick access bar add linked block"
  },
  {
    key: 'Enter',
    ctrl: false,
    alt: false,
    shift: true,
    action: "quick access bar add linked else block"
  },
  {
    key: 'Enter',
    ctrl: true,
    alt: false,
    shift: false,
    action: "quick access bar add block"
  },
  {
    key: 'Enter',
    ctrl: false,
    alt: false,
    shift: false,
    action: "quick access bar select action"
  },
  {
    key: 'Escape',
    ctrl: false,
    alt: false,
    shift: false,
    action: "quick access bar hide"
  },
  {
    key: 'ArrowUp',
    ctrl: false,
    alt: false,
    shift: false,
    action: "quick access bar previous result"
  },
  {
    key: 'ArrowDown',
    ctrl: false,
    alt: false,
    shift: false,
    action: "quick access bar next result"
  },
  {
    key: 'ArrowDown',
    ctrl: false,
    alt: false,
    shift: false,
    action: "block select down"
  },
  {
    key: 'ArrowUp',
    ctrl: false,
    alt: false,
    shift: false,
    action: "block select up"
  },
  {
    key: 'ArrowLeft',
    ctrl: false,
    alt: false,
    shift: false,
    action: "block select parent"
  },
  {
    key: 'ArrowRight',
    ctrl: false,
    alt: false,
    shift: false,
    action: "block select child"
  }
];
