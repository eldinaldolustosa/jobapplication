/**
 * Database setup script — creates collections and ensures indexes.
 * Run once after first deploy: node src/scripts/setupDB.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../models/User');
const JobApplication = require('../models/JobApplication');
const Stage = require('../models/Stage');
const LinkedinCompany = require('../models/LinkedinCompany');
const LinkedinContact = require('../models/LinkedinContact');

const setup = async () => {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });

  const { host, name } = mongoose.connection;
  console.log(`Connected → host: ${host} | db: ${name}\n`);

  const models = [
    { name: 'User', model: User },
    { name: 'JobApplication', model: JobApplication },
    { name: 'Stage', model: Stage },
    { name: 'LinkedinCompany', model: LinkedinCompany },
    { name: 'LinkedinContact', model: LinkedinContact },
  ];

  for (const { name: modelName, model } of models) {
    await model.createIndexes();
    console.log(`✓ ${modelName} — indexes created`);
  }

  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log(`\nCollections in "${name}":`);
  collections.forEach((c) => console.log(`  - ${c.name}`));

  await mongoose.connection.close();
  console.log('\nSetup complete.');
};

setup().catch((err) => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
