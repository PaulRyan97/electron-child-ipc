const mainProcess = require("./mainProcess");
const childProcess = require("./childProcess");
const renderProcess = require("./renderProcess");


const childIPC = process.env.isChild ? childProcess : process.type === "renderer" ? renderProcess : mainProcess;

module.exports = childIPC;