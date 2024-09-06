import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { FaCalendarAlt } from 'react-icons/fa';

const StudentList = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [comments, setComments] = useState([]);
  const [tempStudent, setTempStudent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);


  useEffect(() => {
    //Fetch authentication status
    fetch(`${process.env.REACT_APP_API_BASE_URL}/students/${id}`, {
      method: 'get',
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        setStudent(data[0]);
        setTempStudent(data[0]);
      })
      .catch(error => {
        console.error('Error fetching the student data: ', error);
      })
  }, []);

  useEffect(() => {
    if (tempStudent) {
      // Fetch comments once tempStudent is set
      fetch(`${process.env.REACT_APP_API_BASE_URL}/comments?student_id=${tempStudent.student_id}`, {
        credentials: 'include'
      })
        .then(response => response.json())
        .then(data => {
          setComments(data);
        })
        .catch(error => {
          console.error('Error fetching comments: ', error);
        });
    }
  }, [tempStudent]);

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

  const setDate = (value) => {
    setStudent({
      ...student,
      'date_of_birth': value.toISOString(),
    });
  }

  const handleApply = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/students/${id}`, {
        credentials: 'include',
        method: 'put',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(student),
      });

      if (response.ok) {
        // Request was successful
        console.log('Student update successful!');
        setTempStudent({ ...student });
        setIsEditing(false);
      } else {
        // Request failed
        console.error('Student update failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const handleBack = () => {
    setIsEditing(false);
    setStudent({ ...tempStudent });
  }

  if(student === null){
    return(
      <div>
        Loading...
      </div>
    )
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
          type: 'admin'
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
    <div> 
      <h1 className="m-2 mt-4">
        Student Information
      </h1>
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
      <div className="col-3">
        <input
          type="text"
          name="emergency_phone"
          value={student.emergency_phone}
          onChange={handleFilterChange}
        />
      </div>
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
                        selected={student.date_of_birth}
                        onChange={setDate}
                        dateFormat="yyyy/MM/dd"
                        className="form-control"
                        placeholderText="Select a date"
                      />
                      <FaCalendarAlt className="ms-2 text-secondary" />
                    </div>
                    ):(
                      <p>{student.date_of_birth}</p>
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
                    <h5 className="card-title">{comment.datetime}</h5>
                    <div className="input-group mb-3">
                      <p class="card-text">Date: {comment.datetime}</p>
                      <p class="card-text">Content: {comment.content}</p>
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
      <div>
        <div className="card" style={{ width: '95%' }}>
          <div className="card-body text-left">
            <h5 className="card-title">New Comment</h5>
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