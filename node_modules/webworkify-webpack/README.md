# webworkify-webpack

Generates a web worker at runtime from webpack's bundled modules with only the used dependencies. Possible because of webpack's module structure. Just `require.resolve(PATH_TO_MODULE)` the module you want to be the worker's entry point.

inspired by [webworkify](https://github.com/substack/webworkify)

# install

```sh
npm install webworkify-webpack --save
```

# v2 vs v1

For v1 go to: [1.1.8](https://github.com/borisirota/webworkify-webpack/tree/1.1.8)

Version 2 uses webpack's api as much as possible vs the hacky implementation of version 1 (I wasn't aware of webpack's api while writing it) which did the job but with some inconsistency between different browsers and some caveats.

In v2:
* no limitation on webpack's devtool - `eval` was forbidden in v1.
* no issues with anonymous functions exported as module.exports - there were issues with anonymous functions in v1.
* `require.resolve` instead of regular `require\import` - The only limitation is using `require.resolve` which means that currently the code using `webworkify-webpack` is coupled to the build tool (webpack - but who uses `webworkify-webpack` already uses webpack) and its not possible to use es2015 modules => checkout out the [future work](#future-work) section.

# webworkify-webpack vs webpack's [worker-loader](https://github.com/webpack/worker-loader) and [target: 'webworker'](https://webpack.github.io/docs/configuration.html#target)

`webworkify-webpack` allows to use one bundle for running same code both on browser and web worker environments.
webpack's current alternatives for web workers are creating bundle which can be run in a web worker environment only and can results in 2 separate files like in the `worker-loader` case (one file for browser and one for web worker => code duplication).

The motivation for `webworkify-webpack` was creating a library which expose to the user the same functionality both in sync and async forms.
I wanted to keep one bundle in order to reduce complexity of using external library to the minimum and make bundle size as minimal as possible when using external library which supports both sync and async functionality (without code duplication).

Since webpack's solutions for web workers are being constructed at compile time, the added value is that its possible to use dev tools like `hmr` (at least when using `target: 'webworker'`) which isn't possible with `webworkify-webpack`.  
In addition, regular `js` syntax is being used without the need to use `require.resolve` as in the `webworkify-webpack` case => checkout out the [future work](#future-work) section.

# methods

```js
import work from 'webworkify-webpack'
```

## let w = work(require.resolve(modulePath) [, options])

Return a new
[web worker](https://developer.mozilla.org/en-US/docs/Web/API/Worker)
from the module at `modulePath`.

The file at `modulePath` should export its worker code in `module.exports` as a
function that will be run with no arguments.

Note that all the code outside of the `module.exports` function will be run in
the main thread too so don't put any computationally intensive code in that
part. It is necessary for the main code to `require()` the worker code to fetch
the module reference and load `modulePath`'s dependency graph into the bundle
output.

### options
- all - bundle all the dependencies in the web worker and not only the used ones. can be useful in edge cases that I'm not aware of when the used dependencies aren't being resolved as expected due to the runtime regex checking mechanism or just to avoid additional work at runtime to traverse the dependencies tree.
- bare - the return value will be the blob constructed with the worker's code and not the web worker itself.

# example

First, a `main.js` file will launch the `worker.js` and print its output:

```js
import work from 'webworkify-webpack';

let w = work(require.resolve('./worker.js'));
w.addEventListener('message', event => {
    console.log(event.data);
});

w.postMessage(4); // send the worker a message
```

then `worker.js` can `require()` modules of its own. The worker function lives
inside of the `module.exports`:

```js
import gamma from 'gamma'

module.exports = function worker (self) {
    self.addEventListener('message', (event) => {
        const startNum = parseInt(event.data); // ev.data=4 from main.js
        setInterval(() => {
            const r = startNum / Math.random() - 1;
            self.postMessage([ startNum, r, gamma(r) ]);
        }, 500);
    });
};
```

Now after [webpackifying](https://webpack.github.io) this example, the console will
contain output from the worker:

```
[ 4, 0.09162078520553618, 10.421030346237066 ]
[ 4, 2.026562457360466, 1.011522336481017 ]
[ 4, 3.1853125018703716, 2.3887589540750214 ]
[ 4, 5.6989969260510005, 72.40768854476167 ]
[ 4, 8.679491643020487, 20427.19357947782 ]
[ 4, 0.8528139834191428, 1.1098187157762498 ]
[ 4, 8.068322137547542, 5785.928308309402 ]
...
```

# future work

The goal is to make `webworkify-webpack` fully based on webpack's api. I'm not sure how to accomplish it since I never wrote a webpack loader\plugin (is it possible other way?) so I'm asking for help :)

Points of view:  

1. [webpackBootstrapFunc](https://github.com/borisirota/webworkify-webpack/blob/master/index.js#L1) - should be taken from webpack's source.  
2. ability to use regular module import\require (not `require.resolve`) but still passing the module id to 'webworkify-webpack'.  
3. ability to know all specific's module dependencies in compile time so there is no need to traverse the dependencies tree in runtime with regular expressions (when uglifying the code the web worker's bundle can include more dependencies than only the used ones because regular expressions nature).  
4. if there is going to be build in compile time, what about hmr as dev tool ?  
5. is the ability 'webworkify-webpack' provides should be part of webpack core as another form of web workers support or should it remain as external module ?

# license

MIT
