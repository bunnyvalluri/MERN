import 'dotenv/config';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../backend/.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { connectDB, closeDB } from '../../backend/src/config/db.js';

import {
  User,
  StudentProfile,
  Company,
  Internship,
  Application,
  Interview,
  Notification,
  AuditLog,
  SavedInternship,
  Document,
} from '../../backend/src/models/index.js';

console.log('=============================================================================');
console.log('                 ⚡ INTERNHUB MONGODB INDEX MANAGER                         ');
console.log('=============================================================================\n');

async function ensureIndexes() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await connectDB();
    console.log('Connected to MongoDB.\n');

    const models = [
      { name: 'User', model: User },
      { name: 'StudentProfile', model: StudentProfile },
      { name: 'Company', model: Company },
      { name: 'Internship', model: Internship },
      { name: 'Application', model: Application },
      { name: 'Interview', model: Interview },
      { name: 'Notification', model: Notification },
      { name: 'AuditLog', model: AuditLog },
      { name: 'SavedInternship', model: SavedInternship },
      { name: 'Document', model: Document },
    ];

    console.log('Building & auditing schema indexes...\n');

    for (const { name, model } of models) {
      process.stdout.write(`  ⏳ Synchronizing indexes for [${name}]... `);
      await model.syncIndexes();
      const indexes = await model.collection.indexes();
      console.log(`✅ ${indexes.length} indexes active.`);
      for (const idx of indexes) {
        console.log(`     • ${idx.name}: ${JSON.stringify(idx.key)}`);
      }
      console.log('');
    }

    console.log('=============================================================================');
    console.log('                 ✨ ALL DATABASE INDEXES SYNCHRONIZED                        ');
    console.log('=============================================================================\n');
    await closeDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Index Synchronization Error:', error);
    process.exit(1);
  }
}

ensureIndexes();
