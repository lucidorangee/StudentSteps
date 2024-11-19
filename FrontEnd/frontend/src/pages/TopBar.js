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
                    <Nav.Link as={NavLink} to='/admin/analysis' exact>Admin</Nav.Link>
                    <Nav.Link as={NavLink} to='/schedule/list' exact>Schedule</Nav.Link>
                    <Nav.Link as={NavLink} to='/edcoordinator' exact>EdCoordinator</Nav.Link>
                    <Nav.Link as={NavLink} to='/profile' exact>Profile</Nav.Link>
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