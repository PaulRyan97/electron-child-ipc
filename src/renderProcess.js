const childIPC = {};

childIPC.sendToChildProcess = (processID, request) => {
    return promiseIpc.send(processID, request);
};

module.exports = childIPC;