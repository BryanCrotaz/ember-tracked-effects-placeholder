import { guidFor } from '@ember/object/internals';
import { cached } from 'tracked-toolbox';
import { registerDestructor } from '@ember/destroyable';
import TrackedEffectsCore from './tracked-effects-core';
import { schedule } from '@ember/runloop';

export type TrackedEffectCallback = (...args: any[]) => any;
export default class TrackedEffect {
  private _id: string;
  private runFn: TrackedEffectCallback;

  get id(): string {
    return this._id;
  }

  constructor({ runFn, context }: { runFn: TrackedEffectCallback; context?: object; }) {
    this.runFn = runFn;
    if (context) {
      registerDestructor(context, () => {
        this.stop();
      });
    }
    this._id = guidFor(this);
  }

  public stop() {
    TrackedEffectsCore.instance?.removeEffect(this);
  }

  @cached get run(): boolean {
    // cached only runs this getter if the inputs have changed
    // result is irrelevant
    schedule('actions', this.runFn);
    return true;
  }
}
