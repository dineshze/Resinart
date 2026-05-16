# Resin Art MERN Ecommerce

A MERN stack ecommerce website for a handmade resin art brand. The app includes product browsing, JWT authentication, cart management, Cash on Delivery checkout, user order tracking, custom artwork requests, and an admin dashboard for products and orders.

## Tech Stack

- Frontend: React, React Router, Tailwind CSS, Axios, React Hot Toast
- Backend: Node.js, Express, MongoDB, Mongoose
- Authentication: JWT with protected customer and admin routes
- Payment: Cash on Delivery now, with a backend payment provider structure ready for future gateways

## Main Features

- Product catalogue with responsive handmade resin art UI
- Add to cart, remove from cart, update quantity
- Cart saved in browser local storage
- Checkout page with customer shipping details
- Cash on Delivery as the only active payment method
- Order confirmation page after successful checkout
- User order history and order detail tracking
- Admin product management
- Admin order management with search, status filters, and status updates
- Admin analytics for total orders, pending orders, delivered orders, and revenue
- Custom resin artwork request form, managed separately from ecommerce orders
- Light and dark theme support

## Project Structure

```text
client/
  src/
    components/       Shared UI components
    context/          Auth, theme, and cart state
    pages/            Home, cart, checkout, orders, admin pages
    api/              Axios API client
    utils/            Shared frontend helpers

server/
  src/
    controllers/      Request handlers
    models/           MongoDB schemas
    routes/           REST API routes
    middleware/       JWT auth, admin guard, uploads
    services/         Payment provider abstraction
```

## Setup

Install dependencies separately if needed:

```bash
npm.cmd install --prefix client
npm.cmd install --prefix server
```

Create `server/.env`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
PORT=5000
```

Seed demo products and an admin user:

```bash
npm.cmd run seed --prefix server
```

Default admin login:

- Email: `admin@resinart.local`
- Password: `admin12345`

## Run Locally

Start the backend:

```bash
npm.cmd start --prefix server
```

Start the frontend:

```bash
npm.cmd run dev --prefix client
```

Open:

- Frontend: `http://localhost:5173`
- Backend health check: `http://localhost:5000/api/health`

## Order And COD Flow

1. A customer adds products to the cart.
2. Cart data is stored in local storage.
3. Checkout requires login.
4. The customer enters shipping details.
5. Cash on Delivery is selected by default.
6. The backend validates products, stock, quantities, address, and payment method.
7. An order is stored with `payment.method = "cod"` and `payment.status = "cod_pending"`.
8. The customer is redirected to the order confirmation page.
9. The customer can track the order from the order history page.

## Order Statuses

Admins can update ecommerce order status to:

- `pending`
- `confirmed`
- `processing`
- `shipped`
- `delivered`
- `cancelled`

## Payment Architecture

The backend uses a payment provider layer:

```text
server/src/services/payments/
  codProvider.js
  index.js
```

Only COD is enabled right now. Future gateways such as Razorpay, Stripe, PhonePe, or PayPal can be added by creating a new provider and registering it in `services/payments/index.js`.

Supported payment status values:

- `pending`
- `paid`
- `failed`
- `cod_pending`

## API Overview

Auth:

- `POST /api/auth/signup`
- `POST /api/auth/login`

Products:

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` admin only
- `PUT /api/products/:id` admin only
- `DELETE /api/products/:id` admin only

Orders:

- `POST /api/orders` authenticated customer checkout
- `GET /api/orders/mine` authenticated customer order history
- `GET /api/orders/mine/:id` authenticated customer order details
- `GET /api/orders` admin only
- `PATCH /api/orders/:id` admin only
- `GET /api/orders/admin/analytics` admin only

Custom requests:

- `POST /api/orders/custom`
- `GET /api/orders/custom` admin only
- `PATCH /api/orders/custom/:id` admin only

## Build Check

Build the frontend:

```bash
npm.cmd run build --prefix client
```

Run backend syntax checks:

```bash
node server/src/server.js
```
