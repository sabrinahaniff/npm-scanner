#!/usr/bin/env node

const { program } = require('commander');
const { parsePackageJson } = require('./parser');
const { scanPackages } = require('./scanner');
const { printReport } = require('./reporter');
const { applyFixes } = require('./fixer');

program
  .name('npm-scanner')
  .description('Scan a package.json for known vulnerabilities')
  .version('1.0.0');

program
  .command('scan <file>')
  .description('Scan a package.json file')
  .option('--severity <level>', 'Only show vulnerabilities at or above this level (low, medium, high, critical)')
  .option('--json', 'Output results as JSON')
  .option('--fix', 'Auto-update vulnerable packages to their fixed versions')
  .action(async (file, options) => {
    console.log(`\nScanning: ${file}`);

    try {
      const packages = parsePackageJson(file);
      console.log(`Found ${packages.length} packages. Checking OSV database...\n`);

      let findings = await scanPackages(packages);

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

      if (options.json) {
        console.log(JSON.stringify(findings, null, 2));
        return;
      }

      printReport(findings, packages);

      if (options.fix && findings.length > 0) {
        await applyFixes(findings, file);
      }

    } catch (err) {
      console.error('Error:', err.message);
      process.exit(1);
    }
  });

program.parse();