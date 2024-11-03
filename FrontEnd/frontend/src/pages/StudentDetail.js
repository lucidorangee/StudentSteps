import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { FaCalendarAlt } from 'react-icons/fa';
import { useQuery,  useQueryClient, useMutation } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { Modal, Button, Tabs, Tab, Dropdown  } from 'react-bootstrap';
import ScheduleCalendar from './ScheduleCalendar.js';
import CreateTutoringSession from './CreateTutoringSession.js';
import RemoveTutoringSessions from './RemoveTutoringSessions.js';

const fetchStudent = async (id) => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/students/${id}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
  });

  if (!response.ok) {
    const err = new Error('Failed to fetch student');
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  
  if (Object.keys(data).length === 0) {
    const err = new Error('Student data is empty');
    err.status = response.status;
    throw err;
  }

  console.log("Successfully fetched student");
  return data;
};

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
  return await response.json();
}

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

const requestDataDownload = async (student) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/students/download/${student.student_id}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const err = new Error('Failed to fetch file');
      err.status = response.status;
      throw err;
    }

    // Get the binary data as a Blob
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    // Create a temporary download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `${student.first_name}_${student.last_name}.zip`; // Set the filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log("Successfully downloaded zip file");
  } catch (error) {
    console.error(error);
  }
};

