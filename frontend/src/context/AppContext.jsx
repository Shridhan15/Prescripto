import { createContext, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useState } from "react";
import MessageNotification from "../components/MessageNotification";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const currenySymbol = "$";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [messageNotifications, setMessageNotifications] = useState([]);

  const [doctors, setDoctors] = useState([]);
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : false
  );
  const [userData, setUserData] = useState(false);

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

  const loadUserProfileData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/get-profile", {
        headers: { token },
      });
      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (!token || !userData?._id) return;

    const eventSource = new EventSource(
      `${backendUrl}/api/messages/sse?token=${token}`
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.type === "connected") return;

        if (data?.to_user_id?._id === userData?._id) {
          pushMessageNotification(data?.from_user_id, data?.text);

          if (Notification.permission === "granted") {
            new Notification(`${data?.from_user_id?.name}`, {
              body: data?.text,
            });
          }
        }
      } catch (err) {
        console.error("SSE parse error", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      eventSource.close();
    };

    return () => eventSource.close();
  }, [backendUrl, token, userData]);

  const pushMessageNotification = (sender, message) => {
    const id = Date.now();
    setMessageNotifications((prev) => [...prev, { id, sender, message }]);
  };

  const removeMessageNotification = (id) => {
    setMessageNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const value = {
    doctors,
    getDoctorsData,
    currenySymbol,
    token,
    setToken,
    backendUrl,
    userData,
    setUserData,
    loadUserProfileData,
    messageNotifications,
    setMessageNotifications,
  };

  useEffect(() => {
    getDoctorsData();
  }, []);

  useEffect(() => {
    if (token) {
      loadUserProfileData();
    } else {
      setUserData(false);
    }
  }, [token]);

  return (
    // means all the child componentes wrapped inside AppContextProvider will be able to access the context data
    <AppContext.Provider value={value}>
      {props.children}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {messageNotifications.map((n) => (
          <MessageNotification
            key={n.id}
            notification={n}
            onClose={removeMessageNotification}
          />
        ))}
      </div>
    </AppContext.Provider>
  );
};
export default AppContextProvider;
