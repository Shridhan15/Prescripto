import React, { useContext, useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { MessageCircle } from "lucide-react";

const ChatBotBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [showSupportForm, setShowSupportForm] = useState(false); // new
  const [supportForm, setSupportForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const { backendUrl, token } = useContext(AppContext);
  const chatEndRef = useRef(null);

  const toggleBox = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setChatHistory([]);
      setShowSupportForm(false);
      setSupportForm({ name: "", email: "", phone: "", message: "" });
    }
  };

  // ---------------- Chatbot Query ----------------
  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!userQuery) return;

    setChatHistory((prev) => [...prev, { sender: "user", text: userQuery }]);

    try {
      const res = await axios.post(
        backendUrl + "/api/user/chatbot/query",
        { query: userQuery },
        { headers: { token } }
      );
      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", text: res.data.response },
      ]);
      setUserQuery("");
    } catch (err) {
      console.log("Error processing query:", err);
      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, I couldn't process your query." },
      ]);
    }
  };

  // ---------------- Show Support Form ----------------
  const handleSendToAdminClick = () => {
    const lastUserMessage = chatHistory
      .slice()
      .reverse()
      .find((msg) => msg.sender === "user");
    setSupportForm((prev) => ({
      ...prev,
      message: lastUserMessage?.text || "",
    }));
    setShowSupportForm(true);
  };

  // ---------------- Support Form Submit ----------------
  const handleSupportFormChange = (e) => {
    const { name, value } = e.target;
    setSupportForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSupportFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(backendUrl + "/api/user/send-support", supportForm, {
        headers: { token },
      });
      toast.success("Query sent to admin!");
      setShowSupportForm(false);
      setSupportForm({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      console.log("Error sending to admin:", err);
      toast.error("Failed to send query to admin");
    }
  };

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, showSupportForm]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="w-96 h-128 flex flex-col bg-white rounded-2xl shadow-xl border border-gray-200">
          {/* Header */}
          <div className="flex justify-between items-center p-3 border-b border-gray-200">
            <h3 className="font-bold text-lg">
              {showSupportForm ? "Send Query to Admin" : "Need Help?"}
            </h3>
            <button
              onClick={toggleBox}
              className="text-gray-500 cursor-pointer"
            >
              ✖️
            </button>
          </div>

          {/* Chat Area or Support Form */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-gray-50">
            {!showSupportForm ? (
              chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg max-w-xs break-words ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {msg.text}
                    {msg.sender === "bot" && msg.text.includes("admin") && (
                      <button
                        onClick={handleSendToAdminClick}
                        className="mt-2 w-full bg-green-600 text-white p-1 rounded hover:bg-green-700 text-sm"
                      >
                        Send your query to Admin
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <form onSubmit={handleSupportFormSubmit} className="space-y-2">
                <input
                  type="text"
                  name="name"
                  value={supportForm.name}
                  onChange={handleSupportFormChange}
                  placeholder="Your Name"
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="email"
                  name="email"
                  value={supportForm.email}
                  onChange={handleSupportFormChange}
                  placeholder="Your Email"
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  value={supportForm.phone}
                  onChange={handleSupportFormChange}
                  placeholder="Phone Number"
                  className="w-full p-2 border rounded"
                  required
                />
                <textarea
                  name="message"
                  value={supportForm.message}
                  onChange={handleSupportFormChange}
                  placeholder="Message"
                  className="w-full p-2 border rounded"
                  rows="3"
                  required
                />
                <button
                  type="submit"
                  className="w-full cursor-pointer bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                >
                  Send to Admin
                </button>
              </form>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          {!showSupportForm && (
            <form
              onSubmit={handleQuerySubmit}
              className="flex p-3 border-t border-gray-200 space-x-2"
            >
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-400"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
              >
                Ask
              </button>
            </form>
          )}
        </div>
      ) : (
        <button
          onClick={toggleBox}
          className="bg-blue-600 cursor-pointer text-white rounded-full p-4 shadow-xl hover:bg-blue-700 transition"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default ChatBotBox;
