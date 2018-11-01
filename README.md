# Relaks Event Emitter

Relaks Event Emitter is the base class of data sources used by [Relaks](https://github.com/chung-leong/relaks) applications. It's designed for promised-based asynchronous code. It provides a notable feature allowing event listeners to postpone the default action associated with an event.

## Methods of emitter

* [addEventListener](#addeventlistener)
* [removeEventListener](#removeeventlistener)
* [triggerEvent](#triggerevent)

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

### triggerEvent

```typescript
function triggerEvent(evt: object): boolean
```

Send an event object to any listeners interested in the event. A method used by the event emitter itself. The return value indicates whether there were any listeners.

## Methods of event object

* [preventDefault](#preventdefault)
* [postponeDefault](#postponedefault)
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

Request that the default action to be postpone. This function accepts a promise. A event emitter would wait for this promise to be fulfilled before perform the default action. If the promise's fulfillment value is `false`, that'd be the equivalent of calling `preventDefault()`.

When there are multiple listeners, a call to this function will keep other listeners from receiving the event until the promise given is fulfilled.

### stopImmediatePropagation

```typescript
function stopImmediatePropagation(void): void
```

Keep listeners further down the chain from receiving this event.

### waitForDecision

```typescript
async function waitForDecision(void): void
```

A method used by the event emitter itself. If a `postponeDefault()` was called on the event, wait for the fulfillment of the promise given. Resolve immediately otherwise.
