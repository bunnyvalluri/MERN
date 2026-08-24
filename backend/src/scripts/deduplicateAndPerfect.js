import dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });

import mongoose from 'mongoose';
import { Internship } from '../models/Internship.model.js';
import { Company } from '../models/Company.model.js';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas...');

  // 1. Delete anything from German/scraping companies or non-tech jobs
  await Internship.deleteMany({
    $or: [
      { companyName: /GmbH|AG|eG|ZeinPharma|JetztJob|visionm|BBHT|MONE|Covergo|Pflegekraft/i },
      { title: /\(m\/w\/d\)|\(m\/f\/d\)|\(gn\)|Manager|Accounting|Pflege|Steuer/i },
      { 'location.country': 'India', city: { $in: ['Bielefeld', 'Friesenheim', 'Munich', 'Eschborn', 'Flensburg', 'Gottmadingen', 'Fürstenfeldbruck'] } }
    ]
  });

  // 2. Deduplicate by title + companyName
  const all = await Internship.find().sort({ createdAt: -1 });
  const seen = new Set();
  let deletedDups = 0;

  for (const item of all) {
    const key = `${(item.title || '').trim().toLowerCase()}:::${(item.companyName || '').trim().toLowerCase()}`;
    if (seen.has(key)) {
      await Internship.deleteOne({ _id: item._id });
      deletedDups++;
    } else {
      seen.add(key);
    }
  }

  console.log(`Removed ${deletedDups} duplicate internships.`);

  const remaining = await Internship.countDocuments();
  console.log(`Final curated high-quality internships in database: ${remaining}`);

  await mongoose.disconnect();
}

run().catch(console.error);
