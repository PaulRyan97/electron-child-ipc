# electron-child-ipc
Simplified way to create and communicate with node child processes from an electron application.

## Installation
```sh
npm install electron-child-ipc
```

## Usage

Create one or more child processes from your main process, this will fork a node process and set up the relevant listeners for you.
```js
//Main process
const childIpc = require('electron-child-ipc')

childIpc.createAndRegisterChildProcess('child1', path.join(__dirname, 'child.js'));
```

In the module used for your child process, set up the listeners for calls from the main process. The callback also supports async functions.
```js
//Child process
const childIpc = require('electron-child-ipc');

let handlers = [
    {
        id: 'test',
        callback: () => 'Request received and responded to'
    },
    {
        id: 'test2',
        callback: () => {
            return new Promise((resolve, reject) => {
                setTimeout(() => resolve("Asynchronous call returned"), 3000);
            });
        }
    },
];

childIpc.registerListeners(handlers);
```

Send data from your renderer to your child process like so:
```js
//Renderer process
const childIpc = require('electron-child-ipc');

childIpc.sendToChildProcess('child1', {id: 'test', args: []}).then((result) => {
    console.log(result);
    //Expected result "Request received and responded to"
});

childIpc.sendToChildProcess('child1', {id: 'test2', args: []}).then((result) => {
    console.log(result);
    //Expected result "Asynchronous call returned"
});
```
## Licence
MIT