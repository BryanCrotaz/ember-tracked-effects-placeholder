import { assert } from "@ember/debug";
import TrackedEffect from "./tracked-effect";
import { run, scheduleOnce } from "@ember/runloop";
import { action } from "@ember/object";

export default class TrackedEffectsCore {

  public static instance?: TrackedEffectsCore;
  
  private loopId: number | null = null;

  private effects: Map<string, TrackedEffect> = new Map<string, TrackedEffect>();
  private renderer: any;
  private lastRevision: any = null;

  constructor (options: {renderer: any}) {
    this.renderer = options.renderer;
  }

  public get isWatching(): boolean {
    return this.loopId !== null;
  }

  public addEffect(runFn: Function, context?: object): TrackedEffect {
    assert('You cannot add an effect without providing a function', runFn);
    var effect = new TrackedEffect({ runFn, context });
    this.effects.set(effect.id, effect);
    effect.run;
    this.startWatching();
    return effect;
  }

  public removeEffect(effect: TrackedEffect) {
    this.effects.delete(effect.id);
    if (this.effects.size == 0) {
      this.stopWatching();
    }
  }

  public stop() {
    this.effects.clear();
    this.stopWatching(); 
  }

  private startWatching() {
    if (this.loopId == null) {
      // @ts-ignore
      run.backburner.on('begin', this.backburnerCallback);
      this.loopId = 1;
    }
  }

  private stopWatching() {
    if (this.loopId !== null) {
      // @ts-ignore
      run.backburner.off('begin', this.backburnerCallback);
      this.loopId = null;
    }
  }

  @action
  private backburnerCallback() {
    scheduleOnce("actions", this, this.checkEffects);
  }

  private checkEffects() {
    if (this.renderer._lastRevision === -1
        || this.renderer._lastRevision !== this.lastRevision) {
      this.lastRevision = this.renderer._lastRevision;
      var effects = this.effects.values();
      for (var effect of effects) {
        effect.run; // @cached means only the ones with changes will do anything
      }
    }
  }
}
