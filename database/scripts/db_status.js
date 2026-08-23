import 'dotenv/config';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../backend/.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/internhub';

console.log('=============================================================================');
console.log('                 📊 INTERNHUB DATABASE DIAGNOSTICS & HEALTH                  ');
console.log('=============================================================================\n');

async function checkDatabaseHealth() {
  const pingStart = Date.now();

  try {
    console.log(`Connecting to MongoDB: ${MONGODB_URI.replace(/\/\/.*@/, '//<credentials>@')}...`);
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    const latency = Date.now() - pingStart;

    const db = mongoose.connection.db;
    const adminDb = db.admin();
    const serverStatus = await adminDb.serverStatus().catch(() => ({}));
    const collections = await db.listCollections().toArray();

    console.log('\n🟢 Connection Status: HEALTHY');
    console.log(`⏱️  Ping Latency:     ${latency} ms`);
    console.log(`🗄️  Database Name:    ${db.databaseName}`);
    if (serverStatus.version) {
      console.log(`📦 MongoDB Version:  ${serverStatus.version}`);
      console.log(`⚙️  Storage Engine:   ${serverStatus.storageEngine?.name || 'WiredTiger'}`);
    }

    console.log('\n📋 Collection Statistics:');
    console.log('-----------------------------------------------------------------------------');
    console.log(
      'Collection Name'.padEnd(25) +
      'Documents'.padEnd(15) +
      'Indexes'.padEnd(15)
    );
    console.log('-----------------------------------------------------------------------------');

    let totalDocs = 0;

    for (const col of collections) {
      const collectionInstance = db.collection(col.name);
      const count = await collectionInstance.countDocuments();
      const indexes = await collectionInstance.indexes();
      totalDocs += count;

      console.log(
        col.name.padEnd(25) +
        String(count).padEnd(15) +
        String(indexes.length).padEnd(15)
      );
    }

    console.log('-----------------------------------------------------------------------------');
    console.log(`Total Collections: ${collections.length} | Total Documents: ${totalDocs}`);
    console.log('=============================================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n🔴 Connection Status: UNHEALTHY / FAILED');
    console.error(`Error details: ${error.message}\n`);
    console.log('💡 Tips:');
    console.log('  1. Ensure MongoDB service is running (e.g. `docker-compose up -d mongodb` or local mongod).');
    console.log('  2. Verify MONGODB_URI in `backend/.env` or root `.env`.');
    console.log('=============================================================================\n');
    process.exit(1);
  }
}

checkDatabaseHealth();
