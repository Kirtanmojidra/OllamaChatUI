import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import VsCodeDark from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus';

const CodeBlock = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={handleCopy}
        style={{
          position: 'absolute',
          right: 10,
          top: 10,
          background: '#444',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          padding: '4px 8px',
          cursor: 'pointer',
          fontSize: '12px',
        }}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <SyntaxHighlighter language={language} style={VsCodeDark} wrapLongLines>
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
