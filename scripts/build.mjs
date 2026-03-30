import { mkdir, readFile, rm, writeFile, copyFile, readdir } from "node:fs/promises";
import { existsSync, watch } from "node:fs";
import { resolve, dirname, relative, extname } from "node:path";

const root = process.cwd();
const srcRoot = resolve(root, "src");
const distRoot = resolve(root, "dist");
const args = new Set(process.argv.slice(2));

async function ensureDir(path) {
  await mkdir(path, { recursive: true });
}

function normalizeModuleId(filePath) {
  return relative(srcRoot, filePath).replace(/\\/g, "/").replace(/\.ts$/, "");
}

function resolveImportPath(importerPath, specifier) {
  const withExtension = extname(specifier) ? specifier : `${specifier}.ts`;
  return resolve(dirname(importerPath), withExtension);
}

function transformModule(source, filePath) {
  const importLines = [];
  const exportNames = [];

  let transformed = source.replace(/import\s+["'](\.\.?\/[^"']+)\.css["'];?\s*/g, "");

  transformed = transformed.replace(
    /import\s+\{([^}]+)\}\s+from\s+["'](\.\.?\/[^"']+)["'];?\s*/g,
    (_, names, specifier) => {
      const modulePath = resolveImportPath(filePath, specifier);
      const moduleId = normalizeModuleId(modulePath);
      importLines.push(`const { ${names.trim()} } = __require("${moduleId}");`);
      return "";
    }
  );

  transformed = transformed.replace(/export\s+async\s+function\s+([A-Za-z0-9_]+)\s*\(/g, (_, name) => {
    exportNames.push(name);
    return `async function ${name}(`;
  });

  transformed = transformed.replace(/export\s+function\s+([A-Za-z0-9_]+)\s*\(/g, (_, name) => {
    exportNames.push(name);
    return `function ${name}(`;
  });

  transformed = transformed.replace(/export\s+const\s+([A-Za-z0-9_]+)\s*=/g, (_, name) => {
    exportNames.push(name);
    return `const ${name} =`;
  });

  transformed = transformed.replace(/export\s+\{\};?\s*/g, "");

  const exportBlock = exportNames.map((name) => `exports.${name} = ${name};`).join("\n");
  return `${importLines.join("\n")}\n${transformed}\n${exportBlock}\n`;
}

async function bundleEntry(entryPath) {
  const modules = new Map();

  async function visit(filePath) {
    if (modules.has(filePath)) {
      return;
    }

    const source = await readFile(filePath, "utf8");
    const dependencies = Array.from(
      source.matchAll(/import\s+(?:\{[^}]+\}\s+from\s+)?["'](\.\.?\/[^"']+)["']/g),
      (match) => match[1]
    )
      .filter((specifier) => !specifier.endsWith(".css"))
      .map((specifier) => resolveImportPath(filePath, specifier));

    for (const dependency of dependencies) {
      await visit(dependency);
    }

    modules.set(filePath, transformModule(source, filePath));
  }

  await visit(entryPath);

  const chunks = [];
  for (const [filePath, code] of modules.entries()) {
    chunks.push(`"${normalizeModuleId(filePath)}": (module, exports, __require) => {\n${code}\n}`);
  }

  return `(function () {
const __modules = {
${chunks.join(",\n")}
};
const __cache = {};
function __require(id) {
  if (__cache[id]) {
    return __cache[id].exports;
  }
  const factory = __modules[id];
  if (!factory) {
    throw new Error("Module not found: " + id);
  }
  const module = { exports: {} };
  __cache[id] = module;
  factory(module, module.exports, __require);
  return module.exports;
}
__require("${normalizeModuleId(entryPath)}");
})();`;
}

async function copyIfExists(inputPath, outputPath) {
  if (!existsSync(inputPath)) {
    return;
  }
  await ensureDir(dirname(outputPath));
  await copyFile(inputPath, outputPath);
}

async function copyDirIfExists(inputDir, outputDir) {
  if (!existsSync(inputDir)) {
    return;
  }

  await ensureDir(outputDir);
  const entries = await readdir(inputDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = resolve(inputDir, entry.name);
    const targetPath = resolve(outputDir, entry.name);

    if (entry.isDirectory()) {
      await copyDirIfExists(sourcePath, targetPath);
      continue;
    }

    await copyIfExists(sourcePath, targetPath);
  }
}

async function build() {
  await rm(distRoot, { recursive: true, force: true });
  await ensureDir(resolve(distRoot, "assets"));

  await copyIfExists(resolve(root, "manifest.json"), resolve(distRoot, "manifest.json"));
  await copyIfExists(resolve(srcRoot, "content", "content.css"), resolve(distRoot, "assets", "content.css"));
  await copyDirIfExists(resolve(srcRoot, "assets", "icons"), resolve(distRoot, "assets", "icons"));
  const bundle = await bundleEntry(resolve(srcRoot, "content", "index.ts"));
  await writeFile(resolve(distRoot, "assets", "content.js"), bundle, "utf8");
}

async function runCheck() {
  await build();
  console.log("Build check completed.");
}

async function runWatch() {
  await build();
  console.log("Watching for changes...");
  watch(srcRoot, { recursive: true }, async () => {
    try {
      await build();
      console.log("Rebuilt at", new Date().toISOString());
    } catch (error) {
      console.error(error);
    }
  });
}

if (args.has("--check")) {
  await runCheck();
} else if (args.has("--watch")) {
  await runWatch();
} else {
  await build();
  console.log("Build completed.");
}
