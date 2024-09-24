import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useState } from 'react';
import { Outlet, Link, NavLink } from "react-router-dom";
import { Nav, Navbar } from 'react-bootstrap'
import DatePicker from 'react-datepicker';
import { FaCalendarAlt } from 'react-icons/fa';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";

const navigate = useNavigate();

const postTutor = async (formData) => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/tutors/`, {
    credentials: 'include',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    throw new Error('Failed to create student');
  }
  
  return response.json();
}

const CreateTutor = () => {
//  tutor_id | first_name | last_name | tutor_photo | date_of_birth | contact_phone | contact_email | user_id

  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [photo, setPhoto] = useState(null);
  const [date_of_birth, setDateOfBirth] = useState(new Date());
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const queryClient = useQueryClient()

  const { mutate: addTutor, isLoading, isError, error } = useMutation({
    mutationFn: postTutor
  })

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      first_name: first_name,
      last_name: last_name,
      photo: photo,
      date_of_birth: date_of_birth,
      phone: phone,
      email: email,
    };

    addTutor(formData, {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['tutors']});
        console.log('Tutor added successfully:', data);
        navigate("/admin/tutors");
      },
      onError: (error) => {
        console.log('Error adding tutor:', error);
      }
    });

  };
// student_id | first_name | last_name | student_photo | date_of_birth | grade_level | student_phone | 
// student_email | parent_first_name | parent_last_name | parent_phone | parent_email | user_id
  return (
    <div className="App">
        <header className="App-header">
            <div className="position-relative mb-3 mt-3" >
              <div className="shadow p-3 mb-5 bg-body-tertiary rounded">
                <div className="container-fluid m-3">
                  <h1>Add Tutor</h1>
                </div>
                <form onSubmit={handleSubmit}>
            
                  <div className="container-fluid m-3">
                    <div className="row g-2">
                      <div className="col">
                        <label htmlFor="FirstNameInput" className="form-label">First Name</label>
                        <input type="text" className="form-control" id="FirstNameInput" placeholder="FirstName" onChange={(e) => setFirstName(e.target.value)}></input>
                      </div>
                      <div className="col">
                        <label htmlFor="LastNameInput" className="form-label">Last Name</label>
                        <input type="text" className="form-control" id="LastNameInput" placeholder="LastName" onChange={(e) => setLastName(e.target.value)}></input>
                      </div>
                      <div className="col">
                        <label htmlFor="DateOfBirthInput" className="form-label">Date of Birth</label>
                        <div className="d-flex align-items-center">
                          <DatePicker
                            id="DateOfBirthInput"
                            selected={date_of_birth}
                            onChange={setDateOfBirth}
                            dateFormat="yyyy/MM/dd"
                            className="form-control"
                            placeholderText="Select a date"
                          />
                          <FaCalendarAlt className="ms-2 text-secondary" />
                        </div>
                      </div>
                    </div>
                    
                    <label htmlFor="PhoneInput" className="form-label">Phone Number</label>
                    <input type="tel" className="form-control" id="PhoneInput" pattern="[+]{1}[0-9]{11,14}" onChange={(e) => setPhone(e.target.value)}></input>
                    
                    <label htmlFor="EmailInput" className="form-label">Email Address</label>
                    <input type="email" className="form-control" id="EmailInput" placeholder="example@gmail.com" onChange={(e) => setEmail(e.target.value)}></input>
                  </div>
                  <div className="row align-items-start m-3">
                    <div className="col-10">
                      <button type="submit" className="btn btn-primary mb-3">Add</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
        </header>
      </div>
  );
};
  
export default CreateTutor;

  