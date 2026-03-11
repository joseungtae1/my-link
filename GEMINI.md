# Project Overview: My Link

This project, "My Link", is a personal profile or "link-in-bio" application. The core application resides in the `my-profile` directory and is built using modern web technologies.

## Main Technologies

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Linting:** [ESLint](https://eslint.org/)

## Directory Structure

- `my-profile/`: The main Next.js application directory.
  - `app/`: Contains the application routes, layouts, and global styles.
  - `public/`: Static assets such as images and fonts.
  - `package.json`: Project dependencies and scripts.

## Building and Running

All commands should be run from within the `my-profile` directory:

| Task | Command |
| :--- | :--- |
| **Development** | `npm run dev` |
| **Build** | `npm run build` |
| **Start Production** | `npm start` |
| **Linting** | `npm run lint` |

## Development Conventions

- **App Router:** Follow Next.js App Router conventions for routing and layouts.
- **Styling:** Use Tailwind CSS utility classes for styling. The project is configured with Tailwind CSS v4.
- **Components:** Functional components with TypeScript interfaces for props are preferred.
- **Type Safety:** Ensure all new code is properly typed to leverage TypeScript's benefits.
