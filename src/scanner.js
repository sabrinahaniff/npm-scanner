const axios = require('axios');

const OSV_API = 'https://api.osv.dev/v1/querybatch';
const OSV_VULN_API = 'https://api.osv.dev/v1/vulns';

async function getVulnDetail(id) {
  try {
    const res = await axios.get(`${OSV_VULN_API}/${id}`);
    const v = res.data;

    let severity = 'UNKNOWN';
    if (v.severity?.length > 0) {
      severity = v.severity[0].score || v.severity[0].type || 'UNKNOWN';
    } else if (v.database_specific?.severity) {
      severity = v.database_specific.severity;
    } else if (v.affected) {
      for (const a of v.affected) {
        if (a.ecosystem_specific?.severity) { severity = a.ecosystem_specific.severity; break; }
        if (a.database_specific?.cvss_v3?.base_severity) { severity = a.database_specific.cvss_v3.base_severity; break; }
      }
    }

    return {
      summary: v.summary || v.details?.split('\n')[0] || 'No summary available',
      severity: severity.toUpperCase(),
    };
  } catch {
    return { summary: 'No summary available', severity: 'UNKNOWN' };
  }
}

async function scanPackages(packages) {
  const queries = packages.map(pkg => ({
    package: { name: pkg.name, ecosystem: 'npm' },
    version: pkg.version,
  }));

  const response = await axios.post(OSV_API, { queries });
  const results = response.data.results;

  const findings = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const pkg = packages[i];

    if (result.vulns && result.vulns.length > 0) {
      for (const vuln of result.vulns) {
        const detail = await getVulnDetail(vuln.id);
        findings.push({
          package: pkg.name,
          version: pkg.version,
          id: vuln.id,
          summary: detail.summary,
          severity: detail.severity,
          link: `https://osv.dev/vulnerability/${vuln.id}`,
        });
      }
    }
  }

  return findings;
}

module.exports = { scanPackages };