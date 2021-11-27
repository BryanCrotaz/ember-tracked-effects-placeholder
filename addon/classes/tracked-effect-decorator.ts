//import TrackedEffectsService from "./tracked-effects-core";

import { assert } from "@ember/debug";
import TrackedEffectsCore from "./tracked-effects-core";

// @ts-ignore
// eslint-disable-next-line
export default function effect(this: any, target: any, propertyKey: string, descriptor?: PropertyDescriptor = undefined): any {
  // @ts-ignore
  var oldInit = descriptor.initializer;

  assert(`You can only use the @effect decorator on the ${target.constructor.name} class on a property and not on a method. Rewrite '@effect ${propertyKey}() {}' as '@effect ${propertyKey} = () => {};'`, oldInit)
  // @ts-ignore
  descriptor.initializer = function() {
    var fn = oldInit.call(this);
    TrackedEffectsCore.instance?.addEffect(fn, this);    
    return fn;
  };
}
