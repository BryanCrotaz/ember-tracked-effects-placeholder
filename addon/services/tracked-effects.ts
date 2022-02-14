import Service from '@ember/service';
import TrackedEffectsCore from 'ember-tracked-effects-placeholder/classes/tracked-effects-core';
import { registerDestructor } from '@ember/destroyable';
import TrackedEffect, { EffectCallback, EffectDeps } from 'ember-tracked-effects-placeholder/classes/tracked-effect';
import { getOwner } from '@ember/application';

export default class TrackedEffects extends Service {
  constructor() {
    super(...arguments);
    TrackedEffectsCore.instance = new TrackedEffectsCore({
      // CAUTION: Private API
      renderer: getOwner(this).lookup('renderer:-dom')
    });
    registerDestructor(this, () => {
      TrackedEffectsCore.instance?.stop();
      TrackedEffectsCore.instance = undefined;
    });
  }

  public get isWatching(): boolean {
    return TrackedEffectsCore.instance?.isWatching ?? false;
  }

  public addEffect<D extends any[]>(
    context: object,
    runFn: EffectCallback<D>,
    deps?: EffectDeps<D>
  ): TrackedEffect<D> | undefined {
    return TrackedEffectsCore.instance?.addEffect(context, runFn, deps);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'tracked-effects': TrackedEffects;
  }
}
