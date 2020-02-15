import { expect } from 'chai';
import { EventEmitter, GenericEvent } from '../index.mjs';

describe('#postponeDefault()', function() {
  it ('should postpone default behavior', async function() {
    const emitter = new EventEmitter;
    const promise = ManualPromise();
    const called = [];
    emitter.addEventListener('change', (evt) => {
      called.push('a');
      evt.postponeDefault(promise);
    });
    const event = new GenericEvent('change', emitter);
    emitter.triggerEvent(event);
    setTimeout(() => {
      called.push('b');
      promise.resolve();
    }, 100);
    await event.waitForDecision();
    if (!event.defaultPrevented) {
      called.push('c');
    }
    expect(called).to.eql([ 'a', 'b', 'c' ]);
  })
  it ('should prevent default behavior when promise is fulfilled with false', async function() {
    const emitter = new EventEmitter;
    const promise = ManualPromise();
    const called = [];
    emitter.addEventListener('change', (evt) => {
      called.push('a');
      evt.postponeDefault(promise);
    });
    const event = new GenericEvent('change', emitter);
    emitter.triggerEvent(event);
    setTimeout(() => {
      called.push('b');
      promise.resolve(false);
    }, 100);
    await event.waitForDecision();
    if (!event.defaultPrevented) {
      called.push('c');
    }
    expect(called).to.eql([ 'a', 'b' ]);
  })
  it ('should keep other handlers from being called', async function() {
    const emitter = new EventEmitter;
    const promise = ManualPromise();
    const called = [];
    emitter.addEventListener('change', (evt) => {
      called.push('a');
      evt.postponeDefault(promise);
    });
    emitter.addEventListener('change', (evt) => {
      called.push('c');
    });
    emitter.addEventListener('change', (evt) => {
      called.push('d');
    });
    const event = new GenericEvent('change', emitter);
    emitter.triggerEvent(event);
    setTimeout(() => {
      called.push('b');
      promise.resolve();
    }, 100);
    await event.waitForDecision();
    if (!event.defaultPrevented) {
      called.push('e');
    }
    expect(called).to.eql([ 'a', 'b', 'c', 'd', 'e' ]);
  })
  it ('should correctly handle calls by multiple handlers', async function() {
    const emitter = new EventEmitter;
    const promise1 = ManualPromise();
    const promise2 = ManualPromise();
    const called = [];
    emitter.addEventListener('change', (evt) => {
      called.push('a');
      evt.postponeDefault(promise1);
    });
    emitter.addEventListener('change', (evt) => {
      called.push('c');
    });
    emitter.addEventListener('change', (evt) => {
      called.push('d');
      evt.postponeDefault(promise2);
    });
    const event = new GenericEvent('change', emitter);
    emitter.triggerEvent(event);
    setTimeout(() => {
      called.push('b');
      promise1.resolve();
    }, 100);
    setTimeout(() => {
      called.push('e');
      promise2.resolve(false);
    }, 250);
    await event.waitForDecision();
    if (!event.defaultPrevented) {
      called.push('f');
    }
    expect(called).to.eql([ 'a', 'b', 'c', 'd', 'e' ]);
  })
  it ('should interact correctly with stopImmediatePropagation()', async function() {
    const emitter = new EventEmitter;
    const promise1 = ManualPromise();
    const promise2 = ManualPromise();
    const called = [];
    emitter.addEventListener('change', (evt) => {
      called.push('a');
      evt.postponeDefault(promise1);
    });
    emitter.addEventListener('change', (evt) => {
      called.push('c');
      evt.stopImmediatePropagation();
    });
    emitter.addEventListener('change', (evt) => {
      called.push('d');
      evt.postponeDefault(promise2);
    });
    const event = new GenericEvent('change', emitter);
    emitter.triggerEvent(event);
    setTimeout(() => {
      called.push('b');
      promise1.resolve();
    }, 100);
    setTimeout(() => {
      called.push('e');
      promise2.resolve(false);
    }, 250);
    await event.waitForDecision();
    if (!event.defaultPrevented) {
      called.push('f');
    }
    expect(called).to.eql([ 'a', 'b', 'c', 'f' ]);
  })
})

function ManualPromise() {
  let resolve, reject;
  let promise = new Promise((r1, r2) => {
    resolve = r1;
    reject = r2;
  });
  promise.resolve = resolve;
  promise.reject = reject;
  return promise;
}
