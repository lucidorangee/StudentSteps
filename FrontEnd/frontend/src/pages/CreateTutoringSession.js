import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { Nav, Navbar } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { FaCalendarAlt } from 'react-icons/fa';
import Select from 'react-select';
import TimePicker from 'react-time-picker';
import { useQuery, useMutation } from '@tanstack/react-query';

const fetchStudents = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/students/`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch students');
  }
  return response.json();
};

const fetchTutors = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/tutors/`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch tutors');
  }

  return response.json();
};

const postTutoringSession = async (formData) => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/tutoringsessions/add`, {
    credentials: 'include',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    throw new Error('Failed to create tutoring session: ' + response); // Include responseText in the error for context
  }

  const responseText = await response.text();
  return responseText;
}

const CreateTutoringSession = () => {

  const [student_id, setStudent] = useState(-1);
  const [tutor_id, setTutor] = useState(-1);
  const [date, setDate] = useState(new Date());
  const [durationHour, setHour] = useState('1');
  const [durationMinute, setMinute] = useState('0');
  const [notes, setNotes] = useState('');
  const [alert, setAlert] = useState('');

  const [studentOptions, setStudentOptions] = useState([]);
  const [tutorOptions, setTutorOptions] = useState([]);
  
  const navigate = useNavigate();

  const loading = false;

  const {
    data: students,
    isLoading: studentsLoading,
    error: studentsError,
  } = useQuery({queryKey: ['students'], queryFn: fetchStudents});

  const {
    data: tutors,
    isLoading: tutorsLoading,
    error: tutorsError,
  } = useQuery({queryKey: ['tutors'], queryFn: fetchTutors});

  useEffect(() => {
    if (students) {
      const studentOptionsTemp = students.map(student => ({
        value: student.student_id,
        label: `${student.first_name} ${student.last_name} (ID: ${student.student_id})`,
      }));
      setStudentOptions(studentOptionsTemp);
      if (studentOptionsTemp.length > 0) {
        setStudent(studentOptionsTemp[0].value);
      }
    }
  }, [students]);

  useEffect(() => {
    if (tutors) {
      const tutorOptionsTemp = tutors.map(tutor => ({
        value: tutor.tutor_id,
        label: `${tutor.first_name} ${tutor.last_name} (ID: ${tutor.tutor_id})`,
      }));
      setTutorOptions(tutorOptionsTemp);
      if (tutorOptionsTemp.length > 0) {
        setTutor(tutorOptionsTemp[0].value);
      }
    }
  }, [tutors]);

  const { mutate: createTutoringSession, isLoading, isError, error } = useMutation({
    mutationFn: (formData) => postTutoringSession(formData),
    onSuccess: () => {
      console.log('Tutoring session creation successful!');
      navigate('/schedule/list', { replace : true});
    },
    onError: (error) => {
      console.log('Error creating homework: ', error.message);
    }
  });
  
  if (studentsLoading || tutorsLoading) return <div>Loading...</div>;
  if (studentsError || tutorsError) return <div>Error loading data</div>;

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

    if (date === "") {
      setAlert("Please select a date");
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

    const formData = {
      student_id: student_id,
      tutor_id: tutor_id,
      date: date.toISOString(),
      duration: (parseInt(durationHourToUse) * 60 + parseInt(durationMinuteToUse)),
      notes: notes,
    };

    console.log("Going through: " + JSON.stringify(formData));

    createTutoringSession(formData);
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
                  <label htmlFor="FormControlInput1" className="form-label">Date</label>
                  <div className="d-flex align-items-center">
                    <DatePicker
                      selected={date}
                      onChange={(date) => setDate(date)}
                      showTimeSelect
                      timeFormat="h:mm aa"
                      timeIntervals={30} // Set time interval to 30 minutes
                      dateFormat="yyyy/MM/dd h:mm aa" // Date and time format
                      className="form-control"
                      placeholderText="Select a date and time"
                    />
                    <FaCalendarAlt className="ms-2 text-secondary" />
                  </div>
                  <label htmlFor="FormControlInput1" className="form-label">Duration</label>
                  <div class="row">
                    <div class="col-md-2">
                      Hour: 
                    </div>
                    <div class="col-md-4">
                      <input type="text" className="form-control" id="FormControlInput1" defaultValue={durationHour} aria-describedby="hourDuration" onChange={(e) => setHour(e.target.value)} />
                    </div>
                    <div class="col-md-2">
                      Minutes: 
                    </div>
                    <div class="col-md-4"> 
                      <input type="text" className="form-control" id="FormControlInput1" defaultValue={durationMinute} aria-describedby="minuteDuration" onChange={(e) => setMinute(e.target.value)} />
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

  