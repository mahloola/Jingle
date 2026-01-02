// Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from '../../firebase/firebase';
import { Button } from '../ui-util/Button';
import styles from './Login.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();

  // Redirect if already logged in
  if (userLoggedIn) {
    navigate('/');
    return null;
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); // Redirect to home after successful login/signup
    } catch (error: any) {
      setError(error.message);
      console.error(error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (error: any) {
      setError(error.message);
      console.error(error);
    }
  };

  return (
    <div className={styles.loginContainer}>
      Login
      {error && <div className={styles.errorMessage}>{error}</div>}
      <form onSubmit={handleEmailSubmit}>
        <input
          type='email'
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type='password'
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type='submit'>Log In</button>
      </form>
      <Button
        label='Need an account? Sign up!'
        onClick={() => navigate('/register')}
      ></Button>
      <div className='divider'>or</div>
      <button onClick={handleGoogleLogin}>Sign in with Google</button>
    </div>
  );
}
