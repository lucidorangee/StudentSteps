import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink } from "react-router-dom";
import { useUser } from '../components/UserContext';

const Topbar = () => {
    const { user } = useUser();

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container-fluid">
                <a href="#" className="navbar-brand">StudentSteps</a>
                <button 
                    type="button" 
                    className="navbar-toggler" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#navbarCollapse"
                >
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
                        {user ? (
                            <div className="nav-item dropdown">
                                <a 
                                    href="#" 
                                    className="nav-link dropdown-toggle" 
                                    id="userDropdown" 
                                    role="button" 
                                    data-bs-toggle="dropdown" 
                                    aria-expanded="false"
                                >
                                    {user.name}
                                </a>
                                <ul 
                                    className="dropdown-menu dropdown-menu-end"
                                    aria-labelledby="userDropdown"
                                    style={{
                                        backgroundColor: '#343a40', // Dark background
                                        color: '#ffffff' // White text
                                    }}
                                >
                                    <li>
                                        <Nav.Link 
                                            as={NavLink} 
                                            to='/profile' 
                                            className="dropdown-item"
                                            style={{ color: '#ffffff' }}
                                        >
                                            Profile
                                        </Nav.Link>
                                    </li>
                                    <li>
                                        <Nav.Link 
                                            as={NavLink} 
                                            to='/logout' 
                                            className="dropdown-item"
                                            style={{ color: '#ffffff' }}
                                        >
                                            Logout
                                        </Nav.Link>
                                    </li>
                                </ul>
                            </div>
                        ) : (
                            <>
                                <Nav.Link as={NavLink} to='/register' exact>Register</Nav.Link>
                                <Nav.Link as={NavLink} to='/login' exact>Login</Nav.Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Topbar;
