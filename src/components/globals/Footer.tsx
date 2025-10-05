import { FaGithub } from "react-icons/fa";
import { BsPeople, BsWindowDock } from "react-icons/bs";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-light py-3">
      <div className="container">
        <div className="row gap-3 gap-md-0">
          {/* Social Media (Mobile First) */}
          <div className="col-12 col-md-6 d-flex flex-column gap-3 order-1 order-md-2 justify-content-start justify-content-md-end flex-lg-row">
            <a
              href="https://www.spaceappschallenge.org/2025/find-a-team/solaria4/"
              target="_blank"
              rel="noopener noreferrer"
              className="d-inline-flex align-items-center gap-2 text-light text-decoration-none fw-bold"
            >
              <BsPeople size={24} />
              Solaria Team
            </a>
            <a
              href="https://www.spaceappschallenge.org/2025/challenges/embiggen-your-eyes/"
              target="_blank"
              rel="noopener noreferrer"
              className="d-inline-flex align-items-center gap-2 text-light text-decoration-none fw-bold"
            >
              <BsWindowDock size={24} />
              See full challenge description
            </a>
            <a
              href="https://github.com/Guillhermm/nasa-2025-solaria"
              target="_blank"
              rel="noopener noreferrer"
              className="d-inline-flex align-items-center gap-2 text-light text-decoration-none fw-bold"
            >
              <FaGithub size={24} />
              See full code
            </a>
          </div>

          {/* Copyright (Mobile Last) */}
          <div className="col-12 col-md-6 order-2 order-md-1">
            <p className="m-0">&copy; {currentYear}. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;