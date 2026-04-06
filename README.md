![npm vulnerability scan](https://github.com/sabrinahaniff/npm-scanner/actions/workflows/scan.yml/badge.svg)

# Npm Scanner

A CLI tool that scans your `package.json` for known vulnerabilities using the [OSV database](https://osv.dev) - no API key required.

## Installation

```bash
git clone https://github.com/YOUR_USERNAME/npm-scanner.git
cd npm-scanner
npm install
npm install -g .
```

## Usage

### Scan a project
```bash
npm-scanner scan ./package.json
```

### Only show high and critical vulnerabilities
```bash
npm-scanner scan ./package.json --severity high
```

### Auto-fix vulnerable packages
```bash
npm-scanner scan ./package.json --fix
```

### Output as JSON
```bash
npm-scanner scan ./package.json --json
```

## Example output

```
Scanning: ./package.json
Found 5 packages. Checking OSV database...

lodash@4.17.15
  GHSA-29mw-wpgm-hmr9  HIGH
  Prototype Pollution in lodash
  https://osv.dev/vulnerability/GHSA-29mw-wpgm-hmr9

──────────────────────────────────────────────────
Summary: 3 HIGH · 14 LOW
```

## Limitations

- Scans `dependencies` and `devDependencies` only - does not yet scan `package-lock.json` for transitive dependencies
- Severity data is not always available for every CVE in the OSV database
- `--fix` rewrites `package.json` but does not run `npm install` automatically
- Does not support monorepos with multiple `package.json` files yet

## Data source

All vulnerability data comes from [osv.dev](https://osv.dev), Google's open source vulnerability database.
