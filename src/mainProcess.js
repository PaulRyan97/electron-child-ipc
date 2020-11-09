const { fork } = require('child_process');
const promiseIpc = require('electron-promise-ipc');

const childIPC = {};

/**
 * Create's a node child process and sets up the listeners to handle the relevant ipc calls
 * between the main, renderer and child processes
 * @param id Unique string id to give to the child process
 * @param modulePath The module to run in the process.
 * @param args Optional additional arguments, see Node child_process documentation
 * @param onExit Optional function to run when the child process exits.
 */
childIPC.createAndRegisterChildProcess = (id, modulePath, args, onExit) => {

    const childProcess = fork(modulePath, args, { stdio: ['ipc'], env: { isChild: 1 } });

    let pendingRequests = {};
    let requestNum = 0;

    const sendRequest = (data) =>
    {
        return new Promise((resolve, reject) =>
        {
            let request = createRequestObject(resolve, reject, data.timeout);
            let message =
                {
                    id: data.id,
                    requestId: request.id,
                    args: data.args
                };

            childProcess.send(message);
        });
    };

    //Handle request for this process from the renderer
    promiseIpc.on(id, sendRequest);

    const createRequestObject = (resolve, reject, timeout) =>
    {
        let requestIdPrefix = "req_";
        let request =
            {
                id: requestIdPrefix + requestNum,
                resolve: resolve,
                reject: reject,
            };

        if(timeout) {
            request.timeoutHandler = setTimeout(() => {
                reject(new Error("Request timed out waiting for response"));
                delete pendingRequests[request.id];
            }, timeout);
        }
        //Store the request reference for use when a response is received from the child process
        pendingRequests[request.id] = request;
        requestNum++;

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
        //Call the user defined exit function
        if(onExit)
        {
            onExit();
        }
    });

    childProcess.stderr.on('data', function(data) {
        console.log('stdout: ' + data);
    });

    //Receive response from the child process
    childProcess.on('message', (response) =>
    {
        //Find the promise the response id is referring to
        let promiseToHandle = pendingRequests[response.id];

        if(promiseToHandle)
        {
            //Return data to the renderer process
            if (response.status === "failure")
            {
                promiseToHandle.reject(response.data);
            }
            else
            {
                promiseToHandle.resolve(response.data);
            }
            //Remove that pending request
            delete pendingRequests[response.id];
        }
    });
};

module.exports = childIPC;