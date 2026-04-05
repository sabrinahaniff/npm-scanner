const axios = require('axios');

const OSV_API = 'https://api.osv.dev/v1/querybatch';

async function scanPackages(packages) {
  const queries = packages.map(pkg => ({
    package: {
      name: pkg.name,
      ecosystem: 'npm',
    },
    version: pkg.version,
  }));

  const response = await axios.post(OSV_API, { queries });
  const results = response.data.results;

  const findings = [];

  results.forEach((result, i) => {
    const pkg = packages[i];
    if (result.vulns && result.vulns.length > 0) {
      result.vulns.forEach(vuln => {
        findings.push({
          package: pkg.name,
          version: pkg.version,
          id: vuln.id,
          summary: vuln.summary || 'No summary available',
          severity: vuln.database_specific?.severity || 'UNKNOWN',
        });
      });
    }
  });

  return findings;
}

module.exports = { scanPackages };