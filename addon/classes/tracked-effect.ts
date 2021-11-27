import { guidFor } from '@ember/object/internals';
import { cached } from 'tracked-toolbox';
import { registerDestructor } from '@ember/destroyable';
import TrackedEffectsCore from './tracked-effects-core';

export class TrackedEffect {
  private _id: string;
  private runFn: Function;

  //  private context: EmberObject | undefined; // todo register a destructor for this context

  get id(): string {
    return this._id;
  }

  constructor({ runFn, context }: { runFn: Function; context?: object; }) {
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
    this.runFn();
    return true;
  }
}
