const chalk = require('chalk');

const LOG_TYPES = {
    ERROR: 'ERROR: ',
    SUCCESS: 'SUCCESS: ',
    INFO: 'INFO: ',
    WARNING: 'WARNING: ',
}



function logWithStyle(message:string, style: typeof chalk,logType:number): void {
    const logTypeString: string = Object.values(LOG_TYPES)[logType] || LOG_TYPES.INFO;
    console.log(style(logTypeString + message));
}

export const logger = {
    error: (message: string) => logWithStyle(message, chalk.red.bold,0),
    success: (message: string) => logWithStyle(message, chalk.green.bold,1),
    info: (message:string) => logWithStyle(message, chalk.blue.bold,2),
    warning: (message:string) => logWithStyle(message, chalk.yellow.bold,3),
}


