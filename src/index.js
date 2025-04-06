#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { program } = require("commander");
const chalk = require("chalk");
const { globSync } = require("glob");

// Traducciones
const translations = {
  en: {
    funnyMessages: [
      "Woof woof! I've sniffed out some forgotten dependencies...",
      "Bark! Looks like you have some dependencies gathering dust...",
      "The watchdog has found dependencies that are taking a nap...",
      "These packages are as used as an umbrella in the desert...",
      "Dependencies found hibernating in your package.json...",
    ],
    description:
      "A tool to detect unused dependencies in JavaScript/TypeScript projects",
    jsonOption: "Export results in JSON format",
    ignoreOption: "Modules to ignore (comma separated)",
    rootOption: "Base path for monorepo projects",
    langOption: "Language (en, es)",
    errorDir: "Error: Directory %s does not exist",
    errorPackageJson: "Error: package.json not found in %s",
    noDependencies: "No dependencies found in package.json",
    noSourceFiles: "No source files found to analyze",
    totalDependencies: "Total dependencies: %s",
    usedDependencies: "Used dependencies: %s",
    unusedDependencies: "Unused dependencies: %s",
    ignoredModules: "Ignored modules: %s",
    unusedDepsLabel: "Unused dependencies:",
    suggestion: "Suggestion: Consider removing these dependencies with:",
    goodJob: "Good job! No unused dependencies found.",
    error: "Error:",
  },
  es: {
    funnyMessages: [
      "¡Woof woof! He olfateado algunas dependencias olvidadas...",
      "¡Guau! Parece que tienes algunas dependencias acumulando polvo...",
      "El watchdog ha encontrado dependencias que están durmiendo la siesta...",
      "Estos paquetes están tan utilizados como un paraguas en el desierto...",
      "Dependencias encontradas hibernando en tu package.json...",
    ],
    description:
      "Una herramienta para detectar dependencias no utilizadas en proyectos JavaScript/TypeScript",
    jsonOption: "Exportar resultados en formato JSON",
    ignoreOption: "Módulos a ignorar (separados por comas)",
    rootOption: "Ruta base para proyectos monorepo",
    langOption: "Idioma (en, es)",
    errorDir: "Error: El directorio %s no existe",
    errorPackageJson: "Error: No se encontró package.json en %s",
    noDependencies: "No se encontraron dependencias en el package.json",
    noSourceFiles: "No se encontraron archivos fuente para analizar",
    totalDependencies: "Total de dependencias: %s",
    usedDependencies: "Dependencias utilizadas: %s",
    unusedDependencies: "Dependencias no utilizadas: %s",
    ignoredModules: "Módulos ignorados: %s",
    unusedDepsLabel: "Dependencias no utilizadas:",
    suggestion: "Sugerencia: Considera eliminar estas dependencias con:",
    goodJob: "¡Buen trabajo! No se encontraron dependencias no utilizadas.",
    error: "Error:",
  },
};

// Versión y descripción
program
  .version("1.0.0")
  .description(
    "A tool to detect unused dependencies in JavaScript/TypeScript projects"
  );

// Opciones
program
  .option("-j, --json", "Export results in JSON format")
  .option(
    "-i, --ignore <modules>",
    "Modules to ignore (comma separated)",
    (val) => val.split(",")
  )
  .option("-r, --root <path>", "Base path for monorepo projects", ".")
  .option("-l, --lang <language>", "Language (en, es)", "en");

program.parse(process.argv);
const options = program.opts();

// Seleccionar el idioma
const lang = options.lang && translations[options.lang] ? options.lang : "en";
const t = translations[lang];

// Actualizar la descripción del programa según el idioma
program.description(t.description);

// Normalizar patrones para compatibilidad entre plataformas
function normalizePath(p) {
  return p.split(/[\/\\]/).join(path.sep);
}

