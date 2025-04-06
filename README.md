# npm-watchdog 🐕

A command-line tool to detect unused dependencies in JavaScript/TypeScript projects.

## Description

npm-watchdog analyzes your project's source files (.js, .jsx, .ts, .tsx) and detects which packages listed in your package.json are not being used in the source code. It's like having a watchdog guarding your forgotten dependencies.

## Installation

### Global installation (recommended)

```bash
npm install -g npm-watchdog
```

### Local installation

```bash
npm install --save-dev npm-watchdog
```

## Usage

### Basic usage

```bash
# If installed globally
npm-watchdog

# If installed locally
npx npm-watchdog
```

### Options

```bash
# Show help
npm-watchdog --help

# Export results in JSON format
npm-watchdog --json

# Ignore certain modules in the analysis
npm-watchdog --ignore axios,lodash

# Specify a different base path (useful for monorepo projects)
npm-watchdog --root ./packages/my-package

# Change language (English is default, Spanish is also available)
npm-watchdog --lang es
```

## Multilanguage Support

npm-watchdog supports multiple languages:

- English (default): `--lang en`
- Spanish: `--lang es`

Example:

```bash
npm-watchdog --lang es
```

## How it works

npm-watchdog:

1. Reads your package.json and extracts all dependencies (dependencies and devDependencies)
2. Recursively looks for all .js, .jsx, .ts, .tsx files in your project
3. Analyzes each file looking for:
   - `require('module')`
   - `import xyz from 'module'`
   - `import * as xyz from 'module'`
   - `import 'module'`
4. Compares the dependencies found with those listed in package.json
5. Reports packages that are not being used in any file

## Limitations

- Does not detect dynamic imports (`require(variable)`)
- Does not analyze files with custom extensions
- Does not detect imports in comments or disabled code

## License

MIT
