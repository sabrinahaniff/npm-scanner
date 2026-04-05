const chalk = require('chalk');

function printReport(findings, packages) {
  console.log('\n' + chalk.bold('npm scanner results'));
  console.log('─'.repeat(50));

  if (findings.length === 0) {
    console.log(chalk.green(`\nAll ${packages.length} packages scanned - no vulnerabilities found.\n`));
    return;
  }

  console.log(chalk.red(`\nFound ${findings.length} vulnerabilit${findings.length === 1 ? 'y' : 'ies'} across ${packages.length} packages:\n`));

  findings.forEach(f => {
    const severityColor =
      f.severity === 'CRITICAL' ? chalk.bgRed.white :
      f.severity === 'HIGH'     ? chalk.red :
      f.severity === 'MODERATE' ? chalk.yellow :
                                  chalk.gray;

    console.log(chalk.bold(f.package) + chalk.dim(`@${f.version}`));
    console.log(`  ${chalk.cyan(f.id)}  ${severityColor(f.severity)}`);
    console.log(`  ${f.summary}`);
    console.log();
  });
}

module.exports = { printReport };