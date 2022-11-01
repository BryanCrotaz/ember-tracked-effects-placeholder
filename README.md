# ember-tracked-effects-placeholder

Bodged implementation of tracked Effects prior to the availability
of the proper implementation.

When tracked data changes the renderer creates a backburner runloop.
We hook into the start of every runloop to see if the renderer global
tag version has changed. This uses private API.

Based on ideas from @NullVoxPopuli, @lifeart, @Courajs and @jelhan

## Compatibility

* Ember.js v3.28 or above
* Ember CLI v3.28 or above
* Node.js v14 or above


## Installation

```
ember install ember-tracked-effects-placeholder
```


## Usage

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
    () => { 
      // the tracked effects service will watch any tracked data
      // you read here and will run this function whenever it changes
      browser.localStorage.setItem('my-data', this.data?.name ?? '');
    },
    this // the service will stop the effect running if the context is destroyed
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
    () => { 
      browser.localStorage.setItem('my-data', this.data?.name ?? '');
    },
    this
  );

  public stopWatching() {
    // stop() removes the effect from the watch system and cleans up
    this.effect.stop();
  }
}
```


## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.


## License

This project is licensed under the [MIT License](LICENSE.md).
