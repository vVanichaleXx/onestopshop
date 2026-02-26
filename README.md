# OneStopShop

OneStopShop is a modern e-commerce web application built with React and Vite. It features a clean, responsive interface with a light theme and smooth animations.

## Features

- **Product Catalog:** Browse a categorized list of products.
- **Shopping Cart:** Add items to your cart, update quantities, and prepare for checkout.
- **User Authentication:** Support for user registration, login, and secure sessions.
- **User Dashboard:** Dedicated profile page for users to view their order history.
- **Admin Panel:** Secure interface for administrators to manage the product catalog and overview user orders.

## Technologies Used

- **Frontend:** React, React Router DOM, Framer Motion (for fluid animations), Lucide React (for icons)
- **Styling:** Vanilla CSS utilizing a customized design system with CSS variables
- **Build Tool:** Vite
- **Backend:** Express.js REST API
- **Database:** SQLite (local file-based storage)

## Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- npm (Node Package Manager)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/vVanichaleXx/onestopshop.git
   cd onestopshop
   ```

2. Install the necessary dependencies:
   ```bash
   npm install
   ```

### Running the Application Locally

Start both the Vite frontend development server and the Express backend API simultaneously using the provided `dev` script:

```bash
npm run dev
```

- The frontend application will be served at `http://localhost:5173`
- The backend API server will listen on `http://localhost:3001`

## Project Structure

- `src/`: Client-side React source code, components, contexts, and pages
- `server/`: Backend Express.js server, route handlers, middleware, and SQLite database
- `public/`: Static publicly served assets
