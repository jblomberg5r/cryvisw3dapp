import React from 'react';
import AceEditor from 'react-ace';

// Import Ace editor modes
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-solidity';
import 'ace-builds/src-noconflict/mode-typescript';
import 'ace-builds/src-noconflict/mode-markdown';
// Import more modes as needed:
// import 'ace-builds/src-noconflict/mode-python';
// import 'ace-builds/src-noconflict/mode-html';

// Import Ace editor themes
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-tomorrow_night';
import 'ace-builds/src-noconflict/theme-solarized_dark';
import 'ace-builds/src-noconflict/theme-solarized_light';

// Import Ace editor extensions
import 'ace-builds/src-noconflict/ext-language_tools'; // For autocompletion
import 'ace-builds/src-noconflict/ext-searchbox'; // For search functionality
import AceEditorClass from 'react-ace/lib/editor'; // For type hint of editor instance

export interface CodeEditorRef {
  insertText: (text: string) => void;
}

interface CodeEditorProps {
  value: string;
  onChange: (newValue: string) => void;
  mode?: string; // e.g., 'javascript', 'solidity'
  theme?: string; // e.g., 'github', 'tomorrow_night'
  height?: string;
  width?: string;
  fontSize?: number;
  readOnly?: boolean;
}

const CodeEditor = React.forwardRef<CodeEditorRef, CodeEditorProps>(({
  value,
  onChange,
  mode = 'javascript',
  theme = 'github',
  height = '100%',
  width = '100%',
  fontSize = 14,
  readOnly = false,
}, ref) => {
  const editorRef = React.useRef<AceEditorClass | null>(null);

  React.useImperativeHandle(ref, () => ({
    insertText: (text: string) => {
      if (editorRef.current) {
        const editor = editorRef.current.editor; // Access the Ace editor instance
        editor.insert(text);
      }
    },
  }));

  return (
    <AceEditor
      ref={editorRef as any} // Cast needed due to react-ace typing
      mode={mode}
      theme={theme}
      value={value}
      onChange={onChange}
      name="UNIQUE_ID_OF_DIV" // Should be unique
      editorProps={{ $blockScrolling: true }}
      setOptions={{
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        enableSnippets: true,
        showLineNumbers: true,
        tabSize: 2,
        useWorker: false, // Disables syntax checking worker, good for some modes like solidity
      }}
      fontSize={fontSize}
      showPrintMargin={true}
      showGutter={true}
      highlightActiveLine={true}
      height={height}
      width={width}
      readOnly={readOnly}
      style={{ border: '1px solid #ddd' }} // Optional: adds a border
    />
  );
};

export default CodeEditor;
