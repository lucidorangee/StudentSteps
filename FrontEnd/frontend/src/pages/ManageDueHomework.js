import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { Nav, Navbar } from 'react-bootstrap'
import DatePicker from 'react-datepicker';
import { FaCalendarAlt } from 'react-icons/fa';
import Select from 'react-select';
import { useQuery,  useQueryClient, useMutation } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';

const fetchStudents = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/students`, {
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

const fetchHomework = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/homework`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch homework');
  }
  return response.json();
};

const updateHomeworkCompletion = async (updatedHomeworkList) => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/homework/completion`, {
    credentials: 'include',
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(Array.from(updatedHomeworkList)),
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error('Failed to update completion: ' + responseText); // Include responseText in the error for context
  }

  return;
}

const ManageDueHomework = () => {
  const queryClient = useQueryClient();
  //const [homeworkList, setHomeworkList] = useState([]);
  //const [students, setStudents] = useState([]);
  //const [schedules, setSchedules] = useState([]);

  const [datetime, setDatetime] = useState('');
  const [filteredHomeworkList, setFilteredHomeworkList] = useState([]);
  const [updatedHomeworkList, setUpdatedHomeworkList] = useState(new Map());


  const findStudentName = (id) => {
    for(let i = 0; i < students.length; i++)
    {
      if(students[i].student_id === id) return students[i].first_name + " " + students[i].last_name;
    }
    return "No Name Found";
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const targetDate = new Date(datetime); 
    const targetDateOnly = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

    let temp = [];
    for(let i = 0; i < homeworkList.length; i++)
    {
      if(homeworkList[i].completed > 0) continue;

      const givenDate = new Date(homeworkList[i].due_date);
      const givenDateOnly = new Date(givenDate.getFullYear(), givenDate.getMonth(), givenDate.getDate());
      if(targetDateOnly.getTime() >= givenDateOnly.getTime())
      {
        temp.push(homeworkList[i]);
      }
    }
    setFilteredHomeworkList(temp);
  };

  const {
    data: students,
    isLoading: studentsLoading,
    error: studentsError,
  } = useQuery({queryKey: ['students'], queryFn: () => fetchStudents()});

  const {
    data: homeworkList,
    isLoading: homeworkListLoading,
    error: homeworkListError,
  } = useQuery({queryKey: ['homework'], queryFn: () => fetchHomework()});

  useEffect(() => {
    setFilteredHomeworkList(homeworkList);
  }, [homeworkList]);

  const handleSelect = (homework_id, value) => {
    const updatedFilteredHomeworkList = filteredHomeworkList.map((homework) => 
      homework.homework_id === homework_id
        ? { ...homework, is_completed: value } 
        : homework
    );
    
    setFilteredHomeworkList(updatedFilteredHomeworkList);

    setUpdatedHomeworkList(updatedHomeworkList => {
      const newList = new Map(updatedHomeworkList);
      newList.set(homework_id, value);
      return newList;
    });
  };

  const { mutate: updateHomework, isLoading, isError, error } = useMutation({
    mutationFn: (updatedHomeworkList) => updateHomeworkCompletion(updatedHomeworkList),
    onSuccess: () => {
      queryClient.invalidateQueries(['homework']);
      console.log("Successfully updated");
      setUpdatedHomeworkList(new Map());
    },
    onError: (error) => {
      console.log('Error updating homework:', error.message);
    }
  });

  /*const {
    data: tutoringSessionList,
    isLoading: tutoringSessionLoading,
    error: tutoringSessionError,
  } = useQuery({queryKey: ['tutoringSession'], queryFn: () => fetchTutoringSessions()});*/
  
  
  if (homeworkListLoading || studentsLoading) return <div>Loading...</div>;
  if (homeworkListError) {
    if(homeworkListError.status === 401) //unauthorized
    {
      console.log("unathorized");
      return <Navigate to="/login" />;
    }
    console.log(homeworkListError.status);
    return <div>Error loading data</div>;
  }
  if (studentsError) {
    if(studentsError.status === 401) //unauthorized
    {
      console.log("unathorized");
      return <Navigate to="/login" />;
    }
    console.log(studentsError.status);
    return <div>Error loading data</div>;
  }

  

  return (
    <div className="App">
      <h2>Welcome, User!</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="FormControlInput1" className="form-label">Datetime</label>
        <div className="d-flex align-items-center">
          <div className="col-2">
            <DatePicker
              selected={datetime}
              onChange={setDatetime}
              dateFormat="yyyy/MM/dd"
              className="form-control"
              placeholderText="Select a date"
            />
            <FaCalendarAlt className="ms-2 text-secondary" />
          </div>
          <div className="col-3">
            <button type="submit" className="btn btn-primary mb-3">Refresh</button>
          </div>
          <div className="col-5">
            {/* Empty column */}
          </div>
          <div className="col-2">
            <button type="button" className="btn btn-success mb-3" onClick={() => updateHomework(updatedHomeworkList)}>Apply</button>
          </div>
        </div>
      </form>


      <table className="table custom-table">
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Name</th>
            <th>Subject</th>
            <th>Notes</th>
            <th>Completed?</th>
          </tr>
        </thead>
        <tbody>
        {Array.isArray(filteredHomeworkList) && (filteredHomeworkList).length > 0 ? (
          (filteredHomeworkList).filter(homework => homework.is_completed === 0).map((homework, index) => (
            <tr key={index}>
              <td>{homework.homework_id}</td>
              <td>{findStudentName(homework.student_id)}</td>
              <td>{homework.subject}</td>
              <td>{homework.notes}</td>
              <td>
                <button
                  className="btn btn-secondary dropdown-toggle"
                  type="button"
                  id="dropdownMenuButton"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                {homework.is_completed}
                </button>
                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <li key={num}>
                      <button className="dropdown-item" onClick={() => handleSelect(homework.homework_id, num)}>
                        {num}
                      </button>
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          ))):(
            <tr>
              <td colSpan="5">No data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    
  );
};

export default ManageDueHomework;