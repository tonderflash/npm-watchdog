#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { program } = require("commander");
const chalk = require("chalk");
const { globSync } = require("glob");
const figlet = require("figlet");
const gradient = require("gradient-string");
const boxen = require("boxen");
const ora = require("ora");
const Table = require("cli-table3");

// Gradientes para estilos modernos
const cyberpunk = gradient([
  "#f72585",
  "#b5179e",
  "#7209b7",
  "#560bad",
  "#480ca8",
  "#3a0ca3",
  "#3f37c9",
  "#4361ee",
  "#4895ef",
  "#4cc9f0",
]);
const sublime = gradient(["#ff7e5f", "#feb47b"]);
const retro = gradient(["#43cea2", "#185a9d"]);
const pastel = gradient(["#dad4ec", "#f3e7e9"]);

// Configuración de estilos para diferentes OS
const isWindows = process.platform === "win32";
const boxConfig = {
  padding: 1,
  margin: 1,
  borderStyle: isWindows ? "round" : "double", // Windows tiene mejor soporte para bordes simples
  borderColor: "cyan",
  backgroundColor: "#222",
};

// Funciones de utilidad para UI
function renderTitle(text) {
  try {
    const figletText = figlet.textSync(text, {
      font: "ANSI Shadow",
      horizontalLayout: "fitted",
      verticalLayout: "default",
      width: 80,
      whitespaceBreak: true,
    });

    return cyberpunk(figletText);
  } catch (error) {
    // Fallback simple en caso de error con figlet
    return chalk.bold.cyan(`\n${text}\n`);
  }
}

function createSpinner(text) {
  return ora({
    text,
    spinner: "dots12",
    color: "cyan",
  });
}

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
    title: "npm-watchdog",
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
    totalDependencies: "Total dependencies",
    usedDependencies: "Used dependencies",
    unusedDependencies: "Unused dependencies",
    ignoredModules: "Ignored modules",
    unusedDepsLabel: "Unused dependencies:",
    suggestion: "Suggestion: Consider removing these dependencies with:",
    goodJob: "Good job! No unused dependencies found.",
    error: "Error:",
    analyzing: "Analyzing your project...",
    scanningFiles: "Scanning source files...",
    checkingDependencies: "Checking dependencies usage...",
    preparing: "Preparing watchdog...",
    scanning: "Scanning for dependencies...",
    name: "Name",
    version: "Version",
    status: "Status",
    unused: "Unused",
    used: "Used",
    ignored: "Ignored",
  },
  es: {
    funnyMessages: [
      "¡Woof woof! He olfateado algunas dependencias olvidadas...",
      "¡Guau! Parece que tienes algunas dependencias acumulando polvo...",
      "El watchdog ha encontrado dependencias que están durmiendo la siesta...",
      "Estos paquetes están tan utilizados como un paraguas en el desierto...",
      "Dependencias encontradas hibernando en tu package.json...",
    ],
    title: "npm-watchdog",
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
    totalDependencies: "Total de dependencias",
    usedDependencies: "Dependencias utilizadas",
    unusedDependencies: "Dependencias no utilizadas",
    ignoredModules: "Módulos ignorados",
    unusedDepsLabel: "Dependencias no utilizadas:",
    suggestion: "Sugerencia: Considera eliminar estas dependencias con:",
    goodJob: "¡Buen trabajo! No se encontraron dependencias no utilizadas.",
    error: "Error:",
    analyzing: "Analizando tu proyecto...",
    scanningFiles: "Escaneando archivos fuente...",
    checkingDependencies: "Verificando uso de dependencias...",
    preparing: "Preparando watchdog...",
    scanning: "Escaneando dependencias...",
    name: "Nombre",
    version: "Versión",
    status: "Estado",
    unused: "No usada",
    used: "Usada",
    ignored: "Ignorada",
  },
};

// Versión y descripción
program
  .version("1.0.2")
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
  .option("-l, --lang <language>", "Language (en, es)", "en")
  .option("-m, --minimal", "Minimal output mode (no ASCII art)", false);

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

// Arte ASCII para la cabecera
function showHeader() {
  if (options.minimal) {
    console.log(chalk.bold.cyan(`\n${t.title} v1.0.2\n`));
    return;
  }

  console.log("\n");
  console.log(renderTitle(t.title));

  const mensajeDivertido =
    t.funnyMessages[Math.floor(Math.random() * t.funnyMessages.length)];

  console.log(
    boxen(pastel(mensajeDivertido), {
      padding: 1,
      margin: { top: 1, bottom: 1 },
      borderStyle: "round",
      borderColor: "cyan",
      textAlignment: "center",
    })
  );

  console.log(""); // Espacio adicional
}

