
import React from 'react';

export const parseTextForTags = (text: string): { cleanedText: string; tags: string[] } => {
  const tagRegex = /#(\w+)/g;
  const tags = (text.match(tagRegex) || []).map(tag => tag.substring(1).toLowerCase());
  const cleanedText = text.replace(tagRegex, '').replace(/\s+/g, ' ').trim();
  return { cleanedText, tags };
};

export const parseTextForDueDate = (text: string): { cleanedText: string; dueDate: string | null } => {
  const patterns: { regex: RegExp; handler: (match: RegExpMatchArray) => Date }[] = [
    {
      regex: /\b(by tomorrow|tomorrow)\b/i,
      handler: () => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d;
      },
    },
    {
      regex: /\b(in (\d+) days?)\b/i,
      handler: (match) => {
        const d = new Date();
        d.setDate(d.getDate() + parseInt(match[2], 10));
        return d;
      },
    },
    {
      regex: /\b(next week)\b/i,
      handler: () => {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        return d;
      },
    },
    {
        regex: /\b(next (monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/i,
        handler: (match) => {
            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const targetDay = days.indexOf(match[2].toLowerCase());
            const d = new Date();
            const currentDay = d.getDay();
            const diff = targetDay - currentDay;
            d.setDate(d.getDate() + diff + (diff <= 0 ? 7 : 0));
            return d;
        }
    }
  ];

  let dueDate: Date | null = null;
  let cleanedText = text;

  for (const pattern of patterns) {
    const match = text.match(pattern.regex);
    if (match) {
      dueDate = pattern.handler(match);
      cleanedText = text.replace(pattern.regex, '').replace(/\s+/g, ' ').trim();
      break; 
    }
  }

  return {
    cleanedText,
    dueDate: dueDate ? dueDate.toISOString().split('T')[0] : null,
  };
};

export const linkify = (text: string): (string | React.ReactElement)[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return React.createElement(
        'a',
        {
          key: i,
          href: part,
          target: '_blank',
          rel: 'noopener noreferrer',
          className: 'text-[rgba(var(--accent-rgb))] hover:underline',
          onClick: (e: React.MouseEvent) => e.stopPropagation(),
        },
        part
      );
    }
    return part;
  });
};

export const parseMarkdown = (text: string): string => {
  if (!text) return '';

  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Process block elements first
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
             .replace(/^## (.*$)/gim, '<h2>$1</h2>')
             .replace(/^# (.*$)/gim, '<h1>$1</h1>')
             .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
             .replace(/^\s*[-*] (.*$)/gim, '<ul><li>$1</li></ul>')
             .replace(/^\s*\d+\. (.*$)/gim, '<ol><li>$1</li></ol>')
             .replace(/<\/ul>\s*<ul>/gim, '')
             .replace(/<\/ol>\s*<ol>/gim, '');

  // Process inline elements
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
             .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
             .replace(/_(.*?)_/g, '<em>$1</em>')
             .replace(/`([^`]+)`/g, '<code>$1</code>');

  // Process paragraphs
  html = html.split('\n\n').map(paragraph => {
    if (paragraph.trim().startsWith('<')) {
      return paragraph;
    }
    return `<p>${paragraph}</p>`;
  }).join('');
  
  // Apply theme-aware classes
  const styles = {
    h1: 'text-3xl font-bold mt-6 mb-4 text-[rgba(var(--foreground-primary-rgb))] border-b border-[rgba(var(--border-secondary-rgb))] pb-3',
    h2: 'text-2xl font-bold mt-5 mb-3 text-[rgba(var(--foreground-primary-rgb))] border-b border-[rgba(var(--border-secondary-rgb))] pb-2',
    h3: 'text-xl font-bold mt-4 mb-2 text-[rgba(var(--foreground-primary-rgb))]',
    blockquote: 'border-l-4 border-[rgba(var(--border-secondary-rgb))] pl-4 italic text-[rgba(var(--foreground-secondary-rgb))] my-4',
    ul: 'list-disc list-inside my-4 pl-2 text-[rgba(var(--foreground-primary-rgb))]',
    ol: 'list-decimal list-inside my-4 pl-2 text-[rgba(var(--foreground-primary-rgb))]',
    li: 'mb-1',
    a: 'text-[rgba(var(--accent-rgb))] hover:underline',
    strong: 'font-bold',
    em: 'italic',
    code: 'bg-[rgba(var(--background-tertiary-rgb))] text-[rgba(var(--accent-rgb))] rounded px-1.5 py-1 text-sm font-mono',
    p: 'mb-4 leading-relaxed text-[rgba(var(--foreground-primary-rgb))]',
  };

  return html
      .replace(/<h1>/g, `<h1 class="${styles.h1}">`)
      .replace(/<h2>/g, `<h2 class="${styles.h2}">`)
      .replace(/<h3>/g, `<h3 class="${styles.h3}">`)
      .replace(/<blockquote>/g, `<blockquote class="${styles.blockquote}">`)
      .replace(/<ul>/g, `<ul class="${styles.ul}">`)
      .replace(/<ol>/g, `<ol class="${styles.ol}">`)
      .replace(/<li>/g, `<li class="${styles.li}">`)
      .replace(/<a/g, `<a class="${styles.a}"`)
      .replace(/<strong>/g, `<strong class="${styles.strong}">`)
      .replace(/<em>/g, `<em class="${styles.em}">`)
      .replace(/<code>/g, `<code class="${styles.code}">`)
      .replace(/<p>/g, `<p class="${styles.p}">`);
};