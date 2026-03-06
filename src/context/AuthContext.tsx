import React, {createContext, useState, useEffect, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
  phone: string;
  userId: string;
  password: string;
  apiUserId: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (data: User) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {}
});

export const AuthProvider = ({children}:{children:ReactNode}) => {

  const [user,setUser] = useState<User | null>(null);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    loadUser();
  },[]);

  const loadUser = async () => {

    const stored = await AsyncStorage.getItem('USER_LOGIN');

    if(stored){
      setUser(JSON.parse(stored));
    }

    setLoading(false);

  };

  const login = async (data:User) => {

    await AsyncStorage.setItem('USER_LOGIN',JSON.stringify(data));
    setUser(data);

  };

  const logout = async () => {

    await AsyncStorage.removeItem('USER_LOGIN');
    setUser(null);

  };

  return(
    <AuthContext.Provider value={{user,loading,login,logout}}>
      {children}
    </AuthContext.Provider>
  );

};