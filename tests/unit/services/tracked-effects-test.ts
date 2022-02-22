import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { tracked } from '@glimmer/tracking';
import { settled } from '@ember/test-helpers';
import Service from '@ember/service';
import effect from 'ember-tracked-effects-placeholder/classes/tracked-effect-decorator';
import TrackedEffectsService from 'ember-tracked-effects-placeholder/services/tracked-effects';

class DataSource {
  @tracked value: string = '';
}

class DataEffectConsumer extends Service {
  result: string = '';

  @tracked value: string = '';

  @effect
  actOnChange = () => {
    this.result = this.value;
  };
}

async function delay(interval: number) {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve('');
    }, interval);
  });
}

module('Unit | Service | tracked-effects', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let service = this.owner.lookup('service:tracked-effects');
    assert.ok(service);
  });

  test('calls back on registration', async function (assert) {
    let service = this.owner.lookup('service:tracked-effects') as TrackedEffectsService;
    var data = new DataSource();
    data.value = 'abc';
    var result = '';
    service.addEffect(() => {
      result = data.value;
    });
    await settled();
    assert.equal(result, 'abc');
    assert.ok(service.isWatching);
  });

  test('calls back on data update', async function (assert) {
    let service = this.owner.lookup('service:tracked-effects') as TrackedEffectsService;
    var data = new DataSource();
    data.value = 'abc';
    var result = '';
    service.addEffect(() => {
      result = data.value;
    });
    await settled();
    assert.equal(result, 'abc');
    // change the data
    data.value = 'def';
    await delay(100);
    await settled();
    assert.equal(result, 'def');
    assert.ok(service.isWatching);
  });

  test('calls back on data update', async function (assert) {
    let service = this.owner.lookup('service:tracked-effects') as TrackedEffectsService;
    var data = new DataSource();
    data.value = 'abc';
    var result = '';
    service.addEffect(() => {
      result = data.value;
    });
    await settled();
    assert.equal(result, 'abc');
    // change the data
    data.value = 'def';
    await delay(100);
    await settled();
    assert.equal(result, 'def');
  });

  test('calls back on data update with decorator', async function (assert) {
    var data = new DataEffectConsumer();
    data.value = 'abc';
    await delay(100);
    await settled();
    assert.equal(data.result, 'abc');
    // change the data
    data.value = 'def';
    await delay(100);
    await settled();
    assert.equal(data.result, 'def');
  });

  test('stopping an effect means callback is not called', async function (assert) {
    let service = this.owner.lookup('service:tracked-effects') as TrackedEffectsService;
    var data = new DataSource();
    data.value = 'abc';
    var result = '';
    var effect = service.addEffect(() => {
      result = data.value;
    });
    await settled();
    assert.equal(result, 'abc');
    assert.ok(service.isWatching);

    effect.stop();

    // change the data
    data.value = 'def';
    await delay(100);
    await settled();
    assert.equal(result, 'abc');
    assert.notOk(service.isWatching);
  });

  test('destroying target cleans up effect', async function (assert) {
    let service = this.owner.lookup('service:tracked-effects') as TrackedEffectsService;
    var data = new DataEffectConsumer();
    data.value = 'abc';
    await delay(100);
    await settled();
    assert.equal(data.result, 'abc');

    // change the data
    data.value = 'def';
    await delay(100);
    await settled();
    assert.equal(data.result, 'def');
    assert.ok(service.isWatching);

    // destroy the consumer
    data.destroy();

    await settled();
    // that was the last effect so the service shouldn't be watching
    assert.notOk(service.isWatching);
  });

  test('incorrect use of effect decorator asserts', async function (assert) {
    assert.throws(
      () => {
        // @ts-ignore
        // eslint-disable-next-line
      class BrokenConsumer extends Service {
          @effect
          actOnChange() {}
        }
      },
      /.*BrokenConsumer.*actOnChange().*/,
      'error message contains class and method name'
    );
  });
});
