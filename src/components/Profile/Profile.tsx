import { updateProfile } from 'firebase/auth';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useState } from 'react';
import { useAuth } from '../../AuthContext';
import Navbar from '../Navbar/Navbar';
import styles from './Profile.module.css';

import { auth, storage } from '../../firebase/firebase';
import { checkProfanity } from '../../utils/string-utils';

const Profile = () => {
  const { currentUser } = useAuth();

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(currentUser?.photoURL ?? null);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState(currentUser?.displayName ?? '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { userLoggedIn } = useAuth();

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);

      if (checkProfanity(displayName)) {
        throw Error('Username cannot contain profanity.');
      }

      await auth.currentUser?.getIdToken(true);
      const user = auth.currentUser!;

      let photoURL: string | undefined;
      if (profileImage) {
        const imageRef = ref(storage, `profile-pictures/${user.uid}`);
        await uploadBytes(imageRef, profileImage);
        photoURL = await getDownloadURL(imageRef);
      }

      await updateProfile(user, {
        displayName,
        photoURL,
      });
    } catch (error: any) {
      console.log('error lol');
      let errorMessage = 'Registration failed';

      // specific Firebase errors
      if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      } else {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className={`osrs-frame ${styles.container}`}>
        <h1>{currentUser?.displayName ?? currentUser?.email}</h1>
        <p>Customize your profile here!</p>
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
            <label htmlFor='displayName'>Display Name</label>
            <input
              id='displayName'
              type='text'
              placeholder='What should we call you?'
              value={displayName}
              required
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={20}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor='profileImage'>Profile Picture (optional)</label>
            <input
              id='profileImage'
              type='file'
              accept='image/*'
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                setProfileImage(file);
                setImagePreview(URL.createObjectURL(file));
              }}
            />

            {imagePreview && (
              <img
                src={imagePreview}
                alt=''
                className={styles.imagePreview}
              />
            )}
          </div>

          <button
            type='submit'
            className={`${styles.submitBtn} ${loading ? styles.disabled : ''}`}
            disabled={loading}
          >
            {loading ? 'Updating Profile...' : 'Update Profile'}
          </button>
        </form>
      </main>
    </>
  );
};

export default Profile;
