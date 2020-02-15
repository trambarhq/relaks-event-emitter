import { expect } from 'chai';
import { EventEmitter, GenericEvent } from '../index.mjs';

describe('#stopImmediatePropagation()', function() {
  it ('should keep additional handlers from being called', function() {
    const emitter = new EventEmitter;
    const called = [];
    emitter.addEventListener('change', (evt) => {
      called.push('a');
      evt.stopImmediatePropagation();
    });
    emitter.addEventListener('change', (evt) => {
      called.push('b');
    });
    emitter.addEventListener('change', (evt) => {
      called.push('c');
    });
    emitter.triggerEvent(new GenericEvent('change', emitter));
    expect(called).to.eql([ 'a' ]);
  })
})
