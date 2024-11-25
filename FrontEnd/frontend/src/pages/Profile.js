import React from 'react';
import { useUser } from '../components/UserContext';

const ProfilePage = () => {
    const { user } = useUser();

    if (!user) {
        return (
            <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
                <div className="text-center">
                    <h2 className="text-danger">Access Denied</h2>
                    <p className="text-muted">Please log in to view your profile.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5 bg-light">
            <div className="row justify-content-center">
                <div className="col-lg-6 col-md-8 col-sm-10">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-primary text-white">
                            <h2 className="h5 mb-0">Profile Details</h2>
                        </div>
                        <div className="card-body">
                            <div className="text-center mb-4">
                                <img
                                    src="https://via.placeholder.com/150"
                                    alt={`${user.name}'s avatar`}
                                    className="rounded-circle img-fluid shadow-sm"
                                    width="150"
                                    height="150"
                                    aria-label="User profile picture"
                                />
                            </div>
                            <div className="text-center mb-3">
                                <h3 className="fw-bold">{user.name}</h3>
                                <p className="text-muted mb-0">{user.role}</p>
                            </div>
                            <hr />
                            <div className="mt-3">
                                <h5>Contact Information</h5>
                                <ul className="list-unstyled">
                                    <li className="mb-2">
                                        <i className="bi bi-envelope me-2 text-primary"></i>
                                        <strong>Email:</strong> {user.email}
                                    </li>
                                    {/* Add more fields here as necessary */}
                                </ul>
                            </div>
                            <div className="d-flex justify-content-center mt-4">
                                <button
                                    className="btn btn-outline-primary me-2"
                                    aria-label="Edit Profile"
                                >
                                    <i className="bi bi-pencil me-2"></i>Edit Profile
                                </button>
                                <button
                                    className="btn btn-outline-danger"
                                    aria-label="Logout"
                                >
                                    <i className="bi bi-box-arrow-right me-2"></i>Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