// Función para crear tablas estilizadas
function createTable(headers) {
  return new Table({
    head: headers.map((header) => chalk.cyan.bold(header)),
    chars: isWindows
      ? { mid: "", "left-mid": "", "mid-mid": "", "right-mid": "" }
      : undefined,
    style: {
      head: [],
      border: ["cyan"],
    },
  });
}

// Función principal
async function main() {
  // Mostrar cabecera
  showHeader();

  // Spinner inicial
  const spinner = createSpinner(t.preparing);
  spinner.start();

  const rootPath = path.resolve(options.root);

  // Verificar si el directorio existe
  if (!fs.existsSync(rootPath)) {
    spinner.fail(chalk.red(t.errorDir.replace("%s", rootPath)));
    process.exit(1);
  }

  // Verificar si existe package.json
  const packageJsonPath = path.join(rootPath, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    spinner.fail(chalk.red(t.errorPackageJson.replace("%s", rootPath)));
    process.exit(1);
  }

  // Actualizar el mensaje del spinner
  spinner.text = t.scanning;

  // Leer package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const dependencies = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {}),
  };

  if (Object.keys(dependencies).length === 0) {
    spinner.warn(chalk.yellow(t.noDependencies));
    process.exit(0);
  }

  // Actualizar mensaje del spinner
  spinner.text = t.scanningFiles;

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
    spinner.warn(chalk.yellow(t.noSourceFiles));
    process.exit(0);
  }

  // Actualizar mensaje del spinner
  spinner.text = t.checkingDependencies;

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

  // Detener el spinner
  spinner.succeed(chalk.green(t.analyzing));

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
    // Resumen estilizado
    const statsBox = boxen(
      `${chalk.cyan.bold(t.totalDependencies)}: ${chalk.white(
        Object.keys(dependencies).length
      )}\n` +
        `${chalk.green.bold(t.usedDependencies)}: ${chalk.white(
          usedDependencies.size
        )}\n` +
        `${chalk.red.bold(t.unusedDependencies)}: ${chalk.white(
          unusedDependencies.length
        )}` +
        (ignoredModules.length > 0
          ? `\n${chalk.yellow.bold(t.ignoredModules)}: ${chalk.white(
              ignoredModules.length
            )}`
          : ""),
      {
        padding: 1,
        margin: 1,
        borderStyle: isWindows ? "round" : "double",
        borderColor: "blue",
        textAlignment: "left",
      }
    );

    console.log(statsBox);

    // Si hay módulos ignorados, mostrarlos
    if (ignoredModules.length > 0) {
      console.log(chalk.yellow.bold(`\n${t.ignoredModules}:`));
      console.log(chalk.yellow(ignoredModules.join(", ")));
    }

    // Tabla detallada de dependencias
    if (unusedDependencies.length > 0) {
      console.log(chalk.red.bold(`\n${t.unusedDepsLabel}`));

      const table = createTable([t.name, t.version, t.status]);

      // Añadir las dependencias no utilizadas
      unusedDependencies.forEach((dep) => {
        table.push([
          chalk.red(dep),
          chalk.gray(dependencies[dep]),
          chalk.red(t.unused),
        ]);
      });

      console.log(table.toString());

      // Sugerencia de comando para desinstalar
      const uninstallCmd = `npm uninstall ${unusedDependencies.join(" ")}`;
      console.log(
        boxen(`${sublime(t.suggestion)}\n\n${chalk.cyan(uninstallCmd)}`, {
          padding: 1,
          margin: { top: 1, bottom: 1 },
          borderStyle: "round",
          borderColor: "yellow",
        })
      );
    } else {
      // Mensaje de éxito
      console.log(
        boxen(retro(t.goodJob), {
          padding: 1,
          margin: { top: 1, bottom: 1 },
          borderStyle: "round",
          borderColor: "green",
          textAlignment: "center",
        })
      );
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
  console.error(
    boxen(`${chalk.red.bold(`${t.error}`)}\n\n${chalk.white(error.message)}`, {
      padding: 1,
      margin: 1,
      borderStyle: "round",
      borderColor: "red",
    })
  );
  process.exit(1);
});