const updateStudent = async (id, student) => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/students/${id}`, {
    credentials: 'include',
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(student),
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error('Failed to update student: ' + responseText); // Include responseText in the error for context
  }

  return response.json();
}

const deleteStudentByID = async (student_id) => {
  const url = `${process.env.REACT_APP_API_BASE_URL}/students/${student_id}`;
  
  const response = await fetch(url, {
    credentials: 'include',
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`Failed to delete student: ${responseText}`);
  }

  return response.json();
};

const StudentList = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [tempStudent, setTempStudent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [commentType, setCommentType] = useState('admin');
  const [selectedSchedulingTab, setSelectedSchedulingTab] = useState('Overview');
  const [startDate, setStartDate] = useState(new Date());

  const { mutate: putStudent, isStudentLoading, isStudentError, error } = useMutation({
    mutationFn: ({ id, student }) => updateStudent(id, student),
    onSuccess: () => {
      console.log('Student update successful!');
      setTempStudent({ ...student });
      setIsEditing(false);
      queryClient.invalidateQueries(['students']);
      queryClient.invalidateQueries(['homework']);
      console.log("Successfully updated");
    },
    onError: (error) => {
      console.log('Error updating student:', error.message);
    }
  });

  const { mutate: deleteStudent, isDeleteStudentLoading, isDeleteStudentError, deleteStudentError } = useMutation({
    mutationFn: (student_id) => deleteStudentByID(student_id),
    onSuccess: () => {
      console.log("Successfully deleted");
      navigate(`/admin/students`)
    },
    onError: (error) => {
      console.log('Error deleting student:', error.message);
    }
  });

  const {
    data: tempInitStudent,
    isLoading: isInitStudentsLoading,
    error: initStudentsError,
  } = useQuery({
    queryKey: ['students', id],
    queryFn: () => fetchStudent(id),
  });

  const {
    data: tutoringSessions,
    isLoading: tutoringSessionsLoading,
    error: tutoringSessionsError,
  } = useQuery({queryKey: ['tutoringSessions'], queryFn: () => fetchTutoringSessions()});

  useEffect(() => {    
    if(tempInitStudent) 
    {
      setStudent(tempInitStudent);
      setTempStudent(tempInitStudent);
    }
  }, [tempInitStudent]);

  const {
    data: comments,
    isLoading: isCommentsLoading,
    error: commentsError,
  } = useQuery({
    queryKey: ['comments'],
    queryFn: fetchComments,
    select: (data) => data.filter((comment) => comment.student_id.toString() === id), // Select specific student
  });

  if (isInitStudentsLoading || isCommentsLoading || !student || !tutoringSessions) return <div>Loading...</div>;
  if (initStudentsError || commentsError || tutoringSessionsError) {
    if(commentsError?.status === 401 || initStudentsError?.status === 401 || tutoringSessionsError.status === 401) //unauthorized
    {
      console.log("unathorized");
      return <Navigate to="/login" />;
    }
    if(initStudentsError?.status === 404)
    {
      console.log("no student found");
      return <div>No such student found. Try refreshing the page.</div>;
    }
    return <div>Error loading data</div>;
  }

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
    timeZone: "UTC", // Eastern Time zone
    month: "long",
    day: "numeric",
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleBooleanChange = (e) => {
    const { name, value } = e.target; 
    setStudent({
      ...student,
      [name]: value==='true',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudent({
      ...student,
      [name]: value,
    });
  };

  const setDate = (date) => {
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    setStudent({
      ...student,
      'date_of_birth': utcDate.toISOString(),
    });
  }

  const handleApply = async () => {
    putStudent({id: id, student: student});
  }

  const handleBack = () => {
    setIsEditing(false);
    setStudent({ ...tempStudent });
  }

  const handleCommentSubmit = () => {
    const comment = document.querySelector('textarea').value; // Get the value of the textarea

    // Validate if comment is empty or any other necessary validation
    if (!comment.trim()) {
        alert('Please enter a comment.');
        return;
    }

    fetch(`${process.env.REACT_APP_API_BASE_URL}/comments`, {
      credentials: 'include',
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          tutor_id: null,
          student_id: null,
          datetime: new Date().toISOString(), 
          content: comment,
          type: commentType
      }),
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

  const handleSelect = (type) => {
    setCommentType(type);
  };  

  
  const handleShow = () => {
    setShowModal(true);
  }

  const handleClose = () => setShowModal(false);

  const handleSchedulingTabSelect = (newTab) => {
    setSelectedSchedulingTab(newTab);
  };
  
  const renderPersonalInformation = () => {
    const fields = [
      { label: "FIRST NAME", key: "first_name" },
      { label: "LAST NAME", key: "last_name" },
      { label: "ID", key: "student_id", isStatic: true },
      { label: "GRADE", key: "grade_level" },
      { label: "Date of Birth", key: "date_of_birth", isDate: true },
      { label: "Student Phone", key: "student_phone" },
      { label: "Student Email", key: "student_email" },
      { label: "Emergency Contact Name", key: "emergency_name" },
      { label: "Emergency Contact Relationship", key: "emergency_relationship" },
      { label: "Emergency Contact Phone", key: "emergency_phone" },
      { label: "Stamps", key: "stamps" },
      { label: "School", key: "school" },
      { label: "Caregiver Name", key: "caregiver" },
      { label: "Secondary Phone", key: "secondary_phone" },
      { label: "Work Phone", key: "work_phone" },
      { label: "Address", key: "address" },
      { label: "Postal Code", key: "postalcode" },
      { label: "Signed?", key: "signed", isBoolean: true },
      { label: "Marketing Agreement", key: "marketing_agreement", isBoolean: true },
      { label: "Can Email", key: "can_email", isBoolean: true },
      { label: "Academic Goal", key: "academic_goal" },
      { label: "Behavioural Goal", key: "behavioural_goal" },
    ];

    return fields.map(({ label, key, isStatic, isDate, isBoolean }) => (
      <div className="col-md-4" key={key}>
        <p className="fw-bold">{label}</p>
        {isEditing && !isStatic ? (
          isDate ? (
            <div className="d-flex align-items-center">
              <DatePicker
                selected={new Date(student[key])}
                onChange={setDate}
                dateFormat="yyyy/MM/dd"
                className="form-control"
                placeholderText="Select a date"
              />
              <FaCalendarAlt className="ms-2 text-secondary" />
            </div>
          ) : isBoolean ? (
            <select
              name={key}
              value={student[key]}
              onChange={handleBooleanChange}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          ) : (
            <input
              type={typeof student[key] === 'number' ? 'number' : 'text'}
              name={key}
              value={student[key]}
              onChange={handleInputChange}
            />
          )
        ) : (
          <p>
            {isBoolean
              ? student[key] === true
                ? "Yes"
                : student[key] === false
                ? "No"
                : "N/A"
              : key === "date_of_birth"
              ? student[key]/*new Intl.DateTimeFormat('en-US').format(new Date(student[key]))*/
              : student[key] || "N/A"}
          </p>
        )}
      </div>
    ));
  };

  const schedulingContent = {
    'Overview': 
      (<ScheduleCalendar defaultStudentId = {id}></ScheduleCalendar>),
    'Add Schedule': 
      (
      <div className="row">
        <div className="col-12 col-md-6">
          <CreateTutoringSession defaultStudentId = {id} passedDate = {startDate}></CreateTutoringSession>
        </div>
        
        <div className="col-12 col-md-6">
          <ScheduleCalendar defaultStudentId = {id} onDateClick = {setStartDate}></ScheduleCalendar>
        </div>
      </div>
      ),
    'Remove Schedules': 
    (
    <div className="row">
        <div className="col-12 col-md-6">
          <RemoveTutoringSessions defaultStudentId = {id} passedDate = {startDate}></RemoveTutoringSessions>
        </div>

        <div>
          <ScheduleCalendar defaultStudentId = {id} onDateClick = {setStartDate}></ScheduleCalendar>
        </div>
    </div>
    ),
  };

  const renderScheduling = () => (
    <div className="mb-3">
      <Dropdown onSelect={handleSchedulingTabSelect}>
        <Dropdown.Toggle variant="secondary">
          {selectedSchedulingTab}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {Object.keys(schedulingContent).map((key) => (
            <Dropdown.Item eventKey={key} key={key}>
              {key}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
      <div className="mt-3">
        {schedulingContent[selectedSchedulingTab] || <p>Select an option</p>}
      </div>
    </div>
  );
  

  return (
    <div>
      <h1 className="m-2 mt-4">Profile: {student.first_name} {student.last_name}</h1>
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>DELETE STUDENT</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>This operation is <strong>irreversible</strong>.</p>
          <p>Please ensure you have downloaded related tutoring sessions, comments, assessments, and homework via the <strong>DOWNLOAD</strong> button first.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>Cancel</Button>
          <Button variant="danger" onClick={() => deleteStudent(student.student_id)}>Confirm Delete</Button>
        </Modal.Footer>
      </Modal>


      <Tabs defaultActiveKey="personalInfo" id="uncontrolled-tab-example" className="mt-3">
        <Tab eventKey="personalInfo" title="Personal Information">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <div className="container-fluid">
                    <div className="row g-3">
                      {renderPersonalInformation()}
                      {isEditing ? (
                        <div className="m-2 d-flex justify-content-end">
                          <button className="btn btn-primary me-2" onClick={handleApply}>Apply</button>
                          <button className="btn btn-secondary" onClick={handleBack}>Back</button>
                        </div>
                      ) : (
                        <div className="m-2 d-flex justify-content-end">
                          <button className="btn btn-primary me-2" onClick={handleEditToggle}>Edit</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Tab>

        <Tab eventKey="scheduling" title="Scheduling">
          <div className="card">
            <div className="card-body">
              <div className="mt-3">
                {renderScheduling()}
              </div>
            </div>
          </div>
        </Tab>

        <Tab eventKey="comments" title="Comments">
          <div className="card">
            <div className="card-body">
              <div className="row mt-3">
                <div className="col-12">
                  {Array.isArray(comments) && comments.length > 0 ? (
                    comments.map((comment, index) => (
                      <div key={index} className="card mb-2" style={{ width: '95%' }}>
                        <div className="card-body text-left">
                          <h5 className="card-title">{new Intl.DateTimeFormat('en-US').format(new Date(comment.datetime))}</h5>
                          <div className="mb-3">
                            <p className="card-text d-block">Comment type: {comment.type}</p>
                            <p className="card-text d-block">Content: {comment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No comment available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="card mt-3" style={{ width: '95%' }}>
            <div className="card-body text-left">
              <h5 className="card-title">New Comment</h5>
              {/* Add your comment input fields and submission logic here */}
            </div>
          </div>
        </Tab>
      </Tabs>

      <div className="row m-2">
        <button className="btn btn-primary col-2 m-2" onClick={() => requestDataDownload(student)}>Download Student Data</button>
        <button className="btn btn-danger col-2 m-2" onClick={handleShow}>Delete Student</button>
      </div>
    </div>
  );
  
};

export default StudentList;