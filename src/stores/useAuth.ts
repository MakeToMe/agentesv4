import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UserData {
  user_nome?: string;
  user_perfil?: string;
  user_whatsApp?: string;
}

interface AuthState {
  userUid: string | null;
  empresaUid: string | null;
  userData: UserData | null;
  setAuth: (userUid: string, empresaUid: string, userData?: UserData) => void;
  clearAuth: () => void;
}

const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      userUid: null,
      empresaUid: null,
      userData: null,
      setAuth: (userUid, empresaUid, userData = null) => set({ userUid, empresaUid, userData }),
      clearAuth: () => {
        // Limpa o localStorage manualmente
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage');
        }
        // Limpa o estado do Zustand
        set({ userUid: null, empresaUid: null, userData: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAuth;
