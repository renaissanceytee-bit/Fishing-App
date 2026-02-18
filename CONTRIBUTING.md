# 🤝 Contributing to Fishing App

Thank you for your interest in contributing to the Fishing App! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of experience level, background, or identity.

### Our Standards

- ✅ Be respectful and constructive
- ✅ Welcome newcomers and help them learn
- ✅ Focus on what's best for the community
- ✅ Show empathy towards others

- ❌ No harassment or discriminatory language
- ❌ No trolling or personal attacks
- ❌ No spam or self-promotion

---

## Getting Started

### 1. Fork & Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/Fishing-App.git
cd Fishing-App
```

### 2. Setup Development Environment

```bash
# Run setup script
./setup.sh

# Or manually
npm install
cd backend && npm install
cd ../mobile && npm install
```

### 3. Create a Branch

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Or bugfix branch
git checkout -b fix/bug-description
```

### 4. Configure Environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your local settings

# Setup database
cd backend
npx prisma migrate dev
npm run seed
```

---

## Development Workflow

### Running the App

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Mobile
cd mobile
npm start
```

### Making Changes

1. **Write code** following our coding standards
2. **Test thoroughly** - both functionality and edge cases
3. **Commit regularly** with clear messages
4. **Keep commits atomic** - one logical change per commit
5. **Pull latest changes** before submitting

### Testing Your Changes

```bash
# Backend tests (if available)
cd backend
npm test

# Lint code
npm run lint

# Type check
npx tsc --noEmit
```

---

## Coding Standards

### TypeScript

- Use **TypeScript** for all new code
- Enable strict mode
- Define proper types/interfaces
- Avoid `any` type when possible

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
}

const getUser = (id: string): Promise<User> => {
  // ...
}

// ❌ Bad
const getUser = (id: any): any => {
  // ...
}
```

### Code Style

- **Indentation:** 2 spaces
- **Quotes:** Single quotes for strings
- **Semicolons:** Required
- **Line length:** Max 100 characters
- **Naming:**
  - `camelCase` for variables and functions
  - `PascalCase` for components and classes
  - `UPPER_SNAKE_CASE` for constants

### React Native

```tsx
// ✅ Good component structure
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

interface Props {
  title: string;
  onPress?: () => void;
}

export default function MyComponent({ title, onPress }: Props) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Effect logic
  }, []);

  return (
    <View style={styles.container}>
      <Text>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
```

### Backend API

```typescript
// ✅ Good route structure
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = Router();

router.post(
  '/catches',
  authenticate,
  [
    body('species').notEmpty().withMessage('Species is required'),
    body('weight').optional().isFloat({ min: 0 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Route logic
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
```

### Database (Prisma)

- Use meaningful model and field names
- Add proper relations
- Include indexes for frequently queried fields
- Add comments for complex schemas

```prisma
model Catch {
  id        String   @id @default(cuid())
  userId    String
  species   String
  weight    Float?
  length    Float?
  latitude  Float
  longitude Float
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user    User      @relation(fields: [userId], references: [id])
  likes   Like[]
  comments Comment[]

  @@index([userId])
  @@index([latitude, longitude])
  @@index([createdAt])
}
```

### Comments

- Write **clear, concise comments**
- Explain **why**, not **what**
- Use JSDoc for functions

```typescript
/**
 * Calculates fishing success probability based on weather conditions
 * @param weatherData Current weather conditions
 * @param solunarData Moon phase and feeding times
 * @returns Success probability (0-1)
 */
function calculateFishingProbability(
  weatherData: WeatherData,
  solunarData: SolunarData
): number {
  // Complex calculation here
}
```

---

## Submitting Changes

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Adding/updating tests
- `chore:` Maintenance tasks

**Examples:**
```bash
feat(catches): add photo upload functionality
fix(auth): resolve token expiration bug
docs(readme): update installation instructions
refactor(api): improve error handling
```

### Pull Request Process

1. **Update your branch**
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. **Push your changes**
   ```bash
   git push origin your-branch
   ```

3. **Create Pull Request**
   - Go to GitHub
   - Click "New Pull Request"
   - Fill out the template:
     - Clear title
     - Description of changes
     - Screenshots (if UI changes)
     - Testing steps
     - Related issues

4. **Code Review**
   - Address reviewer feedback
   - Make requested changes
   - Keep discussion professional

5. **Merge**
   - Maintainer will merge when approved
   - Delete your branch after merge

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] Backend tests pass
- [ ] No console errors

## Screenshots (if applicable)
[Add screenshots here]

## Related Issues
Fixes #123
```

---

## Reporting Bugs

### Before Submitting

1. Check **existing issues** to avoid duplicates
2. Try **latest version** to see if bug is fixed
3. **Reproduce** the bug consistently
4. Collect **error messages** and logs

### Bug Report Template

```markdown
**Bug Description**
Clear description of what the bug is

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Screenshots**
If applicable

**Environment**
- OS: [e.g. iOS 17, Android 14]
- App Version: [e.g. 1.0.0]
- Device: [e.g. iPhone 15, Pixel 8]

**Additional Context**
Any other relevant information
```

---

## Feature Requests

### Before Requesting

1. Check if feature **already exists**
2. Search **existing proposals**
3. Consider if it **fits the project scope**

### Feature Request Template

```markdown
**Feature Summary**
Brief description of the feature

**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other approaches you've thought about

**Additional Context**
Screenshots, mockups, examples

**Priority**
- [ ] Critical
- [ ] High
- [ ] Medium
- [ ] Low
```

---

## Areas for Contribution

### 🌟 Good First Issues

- Documentation improvements
- UI/UX enhancements
- Bug fixes
- Test coverage

### 🎯 High Priority

- Performance optimizations
- Accessibility improvements
- Offline mode functionality
- Push notifications

### 💡 Feature Ideas

- Video upload support
- Advanced search filters
- Custom map markers
- Social media integration
- Data export/import

---

## Project Structure

```
Fishing-App/
├── backend/           # Node.js API
│   ├── prisma/       # Database schema
│   ├── src/
│   │   ├── routes/   # API endpoints
│   │   ├── middleware/
│   │   └── services/
│   └── tests/        # Backend tests
│
├── mobile/           # React Native app
│   ├── src/
│   │   ├── screens/  # App screens
│   │   ├── components/ # Reusable components
│   │   ├── navigation/
│   │   ├── context/
│   │   └── services/
│   └── __tests__/    # Mobile tests
│
└── shared/           # Shared types
    └── types.ts
```

---

## Resources

- **Documentation:** See README.md and other docs
- **API Guide:** API_TESTING_GUIDE.md
- **Architecture:** PROJECT_STRUCTURE.md
- **TypeScript:** [typescriptlang.org](https://www.typescriptlang.org/)
- **React Native:** [reactnative.dev](https://reactnative.dev/)
- **Prisma:** [prisma.io/docs](https://www.prisma.io/docs/)

---

## Questions?

- Open an **issue** for discussion
- Check **existing documentation**
- Ask in **pull request** comments

---

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

**Thank you for contributing! 🎣**

Every contribution, no matter how small, helps make this project better for the fishing community!
