import Editor from "@monaco-editor/react";
import { useEffect, useRef } from "react";

export default function CodeEditor({ socket, roomId }) {
  const editorRef = useRef(null);

  function handleEditorDidMount(editor) {
    editorRef.current = editor;

    editor.onDidChangeModelContent(() => {
      const code = editor.getValue();
      socket.emit("code-change", { roomId, code });
    });
  }

  useEffect(() => {
    socket.on("code-update", (code) => {
      if (editorRef.current && editorRef.current.getValue() !== code) {
        editorRef.current.setValue(code);
      }
    });
    return () => socket.off("code-update");
  }, [socket]);

  return (
    // ✅ This div must be 100% tall — parent (Room.jsx) already sets h-full
    <div style={{ width: "100%", height: "100%" }}>
      <Editor
        height="100%"          // ✅ critical
        width="100%"
        defaultLanguage="javascript"
        defaultValue="// Start coding here..."
        theme="vs-dark"
        onMount={handleEditorDidMount}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,  // ✅ handles resize events automatically
        }}
      />
    </div>
  );
}