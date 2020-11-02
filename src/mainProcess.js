const { fork } = require('child_process');
const promiseIpc = require('electron-promise-ipc');

const childIPC = {};

childIPC.createAndRegisterChildProcess = (id, modulePath, args) => {

    const childProcess = fork(modulePath, args, { stdio: 'ipc', env: { isChild: 1 } });

    let processRequests = [];
    let processRequestCount = 0;

    promiseIpc.on(id, (data) => {
       return sendRequest(data.id, data.args)
    });

    const sendRequest = (messageID, args) =>
    {
        return new Promise((resolve, reject) =>
        {
            let request = createRequestObject(resolve, reject);
            let message =
                {
                    id: messageID,
                    requestId: request.id,
                    args: args
                };
            childProcess.send(message);
        });
    };

    const createRequestObject = (resolve, reject) =>
    {
        let request =
            {
                id: processRequestCount,
                resolve: resolve,
                reject: reject,
            };
        processRequests.push(request);
        processRequestCount++;

        return request;
    };

    //Receive response from the child process
    childProcess.on('message', (response) =>
    {
        //Find the promise the response id is referring to
        let promiseToHandle = processRequests.find((request) => request.id === response.id);
        if (response.status === "failure")
        {
            promiseToHandle.reject(response.data);
        }
        else
        {
            promiseToHandle.resolve(response.data);
        }
        //Remove that request from the array
        processRequests = processRequests.filter((request) => request.id !== promiseToHandle.id);
    });
};

module.exports = childIPC;