import React, { useState } from "react";
import { assets } from "../assets//assets";
import { NavLink, useNavigate } from "react-router-dom";
const Navbar = () => {
  // hidden is to hide tag in sm(phone) devices

  const navigate = useNavigate(); //hook to redirect to login page after clicking create account button

  const [showMenu, setShowMenu] = useState(false);
  const [token, setToken] = useState(true); //token means logged in

  return (
    <div className="flex items-center justify-between text-sm  py-4 mb-5 border-b border-b-gray-400">
      <img
        onClick={() => navigate("/")}
        className="w-44 cursor-pointer"
        src={assets.logo}
        alt=""
      />
      <ul className="hidden md:flex items-start gap-5 font-medium">
        <NavLink to="/">
          <li className="py-1">HOME</li>
          <hr className="border-none outline-none h-0.5 w-3/5 m-auto bg-primary hidden" />
        </NavLink>

        <NavLink to="/doctors">
          <li className="py-1">All DOCTORS</li>
          <hr className="border-none outline-none h-0.5 w-3/5 m-auto bg-primary hidden" />
        </NavLink>

        <NavLink to="/about">
          <li className="py-1">ABOUT</li>
          <hr className="border-none outline-none h-0.5 w-3/5 m-auto bg-primary hidden" />
        </NavLink>

        <NavLink to="/contact">
          <li className="py-1">CONTACT</li>
          <hr className="border-none outline-none h-0.5 w-3/5 m-auto bg-primary hidden" />
        </NavLink>
      </ul>

      <div className="flex items-center gap-4">
        {
          token ? (
            <div className="flex items-center gap-2 cursor-pointer group relative">
              <img
                className="w-8 rounded-full"
                src={assets.profile_pic}
                alt=""
              />
              <img className="w-2.5" src={assets.dropdown_icon} alt="" />
              <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z20 hidden group-hover:block">
                <div className="min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4">
                  <p
                    onClick={() => navigate("my-profile")}
                    className="hover:text-black cursor-pointer"
                  >
                    My Profile
                  </p>
                  <p
                    onClick={() => navigate("my-appointments")}
                    className="hover:text-black cursor-pointer"
                  >
                    My Appointments
                  </p>
                  <p
                    onClick={() => setToken(false)}
                    className="hover:text-black cursor-pointer"
                  >
                    Logout
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-primary cursor-pointer text-white px-8 py-3 rounded-full font-light hidden md:block"
            >
              Create Account
            </button>
          )
          //show create account button only when token is false(log out)
        }
      </div>
    </div>
  );
};

export default Navbar;
