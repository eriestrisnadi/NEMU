import { find, concat } from 'lodash';
import Database from './Database';
import KEYS from './Keys.const';

const db = new Database();

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
    const key = find(this.getKeys(), {value: e.keyCode});
    if (key) {
      if(typeof this.opts.onButtonDown !== 'undefined') {
        this.opts.onButtonDown(key.controller, key.key);
      }
      e.preventDefault();
    }
  };

  handleKeyUp(e) {
    const key = find(this.getKeys(), {value: e.keyCode});
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
    return concat([], KEYS, db.get('KEYBOARDS').value());
  }
}
