import React, { useState, useEffect, useRef } from "react";
import { XIcon, ChevronDownIcon } from "@heroicons/react/solid"; // or any SVG/icons you prefer

const CustomSelect = ({ options, onCategorySelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(options[0]);
  const containerRef = useRef(null);

  const toggleDropdown = () => setIsOpen(open => !open);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setIsOpen(false);

    // Call the parent callback with the selected category
    if (onCategorySelect) {
      onCategorySelect(option);
    }
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    setSelectedOption(options[0]);
    setIsOpen(false);

    // Call the parent callback with "All Categories" option
    if (onCategorySelect) {
      onCategorySelect(options[0]);
    }
  };

  // close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative inline-block text-left"
    >
      {/* Selected value with dropdown arrow */}
      <div
        className="flex items-center gap-2 cursor-pointer py-1"
        onClick={toggleDropdown}
      >
        {/* Three line menu icon */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
          <path d="M3 12H21M3 6H21M3 18H21" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>

        <span className="truncate text-sm font-medium text-gray-700 leading-5 block" style={{ width: "110px" }} title={selectedOption.label}>
          {selectedOption.label}
        </span>

        {/* Show X button if not on "All Categories" - always reserve space */}
        <div className="flex-shrink-0 w-5">
          {selectedOption.value !== "all" && (
            <button
              onClick={clearSelection}
              className="p-0.5 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Clear selection"
            >
              <XIcon className="h-4 w-4 text-gray-500 hover:text-gray-700" />
            </button>
          )}
        </div>

        <ChevronDownIcon
          className={`h-4 w-4 text-gray-500 transform transition-transform flex-shrink-0 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </div>

      {/* Dropdown list */}
      {isOpen && (
        <div className="absolute mt-2 w-48 bg-white rounded-lg shadow-lg max-h-64 overflow-auto z-50 border border-gray-200">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleOptionClick(option)}
              className={`px-4 py-2.5 cursor-pointer hover:bg-blue-50 transition-colors ${
                selectedOption.value === option.value
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "text-gray-700"
              } ${option === options[0] ? "rounded-t-lg" : ""} ${
                option === options[options.length - 1] ? "rounded-b-lg" : ""
              }`}
              title={option.label}
            >
              <span className="block truncate">{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
