import TrackedEffectsCore from "./tracked-effects-core";
import TrackedEffect, { EffectDeps, EffectCallback } from './tracked-effect';

export default function useEffect<D extends any[]>(
  context: any,
  effect: EffectCallback<D>,
  deps?: EffectDeps<D>,
): TrackedEffect<D> | undefined {
  return TrackedEffectsCore.instance?.addEffect(context, effect, deps);
}
