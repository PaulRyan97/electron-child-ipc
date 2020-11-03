const { fork } = require('child_process');
const promiseIpc = require('electron-promise-ipc');

const childIPC = {};

/**
 * Create's a node child process and sets up the listeners to handle the relevant ipc calls
 * between the main, renderer and child processes
 * @param id Unique string id to give to the child process
 * @param modulePath The module to run in the process.
 * @param args Additional arguments, see Node child_process documentation
 */
childIPC.createAndRegisterChildProcess = (id, modulePath, args) => {

    const childProcess = fork(modulePath, args, { stdio: ['ipc'], env: { isChild: 1 } });

    let processRequests = [];
    let processRequestCount = 0;

    //Handle request for this process from the renderer
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
        //Store the request reference for use when a response is received from the child process
        processRequests.push(request);
        processRequestCount++;

        return request;
    };

    childProcess.on('exit', function(code, signal) {
        if(code !== null)
        {
            console.log(`Child process '${id}' exited with exit code ${code}`);
        }
        else {
            console.log(`Child process '${id} terminated with signal ${signal}`);
        }
    });

    childProcess.stderr.on('data', function(data) {
        console.log('stdout: ' + data);
    });

    //Receive response from the child process
    childProcess.on('message', (response) =>
    {
        //Find the promise the response id is referring to
        let promiseToHandle = processRequests.find((request) => request.id === response.id);
        //Return data to the rendered process
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