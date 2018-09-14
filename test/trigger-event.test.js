import { expect } from 'chai';
import RelaksEventEmitter, { GenericEvent } from '../index';

describe('#triggerEvent()', function() {
    it ('should fire multiple handlers', function() {
        let emitter = new RelaksEventEmitter;
        let called = [];
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
        let emitter = new RelaksEventEmitter;
        let self;
        emitter.addEventListener('change', function(evt) {
            self = this;
        });
        emitter.triggerEvent(new GenericEvent('change', emitter));
        expect(self).to.equal(emitter);
    });
})
