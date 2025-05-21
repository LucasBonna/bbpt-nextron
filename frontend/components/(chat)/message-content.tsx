"use client";

import { useState } from "react";

interface MessageContentProps {
  content: string;
}

export function MessageContent({ content }: MessageContentProps) {
  const [expanded, setExpanded] = useState(false);
  
  const hasTool = content.includes("[Tool");
  
  if (hasTool && !expanded) {
    const beforeTool = content.split("[Tool")[0];
    const afterTool = content.split("]").slice(-1)[0];
    
    return (
      <div>
        {beforeTool && <p className="mb-2 text-gray-100">{beforeTool}</p>}
        <div 
          className="text-xs text-card-foreground bg-card p-2 rounded cursor-pointer my-2 border border-border" 
          onClick={() => setExpanded(true)}
        >
          Tool was used to retrieve information. Click to see details.
        </div>
        {afterTool && <p className="mt-2 text-foreground">{afterTool}</p>}
      </div>
    );
  }
  
  if (hasTool) {
    const parts = content.split(/(\[Tool.*?\])/g);
    
    return (
      <div>
        {parts.map((part, i) => {
          if (part.startsWith("[Tool")) {
            return (
              <div key={i} className="bg-card p-2 my-2 rounded text-xs text-card-foreground font-mono border border-border">
                {part}
              </div>
            );
          }
          return part ? <p key={i} className="my-2 text-gray-100">{part}</p> : null;
        })}
        {expanded && (
          <div 
            className="text-xs text-card-foreground cursor-pointer mt-2 text-right" 
            onClick={() => setExpanded(false)}
          >
            Hide tool details
          </div>
        )}
      </div>
    );
  }
  
  return <p className="text-gray-100">{content}</p>;
}