// Función principal
async function main() {
  const rootPath = path.resolve(options.root);

  // Verificar si el directorio existe
  if (!fs.existsSync(rootPath)) {
    console.error(chalk.red(t.errorDir.replace("%s", rootPath)));
    process.exit(1);
  }

  // Verificar si existe package.json
  const packageJsonPath = path.join(rootPath, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    console.error(chalk.red(t.errorPackageJson.replace("%s", rootPath)));
    process.exit(1);
  }

  // Leer package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const dependencies = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {}),
  };

  if (Object.keys(dependencies).length === 0) {
    console.log(chalk.yellow(t.noDependencies));
    process.exit(0);
  }

  // Encontrar archivos .js, .jsx, .ts, .tsx
  // Configuración del glob para compatibilidad multiplataforma
  const ignorePatterns = [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
  ].map(normalizePath);
  const sourcePattern = normalizePath("**/*.{js,jsx,ts,tsx}");

  const sourceFiles = globSync(sourcePattern, {
    cwd: rootPath,
    ignore: ignorePatterns,
    absolute: true,
    windowsPathsNoEscape: true, // Importante para Windows
  });

  if (sourceFiles.length === 0) {
    console.log(chalk.yellow(t.noSourceFiles));
    process.exit(0);
  }

  // Analizar cada archivo para buscar importaciones
  const usedDependencies = new Set();

  for (const file of sourceFiles) {
    try {
      const content = fs.readFileSync(file, "utf8");

      // Buscar diferentes patrones de importación
      const patterns = [
        /require\(['"]([^./][^'"]*)['"]\)/g, // require('module')
        /import\s+.*\s+from\s+['"]([^./][^'"]*)['"]/g, // import xyz from 'module'
        /import\s+\*\s+as\s+.*\s+from\s+['"]([^./][^'"]*)['"]/g, // import * as xyz from 'module'
        /import\s+['"]([^./][^'"]*)['"]/g, // import 'module'
      ];

      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const packageName = getPackageNameFromImport(match[1]);
          usedDependencies.add(packageName);
        }
      }
    } catch (error) {
      // Manejar errores de lectura de archivos silenciosamente para mayor robustez
      console.error(
        chalk.yellow(`Warning: Could not read file ${file}: ${error.message}`)
      );
    }
  }

  // Filtrar las dependencias no utilizadas
  const ignoredModules = options.ignore || [];
  const unusedDependencies = Object.keys(dependencies).filter((dep) => {
    // Ignorar los módulos especificados
    if (ignoredModules.includes(dep)) {
      return false;
    }

    // Verificar si la dependencia está siendo utilizada
    return !usedDependencies.has(dep);
  });

  // Mostrar los resultados
  if (options.json) {
    // Formato JSON
    const jsonResult = {
      totalDependencies: Object.keys(dependencies).length,
      usedDependencies: [...usedDependencies],
      unusedDependencies,
      ignoredModules,
    };
    console.log(JSON.stringify(jsonResult, null, 2));
  } else {
    // Formato legible
    const mensajeDivertido =
      t.funnyMessages[Math.floor(Math.random() * t.funnyMessages.length)];

    console.log(chalk.bold("\n🐶 npm-watchdog"));
    console.log(chalk.italic(mensajeDivertido + "\n"));

    console.log(
      chalk.bold(
        t.totalDependencies.replace("%s", Object.keys(dependencies).length)
      )
    );
    console.log(
      chalk.bold(t.usedDependencies.replace("%s", usedDependencies.size))
    );
    console.log(
      chalk.bold(t.unusedDependencies.replace("%s", unusedDependencies.length))
    );

    if (ignoredModules.length > 0) {
      console.log(
        chalk.yellow(
          `\n${t.ignoredModules.replace("%s", ignoredModules.join(", "))}`
        )
      );
    }

    if (unusedDependencies.length > 0) {
      console.log(chalk.red(`\n${t.unusedDepsLabel}`));
      unusedDependencies.forEach((dep) => {
        console.log(chalk.red(`  - ${dep} (${dependencies[dep]})`));
      });
      console.log(chalk.cyan(`\n${t.suggestion}`));
      console.log(chalk.cyan(`npm uninstall ${unusedDependencies.join(" ")}`));
    } else {
      console.log(chalk.green(`\n${t.goodJob}`));
    }
  }
}

// Función auxiliar para obtener el nombre del paquete principal
function getPackageNameFromImport(importPath) {
  // Manejar subpaquetes como 'package/subpackage'
  const parts = importPath.split("/");

  // Si el nombre empieza con @, es un paquete con scope (@org/package)
  if (parts[0].startsWith("@") && parts.length > 1) {
    return `${parts[0]}/${parts[1]}`;
  }

  return parts[0];
}

// Ejecutar la función principal
main().catch((error) => {
  console.error(chalk.red(`${t.error}`), error);
  process.exit(1);
});
