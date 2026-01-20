import React, { useState } from 'react'
import styles from './Support.module.css'
import Navbar from '../Navbar/Navbar'
import { Button } from '../ui-util/Button'

const Support = () => {
    const [username, setUsername] = useState('');

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
    }

    return (
        <><Navbar />
            <main className={styles.supportContainer}>
                <section className={styles.supportSection}>
                    <h1>
                        Thank you for playing Jingle!
                    </h1>
                    <h2>There are two ways to support the project..</h2>
                </section>
                <section className={styles.supportSection}>
                    <h1>1. Jingle Premium</h1>
                    <div className={styles.premiumCards}>
                        <div className={styles.premiumCard}>
                            <h1>$2</h1><h3>/month</h3>
                        </div>
                        <div className={styles.premiumCard}>
                            <h1>$10</h1><h3>lifetime</h3>
                        </div>
                    </div>
                    <div className={styles.usernameInputGroup}>
                        <label>Please enter the email you used .</label>
                        <input placeholder={'Jingle username'} value={username} onChange={handleUsernameChange} type='text'></input>
                    </div>
                </section>
                <section className={styles.supportSection}><h1>2. Choose a custom daily</h1>
                    <h2>For $5, you can decide the daily 5 songs for a day of your choosing.</h2></section>
            </main>
        </>
    )
}

export default Support