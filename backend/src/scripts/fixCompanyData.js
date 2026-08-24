import dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });

import mongoose from 'mongoose';
import { Internship } from '../models/Internship.model.js';
import { Company } from '../models/Company.model.js';

async function run() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected!');

  const companies = await Company.find().lean();
  console.log(`Found ${companies.length} companies.`);

  const companyMap = new Map(companies.map(c => [c._id.toString(), c]));

  const internships = await Internship.find();
  console.log(`Found ${internships.length} internships.`);

  let updated = 0;
  for (const item of internships) {
    if (item.companyId && companyMap.has(item.companyId.toString())) {
      const comp = companyMap.get(item.companyId.toString());
      item.companyName = comp.name;
      item.companyLogo = comp.logo || `https://www.google.com/s2/favicons?domain=${comp.slug || 'google'}.com&sz=128`;
      item.companyWebsite = comp.website || `https://${comp.slug}.com`;
      await item.save();
      updated++;
    }
  }

  console.log(`Successfully updated ${updated} internships with real company names and logos!`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
