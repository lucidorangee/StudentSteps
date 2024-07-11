import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Sidebar from './SideBar.js';
import Topbar from './TopBar.js';
import { Outlet, Link } from "react-router-dom";

const Layout = () => {
  return (
    <div className="container-fluid">
      <div className="row">
        <Topbar />
      </div>
      <div className="row">
        <div className="col-2 p-0">
          <Sidebar />
        </div>
        <div className="col-10">
          <div className="content">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
};

export default Layout;
