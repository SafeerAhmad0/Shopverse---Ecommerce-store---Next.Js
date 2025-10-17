"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleLanguageSelect = (lang: "en" | "ar") => {
    if (lang === "en") {
      // Reload page when switching to English
      setLanguage(lang);
      window.location.reload();
    } else {
      setLanguage(lang);
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
        aria-label="Select Language"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-gray-700"
        >
          <path
            d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 19.93C7.05 19.44 4 16.08 4 12C4 11.38 4.08 10.79 4.21 10.21L9 15V16C9 17.1 9.9 18 11 18V19.93ZM17.9 17.39C17.64 16.58 16.9 16 16 16H15V13C15 12.45 14.55 12 14 12H8V10H10C10.55 10 11 9.55 11 9V7H13C14.1 7 15 6.1 15 5V4.59C17.93 5.78 20 8.65 20 12C20 14.08 19.2 15.97 17.9 17.39Z"
            fill="currentColor"
          />
        </svg>
        <span className="text-sm font-medium text-gray-700">
          {language === "en" ? "EN" : "AR"}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-50 translate-check">
          <button
            onClick={() => handleLanguageSelect("en")}
            className={`w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors rounded-t-lg translate-check ${
              language === "en" ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-700"
            }`}
          >
            English
          </button>
          <button
            onClick={() => handleLanguageSelect("ar")}
            className={`w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors rounded-b-lg translate-check ${
              language === "ar" ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-700"
            }`}
          >
            العربية
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
