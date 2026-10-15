import {createContext,useContext,useState,useEffect} from "react";
import api from "../services/api.js";

const AuthContext=createContext();

export function AuthProvider({children}){
  const [user,setUser]=useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    async function fetchUser(){
      try{
        const res = await api.get("/users/profile");
        setUser(res.data.user);
      }catch(err){
        console.log("User not authenticated");
        setUser(null);
      }finally {
        setLoading(false);
      }
    }
    fetchUser();
  },[]);


  const logout=async()=>{
    try{
      await api.post("/logout");
        
    }catch(err){
      console.error("something went wrong during logout:",err.message);
    }finally{
      setUser(null);
    }
  }

  return(
    <AuthContext.Provider value={{user,setUser,loading,logout}}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){
  return useContext(AuthContext);
}