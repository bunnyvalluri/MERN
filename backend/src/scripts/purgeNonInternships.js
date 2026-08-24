import dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });

import mongoose from 'mongoose';
import { Internship } from '../models/Internship.model.js';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas...');

  // Delete all items where:
  // - title contains German job keywords or manager/accounting/sales non-internships
  // - or company is a known German recruiter / scraping spam
  const deleteResult = await Internship.deleteMany({
    $or: [
      { title: /\(m\/w\/d\)|\(m\/f\/d\)|\(gn\)|Werkstudent|Referent|Projektingenieur|Wirtschaftsinformatiker|Pflegekraft|Steuerberater|Vertrieb|Verkauf|Buchhalter|Accounting Manager|Talent Acquisition/i },
      { companyName: /GmbH|AG|eG|GmbH & Co|Pflegekraft|Gottmadingen|BBHT|JetztJob|MONE Consulting|Covergo|Volksbank|ILF Consulting|Trusteq|Taxtalente|Lionflence|Authority\.inc|Optiverus|Init Ag|TechBiz/i },
      { category: { $nin: ['AI & Machine Learning', 'Systems & Low-Level', 'Database Engineering', 'Cloud & DevOps', 'Frontend Engineering', 'Backend Engineering', 'Mobile Engineering', 'Security & Cryptography', 'Quantitative Engineering', 'Software Development', 'UI/UX & Design', 'Data Science & Analytics', 'Product Management'] } }
    ]
  });

  console.log(`Purged ${deleteResult.deletedCount} non-internship and foreign scraper records.`);

  const remaining = await Internship.countDocuments({ status: 'PUBLISHED', isActive: true });
  console.log(`Remaining pristine internships: ${remaining}`);

  await mongoose.disconnect();
}

run().catch(console.error);
