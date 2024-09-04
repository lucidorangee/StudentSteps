import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { FaCalendarAlt } from 'react-icons/fa';

const TutorList = () => {
  const { id } = useParams();
  const [tutor, setTutor] = useState(null);
  const [comments, setComments] = useState([]);
  const [tempTutor, setTempTutor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    //Fetch authentication status
    fetch(`${process.env.REACT_APP_API_BASE_URL}/tutors/${id}`, {
      method: 'get',
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        setTutor(data[0]);
        setTempTutor(data[0]);
      })
      .catch(error => {
        console.error('Error fetching the tutor data: ', error);
      })
  }, []);

  useEffect(() => {
    if (tempTutor) {
      // Fetch comments once tempTutor is set
      fetch(`${process.env.REACT_APP_API_BASE_URL}/comments?tutor_id=${tempTutor.tutor_id}`, {
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
  }, [tempTutor]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleBooleanChange = (e) => {
    const { name, value } = e.target; 
    setTutor({
      ...tutor,
      [name]: value==='true',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTutor({
      ...tutor,
      [name]: value,
    });
  };

  const setDate = (value) => {
    setTutor({
      ...tutor,
      'date_of_birth': value.toISOString(),
    });
  }

  const handleApply = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/tutors/${id}`, {
        credentials: 'include',
        method: 'put',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tutor),
      });

      if (response.ok) {
        // Request was successful
        console.log('Tutor update successful!');
        setTempTutor({ ...tutor });
        setIsEditing(false);
      } else {
        // Request failed
        console.error('Tutor update failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const handleBack = () => {
    setIsEditing(false);
    setTutor({ ...tempTutor });
  }

  if(tutor === null){
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
          tutor_id: null,
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
        Tutor Information
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
                        value={tutor.first_name}
                        onChange={handleInputChange}
                      />
                    ):(
                      <p>{tutor.first_name}</p>
                    )}
                  </div>
                  <div className="col-md-4">
                    <p className="fw-bold">LAST NAME</p>
                    {isEditing?(
                      <input
                        type="text"
                        name="last_name"
                        value={tutor.last_name}
                        onChange={handleInputChange}
                      />
                    ):(
                      <p>{tutor.last_name}</p>
                    )}
                  </div>
                  <div className="col-md-4">
                    <p className="fw-bold">Date of Birth</p>
                    {isEditing?(
                      <div className="d-flex align-items-center">
                      <DatePicker
                        selected={tutor.date_of_birth}
                        onChange={setDate}
                        dateFormat="yyyy/MM/dd"
                        className="form-control"
                        placeholderText="Select a date"
                      />
                      <FaCalendarAlt className="ms-2 text-secondary" />
                    </div>
                    ):(
                      <p>{tutor.date_of_birth}</p>
                    )}
                  </div>
                  <div className="col-md-4">
                    <p className="fw-bold">Contact Phone</p>
                    {isEditing?(
                      <input
                        type="text"
                        name="contact_phone"
                        value={tutor.contact_phone}
                        onChange={handleInputChange}
                      />
                    ):(
                      <p>{tutor.tutor_phone}</p>
                    )}
                  </div>
                  <div className="col-md-4">
                    <p className="fw-bold">Contact Email</p>
                    {isEditing?(
                      <input
                        type="text"
                        name="contact_email"
                        value={tutor.contact_email}
                        onChange={handleInputChange}
                      />
                    ):(
                      <p>{tutor.tutor_email}</p>
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
      
    </div>
  );
};

export default TutorList;