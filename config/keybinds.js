// Change keybinds here
// The key item must be one of the following:
// A character: 'a', 'b', ... , 'z', '+', '1', etc
// A key code: 'KeyA', 'Digit1', 'Escape' etc
// Note: the only reason to use a keycode is if you want to use shift and a number


module.exports = [{
    key: 'z',
    ctrl: true,
    alt: false,
    shift: false,
    action: "core: undo"
  },
  {
    key: 'y',
    ctrl: true,
    alt: false,
    shift: false,
    action: "core: redo"
  },
  {
    key: 's',
    ctrl: true,
    alt: false,
    shift: false,
    action: "core: save"
  },
  {
    key: 'o',
    ctrl: true,
    alt: false,
    shift: false,
    action: "file: open"
  },
  {
    key: 'r',
    ctrl: false,
    alt: false,
    shift: false,
    action: "blocks: auto layout"
  },
  {
    key: 'Space',
    ctrl: false,
    alt: false,
    shift: false,
    action: "blocks: display settings for selected block"
  },
  {
    key: 'p',
    ctrl: false,
    alt: false,
    shift: false,
    action: "blocks: display settings for selected block"
  },
  {
    key: 'n',
    ctrl: true,
    alt: false,
    shift: false,
    action: "tabs: create new tab"
  },
  {
    key: 't',
    ctrl: true,
    alt: false,
    shift: false,
    action: "tabs: create new tab"
  },
  {
    key: 'w',
    ctrl: true,
    alt: false,
    shift: false,
    action: "tabs: close current tab"
  },
  {
    key: 'Tab',
    ctrl: true,
    alt: false,
    shift: false,
    action: "tabs: switch to next tab"
  },
  {
    key: 'Tab',
    ctrl: true,
    alt: false,
    shift: true,
    action: "tabs: switch to previous tab"
  },
  {
    key: 'Delete',
    ctrl: false,
    alt: false,
    shift: false,
    action: "blocks: delete selected"
  },
  {
    key: 'Delete',
    ctrl: true,
    alt: false,
    shift: false,
    action: "blocks: delete selected and children"
  },
  {
    key: 'Delete',
    ctrl: false,
    alt: true,
    shift: false,
    action: "blocks: unlink selected block"
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
    action: "blocks: cancel block linking"
  },
  {
    key: 'Escape',
    ctrl: false,
    alt: false,
    shift: false,
    action: "blocks: close settings dialog and discard changes"
  },
  {
    key: 'Space',
    ctrl: false,
    alt: false,
    shift: false,
    action: "blocks: change current linking type"
  },
  {
    key: 'p',
    ctrl: true,
    alt: false,
    shift: true,
    action: "quick access bar: execute action dialog"
  },
  {
    key: 'Enter',
    ctrl: true,
    alt: false,
    shift: false,
    action: "quick access bar: add block dialog"
  },
  {
    key: 'Enter',
    ctrl: false,
    alt: false,
    shift: false,
    action: "blocks: close settings dialog"
  },
  {
    key: 'Enter',
    ctrl: false,
    alt: false,
    shift: false,
    action: "quick access bar: add linked normal block dialog"
  },
  {
    key: 'Enter',
    ctrl: false,
    alt: false,
    shift: true,
    action: "quick access bar: add linked else block dialog"
  },
  {
    key: 'Enter',
    ctrl: false,
    alt: true,
    shift: false,
    action: "quick access bar: add linked or block dialog"
  },
  {
    key: 'Enter',
    ctrl: false,
    alt: false,
    shift: false,
    action: "quick access bar: execute selected result"
  },
  {
    key: 'Escape',
    ctrl: false,
    alt: false,
    shift: false,
    action: "quick access bar: hide dialog"
  },
  {
    key: 'ArrowUp',
    ctrl: false,
    alt: false,
    shift: false,
    action: "quick access bar: previous result"
  },
  {
    key: 'ArrowDown',
    ctrl: false,
    alt: false,
    shift: false,
    action: "quick access bar: next result"
  },


  {
    key: 'ArrowDown',
    ctrl: true,
    alt: false,
    shift: false,
    action: "blocks: select last sibling"
  },
  {
    key: 'ArrowUp',
    ctrl: true,
    alt: false,
    shift: false,
    action: "blocks: select first sibling"
  },
  {
    key: 'ArrowLeft',
    ctrl: true,
    alt: false,
    shift: false,
    action: "blocks: select parent"
  },
  {
    key: 'ArrowRight',
    ctrl: true,
    alt: false,
    shift: false,
    action: "blocks: select child"
  },
  {
    key: 'ArrowLeft',
    ctrl: false,
    alt: true,
    shift: false,
    action: "blocks: select parent"
  },
  {
    key: 'ArrowRight',
    ctrl: false,
    alt: true,
    shift: false,
    action: "blocks: select child"
  },

  {
    key: 'ArrowDown',
    ctrl: false,
    alt: true,
    shift: false,
    action: "blocks: select next sibling"
  },
  {
    key: 'ArrowUp',
    ctrl: false,
    alt: true,
    shift: false,
    action: "blocks: select previous sibling"
  },

  {
    key: 'Tab',
    ctrl: false,
    alt: false,
    shift: false,
    action: "blocks: select next sibling"
  },
  {
    key: 'Tab',
    ctrl: false,
    alt: false,
    shift: true,
    action: "blocks: select previous sibling"
  },


  {
    key: 'ArrowDown',
    ctrl: false,
    alt: false,
    shift: false,
    action: "blocks: select block below"
  },
  {
    key: 'ArrowUp',
    ctrl: false,
    alt: false,
    shift: false,
    action: "blocks: select block above"
  },
  {
    key: 'ArrowLeft',
    ctrl: false,
    alt: false,
    shift: false,
    action: "blocks: select left block"
  },
  {
    key: 'ArrowRight',
    ctrl: false,
    alt: false,
    shift: false,
    action: "blocks: select right block"
  },

  {
    key: 'KeyW',
    ctrl: false,
    alt: true,
    shift: false,
    action: "camera: move up fast"
  },
  {
    key: 'KeyS',
    ctrl: false,
    alt: true,
    shift: false,
    action: "camera: move down fast"
  },
  {
    key: 'KeyA',
    ctrl: false,
    alt: true,
    shift: false,
    action: "camera: move left fast"
  },
  {
    key: 'KeyD',
    ctrl: false,
    alt: true,
    shift: false,
    action: "camera: move right fast"
  },
  {
    key: 'AltLeft',
    ctrl: false,
    alt: true,
    shift: false,
    action: "camera: notify move fast" // allows to start moving fast after the camera started moving
  },

  {
    key: 'KeyW',
    ctrl: false,
    alt: false,
    shift: false,
    action: "camera: move up"
  },
  {
    key: 'KeyS',
    ctrl: false,
    alt: false,
    shift: false,
    action: "camera: move down"
  },
  {
    key: 'KeyA',
    ctrl: false,
    alt: false,
    shift: false,
    action: "camera: move left"
  },
  {
    key: 'KeyD',
    ctrl: false,
    alt: false,
    shift: false,
    action: "camera: move right"
  },
  {
    key: 'Home',
    ctrl: false,
    alt: false,
    shift: false,
    action: "camera: reset position"
  },
  {
    key: 'h',
    ctrl: true,
    alt: false,
    shift: false,
    action: "camera: reset position"
  },
  {
    key: '0',
    ctrl: true,
    alt: false,
    shift: false,
    action: "camera: reset zoom"
  },
  {
    key: 'r',
    ctrl: true,
    alt: false,
    shift: false,
    action: "debug: reload"
  },
];
