import { assert } from "@ember/debug";
import TrackedEffect, { TrackedEffectCallback } from "./tracked-effect";
// @ts-ignore
import { _backburner, scheduleOnce } from "@ember/runloop";
import { action } from "@ember/object";

interface BackburnerInterface {
  on(path: string, callback: () => void): any;
  off(path: string, callback: () => void): any;
}

export default class TrackedEffectsCore {

  public static instance?: TrackedEffectsCore;
  
  private watching: boolean = false;

  private effects: Map<string, TrackedEffect> = new Map<string, TrackedEffect>();
  private renderer: any;
  private lastRevision: any = null;
  private backburner: BackburnerInterface;

  constructor (options: {renderer: any}) {
    this.renderer = options.renderer;
    this.backburner = _backburner;
    assert("Must get a backburner instance from the runloop", this.backburner);
  }

  public get isWatching(): boolean {
    return this.watching;
  }

  public addEffect(runFn: TrackedEffectCallback, context?: object): TrackedEffect {
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
    if (!this.watching) {
      this.backburner.on('begin', this.backburnerCallback);
      this.watching = true;
    }
  }

  private stopWatching() {
    if (this.watching) {
      this.backburner.off('begin', this.backburnerCallback);
      this.watching = false;
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
        // @ts-ignore
        var dummy = effect.run; // @cached means only the ones with changes will do anything
      }
    }
  }
}
