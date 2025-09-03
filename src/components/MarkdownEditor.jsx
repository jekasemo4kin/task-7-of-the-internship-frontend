import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';


const MarkdownEditor = ({ value, onChange, placeholder, rows = 4 }) => {
  const [activeTab, setActiveTab] = useState('write');
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex bg-gray-200 border-b border-gray-300">
        <button
          type="button"
          onClick={() => setActiveTab('write')}
          className={`py-2 px-4 font-bold text-sm ${activeTab === 'write' ? 'bg-white text-blue-600' : 'text-gray-600 hover:bg-gray-300'}`}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`py-2 px-4 font-bold text-sm ${activeTab === 'preview' ? 'bg-white text-blue-600' : 'text-gray-600 hover:bg-gray-300'}`}
        >
          Preview
        </button>
      </div>
      {activeTab === 'write' ? (
        <textarea
          className="w-full h-48 p-4 text-gray-800 focus:outline-none resize-none"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
        />
      ) : (
        <div className="p-4 prose prose-sm max-w-none h-48 overflow-y-auto">
          <ReactMarkdown>{value}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};
export default MarkdownEditor;