import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { FaCalendarAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useQuery,  useQueryClient, useMutation } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';
import Select from 'react-select';

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


const postComment = async (session_id, jsonfile) => {

  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/tutoringsessiondrafts/${session_id}`, {
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
  const [filteredData, setFilteredData] = useState([]);
  const [alert, setAlert] = useState('');

  const [studentOptions, setStudentOptions] = useState([]);
  const [selectedStudentID, setSelectedStudentID] = useState(-1);
  const [tutorOptions, setTutorOptions] = useState([]);
  const [selectedTutorID, setSelectedTutorID] = useState(-1);

  /**
   * comment (text)
      private_comment (text)
      stamps (integer between 0 and 20, both inclusive)
      new_homework (list of [subject, due_date, notes] as we have right now)
      prev_homework (list of [homework_id, is_completed])
      update_assessments (list of [assessment_id, date, notes])
      new_assessments (list of [title, date, description]) 
   */
  const [tempComments, setTempComments] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tempComments')) || {};
    } catch {
      return {};
    }
  });


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

  const { mutate: submitComment, isLoading, isError, error } = useMutation({
    mutationFn: ({session_id, jsonfile}) => postComment(session_id, jsonfile),
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
      console.log('tempComments');
      console.log(JSON.stringify(tempComments));
    }, 500); // delay of 500ms
  
    return () => clearTimeout(handler); // cleanup on component unmount or tempComments change
  }, [tempComments]);

  useEffect(() => {
    if (tutoringSessionData && Array.isArray(tutoringSessionData)) {

      Object.keys(tempComments).forEach(key => {
        const session = tutoringSessionData.find(session => String(session.session_id) === String(key));
        console.log(`session is ${session}`);
      
        // Delete if session exists and is completed, or if session doesn't exist
        if (!session || (session && session.completed === true)) {
          delete tempComments[key];
        }
      });

      const filteredSessions = tutoringSessionData.filter((session) => {
        const tutorFilter = selectedTutorID === -1 || selectedTutorID === session.tutor_id;
        const studentFilter = selectedStudentID === -1 || selectedStudentID === session.student_id;
        const dateFilter = !date || session.session_datetime.startsWith(date);

        return tutorFilter && studentFilter && dateFilter;
      })

      setFilteredData(filteredSessions.sort((a, b) => new Date(b.datetime) - new Date(a.datetime)))
    } else {
      setFilteredData([]);
    }
  }, [date, tutoringSessionData, selectedTutorID, selectedStudentID]);

  useEffect(() => {
    if(tutors)
    {
      const tutorOptions = [
        { value: -1, label: 'No Filter' },
        ...tutors.map(tutor => ({
          value: tutor.tutor_id,
          label: `${tutor.first_name} (ID: ${tutor.tutor_id})`,
        }))
      ];
      setTutorOptions(tutorOptions);
      setSelectedTutorID(-1);
    }
  }, [tutors]);

  useEffect(() => {
    if(students){
      const options = [
        { value: -1, label: 'No Filter' },
        ...students.map(student => ({
          value: student.student_id,
          label: `${student.first_name} (ID: ${student.student_id})`,
        }))
      ];
      setStudentOptions(options);
      setSelectedStudentID(-1);
    }
  }, [students]);

  if (assessmentsLoading || commentsLoading || studentsLoading || tutorsLoading || homeworkListLoading || tutoringSessionsLoading) return <div>Loading...</div>;
  if (assessmentsError || commentsError || studentsError || tutorsError || homeworkListError || tutoringSessionsError) {
    if(assessmentsError?.status === 401 || commentsError?.status === 401 || studentsError?.status === 401 || tutorsError?.status === 401 || homeworkListError?.status === 401 || tutoringSessionsError?.status === 401) //unauthorized
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

  const handleDateReset = () => {
    navigate(`/Schedule/List/`);
  };

  const handleCommentSubmit = (tutoringSession) => {
    const comment = tempComments[tutoringSession.session_id]?.comment.trim() || '';
    const private_comment = tempComments[tutoringSession.session_id]?.private_comment || '';
    const stamps = tempComments[tutoringSession.session_id]?.stamps || 0;
    const new_homework = tempComments[tutoringSession.session_id]?.new_homework?.filter(hmwk => {
      return !(hmwk.subject === '' && hmwk.due_date === '' && hmwk.notes === '');
    }) || [];
    const prev_homework = tempComments[tutoringSession.session_id]?.prev_homework || [];
    const new_assessments = tempComments[tutoringSession.session_id]?.new_assessments?.filter(asmt => {
      return !(asmt.title === '' && asmt.date === '' && asmt.description === '');
    }) || [];
    const prev_assessments = tempComments[tutoringSession.session_id]?.prev_assessments || [];

    if(stamps > 20)
    {
      setAlert("No more than 20 stamps can be given every session");
      return;
    }

    // Validate if comment is empty or any other necessary validation
    if (comment === '') {
        setAlert('Please enter a comment.');
        return;
    }

    if (comment === 'noshow') {
      setAlert('Please use the noshow button for noshows.\n(This is to invalidate all other fields)');
      return;
  }

    for(const hmwk of new_homework)
    {
      if(hmwk['subject'] === '' || hmwk['due_date'] === '')
      {
        setAlert("Please fill in all the information for non-empty homework rows");
        return;
      }
    }

    for(const asmt of new_assessments)
    {
      if(asmt['subject'] === '' || asmt['due_date'] === '')
      {
        setAlert("Please fill in name and due date of new assessments");
        return;
      }
    }

    setAlert(''); // Show there is nothing to alert

    const comments = { public_comment: comment, private_comment: private_comment };

    const jsonfile = JSON.stringify({
      tutor_id: tutoringSession.tutor_id, 
      student_id: tutoringSession.student_id, 
      datetime: new Date(tutoringSession.session_datetime).toISOString(), 
      stamps: stamps,
      comments: JSON.stringify(comments),
      prev_homework: JSON.stringify(prev_homework),
      new_homework: JSON.stringify(new_homework),
      prev_assessments : JSON.stringify(prev_assessments),
      new_assessments: JSON.stringify(new_assessments)
    });

    submitComment({
      session_id: tutoringSession.session_id, 
      jsonfile
    });
  }

  const handleSubmitNoshow = (tutoringSession) => {
    setAlert(''); // Show there is nothing to alert

    const comments = { public_comment: 'noshow', private_comment: '' };

    const jsonfile = JSON.stringify({
      tutor_id: tutoringSession.tutor_id, 
      student_id: tutoringSession.student_id, 
      datetime: new Date(tutoringSession.session_datetime).toISOString(), 
      stamps: 0,
      comments: JSON.stringify(comments),
      prev_homework: JSON.stringify([]),
      new_homework: JSON.stringify([]),
      prev_assessments : JSON.stringify([]),
      new_assessments: JSON.stringify([])
    });

    submitComment({
      session_id: tutoringSession.session_id, 
      jsonfile
    });
  }

  const toggleExpand = (index) => {
    setExpandedSessions((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleAddNewHomework = (session_id) => {
    const currentHomework = tempComments[session_id]?.new_homework || [];
    
    setTempComments({
      ...tempComments,
      [session_id]: {
        ...tempComments[session_id],
        new_homework: [...currentHomework, { subject: '', due_date: '', notes: '' }]
      }
    });
  };

  const handleNewHomeworkChange = (session_id, event, hwIndex, field) => {
    const updatedHomeworkList = tempComments[session_id].new_homework.map((hw, index) =>
      index === hwIndex ? { ...hw, [field]: event.target.value } : hw
    );
    setTempComments({
      ...tempComments,
      [session_id]: {
        ...tempComments[session_id],
        new_homework: updatedHomeworkList
      }
    });
  };

  const handleRemoveNewHomework = (session_id, hwIndex) => {
    const updatedHomeworkList = tempComments[session_id].new_homework.filter(
      (_, index) => index !== hwIndex
    );
    setTempComments({
      ...tempComments,
      [session_id]: {
        ...tempComments[session_id],
        new_homework: updatedHomeworkList
      }
    });
  };
  
  const handleAddNewAssessment = (session_id) => {
    const currentAssessments = tempComments[session_id]?.new_assessments || [];
    
    setTempComments({
      ...tempComments,
      [session_id]: {
        ...tempComments[session_id],
        new_assessments: [...currentAssessments, { title: '', date: '', description: '', notes:'', reviewed: false, outcome:'' }]
      }
    });
  };

  const handleNewAssessmentChange = (session_id, event, asmtIndex, field) => {
    const updatedAssessments = tempComments[session_id].new_assessments.map((asmt, index) =>
      index === asmtIndex ? { ...asmt, [field]: event.target.value } : asmt
    );
    setTempComments({
      ...tempComments,
      [session_id]: {
        ...tempComments[session_id],
        new_assessments: updatedAssessments
      }
    });
  };

  const handleRemoveNewAssessment = (session_id, asmtIndex) => {
    const updatedAssessments = tempComments[session_id].new_assessments.filter(
      (_, index) => index !== asmtIndex
    );
    setTempComments({
      ...tempComments,
      [session_id]: {
        ...tempComments[session_id],
        new_assessments: updatedAssessments
      }
    });
  };

  const handleExistingHomeworkUpdate = (session_id, homework_id, event) => {
    const previousHomework = tempComments[session_id]?.prev_homework || []; // Ensure an array exists

    // Check if homework_id already exists in previousHomework
    const index = previousHomework.findIndex(hw => hw.homework_id === homework_id);
    
    // If found, update the completedness; otherwise, add a new entry
    const updatedHomeworkList = index !== -1
        ? previousHomework.map((hw, idx) =>
            idx === index ? { ...hw, completedness: Number(event.target.value) } : hw
          )
        : [...previousHomework, { homework_id, completedness: Number(event.target.value) }];

        setTempComments({
          ...tempComments,
          [session_id]: {
              ...tempComments[session_id],
              prev_homework: updatedHomeworkList,
          }
      });
  };

  const handleExistingAssessmentNoteUpdate = (session_id, assessment_id, event) => {
    const previousAssessment = tempComments[session_id]?.prev_assessments || []; // Ensure an array exists

    // Check if assessment_id already exists
    const index = previousAssessment.findIndex(asmt => asmt.assessment_id === assessment_id);
    
    // If found, update the notes; otherwise, add a new entry
    const updatedAssessmentList = index !== -1
      ? previousAssessment.map((asmt, idx) =>
          idx === index ? { ...asmt, notes: String(event.target.value) } : asmt
        )
      : [
          ...previousAssessment,
          {
            assessment_id,
            date: assessments.find((asmt) => asmt.assessment_id === assessment_id)?.date || new Date().toISOString(),
            notes: event.target.value,
            outcome: assessments.find((asmt) => asmt.assessment_id === assessment_id)?.outcome || '',
            reviewed: assessments.find((asmt) => asmt.assessment_id === assessment_id)?.reviewed || false,
          },
        ];

    setTempComments({
      ...tempComments,
      [session_id]: {
        ...tempComments[session_id],
        prev_assessments: updatedAssessmentList,
      },
    });
  };

  const handleExistingAssessmentOutcomeUpdate = (session_id, assessment_id, event) => {
    const previousAssessment = tempComments[session_id]?.prev_assessments || []; // Ensure an array exists

    // Check if assessment_id already exists
    const index = previousAssessment.findIndex(asmt => asmt.assessment_id === assessment_id);
    
    // If found, update the notes; otherwise, add a new entry
    const updatedAssessmentList = index !== -1
      ? previousAssessment.map((asmt, idx) =>
          idx === index ? { ...asmt, outcome: String(event.target.value) } : asmt
        )
      : [
          ...previousAssessment,
          {
            assessment_id,
            date: assessments.find((asmt) => asmt.assessment_id === assessment_id)?.date || new Date().toISOString(),
            notes: assessments.find((asmt) => asmt.assessment_id === assessment_id)?.notes || '',
            outcome: event.target.value,
            reviewed: assessments.find((asmt) => asmt.assessment_id === assessment_id)?.reviewed || false,
          },
        ];

    setTempComments({
      ...tempComments,
      [session_id]: {
        ...tempComments[session_id],
        prev_assessments: updatedAssessmentList,
      },
    });
  };



  const handleExistingAssessmentDateUpdate = (session_id, assessment_id, event) => {
    const previousAssessment = tempComments[session_id]?.prev_assessments || []; // Ensure an array exists

    // Check if assessment_id already exists
    const index = previousAssessment.findIndex(asmt => asmt.assessment_id === assessment_id);

    // If found, update the date; otherwise, add a new entry
    const updatedAssessmentList = index !== -1
      ? previousAssessment.map((asmt, idx) =>
          idx === index ? { ...asmt, date: event.target.value } : asmt
        )
      : [
          ...previousAssessment,
          {
            assessment_id,
            date: event.target.value,
            notes: assessments.find((asmt) => asmt.assessment_id === assessment_id)?.notes || '',
            outcome: assessments.find((asmt) => asmt.assessment_id === assessment_id)?.outcome || '',
            reviewed: assessments.find((asmt) => asmt.assessment_id === assessment_id)?.reviewed || false,
          },
        ];

    setTempComments({
      ...tempComments,
      [session_id]: {
        ...tempComments[session_id],
        prev_assessments: updatedAssessmentList,
      },
    });
  };

  const handleExistingAssessmentReviewedUpdate = (session_id, assessment_id, event) => {
    const previousAssessment = tempComments[session_id]?.prev_assessments || []; // Ensure an array exists
    console.log(`is ${event.target.checked}`);
  
    // Check if assessment_id already exists
    const index = previousAssessment.findIndex(asmt => asmt.assessment_id === assessment_id);
  
    // If found, update the reviewed status; otherwise, add a new entry
    const updatedAssessmentList = index !== -1
      ? previousAssessment.map((asmt, idx) =>
          idx === index ? { ...asmt, reviewed: event.target.checked } : asmt
        )
      : [
          ...previousAssessment,
          {
            assessment_id,
            date: assessments.find((asmt) => asmt.assessment_id === assessment_id)?.date || new Date().toISOString(),
            notes: assessments.find((asmt) => asmt.assessment_id === assessment_id)?.notes || '',
            outcome: assessments.find((asmt) => asmt.assessment_id === assessment_id)?.outcome || '',
            reviewed: event.target.checked,
          },
        ];
  
    setTempComments({
      ...tempComments,
      [session_id]: {
        ...tempComments[session_id],
        prev_assessments: updatedAssessmentList,
      },
    });
  };
  

  const handleTutorChange = (selectedOption) => {

    if(selectedOption === null)
    {
      setSelectedTutorID(-1);
    }
    else setSelectedTutorID(selectedOption.value);
  };

  const handleStudentChange = (selectedOption) => {

    if(selectedOption === null)
    {
      setSelectedStudentID(-1);
    }
    else setSelectedStudentID(selectedOption.value);
  };


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
          className="form-control w-auto col-6"
          placeholderText="Select a date"
        />
        <FaCalendarAlt className="me-2 text-secondary" /> 
        <button type="button" className="btn btn-info px-4" onClick={handleDateReset}>Show All</button>
        <div className="col-3">
          <Select
              options={studentOptions}
              onChange={handleStudentChange}
              placeholder="Search for a student..."
              isClearable
              classNamePrefix="react-select"
            />
        </div>
        <div className="col-3">
          <Select
            options={tutorOptions}
            onChange={handleTutorChange}
            placeholder="Search for a tutor..."
            isClearable
            classNamePrefix="react-select"
          />
        </div>
      </div>
      
      <div className="row justify-content-center">
        {Array.isArray(filteredData) && filteredData.length > 0 ? (
          filteredData.map((tutoringSession, index) => {
            if (!tutoringSession.complete) {
              const sessionDateTime = new Date(tutoringSession.session_datetime);
              const endDateTime = new Date(sessionDateTime.getTime() + tutoringSession.duration * 60000);
              
              // Fetch the student data and homework list based on student_id
              const studentData = students.find(student => student.student_id === tutoringSession.student_id);
              const studentHomeworkList = homeworkList.filter(homework => homework.student_id === tutoringSession.student_id && homework.is_completed === 0);
              const studentAssessments = assessments.filter(assessment => assessment.student_id === tutoringSession.student_id && assessment.outcome === '');
              const latestComment = comments
                .filter(comment => comment.student_id === tutoringSession.student_id)
                .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))[0];

              return (
                <div className="col-12 mt-3" key={index}>
                  <div className="card">
                    <div className="card-body text-left">
                      
                      {/* Row 1: Tutor, Student Name, Grade */}
                      <div className="d-flex justify-content-between">
                        <h5 className="card-title">Tutor: {tutoringSession.tutor_name}</h5>
                        <h5 className="card-title">Student: {studentData?.first_name} {studentData?.last_name}</h5>
                        <h5 className="card-title">Grade: {studentData?.grade_level}</h5>
                        <div className="d-flex align-items-center">
                          <span className="me-2">Stamps:</span>
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Enter stamps"
                            style={{ width: '80px' }}
                            value={tempComments[tutoringSession.session_id]?.stamps || 0} // Default to 0 if nonexistent
                            onChange={(e) =>
                              setTempComments({
                                ...tempComments,
                                [tutoringSession.session_id]: {
                                  ...tempComments[tutoringSession.session_id],
                                  stamps: Number(e.target.value),
                                }
                              })
                            }
                          />
                        </div>
                      </div>

                      {/* Row 2: Da te and Stamps */}
                      <div className="d-flex justify-content-between mt-3">
                        <h5 className="card-title">
                          Date: {`${new Intl.DateTimeFormat('en-US', datetimeSetting).format(sessionDateTime)} ~ ${new Intl.DateTimeFormat('en-US', timeonlySetting).format(endDateTime)}`}
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
                              <div>{latestComment?.content}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Homework Box */}
                      <div className="mt-4 border p-3 rounded">
                        <h6 className="text-muted">Homework:</h6>
                        
                        {/* Existing Homework Rows */}
                        {studentHomeworkList.map((homework, hwIndex) => (
                          <div key={hwIndex} className="d-flex justify-content-between align-items-center mb-2">
                            <div className="col-2">Subject: {homework.subject}</div>
                            <div className="col-4">Due: {new Intl.DateTimeFormat('en-US', dateonlySetting).format(new Date(homework.due_date))}</div>
                            <div className="col-4">Notes: {homework.notes}</div>
                            <input
                              type="number"
                              className="form-control col-2"
                              value={tempComments[tutoringSession.session_id]?.prev_homework?.find(hw => hw.homework_id === homework.homework_id)?.completedness || 0}
                              min="0"
                              max="9"
                              style={{ width: '60px' }}
                              onChange={(e) => handleExistingHomeworkUpdate(tutoringSession.session_id, homework.homework_id, e)}
                            />
                          </div>
                        ))}

                        {/* New Homework Rows for Adding Additional Homework */}
                        <h6 className="text-muted mt-4">Add New Homework:</h6>
                        {tempComments[tutoringSession.session_id]?.new_homework?.map((homework, hwIndex) => (
                          <div key={`new-${hwIndex}`} className="d-flex justify-content-between align-items-center mb-2">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Subject"
                              value={homework.subject}
                              onChange={(e) => handleNewHomeworkChange(tutoringSession.session_id, e, hwIndex, 'subject')}
                              style={{ width: '25%' }}
                            />
                            <input
                              type="date"
                              className="form-control"
                              placeholder="Due Date"
                              value={homework.due_date}
                              onChange={(e) => handleNewHomeworkChange(tutoringSession.session_id, e, hwIndex, 'due_date')}
                              style={{ width: '25%' }}
                            />
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Notes"
                              value={homework.notes}
                              onChange={(e) => handleNewHomeworkChange(tutoringSession.session_id, e, hwIndex, 'notes')}
                              style={{ width: '30%' }}
                            />
                            <button
                              className="btn btn-danger"
                              onClick={() => handleRemoveNewHomework(tutoringSession.session_id, hwIndex)}
                            >
                              &times;
                            </button>
                          </div>
                        ))}

                        {/* Button to Add a New Homework Row */}
                        <button
                          className="btn btn-primary mt-2"
                          onClick={() => handleAddNewHomework(tutoringSession.session_id)}
                        >
                          + Add Homework
                        </button>
                      </div>

                      {/* Assessments Box */}
                      <div className="mt-4 border p-3 rounded">
                        <h6 className="text-muted">Pending Assessments:</h6>
                        
                        {/* Existing Assessments Row */}
                        {studentAssessments.map((assessment, asmtIndex) => {
                          const assessment_date = tempComments[tutoringSession.session_id]?.prev_assessments?.find(asmt => asmt.assessment_id === assessment.assessment_id)?.date || new Date(assessment.date).toISOString().split('T')[0];
                          
                          const isDateModified = new Date(assessment.date).getTime() !== new Date(assessment_date).getTime();

                          return (
                            <div key={asmtIndex} className="row align-items-center mb-2" style={{ margin: 0 }}>
                              <div className="col-2">
                                <strong>Title:</strong> {assessment.title}
                              </div>
                              <div className="col-2">
                                <input
                                  type="date"
                                  className="form-control"
                                  value={assessment_date}
                                  style={{
                                    backgroundColor: isDateModified ? 'lightgreen' : 'white',
                                  }}
                                  onChange={(e) => handleExistingAssessmentDateUpdate(tutoringSession.session_id, assessment.assessment_id, e)}
                                />
                              </div>
                              <div className="col-3">
                                <strong>Outcome:</strong> {assessment.description}
                              </div>
                              <div className="col-2">
                                <input
                                  type="text"
                                  className="form-control"
                                  value={tempComments[tutoringSession.session_id]?.prev_assessments?.find(asmt => asmt.assessment_id === assessment.assessment_id)?.outcome ?? assessment.outcome}
                                  onChange={(e) => handleExistingAssessmentOutcomeUpdate(tutoringSession.session_id, assessment.assessment_id, e)}
                                />
                              </div>
                              <div className="col-1">
                                <div className="form-check">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id={`reviewed-${assessment.assessment_id}`}
                                    checked={
                                      tempComments[tutoringSession.session_id]?.prev_assessments?.find(
                                        asmt => asmt.assessment_id === assessment.assessment_id
                                      )?.reviewed ?? assessment.reviewed
                                    }
                                    onChange={(e) => handleExistingAssessmentReviewedUpdate(
                                      tutoringSession.session_id,
                                      assessment.assessment_id,
                                      e
                                    )}
                                  />
                                  <label className="form-check-label" htmlFor={`reviewed-${assessment.assessment_id}`}>
                                    Reviewed?
                                  </label>
                                </div>
                              </div>

                            </div>
                          );
                        })}


                        {/* New Assessments Rows for Adding Additional Assessments */}
                        <h6 className="text-muted mt-4">Add New Assessment:</h6>
                        {tempComments[tutoringSession.session_id]?.new_assessments?.map((assessment, asmtIndex) => (
                          <div key={`new-${asmtIndex}`} className="d-flex justify-content-between align-items-center mb-2">
                            <input
                              type="text"
                              className="form-control col-2"
                              placeholder="Title"
                              value={assessment.title}
                              onChange={(e) => handleNewAssessmentChange(tutoringSession.session_id, e, asmtIndex, 'title')}
                              style={{ width: '20%' }}
                            />
                            <input
                              type="date"
                              className="form-control col-4"
                              placeholder="Date"
                              value={assessment.date}
                              onChange={(e) => handleNewAssessmentChange(tutoringSession.session_id, e, asmtIndex, 'date')}
                              style={{ width: '15%' }}
                            />
                            <input
                              type="text"
                              className="form-control col-6"
                              placeholder="Description"
                              value={assessment.description}
                              onChange={(e) => handleNewAssessmentChange(tutoringSession.session_id, e, asmtIndex, 'description')}
                              style={{ width: '20%' }}
                            />
                            <input
                              type="text"
                              className="form-control col-6"
                              placeholder="Outcome"
                              value={assessment.outcome}
                              onChange={(e) => handleNewAssessmentChange(tutoringSession.session_id, e, asmtIndex, 'outcome')}
                              style={{ width: '20%' }}
                            />
                            <div className="form-check" style={{ width: '10%' }}>
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id={`reviewed-${asmtIndex}`}
                                checked={assessment.reviewed || false}
                                onChange={(e) => handleNewAssessmentChange(
                                  tutoringSession.session_id, 
                                  { ...e, target: { ...e.target, value: e.target.checked } }, // Pass checked state as value
                                  asmtIndex, 
                                  'reviewed'
                                )}
                              />
                              <label className="form-check-label" htmlFor={`reviewed-${asmtIndex}`}>Reviewed?</label>
                            </div>
                            <button
                              className="btn btn-danger"
                              onClick={() => handleRemoveNewAssessment(tutoringSession.session_id, asmtIndex)}
                            >
                              &times;
                            </button>
                          </div>
                        ))}

                        {/* Button to Add a New Assessment Row */}
                        <button
                          className="btn btn-primary mt-2"
                          onClick={() => handleAddNewAssessment(tutoringSession.session_id)}
                        >
                          + Add Assessment
                        </button>
                      </div>

                      {/* Row 5: Comment Area and Submit Button */}
                      <div className="mt-4">
                        <div className="input-group mb-3">
                          <span className="input-group-text">Comment:</span>
                          <textarea
                            className="form-control"
                            aria-label="With textarea"
                            rows="3"
                            value={tempComments[tutoringSession.session_id]?.comment || ''}
                            onChange={(e) =>
                              setTempComments({
                                ...tempComments,
                                [tutoringSession.session_id]: {
                                  ...tempComments[tutoringSession.session_id],
                                  comment: e.target.value,
                                }
                              })
                            }
                          />
                        </div>
                        <div className="input-group mb-3">
                          <span className="input-group-text">Private Comment:</span>
                          <textarea
                            className="form-control"
                            aria-label="With textarea"
                            rows="3"
                            value={tempComments[tutoringSession.session_id]?.private_comment || ''}
                            onChange={(e) =>
                              setTempComments({
                                ...tempComments,
                                [tutoringSession.session_id]: {
                                  ...tempComments[tutoringSession.session_id],
                                  comment: tempComments[tutoringSession.session_id]?.comment || '',
                                  private_comment: e.target.value,
                                  stamps: tempComments[tutoringSession.session_id]?.stamps || 0,
                                  new_homework: tempComments[tutoringSession.session_id]?.new_homework || [],
                                  prev_homework: tempComments[tutoringSession.session_id]?.prev_homework || [],
                                  new_assessments: tempComments[tutoringSession.session_id]?.new_assessments || [],
                                }
                              })
                            }
                          />
                        </div>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleCommentSubmit(tutoringSession)}
                        >
                          Submit Comment
                        </button>
                        <button
                          className="btn btn-warning"
                          onClick={() => handleSubmitNoshow(tutoringSession)}
                        >
                          No-Show
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