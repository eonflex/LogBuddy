import fs from 'fs/promises';
import path from 'path';
import { LogColumn } from './logColumn.js';

class ConfigLoader {
    /**
     * Load LogColumns from a config.json file.
     * @param {string|null} configPath - Path to config.json. Defaults to <project root>/config.json.
     * @param {string|null} logTypeName - Optional name of the LogType to use. Defaults to the first entry.
     * @returns {Promise<LogColumn[]>}
     */
    static async loadColumnsFromConfig(configPath = null, logTypeName = null) {
        const cfgPath = configPath ? path.resolve(configPath) : path.resolve(process.cwd(), 'config.json');
        let raw;
        try {
            raw = await fs.readFile(cfgPath, 'utf-8');
        } catch (err) {
            throw new Error(`Failed to read config file at ${cfgPath}: ${err.message}`);
        }

        let json;
        try {
            json = JSON.parse(raw);
        } catch (err) {
            throw new Error(`Invalid JSON in config file: ${err.message}`);
        }

        const logTypes = json.LogTypes;
        if (!Array.isArray(logTypes) || logTypes.length === 0) return [];

        const logType = logTypeName ? logTypes.find(lt => lt.Name === logTypeName) : logTypes[0];
        if (!logType) throw new Error(`LogType '${logTypeName}' not found in config`);
        if (!Array.isArray(logType.Columns)) return [];

        return logType.Columns.map(c => new LogColumn(c.Name, c.ColumnType));
    }

    /**
     * Instance wrapper for convenience
     */
    async loadColumnsFromConfig(configPath = null, logTypeName = null) {
        return await ConfigLoader.loadColumnsFromConfig(configPath, logTypeName);
    }

    /**
     * Static cache for legend maps keyed by config path.
     */
    static _legendCache = null;

    /**
     * Load and cache legend entries from config.json as a map of Name -> ReplaceWith.
     * @param {string|null} configPath
     * @returns {Promise<Object<string,string>>}
     */
    static async _loadLegendMap(configPath = null) {
        const cfgPath = configPath ? path.resolve(configPath) : path.resolve(process.cwd(), 'config.json');
        if (ConfigLoader._legendCache && ConfigLoader._legendCache.path === cfgPath) {
            return ConfigLoader._legendCache.map;
        }

        let raw;
        try {
            raw = await fs.readFile(cfgPath, 'utf-8');
        } catch (err) {
            throw new Error(`Failed to read config file at ${cfgPath}: ${err.message}`);
        }

        let json;
        try {
            json = JSON.parse(raw);
        } catch (err) {
            throw new Error(`Invalid JSON in config file: ${err.message}`);
        }

        const legend = json.Legend;
        const map = {};
        if (Array.isArray(legend)) {
            for (const item of legend) {
                if (item && typeof item.Name === 'string') {
                    map[item.Name] = (item.ReplaceWith ?? null);
                }
            }
        }

        ConfigLoader._legendCache = { path: cfgPath, map };
        return map;
    }

    /**
     * Get the ReplaceWith value for a legend item by Name.
     * Returns null if not found.
     * @param {string} name
     * @param {string|null} configPath
     * @returns {Promise<string|null>}
     */
    static async getLegendReplaceValue(name, configPath = null) {
        if (!name) return null;
        const map = await ConfigLoader._loadLegendMap(configPath);
        return Object.prototype.hasOwnProperty.call(map, name) ? map[name] : null;
    }

    /**
     * Instance wrapper for convenience
     */
    async getLegendReplaceValue(name, configPath = null) {
        return await ConfigLoader.getLegendReplaceValue(name, configPath);
    }

    /**
     * Get the Delimiter for a LogType from config.
     * @param {string|null} configPath
     * @param {string|null} logTypeName
     * @returns {Promise<string|null>}
     */
    static async getDelimiterFromConfig(configPath = null, logTypeName = null) {
        const cfgPath = configPath ? path.resolve(configPath) : path.resolve(process.cwd(), 'config.json');

        let raw;
        try {
            raw = await fs.readFile(cfgPath, 'utf-8');
        } catch (err) {
            throw new Error(`Failed to read config file at ${cfgPath}: ${err.message}`);
        }

        let json;
        try {
            json = JSON.parse(raw);
        } catch (err) {
            throw new Error(`Invalid JSON in config file: ${err.message}`);
        }

        const logTypes = json.LogTypes;
        if (!Array.isArray(logTypes) || logTypes.length === 0) return null;

        const logType = logTypeName ? logTypes.find(lt => lt.Name === logTypeName) : logTypes[0];
        if (!logType) return null;

        const delim = logType.Delimiter ?? null;
        return typeof delim === 'string' ? delim : null;
    }

    /**
     * Instance wrapper for convenience
     */
    async getDelimiterFromConfig(configPath = null, logTypeName = null) {
        return await ConfigLoader.getDelimiterFromConfig(configPath, logTypeName);
    }
}

export { ConfigLoader };
