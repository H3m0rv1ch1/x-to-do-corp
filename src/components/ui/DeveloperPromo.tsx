
import React from 'react';
import { FaGithub } from 'react-icons/fa6';

const DeveloperPromo: React.FC = () => {
  return (
    <div className="bg-[rgba(var(--background-primary-rgb))] border border-[rgba(var(--border-primary-rgb))] rounded-xl p-4">
      <h2 className="text-xl font-bold text-[rgba(var(--foreground-primary-rgb))] mb-2">Developer Spotlight</h2>
      <p className="text-[rgba(var(--foreground-secondary-rgb))] mb-4">
        Enjoying the app? Follow my work and projects on GitHub to see what I'm building next.
      </p>
      <a
        href="https://github.com/H3m0rv1ch1"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-[rgba(var(--foreground-primary-rgb))] text-[rgba(var(--background-primary-rgb))] font-bold px-4 py-2 rounded-full hover:opacity-90 transition-opacity duration-200 inline-flex items-center justify-center"
        style={{ minWidth: '100px' }}
      >
        <FaGithub className="w-5 h-5 mr-2" />
        <span>
          View
          <span className="hidden sm:inline">&nbsp;on GitHub</span>
        </span>
      </a>
    </div>
  );
};

export default DeveloperPromo;