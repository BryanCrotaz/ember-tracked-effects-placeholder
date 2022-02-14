import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { tracked } from '@glimmer/tracking';
import settled from '@ember/test-helpers/settled';
import Service from '@ember/service';
import effect from 'ember-tracked-effects-placeholder/classes/tracked-effect-decorator';
import useEffect from 'ember-tracked-effects-placeholder/classes/use-effect';

class DataSource {
  @tracked value: string = '';
  @tracked anotherValue: number = 0;
}

class DataEffectConsumer extends Service {
  result: string = '';
  anotherResult: number = 0;

  @tracked value: string = '';
  @tracked anotherValue: number = 0;

  @effect
  actOnChange = () => {
    this.result = this.value;
  }

  anotherValueEffect = useEffect(this, (value) => {
    this.anotherResult = value;
  }, () => [this.anotherValue]);
}

module('Unit | Service | tracked-effects', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let service = this.owner.lookup('service:tracked-effects');
    assert.ok(service);
  });

  test('calls back on registration', async function (assert) {
    let service = this.owner.lookup('service:tracked-effects');
    var data = new DataSource();
    data.value = 'abc';
    var result = '';
    service.addEffect(
      null,
      () => { result = data.value; }
    );
    await settled();
    assert.equal(result, 'abc');
    assert.ok(service.isWatching);
  });

  test('calls back on data update', async function (assert) {
    let service = this.owner.lookup('service:tracked-effects');
    var data = new DataSource();
    data.value = 'abc';
    var result = '';
    service.addEffect(
      null,
      () => { result = data.value; }
    );
    await settled();
    assert.equal(result, 'abc');
    // change the data
    data.value = 'def';
    await settled();
    assert.equal(result, 'def');
    assert.ok(service.isWatching);
  });

  test('calls back on data update', async function (assert) {
    let service = this.owner.lookup('service:tracked-effects');
    var data = new DataSource();
    data.value = 'abc';
    var result = '';
    service.addEffect(
      null,
      () => { result = data.value; }
    );
    await settled();
    assert.equal(result, 'abc');
    // change the data
    data.value = 'def';
    await settled();
    assert.equal(result, 'def');
  });

  test('calls back updates on empty array deps', async function (assert) {
    let service = this.owner.lookup('service:tracked-effects');
    var data = new DataSource();
    data.value = 'abc';
    var result = '';
    service.addEffect(
      null,
      () => { result = data.value; },
      () => [],
    );
    await settled();
    assert.equal(result, 'abc', 'The effect should call back the first iteration');
    // change the data
    data.value = 'def';
    await settled();
    assert.equal(result, 'abc', 'The effect should not call back on any next updates');
  });

  test('calls back updates on given deps', async function (assert) {
    let service = this.owner.lookup('service:tracked-effects');
    var data = new DataSource();
    data.value = 'abc';
    data.anotherValue = 5;
    var result = '';
    var anotherResult = 0;
    service.addEffect(
      null,
      () => {
        result = data.value;
        anotherResult = data.anotherValue;
      },
      () => [data.anotherValue],
    );
    await settled();
    assert.equal(result, 'abc', 'The effect should call back the first iteration');
    assert.equal(anotherResult, 5, 'The effect should call back the first iteration');
    // change the data that is not consuming in the deps
    data.value = 'def';
    await settled();
    assert.equal(result, 'abc', 'The effect should not reflect on unspecified deps');
    assert.equal(anotherResult, 5, 'The effect should not reflect on unspecified deps');
    // change the data consuming in the deps
    data.anotherValue = 10;
    await settled();
    assert.equal(result, 'def', 'The effect should reflect on given deps');
    assert.equal(anotherResult, 10, 'The effect should reflect on given deps');
  });

  test('calls back on data update with decorator', async function (assert) {
    var data = new DataEffectConsumer();
    data.value = 'abc';
    data.anotherValue = 5;
    await settled();
    assert.equal(data.result, 'abc');
    assert.equal(data.anotherResult, 5);
    // change the data
    data.value = 'def';
    await settled();
    assert.equal(data.result, 'def');
    assert.equal(data.anotherResult, 5);
    // change anotherValue
    data.anotherValue = 10;
    await settled();
    assert.equal(data.result, 'def');
    assert.equal(data.anotherResult, 10);
  });

  test('stopping an effect means callback is not called', async function (assert) {
    let service = this.owner.lookup('service:tracked-effects');
    var data = new DataSource();
    data.value = 'abc';
    var result = '';
    var effect = service.addEffect(
      null,
      () => { result = data.value; }
    );
    await settled();
    assert.equal(result, 'abc');
    assert.ok(service.isWatching);

    effect.stop();

    // change the data
    data.value = 'def';
    await settled();
    assert.equal(result, 'abc');
    assert.notOk(service.isWatching);
  });

  test('destroying target cleans up effect', async function (assert) {
    let service = this.owner.lookup('service:tracked-effects');
    var data = new DataEffectConsumer();
    data.value = 'abc';
    await settled();
    assert.equal(data.result, 'abc');

    // change the data
    data.value = 'def';
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
    assert.throws(() => {
      // @ts-ignore
      // eslint-disable-next-line
      class BrokenConsumer extends Service {
        @effect
        actOnChange() {
        }
      }
    },
    /.*BrokenConsumer.*actOnChange().*/,
    'error message contains class and method name');
  })
});

