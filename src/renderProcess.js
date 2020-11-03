const promiseIpc = require('electron-promise-ipc');

const childIPC = {};

/**
 * Sends a request to the specified child process, returns a promise
 * @param processID String id for the child process to send the request to
 * @param request Data to send { id: string, args: []}
 * @returns {Promise<any>}
 */
childIPC.sendToChildProcess = (processID, request) => {
    return promiseIpc.send(processID, request);
};

module.exports = childIPC;