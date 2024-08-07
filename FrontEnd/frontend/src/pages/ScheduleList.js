import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { FaCalendarAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const ScheduleList = () => {
  const [authenticated, setAuthenticated] = useState(true);
  const [tutoringSessionData, setTutoringSessionData] = useState(null);
  
  const { date } = useParams();
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/tutoringsessions`, {
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        setTutoringSessionData(data);
      })
      .catch(error => {
        console.error('Error fetching session data: ', error);
      })
  }, []);

  useEffect(() => {
    if (tutoringSessionData && Array.isArray(tutoringSessionData)) {
      if (date) {
        const filteredSessions = tutoringSessionData.filter(session =>
          session.session_datetime.startsWith(date)
        );
        setFilteredData(filteredSessions);
      } else {
        setFilteredData(tutoringSessionData);
      }
    } else {
      setFilteredData([]);
    }
  }, [date, tutoringSessionData]);

  return (
    <div>
      {authenticated ? (
        <AuthenticatedOptions tutoringSessionData={filteredData} />
      ) : (
        <UnauthenticatedOptions />
      )}
    </div>
  );
};

const AuthenticatedOptions = (tutoringSessionData) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    navigate(`/Schedule/List/${formattedDate}`);
  };

  const handleCommentSubmit = (tutoringSession) => {
    const comment = document.querySelector('textarea').value; // Get the value of the textarea

    // Validate if comment is empty or any other necessary validation
    if (!comment.trim()) {
        alert('Please enter a comment.');
        return;
    }

    fetch(`${process.env.REACT_APP_API_BASE_URL}/comments/${tutoringSession.session_id}`, {
      credentials: 'include',
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          tutor_id: tutoringSession.tutor_id,
          student_id: tutoringSession.student_id,
          datetime: new Date(tutoringSession.session_datetime).toISOString(), // Ensure datetime is correctly serialized
          content: comment,
          type: 'public'
      }), // Adjust according to your backend API
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        return response.text();
    })
    .then(data => {
        // Handle success response from the server if needed
        console.log('Comment submitted successfully', data);
    
        // Refresh after successful submission
        window.location.reload();
    })
    .catch(error => {
        // Handle errors
        console.error('Error submitting comment:', error);
        // Optionally, show an error message to the user
        alert('Failed to submit comment. Please try again later.');
    });
  }

  return (
    <div className="App">
      <h2>Welcome to ScheduleList.js!</h2>
      <div className="d-flex align-items-center">
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="yyyy/MM/dd"
          className="form-control"
          placeholderText="Select a date"
        />
        <FaCalendarAlt className="ms-2 text-secondary" />
      </div>
      <div className="row">
        {Array.isArray(tutoringSessionData.tutoringSessionData) && tutoringSessionData.tutoringSessionData.length > 0 ? (
            tutoringSessionData.tutoringSessionData.map((tutoringSession, index) => {
            if (!tutoringSession.complete) {
              return (
                <div className="row mt-3" key={index}>
                  <div className="card" style={{ width: '95%' }}>
                    <div className="card-body text-left">
                      <h5 className="card-title">{tutoringSession.student_name}</h5>
                      <h5 className="card-title">Date: {tutoringSession.session_datetime.substring(0, 10)}</h5>

                      <p className="card-text">{tutoringSession.notes}</p>

                      <div className="input-group mb-3">
                          <span className="input-group-text" id="comment-input-text">Comment: </span>
                          <textarea className="form-control" aria-label="With textarea" rows="6"></textarea>
                      </div>

                      <button className="btn btn-primary" onClick={() => handleCommentSubmit(tutoringSession)}>Submit Comment</button>
                    </div>
                  </div>
                </div>
              );
            }
          })
          ) : (
          <tr>
            <td colSpan="6">No data available</td>
          </tr>
        )}
      </div>
    </div>
    
  );
};

const UnauthenticatedOptions = () => {
  
  return (
    <div>
      <h2>Please Log In</h2>
    </div>
  );
};

export default ScheduleList;