import fs from 'fs';
import path from 'path';

function main() {
    const [,, logPathAArg, logPathBArg] = process.argv;

    if (!logPathAArg || !logPathBArg) {
        console.error('Usage: node src/index.js <logPathA> <logPathB>');
        process.exit(1);
    }
    try{

        const logPathA = path.resolve(logPathAArg);
        const logPathB = path.resolve(logPathBArg);
    }
    catch (error) {
        console.error('Error resolving file paths:', error);
        process.exit(1);
    }

    // Get the logs from the specified paths
    const logA = fs.readFileSync(logPathA, 'utf-8');
    const logB = fs.readFileSync(logPathB, 'utf-8');

    // Process the logs (this is a placeholder for actual processing logic)
    console.log('Log A Contents:', logA);
    console.log('Log B Contents:', logB);

}

main();