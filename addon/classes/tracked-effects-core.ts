import { assert } from "@ember/debug";
import TrackedEffect from "./tracked-effect";

const maximumTimeBetweenWatchChecks = 100; // milliseconds

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
      this.loop();
    }
  }

  private stopWatching() {
    if (this.loopId !== null) {
      cancelIdleCallback(this.loopId);
      this.loopId = null;
    }
  }

  private loop() {
    // last revision is the global tag change counter in glimmer tracking
    // last revision is always -1 if the renderer isn't running (e.g. in a unit test)
    if (this.renderer._lastRevision == -1 || this.renderer._lastRevision !== this.lastRevision) {
      this.lastRevision = this.renderer._lastRevision;
      var effects = this.effects.values();
      for (var effect of effects) {
        effect.run; // @cached means only the ones with changes will do anything
      }
    }
    // run again soon
    this.loopId = requestIdleCallback(
      () => { this.loop(); },
      { timeout: maximumTimeBetweenWatchChecks }
    );
  }
}
