import EmberObject from '@ember/object';
import { guidFor } from '@ember/object/internals';
import Service from '@ember/service';
import { cached } from 'tracked-toolbox';

const maximumTimeBetweenWatchChecks = 100; // milliseconds
export class TrackedEffect {
  private service: TrackedEffectsService;
  private _id: string;
  private watchFn: Function;
  private callbackFn: Function | undefined;

//  private context: EmberObject | undefined; // todo register a destructor for this context

  get id(): string {
    return this._id;
  }

  constructor({ service, watchFn, callbackFn/*, context */}: { service: TrackedEffectsService; watchFn: Function; callbackFn?: Function | undefined/*; context?: EmberObject | undefined; */}) {
    this.service = service;
    this.watchFn = watchFn;
    this.callbackFn = callbackFn;
//    this.context = context;
    this._id = guidFor(this);
  }

  public stop() {
    this.service.removeEffect(this);
  }

  @cached get run() {
    this.watchFn();
    if (this.callbackFn) {
      return this.callbackFn();
    }
  }
}

export default class TrackedEffectsService extends Service {

  private loopId: number | null = null;

  private effects: Map<string, TrackedEffect> = new Map<string, TrackedEffect>();

  public get isWatching(): boolean {
    return this.loopId !== null;
  }

  public addEffect(watchFn: Function, callbackFn?: Function | undefined/*, context?: EmberObject | undefined */): TrackedEffect {
    var effect = new TrackedEffect({ service: this, watchFn, callbackFn/*, context*/ });
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
    var effects = this.effects.values();
    for (var effect of effects) {
      effect.run; // @cached means only the ones with changes will do anything
    }
    // run again soon
    this.loopId = requestIdleCallback(
      () => { this.loop(); },
      { timeout: maximumTimeBetweenWatchChecks }
    );
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'tracked-effects': TrackedEffectsService;
  }
}
