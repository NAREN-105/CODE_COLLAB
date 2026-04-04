import Editor from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";

const LANGUAGES = [
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript"  },
  { id: "python",     label: "Python 3"    },
  { id: "java",       label: "Java"        },
  { id: "c",          label: "C"           },
  { id: "cpp",        label: "C++"         },
  { id: "csharp",     label: "C#"          },
  { id: "go",         label: "Go"          },
  { id: "rust",       label: "Rust"        },
  { id: "kotlin",     label: "Kotlin"      },
  { id: "swift",      label: "Swift"       },
  { id: "ruby",       label: "Ruby"        },
  { id: "php",        label: "PHP"         },
  { id: "bash",       label: "Bash"        },
  { id: "lua",        label: "Lua"         },
  { id: "r",          label: "R"           },
];

const DEFAULT_CODE = {
  javascript: `console.log("Hello, World!");`,
  typescript: `const msg: string = "Hello, World!";\nconsole.log(msg);`,
  python:     `print("Hello, World!")`,
  java:       `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
  c:          `#include <stdio.h>\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
  cpp:        `#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}`,
  csharp:     `using System;\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}`,
  go:         `package main\nimport "fmt"\nfunc main() {\n    fmt.Println("Hello, World!")\n}`,
  rust:       `fn main() {\n    println!("Hello, World!");\n}`,
  kotlin:     `fun main() {\n    println("Hello, World!")\n}`,
  swift:      `print("Hello, World!")`,
  ruby:       `puts "Hello, World!"`,
  php:        `<?php\necho "Hello, World!\\n";`,
  bash:       `echo "Hello, World!"`,
  lua:        `print("Hello, World!")`,
  r:          `cat("Hello, World!\\n")`,
};

