import { guidFor } from '@ember/object/internals';
import { cached } from 'tracked-toolbox';
import { registerDestructor } from '@ember/destroyable';
import TrackedEffectsCore from './tracked-effects-core';
import { assert } from '@ember/debug';

export type EffectCallback<D extends any[] = []> = (...args: D) => void;
export type EffectDeps<D extends any[] = []> = () => D;

interface EffectArgs<D extends any[]> {
  runFn: EffectCallback<D>;
  context?: object;
  deps?: EffectDeps<D>;
}

export default class TrackedEffect<D extends any[] = any[]> {
  private _id: string;
  private runFn: EffectCallback<D>;
  private deps?: EffectDeps<D>;
  private prevDeps?: D;

  get id(): string {
    return this._id;
  }

  constructor({ runFn, context, deps }: EffectArgs<D>) {
    this.runFn = runFn;
    this.deps = deps;
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

  @cached get cachedDeps(): D {
    if (this.deps) {
      const deps = this.deps();
      assert(`deps callback should return an array of objects (received ${deps})`, Array.isArray(deps));
      return deps;
    }
    return [] as any as D;
  }

  @cached get run(): undefined {
    const newDeps = this.cachedDeps;
    const skip = this.deps && this.prevDeps && newDeps === this.prevDeps;
    if (!skip) {
      this.prevDeps = newDeps;
      this.runFn(...newDeps);
    }
    return;
  }
}
