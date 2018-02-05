import React, { Component } from 'react';

class Screen extends Component {
  constructor(props){
    super(props);

    this.$ = {
      context: undefined,
      canvas: undefined,
      imageData: undefined,
      buf: undefined,
      buf8: undefined,
      buf32: undefined
    };

    this.writeBuffer.bind(this);
    this.setBuffer.bind(this);
  }
  render() {
    return (
      <canvas
        className="Screen"
        width="256"
        height="240"
        onMouseDown={e => this.handleMouseDown(e)}
        onMouseUp={this.props.onMouseUp}
        ref={canvas => {
          this.canvas = canvas;
        }}
      />
    );
  }

  componentDidMount() {
    this.initCanvas();
  }

  initCanvas() {
    const canvas = this.canvas;
    const context = canvas.getContext("2d");
    const imageData = context.getImageData(0, 0, 256, 240);

    context.fillStyle = "black";
    // set alpha to opaque
    context.fillRect(0, 0, 256, 240);

    // buffer to write on next animation frame
    const buf = new ArrayBuffer(imageData.data.length);
    // Get the canvas buffer in 8bit and 32bit
    const buf8 = new Uint8ClampedArray(buf);
    let buf32 = new Uint32Array(buf);
    this.$ = Object.assign({}, this.$, {
      canvas,
      context,
      buf,
      buf8,
      buf32,
      imageData
    });

    // Set alpha
    for (let i = 0; i < buf32.length; ++i) {
      if(this.$.buf32 !== 'undefined' && this.$.buf32.length) {
        this.$.buf32[i] = 0xff000000;
      }
    }
  }

  setBuffer(buffer) {
    var i = 0;
    for (var y = 0; y < 240; ++y) {
      for (var x = 0; x < 256; ++x) {
        i = y * 256 + x;
        // Convert pixel from NES BGR to canvas ABGR
        if(this.$.buf32 !== 'undefined' && this.$.buf32.length) {
          this.$.buf32[i] = 0xff000000 | buffer[i]; // Full alpha
        }
      }
    }
  };

  writeBuffer() {
    this.$.imageData.data.set(this.$.buf8);
    this.$.context.putImageData(this.$.imageData, 0, 0);
  };

  fitInParent() {
    const canvas = this.$.canvas;
    const parent = canvas.parentNode;
    const parentWidth = parent.clientWidth;
    const parentHeight = parent.clientHeight;
    const parentRatio = parentWidth / parentHeight;
    const desiredRatio = 256 / 240;
    if (desiredRatio < parentRatio) {
      this.canvas.style.width = `${Math.round(parentHeight * desiredRatio)}px`;
      this.canvas.style.height = `${parentHeight}px`;
    } else {
      this.canvas.style.width = `${parentWidth}px`;
      this.canvas.style.height = `${Math.round(parentWidth / desiredRatio)}px`;
    }
    
    this.$ = Object.assign({}, this.$, {canvas: this.canvas});
  };

  handleMouseDown(e) {
    if (!this.props.onMouseDown) return;
    // Make coordinates unscaled
    const scale = 256 / parseFloat(this.$.canvas.style.width);
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) * scale);
    const y = Math.round((e.clientY - rect.top) * scale);
    this.props.onMouseDown(x, y);
  };
}

export default Screen;