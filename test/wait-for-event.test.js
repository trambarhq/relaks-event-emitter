import { expect } from 'chai';
import { EventEmitter, GenericEvent } from '../index.mjs';

describe('#waitForEvent()', function() {
  it ('should return a promsie than fulfills when specified event occurs', async function() {
    const emitter = new EventEmitter;
    const promise = emitter.waitForEvent('change');
    const event = new GenericEvent('change', emitter);
    const handled = emitter.triggerEvent(event);
    expect(handled).to.be.true;
    const eventReceived = await promise;
    expect(eventReceived).to.equal(event);
  })
  it ('should return the same promise with different calls', async function() {
    const emitter = new EventEmitter;
    const promise1 = emitter.waitForEvent('change');
    const promise2 = emitter.waitForEvent('change');
    expect(promise2).to.equal(promise1);
  })
  it ('should return a different promise after first one has fulfilled', async function() {
    const emitter = new EventEmitter;
    const promise1 = emitter.waitForEvent('change');
    const event1 = new GenericEvent('change', emitter);
    emitter.triggerEvent(event1);
    await promise1;
    const promise2 = emitter.waitForEvent('change');
    const event2 = new GenericEvent('change', emitter);
    emitter.triggerEvent(event2);
    expect(promise2).to.not.equal(promise1);
    const eventReceived = await promise2;
    expect(eventReceived).to.equal(event2);
  })
  it ('should return a promise that fulfills after event handlers are called', async function() {
    const emitter = new EventEmitter;
    const promise = emitter.waitForEvent('change');
    const called = [];
    emitter.addEventListener('change', (evt) => {
      let resolve;
      const promise = new Promise((r1) => { resolve = r1 });
      evt.postponeDefault(promise);
      setTimeout(() => {
        called.push('a');
        resolve();
      }, 100);
    });
    promise.then(() => {
      called.push('b');
    });
    const event = new GenericEvent('change', emitter);
    emitter.triggerEvent(event);
    const eventReceived = await promise;
    expect(eventReceived).to.equal(event);
    expect(called).to.deep.equal([ 'a', 'b' ]);
  })
  it ('should return a promise that fulfills even if default behavior is prevented', async function() {
    const emitter = new EventEmitter;
    const promise = emitter.waitForEvent('change');
    const called = [];
    emitter.addEventListener('change', (evt) => {
      evt.preventDefault();
    });
    const event = new GenericEvent('change', emitter);
    emitter.triggerEvent(event);
    const eventReceived = await promise;
    expect(eventReceived).to.equal(event);
    expect(event).to.have.property('defaultPrevented', true);
  })
  it ('should work correct when a timeout is specified', async function() {
    const emitter = new EventEmitter;
    try {
      setTimeout(() => {
        const event = new GenericEvent('change', emitter);
        emitter.triggerEvent(event);
      }, 50);
      await emitter.waitForEvent('change', 200);
    } catch (err) {
      expect.fail();
    }
  })
  it ('should fail after some time', async function() {
    const emitter = new EventEmitter;
    try {
      await emitter.waitForEvent('change', 200);
      expect.fail();
    } catch (err) {
    }
  })
})

describe('#change()', function() {
  it ('should return a promsie than fulfills when change occurs', async function() {
    const emitter = new EventEmitter;
    const promise = emitter.change();
    const event = new GenericEvent('change', emitter);
    const handled = emitter.triggerEvent(event);
    expect(handled).to.be.true;
    const eventReceived = await promise;
    expect(eventReceived).to.equal(event);
  })
})
