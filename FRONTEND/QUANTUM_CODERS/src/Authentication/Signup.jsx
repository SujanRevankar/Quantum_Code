import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, Link } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    // username: "",
    email: "",
    password: "",
    confirmPassword: "",
    linkedIn: "",
    github: "",
    guildName: "",
    languages: [],
  });

  const languagesList = [
    // { name: "JavaScript", logo: "/images/javascript-logo.png" },
    { name: "Python", logo: "/images/python-logo.png" },
    { name: "Java", logo: "/images/java-logo.png" },
    // { name: "C++", logo: "/images/cpp-logo.png" },
    // { name: "Ruby", logo: "/images/ruby-logo.png" },
    // { name: "Go", logo: "/images/go-logo.png" },
  ];
  
  const handleLanguageToggle = (language) => {
    setFormData((prevData) => {
      const languages = [...prevData.languages];
      if (languages.includes(language)) {
        return { ...prevData, languages: languages.filter((lang) => lang !== language) };
      } else {
        return { ...prevData, languages: [...languages, language] };
      }
    });
  };
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLanguagesChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData({ ...formData, languages: selectedOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password and confirm password
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8001/api/v1/auth/register",
        formData
      );
      const { token } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("email", formData.email);
      toast.success("Registered successfully!");
      console.log(formData)
      navigate("/verify");
      console.log(token);
    } catch (err) {
      const errorMessage = err.response
        ? err.response.data.message || "Sign Up failed"
        : "Sign Up failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
    console.log(formData);
  };

  return (
    <>
      <ToastContainer />
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-4xl">
            <div className="flex items-center mb-4">
              <img
                src="/images/logo2.jpg"
                alt="Company Logo"
                className="md:h-20 h-12 mr-4"
              />
              <div>
                <h2 className="text-2xl font-bold text-purple-600">quantumcode</h2>
                <p className="text-gray-600">Learn. Evolve. Code</p>
              </div>
            </div>

            <div className="grid grid-rows-2 gap-4">
              {/* <input
                type="text"
                name="username"
                placeholder="Enter your username"
                className="w-full p-2 border rounded"
                value={formData.username}
                onChange={handleChange}
                required
              /> */}
              <input
                type="email"
                name="email"
                placeholder="Enter your Email ID"
                className="w-full p-2 border rounded"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                className="w-full p-2 border rounded"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                className="w-full p-2 border rounded"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="linkedIn"
                placeholder="Enter your LinkedIn profile"
                className="w-full p-2 border rounded"
                value={formData.linkedIn}
                onChange={handleChange}
              />
              <input
                type="text"
                name="github"
                placeholder="Enter your GitHub profile"
                className="w-full p-2 border rounded"
                value={formData.github}
                onChange={handleChange}
              />
              {/* <input
                type="text"
                name="guildName"
                placeholder="Enter your Guild Name"
                className="w-full p-2 border rounded"
                value={formData.guildName}
                onChange={handleChange}
              /> */}
            </div>

            {/* Language Selection */}
            <div className="mt-6">
              <h4 className="text-gray-700 font-bold">Select Languages:</h4>
              <div className="flex flex-wrap gap-4 mt-4">
                {languagesList.map((language) => (
                  <div
                    key={language.name}
                    className={`cursor-pointer border rounded-lg p-4 flex items-center space-x-2 ${
                      formData.languages.includes(language.name)
                        ? "bg-purple-100 border-purple-600"
                        : "border-gray-300"
                    }`}
                    onClick={() => handleLanguageToggle(language.name)}
                  >
                    {/* <img src={language.logo} alt={`${language.name} logo`} className="h-6 w-6" /> */}
                    <span className="text-sm">{language.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Display Selected Languages */}
            <div className="mt-4">
              <h4 className="text-gray-700 font-bold">Selected Languages:</h4>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.languages.map((language, index) => (
                  <span
                    key={index}
                    className="bg-purple-100 text-purple-600 px-3 py-1 rounded-lg text-sm"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>


            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-500 transition duration-300 mt-4"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>

            <p className="text-center text-gray-500 mt-4">
              If you already have an account click here, {" "}
              <Link
                to="/login"
                className="text-purple-600 hover:underline"
              >
                Sign-in
              </Link>
            </p>
          </div>
        </div>
      </form>
    </>
  );
};

export default Signup;
