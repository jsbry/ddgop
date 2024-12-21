import { FaGear } from "react-icons/fa6";

function Header() {
  return (
    <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">ddgop</a>
        <div className="text-end">
          <a href="#">
            <FaGear className="text-white"></FaGear>
          </a>
        </div>
      </div>
    </nav>
  )
}

export default Header
