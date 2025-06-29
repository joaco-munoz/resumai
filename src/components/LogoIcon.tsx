import React from "react";

interface LogoIconProps {
  className?: string;
}

const LogoIcon: React.FC<LogoIconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
    className={className}
  >
    {/* Document outline */}
    <path
      d="M6 2h7l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"
      fill="currentColor"
    />
    {/* Lightning bolt */}
    <path
      d="M11 11h2l-2 4h3l-5 7 1-6H8l3-5z"
      fill="currentColor"
    />
  </svg>
);

export default LogoIcon;
