import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.token) {
        setError("You are not logged in");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("https://shop-app-hosting.vercel.app/api/profile", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        setProfileData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow-md rounded">
      <h2 className="text-xl font-bold mb-4">Profile</h2>
      <p><strong>Username:</strong> {profileData.username}</p>
      <p><strong>Email:</strong> {profileData.email}</p>
      <p><strong>Role:</strong> {profileData.isOwner ? "Owner" : "Customer"}</p>

      <button
        onClick={logout}
        className="mt-6 w-full bg-red-600 text-white p-2 rounded"
      >
        Logout
      </button>
    </div>
  );
};

export default Profile;
