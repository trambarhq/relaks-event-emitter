import { expect } from 'chai';
import RelaksEventEmitter, { GenericEvent } from '../index';

describe('#stopImmediatePropagation()', function() {
    it ('should keep additional handlers from being called', function() {
        let emitter = new RelaksEventEmitter;
        let called = [];
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
