import Chai, { expect } from 'chai';
import ChaiAsPromised from 'chai-as-promised';
import RelaksEventEmitter, { GenericEvent } from '../index';

Chai.use(ChaiAsPromised);

describe('#postponeDefault()', function() {
    it ('should postpone default behavior', function() {
        let emitter = new RelaksEventEmitter;
        let promise = ManualPromise();
        let called = [];
        emitter.addEventListener('change', (evt) => {
            called.push('a');
            evt.postponeDefault(promise);
        });
        let event = new GenericEvent('change', emitter);
        emitter.triggerEvent(event);
        setTimeout(() => {
            called.push('b');
            promise.resolve();
        }, 100);
        return event.waitForDecision().then(() => {
            if (!event.defaultPrevented) {
                called.push('c');
            }
        }).then(() => {
            expect(called).to.eql([ 'a', 'b', 'c' ]);
        });
    })
    it ('should prevent default behavior when promise is fulfilled with false', function() {
        let emitter = new RelaksEventEmitter;
        let promise = ManualPromise();
        let called = [];
        emitter.addEventListener('change', (evt) => {
            called.push('a');
            evt.postponeDefault(promise);
        });
        let event = new GenericEvent('change', emitter);
        emitter.triggerEvent(event);
        setTimeout(() => {
            called.push('b');
            promise.resolve(false);
        }, 100);
        return event.waitForDecision().then(() => {
            if (!event.defaultPrevented) {
                called.push('c');
            }
        }).then(() => {
            expect(called).to.eql([ 'a', 'b' ]);
        });
    })
    it ('should keep other handlers from being called', function() {
        let emitter = new RelaksEventEmitter;
        let promise = ManualPromise();
        let called = [];
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
        let event = new GenericEvent('change', emitter);
        emitter.triggerEvent(event);
        setTimeout(() => {
            called.push('b');
            promise.resolve();
        }, 100);
        return event.waitForDecision().then(() => {
            if (!event.defaultPrevented) {
                called.push('e');
            }
        }).then(() => {
            expect(called).to.eql([ 'a', 'b', 'c', 'd', 'e' ]);
        });
    })
    it ('should correctly handle calls by multiple handlers', function() {
        let emitter = new RelaksEventEmitter;
        let promise1 = ManualPromise();
        let promise2 = ManualPromise();
        let called = [];
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
        let event = new GenericEvent('change', emitter);
        emitter.triggerEvent(event);
        setTimeout(() => {
            called.push('b');
            promise1.resolve();
        }, 100);
        setTimeout(() => {
            called.push('e');
            promise2.resolve(false);
        }, 250);
        return event.waitForDecision().then(() => {
            if (!event.defaultPrevented) {
                called.push('f');
            }
        }).then(() => {
            expect(called).to.eql([ 'a', 'b', 'c', 'd', 'e' ]);
        });
    })
    it ('should interact correctly with stopImmediatePropagation()', function() {
        let emitter = new RelaksEventEmitter;
        let promise1 = ManualPromise();
        let promise2 = ManualPromise();
        let called = [];
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
        let event = new GenericEvent('change', emitter);
        emitter.triggerEvent(event);
        setTimeout(() => {
            called.push('b');
            promise1.resolve();
        }, 100);
        setTimeout(() => {
            called.push('e');
            promise2.resolve(false);
        }, 250);
        return event.waitForDecision().then(() => {
            if (!event.defaultPrevented) {
                called.push('f');
            }
        }).then(() => {
            expect(called).to.eql([ 'a', 'b', 'c', 'f' ]);
        });
    })
})

function ManualPromise() {
    let resolveFunc, rejectFunc;
    let promise = new Promise((resolve, reject) => {
        resolveFunc = resolve;
        rejectFunc = reject;
    });
    promise.resolve = resolveFunc;
    promise.reject = rejectFunc;
    return promise;
}
