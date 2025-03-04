# ZeroDev Intent SDK Development Guide

## Build & Test Commands
- Build: `bun run build`
- Clean: `bun run clean`
- Lint: `bun run lint`
- Fix linting issues: `bun run lint:fix`
- Format code: `bun run format`
- Run all tests: `bun test`
- Run single test: `bun test src/test/filename.test.ts`
- Watch tests: `bun test --watch`

## Code Style
- TypeScript with strict type checking
- Use double quotes for strings
- Use semicolons at the end of statements
- Line width: 80 characters
- Indentation: 2 spaces
- Trailing commas: always
- Use Biome for formatting and linting
- Organize imports (enabled via Biome)
- Use camelCase for variables and functions
- Use PascalCase for types and interfaces
- Properly handle errors with typed error classes
- Explicitly type function parameters and return values