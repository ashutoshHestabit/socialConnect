// src/components/UserList.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaCircle, FaComment } from "react-icons/fa";
import api from "../api";

export default function UserList({ current, selected, onSelect }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.fetchUsers();
        setUsers(response);
      } catch (err) {
        console.error("Error fetching users:", err);
        if (err.message.includes("401")) {
          localStorage.clear();
          navigate("/login");
          setError("Session expired. Please login again.");
        } else {
          setError(err.message || "Failed to load users.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [navigate]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <p className="text-red-600">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-2 text-indigo-600 hover:underline">
          Try again
        </button>
      </div>
    );
  }

  const otherUsers = users.filter(u => u._id !== current);

  return (
    <div className="space-y-2">
      {otherUsers.map(u => (
        <div
          key={u._id}
          onClick={() => onSelect(u._id, u.username)}
          className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
            selected === u._id ? "bg-indigo-50 border border-indigo-200" : "hover:bg-gray-50"
          }`}
        >
          <div className="relative mr-3">
            <FaUserCircle className="text-2xl text-gray-500" />
            <FaCircle className="absolute bottom-0 right-0 text-green-500 text-xs" />
          </div>
          <span className="font-medium text-gray-800">{u.username}</span>
          {selected === u._id && <FaComment className="ml-auto text-indigo-600" />}
        </div>
      ))}

      {otherUsers.length === 0 && (
        <p className="text-center text-gray-500 py-4">No other users found.</p>
      )}
    </div>
  );
}