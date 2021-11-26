ember-tracked-effects-placeholder
==============================================================================

Bodged implementation of tracked Effects prior to the availability of the proper
implementation.


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
behaviour (e.g. calling PLAY on a \<video\> element) then you can use glimmer
tracking to update the template, or a modifier to call into UI elements.

Tracked Effects allow you to call back end functions without needing to have
your code entangled with templates. For example you might have Ember Data
models updated by a websocket or any other non-UI triggered data change, and
need to call into browser APIs, or embedded platform APIs. In Electron you
might want to makes changes to the file system based on data changes, or 
system clock for example. 

```ts
// Simplest usage
import TrackedEffectsService from 'ember-tracked-effects-placeholder';

export default class MyService extends service {
  @service trackedEffects;

  @tracked data: { name: string }; // an ember data model for example

  constructor() {
    super(...arguments);
    this.trackedEffects.addEffect(
      () => { 
        // the tracked effects service will watch any tracked data
        // you read here and will run this function whenever it changes
        browser.localStorage.setItem('my-data', this.data.name);
      }
    );
  }
}
```

```ts
// Advanced usage
import TrackedEffectsService from 'ember-tracked-effects-placeholder';

export default class MyService extends service {
  @service trackedEffects;

  @tracked data: { name: string }; // an ember data model for example

  constructor() {
    super(...arguments);
    this.trackedEffects.addEffect(
      () => { 
        // the tracked effects service will watch any tracked data
        // you read here and will run the callback function whenever it changes
        this.data.name;
        this.something.else; // we care about this one changing but don't use it
                             // in the callback
      }
      () => { 
        // anything you use in here will also be tracked
        browser.localStorage.setItem('my-data', this.data.name);
      }
    );
  }
}
```

```ts
// Maybe you want to stop watching this data at some point
import TrackedEffectsService, { TrackedEffect } from 'ember-tracked-effects-placeholder';

export default class MyService extends service {
  @service trackedEffects;

  @tracked data: { name: string }; 
  private effect: TrackedEffect;

  constructor() {
    super(...arguments);
    this.effect = this.trackedEffects.addEffect(
      () => { 
        browser.localStorage.setItem('my-data', this.data.name);
      }
    );
  }

  stopWatching() {
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
