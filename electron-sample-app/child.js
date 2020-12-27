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

