import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './BookingPage.css';

function BookingPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    fetchMovieAndSeats();
  }, [movieId]);

  const fetchMovieAndSeats = async () => {
    try {
      const [movieRes, seatsRes] = await Promise.all([
        fetch(`/api/movies/${movieId}`),
        fetch(`/api/movies/${movieId}/seats`)
      ]);
      
      const movieData = await movieRes.json();
      const seatsData = await seatsRes.json();
      
      setMovie(movieData);
      setSeats(seatsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSeat = (seatNumber) => {
    const seat = seats.find(s => s.seat_number === seatNumber);
    if (seat.is_booked) return;

    setSelectedSeats(prev => {
      if (prev.includes(seatNumber)) {
        return prev.filter(s => s !== seatNumber);
      } else {
        return [...prev, seatNumber];
      }
    });
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }

    setBooking(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          movie_id: movieId,
          seats: selectedSeats,
          customer_name: customerName || 'Guest',
          customer_email: customerEmail
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        navigate(`/confirmation/${data.booking_id}`);
      } else {
        alert(data.error || 'Booking failed');
      }
    } catch (error) {
      console.error('Error booking:', error);
      alert('Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  const rows = {};
  seats.forEach(seat => {
    const row = seat.seat_number[0];
    if (!rows[row]) rows[row] = [];
    rows[row].push(seat);
  });

  const totalPrice = movie ? movie.price * selectedSeats.length : 0;

  return (
    <div className="container">
      <div className="booking-page">
        <div className="booking-header">
          <button className="back-button" onClick={() => navigate('/')}>
            ← Back
          </button>
          <h1>{movie?.title}</h1>
        </div>

        <div className="booking-content">
          <div className="seat-selection">
            <div className="screen">
              <div className="screen-label">SCREEN</div>
            </div>

            <div className="seats-container">
              {Object.keys(rows).sort().map(row => (
                <div key={row} className="seat-row">
                  <span className="row-label">{row}</span>
                  <div className="seats">
                    {rows[row].map(seat => (
                      <button
                        key={seat.id}
                        className={`seat ${seat.is_booked ? 'booked' : ''} ${selectedSeats.includes(seat.seat_number) ? 'selected' : ''}`}
                        onClick={() => toggleSeat(seat.seat_number)}
                        disabled={seat.is_booked}
                      >
                        {seat.seat_number}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="seat-legend">
              <div className="legend-item">
                <div className="seat available"></div>
                <span>Available</span>
              </div>
              <div className="legend-item">
                <div className="seat selected"></div>
                <span>Selected</span>
              </div>
              <div className="legend-item">
                <div className="seat booked"></div>
                <span>Booked</span>
              </div>
            </div>
          </div>

          <div className="booking-summary">
            <h2>Booking Summary</h2>
            
            <div className="summary-details">
              <div className="detail-row">
                <span>Movie:</span>
                <span>{movie?.title}</span>
              </div>
              <div className="detail-row">
                <span>Price per ticket:</span>
                <span>${movie?.price.toFixed(2)}</span>
              </div>
              <div className="detail-row">
                <span>Selected seats:</span>
                <span>{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</span>
              </div>
              <div className="detail-row total">
                <span>Total:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="customer-info">
              <input
                type="text"
                placeholder="Your Name (optional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="input-field"
              />
              <input
                type="email"
                placeholder="Your Email (optional)"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="input-field"
              />
            </div>

            <button 
              className="confirm-button"
              onClick={handleBooking}
              disabled={selectedSeats.length === 0 || booking}
            >
              {booking ? 'Processing...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;
