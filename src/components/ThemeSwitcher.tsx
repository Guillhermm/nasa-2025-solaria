'use client';

import { useEffect } from 'react';
import { Nav } from 'react-bootstrap';
import { BsSun, BsMoon } from 'react-icons/bs';
import { useTheme } from '../context/ThemeProvider';

const ThemeSwitcher = () => {
  const [theme, toggleTheme] = useTheme();

  useEffect(() => {
    document.body.classList.add('theme-loaded');
  }, []);

  return (
    <Nav.Link
      onClick={toggleTheme}
      className="theme-switcher d-flex align-items-center gap-2 d-flex align-items-center"
    >
      {theme === 'light' ? (
        <>
          <BsMoon size={20} />
          <span className="d-lg-none">Dark Theme</span>
        </>
      ) : (
        <>
          <BsSun size={20} />
          <span className="d-lg-none">Light Theme</span>
        </>
      )}
    </Nav.Link>
  );
};

export default ThemeSwitcher;
