import Chai, { expect } from 'chai';
import ChaiAsPromised from 'chai-as-promised';
import RelaksEventEmitter, { GenericEvent } from '../index';

Chai.use(ChaiAsPromised);

describe('#waitForEvent()', function() {
    it ('should return a promsie than fulfills when specified event occurs', function() {
        let emitter = new RelaksEventEmitter;
        let promise = emitter.waitForEvent('change');
        let event = new GenericEvent('change', emitter);
        let handled = emitter.triggerEvent(event);
        expect(handled).to.be.true;
        return expect(promise).to.eventually.equal(event);
    });
    it ('should return the same promise with different calls', function() {
        let emitter = new RelaksEventEmitter;
        let promise1 = emitter.waitForEvent('change');
        let promise2 = emitter.waitForEvent('change');
        expect(promise2).to.equal(promise1);
    });
    it ('should return a different promise after first one has fulfilled', function() {
        let emitter = new RelaksEventEmitter;
        let promise1 = emitter.waitForEvent('change');
        let event1 = new GenericEvent('change', emitter);
        emitter.triggerEvent(event1);
        return promise1.then(() => {
            let promise2 = emitter.waitForEvent('change');
            let event2 = new GenericEvent('change', emitter);
            emitter.triggerEvent(event2);
            expect(promise2).to.not.equal(promise1);
            return expect(promise2).to.eventually.equal(event2);
        });
    });
    it ('should return a promise that fulfills after event handlers are called', function() {
        let emitter = new RelaksEventEmitter;
        let promise = emitter.waitForEvent('change');
        let called = [];
        emitter.addEventListener('change', (evt) => {
            var f;
            var promise = new Promise((resolve) => { f = resolve });
            evt.postponeDefault(promise);
            setTimeout(() => {
                called.push('a');
                f();
            }, 100);
        });
        promise.then(() => {
            called.push('b');
        });
        let event = new GenericEvent('change', emitter);
        emitter.triggerEvent(event);
        return expect(promise).to.eventually.equal(event).then(() => {
            expect(called).to.deep.equal([ 'a', 'b' ]);
        });
    });
    it ('should return a promise that fulfills even if default behavior is prevented', function() {
        let emitter = new RelaksEventEmitter;
        let promise = emitter.waitForEvent('change');
        let called = [];
        emitter.addEventListener('change', (evt) => {
            evt.preventDefault();
        });
        let event = new GenericEvent('change', emitter);
        emitter.triggerEvent(event);
        return expect(promise).to.eventually.equal(event).then(() => {
            expect(event).to.have.property('defaultPrevented', true);
        });
    });
})
