import React from 'react';

interface JsonViewerProps {
  data: any;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ data }) => {
  return (
    <div className="h-full bg-slate-50 overflow-auto p-4 font-mono text-sm text-slate-800">
       <pre className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
         {JSON.stringify(data, null, 2)}
       </pre>
    </div>
  );
};
