"use client";

import Link from "next/link";
import { Navbar, Nav } from "react-bootstrap";
import Image from "next/image";
import ThemeSwitcher from "./ThemeSwitcher";
import profile from "../assets/logos/logo.png";

const Header: React.FC = () => {
  return (
    <header>
      {/* Navigation Bar */}
      <Navbar bg="dark" variant="dark" expand="lg">
        <div className="container">
          {/* Profile Section (Above Navbar) */}
          <div className="profile-header py-2">
            <div className="d-flex align-items-center gap-2">
              <Link href="./">
                <Image
                  aria-hidden
                  src={profile}
                  alt="Solaria App Logo"
                  width={48}
                  height={48}
                  className="rounded-circle"
                />
              </Link>
              <Link href="./" className="text-decoration-none">
                <h5 className="m-0 text-light profile-title">Solaria App</h5>
              </Link>
            </div>
          </div>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {/* Use Link for routing to pages */}
              {/* <Nav.Link as={Link} to="/">
                {t('pages.home.title')}
              </Nav.Link> */}
              <div className="d-lg-flex justify-content-lg-center align-items-lg-center">
                <ThemeSwitcher />
              </div>
            </Nav>
          </Navbar.Collapse>
        </div>
      </Navbar>
    </header>
  );
};

export default Header;
