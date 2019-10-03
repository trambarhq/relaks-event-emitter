# Relaks Event Emitter

Relaks Event Emitter is the base class of data sources used by [Relaks](https://github.com/trambarhq/relaks) applications. It's designed for promised-based asynchronous code. It provides a notable feature allowing event listeners to postpone the default action associated with an event.

## Methods of emitter

* [addEventListener](#addeventlistener)
* [removeEventListener](#removeeventlistener)
* [triggerEvent](#triggerevent)
* [waitForEvent](#waitforevent)

### addEventListener

```typescript
function addEventListener(name: string, handler: function, beginning?:boolean): void
```

Add an event listener. If `beginning` is `true`, then `handler` will receive the event prior to handlers added previously. Otherwise it's placed at the end of the queue.

### removeEventListener

```typescript
function removeEventListener(name: string, handler: function): void
```

Remove an event listener.

### waitForEvent()

```typescript
async function waitForEvent(type: string): Event
```

Return a promise that is fulfilled when an event of the specified type occurs.

### triggerEvent

```typescript
function triggerEvent(evt: object): boolean
```

Send an event object to any listeners interested in the event. A method used by the event emitter itself. The return value indicates whether there were any listeners.

## Methods of event object

* [preventDefault](#preventdefault)
* [postponeDefault](#postponedefault)
* [stopImmediatePropagation](#stopimmediatepropagation)
* [waitForDecision](#waitfordecision)

### preventDefault

```typescript
function preventDefault(void): void
```

Indicate that the default action should not be performed.

### postponeDefault

```typescript
function postponeDefault(proceed: Promise): void
```

```typescript
function postponeDefault(callback: AsyncFunction): void
```

Request that the default action to be postponed. The method accepts either a promise or a callback function that returns a promise. An event emitter would wait for this promise to be fulfilled before perform the default action. If the promise's fulfillment value is `false` (and not merely "falsy"), that'd be the equivalent of calling `preventDefault()` and `stopImmediatePropagation()`--i.e. the default action will not occur.

When there are multiple listeners, a call to this method will keep other listeners from receiving the event until the promise given is fulfilled.

### stopImmediatePropagation

```typescript
function stopImmediatePropagation(void): void
```

Keep listeners further down the chain from receiving this event.

### waitForDecision

```typescript
async function waitForDecision(void): void
```

A method used by the event emitter itself. If a promise is given to `postponeDefault()` within an event handler, this method will wait for its fulfillment. The method returns immediately otherwise.
