import React, { useState, useEffect, useRef } from "react";
import { saveMoodEntry } from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function MoodEntry() {
  const [selectedMood, setSelectedMood] = useState("");
  const [moodText, setMoodText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  const moods = [
    { name: "Happy", emoji: "😊" },
    { name: "Sad", emoji: "😢" },
    { name: "Excited", emoji: "🤩" },
    { name: "Anxious", emoji: "😰" },
    { name: "Calm", emoji: "😌" },
    { name: "Angry", emoji: "😠" },
    { name: "Grateful", emoji: "🙏" },
    { name: "Tired", emoji: "😴" }
  ];

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
    }
  };

  const capturePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      video.addEventListener('loadedmetadata', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          const imageUrl = URL.createObjectURL(blob);
          setCapturedImage(imageUrl);
        }, 'image/jpeg', 0.8);
        
        stream.getTracks().forEach(track => track.stop());
      });
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please check permissions.");
    }
  };

  const handleSubmit = async () => {
    if (!selectedMood) {
      setError("Please select a mood");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Submitting mood entry:", { selectedMood, moodText }); // Debug log
      
      const formData = new FormData();
      formData.append('mood_text', `${selectedMood}: ${moodText}`); // Backend expects mood_text
      
      if (audioBlob) {
        formData.append('mood_audio', audioBlob, 'recording.wav'); // Backend expects mood_audio
      }
      
      if (capturedImage) {
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        formData.append('mood_image', blob, 'mood-photo.jpg'); // Backend expects mood_image
      }

      console.log("FormData prepared, sending to backend..."); // Debug log
      await saveMoodEntry(formData);
      console.log("Mood entry saved successfully!"); // Debug log
      
      // Reset form after successful save
      setSelectedMood("");
      setMoodText("");
      setAudioBlob(null);
      setCapturedImage(null);
      
      // Show success message instead of navigating
      setError(""); // Clear any previous errors
      alert("Mood entry saved successfully! 🎉");
    } catch (err) {
      console.error("Mood entry error:", err); // Debug log
      setError(err.response?.data?.message || err.message || "Failed to save mood entry");
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
                  <p className="text-sm text-gray-500">Welcome back!</p>
                </div>
              </div>
              <div className="text-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">How are you feeling today?</h1>
                <p className="text-sm sm:text-base text-gray-600">Share your mood and thoughts with us</p>
              </div>
            </div>

            {/* Main Content */}
            <div className="p-6 sm:p-8 lg:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                
                {/* Left Column - Mood Selection */}
                <div className="lg:col-span-1 space-y-6 sm:space-y-8">
                  <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-pink-200/50">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
                      <span className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold mr-2 sm:mr-3">😊</span>
                      Select Your Mood
                    </h2>

                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      {moods.map((mood) => (
                        <button
                          key={mood.name}
                          onClick={() => setSelectedMood(mood.name)}
                          className={`p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                            selectedMood === mood.name
                              ? 'border-pink-500 bg-pink-100 shadow-lg'
                              : 'border-gray-200 bg-white hover:border-pink-300 hover:bg-pink-50'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-xl sm:text-2xl md:text-3xl mb-1 sm:mb-2">{mood.emoji}</div>
                            <div className="text-xs sm:text-sm font-medium text-gray-700">{mood.name}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-indigo-200/50">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
                      <span className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold mr-2 sm:mr-3">📝</span>
                      How are you feeling?
                    </h2>

                    <textarea
                      value={moodText}
                      onChange={(e) => setMoodText(e.target.value)}
                      placeholder="Tell us about your day, what's on your mind, or anything you'd like to share..."
                      rows="4"
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 sm:focus:ring-4 focus:ring-indigo-100 transition-all duration-300 bg-white/50 backdrop-blur-sm resize-none text-sm sm:text-base"
                    />
                  </div>
                </div>

                {/* Center Column - Media Capture */}
                <div className="lg:col-span-1 space-y-6 sm:space-y-8">
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-green-200/50">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
                      <span className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold mr-2 sm:mr-3">🎤</span>
                      Voice Recording
                    </h2>

                    <div className="text-center space-y-3 sm:space-y-4">
                      {!isRecording ? (
                        <button
                          onClick={startRecording}
                          className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-full flex items-center justify-center mx-auto hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                        >
                          <svg className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                          </svg>
                        </button>
                      ) : (
                        <button
                          onClick={stopRecording}
                          className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-full flex items-center justify-center mx-auto hover:shadow-lg transform hover:scale-105 transition-all duration-300 animate-pulse"
                        >
                          <svg className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 6h12v12H6z"/>
                          </svg>
                        </button>
                      )}

                      <p className="text-xs sm:text-sm text-gray-600">
                        {isRecording ? `Recording... ${recordingTime}s` : 'Tap to record your thoughts'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-purple-200/50">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
                      <span className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold mr-2 sm:mr-3">📸</span>
                      Photo Capture
                    </h2>

                    <div className="text-center space-y-3 sm:space-y-4">
                      {!capturedImage ? (
                        <button
                          onClick={capturePhoto}
                          className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full flex items-center justify-center mx-auto hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                        >
                          <svg className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                      ) : (
                        <div className="space-y-2 sm:space-y-3">
                          <img
                            src={capturedImage}
                            alt="Captured mood"
                            className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto rounded-lg sm:rounded-xl object-cover border-2 border-purple-200"
                          />
                          <button
                            onClick={() => setCapturedImage(null)}
                            className="px-2 py-1 sm:px-3 sm:py-1 md:px-4 md:py-2 bg-red-500 text-white text-xs sm:text-sm rounded-lg hover:bg-red-600 transition-colors duration-200"
                          >
                            Remove
                          </button>
                        </div>
                      )}

                      <p className="text-xs sm:text-sm text-gray-600">
                        {capturedImage ? 'Photo captured!' : 'Tap to take a photo'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column - Tips & Submit */}
                <div className="lg:col-span-1 space-y-6 sm:space-y-8">
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-yellow-200/50">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
                      <span className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold mr-2 sm:mr-3">💡</span>
                      Daily Tips
                    </h2>

                    <div className="space-y-3 sm:space-y-4">
                      <div className="p-2 sm:p-3 md:p-4 bg-white/60 rounded-lg sm:rounded-xl border border-yellow-200/50">
                        <h3 className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base mb-1 sm:mb-2">Mindfulness Moment</h3>
                        <p className="text-xs sm:text-sm text-gray-600">Take 3 deep breaths and focus on the present moment</p>
                      </div>
                      <div className="p-2 sm:p-3 md:p-4 bg-white/60 rounded-lg sm:rounded-xl border border-yellow-200/50">
                        <h3 className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base mb-1 sm:mb-2">Gratitude Practice</h3>
                        <p className="text-xs sm:text-sm text-gray-600">Think of 3 things you're grateful for today</p>
                      </div>
                      <div className="p-2 sm:p-3 md:p-4 bg-white/60 rounded-lg sm:rounded-xl border border-yellow-200/50">
                        <h3 className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base mb-1 sm:mb-2">Self-Care Reminder</h3>
                        <p className="text-xs sm:text-sm text-gray-600">Remember to take breaks and be kind to yourself</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-pink-200/50">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
                      <span className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold mr-2 sm:mr-3">📊</span>
                      Progress
                    </h2>

                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">Mood Selected</span>
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ${selectedMood ? 'bg-green-500' : 'bg-gray-300'}`}>
                          {selectedMood && <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">Text Added</span>
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ${moodText.trim() ? 'bg-green-500' : 'bg-gray-300'}`}>
                          {moodText.trim() && <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">Voice Recorded</span>
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ${audioBlob ? 'bg-green-500' : 'bg-gray-300'}`}>
                          {audioBlob && <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">Photo Taken</span>
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ${capturedImage ? 'bg-green-500' : 'bg-gray-300'}`}>
                          {capturedImage && <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={loading || !selectedMood}
                      className={`w-full py-2 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg sm:rounded-xl md:rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base ${
                        loading || !selectedMood ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {loading ? (
                        <>
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                          </svg>
                          <span className="hidden sm:inline">Saving...</span>
                          <span className="sm:hidden">Saving...</span>
                        </>
                      ) : (
                        <>
                          <span className="hidden sm:inline">Save Mood Entry</span>
                          <span className="sm:hidden">Save</span>
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div role="alert" className="mt-6 sm:mt-8 p-3 sm:p-4 bg-red-50 border-l-4 border-red-400 rounded-lg animate-shake">
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

              {/* Privacy Notice */}
              <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-blue-800 mb-1">Privacy & Security</h3>
                    <p className="text-xs text-blue-700">
                      Your mood entries are private and secure. We use encryption to protect your data and never share your personal information.
                    </p>
                  </div>
                </div>
              </div>
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
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}