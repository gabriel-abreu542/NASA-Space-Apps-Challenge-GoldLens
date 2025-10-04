import React from "react";

// Um contêiner básico com borda, fundo e título opcional
export const Card = ({ title, children, className = "" }) => (
  <div className={`bg-zinc-900/70 rounded-2xl border border-zinc-800 shadow-lg ${className}`}>
    {title && (
      <div className="px-5 pt-4 pb-2 text-sm font-medium text-zinc-300 tracking-wide">
        {title}
      </div>
    )}
    <div className="p-5">{children}</div>
  </div>
);