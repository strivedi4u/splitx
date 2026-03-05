const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(process.env.DATA_DIR || './data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const filePath = (name) => path.join(DATA_DIR, `${name}.json`);

function readDB(name) {
  const fp = filePath(name);
  if (!fs.existsSync(fp)) {
    fs.writeFileSync(fp, JSON.stringify([]));
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(fp, 'utf8'));
  } catch {
    return [];
  }
}

function writeDB(name, data) {
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2));
}

// ── Generic CRUD helpers ─────────────────────────────────

function getAll(collection) {
  return readDB(collection);
}

function getById(collection, id) {
  return readDB(collection).find(item => item.id === id) || null;
}

function findOne(collection, predicate) {
  return readDB(collection).find(predicate) || null;
}

function findMany(collection, predicate) {
  return readDB(collection).filter(predicate);
}

function insert(collection, item) {
  const data = readDB(collection);
  data.push(item);
  writeDB(collection, data);
  return item;
}

function updateById(collection, id, updates) {
  const data = readDB(collection);
  const idx = data.findIndex(i => i.id === id);
  if (idx === -1) return null;
  data[idx] = { ...data[idx], ...updates, updatedAt: new Date().toISOString() };
  writeDB(collection, data);
  return data[idx];
}

function deleteById(collection, id) {
  const data = readDB(collection);
  const idx = data.findIndex(i => i.id === id);
  if (idx === -1) return false;
  data.splice(idx, 1);
  writeDB(collection, data);
  return true;
}

module.exports = { getAll, getById, findOne, findMany, insert, updateById, deleteById };
