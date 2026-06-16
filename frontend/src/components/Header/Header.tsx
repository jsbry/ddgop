import { FaGear } from "react-icons/fa6";
import { GProps } from "../../pages/helper";

function Header(props: GProps) {
  const { content, setContent } = props;

  return (
    <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">ddgop</a>
        <div className="text-end">
          <a href="#" className={content == "Config" ? "nav-link active" : "nav-link link-dark"} onClick={() => setContent("Config")}>
            <FaGear className="text-white"></FaGear>
          </a>
        </div>
      </div>
    </nav>
  )
}

export default Header
