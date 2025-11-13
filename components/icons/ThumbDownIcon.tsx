import React from 'react';

export const ThumbDownIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 14V2" />
    <path d="M5.5 14v5.5a3.5 3.5 0 0 0 7 0V14" />
    <path d="M14 14l1.5-6a2 2 0 0 0-2-2H5" />
    <path d="M17 14a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-1.5" />
  </svg>
);