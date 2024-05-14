import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../App.css';
import { Outlet, Link, NavLink } from "react-router-dom";
import { Nav, Navbar } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap';

const Home = () => {
    return (
        <div className="App">
          <header className="App-header">
          
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
              <div className="container-fluid">
                    <a href="#" className="navbar-brand">StudentSteps</a>
                    <button type="button" className="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarCollapse">
                        <div className="navbar-nav">
                            <Nav.Link as={NavLink} to='/Login' exact>Login</Nav.Link>
                            
                            <a href="#" className="nav-item nav-link">Services</a>
                            <a href="#" className="nav-item nav-link">About</a>
                            <Nav.Link as={NavLink} to='/ManageUsers' exact>ManageUsers</Nav.Link>
                        </div>
                        <div className="navbar-nav ms-auto">
                          <a href="#" className="nav-item nav-link">Register</a>
                          <Nav.Link as={NavLink} to='/Login' exact>Login</Nav.Link>
                        </div>
                    </div>
                </div>
            </nav>
    
            <div className="row">
              <div className="col-md-2">
                <div className="accordion accordion-flush" id="myAccordion">
                  <div className="accordion-item">
                      <h2 className="accordion-header" id="headingOne">
                          <button type="button" className="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#collapseOne">1. Schedule?</button>									
                      </h2>
                      <div id="collapseOne" className="accordion-collapse collapse" data-bs-parent="#myAccordion">
                          <div className="card-body">
                              <p>HTML stands for HyperText Markup Language. HTML is the standard markup language for describing the structure of web pages. <a href="https://www.tutorialrepublic.com/html-tutorial/" target="_blank">Learn more.</a></p>
                          </div>
                      </div>
                  </div>
                  <div className="accordion-item">
                      <h2 className="accordion-header" id="headingTwo">
                          <button type="button" className="accordion-button" data-bs-toggle="collapse" data-bs-target="#collapseTwo">2. What is Bootstrap?</button>
                      </h2>
                      <div id="collapseTwo" className="accordion-collapse collapse show" data-bs-parent="#myAccordion">
                          <div className="card-body">
                              <p>Bootstrap is a sleek, intuitive, and powerful front-end framework for faster and easier web development. It is a collection of CSS and HTML conventions. <a href="https://www.tutorialrepublic.com/twitter-bootstrap-tutorial/" target="_blank">Learn more.</a></p>
                          </div>
                      </div>
                  </div>
                  <div className="accordion-item">
                    <h2 className="accordion-header" id="headingThree">
                        <button type="button" className="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#collapseThree">3. What is CSS?</button>                     
                    </h2>
                    <div id="collapseThree" className="accordion-collapse collapse" data-bs-parent="#myAccordion">
    
                      <div className="card-body">
                          <p>CSS stands for Cascading Style Sheet. CSS allows you to specify various style properties for a given HTML element such as colors, backgrounds, fonts etc. <a href="https://www.tutorialrepublic.com/css-tutorial/" target="_blank">Learn more.</a></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-10 mb=3">
                <div className="row mt-3">
                  <div className="card" style={{width:'95%'}}>
                      <div className="card-body text-left">
                        <h5 className="card-title">Sunny Choo</h5>
                        <p className="card-text">Sunny is a visionary designer, celebrated for their mastery in crafting intricate designs and products that seamlessly blend innovation and craftsmanship, transcending boundaries to redefine the art of design.</p>
                        
                        
                        <div className="input-group mb-3">
                          <span className="input-group-text" id="comment-input-text">Comment: </span>
                          <textarea className="form-control" aria-label="With textarea" rows="6"></textarea>
                        </div>
                      </div>
                    </div>
                </div>
                
                <div className="row mt-3">
                  <div className="card" style={{width:'95%'}}>
                    <div className="card-body text-left">
                      <h5 className="card-title">Jihoo Ahn</h5>
                      <p className="card-text">Second Example</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </header>
        </div>
      );
  };
  
  export default Home;