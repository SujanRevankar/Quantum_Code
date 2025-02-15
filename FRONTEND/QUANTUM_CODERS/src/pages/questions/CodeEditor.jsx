import React from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/mode/javascript/javascript'; // Include the appropriate language mode
import 'codemirror/lib/codemirror.css'; // Styling for CodeMirror

const CodeEditor = ({ code, onChange }) => {
  return (
    <div className="flex justify-center mt-4">
      <CodeMirror
        value={code}
        options={{
          mode: 'javascript',
          theme: 'material',
          lineNumbers: true,
          indentUnit: 4,
          smartIndent: true,
        }}
        onBeforeChange={(editor, data, value) => {
          onChange(value);
        }}
        className="w-full max-w-4xl h-96 border rounded-lg shadow-lg"
      />
    </div>
  );
};

export default CodeEditor;
