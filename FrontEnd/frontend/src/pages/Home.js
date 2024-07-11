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
            <div className="row">
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
            
          </header>
        </div>
      );
  };
  
  export default Home;