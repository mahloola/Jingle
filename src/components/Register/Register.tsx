import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import {
  auth,
  createUserWithEmailAndPassword,
  googleProvider,
  signInWithPopup,
} from '../../firebase/firebase';
import styles from './Register.module.css';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();

  // Redirect if already logged in
  if (userLoggedIn) {
    navigate('/');
    return null;
  }

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      navigate('/'); // Redirect to home after successful registration
    } catch (error: any) {
      let errorMessage = 'Registration failed';

      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already in use. Try logging in instead.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      } else {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (error: any) {
      setError(error.message || 'Google sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  return (
    <div className={styles.registrationContainer}>
      <h2 className={styles.title}>Create Account</h2>

      {error && (
        <div
          className={styles.errorMessage}
          role='alert'
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleRegistration}
        className={styles.registrationForm}
      >
        <div className={styles.formGroup}>
          <label
            htmlFor='displayName'
            className={styles.label}
          >
            Display Name (Optional)
          </label>
          <input
            id='displayName'
            type='text'
            placeholder='What should we call you?'
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={30}
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label
            htmlFor='email'
            className={styles.label}
          >
            Email *
          </label>
          <input
            id='email'
            type='email'
            placeholder='you@example.com'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete='email'
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label
            htmlFor='password'
            className={styles.label}
          >
            Password *
          </label>
          <input
            id='password'
            type='password'
            placeholder='At least 6 characters'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete='new-password'
            className={styles.input}
          />
          <small className={styles.hint}>Must be at least 6 characters</small>
        </div>

        <div className={styles.formGroup}>
          <label
            htmlFor='confirmPassword'
            className={styles.label}
          >
            Confirm Password *
          </label>
          <input
            id='confirmPassword'
            type='password'
            placeholder='Re-enter your password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete='new-password'
            className={styles.input}
          />
        </div>

        <button
          type='submit'
          className={`${styles.submitBtn} ${loading ? styles.disabled : ''}`}
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className={styles.divider}>
        <span className={styles.dividerText}>or</span>
      </div>

      <button
        onClick={handleGoogleSignUp}
        className={`${styles.googleBtn} ${loading ? styles.disabled : ''}`}
        disabled={loading}
        type='button'
      >
        <svg
          className={styles.googleIcon}
          viewBox='0 0 24 24'
        >
          <path
            fill='#4285F4'
            d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
          />
          <path
            fill='#34A853'
            d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
          />
          <path
            fill='#FBBC05'
            d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
          />
          <path
            fill='#EA4335'
            d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
          />
        </svg>
        Sign up with Google
      </button>

      <div className={styles.loginLink}>
        Already have an account?{' '}
        <button
          onClick={handleNavigateToLogin}
          className={styles.linkBtn}
          type='button'
        >
          Log in here
        </button>
      </div>

      <div className={styles.terms}>
        By creating an account, you agree to our{' '}
        <a
          href='/terms'
          target='_blank'
          rel='noopener noreferrer'
          className={styles.termsLink}
        >
          Terms
        </a>{' '}
        and{' '}
        <a
          href='/privacy'
          target='_blank'
          rel='noopener noreferrer'
          className={styles.termsLink}
        >
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}
