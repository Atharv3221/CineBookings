# Nightmare Studioz - Movie Booking Platform

## Overview
Nightmare Studioz is a modern cinema booking application built with React (Vite) frontend and Express backend. Users can browse movies, select seats, and book tickets with a beautiful, responsive interface.

## Recent Changes (November 11, 2025)
- **Migrated from Vercel to Replit**: Adapted configuration for Replit environment
- **AI-Generated Movie Posters**: Added custom AI-generated poster images for all 6 movies
- **Currency Update**: Converted all prices from USD to Indian Rupees (₹)
- **Day/Night Mode**: Fully functional theme toggle with moon/sun icon in navbar
- **Port Configuration**: Updated server to run on port 5000 for Replit compatibility

## Project Architecture

### Frontend (Client)
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM v6
- **Styling**: CSS with CSS Variables for theming
- **Build Output**: `client/dist/`
- **Dev Server**: Port 5000 (configured for Replit)

### Backend (Server)
- **Framework**: Express.js
- **Database**: SQLite (sql.js) - file-based at `cinema.db`
- **Port**: 5000 (serves both API and static files)
- **Static Files**: Serves built React app from `client/dist/`

### Key Features
1. **Movie Browsing**: Grid view of available movies with AI-generated posters
2. **Seat Selection**: Interactive seat map (rows A-F, 8 seats per row)
3. **Booking System**: Real-time seat availability and booking confirmation
4. **Theme Toggle**: Light/Dark mode with persistent localStorage
5. **Indian Pricing**: All prices displayed in ₹ (Rupees)

### Movie Data
The application includes 6 popular movies:
- The Dark Knight (₹1079)
- Inception (₹1244)
- Interstellar (₹1161)
- The Matrix (₹995)
- Avengers: Endgame (₹1327)
- Parasite (₹1079)

### Database Schema
- **movies**: id, title, image, price, description, duration
- **seats**: id, movie_id, seat_number, is_booked
- **bookings**: id, movie_id, seats, customer_name, customer_email, total_price, booking_date

## Development

### Running Locally
The application runs automatically via the "CineAI Server" workflow which:
1. Starts Express server on port 5000
2. Serves the built React app
3. Provides API endpoints at `/api/*`

### Building
```bash
cd client && npm run build
```

### File Structure
```
.
├── client/
│   ├── src/
│   │   ├── components/    (Navbar)
│   │   ├── pages/         (MovieList, BookingPage, ConfirmationPage)
│   │   ├── App.jsx
│   │   └── index.css
│   ├── public/
│   │   └── images/        (AI-generated movie posters)
│   └── dist/              (Build output)
├── server/
│   └── index.js           (Express server + SQLite logic)
└── cinema.db              (SQLite database file)
```

## API Endpoints
- `GET /api/movies` - List all movies
- `GET /api/movies/:id` - Get movie details
- `GET /api/movies/:id/seats` - Get seat availability
- `POST /api/bookings` - Create a booking
- `GET /api/bookings/:id` - Get booking details

## User Preferences
- Project successfully migrated from Vercel to Replit
- Prices displayed in Indian Rupees (₹)
- AI-generated images for authentic movie posters
- Clean, modern UI with dark mode support
