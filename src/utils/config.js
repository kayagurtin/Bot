const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../data/config.json');

function loadConfig() {
  try {
    const data = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

function saveConfig(cfg) {
  fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2));
}

function getGuildConfig(guildId) {
  const cfg = loadConfig();
  return cfg[guildId] || {};
}

function setGuildConfig(guildId, updates) {
  const cfg = loadConfig();
  cfg[guildId] = { ...(cfg[guildId] || {}), ...updates };
  saveConfig(cfg);
}

module.exports = { loadConfig, saveConfig, getGuildConfig, setGuildConfig};