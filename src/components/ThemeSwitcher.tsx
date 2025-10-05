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
      className="text-white theme-switcher d-flex align-items-center gap-2 d-flex align-items-center p-2"
    >
      {theme === 'light' ? (
        <>
          <BsMoon size={24} />
        </>
      ) : (
        <>
          <BsSun size={24} />
        </>
      )}
    </Nav.Link>
  );
};

export default ThemeSwitcher;
