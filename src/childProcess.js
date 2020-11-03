const childIPC = {};

/**
 * Registers the listeners to handle the communication between this process and the main process.
 * @param handlers
 */
childIPC.registerListeners = (handlers) => {
    const handlerMap = {};
    handlers.forEach((handler) => {
        handlerMap[handler.id] = handler.callback;
    });

    process.on('message', (message) => {
        try
        {
            let listenerResult = handlerMap[message.id](...message.args);

            process.send({id: message.requestId, data: listenerResult, status: "success"});
        }
        catch (error)
        {
            process.send({id: message.requestId, data: error, status: "failure" });
        }
    });
};

module.exports = childIPC;