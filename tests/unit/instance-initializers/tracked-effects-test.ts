// todo: re-enable test when we can work out how to test an
// instance initializer

// import Application from '@ember/application';

// import { initialize } from 'dummy/instance-initializers/tracked-effects';
// import { module, test } from 'qunit';
// import { setupTest } from 'ember-qunit';
// //import destroyApp from '../../helpers/destroy-app';
// import { TestContext } from '@ember/test-helpers';
// import ApplicationInstance from '@ember/application/instance';

// interface InitializerTestContext extends TestContext {
//   application: any;
//   instance: ApplicationInstance;
// }

// module(
//   'Unit | Instance Initializer | tracked-effects',
//   function (this: InitializerTestContext, hooks) {
//     setupTest(hooks);

//     hooks.beforeEach(function (this: InitializerTestContext) {
//       var TestApplication = Application.extend();
//       TestApplication.instanceInitializer({
//         name: 'initializer under test',
//         initialize,
//       });
//       this.application = TestApplication.create({ autoboot: false });
//       this.instance = TestApplication.buildInstance();
//     });

//     hooks.afterEach(function (this: InitializerTestContext) {
//       this.application.destroy(this.instance);
//     });

//     // Replace this with your real tests.
//     test('it works', async function (this: InitializerTestContext, assert) {
//       await this.instance.boot();

//       assert.ok(true);
//     });
//   }
// );
