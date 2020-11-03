const childIPC = {};

childIPC.registerListeners = (handlers) => {
    const handlerMap = {};
    handlers.forEach((handler) => {
        handlerMap[handler.id] = handler.method;
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