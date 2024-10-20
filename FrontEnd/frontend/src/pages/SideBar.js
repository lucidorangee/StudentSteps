import React from 'react';
import { NavLink } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './css/SideBar.css';

const Sidebar = () => {
  const currentDate = new Date().toISOString().substring(0, 10);

  return (
    <div className="sidebar d-flex flex-column min-vh-100 position-sticky top-0 p-3 bg-dark">
      <ul className="nav nav-pills flex-column mb-10">
        <li className="nav-item">
          <NavLink to={`/schedule/list/${currentDate}`} className="nav-link text-white" activeclassname="active">
            <i className="bi bi-house-door-fill me-2"></i> List View
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to={`/schedule/Weekly/${currentDate}`} className="nav-link text-white" activeclassname="active">
            <i className="bi bi-journal-bookmark-fill me-2"></i> Weekly View
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to={`/schedule/Calendar/${currentDate}`} className="nav-link text-white" activeclassname="active">
            <i className="bi bi-envelope-fill me-2"></i> Calendar View
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to={`/schedule/create`} className="nav-link text-white" activeclassname="active">
            <i className="bi bi-bookmark-plus me-2"></i> Add Schedule
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to={`/students/create`} className="nav-link text-white" activeclassname="active">
            <i className="bi bi-person-fill-add me-2"></i> Add Student
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to={`/tutors/create`} className="nav-link text-white" activeclassname="active">
            <i className="bi bi-person-add me-2"></i> Add Tutor
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to={`/homework/create`} className="nav-link text-white" activeclassname="active">
            <i className="bi bi-person-add me-2"></i> Add Homework
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to={`/schedule/daily`} className="nav-link text-white" activeclassname="active">
            <i className="bi bi-person-add me-2"></i> Daily Schedule
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to={`/schedule/daily`} className="nav-link text-white" activeclassname="active">
            <i className="bi bi-person-add me-2"></i> Approve Comments
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;