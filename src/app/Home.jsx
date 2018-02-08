import React, { Component } from "react";
import DocumentTitle from "react-document-title";
import { filter, keys, concat, toNumber, split, differenceBy } from "lodash";
import { Controller } from "jsnes";
import keycode from "keycode";
import UIkit from "uikit";
import { KEYS, Database } from "./utils/Utils";

const db = new Database();

class Home extends Component {
  constructor(props) {
    super(props);

    // This binding is necessary to make `this` work in the callback
    if (typeof db.get("KEYBOARDS").value() === "undefined") {
      db.set("KEYBOARDS", KEYS).write();
    }

    this.keys = db.get("KEYBOARDS").value();
    this.keyPadNames = filter(keys(Controller).map(k => k.split("_").join(" ")), k =>
      k.match(/^BUTTON/gi)
    );

    this.state = {};

    this.handleDragOver = this.handleDragOver.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleSave = this.handleSave.bind(this);
  }

  componentDidMount() {
    this.keys.map(o => {
      this.setState({
        [`${o.controller}-${o.key}`]: keycode(o.value),
      });
    });
  }

  render() {
    const keys = [this.getControllerList(1), this.getControllerList(2)];

    return (
      <DocumentTitle title={this.props.title}>
        <div
          className="uk-flex uk-flex-column uk-flex-middle uk-flex-center Home"
          uk-height-viewport=""
          onDragOver={e => this.handleDragOver(e)}
          onDrop={e => this.handleDrop(e)}
        >
          <h1>
            {this.props.title}
            <small className="uk-text-small uk-text-muted">&nbsp;v1.0.0</small>
          </h1>

          <div uk-grid="">
            <button
              className="uk-button uk-button-default uk-margin-small-right"
              type="button"
              uk-toggle="target: #modal-controller-1"
            >
              Controller 1
            </button>
            <button
              className="uk-button uk-button-default uk-margin-small-right"
              type="button"
              uk-toggle="target: #modal-controller-2"
            >
              Controller 2
            </button>
          </div>
          <div
            id="modal-controller-1"
            uk-modal=""
            ref={el => {
              this.controller1 = el;
            }}
          >
            <div className="uk-modal-dialog uk-modal-body uk-margin-auto-vertical">
              {keys[0]}
              <div className="uk-margin uk-flex uk-flex-right">
                <button
                  onClick={e => this.handleSave(e, this.controller1)}
                  className="uk-button uk-button-primary"
                  type="button"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
          <div
            id="modal-controller-2"
            uk-modal=""
            ref={el => {
              this.controller2 = el;
            }}
          >
            <div className="uk-modal-dialog uk-modal-body uk-margin-auto-vertical">
              {keys[1]}
              <div className="uk-margin uk-flex uk-flex-right">
                <button
                  onClick={e => this.handleSave(e, this.controller2)}
                  className="uk-button uk-button-primary"
                  type="button"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </DocumentTitle>
    );
  }

  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }

  handleDrop(e) {
    e.preventDefault();
    let file;
    if (e.dataTransfer.items) {
      file = e.dataTransfer.items[0].getAsFile();
    } else {
      file = e.dataTransfer.files[0];
    }
    const name = file.name ? file.name : "Unknown";
    this.props.history.push({ pathname: "/run", state: { file, name } });
  }

  handleKeyUp(e) {
    e.preventDefault();
    const target = e.target;
    const value = keycode(e.keyCode);
    target.value = value;
    const key = target.name;

    this.setState({
      [key]: value,
    });
  }

  handleKeyDown(e) {
    e.target.value = "";
    e.preventDefault();
  }

  handleSave(e, el) {
    const data = keys(this.state).map(k => {
      const collections = concat(split(k, "-"), this.state[k]);
      const value = keycode(collections[2]);
      const name = keycode(value);

      return {
        controller: toNumber(collections[0]),
        key: toNumber(collections[1]),
        value,
        name,
      };
    });

    db.set("KEYBOARDS", data).write();

    const diff = differenceBy(data, db.get("KEYBOARDS").value(), "value");

    if (diff.length === 0) {
      UIkit.modal(el).hide();
    }
  }

  getControllerList(controllerId) {
    return filter(this.keys, { controller: controllerId }).map(o => {
      const keyName = keycode.names[o.value];
      const keyPadName = this.keyPadNames[o.key];
      return (
        <div
          key={`${o.controller}-${o.key}`}
          className="uk-child-width-1-2 uk-child-width-1-2@m uk-margin"
          uk-grid=""
        >
          <div className="uk-flex uk-flex-middle">
            <label className="uk-form-label">{keyPadName}</label>
          </div>
          <div>
            <div className="uk-form-controls">
              <input
                name={`${o.controller}-${o.key}`}
                defaultValue={keyName}
                onKeyDown={e => this.handleKeyDown(e)}
                onKeyUp={e => this.handleKeyUp(e)}
                className="uk-input"
                id="form-horizontal-text"
                type="text"
                placeholder="Please Press A Key..."
              />
            </div>
          </div>
        </div>
      );
    });
  }
}

export default Home;
