# ShopViet

ShopViet is a React + TypeScript e-commerce demo built with Vite and Tailwind CSS. It includes product browsing, cart management, authentication screens, and a responsive UI.

## Features

- Product listing and category browsing
- Product detail page
- Shopping cart interface
- Login / Register / Forgot Password flows
- Responsive layout for mobile and desktop
- Search input and quick product categories

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- ShadCN UI components
- React Router
- pnpm

## Getting Started

### Install dependencies

```bash
git clone <repository-url>
cd shopviet
pnpm install
```

### Run locally

```bash
pnpm dev
```

Open `http://localhost:5173` in your browser.

## Project Structure

```text
src/
├── app/
│   ├── App.tsx
│   ├── routes.tsx
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── ui/
│   └── pages/
│       ├── Home.tsx
│       ├── ProductList.tsx
│       ├── ProductDetail.tsx
│       ├── Cart.tsx
│       ├── Login.tsx
│       ├── Register.tsx
│       └── ForgotPassword.tsx
├── imports/
└── styles/
    ├── index.css
    ├── tailwind.css
    └── theme.css
```

## Scripts

- `pnpm dev` — Start development server
- `pnpm build` — Build production bundle
- `pnpm preview` — Preview production build

## Notes

- If you add image assets, place them under `src/assets/`
- Update `index.html` title and favicon as needed
- This project currently uses local icons and in-code SVGs for the header and auth pages

## Contributing

1. Fork the repo
2. Create a new branch
3. Commit your changes
4. Open a pull request

## License

This project is provided without a license file by default. Add a `LICENSE` file if you want to publish it under a specific license.