export default function CodeEditor({ socket, roomId }) {
  const editorRef = useRef(null);
  const isRemoteUpdate = useRef(false);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [stdin, setStdin] = useState("");
  const [showStdin, setShowStdin] = useState(false);
  const [outputType, setOutputType] = useState("success");

  function handleEditorDidMount(editor) {
    editorRef.current = editor;
    editor.onDidChangeModelContent(() => {
      if (isRemoteUpdate.current || !socket) return;
      socket.emit("code-change", { roomId, code: editor.getValue() });
    });
  }

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = ({ code }) => {
      if (editorRef.current && editorRef.current.getValue() !== code) {
        isRemoteUpdate.current = true;
        editorRef.current.setValue(code);
        isRemoteUpdate.current = false;
      }
    };
    socket.on("code-update", handleUpdate);
    return () => socket.off("code-update", handleUpdate);
  }, [socket]);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setOutput("");
    if (editorRef.current) {
      editorRef.current.setValue(DEFAULT_CODE[lang.id] || `// ${lang.label}\n`);
    }
  };

  const runCode = async () => {
    if (!editorRef.current) return;
    const code = editorRef.current.getValue();

    // JavaScript runs instantly in browser
    if (language.id === "javascript") {
      const logs = [];
      const orig = { log: console.log, error: console.error, warn: console.warn };
      console.log = (...a) => logs.push(a.map(String).join(" "));
      console.error = (...a) => logs.push("Error: " + a.map(String).join(" "));
      console.warn = (...a) => logs.push("Warn: " + a.map(String).join(" "));
      try {
        // eslint-disable-next-line no-new-func
        new Function(code)();
        setOutput(logs.length > 0 ? logs.join("\n") : "✅ Ran successfully (no output)");
        setOutputType("success");
      } catch (e) {
        setOutput("❌ " + e.message);
        setOutputType("error");
      } finally {
        Object.assign(console, orig);
      }
      return;
    }

    // All other languages → your backend at localhost:5000
    setIsRunning(true);
    setOutput("⏳ Running...");
    setOutputType("info");

    try {
      const res = await fetch("http://localhost:5000/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: language.id, code, stdin }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${res.status}`);
      }

      const data = await res.json();

      if (data.stderr && data.stderr.trim()) {
        setOutput("❌ " + data.stderr);
        setOutputType("error");
      } else if (data.stdout && data.stdout.trim()) {
        setOutput(data.stdout);
        setOutputType("success");
      } else {
        setOutput("✅ Ran successfully (no output)");
        setOutputType("success");
      }
    } catch (err) {
      setOutput(`❌ ${err.message}\n\nMake sure your backend is running:\n  cd backend\n  node src/app.js`);
      setOutputType("error");
    } finally {
      setIsRunning(false);
    }
  };

  const outputColors = { success: "#3fb950", error: "#f85149", info: "#d29922" };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap",
        padding: "6px 12px", backgroundColor: "#161b22",
        borderBottom: "1px solid #30363d", flexShrink: 0,
      }}>
        <select
          value={language.id}
          onChange={(e) => handleLanguageChange(LANGUAGES.find(l => l.id === e.target.value))}
          style={{
            backgroundColor: "#21262d", color: "#c9d1d9",
            border: "1px solid #30363d", borderRadius: "6px",
            padding: "4px 10px", fontSize: "13px", cursor: "pointer",
          }}
        >
          {LANGUAGES.map((l) => (
            <option key={l.id} value={l.id}>{l.label}</option>
          ))}
        </select>

        <button onClick={runCode} disabled={isRunning} style={{
          backgroundColor: isRunning ? "#238636aa" : "#238636",
          color: "white", border: "none", borderRadius: "6px",
          padding: "5px 18px", fontSize: "13px", fontWeight: "600",
          cursor: isRunning ? "not-allowed" : "pointer",
        }}>
          {isRunning ? "⏳ Running..." : "▶ Run"}
        </button>

        <button onClick={() => setShowStdin(!showStdin)} style={{
          backgroundColor: showStdin ? "#21262d" : "transparent",
          color: "#8b949e", border: "1px solid #30363d",
          borderRadius: "6px", padding: "4px 10px",
          fontSize: "12px", cursor: "pointer",
        }}>
          {showStdin ? "▲ Hide Input" : "▼ stdin"}
        </button>

        <span style={{ fontSize: "11px", color: "#3fb950", marginLeft: "auto" }}>
          ✓ Runs on your backend
        </span>
      </div>

      {showStdin && (
        <div style={{ flexShrink: 0, backgroundColor: "#161b22", borderBottom: "1px solid #30363d", padding: "8px 12px" }}>
          <div style={{ fontSize: "11px", color: "#8b949e", marginBottom: "4px" }}>STDIN</div>
          <textarea value={stdin} onChange={(e) => setStdin(e.target.value)}
            placeholder="Enter input for your program..."
            style={{
              width: "100%", height: "56px", backgroundColor: "#0d1117",
              color: "#c9d1d9", border: "1px solid #30363d", borderRadius: "6px",
              padding: "6px 8px", fontSize: "12px", fontFamily: "monospace",
              resize: "none", outline: "none", boxSizing: "border-box",
            }}
          />
        </div>
      )}

      <div style={{ flex: output ? "0 0 55%" : "1", minHeight: 0 }}>
        <Editor
          height="100%" width="100%"
          language={language.id}
          defaultValue={DEFAULT_CODE[language.id]}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false, automaticLayout: true }}
        />
      </div>

      {output && (
        <div style={{ flex: "0 0 45%", backgroundColor: "#0d1117", borderTop: "2px solid #30363d", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 12px", borderBottom: "1px solid #30363d", flexShrink: 0 }}>
            <span style={{ color: "#8b949e", fontSize: "11px", textTransform: "uppercase" }}>Output — {language.label}</span>
            <button onClick={() => setOutput("")} style={{ background: "none", border: "none", color: "#8b949e", cursor: "pointer", fontSize: "13px" }}>✕</button>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: "12px 16px", fontFamily: "monospace", fontSize: "13px", color: outputColors[outputType], whiteSpace: "pre-wrap", lineHeight: "1.5" }}>
            {output}
          </div>
        </div>
      )}
    </div>
  );
}