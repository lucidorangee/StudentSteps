import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { FaCalendarAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useQuery,  useQueryClient, useMutation } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';

const fetchComments = async() => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/comments`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const err = new Error('Failed to fetch comments');
    err.status = response.status;
    throw err;
  }

  console.log("successfully fetched comments");
  return response.json();
}

const fetchHomework = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/homework`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch homework');
  }
  return response.json();
};

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

const fetchStudents = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/students/`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
  });

  if (!response.ok) {
    const err = new Error('Failed to fetch students');
    err.status = response.status;
    throw err;
  }
  return response.json();
};


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

  const datetimeSetting = {
    timeZone: "America/New_York", // Eastern Time zone
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: 'numeric',
    minute: 'numeric',
    hour12: true, // Use 12-hour format
  };

  const timeonlySetting = {
    timeZone: "America/New_York", // Eastern Time zone
    hour: 'numeric',
    minute: 'numeric',
    hour12: true, // Use 12-hour format
  };

  const {
    data: tutoringSessionData,
    isLoading: tutoringSessionsLoading,
    error: tutoringSessionsError,
  } = useQuery({queryKey: ['tutoringSessions'], queryFn: () => fetchTutoringSessions()});

  const {
    data: homeworkList,
    isLoading: homeworkListLoading,
    error: homeworkListError,
  } = useQuery({queryKey: ['homework'], queryFn: () => fetchHomework()});

  const {
    data: students,
    isLoading: studentsLoading,
    error: studentsError,
  } = useQuery({queryKey: ['students'], queryFn: () => fetchStudents()});

  const {
    data: comments,
    isLoading: commentsLoading,
    error: commentsError,
  } = useQuery({queryKey: ['users'], queryFn: () => fetchComments()});

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

  if (commentsLoading || studentsLoading || homeworkListLoading || tutoringSessionsLoading) return <div>Loading...</div>;
  if (commentsError || studentsError || homeworkListError || tutoringSessionsError) {
    if(commentsError?.status === 401 || studentsError?.status === 401 || homeworkListError?.status === 401 || tutoringSessionsError?.status === 401) //unauthorized
    {
      console.log("unathorized");
      localStorage.setItem('tempComments', JSON.stringify(tempComments));
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
      
      <div className="row justify-content-center">
        {Array.isArray(filteredData) && filteredData.length > 0 ? (
          filteredData.map((tutoringSession, index) => {
            if (!tutoringSession.complete) {
              const sessionDateTime = new Date(tutoringSession.session_datetime);
              const endDateTime = new Date(sessionDateTime.getTime() + tutoringSession.duration * 60000);
              
              // Fetch the student data and homework list based on student_id
              const studentData = students.find(student => student.student_id === tutoringSession.student_id);
              const studentHomeworkList = homeworkList.filter(homework => homework.student_id === tutoringSession.student_id);
              const latestComment = comments
                .filter(comment => comment.student_id === tutoringSession.student_id)
                .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))[0];
              const [isExpanded, setIsExpanded] = useState(false);

              return (
                <div className="col-12 mt-3" key={index}>
                  <div className="card">
                    <div className="card-body text-left">
                      
                      {/* Row 1: Tutor, Student Name, Grade */}
                      <div className="d-flex justify-content-between">
                        <h5 className="card-title">Tutor: {tutoringSession.tutor_name}</h5>
                        <h5 className="card-title">Student: {studentData?.first_name} {studentData?.last_name}</h5>
                        <h5 className="card-title">Grade: {studentData?.grade_level}</h5>
                      </div>

                      {/* Row 2: Date and Stamps */}
                      <div className="d-flex justify-content-between mt-3">
                        <h5 className="card-title">
                          Date: {`${new Intl.DateTimeFormat('en-US', datetimeSetting).format(sessionDateTime)} ~ ${new Intl.DateTimeFormat('en-US', timeonlySetting).format(endDateTime)}`}
                        </h5>
                        <div className="d-flex align-items-center">
                          <span className="me-2">Stamps:</span>
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Enter stamps"
                            style={{ width: '80px' }}
                          />
                        </div>
                      </div>

                      {/* Row 3: Notes */}
                      <button
                        className="btn btn-link mt-3 p-0"
                        onClick={() => setIsExpanded(!isExpanded)}
                      >
                        {isExpanded ? 'Hide Details' : 'Show Details'}
                      </button>

                      {/* Foldable Section for Goals and Notes */}
                      {isExpanded && (
                        <div className="collapse-content mt-3">
                          <div className="d-flex justify-content-between">
                            <div>Behavioral Goal: {studentData?.behavioural_goal}</div>
                            <div>Academic Goal: {studentData?.academic_goal}</div>
                          </div>
                          <p className="card-text mt-2">Notes: {tutoringSession.notes}</p>
                          {(latestComment?.content)?<p className="card-text">Latest Comment: {latestComment?.content || "No comments available"}</p>:<div></div>}
                        </div>
                      )}

                      {/* Homework Rows */}
                      <div className="mt-4">
                        <h6 className="text-muted">Homework:</h6>
                        {studentHomeworkList.map((homework, hwIndex) => (
                          <div key={hwIndex} className="d-flex justify-content-between align-items-center mb-2 p-2 border">
                            <div>Subject: {homework.subject}</div>
                            <div>Due: {new Intl.DateTimeFormat('en-US', datetimeSetting).format(new Date(homework.due_date))}</div>
                            <div>Notes: {homework.notes}</div>
                            <input
                              type="number"
                              className="form-control"
                              placeholder="0-9"
                              min="0"
                              max="9"
                              style={{ width: '60px' }}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Row 5: Comment Area and Submit Button */}
                      <div className="mt-4">
                        <div className="input-group mb-3">
                          <span className="input-group-text">Comment:</span>
                          <textarea
                            className="form-control"
                            aria-label="With textarea"
                            rows="3"
                            value={tempComments[tutoringSession.session_id] || ''}
                            onChange={(e) => setTempComments({
                              ...tempComments,
                              [tutoringSession.session_id]: e.target.value
                            })}
                          />
                        </div>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleCommentSubmit(tutoringSession)}
                        >
                          Submit Comment
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              );
            }
          })
        ) : (
          <div className="col">
            <p>No data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleList;