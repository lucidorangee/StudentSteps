import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { Nav, Navbar } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { FaCalendarAlt, FaPlus, FaTrash } from 'react-icons/fa';
import Select from 'react-select';
import TimePicker from 'react-time-picker';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';

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

const deleteTutoringSessions = async (formData) => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/tutoringsessions/remove`, {
    credentials: 'include',
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    throw new Error('Failed to remove tutoring sessions: ' + response); // Include responseText in the error for context
  }

  const responseText = await response.text();
  return responseText;
}

const RemoveTutoringSessions = ({defaultStudentId = -1, passedDate = null}) => {

  const [studentId, setStudent] = useState(defaultStudentId);
  const [alert, setAlert] = useState('');
  const [startDateTime, setStartDateTime] = useState(null);
  const [endDateTime, setEndDateTime] = useState(null);
  const [selectedRow, setSelectedRow] = useState(0);

  const [studentOptions, setStudentOptions] = useState([]);
  const queryClient = useQueryClient();

  const {
    data: students,
    isLoading: studentsLoading,
    error: studentsError,
  } = useQuery({queryKey: ['students'], queryFn: fetchStudents});

  const {
    data: tutoringSessions,
    isLoading: tutoringSessionsLoading,
    error: tutoringSessionsError,
  } = useQuery({queryKey: ['tutoringSessions'], queryFn: fetchTutoringSessions});

  useEffect(() => {
    if (students) {
      const studentOptionsTemp = students.map(student => ({
        value: student.student_id,
        label: `${student.first_name} ${student.last_name} (ID: ${student.student_id})`,
      }));
      setStudentOptions(studentOptionsTemp);
      if (studentOptionsTemp.length > 0) {
        setStudent(defaultStudentId === -1? studentOptionsTemp[0].value : defaultStudentId);
      }
    }
  }, [students]);

  useEffect(() => {
    if (passedDate) {
      if(selectedRow === 0) setStartDateTime(passedDate);
      else setEndDateTime(passedDate);
    }
  }, [passedDate]);

  const { mutate: removeTutoringSessions, isLoading, isError, error } = useMutation({
    mutationFn: (formData) => deleteTutoringSessions(formData),
    onSuccess: () => {
      console.log('Tutoring session bulk deletion successful!');
      queryClient.invalidateQueries({ queryKey: ['tutoringSessions'] })
    },
    onError: (error) => {
      console.log('Error removing sessions: ', error.message);
    }
  });
  
  if (studentsLoading || tutoringSessionsLoading) return <div>Loading...</div>;
  if (studentsError || tutoringSessionsError) return <div>Error loading data</div>;

  const handleStudentChange = (selectedOption) => setStudent(selectedOption ? selectedOption.value : -1);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!startDateTime) {
      setAlert("Please select the starting date and time");
      return;
    }
    if (studentId === -1) {
      setAlert("Please select a student");
      return;
    }

    const formData = { student_id: studentId, startDateTime, endDateTime };
    removeTutoringSessions(formData);
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="d-flex justify-content-center mt-5 mb-5">
          <div className="col-12 shadow p-4 bg-body-tertiary rounded">
            {alert && (
              <div className="alert alert-danger" role="alert">
                {alert}
              </div>
            )}
            <h1 className="mb-4">Remove Tutoring Sessions</h1>
            <form onSubmit={handleSubmit}>
              {defaultStudentId === -1 && (
                <div className="mb-3">
                  <label className="form-label">Student</label>
                  <Select
                    options={studentOptions}
                    onChange={handleStudentChange}
                    placeholder="Select a student"
                    classNamePrefix="react-select"
                  />
                </div>
              )}

              <div
                className={`mb-3 p-2`} // Highlight start time row if selected
                onClick={() => setSelectedRow(0)} // Set selected row on click
                style={{ cursor: 'pointer', backgroundColor: selectedRow === 0 ? '#ffff99' : 'transparent' }} // Change cursor to pointer
              >
                <label className="form-label">Start Date and Time</label>
                <div className="d-flex align-items-center">
                  <DatePicker
                    selected={startDateTime}
                    onChange={setStartDateTime}
                    showTimeSelect
                    timeFormat="h:mm aa"
                    timeIntervals={30}
                    dateFormat="yyyy/MM/dd h:mm aa"
                    className="form-control me-2"
                    placeholderText="Select start date and time"
                  />
                  <FaCalendarAlt className="text-secondary" />
                </div>
              </div>

              <div
                className={`mb-3 p-2`} // Highlight end time row if selected
                onClick={() => setSelectedRow(1)} // Set selected row on click
                style={{ cursor: 'pointer', backgroundColor: selectedRow === 1 ? '#ffff99' : 'transparent' }} // Change cursor to pointer
              >
                <label className="form-label">End Date and Time (optional)</label>
                <div className="d-flex align-items-center">
                  <DatePicker
                    selected={endDateTime}
                    onChange={setEndDateTime}
                    showTimeSelect
                    timeFormat="h:mm aa"
                    timeIntervals={30}
                    dateFormat="yyyy/MM/dd h:mm aa"
                    className="form-control me-2"
                    placeholderText="Select end date and time"
                  />
                  <FaCalendarAlt className="text-secondary" />
                </div>
              </div>


              <div className="text-end">
                <button type="submit" className="btn btn-primary">
                  Remove All Sessions
                </button>
              </div>
            </form>
          </div>
        </div>
      </header>
    </div>
  );
};

export default RemoveTutoringSessions;

  