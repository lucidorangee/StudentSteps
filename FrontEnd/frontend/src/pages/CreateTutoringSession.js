import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { Nav, Navbar } from 'react-bootstrap'
import DatePicker from 'react-datepicker';
import { FaCalendarAlt } from 'react-icons/fa';
import Select from 'react-select';

const CreateTutoringSession = () => {

  const [student_id, setStudent] = useState(-1);
  const [tutor_id, setTutor] = useState(-1);
  const [datetime, setDatetime] = useState('');
  const [durationHour, setHour] = useState('');
  const [durationMinute, setMinute] = useState('');
  const [notes, setNotes] = useState('');
  const [alert, setAlert] = useState('');

  const [students, setStudents] = useState(null);
  const [tutors, setTutors] = useState(null);
  const [studentOptions, setStudentOptions] = useState([]);
  const [tutorOptions, setTutorOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    //Fetch authentication status
    fetch(`${process.env.REACT_APP_API_BASE_URL}/students`, {
      credentials: 'include',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(data => {
      setStudents(data);
      console.log("DATA ", data);
      const options = data.map(student => ({
        value: student.student_id,
        label: `${student.first_name} (ID: ${student.student_id})`,
      }));
      setStudentOptions(options);
      if (options.length > 0) {
        setStudent(options[0].value);
      }
      setLoading(false);
    })
    .catch(error => {
      console.error('Error fetching students:', error);
      setLoading(false);
    });
  }, []);


  useEffect(() => {
    //Fetch authentication status
    fetch(`${process.env.REACT_APP_API_BASE_URL}/tutors`, {
      credentials: 'include',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(data => {
      setTutors(data);
      console.log("DATA ", data);
      const options = data.map(tutor => ({
        value: tutor.tutor_id,
        label: `${tutor.first_name} (ID: ${tutor.tutor_id})`,
      }));
      setTutorOptions(options);
      if (options.length > 0) {
        setTutor(options[0].value);
      }
      setLoading(false);
    })
    .catch(error => {
      console.error('Error fetching tutors:', error);
      setLoading(false);
    });
  }, []);

  const handleStudentChange = (selectedOption) => {
    setStudent(selectedOption ? selectedOption.value : -1);
  };

  const handleTutorChange = (selectedOption) => {
    setTutor(selectedOption ? selectedOption.value : -1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let durationHourToUse = durationHour === "" ? "1" : durationHour;
    let durationMinuteToUse = durationMinute === "" ? "0" : durationMinute;

    if (isNaN(durationHourToUse) || isNaN(durationMinuteToUse)) {
      setAlert("The value in hour or minute is not a valid number");
      return;
    }

    if(student_id === -1){
      setAlert("Please select a student");
      return;
    }

    if(tutor_id === -1){
      setAlert("Please select a student");
      return;
    }

    

    console.log("inputted time: " + (parseInt(durationHourToUse) * 60 + parseInt(durationMinuteToUse)));

    const formData = {
      student_id: student_id,
      tutor_id: tutor_id,
      datetime: datetime,
      duration: (parseInt(durationHourToUse) * 60 + parseInt(durationMinuteToUse)),
      notes: notes,
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/tutoringsessions/add`, {
        credentials: 'include',
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Request was successful
        console.log('Session creation successful! Redirecting...');
        navigate('/schedule/list', { replace : true});
      } else {
        // Request failed
        console.error('Session creation failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="position-absolute top-50 start-50 translate-middle h-50 w-50 container-fluid">
          <div className="position-relative mb-3" >
            <div className="shadow p-3 mb-5 bg-body-tertiary rounded">
              {alert ? (
                <div>
                  <div class="alert alert-danger" role="alert">
                    {alert}
                  </div>
                </div>
              ) : (
                <div></div>
              )}
              <div className="container-fluid m-3">
                <h1>Add Session</h1>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="container-fluid m-3">
                  <div className="col">
                    <label htmlFor="FormControlInput1" className="form-label">Student</label>
                    {loading ? (
                      <p>Loading students...</p>
                    ) : (
                      <Select
                        options={studentOptions}
                        onChange={handleStudentChange}
                        placeholder="Search for a student..."
                        classNamePrefix="react-select"
                      />
                    )}
                  </div>
                  <div className="col">
                    <label htmlFor="FormControlInput1" className="form-label">Tutor</label>
                    {loading ? (
                      <p>Loading tutors...</p>
                    ) : (
                      <Select
                        options={tutorOptions}
                        onChange={handleTutorChange}
                        placeholder="Search for a tutor..."
                        isClearable
                        classNamePrefix="react-select"
                      />
                    )}
                  </div>
                  <label htmlFor="FormControlInput1" className="form-label">Datetime</label>
                  <div className="d-flex align-items-center">
                    <DatePicker
                      selected={datetime}
                      onChange={setDatetime}
                      dateFormat="yyyy/MM/dd"
                      className="form-control"
                      placeholderText="Select a date"
                    />
                    <FaCalendarAlt className="ms-2 text-secondary" />
                  </div>
                  <label htmlFor="FormControlInput1" className="form-label">Duration</label>
                  <div class="row">
                    <div class="col-md-2">
                      Hour: 
                    </div>
                    <div class="col-md-4">
                      <input type="text" className="form-control" id="FormControlInput1" aria-describedby="hourDuration" onChange={(e) => setHour(e.target.value)} />
                    </div>
                    <div class="col-md-2">
                      Minutes: 
                    </div>
                    <div class="col-md-4"> 
                      <input type="text" className="form-control" id="FormControlInput1" aria-describedby="minuteDuration" onChange={(e) => setMinute(e.target.value)} />
                    </div>
                  </div>
                  
                  <label htmlFor="FormControlInput1" className="form-label">Notes</label>
                  <textarea className="form-control" id="FormControlInput1" aria-describedby="sessionNotes" rows="4" onChange={(e) => setNotes(e.target.value)} />
                </div>
                <div className="row align-items-start m-3">
                  <div className="col-10">
                    <button type="submit" className="btn btn-primary mb-3">Add</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};
  
export default CreateTutoringSession;

  