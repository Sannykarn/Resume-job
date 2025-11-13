import React from 'react';

export const ThumbUpIcon = ({ className }: { className?: string }) => (
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
    <path d="M7 10v12" />
    <path d="M18.5 10V4.5a3.5 3.5 0 0 0-7 0V10" />
    <path d="M10 10l-1.5 6a2 2 0 0 0 2 2h8.5" />
    <path d="M7 10a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h1.5" />
  </svg>
);