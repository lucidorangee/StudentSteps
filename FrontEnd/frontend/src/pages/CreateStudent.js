import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useState } from 'react';
import { Outlet, Link, NavLink } from "react-router-dom";
import { Nav, Navbar } from 'react-bootstrap'
import DatePicker from 'react-datepicker';
import { FaCalendarAlt } from 'react-icons/fa';

const CreateStudent = () => {
  // student_id | first_name | last_name | student_photo | date_of_birth | grade_level | student_phone | 
  // student_email | emergency_name | emergency_relationship | emergency_phone | emergency_email | user_id | 
  // stamps | school | caregiver | secondary_phone | work_phone | address | postalcode | signed | marketing_agreement | can_email

  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [student_photo, setStudentPhoto] = useState(null);
  const [date_of_birth, setDateOfBirth] = useState(new Date());
  const [grade_level, setGrade] = useState(-1);
  const [student_phone, setStudentPhone] = useState('');
  const [student_email, setStudentEmail] = useState('');
  const [emergency_name, setEmergencyName] = useState('');
  const [emergency_relationship, setEmergencyRelationship] = useState('');
  const [emergency_phone, setEmergencyPhone] = useState('');
  const [school, setSchool] = useState('');
  const [caregiver, setCaregiver] = useState('');
  const [secondary_phone, setSecondaryPhone] = useState('');
  const [work_phone, setWorkPhone] = useState('');
  const [address, setAddress] = useState('');
  const [postalcode, setPostalCode] = useState('');
  const [signed, setSigned] = useState(false);
  const [marketing_agreement, setMarketingAgreement] = useState(false);
  const [can_email, setCanEmail] = useState(false);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      first_name: first_name,
      last_name: last_name,
      student_photo: student_photo,
      date_of_birth: date_of_birth,
      grade_level: grade_level,
      student_phone: student_phone,
      student_email: student_email,
      emergency_name: emergency_name,
      emergency_relationship: emergency_relationship,
      emergency_phone: emergency_phone,
      school: school,
      caregiver: caregiver,
      secondary_phone: secondary_phone,
      work_phone: work_phone,
      address: address,
      postalcode: postalcode,
      signed: signed,
      marketing_agreement: marketing_agreement,
      can_email: can_email,
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/students/`, {
        credentials: 'include',
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Request was successful
        console.log('Student creation successful!');
      } else {
        // Request failed
        console.error('Student creation failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  // student_id | first_name | last_name | student_photo | date_of_birth | grade_level | student_phone | 
  // student_email | emergency_name | emergency_relationship | emergency_phone | user_id | 
  // stamps | school | caregiver | secondary_phone | work_phone | address | postalcode | signed | marketing_agreement | can_email
  return (
    <div className="App">
        <header className="App-header">
            <div className="position-relative mb-3 mt-3" >
              <div className="shadow p-3 mb-5 bg-body-tertiary rounded">
                <div className="container-fluid m-3">
                  <h1>Add Student</h1>
                </div>
                <form onSubmit={handleSubmit}>
            
                  <div className="container-fluid m-3">
                    <div className="row g-2">

                      <div className="col">
                        <label htmlFor="FirstNameInput" className="form-label">First Name</label>
                        <input type="text" className="form-control border border-dark custom-shadow" id="FirstNameInput" placeholder="FirstName" onChange={(e) => setFirstName(e.target.value)}></input>
                      </div>

                      <div className="col">
                        <label htmlFor="LastNameInput" className="form-label">Last Name</label>
                        <input type="text" className="form-control border border-dark custom-shadow" id="LastNameInput" placeholder="LastName" onChange={(e) => setLastName(e.target.value)}></input>
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

                    <div className="row g-2">
                      <div className="col">
                        <label htmlFor="GradeLevelInput" className="form-label ps-0">Grade Level</label>
                        <input type="number" className="form-control" id="GradeLevelInput" placeholder="9" onChange={(e) => setGrade(e.target.value)} />
                      </div>
                      
                      <div className="col">
                        <label htmlFor="SchoolInput" className="form-label">School</label>
                        <input type="text" className="form-control" id="SchoolInput" placeholder="Scholars High School" onChange={(e) => setSchool(e.target.value)}></input>
                    
                      </div>
                      <div className="col">

                      </div>
                    </div>

                    <div className="row g-2">
                      <div className="col">
                        <label htmlFor="PhoneInput" className="form-label">Student Phone Number</label>
                        <input type="tel" className="form-control" id="PhoneInput" pattern="[+]{1}[0-9]{11,14}" onChange={(e) => setStudentPhone(e.target.value)}></input>
                      </div>
                      <div className="col">
                        <label htmlFor="StudentEmailInput" className="form-label">Student Email Address</label>
                        <input type="email" className="form-control" id="StudentEmailInput" placeholder="student@gmail.com" onChange={(e) => setStudentEmail(e.target.value)}></input>
                      </div>
                      <div className="col">
                        
                      </div>
                    </div>

                    <div className="row g-2">
                      <div className="col">
                        <label htmlFor="EmergencyContactNameInput" className="form-label">Emergency Contact Name</label>
                        <input type="text" className="form-control" id="EmergencyContactNameInput" placeholder="Emergency Contact" onChange={(e) => setEmergencyName(e.target.value)}></input>
                      </div>
                      <div className="col">
                        <label htmlFor="EmergencyContactRelationshipInput" className="form-label">Relationship with Emergency Contact</label>
                        <input type="text" className="form-control" id="EmergencyContactRelationshipInput" placeholder="Emergency Contact Relationship" onChange={(e) => setEmergencyRelationship(e.target.value)}></input>
                      </div>
                      <div className="col">
                        <label htmlFor="EmergencyPhoneInput" className="form-label">Emergency Phone Number</label>
                        <input type="tel" className="form-control" id="EmergencyPhoneInput" pattern="[+]{1}[0-9]{11,14}" onChange={(e) => setEmergencyPhone(e.target.value)}></input>
                      </div>
                    </div>
                    
                    <div className="row g-2">
                      <div className="col">
                        <label htmlFor="CaregiverInput" className="form-label">Caregiver</label>
                        <input type="text" className="form-control" id="CaregiverInput" placeholder="Caregiver" onChange={(e) => setCaregiver(e.target.value)}></input>
                      </div>
                      <div className="col">
                        <label htmlFor="SecondaryPhoneInput" className="form-label">Secondary Phone Number</label>
                        <input type="tel" className="form-control" id="SecondaryPhoneInput" pattern="[+]{1}[0-9]{11,14}" onChange={(e) => setSecondaryPhone(e.target.value)}></input>
                      </div>
                      <div className="col">
                        <label htmlFor="WorkPhoneInput" className="form-label">Work Phone Number</label>
                        <input type="tel" className="form-control" id="WorkPhoneInput" pattern="[+]{1}[0-9]{11,14}" onChange={(e) => setWorkPhone(e.target.value)}></input>
                      </div>
                    </div>

                    <div className="row g-2">
                      <div className="col">
                        <label htmlFor="AddressInput" className="form-label">Address</label>
                        <input type="text" className="form-control" id="AddressInput" placeholder="Address" onChange={(e) => setAddress(e.target.value)}></input>
                      </div>
                      <div className="col">
                        <label htmlFor="PostalCodeInput" className="form-label">Postal Code</label>
                        <input type="text" className="form-control" id="PostalCodeInput" placeholder="A1B2C3" onChange={(e) => setPostalCode(e.target.value)}></input>
                      </div>
                    </div>
                    
                    <div className="row g-2">
                      <div className="col">
                        <div className="form-check mt-3">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            value={signed} 
                            id="signedCheckbox" 
                            onChange={(e) => setSigned(e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="signedCheckbox">
                            Signed?
                          </label>
                        </div>
                      </div>
                      <div className="col">
                        <div className="form-check mt-3">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            value={marketing_agreement} 
                            id="marketingAgreementCheckbox" 
                            onChange={(e) => setMarketingAgreement(e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="marketingAgreementCheckbox">
                            Marketing Agreement?
                          </label>
                        </div>
                      </div>
                      <div className="col">
                        <div className="form-check mt-3">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            value={can_email} 
                            id="canEmailCheckbox" 
                            onChange={(e) => setCanEmail(e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="canEmailCheckbox">
                            Can Email?
                          </label>
                        </div>
                      </div>
                    </div>


              
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
  
export default CreateStudent;

  