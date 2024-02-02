import React, { useState } from 'react';

const StartButton = () => {
    const [started, setStarted] = useState(false);

    const handleClick = () => {
        setStarted(true);
    };

    return (
        <button onClick={handleClick}>
            {started ? 'Started' : 'Start'}
        </button>
    );
};

export default StartButton;
