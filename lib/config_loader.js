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
 * are loaded and merged alphabetically.
 *
 * @param {string[]} paths - Ordered list of file/directory paths.
 * @returns {Object} The merged configuration object.
 */
function loadConfig(paths) {
  let config = {};

  for (const configPath of paths) {
    let stat;
    try {
      stat = fs.statSync(configPath);
    }
    catch (err) {
      // Path doesn't exist, skip it.
      continue;
    }

    if (stat.isDirectory()) {
      const files = fs.readdirSync(configPath)
        .filter(f => /\.ya?ml$/.test(path.extname(f)))
        .sort();
      for (const file of files) {
        const fileConfig = loadYamlFile(path.join(configPath, file));
        if (fileConfig) {
          deepMerge(config, fileConfig);
        }
      }
    }
    else {
      const fileConfig = loadYamlFile(configPath);
      if (fileConfig) {
        deepMerge(config, fileConfig);
      }
    }
  }

  return config;
}

function loadYamlFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return yaml.load(content) || {};
  }
  catch (err) {
    return null;
  }
}

module.exports = {loadConfig};
