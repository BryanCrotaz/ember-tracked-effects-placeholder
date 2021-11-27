import Service from '@ember/service';
import TrackedEffectsCore from 'ember-tracked-effects-placeholder/classes/tracked-effects-core';
import { registerDestructor } from '@ember/destroyable';
import { TrackedEffect } from 'ember-tracked-effects-placeholder/classes/tracked-effect';
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

  public addEffect(runFn: Function, context?: object): TrackedEffect | undefined {
    return TrackedEffectsCore.instance?.addEffect(runFn, context);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'tracked-effects': TrackedEffects;
  }
}
