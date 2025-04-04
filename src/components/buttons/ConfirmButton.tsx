import React from 'react'
import { useState } from 'react'

//temp styling
const ConfirmButton = ({setConfirmedGuess} : {setConfirmedGuess: React.Dispatch<React.SetStateAction<boolean>>}) => {
  return (
    <div style={{
        display:"inline-block",
        position: "fixed",
        top: "15px",
        zIndex: 999,
        backgroundColor: "rgba(88,76,60,1)",
        border: "0.1rem solid rgba(57, 48, 35, 1)",
        borderRadius: "0.2rem"
      }}>
        <button 
        onClick={()=>setConfirmedGuess(true)}
        style={{
          color: "rgb(255, 239, 91)", 
          width:"100%", height:"100%", 
          padding: "0.5rem 1rem 0.1rem 1rem",
         }}>
          <h5>Confirm Guess</h5>
        </button>
    </div>
  )
}

export default ConfirmButton