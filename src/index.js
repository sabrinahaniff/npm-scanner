#!/usr/bin/env node
const { program } = require('commander');
const { parsePackageJson } = require('./parser');
const { scanPackages } = require('./scanner');
const { printReport } = require('./reporter');

program
  .name('npm-scanner')
  .description('Scan a package.json for known vulnerabilities')
  .version('1.0.0');

program
  .command('scan <file>')
  .description('Scan a package.json file')
  .option('--severity <level>', 'Only show vulnerabilities at or above this level (low, medium, high, critical)')
  .option('--json', 'Output results as JSON')
  .action(async (file, options) => {
    console.log(`\nScanning: ${file}`);

    try {
      const packages = parsePackageJson(file);
      console.log(`Found ${packages.length} packages. Checking OSV database...\n`);

      let findings = await scanPackages(packages);

      // Filter by severity if flag is passed
      if (options.severity) {
        const order = ['low', 'medium', 'moderate', 'high', 'critical'];
        const minIndex = order.indexOf(options.severity.toLowerCase());
        if (minIndex === -1) {
          console.error(`Invalid severity: ${options.severity}. Use: low, medium, high, critical`);
          process.exit(1);
        }
        findings = findings.filter(f => {
          const fIndex = order.indexOf(f.severity.toLowerCase());
          return fIndex >= minIndex;
        });
      }

      // JSON output mode
      if (options.json) {
        console.log(JSON.stringify(findings, null, 2));
        return;
      }

      printReport(findings, packages);

    } catch (err) {
      console.error('Error:', err.message);
      process.exit(1);
    }
  });

program.parse();