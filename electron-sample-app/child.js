const childIpc = require('electron-child-ipc')

let handlers = [{id: 'test', callback: () => {return 'request received and responded'}}];

childIpc.registerListeners(handlers);

