'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

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
          config = merge(config, fileConfig);
        }
      }
    }
    else {
      const fileConfig = loadYamlFile(configPath);
      if (fileConfig) {
        config = merge(config, fileConfig);
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

function merge(target, source) {
  for (const key in source) {
    if (source.hasOwnProperty(key) && source[key] !== undefined) {
      target[key] = source[key];
    }
  }
  return target;
}

module.exports = {loadConfig};
