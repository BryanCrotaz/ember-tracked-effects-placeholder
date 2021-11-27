import { assert } from "@ember/debug";
import TrackedEffectsCore from "./tracked-effects-core";

export default function effect(this: any, target: any, propertyKey: string, descriptor?: {initializer?: Function}): any {
  // @ts-ignore
  var oldInit = descriptor?.initializer;

  assert(`You can only use the @effect decorator on the ${target.constructor.name} class on a property and not on a method. Rewrite '@effect ${propertyKey}() {}' as '@effect ${propertyKey} = () => {};'`, oldInit)

  if (descriptor && oldInit) {
    descriptor.initializer = function() {
      var fn = oldInit?.call(this);
      if (fn) {
        TrackedEffectsCore.instance?.addEffect(fn, this);    
      }
      return fn;
    };
  }
}
