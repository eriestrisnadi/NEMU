import React, { Component } from "react";
import { NES } from "jsnes";
import DocumentTitle from "react-document-title";
import { isNumber } from "lodash";
import Screen from "./Screen";
import pkg from "../../package.json";
import { Speaker, FrameTimer, KeyboardController } from "./utils/Utils";

class Run extends Component {
  constructor(props) {
    super(props);
    this.state = {
      running: false,
      fps: 0,
    };

    // This binding is necessary to make `this` work in the callback
    this.handleDragOver = this.handleDragOver.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleLoaded = this.handleLoaded.bind(this);
    this.handleGoBack = this.handleGoBack.bind(this);
  }

  render() {
    return (
      <DocumentTitle
        title={`${this.props.location.state.name.replace(".nes", "")} - ${this.props.title}`}
      >
        <div>
          <div className="uk-navbar-container uk-navbar-transparent">
            <div className="uk-container uk-container-expand">
              <nav uk-navbar="">
                <div className="uk-navbar-left">
                  <div className="uk-navbar-item">
                    <button
                      type="button"
                      className="uk-button uk-button-default"
                      onClick={e => this.handleGoBack(e)}
                    >
                      Back
                    </button>
                  </div>
                </div>
                <div className="uk-navbar-right">
                  <div className="uk-navbar-item">{`FPS: ${this.state.fps}`}</div>
                </div>
              </nav>
            </div>
          </div>
          <div
            className="uk-flex uk-flex-middle uk-flex-center"
            uk-height-viewport="offset-top: true"
          >
            <Screen
              ref={screen => {
                this.screen = screen;
              }}
              onGenerateFrame={() => {
                this.nes.frame();
              }}
              onMouseDown={(x, y) => {
                this.nes.zapperMove(x, y);
                this.nes.zapperFireDown();
              }}
              onMouseUp={() => {
                this.nes.zapperFireUp();
              }}
            />
          </div>
        </div>
      </DocumentTitle>
    );
  }

  load() {
    if (this.props.location.state && this.props.location.state.file) {
      const reader = new FileReader();
      reader.readAsBinaryString(this.props.location.state.file);
      reader.onload = e => {
        this.handleLoaded(e.target.result);
      };
    } else {
      window.alert("No ROM provided");
    }
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
    this.props.history.push({ pathname: "/" });
    setTimeout(() => {
      this.props.history.push({ pathname: "/run", state: { file, name } });
    }, 500);
  }

  handleLoaded(data) {
    this.setState({ running: true });
    this.nes.loadROM(data);
    this.start();
  }

  start() {
    this.frameTimer.start();
    this.speakers.start();
    this.fpsInterval = setInterval(() => {
      let fps = this.nes.getFPS();
      isNumber(fps)
        ? fps = fps.toFixed(1)
        : fps = 0;
        
      this.setState({ fps });
      // console.log(`FPS: ${this.nes.getFPS()}`);
    }, 1000);
  }

  stop() {
    this.frameTimer.stop();
    this.speakers.stop();
    clearInterval(this.fpsInterval);
  }

  layout() {
    setTimeout(() => {
      this.screen.fitInParent();
    }, 100);
  }

  handleResize(e) {
    this.layout();
  }

  handleGoBack(e) {
    this.props.history.push({ pathname: "/" });
    window.location.reload();
  }

  componentDidMount() {
    this.speakers = new Speaker({
      onBufferUnderrun: (actualSize, desiredSize) => {
        if (!this.state.running) {
          return;
        }
        // Skip a video frame so audio remains consistent. This happens for
        // a variety of reasons:
        // - Frame rate is not quite 60fps, so sometimes buffer empties
        // - Page is not visible, so requestAnimationFrame doesn't get fired.
        //   In this case emulator still runs at full speed, but timing is
        //   done by audio instead of requestAnimationFrame.
        // - System can't run emulator at full speed. In this case it'll stop
        //    firing requestAnimationFrame.
        console.log("Buffer underrun, running another frame to try and catch up");
        this.nes.frame();
        // desiredSize will be 2048, and the NES produces 1468 samples on each
        // frame so we might need a second frame to be run. Give up after that
        // though -- the system is not catching up
        if (this.speakers.buffer.size() < desiredSize) {
          console.log("Still buffer underrun, running a second frame");
          this.nes.frame();
        }
      },
    });

    this.nes = new NES({
      onFrame: buffer => this.screen.setBuffer(buffer),
      onStatusUpdate: console.log,
      onAudioSample: (left, right) => this.speakers.writeSample(left, right),
    });

    this.frameTimer = new FrameTimer({
      onGenerateFrame: this.nes.frame,
      onWriteFrame: () => this.screen.writeBuffer(),
    });

    this.keyboardController = new KeyboardController({
      onButtonDown: this.nes.buttonDown,
      onButtonUp: this.nes.buttonUp,
    });
    document.addEventListener("keydown", e => this.keyboardController.handleKeyDown(e));
    document.addEventListener("keyup", e => this.keyboardController.handleKeyUp(e));
    document.addEventListener("keypress", e => this.keyboardController.handleKeyPress(e));

    this.layout();
    window.addEventListener("resize", e => this.handleResize(e));

    document.addEventListener("dragover", e => this.handleDragOver(e));
    document.addEventListener("drop", e => this.handleDrop(e));

    this.load();
  }

  componentWillUnmount() {
    this.stop();
    document.removeEventListener("keydown", e => this.keyboardController.handleKeyDown(e));
    document.removeEventListener("keyup", e => this.keyboardController.handleKeyUp(e));
    document.removeEventListener("keypress", e => this.keyboardController.handleKeyPress(e));
    document.removeEventListener("dragover", e => this.handleDragOver(e));
    document.removeEventListener("drop", e => this.handleDrop(e));
    window.removeEventListener("resize", e => this.handleResize(e));
  }
}

export default Run;
