// src/components/Header.jsx
import React, { useState } from "react";
import { FaGithub, FaLinkedin, FaEnvelope, FaInfoCircle } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const HEADER_HEIGHT = 60;

const Header = () => {
  const [infoOpen, setInfoOpen] = useState(false);

  const developerInfo = {
    name: "Het Vaghani",
    github: "https://github.com/vaghanihet2001",
    linkedin: "https://www.linkedin.com/in/ai-ml-developer",
    email: "vaghanihet2001@gmail.com",
  };

  return (
    <header className="d-flex align-items-center justify-content-between px-3 bg-dark text-white" style={{ height: HEADER_HEIGHT, borderBottom: "1px solid #333", position: "relative" }}>
      {/* Logo and App Name */}
      <div className="d-flex align-items-center gap-2">
        <img src="src/assets/logo-removebg.png" alt="HEX Logo" className="img-fluid" style={{ height: "40px" }} />
        <span className="fw-bold fs-5">HexFlow</span>
      </div>

      {/* Developer Info Button */}
      <div className="position-relative">
        <button
          className="btn btn-dark text-white"
          onClick={() => setInfoOpen(!infoOpen)}
        >
          <FaInfoCircle size={22} />
        </button>

        {/* Info Panel */}
        {infoOpen && (
          <div className="card position-absolute end-0 mt-2" style={{ width: "220px", backgroundColor: "#2c2c2c", color: "#fff", zIndex: 1000 }}>
            <div className="card-body p-3">
              <h6 className="card-title mb-3">{developerInfo.name}</h6>
              <div className="d-flex flex-column gap-2">
                <a href={developerInfo.github} target="_blank" rel="noopener noreferrer" className="d-flex align-items-center text-white text-decoration-none gap-2">
                  <FaGithub /> GitHub
                </a>
                <a href={developerInfo.linkedin} target="_blank" rel="noopener noreferrer" className="d-flex align-items-center text-white text-decoration-none gap-2">
                  <FaLinkedin /> LinkedIn
                </a>
                <a href={`mailto:${developerInfo.email}`} className="d-flex align-items-center text-white text-decoration-none gap-2">
                  <FaEnvelope /> Email
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
export { HEADER_HEIGHT };
