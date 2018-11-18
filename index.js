function RelaksEventEmitter() {
    this.listeners = [];
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
 * Send event to event listeners, return true or false depending on whether
 * there were any listeners
 *
 * @param  {RelaksDjangoDataSourceEvent} evt
 *
 * @return {Boolean}
 */
prototype.triggerEvent = function(evt) {
    var listeners = this.listeners.filter(function(listener) {
        return (listener.type === evt.type);
    });
    if (listeners.length === 0) {
        return false;
    }
    dispatchEvent(evt, listeners);
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
    return null;
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
