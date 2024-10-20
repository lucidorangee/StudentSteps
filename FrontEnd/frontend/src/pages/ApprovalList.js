import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { FaCalendarAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useQuery,  useQueryClient, useMutation } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';

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

const fetchTutors = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/tutors`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
  });

  if (!response.ok) {
    const err = new Error('Failed to fetch tutors');
    err.status = response.status;
    throw err;
  }
  return response.json();
};

const fetchAssessments = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/assessments/`, {
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

const fetchTutoringSessionDrafts = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/tutoringsessiondrafts/`, {
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

const postComment = async (session_id, tutor_id, student_id, datetime, stamps, comment, private_comment, homework_update, homework, assessments) => {
  const jsonfile = JSON.stringify({
    tutor_id: tutor_id,
    student_id: student_id,
    datetime: new Date(datetime).toISOString(), // Ensure datetime is correctly serialized
    stamps:stamps,
    comment: comment,
    private_comment: private_comment,
    homework_update: homework_update,
    homework: homework,
    assessments: assessments
  }) // Adjust according to your backend API
  console.log(jsonfile);

  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/comments/${session_id}`, {
    credentials: 'include',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: jsonfile,
  })

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error('Failed to post comment: ' + responseText); // Include responseText in the error for context
  }

  return session_id;
}

