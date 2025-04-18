# npm-watchdog 🐕

A cross-platform command-line tool to detect unused dependencies in JavaScript/TypeScript projects with a modern and stylish UI.

## Description

npm-watchdog analyzes your project's source files (.js, .jsx, .ts, .tsx) and detects which packages listed in your package.json are not being used in the source code. It's like having a watchdog guarding your forgotten dependencies.

![npm-watchdog screenshot](https://i.imgur.com/JHbNaPc.png)

## Cross-Platform Compatibility

npm-watchdog works on all major platforms:

- Windows
- macOS
- Linux

The tool is designed to handle path differences, file system operations, and other platform-specific issues automatically.

## Modern UI Features

- Beautiful ASCII art header
- Colorful gradients and styled text
- Progress spinners while analyzing
- Boxed sections for better readability
- Tabular data presentation
- Cross-platform compatibility tweaks for terminals

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

# Use minimal UI mode (no ASCII art, useful for CI/CD environments)
npm-watchdog --minimal
```

## Multilanguage Support

npm-watchdog supports multiple languages:

- English (default): `--lang en`
- Spanish: `--lang es`

Example:

```bash
npm-watchdog --lang es
```

## UI Modes

### Full UI (default)

Beautiful ASCII art and styled output with animations and colors.

### Minimal UI

```bash
npm-watchdog --minimal
```

Simplified output without the large ASCII art header. Useful for CI/CD environments or smaller terminals.

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

## Requirements

- Node.js 12 or higher

## Limitations

- Does not detect dynamic imports (`require(variable)`)
- Does not analyze files with custom extensions
- Does not detect imports in comments or disabled code

## License

MIT
