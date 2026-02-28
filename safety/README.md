# Women Safety Emergency Alert System

A basic full-stack web application that allows women to quickly trigger an emergency alert. When **Emergency Mode** is ON and the user double-presses the `P` key, the app:

- Reads current GPS location using the browser Geolocation API.
- Generates a Google Maps link from latitude and longitude.
- Sends an emergency SMS to the registered father mobile number (and optional extra contacts) using the **Twilio** API.

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (no framework, responsive design).
- **Backend**: Node.js, Express.
- **Database**: MongoDB + Mongoose.
- **Auth**: JWT (JSON Web Token).
- **SMS**: Twilio API.
- **Location**: Browser Geolocation API.

## Folder Structure

```text
safety/
  client/
    dashboard.html
    login.html
    register.html
    styles.css
  server/
    index.js
    middleware/
      authMiddleware.js
  models/
    User.js
  controllers/
    authController.js
    emergencyController.js
  routes/
    authRoutes.js
    emergencyRoutes.js
  .env.example
  package.json
  README.md
```

## Features

- **User Registration**
  - Fields: Name, Mobile Number, Father’s Name, Father’s Mobile Number, Password.
  - Passwords are hashed with **bcrypt** before saving to MongoDB.
  - Duplicate registration by mobile number is prevented.

- **User Login**
  - Login with mobile number and password.
  - On success, backend returns a JWT; frontend stores it in `localStorage`.

- **Protected Dashboard (Emergency Page)**
  - Route guarded on the client by checking JWT presence.
  - Backend protects emergency endpoints with JWT middleware.
  - Shows logged-in user name and emergency status (ACTIVE / INACTIVE).
  - "Emergency Mode ON" toggle that turns on/off the emergency listener.

- **Emergency Trigger Logic**
  - When Emergency Mode is ON, a **double press of the `P` key** triggers the flow.
  - Browser Geolocation API is used to get `latitude` and `longitude`.
  - A Google Maps link is generated: `https://www.google.com/maps?q=lat,lng`.
  - Backend sends SMS using Twilio to:
    - Father’s mobile number.
    - Optional additional emergency contacts stored in the user document.

- **SMS Text Format**

  ```text
  EMERGENCY ALERT!
  Your daughter [Name] may be in danger.
  Location: [Google Maps Link]
  Please contact immediately.
  ```

- **Extra Features**
  - Logout button (clears token and redirects to login).
  - Basic endpoint to add extra emergency contacts (simple JSON-based API).
  - Simple error messages and network error handling on the frontend.

## Setup Instructions

### 1. Prerequisites

- Node.js (LTS recommended)
- MongoDB running locally or a MongoDB URI (e.g. MongoDB Atlas)
- A Twilio account with:
  - Account SID
  - Auth Token
  - A verified phone number that can send SMS

### 2. Install Dependencies

In the project root (`safety/`):

```bash
npm install
```

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set correct values:

   - `MONGODB_URI` – your Mongo connection string.
   - `JWT_SECRET` – any strong random string.
   - `PORT` – backend port (default is `5000`).
   - `TWILIO_ACCOUNT_SID` – from your Twilio console.
   - `TWILIO_AUTH_TOKEN` – from your Twilio console.
   - `TWILIO_PHONE_NUMBER` – Twilio phone number in E.164 format (e.g. `+1234567890`).
   - `CLIENT_URL` – base URL for your client (e.g. `http://localhost:5500`).

> Note: Never commit the real `.env` file to version control.

### 4. Start the Backend Server

From the project root:

```bash
npm run dev
```

This uses `nodemon` to start `server/index.js` and reload on changes.

The backend will listen on `http://localhost:5000` by default.

### 5. Serve the Frontend

You can use any static file server for `client/`. Two simple options:

- Use the VS Code Live Server extension on the `client` folder, or
- Use a simple static server from Node, for example:

  ```bash
  npx serve client
  ```

This typically runs at `http://localhost:3000` or `http://localhost:5500`. Make sure the URL matches `CLIENT_URL` in your `.env`.

### 6. Test the Flow

1. Open the frontend URL in your browser (e.g. `http://localhost:5500/client/register.html`).
2. **Register** a new user with:
   - Name, Mobile number, Father’s name, Father’s number, Password (≥ 6 chars).
3. After successful registration, you will be redirected to **login**.
4. **Login** with your mobile number and password.
5. You will be redirected to the **dashboard**.
6. Turn **Emergency Mode** ON using the toggle.
7. Allow location permission in your browser when prompted.
8. Quickly press the `P` key **twice** to trigger the emergency.
9. If Twilio is configured correctly, SMS messages are sent to the saved contacts.

### 7. Security Notes

- Passwords are never stored in plain text; bcrypt hashing is used.
- JWT is used to protect backend routes (`/api/auth/me`, `/api/emergency/trigger`, `/api/auth/contacts`).
- Basic validation is performed on all critical inputs (presence checks, password length, duplicate user detection by phone number).
- Tokens are stored on the client using `localStorage` for simplicity. For production, consider more advanced options (e.g. HttpOnly cookies).

### 8. API Overview

- `POST /api/auth/register`
  - Body: `{ name, phone, fatherName, fatherPhone, password }`
  - Response: success message or error.

- `POST /api/auth/login`
  - Body: `{ phone, password }`
  - Response: `{ token, user }`.

- `GET /api/auth/me`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ user }` (without password hash).

- `POST /api/auth/contacts`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ name, phone }`
  - Response: updated contact list.

- `POST /api/emergency/trigger`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ latitude, longitude, mapsLink }`
  - Action: sends Twilio SMS to father + contacts.

## Next Steps / Possible Enhancements

- Dedicated UI to manage multiple emergency contacts (add/remove/update).
- Use HTTPS and secure cookies.
- Add rate limiting to emergency trigger endpoint to prevent abuse.
- Add email notifications in addition to SMS.
- Add audit log of emergency events per user.
