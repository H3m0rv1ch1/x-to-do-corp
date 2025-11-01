# Contributing to X To-Do Corp

First off, thank you for considering contributing to X To-Do Corp! It's people like you that make this project better for everyone.

## Code of Conduct

This project and everyone participating in it is governed by our commitment to providing a welcoming and inspiring community for all.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if possible**
- **Note your environment** (OS, browser, Node version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List any similar features in other applications**

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Follow the code style** of the project
3. **Write clear commit messages**
4. **Test your changes** thoroughly
5. **Update documentation** as needed
6. **Submit your pull request**

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/x-to-do-corp.git

# Install dependencies
npm install

# Start development server
npm run dev

# Run type checking
npm run type-check
```

## Code Style Guidelines

### TypeScript
- Use TypeScript for all new files
- Define proper types and interfaces
- Avoid `any` type when possible
- Use meaningful variable names

### React Components
- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use proper prop types

### File Organization
```
src/
├── components/
│   ├── [feature]/
│   │   ├── ComponentName.tsx
│   │   └── index.ts (barrel export)
```

### Naming Conventions
- **Components**: PascalCase (e.g., `TodoItem.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useAppContext.ts`)
- **Utils**: camelCase (e.g., `textParser.ts`)
- **Types**: PascalCase (e.g., `Todo`, `UserProfile`)

### Import Order
1. React and external libraries
2. Internal components (using `@/` alias)
3. Types
4. Hooks
5. Utils and constants

Example:
```typescript
import React, { useState } from 'react';
import { HiCheck } from 'react-icons/hi';
import { TodoItem } from '@/components/todo';
import { type Todo } from '@/types';
import { useAppContext } from '@/hooks/useAppContext';
import { formatDate } from '@/utils/dateUtils';
```

### CSS/Styling
- Use Tailwind utility classes
- Follow the existing color scheme using CSS variables
- Maintain responsive design (mobile-first)
- Use consistent spacing (Tailwind spacing scale)

## Commit Message Guidelines

Follow the conventional commits specification:

```
type(scope): subject

body (optional)

footer (optional)
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```
feat(todo): add drag and drop for task reordering

fix(calendar): resolve date picker timezone issue

docs(readme): update installation instructions

refactor(components): reorganize folder structure
```

## Testing

Before submitting a pull request:

1. Test all functionality you've changed
2. Test on different screen sizes
3. Test in both light and dark mode
4. Check for console errors
5. Verify TypeScript compilation

## Documentation

- Update README.md if you change functionality
- Add JSDoc comments for complex functions
- Update type definitions as needed
- Include inline comments for complex logic

## Questions?

Feel free to open an issue with the `question` label if you need help or clarification.

## Recognition

Contributors will be recognized in the project README. Thank you for your contributions!

---

Happy coding! 🚀