const ScheduleList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(null);
  const [expandedSessions, setExpandedSessions] = useState({});
  const { date } = useParams();
  const [filteredDataDrafts, setFilteredDataDrafts] = useState([]);
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

  const dateonlySetting = {
    timeZone: "America/New_York", // Eastern Time zone
    weekday: "long",
    month: "long",
    day: "numeric",
  };

  const timeonlySetting = {
    timeZone: "America/New_York", // Eastern Time zone
    hour: 'numeric',
    minute: 'numeric',
    hour12: true, // Use 12-hour format
  };

  const {
    data: tutoringSessionDraftData,
    isLoading: tutoringSessionDraftsLoading,
    error: tutoringSessionDraftsError,
  } = useQuery({queryKey: ['tutoringSessionDrafts'], queryFn: () => fetchTutoringSessionDrafts()});

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
    data: tutors,
    isLoading: tutorsLoading,
    error: tutorsError,
  } = useQuery({queryKey: ['tutors'], queryFn: () => fetchTutors()});

  const {
    data: comments,
    isLoading: commentsLoading,
    error: commentsError,
  } = useQuery({queryKey: ['comments'], queryFn: () => fetchComments()});
  

  const {
    data: assessments,
    isLoading: assessmentsLoading,
    error: assessmentsError,
  } = useQuery({queryKey: ['assessments'], queryFn: () => fetchAssessments()});

  useEffect(() => {
    if(tutoringSessionDraftData) setFilteredDataDrafts(tutoringSessionDraftData);
  }, [tutoringSessionDraftData]);

  if (tutorsLoading || assessmentsLoading || commentsLoading || studentsLoading || homeworkListLoading || tutoringSessionsLoading || tutoringSessionDraftsLoading) return <div>Loading...</div>;
  if (tutorsError || assessmentsError || commentsError || studentsError || homeworkListError || tutoringSessionsError || tutoringSessionDraftsError) {
    if(tutorsError?.status === 401 || assessmentsError?.status === 401 || commentsError?.status === 401 
      || studentsError?.status === 401 || homeworkListError?.status === 401 || tutoringSessionsError?.status === 401 || tutoringSessionDraftsError?.status === 401) //unauthorized
    {
      console.log("unathorized");
      //  ge.setItem('tempComments', JSON.stringify(tempComments));
      return <Navigate to="/login" />;
    }
    return <div>Error loading data</div>;
  }

  const temp = () => {
    return;
  };

  const toggleExpand = (index) => {
    setExpandedSessions((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="App">
      <h2>Welcome to ApprovalList.js!</h2>
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
          onChange={temp}
          dateFormat="yyyy/MM/dd"
          className="form-control w-auto"
          placeholderText="Select a date"
        />
        <FaCalendarAlt className="me-2 text-secondary" /> 
        <button type="button" className="btn btn-info px-4" onClick={temp}>Show All</button>
      </div>
      
      <div className="row justify-content-center">
        {Array.isArray(filteredDataDrafts) && filteredDataDrafts.length > 0 ? (
          filteredDataDrafts.map((tutoringSession, index) => {
            
            // Fetch the student data and homework list based on student_id
            const studentData = students.find(student => student.student_id === tutoringSession.student_id);
            const tutorData = tutors.find(tutor => tutor.tutor_id === tutoringSession.tutor_id);
            

            return (
              <div className="col-12 mt-3" key={index}>
                <div className="card">
                  <div className="card-body text-left">
                    
                    {/* Row 1: Tutor, Student Name, Grade */}
                    <div className="d-flex justify-content-between">
                      <h5 className="card-title">Tutor: {tutorData.first_name} {tutorData.last_name}</h5>
                      <h5 className="card-title">Student: {studentData?.first_name} {studentData?.last_name}</h5>
                      <h5 className="card-title">Grade: {studentData?.grade_level}</h5>
                      <div className="d-flex align-items-center">
                        <span className="me-2">Stamps:</span>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Enter stamps"
                          style={{ width: '80px' }}
                          value={tutoringSession.stamps} // Default to 0 if nonexistent
                          onChange={temp}
                        />
                      </div>
                    </div>

                    {/* Row 2: Date and Stamps */}
                    <div className="d-flex justify-content-between mt-3">
                      <h5 className="card-title">
                        Date: {`${new Intl.DateTimeFormat('en-US', datetimeSetting).format(tutoringSession.datetime)}`}
                      </h5>
                    </div>

                    {/* Row 3: Expandable Notes */}
                    <div
                      className={`border p-3 mt-3 ${expandedSessions[index] ? 'expanded' : ''}`}
                      style={{ cursor: 'pointer', borderRadius: '5px' }}
                      onMouseDown={(e) => e.preventDefault()} 
                      onClick={() => toggleExpand(index)}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <span>Details</span>
                        {expandedSessions[index] ? <BsChevronUp /> : <BsChevronDown />}
                      </div>

                      {expandedSessions[index] && (
                        <div className="mt-3">
                          <div className="mb-2">
                            <strong>Behavioural Goal</strong>
                            <div>{studentData?.behavioural_goal}</div>
                          </div>
                          <div className="mb-2">
                            <strong>Academic Goal</strong>
                            <div>{studentData?.academic_goal}</div>
                          </div>
                          <div className="mb-2">
                            <strong>Notes</strong>
                            <div>{tutoringSession.notes}</div>
                          </div>
                          <div>
                            <strong>Latest Comment</strong>
                            <div>latest comment goes here</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Homework Box */}
                    <div className="mt-4 border p-3 rounded">
                      <h6 className="text-muted">Homework:</h6>
                      
                      {/* Existing Homework Rows */}
                      {tutoringSession.homework_update.map((homework, hwIndex) => (
                        <div key={hwIndex} className="d-flex justify-content-between align-items-center mb-2">
                          <div>Subject: {homework.subject}</div>
                          <div>Due: {new Intl.DateTimeFormat('en-US', dateonlySetting).format(new Date(homework.due_date))}</div>
                          <div>Notes: {homework.notes}</div>
                          <div>Completedness: {homework.completedness}</div>
                        </div>
                      ))}

                      {/* New Homework Rows */}
                      {tutoringSession.homework.map((homework, hwIndex) => (
                        <div key={hwIndex} className="d-flex justify-content-between align-items-center mb-2">
                          <div>Subject: {homework.subject}</div>
                          <div>Due: {new Intl.DateTimeFormat('en-US', dateonlySetting).format(new Date(homework.due_date))}</div>
                          <div>Notes: {homework.notes}</div>
                        </div>
                      ))}

                      {/* New Assessments Rows */}
                      {tutoringSession.assessments.map((assessment, asmtIndex) => (
                        <div key={asmtIndex} className="d-flex justify-content-between align-items-center mb-2">
                          <div>Subject: {assessment.title}</div>
                          <div>Due: {new Intl.DateTimeFormat('en-US', dateonlySetting).format(new Date(assessment.date))}</div>
                          <div>Notes: {assessment.description}</div>
                        </div>
                      ))}
                    
                    </div>

                    

                    {/* Row 5: Comment Area and Submit Button */}
                    <div className="mt-4">
                      <div className="input-group mb-3">
                        <span className="input-group-text">Public Comment:</span>
                        <textarea
                          className="form-control"
                          aria-label="With textarea"
                          rows="3"
                          value={tutoringSession.comment.public_comment || ''}
                          onChange={temp}
                        />
                      </div>
                      <div className="input-group mb-3">
                        <span className="input-group-text">Private Comment:</span>
                        <textarea
                          className="form-control"
                          aria-label="With textarea"
                          rows="3"
                          value={tutoringSession.comment.private_comment || ''}
                          onChange={temp}
                        />
                      </div>
                      <button
                        className="btn btn-primary"
                        onClick={temp}
                      >
                        Approve Session
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            );
            
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