import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { Nav, Navbar } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { FaCalendarAlt, FaPlus, FaTrash } from 'react-icons/fa';
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

const CreateTutoringSession = ({defaultStudentId = -1, passedDate = null}) => {

  const [student_id, setStudent] = useState(defaultStudentId);
  const [tutor_id, setTutor] = useState(-1);
  const [notes, setNotes] = useState('');
  const [alert, setAlert] = useState('');
  const [dateTimeList, setDateTimeList] = useState([{ date: new Date(), hour: 1, minute: 0 }]);
  const [repeatCount, setRepeatCount] = useState(1);
  const [selectedRow, setSelectedRow] = useState(0);

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
        setStudent(defaultStudentId === -1? studentOptionsTemp[0].value : defaultStudentId);
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

  useEffect(() => {
    if (passedDate) {
      const updatedList = [...dateTimeList];
      updatedList[selectedRow].date = passedDate;
      setDateTimeList(updatedList);
    }
  }, [passedDate]);

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

    if (dateTimeList.length === 0)
    {
      setAlert("Please add at least one tutoring session.");
      return;
    }

    for(const dateTime of dateTimeList)
    {
      if (!(Number.isInteger(dateTime.hour) && dateTime.hour >= 0 && dateTime.hour <= 9))
      {
        setAlert("The hour field for a session is not valid. It must be an integer between 0 and 9.");
        console.log(`hour is ${dateTime.hour} and is ${typeof dateTime.hour}`);
        return;
      }

      if (!(Number.isInteger(dateTime.minute) && dateTime.minute >= 0 && dateTime.minute <= 59))
        {
          setAlert("The minute field for a session is not valid. It must be an integer between 0 and 59.");
          console.log(`hour is ${dateTime.minute} and is ${typeof dateTime.minute}`);
          return;
        }
    }

    if (!(Number.isInteger(repeatCount) && repeatCount >= 1 && repeatCount <= 100))
    {
      setAlert("The Repeat Count is not a valid number. It must be an integer between 1 and 100.");
      console.log(`hour is ${repeatCount} and is ${typeof repeatCount}`);
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
      dateTimeList: dateTimeList,
      repeatCount: repeatCount,
      notes: notes,
    };

    createTutoringSession(formData);
  };

  const handleDateChange = (index, date) => {
    const updatedList = [...dateTimeList];
    updatedList[index].date = date;
    setDateTimeList(updatedList);
  };

  const handleAddDateTime = () => {
    setDateTimeList([...dateTimeList, { date: new Date(), hour: 1, minute: 0 }]);
  };

  const handleRemoveDateTime = (index) => {
    const updatedList = dateTimeList.filter((_, i) => i !== index);
    setDateTimeList(updatedList);
    if (selectedRow === index) {
      setSelectedRow(null); // Deselect if the removed row was selected
  } else if (selectedRow > index) {
      setSelectedRow(selectedRow - 1); // Adjust selected row if a row above is removed
  }
  };
  
  const handleRepeatCountChange = (e) => {
    setRepeatCount(parseInt(e.target.value));
  };
//col-md-10 col-lg-8
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
            <h1 className="mb-4">Add Session</h1>
            <form onSubmit={handleSubmit}>
              {defaultStudentId === -1?
              <div className="mb-3">
                <label className="form-label">Student</label>
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
              </div>:null}
              <div className="mb-3">
                <label className="form-label">Tutor</label>
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

              <label className="form-label">Date and Time</label>
              {dateTimeList.map((entry, index) => (
                <div
                    key={index}
                    className={`d-flex align-items-center mb-3 p-2`}
                    onClick={() => setSelectedRow(index)} 
                    style={{ cursor: 'pointer' , backgroundColor: selectedRow === index ? '#ffff99' : 'transparent'}} 
                >
                  <div className="me-3" style={{ flex: '6' }}>
                    <DatePicker
                      selected={entry.date}
                      onChange={(date) => handleDateChange(index, date)}
                      showTimeSelect
                      timeFormat="h:mm aa"
                      timeIntervals={30}
                      dateFormat="yyyy/MM/dd h:mm aa"
                      className="form-control me-3 flex-grow-1"
                      placeholderText="Select date and time"
                    />
                  </div>
                  
                  <FaCalendarAlt className="ms-2 text-secondary" />

                  <div className="d-flex align-items-center ms-4" style={{ flex: '2' }}>
                    <label className="form-label me-2">Hour:</label>
                    <input
                      type="number"
                      className="form-control w-50"
                      value={entry.hour}
                      onChange={(e) => {
                        const updatedList = [...dateTimeList];
                        const newHour = Math.max(0, Math.min(9, parseInt(e.target.value, 10) || 0)); // Convert to number
                        updatedList[index].hour = newHour;
                        setDateTimeList(updatedList);
                      }}
                      style={{ MozAppearance: 'textfield', WebkitAppearance: 'none' }}
                    />
                  </div>
                  
                  <div className="d-flex align-items-center ms-3" style={{ flex: '2' }}>
                    <label className="form-label me-2">Minutes:</label>
                    <input
                      type="number"
                      className="form-control w-50"
                      value={entry.minute.toString().padStart(2, '0')}
                      onChange={(e) => {
                        const updatedList = [...dateTimeList];
                        const newMinute = Math.max(0, Math.min(59, parseInt(e.target.value, 10) || 0)); // Convert to number
                        updatedList[index].minute = newMinute;
                        setDateTimeList(updatedList);
                      }}
                      style={{ MozAppearance: 'textfield', WebkitAppearance: 'none' }} // To hide spinner
                    />
                  </div>

                  <button
                    type="button"
                    className="btn btn-outline-danger ms-3"
                    onClick={() => handleRemoveDateTime(index)}
                    style={{ flex: '2' }}
                  >
                    <FaTrash /> Remove
                  </button>
                </div>
              ))}
              
              <button type="button" className="btn btn-outline-primary mb-3" onClick={handleAddDateTime}>
                <FaPlus /> Add Date and Time
              </button>

              <div className="mb-3">
                <label className="form-label">Number of Sessions to Repeat</label>
                <input
                  type="number"
                  className="form-control"
                  value={repeatCount}
                  onChange={handleRepeatCountChange}
                  style={{ MozAppearance: 'textfield', WebkitAppearance: 'none' }}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-control"
                  rows="4"
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="text-end">
                <button type="submit" className="btn btn-primary">Add Session</button>
              </div>
            </form>
          </div>
        </div>
      </header>
    </div>
  );
};
  
export default CreateTutoringSession;

  