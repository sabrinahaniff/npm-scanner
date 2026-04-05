const { parsePackageJson } = require('./parser');
const { scanPackages } = require('./scanner');
const { printReport } = require('./reporter');

async function main() {
  const filePath = process.argv[2] || './package.json';

  console.log(`\nScanning: ${filePath}`);

  try {
    const packages = parsePackageJson(filePath);
    console.log(`Found ${packages.length} packages. Checking OSV database...`);

    const findings = await scanPackages(packages);
    printReport(findings, packages);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();