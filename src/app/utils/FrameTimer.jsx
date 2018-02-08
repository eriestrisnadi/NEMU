// FrameTimer is two timers: one which triggers at 60 FPS, and the other which
// triggers whenever there is an animation frame.
//
// Normally, the animation frame is 60 FPS, but if it isn't, we need to
// bodge it by setting up another timer.
//
// Why not just use the bodge all the time? If the animation frame is 60 FPS,
// then it is a much more accurate timer than setInterval. Also, two timers
// will sometimes be out of sync, causing missed frames.
export default class FrameTimer {
  constructor(opts = {}) {
    const defaultOpts = {
      running: false,
      bodgeMode: false,
      desiredFPS: 60,
      calibrationDelay: 200,
      calibrationFrames: 10,
      calibrationTolerance: 5,
      calibrating: false,
      calibrationStartTime: null,
      calibrationCurrentFrames: null,
      onGenerateFrame: undefined,
      onWriteFrame: undefined,
    };

    this.opts = Object.assign({}, defaultOpts, opts);
  }

  start() {
    this.opts.running = true;
    this.requestAnimationFrame();
    if (this.opts.bodgeMode) this.startBodgeMode();
  }

  stop() {
    this.opts.running = false;
    if (this.opts._requestID) window.cancelAnimationFrame(() => this.opts._requestID());
    if (this.opts.bodgeInterval) clearInterval(this.opts.bodgeInterval);
  }

  requestAnimationFrame() {
    this.opts._requestID = window.requestAnimationFrame(() => this.onAnimationFrame());
  }

  onAnimationFrame() {
    if (this.opts.calibrating) {
      if (this.opts.calibrationStartTime === null) {
        this.opts.calibrationStartTime = new Date().getTime();
        this.opts.calibrationCurrentFrames = 0;
      } else {
        this.opts.calibrationCurrentFrames += 1;
      }

      // Calibration complete!
      if (this.opts.calibrationCurrentFrames === this.opts.calibrationFrames) {
        this.opts.calibrating = false;

        let now = new Date().getTime();
        let delta = now - this.opts.calibrationStartTime;
        let fps = 1000 / (delta / this.opts.calibrationFrames);

        if (
          fps <= this.opts.desiredFPS - this.opts.calibrationTolerance ||
          fps >= this.opts.desiredFPS + this.opts.calibrationTolerance
        ) {
          console.log(
            `Enabling bodge mode. (Desired FPS is ${
              this.opts.desiredFPS
            }, actual FPS is ${fps})`
          );
          this.startBodgeMode();
        }
      }
    }

    this.requestAnimationFrame();

    if (this.opts.running) {
      if (!this.opts.bodgeMode) {
        this.opts.onGenerateFrame();
      }
      this.opts.onWriteFrame();
    }
  }

  startBodgeMode() {
    this.opts.bodgeMode = true;
    this.opts.bodgeInterval = setInterval(() => this.onBodge(), 1000 / this.opts.desiredFPS);
  }

  onBodge() {
    if (this.opts.running) {
      this.opts.onGenerateFrame();
    }
  }
}
