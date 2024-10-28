import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { FaCalendarAlt } from 'react-icons/fa';
import { useQuery,  useQueryClient, useMutation } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';

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

  console.log("successfully fetched students");
  return await response.json();
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

  return;
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

  return;
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

  const { mutate: putStudent, isStudentLoading, isStudentError, error } = useMutation({
    mutationFn: ({ id, student }) => updateStudent(id, student),
    onSuccess: () => {
      console.log('Student update successful!');
      setTempStudent({ ...student });
      setIsEditing(false);
      queryClient.invalidateQueries(['students']);
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
    queryKey: ['students'],
    queryFn: fetchStudents,
    select: (data) => data.find((s) => s.student_id.toString() === id),
  });

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

  if (isInitStudentsLoading || isCommentsLoading || !student) return <div>Loading...</div>;
  if (initStudentsError || commentsError) {
    if(commentsError && commentsError.status === 401) //unauthorized
    {
      console.log("unathorized");
      return <Navigate to="/login" />;
    }
    if(initStudentsError && initStudentsError.status === 401) //unauthorized
    {
      console.log("unathorized");
      return <Navigate to="/login" />;
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
    weekday: "long",
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
  
  return (
    <div> 
      <h1 className="m-2 mt-4">
        Student Information
      </h1>
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


      {isEditing?(
        <div className="m-2">
          <button className="btn btn-primary me-2" onClick={handleApply}>Apply</button>
          <button className="btn btn-secondary" onClick={handleBack}>Back</button>
        </div>

      ):(
        <div>
          <button onClick={handleEditToggle}>Edit</button>
        </div>
      )}
      <hr className="m-4" />
      <div className="row mt-3">
        <div className="col-9">
          <div className="card mt-3">
            <div className="card-body">
              <div className="container-fluid">
                <div className="row g-3">
                  <div className="col-md-4">
                    <p className="fw-bold">FIRST NAME</p>
                    {isEditing?(
                      <input
                        type="text"
                        name="first_name"
                        value={student.first_name}
                        onChange={handleInputChange}
                      />
                    ):(
                      <p>{student.first_name}</p>
                    )}
                  </div>
                  <div className="col-md-4">
                    <p className="fw-bold">LAST NAME</p>
                    {isEditing?(
                      <input
                        type="text"
                        name="last_name"
                        value={student.last_name}
                        onChange={handleInputChange}
                      />
                    ):(
                      <p>{student.last_name}</p>
                    )}
                  </div>
                  <div className="col-md-4">
                    <p className="fw-bold">ID</p>
                    <p>{student.student_id}</p>
                  </div>
                  <div className="col-md-4">
                    <p className="fw-bold">GRADE</p>
                    {isEditing?(
                      <input
                        type="number"
                        name="grade_level"
                        value={student.grade_level}
                        onChange={handleInputChange}
                      />
                    ):(
                      <p>{student.grade_level}</p>
                    )}
                  </div>
                  <div className="col-md-4">
                    <p className="fw-bold">Date of Birth</p>
                    {isEditing?(
                      <div className="d-flex align-items-center">
                      <DatePicker
                        selected={new Date(student.date_of_birth)}
                        onChange={setDate}
                        dateFormat="yyyy/MM/dd"
                        className="form-control"
                        placeholderText="Select a date"
                      />
                      <FaCalendarAlt className="ms-2 text-secondary" />
                    </div>
                    ):(
                      <p>{`${new Intl.DateTimeFormat('en-US', dateonlySetting).format(new Date(student.date_of_birth))}`}</p>
                    )}
                  </div>
                  <div className="col-md-4">
                    <p className="fw-bold">Student Phone</p>
                    {isEditing?(
                      <input
                        type="text"
                        name="student_phone"
                        value={student.student_phone}
                        onChange={handleInputChange}
                      />
                    ):(
                      <p>{student.student_phone}</p>
                    )}
                  </div>
                  <div className="col-md-4">
                    <p className="fw-bold">Student Email</p>
                    {isEditing?(
                      <input
                        type="text"
                        name="student_email"
                        value={student.student_email}
                        onChange={handleInputChange}
                      />
                    ):(
                      <p>{student.student_email}</p>
                    )}
                  </div>
                  <div className="col-md-4">
                    <p className="fw-bold">Emergency Contact Name</p>
                    {isEditing?(
                      <input
                        type="text"
                        name="emergency_name"
                        value={student.emergency_name}
                        onChange={handleInputChange}
                      />
                    ):(
                      <p>{student.emergency_name}</p>
                    )}
                  </div>
                  <div className="col-md-4">
                    <p className="fw-bold">Emergency Contact Relationship</p>
                    {isEditing?(
                      <input
                        type="text"
                        name="emergency_relationship"
                        value={student.emergency_relationship}
                        onChange={handleInputChange}
                      />
                    ):(
                      <p>{student.emergency_relationship}</p>
                    )}
                  </div>
                  <div className="col-md-4">
                    <p className="fw-bold">Emergency Contact Phone</p>
                    {
                      isEditing?(
                      <input
                        type="text"
                        name="emergency_phone"
                        value={student.emergency_phone}
                        onChange={handleInputChange}
                      />
                    ):(
                      <p>{student.emergency_phone}</p>
                    )}
                  </div>
                  <div className="col-md-4">
                    <p className="fw-bold">Stamps</p>
                    {
                      isEditing?(
                      <input
                        type="number"
                        name="stamps"
                        value={student.stamps}
                        onChange={handleInputChange}
                      />
                    ):(
                      <p>{student.stamps}</p>
                    )}
                  </div>
                  <div className="col-md-4">
                    <p className="fw-bold">School</p>
                    {
                      isEditing?(
                      <input
                        type="text"
                        name="school"
                        value={student.school}
                        onChange={handleInputChange}
                      />
                    ):(
                      <p>{student.school}</p>
                    )}
                  </div>
                  <div className="col-md-4">
                    <p className="fw-bold">Caregiver Name</p>
                    {
                      isEditing?(
                      <input
                        type="text"
                        name="caregiver"
                        value={student.caregiver}
                        onChange={handleInputChange}
                      />
                    ):(
                      <p>{student.caregiver}</p>
                    )}
                  </div>
                  <div className="col-md-4">
                    <p className="fw-bold">Secondary Phone</p>
                    {
                      isEditing?(
                      <input
                        type="text"
                        name="secondary_phone"
                        value={student.secondary_phone}
                        onChange={handleInputChange}
                      />
                    ):(
                      <p>{student.secondary_phone}</p>
                    )}
                  </div>
                  <div className="col-md-4">
                    <p className="fw-bold">Work Phone</p>
                    {
                      isEditing?(
                      <input
                        type="text"
                        name="work_phone"
                        value={student.work_phone}
                        onChange={handleInputChange}
                      />
                    ):(
                      <p>{student.work_phone}</p>
                    )}
                  </div>
                  <div className="col-md-4">
                    <p className="fw-bold">Address</p>
                    {
                      isEditing?(
                      <input
                        type="text"
                        name="address"
                        value={student.address}
                        onChange={handleInputChange}
                      />
                    ):(
                      <p>{student.address}</p>
                    )}
                  </div>
                  <div className="col-md-4">
                    <p className="fw-bold">Postal Code</p>
                    {
                      isEditing?(
                      <input
                        type="text"
                        name="postalcode"
                        value={student.postalcode}
                        onChange={handleInputChange}
                      />
                    ):(
                      <p>{student.postalcode}</p>
                    )}
                  </div>
                  <div className="col-md-4">
                    <p className="fw-bold">Signed?</p>
                    {isEditing?(
                      <label>
                        <select
                          name="signed"
                          value={student.signed}
                          onChange={handleBooleanChange}
                        >
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      </label>
                    ):(
                      <p>{student.signed?'Yes':'No'}</p>
                    )}
                  </div>
                  <div className="col-md-4">
                    <p className="fw-bold">Marketing Agreement</p>
                    {isEditing?(
                      <label>
                        <select
                          name="marketing_agreement"
                          value={student.marketing_agreement}
                          onChange={handleBooleanChange}
                        >
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      </label>
                    ):(
                      <p>{student.marketing_agreement?'Yes':'No'}</p>
                    )}
                  </div>
                  <div className="col-md-4">
                    <p className="fw-bold">Can Email</p>
                    {isEditing?(
                      <label>
                        <select
                          name="can_email"
                          value={student.can_email}
                          onChange={handleBooleanChange}
                        >
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      </label>
                    ):(
                      <p>{student.can_email?'Yes':'No'}</p>
                    )}
                  </div>
                  <div >
                    
                  </div>
                  <div className="col-md-4">
                    <p className="fw-bold">Academic Goal</p>
                    {isEditing?(
                      <input
                        type="text"
                        name="academic_goal"
                        value={student.academic_goal}
                        onChange={handleInputChange}
                      />
                    ):(
                      <p>{student.academic_goal}</p>
                    )}
                  </div>
                  <div >

                  </div>
                  <div />
                  <div className="col-md-4">
                    <p className="fw-bold">Behavioural Goal</p>
                    {isEditing?(
                      <input
                        type="text"
                        name="behavioural_goal"
                        value={student.behavioural_goal}
                        onChange={handleInputChange}
                      />
                    ):(
                      <p>{student.behavioural_goal}</p>
                    )}
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        </div>
        <div className="col-3">
          {Array.isArray(comments) && (comments).length > 0 ? (
            (comments).map((comment, index) => (
              <tr key={index}>
                <div className="card" style={{ width: '95%' }}>
                  <div className="card-body text-left">
                    <h5 className="card-title">{`${new Intl.DateTimeFormat('en-US', datetimeSetting).format(new Date(comment.datetime))}`}</h5>
                    <div className="mb-3">
                      <p className="card-text d-block">Comment type: {comment.type}</p>
                      <p className="card-text d-block">Content: {comment.content}</p>
                    </div>
                  </div>
                </div>
              </tr>
            ))):(
              <tr>
                <td colSpan="9">No data available</td>
              </tr>
          )}
        </div>
      </div>
      <button className="btn btn-primary" onClick={() => requestDataDownload(student)}>Download Student Data</button>
      <button className="btn btn-danger" onClick={() => handleShow()}>Delete Student</button>
      <div>
        <div className="card" style={{ width: '95%' }}>
          <div className="card-body text-left">
            <div className="row-m-3">
              <h5 className="card-title">New Comment</h5>
              <div className="dropdown">
                <button
                  className="btn btn-secondary dropdown-toggle"
                  type="button"
                  id="dropdownMenuButton"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {commentType ? commentType : 'Select Comment Type'}
                </button>
                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                  <li>
                    <button className="dropdown-item" onClick={() => handleSelect('admin')}>
                      Admin
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={() => handleSelect('private')}>
                      Private
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={() => handleSelect('public')}>
                      Public
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="input-group mb-3">
                <span className="input-group-text" id="comment-input-text">Comment: </span>
                <textarea className="form-control" aria-label="With textarea" rows="6"></textarea>
            </div>

            <button className="btn btn-primary" onClick={() => handleCommentSubmit()}>Submit Comment</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentList;