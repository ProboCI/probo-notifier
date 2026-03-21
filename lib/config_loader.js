'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Deep merges source into target. Arrays are replaced, not concatenated.
 */
function deepMerge(target, source) {
  for (let key in source) {
    if (source.hasOwnProperty(key)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key] || typeof target[key] !== 'object') {
          target[key] = {};
        }
        deepMerge(target[key], source[key]);
      }
      else {
        target[key] = source[key];
      }
    }
  }
  return target;
}

/**
 * Loads and merges YAML config files in order. Files that don't exist are
 * silently skipped. If a path is a directory, all .yaml/.yml files in it
 * are loaded.
 *
 * @param {string[]} configPaths - Ordered list of file/directory paths.
 * @return {Object} The merged configuration object.
 */
function loadConfig(configPaths) {
  let config = {};

  for (let configPath of configPaths) {
    try {
      const stat = fs.statSync(configPath);

      if (stat.isDirectory()) {
        const files = fs.readdirSync(configPath)
          .filter(f => f.endsWith('.yaml') || f.endsWith('.yml'))
          .sort();
        for (let file of files) {
          const content = fs.readFileSync(path.join(configPath, file), 'utf8');
          const parsed = yaml.safeLoad(content);
          if (parsed) {
            deepMerge(config, parsed);
          }
        }
      }
      else {
        const content = fs.readFileSync(configPath, 'utf8');
        const parsed = yaml.safeLoad(content);
        if (parsed) {
          deepMerge(config, parsed);
        }
      }
    }
    catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
  }

  return config;
}

module.exports = loadConfig;
