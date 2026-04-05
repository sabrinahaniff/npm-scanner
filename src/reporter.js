const chalk = require('chalk');

function printReport(findings, packages) {
  console.log('\n' + chalk.bold('npm scanner results'));
  console.log('─'.repeat(50));

  if (findings.length === 0) {
    console.log(chalk.green(`\nAll ${packages.length} packages scanned — no vulnerabilities found.\n`));
    return;
  }

  console.log(chalk.red(`\nFound ${findings.length} vulnerabilit${findings.length === 1 ? 'y' : 'ies'} across ${packages.length} packages:\n`));

  findings.forEach(f => {
    // Normalize CVSS score strings into a readable label
    const label = normalizeSeverity(f.severity);

    const severityColor =
      label === 'CRITICAL' ? chalk.bgRed.white :
      label === 'HIGH'     ? chalk.red :
      label === 'MEDIUM' || label === 'MODERATE' ? chalk.yellow :
      label === 'LOW'      ? chalk.blue :
                             chalk.gray;

    console.log(chalk.bold(f.package) + chalk.dim(`@${f.version}`));
    console.log(`  ${chalk.cyan(f.id)}  ${severityColor(label)}`);
    console.log(`  ${f.summary}`);
    console.log(`  ${chalk.dim(f.link)}`);
    console.log();
  });

  // Summary counts by normalized label
  const bySeverity = findings.reduce((acc, f) => {
    const label = normalizeSeverity(f.severity);
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  const order = ['CRITICAL', 'HIGH', 'MEDIUM', 'MODERATE', 'LOW', 'UNKNOWN'];
  console.log('─'.repeat(50));
  const summaryLine = order
    .filter(s => bySeverity[s])
    .map(s => `${bySeverity[s]} ${s}`)
    .join(' · ');
  console.log('Summary: ' + (summaryLine || 'none'));
  console.log();
}

// CVSS strings like "CVSS:3.1/AV:N/..." contain a base score we can bucket
function normalizeSeverity(raw) {
  if (!raw || raw === 'UNKNOWN') return 'UNKNOWN';

  const upper = raw.toUpperCase();

  // Already a label
  if (['CRITICAL', 'HIGH', 'MEDIUM', 'MODERATE', 'LOW'].includes(upper)) return upper;

  // Extract numeric score from CVSS vector string
  const scoreMatch = raw.match(/\/(\d+\.\d+)$/) || raw.match(/(\d+\.\d+)/);
  if (scoreMatch) {
    const score = parseFloat(scoreMatch[1]);
    if (score >= 9.0) return 'CRITICAL';
    if (score >= 7.0) return 'HIGH';
    if (score >= 4.0) return 'MEDIUM';
    if (score >= 0.1) return 'LOW';
  }

  // CVSS vector string without score — parse AV/AC/PR to estimate
  if (upper.includes('CVSS')) return 'HIGH'; // conservative default for unparsed vectors

  return 'UNKNOWN';
}

module.exports = { printReport };