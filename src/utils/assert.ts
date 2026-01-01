import { User } from 'firebase/auth';

export function assertNotNil<T>(value: T | null, name = 'value'): asserts value is T {
  if (value === null) {
    throw new Error(`Expected ${name} to not be null`);
  }
  if (value === undefined) {
    throw new Error(`Expected ${name} to not be undefined`);
  }
}

export const assertLobbyAndUser = async ({
  lobbyId,
  currentUser,
}: {
  lobbyId: string | undefined;
  currentUser: User | undefined;
}): Promise<{ lobbyId: string; token: string }> => {
  if (!currentUser) {
    throw Error('Error: user is not authenticated.');
  }

  const token = await currentUser.getIdToken();
  if (!token) {
    throw Error('Error: user token not available.');
  }

  if (!lobbyId) {
    throw Error('Error: lobbyId is invalid.');
  }

  return { lobbyId, token };
};
