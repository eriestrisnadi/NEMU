import { Controller } from 'jsnes';

// Mapping keyboard code to [controller, button]
const KEYS = {
  88: [1, Controller.BUTTON_A], // X
  89: [1, Controller.BUTTON_B], // Y (Central European keyboard)
  90: [1, Controller.BUTTON_B], // Z
  17: [1, Controller.BUTTON_SELECT], // Right Ctrl
  13: [1, Controller.BUTTON_START], // Enter
  38: [1, Controller.BUTTON_UP], // Up
  40: [1, Controller.BUTTON_DOWN], // Down
  37: [1, Controller.BUTTON_LEFT], // Left
  39: [1, Controller.BUTTON_RIGHT], // Right
  103: [2, Controller.BUTTON_A], // Num-7
  105: [2, Controller.BUTTON_B], // Num-9
  99: [2, Controller.BUTTON_SELECT], // Num-3
  97: [2, Controller.BUTTON_START], // Num-1
  104: [2, Controller.BUTTON_UP], // Num-8
  98: [2, Controller.BUTTON_DOWN], // Num-2
  100: [2, Controller.BUTTON_LEFT], // Num-4
  102: [2, Controller.BUTTON_RIGHT], // Num-6
};

// TODO: NEED TO ADD SETTINGS CONTROLLER ON UI FOR THIS!

export default class KeyboardController {
  constructor(opts) {
    const defaultOpts = {
      onButtonUp: undefined,
      onButtonDown: undefined
    }

    this.opts = Object.assign({}, defaultOpts, opts);

    this.handleKeyDown.bind(this);
    this.handleKeyPress.bind(this);
    this.handleKeyUp.bind(this);
  }

  handleKeyDown(e) {
    const key = KEYS[e.keyCode];
    if (key) {
      if(typeof this.opts.onButtonDown !== 'undefined') {
        this.opts.onButtonDown(key[0], key[1]);
      }
      e.preventDefault();
    }
  };

  handleKeyUp(e) {
    const key = KEYS[e.keyCode];
    if (key) {
      if(typeof this.opts.onButtonUp !== 'undefined') {
        this.opts.onButtonUp(key[0], key[1]);
      }
      e.preventDefault();
    }
  };

  handleKeyPress(e) {
    e.preventDefault();
  };
}
