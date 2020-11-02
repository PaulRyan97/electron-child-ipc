import mainProcess from "./mainProcess";
import childProcess from "./childProcess";


const childIPC = process.env.isChild ? childProcess : process.type === "renderer" ? renderProcess : mainProcess;

export default childIPC;