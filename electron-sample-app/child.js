const childIpc = require('electron-child-ipc')

let handler = [{id: 'test', method: () => {return 'request received and responded'}}];

childIpc.registerListeners(handler);

