import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { Nav, Navbar } from 'react-bootstrap'
import Select from 'react-select';

const ManageDueHomework = () => {
  const [homeworkList, setHomeworkList] = useState([]);
  const [students, setStudents] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const [datetime, setDatetime] = useState('');
  const [filteredHomeworkList, setFilteredHomeworkList] = useState([]);

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [homeworkResponse, studentResponse, scheduleResponse] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_BASE_URL}/homework`, {
            credentials: 'include'
          }),
          fetch(`${process.env.REACT_APP_API_BASE_URL}/students`, {
            credentials: 'include'
          }),
          fetch(`${process.env.REACT_APP_API_BASE_URL}/tutoringsessions`, {
            credentials: 'include'
          }),
        ]);
  
        if (!homeworkResponse.ok || !studentResponse.ok) throw new Error('One or more fetch requests failed');
  
        const homeworkData = await homeworkResponse.json();
        const studentData = await studentResponse.json();
        const scheduleData = await scheduleResponse.json();
  
        setHomeworkList(homeworkData);
        setFilteredHomeworkList(homeworkData);
        setStudents(studentData);
        setSchedules(scheduleData);
      } catch (error) {
        console.error("Error fetching homework, students, or schedule data: ", error);
      }
    };
  
    fetchData();
  }, []);

  

  return (
    <div className="App">
      <h2>Welcome, User!</h2>
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


      <table className="table custom-table">
        <thead>
          <tr>
            <th>Student ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Subject</th>
            <th>Notes</th>
            <th>Completed?</th>
          </tr>
        </thead>
        <tbody>
        {Array.isArray(filteredHomeworkList) && (filteredHomeworkList).length > 0 ? (
          (filteredHomeworkList).map((homework, index) => (
            <tr key={index}>
              <td>{homework.homework_id}</td>
              <td>{homework.student_id}</td>
              <td>{homework.student_id}</td>
              <td>{homework.subject}</td>
              <td>{homework.notes}</td>
              <td>{homework.completed}</td>
              
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