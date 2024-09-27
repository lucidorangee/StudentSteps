import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { Nav, Navbar } from 'react-bootstrap'
import DatePicker from 'react-datepicker';
import { FaCalendarAlt } from 'react-icons/fa';
import Select from 'react-select';
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

  return response.json(); // Parse and return the JSON response
};

const postHomework = async (formData) => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/homework`, {
    credentials: 'include',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const responseText = response.json().message;
    const err = new Error('Homework creation failed:', response.responseText); // Include responseText in the error for context
    err.status = response.status;
    throw err;
  }

  return;
}


const CreateHomework = () => {

  const [student_id, setStudent] = useState('');
  const [tutor_id, setTutor] = useState('');
  const [datetime, setDatetime] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [studentOptions, setStudentOptions] = useState([]);
  const [tutorOptions, setTutorOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

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

  const { mutate: createHomework, isLoading, isError, error } = useMutation({
    mutationFn: (formData) => postHomework(formData),
    onSuccess: () => {
      console.log('Homework creation successful!');
      navigate('/schedule/list', { replace : true});
    },
    onError: (error) => {
      console.log('Error creating homework: ', error.message);
    }
  });

  if (studentsLoading || tutorsLoading) return <div>Loading...</div>;
  if (studentsError || tutorsError) return <div>Error loading data</div>;

  const handleStudentChange = (selectedOption) => {
    setSelectedStudent(selectedOption);
    setStudent(selectedOption ? selectedOption.value : -1);
  };

  const handleTutorChange = (selectedOption) => {
    setSelectedTutor(selectedOption);
    setStudent(selectedOption ? selectedOption.value : -1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      student_id: student_id,
      //tutor_id: tutor_id,
      assigned: datetime,
      due_date: datetime,
      subject: duration,
      notes: notes,
    };

    createHomework(formData);
    /*
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/homework/`, {
        credentials: 'include',
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Request was successful
        console.log('Homework creation successful! Redirecting...');
        navigate('/schedule/list', { replace : true});
      } else {
        // Request failed
        console.error('Homework creation failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }*/
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="position-absolute top-50 start-50 translate-middle h-50 w-50 container-fluid">
          <div className="position-relative mb-3" >
            <div className="shadow p-3 mb-5 bg-body-tertiary rounded">
              <div className="container-fluid m-3">
                <h1>Add Homework</h1>
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
                  <input type="text" className="form-control" id="FormControlInput1" aria-describedby="passwordHelpBlock" onChange={(e) => setDuration(e.target.value)} />
                  <label htmlFor="FormControlInput1" className="form-label">Notes</label>
                  <input type="text" className="form-control" id="FormControlInput1" aria-describedby="passwordHelpBlock" onChange={(e) => setNotes(e.target.value)} />
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
  
export default CreateHomework;

  