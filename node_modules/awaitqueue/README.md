# AwaitQueue

[![][npm-shield-awaitqueue]][npm-awaitqueue]
[![][github-actions-shield-awaitqueue]][github-actions-awaitqueue]

JavaScript utility to enqueue asynchronous tasks and run them sequentially one after another. For Node.js and the browser.


## Installation

```bash
$ npm install awaitqueue
```

## Usage

* In ES6:

```js
import {
  AwaitQueue,
  AwaitQueueTask,
  AwaitQueueTaskDump,
  AwaitQueueStoppedError,
  AwaitQueueRemovedTaskError
} from 'awaitqueue';
```

* In CommonJS:

```js
const { 
  AwaitQueue,
  AwaitQueueTask,
  AwaitQueueTaskDump,
  AwaitQueueStoppedError,
  AwaitQueueRemovedTaskError
} = require('awaitqueue');
```


## Types

#### `type AwaitQueueTask`

```typescript
type AwaitQueueTask<T> = () => (T | PromiseLike<T>);
```

TypeScript type representing a function that returns a value `T` or a Promise that resolves with `T`.

#### `type AwaitQueueTaskDump`

```typescript
type AwaitQueueTaskDump =
{
  idx: number;
  task: AwaitQueueTask<unknown>;
  name?: string;
  enqueuedTime: number;
  executionTime: number;
};
```

TypeScript type representing an item in the array returned by the `awaitQueue.dump()` method.

* `idx`: Index of the pending task in the queue (0 means the task being processed now).
* `task`: The function to be executed.
* `name`: The name of the given `function` (if any) or the `name` argument given to `awaitQueue.push()` method (if any).
* `enqueuedTime`: Time in milliseconds since the task was enqueued, this is, since `awaitQueue.push()` was called until its execution started or until now if not yet started.
* `executionTime`: Time in milliseconds since the task execution started (or 0 if not yet started).


## API

#### `new AwaitQueue()`

Creates an `AwaitQueue` instance.

#### `awaitQueue.size: number`

Number of enqueued pending tasks.

#### `async awaitQueue.push(task: AwaitQueueTask<T>, name?: string): Promise<T>`

Accepts a task as argument and enqueues it after pending tasks. Once processed, the `push()` method resolves (or rejects) with the result returned by the given task.

* `@param task`: Asynchronous or asynchronous function.
* `@param name`: Optional task name (useful for `awaitQueue.dump()` method).

#### `awaitQueue.stop(): void`

Make pending tasks reject with an instance of `AwaitQueueStoppedError`. The `AwaitQueue` instance is still usable for future tasks added via `push()` method.

#### `awaitQueue.remove(taskIdx: number): void`

Removes the pending task with given index. The task is rejected with an instance of `AwaitQueueRemovedTaskError`.

* `@param taskIdx`: Index of the pending task to be removed.

#### `awaitQueue.dump(): AwaitQueueTaskDump[]`

Returns an array with information about pending tasks in the queue. See the `AwaitQueueTaskDump` type above.


## Usage example

See [test.ts](src/test.ts) file.


## Author

* Iñaki Baz Castillo [[website](https://inakibaz.me)|[github](https://github.com/ibc/)]


## License

[ISC](./LICENSE)




[npm-shield-awaitqueue]: https://img.shields.io/npm/v/awaitqueue.svg
[npm-awaitqueue]: https://npmjs.org/package/awaitqueue
[github-actions-shield-awaitqueue]: https://github.com/versatica/awaitqueue/actions/workflows/awaitqueue.yaml/badge.svg
[github-actions-awaitqueue]: https://github.com/versatica/awaitqueue/actions/workflows/awaitqueue.yaml
