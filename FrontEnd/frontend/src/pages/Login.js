import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Nav, Navbar } from 'react-bootstrap'
import { useQuery,  useQueryClient, useMutation } from '@tanstack/react-query';

const postLogin = async (formData) => {
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/login`, {
    credentials: 'include',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const responseText = response.json().message;
    const err = new Error('Login failed:', response.responseText); // Include responseText in the error for context
    err.status = response.status;
    throw err;
  }

  return response.json();
}

const Login = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const { mutate: attemptLogin, isLoading, isError, error } = useMutation({
      mutationFn: (formData) => postLogin(formData),
      onSuccess: (formData) => {
        console.log('Login successful!');
        const redirectTo = new URLSearchParams(location.search).get('redirect') || `/schedule/list/${new Date().toISOString().substring(0, 10)}`;
        navigate(redirectTo);
      },
      onError: (error) => {
        console.log('Error logging in', error.message);
      }
    });

    const handleSubmit = async (e) => {
      e.preventDefault();

      const formData = {
        username: username,
        password: password
      };

      attemptLogin(formData);
    };

    return (
      <div className="App">
          <header className="App-header">
            <div className="position-absolute top-50 start-50 translate-middle h-50 w-50 container-fluid">
              <div className="position-relative mb-3" >
                <div className="shadow p-3 mb-5 bg-body-tertiary rounded">
                  <div className="container-fluid m-3">
                    <h1>Log In</h1>
                  </div>
                  <form onSubmit={handleSubmit}>
                    <div className="container-fluid">
                      <label htmlFor="exampleFormControlInput1" className="form-label">Username address</label>
                      <input type="text" className="form-control" id="exampleFormControlInput1" placeholder="name@example.com" onChange={(e) => setUsername(e.target.value)}></input>
                      <label htmlFor="inputPassword5" className="form-label">Password</label>
                      <input type="password" id="inputPassword5" className="form-control" aria-describedby="passwordHelpBlock" onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <div className="row align-items-start m-3">
                      <div className="col-10">
                        {!isLoading ? <button type="submit" className="btn btn-primary mb-3">Log in</button>:<div></div>}
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
  
  export default Login;

  