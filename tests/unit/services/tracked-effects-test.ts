import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { tracked } from '@glimmer/tracking';
import TrackedEffectsService from 'ember-tracked-effects-placeholder/services/tracked-effects';
import settled from '@ember/test-helpers/settled';

class DataSource {
  @tracked value: string = '';
}

async function delay(interval: number) {
  await new Promise(resolve => {
    setTimeout(() => { resolve(''); }, interval);
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
    service.addEffect(
      () => { data.value },
      () => { result = data.value; }
    );
    await settled();
    assert.equal(result, 'abc');
    assert.ok(service.isWatching);
  });

  test('calls back on data update', async function (assert) {
    let service = this.owner.lookup('service:tracked-effects') as TrackedEffectsService;
    var data = new DataSource();
    data.value = 'abc';
    var result = '';
    service.addEffect(
      () => { data.value },
      () => { result = data.value; }
    );
    await settled();
    assert.equal(result, 'abc');
    // change the data
    data.value = 'def';
    await delay(100);
    await settled();
    assert.equal(result, 'def');
    assert.ok(service.isWatching);
  });

  test('calls back on data update with only watch function', async function (assert) {
    let service = this.owner.lookup('service:tracked-effects') as TrackedEffectsService;
    var data = new DataSource();
    data.value = 'abc';
    var result = '';
    service.addEffect(
      () => { result = data.value; }
    );
    await settled();
    assert.equal(result, 'abc');
    // change the data
    data.value = 'def';
    await delay(100);
    await settled();
    assert.equal(result, 'def');
  });

  test('stopping an effect means callback is not called', async function (assert) {
    let service = this.owner.lookup('service:tracked-effects') as TrackedEffectsService;
    var data = new DataSource();
    data.value = 'abc';
    var result = '';
    var effect = service.addEffect(
      () => { result = data.value; }
    );
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
});

