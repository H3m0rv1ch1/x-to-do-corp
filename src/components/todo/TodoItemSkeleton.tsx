import React from 'react';

const TodoItemSkeleton: React.FC = () => {
  return (
    <div className="p-4 border-b border-[rgba(var(--border-primary-rgb))]">
      <div className="flex items-start skeleton-pulse">
        <div className="w-6 h-6 rounded-full bg-[rgba(var(--background-tertiary-rgb))] flex-shrink-0 mr-4 mt-1"></div>
        <div className="flex-grow">
          <div className="h-6 w-3/4 bg-[rgba(var(--background-tertiary-rgb))] rounded"></div>
          <div className="h-4 w-1/2 bg-[rgba(var(--background-tertiary-rgb))] rounded mt-3"></div>
        </div>
        <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-[rgba(var(--background-tertiary-rgb))]"></div>
          <div className="w-8 h-8 rounded-full bg-[rgba(var(--background-tertiary-rgb))]"></div>
          <div className="w-8 h-8 rounded-full bg-[rgba(var(--background-tertiary-rgb))]"></div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(TodoItemSkeleton);