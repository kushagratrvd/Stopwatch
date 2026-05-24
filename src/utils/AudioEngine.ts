class AudioSynthEngine {
  private ctx: AudioContext | null = null;
  private alarmInterval: any = null;
  private activeAlarmNodes: { osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode }[] = [];
  public muted: boolean = false;

  private initContext() {
    if (!this.ctx) {
      // @ts-ignore
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playClick() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  public playTick() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.03);
  }

  public startAlarm() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    this.stopAlarm();

    const playBeep = () => {
      if (!this.ctx) return;
      
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(520, this.ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(660, this.ctx.currentTime + 0.3);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(392, this.ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      
      osc1.stop(this.ctx.currentTime + 0.45);
      osc2.stop(this.ctx.currentTime + 0.45);

      const alarmInfo = { osc1, osc2, gain };
      this.activeAlarmNodes.push(alarmInfo);

      setTimeout(() => {
        this.activeAlarmNodes = this.activeAlarmNodes.filter(x => x !== alarmInfo);
      }, 500);
    };

    playBeep();
    this.alarmInterval = setInterval(playBeep, 600);
  }

  public stopAlarm() {
    if (this.alarmInterval) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
    if (this.ctx) {
      this.activeAlarmNodes.forEach(node => {
        try {
          node.gain.gain.cancelScheduledValues(this.ctx!.currentTime);
          node.gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.05);
          setTimeout(() => {
            try {
              node.osc1.stop();
              node.osc2.stop();
            } catch (e) {}
          }, 60);
        } catch (e) {}
      });
    }
    this.activeAlarmNodes = [];
  }
}

export const audioEngine = new AudioSynthEngine();
