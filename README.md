ember-tracked-effects-placeholder
==============================================================================

Bodged implementation of tracked Effects prior to the availability
of the proper implementation.

When tracked data changes the renderer creates a backburner runloop.
We hook into the start of every runloop to see if the renderer global
tag version has changed. This uses private API.

Based on ideas from @NullVoxPopuli, @lifeart, @Courajs and @jelhan

Compatibility
------------------------------------------------------------------------------

* Ember.js v3.16 or above
* Ember CLI v2.13 or above
* Node.js v10 or above


Installation
------------------------------------------------------------------------------

```
ember install ember-tracked-effects-placeholder
```


Usage
------------------------------------------------------------------------------

If you want to update data in a template, or have UI interaction trigger backend
behaviour (e.g. calling `play()` on a `<video\>` element) then you can use glimmer
tracking to update the template, or a modifier to call into UI elements.

Sometimes you need to call functions that are not related to templates.

Tracked Effects allow you to call back end functions without needing to have
your code entangled with templates. For example you might have Ember Data
models updated by a websocket or any other non-UI triggered data change, and
need to call into browser APIs, or embedded platform APIs. In Electron you
might want to make changes to the file system based on data changes, or 
system clock for example. 

## `useEffect` usage

Sometimes you may need to make some changes after some tracked property is changed that is not controlled in the current component or the model. So instead of writing `{{did-insert}}` and `{{did-update @someProp}}` modifiers you can write an effect on the code level. Be careful with dependencies you have there, incorrect usage may lead to circular re-rendering.

`useEffect` is received 3 arguments:
- **context** - required, destroyable object
- **effect** - required, this effect is called whenever the observed tracked properties are updated.
- **deps** - optional, this function should always return an array of tracked properties.
  
`useEffect` can be **autotracked** or **controlled**
1. To have a **controlled** effect you'll need to pass the `deps` function (`() => [trackedProp1, trackedProp2]`). If any of these properties is updated it'll trigger the new effect.
   Note, the property can be updated, but the value can be the same (`this.prop = this.prop`), it'll trigger the effect anyway. To prevent this you can use the `dedupeTracked` decorator from https://github.com/tracked-tools/tracked-toolbox instead. 
   
   To have the effect on mount only, pass the function with empty array (`() => []`).
   
   Passing non-tracked properties to this array has no effect on updates.
   
   The deps array is also passed to the effect function as arguments. (`useEffect(this, (prop1, prop2) => {...}, () => [prop1, prop2]`)
2. If you don't pass the deps argument, the effect will be **autotracked**, so it will trigger the function whenever any tracked property in the effect is updated.
   
   Be careful with this effect if you are using more than 1 tracked property inside the effect as it can be complicated to investigate what property triggers the update. Use controlled effect there instead.

```ts
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { useEffect } from 'ember-tracked-effects-placeholder';

interface Args {
  id: string;
}

export default class MyComponent extends Component<Args> {
  @tracked input = '';

  constructor(owner, args) {
    super(owner, args);
    
    // constructor style
    useEffect(this, () => {
      // some code
    });
  }
  
  /* property assignment style */

  autotrackedEffect = useEffect(this, () => {
    console.log('this is called whenever @id or this.input is updated');
    console.log(this.args.id, this.input); // consume this.args.id and this.input
  }); // no consumer

  mountEffect = useEffect(this, () => {
    console.log('this is called only on mount and is neved updated');
    console.log(this.args.id, this.input); // it doesn't matter what you call here
  }, () => []); // empty array consumer

  idEffect = useEffect(this, () => {
    console.log('this is called whenever @id is updated');
    console.log('it is safe to use any other tracked properties', this.args.id, this.input);
  }, () => [this.args.id]); // consume @id only
}
```

## Usage with a decorator

In a service, use the `@effect` decorator on a function property. 
You can use this anywhere but if you're using it in a route or a 
controller it's likely that a modifier is a better solution.

Note that you must use the syntax `myMethod = () => {}` and 
not `myMethod() {}` due to the way decorators work. However
if you get this wrong you'll get a useful error to help you
fix it.

```ts
import Service from '@ember/service';

export default class MyService extends Service {
  @tracked data: { name: string }; // an ember data model for example

  @effect
  saveToLocalStorage = () => {
    // the tracked effects service will watch any tracked data
    // you read here and will run this function whenever it changes
    browser.localStorage.setItem('my-data', this.data?.name ?? '');
  }
}
```

## Without a decorator
```ts
import Service from '@ember/service';
import { TrackedEffectsService } from 'ember-tracked-effects-placeholder';

export default class MyService extends Service {
  @service trackedEffects: TrackedEffectsService;

  @tracked data: { name: string }; // an ember data model for example

  effect = this.trackedEffects.addEffect(
    this, // the service will stop the effect running if the context is destroyed
    () => { 
      // the tracked effects service will watch any tracked data
      // you read here and will run this function whenever it changes
      browser.localStorage.setItem('my-data', this.data?.name ?? '');
    }
  );
}
```

## Effects with shorter lifetimes

Maybe you want to stop watching this data at some point.
Note that you don't need to do this on destruction, that's automatic
if you provide a context when calling `addEffect()`

```ts
import Service from '@ember/service';
import { TrackedEffectsService, TrackedEffect } from 'ember-tracked-effects-placeholder';

export default class MyService extends Service {
  @service trackedEffects: TrackedEffectsService;

  @tracked data: { name: string }; 
  
  private effect = this.trackedEffects.addEffect(
    this,
    () => { 
      browser.localStorage.setItem('my-data', this.data?.name ?? '');
    }
  );

  public stopWatching() {
    // stop() removes the effect from the watch system and cleans up
    this.effect.stop();
  }
}
```


Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
