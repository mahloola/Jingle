// Navbar.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { auth, signOut } from '../../firebase/firebase';
import styles from './Navbar.module.css';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser, userLoggedIn } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      closeMenu();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
    closeMenu();
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContainer}>
        {/* Logo */}
        <div className={styles.navbarLogo}>
          <a
            href='/'
            onClick={closeMenu}
          >
            &nbsp;
            <img src='/assets/lyre.png'/>
          </a>
        </div>

        {/* Hamburger Menu for Mobile */}
        <button
          className={`${styles.hamburgerMenu} ${isMenuOpen ? styles.open : ''}`}
          onClick={toggleMenu}
          aria-label='Toggle menu'
        >
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
        </button>

        {/* Navigation Links */}
        <div className={`${styles.navMenu} ${isMenuOpen ? styles.active : ''}`}>
          <ul className={styles.navList}>
            {/* Conditional Auth Links for Mobile */}
            {userLoggedIn ? (
              <>
                <li className={`${styles.navItem} ${styles.navItemMobile}`}>
                  <button
                    className={styles.signOutBtn}
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className={`${styles.navItem} ${styles.navItemMobile}`}>
                  <button
                    className={styles.signInBtn}
                    onClick={() => {
                      navigate('/login');
                      closeMenu();
                    }}
                  >
                    Sign In
                  </button>
                </li>
                <li className={`${styles.navItem} ${styles.navItemMobile}`}>
                  <button
                    className={styles.signUpBtn}
                    onClick={() => {
                      navigate('/register');
                      closeMenu();
                    }}
                  >
                    Sign Up
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Desktop Auth Buttons - Conditional */}
        <div className={styles.authButtonsDesktop}>
          {userLoggedIn ? (
            <>
              <span className={styles.welcomeText}>
                Welcome, {currentUser?.displayName || currentUser?.email?.split('@')[0]}
              </span>
              <button
                className={styles.signOutBtn}
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                className={styles.signInBtn}
                onClick={() => navigate('/login')}
              >
                Sign In
              </button>
              <button
                className={styles.signUpBtn}
                onClick={() => navigate('/register')}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
