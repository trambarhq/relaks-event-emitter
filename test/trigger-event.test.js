import { expect } from 'chai';
import { RelaksEventEmitter, GenericEvent } from '../index.mjs';

describe('#triggerEvent()', function() {
  it ('should fire multiple handlers', function() {
    const emitter = new RelaksEventEmitter;
    const called = [];
    emitter.addEventListener('change', (evt) => {
      called.push('a');
    });
    emitter.addEventListener('change', (evt) => {
      called.push('b');
    });
    emitter.addEventListener('change', (evt) => {
      called.push('c');
    });
    emitter.triggerEvent(new GenericEvent('change', emitter));
    expect(called).to.eql([ 'a', 'b', 'c' ]);
  })
  it ('should call event handler with the instance as this', function() {
    const emitter = new RelaksEventEmitter;
    let self;
    emitter.addEventListener('change', function(evt) {
      self = this;
    });
    emitter.triggerEvent(new GenericEvent('change', emitter));
    expect(self).to.equal(emitter);
  });
})
