const fs = require('fs');
const path = require('path');

const econPath = path.join(__dirname, '../data/economy.json');

function loadEconomy() {
  try {
    const raw = fs.readFileSync(econPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    // file doesnt exist or bad json
    return {};
  }
}

// return array of { userId, balance } for a guild sorted desc
function getGuildBalances(guildId) {
  const data = loadEconomy();
  if (!data[guildId]) return [];
  return Object.entries(data[guildId])
    .map(([userId, obj]) => ({ userId, balance: obj.balance || 0 }))
    .sort((a,b) => b.balance - a.balance);
}

function getBankBalance(guildId, userId) {
  const data = loadEconomy();
  if (data[guildId] && data[guildId][userId]) {
    return data[guildId][userId].bank || 0;
  }
  return 0;
}

function addBankBalance(guildId, userId, amount) {
  const data = loadEconomy();
  if (!data[guildId]) data[guildId] = {};
  if (!data[guildId][userId]) data[guildId][userId] = { balance: 0, lastDaily: 0, bank: 0 };
  data[guildId][userId].bank = (data[guildId][userId].bank || 0) + amount;
  saveEconomy(data);
  return data[guildId][userId].bank;
}

function setBankBalance(guildId, userId, amount) {
  const data = loadEconomy();
  if (!data[guildId]) data[guildId] = {};
  if (!data[guildId][userId]) data[guildId][userId] = { balance: 0, lastDaily: 0, bank: 0 };
  data[guildId][userId].bank = amount;
  saveEconomy(data);
  return amount;
}

function saveEconomy(data) {
  try {
    fs.writeFileSync(econPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Failed to save economy data:', err);
  }
}

function ensureUser(guildId, userId) {
  const data = loadEconomy();
  if (!data[guildId]) data[guildId] = {};
  if (!data[guildId][userId]) {
    data[guildId][userId] = { balance: 0, lastDaily: 0 };
    saveEconomy(data);
  }
  return data[guildId][userId];
}

function getBalance(guildId, userId) {
  const data = loadEconomy();
  if (data[guildId] && data[guildId][userId]) {
    return data[guildId][userId].balance || 0;
  }
  return 0;
}

function addBalance(guildId, userId, amount) {
  const data = loadEconomy();
  if (!data[guildId]) data[guildId] = {};
  if (!data[guildId][userId]) data[guildId][userId] = { balance: 0, lastDaily: 0 };
  data[guildId][userId].balance = (data[guildId][userId].balance || 0) + amount;
  saveEconomy(data);
  return data[guildId][userId].balance;
}

function setBalance(guildId, userId, amount) {
  const data = loadEconomy();
  if (!data[guildId]) data[guildId] = {};
  if (!data[guildId][userId]) data[guildId][userId] = { balance: 0, lastDaily: 0 };
  data[guildId][userId].balance = amount;
  saveEconomy(data);
  return amount;
}

function getLastDaily(guildId, userId) {
  const data = loadEconomy();
  if (data[guildId] && data[guildId][userId]) {
    return data[guildId][userId].lastDaily || 0;
  }
  return 0;
}

function setLastDaily(guildId, userId, timestamp) {
  setUserProp(guildId, userId, 'lastDaily', timestamp);
}

function getUserProp(guildId, userId, prop) {
  const data = loadEconomy();
  if (data[guildId] && data[guildId][userId]) {
    return data[guildId][userId][prop];
  }
  return undefined;
}

function setUserProp(guildId, userId, prop, value) {
  const data = loadEconomy();
  if (!data[guildId]) data[guildId] = {};
  if (!data[guildId][userId]) data[guildId][userId] = { balance: 0, lastDaily: 0 };
  data[guildId][userId][prop] = value;
  saveEconomy(data);
  return value;
}

function removeBalance(guildId, userId, amount) {
  // convenience wrapper
  return addBalance(guildId, userId, -Math.abs(amount));
}

module.exports = {
  ensureUser,
  getBalance,
  addBalance,
  removeBalance,
  setBalance,
  getLastDaily,
  setLastDaily,
  getUserProp,
  setUserProp,
  loadEconomy,
  getGuildBalances,
  getBankBalance,
  addBankBalance,
  setBankBalance,
};
