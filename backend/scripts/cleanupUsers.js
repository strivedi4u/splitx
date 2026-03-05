// Utility script to clean up orphaned user records by email
// Usage: node scripts/cleanupUsers.js <email-to-remove>

const db = require('../src/config/db');

const emailToRemove = process.argv[2];
if (!emailToRemove) {
  console.error('Usage: node cleanupUsers.js <email-to-remove>');
  process.exit(1);
}

const users = db.getAll('users');
const filtered = users.filter(u => u.email.toLowerCase().trim() !== emailToRemove.toLowerCase().trim());
const removedUserIds = users
  .filter(u => u.email.toLowerCase().trim() === emailToRemove.toLowerCase().trim())
  .map(u => u.id);
if (filtered.length === users.length) {
  console.log('No user found with that email.');
  process.exit(0);
}
db.writeDB('users', filtered);
console.log('User(s) with email', emailToRemove, 'removed.');

// Remove deleted user IDs from all groups
const groups = db.getAll('groups');
let groupChanged = false;
groups.forEach(g => {
  const origLen = g.members.length;
  g.members = g.members.filter(m => !removedUserIds.includes(m));
  if (g.members.length !== origLen) groupChanged = true;
});
if (groupChanged) {
  db.writeDB('groups', groups);
  console.log('Removed user(s) from group memberships.');
}

// Optionally, remove groups with 0 members
db.writeDB('groups', groups.filter(g => g.members.length > 0));
console.log('Deleted groups with 0 members.');
