import dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });

import mongoose from 'mongoose';
import { Internship } from '../models/Internship.model.js';
import { Company } from '../models/Company.model.js';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas...');

  const companies = await Company.find().lean();
  const companyMap = new Map(companies.map(c => [c._id.toString(), c]));
  const companySlugMap = new Map(companies.map(c => [c.slug.toLowerCase(), c]));

  const all = await Internship.find().sort({ createdAt: -1 });
  const seenTitles = new Set();
  let deletedDups = 0;

  for (const item of all) {
    // Determine real company
    let comp = null;
    if (item.companyId && companyMap.has(item.companyId.toString())) {
      comp = companyMap.get(item.companyId.toString());
    } else if (item.companyName && companySlugMap.has(item.companyName.toLowerCase())) {
      comp = companySlugMap.get(item.companyName.toLowerCase());
    }

    if (comp) {
      item.companyId = comp._id;
      item.companyName = comp.name;
      item.companyLogo = comp.logo;
      item.companyWebsite = comp.website;
    }

    // Deduplicate by clean title
    const normalizedTitle = (item.title || '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

    const titleKey = `${normalizedTitle}:::${(item.companyName || '').trim().toLowerCase()}`;

    if (seenTitles.has(titleKey) || seenTitles.has(normalizedTitle)) {
      await Internship.deleteOne({ _id: item._id });
      deletedDups++;
    } else {
      seenTitles.add(titleKey);
      seenTitles.add(normalizedTitle);
      await item.save();
    }
  }

  console.log(`Removed ${deletedDups} duplicate internships by title.`);

  const remaining = await Internship.find().select('title companyName').lean();
  console.log(`Remaining pristine internships (${remaining.length}):`);
  remaining.forEach((r, i) => console.log(`${i + 1}. [${r.companyName}] ${r.title}`));

  await mongoose.disconnect();
}

run().catch(console.error);
