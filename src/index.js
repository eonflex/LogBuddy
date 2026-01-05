import fs from 'fs';
import path from 'path';

function main() {
    const [,, logPathAArg, LogType] = process.argv;

    const configPath = './config.json'; //Default to cwd config.json
    if (!logPathAArg) {
        console.error('Usage: node src/index.js <logPathA>');
        process.exit(1);
    }
    try{

        const logPathA = path.resolve(logPathAArg);
        //const logPathB = path.resolve(logPathBArg);
    }
    catch (error) {
        console.error('Error resolving file paths:', error);
        process.exit(1);
    }

    //Send Log to Parser
    const parserA = new LogParser(logPathA, 'SomeLogType', configPath);

}

main();
