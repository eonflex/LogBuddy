// Parser for log files
import { ConfigLoader } from './configLoader.js';
import { LogColumn } from './logColumn.js';
import fs from 'fs';
import readline from 'readline';

class LogParser {
    //----Properties----
    logPath;
    logColumnTypes;
    logType;
    configPath;
    delimiter;

    //----Constructors----
    constructor(logPath, logType = null, configPath = null) {
        this.logPath = logPath;
        this.logType = logType;
        this.configPath = configPath;
        this.delimiter = ConfigLoader.getDelimiterFromConfig(this.configPath, this.logType);
        this.logColumnTypes = ConfigLoader.loadColumnsFromConfig(this.configPath, this.logType);
    }

    //----Methods----

    /**
     * Stream the log file line-by-line.
     * - If `onLine` callback is provided, it will be called for each line with signature: onLine(line, { delimiter, logColumns })
     *   The callback may return a transformed line (or a Promise thereof). If it returns undefined, the original line is kept.
     * - If `onLine` is omitted, the method will collect and return an array of raw lines.
     *
     * @param {function|null} onLine
     * @returns {Promise<string[]>}
     */
    async parse(onLine = null){
        const rl = readline.createInterface({ input: fs.createReadStream(this.logPath), crlfDelay: Infinity });

        // Resolve possibly-Promise delimiter and columns
        const [resolvedDelimiter, resolvedColumns] = await Promise.all([
            Promise.resolve(this.delimiter),
            Promise.resolve(this.logColumnTypes),
        ]);

        const results = [];
        for await (const rawLine of rl) {
            let line = rawLine;
            if (typeof onLine === 'function') {
                try {
                    const maybe = onLine(line, { delimiter: resolvedDelimiter, logColumns: resolvedColumns });
                    if (maybe && typeof maybe.then === 'function') {
                        const awaited = await maybe;
                        if (typeof awaited === 'string') line = awaited;
                    } else if (typeof maybe === 'string') {
                        line = maybe;
                    }
                } catch (err) {
                    console.error('Error in onLine callback:', err);
                }
            }
            results.push(line);
        }

        return results;
    }
    /**
     * Replace the token at the specified column index with the simplifier string from the legend values in the config file
     *
     * Parameters:
     *  - line (string): the log line to operate on
     *  - columnIndex (number): zero-based index of the column to examine/replace
     *  - logColumns (Array|Promise|null): optional array (or Promise thereof) of LogColumn objects; if omitted,
     *      `this.logColumnTypes` is used
     *  - delimiter (string|null): optional delimiter to split/join the line; defaults to `this.delimiter`
     *
     * Returns: string | Promise<string> — if a Promise of columns is supplied or present on the instance,
     * the method returns a Promise that resolves to the modified line; otherwise it returns the modified line.
     */
    replaceColumnWithSimplifier(line, columnIndex, logColumns = null, delimiter = null, simplifier = '<OTHER>') {
        const colsOrPromise = logColumns ?? this.logColumnTypes;
        const delim = delimiter ?? this.delimiter ?? ' ';

        const doReplace = (cols) => {
            if (!Array.isArray(cols)) return line;
            if (typeof columnIndex !== 'number' || columnIndex < 0 || columnIndex >= cols.length) return line;

            const col = cols[columnIndex];
            const type = (col && (col.columnType ?? col.ColumnType)) || '';

            const parts = line.split(delim);
            if (columnIndex >= parts.length) return line;
            parts[columnIndex] = simplifier;
            return parts.join(delim);
        };

        // If colsOrPromise is a thenable, return a Promise resolving to the replaced line
        if (colsOrPromise && typeof colsOrPromise.then === 'function') {
            return colsOrPromise.then(cols => doReplace(cols));
        }

        return doReplace(colsOrPromise);
    }

    // Convert to simplified format for large anaylsis
    convertToSimplifiedFormat(line){
        for(column in this.logColumnTypes){
            this.replaceColumnWithSimplifier(line, column, this.logColumnTypes, this.delimiter, ConfigLoader._legendCache(column.name) );
        }
    }

    //Convert to hash values for duplicate line detection
    convertToHashFormat(line){
        // Placeholder for hash conversion logic
        return line;
    }
}



export { LogParser };

