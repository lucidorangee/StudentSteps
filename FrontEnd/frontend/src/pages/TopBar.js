import React from 'react';
import { Outlet, Link, NavLink } from "react-router-dom";
import { Nav, Navbar } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap';

const Topbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
            <a href="#" className="navbar-brand">StudentSteps</a>
            <button type="button" className="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarCollapse">
                <div className="navbar-nav">
                    <Nav.Link as={NavLink} to='/admin/users' exact>Admin</Nav.Link>
                    <a href="#" className="nav-item nav-link">Schedule</a>
                    <a href="#" className="nav-item nav-link">Finance</a>
                    <Nav.Link as={NavLink} to='/admin/tutors' exact>Tutors</Nav.Link>
                    <Nav.Link as={NavLink} to='/admin/students' exact>Students</Nav.Link>
                    <Nav.Link as={NavLink} to='/admin/roles' exact>Roles</Nav.Link>
                    <Nav.Link as={NavLink} to='/admin/homework' exact>Homework</Nav.Link>
                    <Nav.Link as={NavLink} to='/comments' exact>Comments</Nav.Link>
                    <Nav.Link as={NavLink} to='/tutoringsessions' exact>Sessions</Nav.Link>
                </div>
                <div className="navbar-nav ms-auto">
                    <Nav.Link as={NavLink} to='/register' exact>Register</Nav.Link>
                    <Nav.Link as={NavLink} to='/login' exact>Login</Nav.Link>
                    <Nav.Link as={NavLink} to='/logout' exact>Logout</Nav.Link>
                </div>
            </div>
        </div>
    </nav>
  );
};

export default Topbar;