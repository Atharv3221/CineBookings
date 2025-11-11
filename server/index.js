const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

let db;
const dbPath = path.join(__dirname, '../cinema.db');

async function initializeDatabase() {
  const SQL = await initSqlJs();
  
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      image TEXT,
      price REAL NOT NULL,
      description TEXT,
      duration TEXT
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movie_id INTEGER NOT NULL,
      seats TEXT NOT NULL,
      customer_name TEXT,
      customer_email TEXT,
      total_price REAL NOT NULL,
      booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (movie_id) REFERENCES movies (id)
    );

    CREATE TABLE IF NOT EXISTS seats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movie_id INTEGER NOT NULL,
      seat_number TEXT NOT NULL,
      is_booked INTEGER DEFAULT 0,
      FOREIGN KEY (movie_id) REFERENCES movies (id),
      UNIQUE(movie_id, seat_number)
    );
  `);

  const moviesCount = db.exec('SELECT COUNT(*) as count FROM movies');
  if (!moviesCount.length || moviesCount[0].values[0][0] === 0) {
    const movies = [
      ['The Dark Knight', '/images/The_Dark_Knight_poster_7a6cd56a.png', 1079, 'When the menace known as the Joker wreaks havoc on Gotham', '2h 32min'],
      ['Inception', '/images/Inception_poster_d0098617.png', 1244, 'A thief who steals corporate secrets through dream-sharing technology', '2h 28min'],
      ['Interstellar', '/images/Interstellar_poster_d75fd98b.png', 1161, 'A team of explorers travel through a wormhole in space', '2h 49min'],
      ['The Matrix', '/images/The_Matrix_poster_634ab313.png', 995, 'A computer hacker learns about the true nature of reality', '2h 16min'],
      ['Avengers: Endgame', '/images/Avengers_Endgame_poster_1113e999.png', 1327, 'The Avengers assemble once more to reverse Thanos\' actions', '3h 1min'],
      ['Parasite', '/images/Parasite_poster_b4f60cf4.png', 1079, 'Greed and class discrimination threaten a new family bond', '2h 12min']
    ];

    movies.forEach(movie => {
      db.run('INSERT INTO movies (title, image, price, description, duration) VALUES (?, ?, ?, ?, ?)', movie);
      const result = db.exec('SELECT last_insert_rowid()');
      const movieId = result[0].values[0][0];

      const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
      const seatsPerRow = 8;

      for (let row of rows) {
        for (let num = 1; num <= seatsPerRow; num++) {
          db.run('INSERT INTO seats (movie_id, seat_number, is_booked) VALUES (?, ?, 0)', [movieId, `${row}${num}`]);
        }
      }
    });
    
    saveDatabase();
    console.log('Sample movies and seats initialized');
  }
}

function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

app.get('/api/movies', (req, res) => {
  try {
    const result = db.exec('SELECT * FROM movies');
    if (!result.length) {
      return res.json([]);
    }
    const movies = result[0].values.map(row => ({
      id: row[0],
      title: row[1],
      image: row[2],
      price: row[3],
      description: row[4],
      duration: row[5]
    }));
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/movies/:id', (req, res) => {
  try {
    const result = db.exec('SELECT * FROM movies WHERE id = ?', [req.params.id]);
    if (!result.length || !result[0].values.length) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    const row = result[0].values[0];
    const movie = {
      id: row[0],
      title: row[1],
      image: row[2],
      price: row[3],
      description: row[4],
      duration: row[5]
    };
    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/movies/:id/seats', (req, res) => {
  try {
    const result = db.exec('SELECT * FROM seats WHERE movie_id = ?', [req.params.id]);
    if (!result.length) {
      return res.json([]);
    }
    const seats = result[0].values.map(row => ({
      id: row[0],
      movie_id: row[1],
      seat_number: row[2],
      is_booked: row[3]
    }));
    res.json(seats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bookings', (req, res) => {
  try {
    const { movie_id, seats, customer_name, customer_email } = req.body;

    if (!movie_id || !seats || seats.length === 0) {
      return res.status(400).json({ error: 'Invalid booking data' });
    }

    const movieResult = db.exec('SELECT * FROM movies WHERE id = ?', [movie_id]);
    if (!movieResult.length || !movieResult[0].values.length) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    const movieRow = movieResult[0].values[0];
    const movie = {
      id: movieRow[0],
      title: movieRow[1],
      image: movieRow[2],
      price: movieRow[3],
      description: movieRow[4],
      duration: movieRow[5]
    };

    for (let seat of seats) {
      const seatResult = db.exec('SELECT * FROM seats WHERE movie_id = ? AND seat_number = ? AND is_booked = 0', [movie_id, seat]);
      if (!seatResult.length || !seatResult[0].values.length) {
        return res.status(400).json({ error: `Seat ${seat} is not available` });
      }
    }

    const total_price = movie.price * seats.length;

    db.run(
      'INSERT INTO bookings (movie_id, seats, customer_name, customer_email, total_price) VALUES (?, ?, ?, ?, ?)',
      [movie_id, seats.join(','), customer_name || 'Guest', customer_email || '', total_price]
    );

    const bookingIdResult = db.exec('SELECT last_insert_rowid()');
    const booking_id = bookingIdResult[0].values[0][0];

    for (let seat of seats) {
      db.run('UPDATE seats SET is_booked = 1 WHERE movie_id = ? AND seat_number = ?', [movie_id, seat]);
    }

    saveDatabase();

    res.json({
      booking_id,
      movie: movie.title,
      seats,
      total_price,
      message: 'Booking successful!'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/bookings/:id', (req, res) => {
  try {
    const result = db.exec(
      `SELECT b.*, m.title as movie_title, m.image as movie_image
       FROM bookings b
       JOIN movies m ON b.movie_id = m.id
       WHERE b.id = ?`,
      [req.params.id]
    );

    if (!result.length || !result[0].values.length) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const row = result[0].values[0];
    const booking = {
      id: row[0],
      movie_id: row[1],
      seats: row[2].split(','),
      customer_name: row[3],
      customer_email: row[4],
      total_price: row[5],
      booking_date: row[6],
      movie_title: row[7],
      movie_image: row[8]
    };

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

initializeDatabase().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CineAI server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
