const fs = require('fs');
const axios = require('axios');
const chalk = require('chalk');

async function getFixedVersion(pkgName, vulnId) {
  try {
    const res = await axios.get(`https://api.osv.dev/v1/vulns/${vulnId}`);
    const vuln = res.data;

    for (const affected of vuln.affected || []) {
      if (affected.package?.name?.toLowerCase() !== pkgName.toLowerCase()) continue;

      for (const range of affected.ranges || []) {
        for (const event of range.events || []) {
          if (event.fixed) return event.fixed;
        }
      }
    }
  } catch {
    return null;
  }
  return null;
}

async function applyFixes(findings, filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const pkg = JSON.parse(raw);

  const fixes = {};

  for (const finding of findings) {
    if (fixes[finding.package]) continue; // already resolved this package
    const fixed = await getFixedVersion(finding.package, finding.id);
    if (fixed) fixes[finding.package] = fixed;
  }

  if (Object.keys(fixes).length === 0) {
    console.log(chalk.yellow('\nNo automatic fixes available for these vulnerabilities.\n'));
    return;
  }

  console.log(chalk.bold('\nApplying fixes:'));

  for (const [name, version] of Object.entries(fixes)) {
    if (pkg.dependencies?.[name]) {
      console.log(`  ${name}: ${chalk.red(pkg.dependencies[name])} → ${chalk.green('^' + version)}`);
      pkg.dependencies[name] = '^' + version;
    } else if (pkg.devDependencies?.[name]) {
      console.log(`  ${name}: ${chalk.red(pkg.devDependencies[name])} → ${chalk.green('^' + version)}`);
      pkg.devDependencies[name] = '^' + version;
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(pkg, null, 2));
  console.log(chalk.green('\npackage.json updated. Run npm install to apply.\n'));
}

module.exports = { applyFixes };