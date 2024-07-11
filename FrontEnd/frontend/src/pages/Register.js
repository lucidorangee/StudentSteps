import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useState } from 'react';
import { Outlet, Link, NavLink } from "react-router-dom";
import { Nav, Navbar } from 'react-bootstrap'

const Register = () => {

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      name: name,
      username: username,
      password: password,
      password2: password2,
    };

    try {
      const response = await fetch('http://localhost:4000/users/register', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Request was successful
        console.log('Registration successful!');
      } else {
        // Request failed
        console.error('Registration failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="App">
        <header className="App-header">
          <div className="position-absolute top-50 start-50 translate-middle h-50 w-50 container-fluid">
            <div className="position-relative mb-3" >
              <div className="shadow p-3 mb-5 bg-body-tertiary rounded">
                <div className="container-fluid m-3">
                  <h1>Register</h1>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="container-fluid m-3">
                    <label htmlFor="FormControlInput1" className="form-label">Name</label>
                    <input type="text" className="form-control" id="FormControlInput1" placeholder="name" onChange={(e) => setName(e.target.value)}></input>
                    <label htmlFor="FormControlInput1" className="form-label">Username address</label>
                    <input type="text" className="form-control" id="FormControlInput2" placeholder="name@example.com" onChange={(e) => setUsername(e.target.value)}></input>
                    <label htmlFor="inputPassword5" className="form-label">Password</label>
                    <input type="password" id="inputPassword5" className="form-control" aria-describedby="passwordHelpBlock" onChange={(e) => setPassword(e.target.value)} />
                    <label htmlFor="inputPassword5" className="form-label">Password Again</label>
                    <input type="password" id="inputPassword6" className="form-control" aria-describedby="passwordHelpBlock" onChange={(e) => setPassword2(e.target.value)} />
                  </div>
                  <div className="row align-items-start m-3">
                    <div className="col-10">
                      <button type="submit" className="btn btn-primary mb-3">Register</button>
                    </div>
                    <div className="col-2">
                      <Nav.Link as={NavLink} to='/' exact>Back</Nav.Link>
                    </div>
                    

                  </div>
                </form>
              </div>
            </div>
          </div>
        </header>
      </div>
  );
};
  
export default Register;

  