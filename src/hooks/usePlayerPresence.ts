// import { User } from 'firebase/auth';
// import { useEffect } from 'react';
// import { leaveLobby } from '../data/jingle-api';

// export const usePlayerPresence = (user?: User, lobbyId?: string) => {
//   useEffect(() => {
//     if (!user || !lobbyId) {
//       console.log('err');
//     }
//     const removeUserFromLobby = async () => {
//       const token = await user.getIdToken();
//       leaveLobby({ lobbyId, token });
//     };

//     // Handle browser tab/window close
//     window.addEventListener('pagehide', removeUserFromLobby);
//     window.addEventListener('beforeunload', removeUserFromLobby);

//     return () => {
//       window.removeEventListener('pagehide', removeUserFromLobby);
//       window.removeEventListener('beforeunload', removeUserFromLobby);

//       // Handle in-app navigation (component unmount)
//       removeUserFromLobby();
//     };
//   }, []);
// };
