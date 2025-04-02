import { createContext, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useState } from "react";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const currenySymbol = "$";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [doctors, setDoctors] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token')?localStorage.getItem('token'):false );


  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/list");
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const value = {
    doctors,
    currenySymbol,
    token,setToken,
    backendUrl
  }; 

  useEffect(() => {
    getDoctorsData();
  }, []);

  return (
    // means all the child componentes wrapped inside AppContextProvider will be able to access the context data
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
export default AppContextProvider;
