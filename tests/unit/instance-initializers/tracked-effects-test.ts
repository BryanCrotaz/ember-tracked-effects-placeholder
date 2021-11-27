import Application from '@ember/application';

import { initialize } from 'dummy/instance-initializers/tracked-effects';
import { module, test } from 'qunit';
import { run } from '@ember/runloop';
import EngineInstance from '@ember/engine/instance';

type TestContext = import('ember-test-helpers').TestContext;

interface InitializerTestContext extends TestContext {
  TestApplication: any;
  instance: EngineInstance;
}

module('Unit | Instance Initializer | tracked-effects', function(this: InitializerTestContext, hooks) {
  hooks.beforeEach(function(this: InitializerTestContext) {
    this.TestApplication = Application.extend();
    this.TestApplication.instanceInitializer({
      name: 'initializer under test',
      initialize
    });
    this.application = this.TestApplication.create({ autoboot: false });
    this.instance = this.application.buildInstance();
  });
  hooks.afterEach(function(this: InitializerTestContext) {
    run(this.application, 'destroy');
    run(this.instance, 'destroy');
  });

  // Replace this with your real tests.
  test('it works', async function(this: InitializerTestContext, assert) {
    await this.instance.boot();

    assert.ok(true);
  });
});
