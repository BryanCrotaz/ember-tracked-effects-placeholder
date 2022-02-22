import Service from '@ember/service';
import TrackedEffectsCore from 'ember-tracked-effects-placeholder/classes/tracked-effects-core';
import { registerDestructor } from '@ember/destroyable';
import TrackedEffect, { TrackedEffectCallback } from 'ember-tracked-effects-placeholder/classes/tracked-effect';
import { getOwner } from '@ember/application';

export default class TrackedEffectsService extends Service {
  constructor() {
    super(...arguments);
    TrackedEffectsCore.instance = new TrackedEffectsCore({
      // CAUTION: Private API
      renderer: (getOwner(this) as any).lookup('renderer:-dom')
    });
    registerDestructor(this, () => {
      TrackedEffectsCore.instance?.stop();
      TrackedEffectsCore.instance = undefined;
    });
  }

  public get isWatching(): boolean {
    if (!TrackedEffectsCore.instance) {
      throw "used tracked effects after service destructor";
    }
    return TrackedEffectsCore.instance.isWatching ?? false;
  }

  public addEffect(runFn: TrackedEffectCallback, context?: object): TrackedEffect {
    if (!TrackedEffectsCore.instance) {
      throw "used tracked effects after service destructor";
    }
    return TrackedEffectsCore.instance.addEffect(runFn, context);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'tracked-effects': TrackedEffectsService;
  }
}
