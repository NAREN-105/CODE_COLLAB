// backend/src/execute.js
// Add this file to your backend, then add one line in app.js to use it

const { exec, execFile } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const TIMEOUT = 10000; // 10 seconds max per run

// Map language → { filename, compile command (optional), run command }
function getConfig(language, filePath, dir) {
  const configs = {
    python:     { run: `python3 "${filePath}"` },
    java:       { file: "Main.java", compile: `javac "${filePath}"`, run: `java -cp "${dir}" Main` },
    c:          { compile: `gcc "${filePath}" -o "${filePath}.out"`, run: `"${filePath}.out"` },
    cpp:        { compile: `g++ "${filePath}" -o "${filePath}.out"`, run: `"${filePath}.out"` },
    csharp:     { run: `dotnet-script "${filePath}"` },
    go:         { run: `go run "${filePath}"` },
    rust:       { compile: `rustc "${filePath}" -o "${filePath}.out"`, run: `"${filePath}.out"` },
    kotlin:     { compile: `kotlinc "${filePath}" -include-runtime -d "${filePath}.jar"`, run: `java -jar "${filePath}.jar"` },
    ruby:       { run: `ruby "${filePath}"` },
    php:        { run: `php "${filePath}"` },
    bash:       { run: `bash "${filePath}"` },
    lua:        { run: `lua "${filePath}"` },
    r:          { run: `Rscript "${filePath}"` },
    typescript: { run: `npx ts-node "${filePath}"` },
    swift:      { run: `swift "${filePath}"` },
  };
  return configs[language] || null;
}

const EXT = {
  python: "py", java: "java", c: "c", cpp: "cpp", csharp: "cs",
  go: "go", rust: "rs", kotlin: "kt", ruby: "rb", php: "php",
  bash: "sh", lua: "lua", r: "r", typescript: "ts", swift: "swift",
};

function runCommand(cmd, stdin, timeout) {
  return new Promise((resolve) => {
    const proc = exec(cmd, { timeout, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
      if (err && err.killed) return resolve({ stdout: "", stderr: "⏱ Time limit exceeded (10s)" });
      resolve({ stdout: stdout || "", stderr: stderr || (err && !stdout ? err.message : "") });
    });
    if (stdin && proc.stdin) {
      proc.stdin.write(stdin);
      proc.stdin.end();
    }
  });
}

async function executeCode(language, code, stdin = "") {
  const ext = EXT[language];
  if (!ext) return { stdout: "", stderr: `Language "${language}" not supported` };

  // Java needs specific filename
  const filename = language === "java" ? "Main.java" : `code.${ext}`;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "codecollab-"));
  const filePath = path.join(dir, filename);

  try {
    fs.writeFileSync(filePath, code);
    const config = getConfig(language, filePath, dir);
    if (!config) return { stdout: "", stderr: `No config for ${language}` };

    // Compile step (if needed)
    if (config.compile) {
      const compileResult = await runCommand(config.compile, "", TIMEOUT);
      if (compileResult.stderr && compileResult.stderr.trim()) {
        return { stdout: "", stderr: compileResult.stderr };
      }
    }

    // Run step
    return await runCommand(config.run, stdin, TIMEOUT);

  } finally {
    // Cleanup temp files
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_) {}
  }
}

module.exports = { executeCode };