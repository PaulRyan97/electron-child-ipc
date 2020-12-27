const childIpc = require('electron-child-ipc');

childIpc.sendToChildProcess('child1', {id: 'test', args: []}).then((result) => {
    console.log(result);
});

childIpc.sendToChildProcess('child1', {id: 'test2', args: []}).then((result) => {
    console.log(result);
});