import dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });

import mongoose from 'mongoose';
import { Internship } from '../models/Internship.model.js';
import { Company } from '../models/Company.model.js';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const companies = await Company.find().select('name slug logo verified').lean();
  console.log('COMPANIES IN DB:', companies.length, companies.map(c => c.name));

  const internships = await Internship.find()
    .limit(10)
    .select('title companyName companyId stipend category skills location workMode applicationMethod')
    .lean();

  console.log('SAMPLE INTERNSHIPS:');
  console.log(JSON.stringify(internships, null, 2));

  const total = await Internship.countDocuments();
  console.log('TOTAL INTERNSHIPS:', total);

  // Group by companyName
  const byCompany = await Internship.aggregate([
    { $group: { _id: '$companyName', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 }
  ]);
  console.log('TOP 20 COMPANIES IN INTERNSHIPS:', byCompany);

  await mongoose.disconnect();
}

run().catch(console.error);
