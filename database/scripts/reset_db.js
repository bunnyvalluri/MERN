import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=============================================================================');
console.log('                 🔄 INTERNHUB DATABASE FULL RESET UTILITY                    ');
console.log('=============================================================================\n');

function runScript(scriptPath, stepName) {
  return new Promise((resolve, reject) => {
    console.log(`▶️  Executing: ${stepName}...`);
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '../../'),
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${stepName} failed with exit code ${code}`));
      }
    });
  });
}

async function main() {
  try {
    const seedScript = path.resolve(__dirname, '../seeds/seed.js');
    const indexScript = path.resolve(__dirname, '../indexes/ensure_indexes.js');

    await runScript(seedScript, 'Database Seeder');
    await runScript(indexScript, 'Index Synchronization');

    console.log('🎉 Database reset & re-indexing completed successfully!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Reset failed:', err.message);
    process.exit(1);
  }
}

main();
