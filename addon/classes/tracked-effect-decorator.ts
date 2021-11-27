import { assert } from "@ember/debug";
import TrackedEffectsCore from "./tracked-effects-core";

// @ts-ignore
export default function effect(this: any, target: any, propertyKey: string, descriptor?: TypedPropertyDescriptor<() => void>): any {
  // @ts-ignore
  var oldInit = descriptor?.initializer;

  assert(`You can only use the @effect decorator on the ${target.constructor.name} class on a property and not on a method. Rewrite '@effect ${propertyKey}() {}' as '@effect ${propertyKey} = () => {};'`, oldInit)

  if (descriptor && oldInit) {
    // @ts-ignore
    descriptor.initializer = function() {
      var fn = oldInit?.call(this);
      if (fn) {
        TrackedEffectsCore.instance?.addEffect(fn, this);    
      }
      return fn;
    };
  }
}
