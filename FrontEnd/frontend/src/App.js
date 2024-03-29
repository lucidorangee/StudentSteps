import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
      
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container-fluid">
              <a href="#" className="navbar-brand">Tutorial Republic</a>
              <button type="button" className="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
                  <span className="navbar-toggler-icon"></span>
              </button>
              <div className="collapse navbar-collapse" id="navbarCollapse">
                  <div className="navbar-nav">
                      <a href="#" className="nav-item nav-link active">Home</a>
                      <a href="#" className="nav-item nav-link">Services</a>
                      <a href="#" className="nav-item nav-link">About</a>
                      <a href="#" className="nav-item nav-link">Contact</a>
                  </div>
                  <div className="navbar-nav ms-auto">
                      <a href="#" className="nav-item nav-link">Register</a>
                      <a href="#" className="nav-item nav-link">Login</a>
                  </div>
              </div>
          </div>
        </nav>

        <div className="accordion accordion-flush" id="myAccordion">
          <div className="accordion-item">
              <h2 className="accordion-header" id="headingOne">
                  <button type="button" className="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#collapseOne">1. What is HTML?</button>									
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
        
      </header>
    </div>
  );
}

export default App;
