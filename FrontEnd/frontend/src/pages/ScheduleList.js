import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { FaCalendarAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useQuery,  useQueryClient, useMutation } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';

const fetchTutoringSessions = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/tutoringsessions`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
  });

  if (!response.ok) {
    const err = new Error('Failed to fetch tutoring sessions');
    err.status = response.status;
    throw err;
  }
  return response.json();
}

const postComment = async (session_id, tutor_id, student_id, datetime, comment) => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/comments/${session_id}`, {
    credentials: 'include',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        tutor_id: tutor_id,
        student_id: student_id,
        datetime: new Date(datetime).toISOString(), // Ensure datetime is correctly serialized
        content: comment,
        type: 'public'
    }), // Adjust according to your backend API
  })
}

const ScheduleList = () => {
  //const [tutoringSessionData, setTutoringSessionData] = useState([]);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(null);
  
  const { date } = useParams();
  const [filteredData, setFilteredData] = useState([]);

  const [alert, setAlert] = useState('');

  const {
    data: tutoringSessionData,
    isLoading: tutoringSessionsLoading,
    error: tutoringSessionsError,
  } = useQuery({queryKey: ['tutoringSessions'], queryFn: () => fetchTutoringSessions()});

  const { mutate: submitComment, isLoading, isError, error } = useMutation({
    mutationFn: (session_id, tutor_id, student_id, datetime, comment) => postComment(session_id, tutor_id, student_id, datetime, comment),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments']);
      console.log("Successfully posted");
    },
    onError: (error) => {
      console.log('Error posting comments:', error.message);
    }
  });

  useEffect(() => {
    if (tutoringSessionData && Array.isArray(tutoringSessionData)) {
      if (date) {
        const filteredSessions = tutoringSessionData.filter(session =>
          session.session_datetime.startsWith(date)
        );
        setFilteredData(filteredSessions);
        console.log(filteredSessions);
      } else {
        setFilteredData(tutoringSessionData);
      }
    } else {
      setFilteredData([]);
    }
  }, [date, tutoringSessionData]);

  if (tutoringSessionsLoading) return <div>Loading...</div>;
  if (tutoringSessionsError) {
    if(tutoringSessionsError?.status === 401) //unauthorized
    {
      console.log("unathorized");
      return <Navigate to="/login" />;
    }
    return <div>Error loading data</div>;
  }

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
    if (!comment) {
      return;
    }

    // Validate if comment is empty or any other necessary validation
    if (!comment.trim()) {
        setAlert('Please enter a comment.');
        return;
    }

    submitComment(tutoringSession.tutor_id, tutoringSession.student_id, tutoringSession.session_datetime, comment);
/*
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
    });*/
  }

  return (
    <div className="App">
      <h2>Welcome to ScheduleList.js!</h2>
      {alert ? (
        <div>
          <div class="alert alert-danger" role="alert">
            {alert}
          </div>
        </div>
      ) : (
        <div></div>
      )}
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
        {Array.isArray(filteredData) && filteredData.length > 0 ? (
          filteredData.map((tutoringSession, index) => {
            if (!tutoringSession.complete) {
              return (
                <div className="row ml-3 mt-3" key={index}>
                  <div className="card" style={{ width: '95%' }}>
                    <div className="card-body text-left">
                      <h5 className="card-title">Tutor: {tutoringSession.tutor_name}</h5>
                      <h5 className="card-title">Student: {tutoringSession.student_name}</h5>
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

export default ScheduleList;