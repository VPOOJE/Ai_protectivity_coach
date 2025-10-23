import React, { useState, useEffect } from "react";
import { saveUserProfile, getUserProfile } from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function ProfileForm() {
  const [form, setForm] = useState({
    age: "",
    gender: "",
    occupation: "",
    sleepHours: "",
    exerciseFrequency: "",
    stressLevel: "5",
    wellnessGoals: [],
    energyLevel: "5",
    additionalInfo: ""
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isExplicitSubmit, setIsExplicitSubmit] = useState(false);
  const navigate = useNavigate();

  const steps = [
    { id: 1, title: "Basic Info", icon: "👤" },
    { id: 2, title: "Lifestyle", icon: "🏃‍♀️" },
    { id: 3, title: "Goals", icon: "🎯" }
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getUserProfile();
        if (profile) {
          setForm(profile);
        }
      } catch (err) {
        console.log("No existing profile found");
      }
    };
    fetchProfile();
  }, []);


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setForm({ ...form, wellnessGoals: [...form.wellnessGoals, value] });
    } else {
      setForm({ ...form, wellnessGoals: form.wellnessGoals.filter(goal => goal !== value) });
    }
  };

  const nextStep = () => {
    // Validate current step before moving to next
    if (currentStep === 0) {
      // Step 1 validation: age, gender, occupation
      if (!form.age || !form.gender || !form.occupation) {
        setError("Please fill in all required fields in Basic Information");
        return;
      }
    } else if (currentStep === 1) {
      // Step 2 validation: sleepHours, exerciseFrequency, stressLevel
      if (!form.sleepHours || !form.exerciseFrequency || !form.stressLevel) {
        setError("Please fill in all required fields in Lifestyle & Health");
        return;
      }
    }
    
    if (currentStep < steps.length - 1) {
      setError(""); // Clear any previous errors
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Only submit if we're on the last step AND it's an explicit submit
    if (currentStep !== steps.length - 1 || !isExplicitSubmit) {
      return;
    }
    
    // Final validation for step 3
    if (!form.energyLevel) {
      setError("Please set your energy level");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      await saveUserProfile(form);
      navigate("/mood");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-300 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-300 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-gradient-to-br from-pink-300 to-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Pinterest-style Masonry Background */}
      <div className="absolute inset-0 opacity-5">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`masonry-${i}`}
            className={`absolute w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br ${
              i % 4 === 0 ? "from-pink-400 to-purple-500" :
              i % 4 === 1 ? "from-purple-400 to-indigo-500" :
              i % 4 === 2 ? "from-indigo-400 to-pink-500" :
              "from-pink-500 to-indigo-400"
            } rounded-lg sm:rounded-xl animate-float`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-7xl transition-all duration-1000 transform translate-y-0 opacity-100">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            
            {/* Header */}
            <div className="p-6 sm:p-8 lg:p-12 border-b border-gray-200/50">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    window.location.href = "/login";
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm"
                >
                  Logout
                </button>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Welcome!</p>
                </div>
              </div>
              <div className="text-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Create Your Profile</h1>
                <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">Tell us about yourself to personalize your wellness journey</p>

                {/* Step Indicator */}
                <div className="flex items-center justify-center space-x-2 sm:space-x-4 mb-6 sm:mb-8">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-300 ${
                        currentStep >= index ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {currentStep > index ? (
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`w-8 sm:w-16 h-1 mx-1 sm:mx-2 rounded-full transition-all duration-300 ${
                          currentStep > index ? 'bg-gradient-to-r from-pink-500 to-purple-600' : 'bg-gray-200'
                        }`}></div>
                      )}
                    </div>
                  ))}
                </div>
                
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 sm:p-8 lg:p-12">
              <form onSubmit={(e) => e.preventDefault()} className="space-y-6 sm:space-y-8">
                
                {/* Step 1: Basic Information */}
                {currentStep === 0 && (
                  <div className="space-y-4 sm:space-y-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
                      <span className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold mr-2 sm:mr-3">1</span>
                      Basic Information
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <label htmlFor="age" className="block text-sm font-semibold text-gray-700">
                          Age
                        </label>
                        <input
                          id="age"
                          name="age"
                          type="number"
                          value={form.age}
                          onChange={handleChange}
                          required
                          className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 sm:focus:ring-4 focus:ring-pink-100 transition-all duration-300 bg-white/50 backdrop-blur-sm text-sm sm:text-base"
                          placeholder="Enter your age"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="gender" className="block text-sm font-semibold text-gray-700">
                          Gender
                        </label>
                        <select
                          id="gender"
                          name="gender"
                          value={form.gender}
                          onChange={handleChange}
                          required
                          className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 sm:focus:ring-4 focus:ring-pink-100 transition-all duration-300 bg-white/50 backdrop-blur-sm text-sm sm:text-base"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="occupation" className="block text-sm font-semibold text-gray-700">
                        Occupation
                      </label>
                      <input
                        id="occupation"
                        name="occupation"
                        type="text"
                        value={form.occupation}
                        onChange={handleChange}
                        required
                        className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 sm:focus:ring-4 focus:ring-pink-100 transition-all duration-300 bg-white/50 backdrop-blur-sm text-sm sm:text-base"
                        placeholder="What do you do for work?"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Lifestyle */}
                {currentStep === 1 && (
                  <div className="space-y-4 sm:space-y-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
                      <span className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold mr-2 sm:mr-3">2</span>
                      Lifestyle & Health
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <label htmlFor="sleepHours" className="block text-sm font-semibold text-gray-700">
                          Average Sleep Hours
                        </label>
                        <input
                          id="sleepHours"
                          name="sleepHours"
                          type="number"
                          min="1"
                          max="24"
                          value={form.sleepHours}
                          onChange={handleChange}
                          required
                          className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 sm:focus:ring-4 focus:ring-pink-100 transition-all duration-300 bg-white/50 backdrop-blur-sm text-sm sm:text-base"
                          placeholder="Hours per night"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="exerciseFrequency" className="block text-sm font-semibold text-gray-700">
                          Exercise Frequency
                        </label>
                        <select
                          id="exerciseFrequency"
                          name="exerciseFrequency"
                          value={form.exerciseFrequency}
                          onChange={handleChange}
                          required
                          className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 sm:focus:ring-4 focus:ring-pink-100 transition-all duration-300 bg-white/50 backdrop-blur-sm text-sm sm:text-base"
                        >
                          <option value="">Select frequency</option>
                          <option value="never">Never</option>
                          <option value="rarely">Rarely (1-2 times/month)</option>
                          <option value="occasionally">Occasionally (1-2 times/week)</option>
                          <option value="regularly">Regularly (3-4 times/week)</option>
                          <option value="daily">Daily</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="stressLevel" className="block text-sm font-semibold text-gray-700">
                        Current Stress Level
                      </label>
                      <div className="relative">
                        <input
                          id="stressLevel"
                          name="stressLevel"
                          type="range"
                          min="1"
                          max="10"
                          value={form.stressLevel}
                          onChange={handleChange}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Low</span>
                          <span className="font-semibold text-pink-600">{form.stressLevel}/10</span>
                          <span>High</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Goals & Preferences */}
                {currentStep === 2 && (
                  <div className="space-y-4 sm:space-y-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
                      <span className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold mr-2 sm:mr-3">3</span>
                      Goals & Preferences
                    </h2>

                    <div className="space-y-2">
                      <label htmlFor="wellnessGoals" className="block text-sm font-semibold text-gray-700">
                        Primary Wellness Goals
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {['Better Sleep', 'Stress Management', 'Physical Fitness', 'Mental Health', 'Work-Life Balance', 'Healthy Eating'].map((goal) => (
                          <label key={goal} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              name="wellnessGoals"
                              value={goal}
                              checked={form.wellnessGoals.includes(goal)}
                              onChange={handleCheckboxChange}
                              className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                            />
                            <span className="text-sm text-gray-700">{goal}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="energyLevel" className="block text-sm font-semibold text-gray-700">
                        Typical Energy Level
                      </label>
                      <div className="relative">
                        <input
                          id="energyLevel"
                          name="energyLevel"
                          type="range"
                          min="1"
                          max="10"
                          value={form.energyLevel}
                          onChange={handleChange}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Low</span>
                          <span className="font-semibold text-pink-600">{form.energyLevel}/10</span>
                          <span>High</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="additionalInfo" className="block text-sm font-semibold text-gray-700">
                        Additional Information
                      </label>
                      <textarea
                        id="additionalInfo"
                        name="additionalInfo"
                        value={form.additionalInfo}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 sm:focus:ring-4 focus:ring-pink-100 transition-all duration-300 bg-white/50 backdrop-blur-sm resize-none text-sm sm:text-base"
                        placeholder="Tell us anything else that might help personalize your experience..."
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div role="alert" className="p-3 sm:p-4 bg-red-50 border-l-4 border-red-400 rounded-lg animate-shake">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-2 sm:ml-3">
                        <p className="text-xs sm:text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row justify-between pt-6 sm:pt-8 border-t border-gray-200/50 space-y-3 sm:space-y-0">
                  {currentStep > 0 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-4 sm:px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg sm:rounded-xl font-semibold hover:border-pink-500 hover:text-pink-600 transition-all duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                      <span>Previous</span>
                    </button>
                  )}
                  
                  <div className="flex-1"></div>
                  
                  {currentStep < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-4 sm:px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg sm:rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                      <span>Next</span>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsExplicitSubmit(true);
                        handleSubmit();
                      }}
                      disabled={loading}
                      className={`px-4 sm:px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg sm:rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base ${loading ? "opacity-80 cursor-wait" : ""}`}
                    >
                      {loading ? (
                        <>
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                          </svg>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <span>Complete Profile</span>
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ec4899, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ec4899, #8b5cf6);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}