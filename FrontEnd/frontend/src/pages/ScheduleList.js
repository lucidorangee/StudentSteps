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

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error('Failed to post comment: ' + responseText); // Include responseText in the error for context
  }

  return session_id;
}

const ScheduleList = () => {
  //const [tutoringSessionData, setTutoringSessionData] = useState([]);
  

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(null);

  const [tempComments, setTempComments] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem('tempComments')) || {};
  } catch {
    return {}; // fallback to empty object if parsing fails
  }
});

  const { date } = useParams();
  const [filteredData, setFilteredData] = useState([]);

  const [alert, setAlert] = useState('');

  const timeSetting = {
    timeZone: "America/New_York", // Eastern Time zone
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true, // Use 12-hour format
  };

  const {
    data: tutoringSessionData,
    isLoading: tutoringSessionsLoading,
    error: tutoringSessionsError,
  } = useQuery({queryKey: ['tutoringSessions'], queryFn: () => fetchTutoringSessions()});

  const { mutate: submitComment, isLoading, isError, error } = useMutation({
    mutationFn: ({session_id, tutor_id, student_id, datetime, comment}) => postComment(session_id, tutor_id, student_id, datetime, comment),
    onSuccess: (session_id) => {
      console.log("Successfully posted");

      //delete from temp comments
      setTempComments((prevComments) => {
        const updatedComments = { ...prevComments };
    
        delete updatedComments[session_id];
    
        return updatedComments;
      });
      
      queryClient.invalidateQueries(['comments']);
    },
    onError: (error) => {
      console.log('Error posting comments:', error.message);
    }
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      localStorage.setItem('tempComments', JSON.stringify(tempComments));
    }, 500); // delay of 500ms
  
    return () => clearTimeout(handler); // cleanup on component unmount or tempComments change
  }, [tempComments]);

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

  const handleDateReset = (date) => {
    navigate(`/Schedule/List/`);
  };

  const handleCommentSubmit = (tutoringSession) => {
    const comment = tempComments[tutoringSession.session_id] || ''; // Get the value of the textarea

    // Validate if comment is empty or any other necessary validation
    if (comment !== '' && !comment.trim()) {
        setAlert('Please enter a comment.');
        return;
    }

    console.log(tutoringSession.session_datetime);
    submitComment({
      session_id: tutoringSession.session_id, 
      tutor_id: tutoringSession.tutor_id, 
      student_id: tutoringSession.student_id, 
      datetime: tutoringSession.session_datetime, 
      comment: comment
    });
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


      <div className="d-flex align-items-center gap-3">
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="yyyy/MM/dd"
          className="form-control w-auto"
          placeholderText="Select a date"
        />
        <FaCalendarAlt className="me-2 text-secondary" /> 
        <button type="button" className="btn btn-info px-4" onClick={handleDateReset}>Reset</button>
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
                      <h5 className="card-title">Date: {(new Intl.DateTimeFormat('en-US', timeSetting).format(new Date(tutoringSession.session_datetime)))}</h5>

                      <p className="card-text">{tutoringSession.notes}</p>

                      <div className="input-group mb-3">
                          <span className="input-group-text" id="comment-input-text">Comment: </span>
                          <textarea
                            className="form-control" aria-label="With textarea" rows="6"
                            value={tempComments[tutoringSession.session_id] || ''} // default to empty string if there's no comment yet
                            onChange={(e) => setTempComments({
                              ...tempComments,
                              [tutoringSession.session_id]: e.target.value
                            })}
                          />
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