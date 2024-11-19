import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './css/SideBar.css';

const Sidebar = () => {
  const currentDate = new Date().toISOString().substring(0, 10);
  const location = useLocation();

  // Determine the current base path
  const basePath = location.pathname.split('/')[1]; // Get the first segment of the path

  // Menu items based on basePath
  const menuItems = {
    admin: [
      { to: `/admin/analysis`, icon: 'bi-clipboard-data', label: 'Analysis' },
      { to: `/admin/manage`, icon: 'bi-gear', label: 'Manage Admin' },
    ],
    schedule: [
      { to: `/schedule/list/${currentDate}`, icon: 'bi-house-door-fill', label: 'List View' },
      { to: `/schedule/Weekly/${currentDate}`, icon: 'bi-journal-bookmark-fill', label: 'Weekly View' },
      { to: `/schedule/Calendar/${currentDate}`, icon: 'bi-envelope-fill', label: 'Calendar View' },
      { to: `/schedule/create`, icon: 'bi-bookmark-plus', label: 'Add Schedule' },
      { to: `/schedule/daily`, icon: 'bi-calendar-check', label: 'Daily Schedule' },
      { to: `/schedule/approval`, icon: 'bi-check2-square', label: 'Approve Comments' },
    ],
    edcoordinator: [
      { to: `/students/create`, icon: 'bi-person-fill-add', label: 'Add Student' },
      { to: `/tutors/create`, icon: 'bi-person-add', label: 'Add Tutor' },
      { to: `/homework/create`, icon: 'bi-pencil-square', label: 'Add Homework' },
      { to: `/edcoordinator/manage`, icon: 'bi-people-fill', label: 'Manage Students/Tutors' },
    ],
    default: [
      { to: `/`, icon: 'bi-house', label: 'Home' },
      { to: `/profile`, icon: 'bi-person-circle', label: 'Profile' },
    ],
  };

  // Select menu items based on the base path, or use default
  const itemsToShow = menuItems[basePath] || menuItems.default;

  return (
    <div className="sidebar d-flex flex-column min-vh-100 position-sticky top-0 p-3 bg-dark">
      <ul className="nav nav-pills flex-column mb-10">
        {itemsToShow.map((item, index) => (
          <li className="nav-item" key={index}>
            <NavLink to={item.to} className="nav-link text-white" activeclassname="active">
              <i className={`bi ${item.icon} me-2`}></i> {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
