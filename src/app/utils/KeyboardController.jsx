import { find, concat } from 'lodash';
import Database from './Database';
import KEYS from './Keys.const';

// TODO: NEED TO ADD SETTINGS CONTROLLER ON UI FOR THIS!

export default class KeyboardController {
  constructor(opts) {
    const defaultOpts = {
      onButtonUp: undefined,
      onButtonDown: undefined
    }

    this.opts = Object.assign({}, defaultOpts, opts);

    this.keys = this.getKeys();

    this.handleKeyDown.bind(this);
    this.handleKeyPress.bind(this);
    this.handleKeyUp.bind(this);
  }

  handleKeyDown(e) {
    const key = find(this.keys, {value: e.keyCode});
    if (key) {
      if(typeof this.opts.onButtonDown !== 'undefined') {
        this.opts.onButtonDown(key.controller, key.key);
      }
      e.preventDefault();
    }
  };

  handleKeyUp(e) {
    const key = find(this.keys, {value: e.keyCode});
    if (key) {
      if(typeof this.opts.onButtonUp !== 'undefined') {
        this.opts.onButtonUp(key.controller, key.key);
      }
      e.preventDefault();
    }
  };

  handleKeyPress(e) {
    e.preventDefault();
  };

  getKeys() {
    const db = new Database();
    return db.get('KEYBOARDS').value();
  }
}
