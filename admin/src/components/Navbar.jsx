import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { AdminContext } from "../context/AdminContext";
import {useNavigate} from 'react-router-dom'

const Navbar = () => {
  const { aToken, setAToken } = useContext(AdminContext);

  const navigate= useNavigate()
  const logout = () => {
    //set admin token to null for logout and remove it from local storage
    navigate('/');
    aToken && setAToken("");
    aToken && localStorage.removeItem("aToken");
  };
  return (
    <div className="flex justify-between items-center px-4 sm:px-10 py-2 border-b border-gray-300 bg-white">
      <div className=" flex items-center gap-2 text-xs">
        <img
          className="w-3.5 sm:w-40 cursor-pointer"
          src={assets.admin_logo}
          alt=""
        />
        <p className="border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600">
          {aToken ? "Admin" : "Doctor"}
        </p>
      </div>
      <button
        onClick={logout}
        className="cursor-pointer bg-primary text-white text-sm py-2 px-10 rounded-full"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
