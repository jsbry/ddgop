import { HiOutlineCube, HiOutlineCubeTransparent } from "react-icons/hi2";
import { FaRegHdd } from "react-icons/fa";
import { HiOutlineWrench } from "react-icons/hi2";
import { Badge } from 'react-bootstrap';

type GProps = {
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
};

function Sidebar(props: GProps) {
  const { content, setContent } = props;

  return (
    <nav className="sidebar d-flex flex-column flex-shrink-0 bg-light">
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <a href="#" className={content == "Containers" ? "nav-link active" : "nav-link link-dark"} onClick={() => setContent("Containers")}>
            <HiOutlineCube className="me-2"></HiOutlineCube>
            Containers
          </a>
        </li>
        <li>
          <a href="#" className={content == "Images" ? "nav-link active" : "nav-link link-dark"} onClick={() => setContent("Images")}>
            <HiOutlineCubeTransparent className="me-2"></HiOutlineCubeTransparent>
            Images
          </a>
        </li>
        <li>
          <a href="#" className={content == "Volumes" ? "nav-link active" : "nav-link link-dark"} onClick={() => setContent("Volumes")}>
            <FaRegHdd className="me-2"></FaRegHdd>
            Volumes
          </a>
        </li>
        <li>
          <a href="#" className={content == "Builds" ? "nav-link active" : "nav-link link-dark"} onClick={() => setContent("Builds")}>
            <HiOutlineWrench className="me-2"></HiOutlineWrench>
            Builds <Badge bg="dark">WIP</Badge>
          </a>
        </li>
      </ul>
    </nav>
  )
}

export default Sidebar
