import fs from 'fs';
import path from 'path';
import { LogParser } from './parser.js';

async function main() {
    //const [,, logPathAArg, LogType] = process.argv;

    var logPathAArg = './tests/emaTest.log'; //Hardcode for testing
    var LogType = 'EMA';

    const configPath = './config.json'; //Default to cwd config.json
    if (!logPathAArg) {
        console.error('Usage: node src/index.js <logPathA>');
        process.exit(1);
    }
    try{

        var logPathA = path.resolve(logPathAArg);
        //const logPathB = path.resolve(logPathBArg);
    }
    catch (error) {
        console.error('Error resolving file paths:', error);
        process.exit(1);
    }

    //Send Log to Parser
    const parserA = new LogParser(logPathA, LogType, configPath);
    var output = await parserA.parse()

    process.exit(0);
}

main();
