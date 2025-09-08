import React, { useState } from "react";
import EmailIcon from '@mui/icons-material/Email';
import AddressIcon from '@mui/icons-material/LocationOn';
import HoursIcon from '@mui/icons-material/AccessTime';


const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch("http://localhost:5000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Thank you for contacting us!");
      setFormData({ name: "", phone: "", email: "", message: "" });
    } else {
      alert(data.message || "Something went wrong!");
    }
  } catch (err) {
    console.error(err);
    alert("Server error, please try again later.");
  }
};


  return (
    <div className="max-w-6xl mx-auto px-4 py-8">


      <h1 className="text-3xl font-bold mb-6 ">Contact Us</h1>

      <div className="flex flex-col md:flex-row md:h-52 w-90% gap-3 md:gap-10  mb-12 justify-center">
          <div className=" w-[80%] md:w-[30%] text-center border border-gray-300 md:rounded-[30px] flex  flex-col justify-center hover:shadow-md mx-auto">
            <EmailIcon className="mx-auto mb-2 text-blue-500" fontSize="large"/>
            <h2 className="font-semibold text-sm md:text-xl">Email</h2>
            <p className="text-sm md:text-xl">sanjayshinde882003@example.com</p>
          </div>
          <div className="w-[80%] md:w-[40%]   text-center border border-gray-300 md:rounded-[30px] flex  flex-col justify-center hover:shadow-md mx-auto">
            <AddressIcon className="mx-auto mb-2 text-blue-500" fontSize="large"/>
            <h2 className="font-semibold text-sm md:text-xl">Address</h2>
            <p className="text-sm md:text-xl">Shree Sai Collection,Hind Apartment, Bholegaon phata, Katore Nagar, Bolhegaon Suburban, Ahmadnagar, Maharashtra 414111</p>
          </div>
          <div className="w-[80%] md:w-[30%]  text-center border border-gray-300 md:rounded-[30px] flex  flex-col justify-center hover:shadow-md mx-auto">
            <HoursIcon className="mx-auto mb-2 text-blue-500" fontSize="large"/>
            <h2 className="font-semibold text-sm md:text-xl">Business Hours</h2>
            <p className="text-sm md:text-xl">Monday to Sunday, 9:00 AM - 10:00 PM</p>
          </div>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Left: Contact Info */}
        <div className="space-y-6">

          {/* Google Map Embed */}
          <div className="w-full h-80 md:h-[200px] lg:h-[400px]  border border-red-700">
            <div className="w-full h-80 md:h-[200px] lg:h-[400px] border border-red-700 rounded-lg overflow-hidden">
            <iframe
                title="Shree Sai Collection"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3486.450142660966!2d74.71123670406119!3d19.142668768362135!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bdcbb99f5a7ba8f%3A0x681b7fa3669f3d05!2sShree%20Sai%20Collection!5e0!3m2!1sen!2sin!4v1757091204154!5m2!1sen!2sin"
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
</div>

          </div>
        </div>

        {/* Right: Contact Form */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Send Us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <textarea
                name="message"
                placeholder="Write your comment here..."
                value={formData.message}
                onChange={handleChange}
                rows="5"
                required
                className="w-full border p-2 rounded"
              ></textarea>
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Footer-style quick links */}
      <div className="mt-10 grid md:grid-cols-3 gap-6">
        <div>
          <h3 className="font-semibold mb-2">My Account</h3>
          <ul className="text-gray-600">
            <li>Login / Register</li>
            <li>Wishlist</li>
            <li>Track My Order</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Customer Service</h3>
          <ul className="text-gray-600">
            <li>Monday to Friday</li>
            <li>Terms of Use</li>
            <li>Call us: 123-456-7868</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Submit Feedback</h3>
          <ul className="text-gray-600">
            <li>Email us: info@example.com</li>
            <li>Submit your feedback anytime</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
