function RelaksEventEmitter() {
    this.listeners = [];
    this.promises = [];
}

var prototype = RelaksEventEmitter.prototype;

/**
 * Attach an event handler
 *
 * @param  {String} type
 * @param  {Function} handler
 * @param  {Boolean|undefined} beginning
 */
prototype.addEventListener = function(type, handler, beginning) {
    if (typeof(type) !== 'string') {
        if (process.env.NODE_ENV !== 'production') {
            console.warn('Invalid event type passed to addEventListener()');
        }
        return;
    }
    if (!(handler instanceof Function) && handler != null) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn('Non-function passed to addEventListener()');
        }
        return;
    }
    if (beginning) {
        this.listeners.unshift({ type: type,  handler: handler });
    } else {
        this.listeners.push({ type: type,  handler: handler });
    }
};

/**
 * Remove an event handler
 *
 * @param  {String} type
 * @param  {Function} handler
 */
prototype.removeEventListener = function(type, handler) {
    this.listeners = this.listeners.filter(function(listener) {
        return !(listener.type === type && listener.handler === handler);
    })
};

/**
 * Return a promise that will be fulfilled when the specified event occurs
 *
 * @param  {String} type
 *
 * @return {Promise<Event>}
 */
prototype.waitForEvent = function(type) {
    var promise = this.promises[type];
    if (!promise) {
        var resolve, reject;
        promise = new Promise(function(f1, f2) {
            resolve = f1;
            reject = f2;
        });
        promise.resolve = resolve;
        promise.reject = reject;
        this.promises[type] = promise;
    }
    return promise;
};

/**
 * Send event to event listeners, return true or false depending on whether
 * there were any listeners
 *
 * @param  {RelaksDjangoDataSourceEvent} evt
 *
 * @return {Boolean}
 */
prototype.triggerEvent = function(evt) {
    var promise = this.promises[evt.type];
    if (promise) {
        delete this.promises[evt.type];
    }
    var listeners = this.listeners.filter(function(listener) {
        return (listener.type === evt.type);
    });
    if (listeners.length === 0) {
        if (promise) {
            promise.resolve(evt);
            return true;
        } else {
            return false;
        }
    }
    dispatchEvent(evt, listeners).then(function() {
        if (promise) {
            promise.resolve(evt);
        }
    });
    return true;
};

function dispatchEvent(evt, listeners) {
    for (var i = 0; i < listeners.length; i++) {
        var listener = listeners[i];
        listener.handler.call(evt.target, evt);

        if (evt.defaultPostponed) {
            var remainingListeners = listeners.slice(i + 1);
            var promise = evt.defaultPostponed.then(function(decision) {
                if (decision === false) {
                    evt.preventDefault();
                    evt.stopImmediatePropagation();
                }
                if (!evt.propagationStopped) {
                    return dispatchEvent(evt, remainingListeners);
                }
            });
            if (!evt.decisionPromise) {
                evt.decisionPromise = promise;
            }
            return promise;
        }
        if (evt.propagationStopped) {
            break;
        }
    }
    return Promise.resolve();
}

function GenericEvent(type, target, props) {
    this.type = type;
    this.target = target;
    for(var key in props) {
        this[key] = props[key];
    }
    this.defaultPrevented = false;
    this.defaultPostponed = null;
    this.propagationStopped = false;
    this.decisionPromise = null;
}

var prototype = GenericEvent.prototype;

prototype.preventDefault = function() {
    this.defaultPrevented = true;
};

prototype.postponeDefault = function(promise) {
    if (!promise || !(promise.then instanceof Function)) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn('Non-promise passed to postponeDefault()');
        }
        return;
    }
    this.defaultPostponed = promise;
};

prototype.stopImmediatePropagation = function() {
    this.propagationStopped = true;
};

prototype.waitForDecision = function() {
    if (!this.decisionPromise) {
        return Promise.resolve();
    }
    return this.decisionPromise;
};

module.exports = RelaksEventEmitter;
module.exports.RelaksEventEmitter = RelaksEventEmitter;
module.exports.GenericEvent = GenericEvent;
