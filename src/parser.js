const fs = require('fs');
const path = require('path');

function parsePackageJson(filePath) {
  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

  const raw = fs.readFileSync(absolutePath, 'utf-8');
  const pkg = JSON.parse(raw);

  const deps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  if (Object.keys(deps).length === 0) {
    console.log('No dependencies found.');
    return [];
  }

  const packages = Object.entries(deps).map(([name, version]) => ({
    name,
    version: version.replace(/[\^~>=<]/g, '').trim(),
  }));

  return packages;
}

module.exports = { parsePackageJson };