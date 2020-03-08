function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var RelaksEventEmitter = /*#__PURE__*/function () {
  function RelaksEventEmitter() {
    _classCallCheck(this, RelaksEventEmitter);

    this.listeners = [];
    this.promises = [];
  }
  /**
   * Attach an event handler
   *
   * @param  {String} type
   * @param  {Function} handler
   * @param  {Boolean|undefined} beginning
   */


  _createClass(RelaksEventEmitter, [{
    key: "addEventListener",
    value: function addEventListener(type, handler, beginning) {
      if (typeof type !== 'string') {
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
        this.listeners.unshift({
          type: type,
          handler: handler
        });
      } else {
        this.listeners.push({
          type: type,
          handler: handler
        });
      }
    }
    /**
     * Remove an event handler
     *
     * @param  {String} type
     * @param  {Function} handler
     */

  }, {
    key: "removeEventListener",
    value: function removeEventListener(type, handler) {
      this.listeners = this.listeners.filter(function (listener) {
        return !(listener.type === type && listener.handler === handler);
      });
    }
    /**
     * Return a promise that will be fulfilled when the specified event occurs
     *
     * @param  {String} type
     * @param  {Number|undefined} timeout
     *
     * @return {Promise<Event>}
     */

  }, {
    key: "waitForEvent",
    value: function waitForEvent(type, timeout) {
      var promise = this.promises[type];

      if (!promise) {
        var resolve, reject;
        promise = new Promise(function (f1, f2) {
          resolve = f1;
          reject = f2;
        });
        promise.resolve = resolve;
        promise.reject = reject;
        this.promises[type] = promise;

        if (timeout) {
          setTimeout(function () {
            if (promise.reject) {
              promise.reject(new Error("No '".concat(type, "' event within ").concat(timeout, "ms")));
            }
          }, timeout);
        }
      }

      return promise;
    }
    /**
     * Return a promise that will be fulfilled when a 'change' event occurs
     *
     * @param  {String} type
     * @param  {Number|undefined} timeout
     *
     * @return {Promise<Event>}
     */

  }, {
    key: "change",
    value: function change(timeout) {
      return this.waitForEvent('change');
    }
    /**
     * Send event to event listeners, return true or false depending on whether
     * there were any listeners
     *
     * @param  {RelaksDjangoDataSourceEvent} evt
     *
     * @return {Boolean}
     */

  }, {
    key: "triggerEvent",
    value: function triggerEvent(evt) {
      var promise = this.promises[evt.type];

      if (promise) {
        delete this.promises[evt.type];
      }

      var listeners = this.listeners.filter(function (listener) {
        return listener.type === evt.type;
      });

      if (listeners.length === 0) {
        if (promise) {
          promise.reject = null;
          promise.resolve(evt);
          return true;
        } else {
          return false;
        }
      }

      evt.decisionPromise = this.dispatchEvent(evt, listeners).then(function () {
        if (promise) {
          promise.reject = null;
          promise.resolve(evt);
        }
      });
      return true;
    }
  }, {
    key: "dispatchEvent",
    value: function dispatchEvent(evt, listeners) {
      var _this = this;

      for (var i = 0; i < listeners.length; i++) {
        var listener = listeners[i];
        listener.handler.call(evt.target, evt);

        if (evt.defaultPostponed) {
          var _ret = function () {
            var remainingListeners = listeners.slice(i + 1);
            return {
              v: evt.defaultPostponed.then(function (decision) {
                if (decision === false) {
                  evt.preventDefault();
                  evt.stopImmediatePropagation();
                }

                if (!evt.propagationStopped) {
                  return _this.dispatchEvent(evt, remainingListeners);
                }
              })
            };
          }();

          if (_typeof(_ret) === "object") return _ret.v;
        }

        if (evt.propagationStopped) {
          break;
        }
      }

      return Promise.resolve();
    }
  }]);

  return RelaksEventEmitter;
}();

var RelaksGenericEvent = /*#__PURE__*/function () {
  function RelaksGenericEvent(type, target, props) {
    _classCallCheck(this, RelaksGenericEvent);

    this.type = type;
    this.target = target;
    this.defaultPrevented = false;
    this.defaultPostponed = null;
    this.propagationStopped = false;
    this.decisionPromise = null;
    Object.assign(this, props);
  }

  _createClass(RelaksGenericEvent, [{
    key: "preventDefault",
    value: function preventDefault() {
      this.defaultPrevented = true;
    }
  }, {
    key: "postponeDefault",
    value: function postponeDefault(promise) {
      if (promise instanceof Function) {
        promise = promise();
      }

      if (!promise || !(promise.then instanceof Function)) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Non-promise passed to postponeDefault()');
        }

        return;
      }

      this.defaultPostponed = promise;
    }
  }, {
    key: "stopImmediatePropagation",
    value: function stopImmediatePropagation() {
      this.propagationStopped = true;
    }
  }, {
    key: "waitForDecision",
    value: function waitForDecision() {
      return Promise.resolve(this.decisionPromise);
    }
  }]);

  return RelaksGenericEvent;
}();

export default RelaksEventEmitter;
export { RelaksEventEmitter as EventEmitter, RelaksGenericEvent as GenericEvent, RelaksEventEmitter, RelaksGenericEvent };
