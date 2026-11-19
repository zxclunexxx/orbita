/* ORBITA — a quiet, entirely procedural Web Audio soundscape. */
(function () {
  'use strict';

  const SCENES = {
    horizon: { notes: [55, 82.4069, 110, 164.8138], cutoff: 850, shimmer: 440 },
    nebula: { notes: [65.4064, 97.9989, 130.8128, 195.9977], cutoff: 1250, shimmer: 523.251 },
    system: { notes: [73.4162, 110, 146.8324, 220], cutoff: 1750, shimmer: 587.33 }
  };

  class CosmosAudio {
    constructor() {
      this.enabled = false;
      this.scene = 'horizon';
      this.context = null;
      this._destroyed = false;
      this._version = 0;
      this._pads = [];
      this._nodes = [];
      this._voices = new Set();
      this._ambientTimer = null;
      this._suspendTimer = null;
      this._lastWarp = -Infinity;
      this._lastPlanet = -Infinity;
    }

    async enable() {
      if (this._destroyed) throw new Error('This soundscape has been closed.');
      if (!this.context) this._build();
      const context = this.context;
      const version = ++this._version;
      this.enabled = true;
      clearTimeout(this._suspendTimer);
      this._suspendTimer = null;
      try {
        // Call from a button or keyboard gesture so browsers can authorize audio.
        await context.resume();
        if (version !== this._version || this._destroyed || !this.enabled) return;
        if (context.state !== 'running') throw new Error('Audio playback is unavailable.');
      } catch (error) {
        if (version !== this._version || this._destroyed) return;
        this.enabled = false;
        throw error;
      }
      if (version !== this._version || this._destroyed || !this.enabled) return;
      this._approach(this._master.gain, 0.48, 0.35);
      this._scheduleAmbient();
    }

    disable() {
      this.enabled = false;
      ++this._version;
      clearTimeout(this._ambientTimer);
      clearTimeout(this._suspendTimer);
      this._ambientTimer = null;
      this._suspendTimer = null;
      if (!this.context || this._destroyed) return;
      this._approach(this._master.gain, 0, 0.14);
      const context = this.context;
      this._suspendTimer = setTimeout(() => {
        this._suspendTimer = null;
        if (!this.enabled && !this._destroyed && context.state !== 'closed') {
          context.suspend().catch(() => {});
        }
      }, 850);
    }

    setScene(scene) {
      if (!Object.prototype.hasOwnProperty.call(SCENES, scene) || this._destroyed) return;
      this.scene = scene;
      if (!this.context) return;
      const settings = SCENES[scene];
      this._pads.forEach((pad) => this._approach(pad.osc.frequency, settings.notes[pad.index], 1.5));
      this._approach(this._filter.frequency, settings.cutoff, 1.7);
    }

    warp() {
      if (!this._canPlay()) return;
      const now = this.context.currentTime;
      if (now - this._lastWarp < 0.65 || this._voices.size > 18) return;
      this._lastWarp = now;
      // Rounded sine sweeps give motion without a loud broadband noise burst.
      const root = SCENES[this.scene].notes[0];
      [-0.55, 0.55].forEach((pan, index) => {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        const panner = this._panner(pan);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(root * (1 + index * 0.005), now);
        osc.frequency.exponentialRampToValueAtTime(root * 9, now + 0.95);
        osc.frequency.exponentialRampToValueAtTime(root * 4, now + 2.2);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.055, now + 0.65);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.3);
        gain.gain.linearRampToValueAtTime(0, now + 2.4);
        osc.connect(gain).connect(panner).connect(this._effects);
        this._track(osc, [gain, panner]);
        osc.start(now);
        osc.stop(now + 2.45);
      });
      this._tone(root * 8, 0.02, 2.8, 0, 0.85);
    }

    planet() {
      if (!this._canPlay()) return;
      const now = this.context.currentTime;
      if (now - this._lastPlanet < 0.18) return;
      this._lastPlanet = now;
      const root = SCENES[this.scene].shimmer;
      this._tone(root, 0.052, 2.2, -0.22);
      this._tone(root * 1.5, 0.027, 2.8, 0.28, 0.1);
      this._tone(root * 2, 0.012, 2.1, 0.05, 0.2);
    }

    destroy() {
      if (this._destroyed) return;
      this.enabled = false;
      this._destroyed = true;
      ++this._version;
      clearTimeout(this._ambientTimer);
      clearTimeout(this._suspendTimer);
      this._ambientTimer = this._suspendTimer = null;
      this._pads.forEach(({ osc }) => {
        try { osc.stop(); } catch (_) { /* Already stopped. */ }
      });
      if (this._breath) {
        try { this._breath.stop(); } catch (_) { /* Already stopped. */ }
      }
      Array.from(this._voices).forEach((voice) => {
        try { voice.source.stop(); } catch (_) { /* Already ended. */ }
        voice.cleanup();
      });
      this._nodes.forEach((node) => { try { node.disconnect(); } catch (_) {} });
      this._nodes = [];
      this._pads = [];
      if (this.context && this.context.state !== 'closed') this.context.close().catch(() => {});
      this.context = null;
    }

    _build() {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) throw new Error('This browser does not support Web Audio.');
      const context = new AudioContextClass({ latencyHint: 'playback' });
      this.context = context;
      try {
        this._master = context.createGain();
        this._master.gain.value = 0;
        this._master.connect(context.destination);
        this._effects = context.createGain();
        this._effects.gain.value = 0.8;
        this._effects.connect(this._master);
        this._filter = context.createBiquadFilter();
        this._filter.type = 'lowpass';
        this._filter.Q.value = 0.35;
        this._filter.frequency.value = SCENES[this.scene].cutoff;
        const breathingGain = context.createGain();
        breathingGain.gain.value = 0.8;
        this._filter.connect(breathingGain).connect(this._master);
        this._breath = context.createOscillator();
        this._breath.frequency.value = 0.065;
        const breathDepth = context.createGain();
        breathDepth.gain.value = 0.12;
        this._breath.connect(breathDepth).connect(breathingGain.gain);
        this._breath.start();
        this._nodes.push(this._master, this._effects, this._filter, breathingGain, this._breath, breathDepth);
        SCENES[this.scene].notes.forEach((frequency, index) => {
          [-1, 1].forEach((side) => {
            const osc = context.createOscillator();
            osc.type = index === 2 ? 'triangle' : 'sine';
            osc.frequency.value = frequency;
            osc.detune.value = side * (1.2 + index * 0.45);
            const gain = context.createGain();
            gain.gain.value = [0.031, 0.018, 0.011, 0.008][index];
            const panner = this._panner(side * (0.32 + index * 0.12));
            osc.connect(gain).connect(panner).connect(this._filter);
            osc.start();
            this._pads.push({ osc, index });
            this._nodes.push(osc, gain, panner);
          });
        });
      } catch (error) {
        this._nodes.forEach((node) => { try { node.disconnect(); } catch (_) {} });
        this._nodes = [];
        this._pads = [];
        context.close().catch(() => {});
        this.context = null;
        throw error;
      }
    }

    _panner(position) {
      if (typeof this.context.createStereoPanner !== 'function') return this.context.createGain();
      const panner = this.context.createStereoPanner();
      panner.pan.value = position;
      return panner;
    }

    _approach(parameter, value, timeConstant) {
      const now = this.context.currentTime;
      if (typeof parameter.cancelAndHoldAtTime === 'function') parameter.cancelAndHoldAtTime(now);
      else {
        const current = parameter.value;
        parameter.cancelScheduledValues(now);
        parameter.setValueAtTime(current, now);
      }
      parameter.setTargetAtTime(value, now, timeConstant);
    }

    _canPlay() {
      return this.enabled && !this._destroyed && this.context && this.context.state === 'running';
    }

    _tone(frequency, volume, duration, pan, delay = 0) {
      if (!this._canPlay() || this._voices.size >= 24) return;
      const start = this.context.currentTime + delay;
      const source = this.context.createOscillator();
      const envelope = this.context.createGain();
      const panner = this._panner(pan);
      source.type = 'sine';
      source.frequency.value = frequency;
      envelope.gain.setValueAtTime(0, start);
      envelope.gain.linearRampToValueAtTime(volume, start + 0.045);
      envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      envelope.gain.linearRampToValueAtTime(0, start + duration + 0.08);
      source.connect(envelope).connect(panner).connect(this._effects);
      this._track(source, [envelope, panner]);
      source.start(start);
      source.stop(start + duration + 0.12);
    }

    _track(source, nodes) {
      const voice = { source, cleanup: null };
      voice.cleanup = () => {
        source.onended = null;
        [source, ...nodes].forEach((node) => { try { node.disconnect(); } catch (_) {} });
        this._voices.delete(voice);
      };
      this._voices.add(voice);
      source.onended = voice.cleanup;
    }

    _scheduleAmbient() {
      clearTimeout(this._ambientTimer);
      if (!this.enabled || this._destroyed) return;
      this._ambientTimer = setTimeout(() => {
        this._ambientTimer = null;
        if (this._canPlay()) {
          const interval = [1, 1.5, 2][Math.floor(Math.random() * 3)];
          this._tone(SCENES[this.scene].shimmer * interval, 0.015, 3.5, Math.random() * 1.2 - 0.6);
        }
        this._scheduleAmbient();
      }, 11000 + Math.random() * 10000);
    }
  }

  window.CosmosAudio = CosmosAudio;
})();
