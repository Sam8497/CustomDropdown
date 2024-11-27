import React, { useState, useEffect, useRef } from "react";
import "./dropdown.scss";
import { ArrowIcon, CheckIcon, SearchIcon } from "../icons/Icons";
import { debounce } from "../utils";

// Helper functions
const formatData = (data) => {
  return data.map((item) => ({
    id: item.id,
    label: item.title || item.name || item.label,
  }));
};

// Component
const Dropdown = ({ url, searchMode = "internal" }) => {
  // State management
  const [dropdownState, setDropdownState] = useState({
    options: [],
    filteredOptions: [],
    selectedOption: null,
    isOpen: false,
  });

  const [searchState, setSearchState] = useState({
    searchTerm: "",
    loading: false,
    resultsFound: false,
  });

  const searchInputRef = useRef(null);

  // Event handlers
  const handleClickOutside = (event) => {
    if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
      setDropdownState(prev => ({ ...prev, isOpen: false }));
    }
  };

  // Effects
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Data fetching
  const fetchOptions = async () => {
    if (dropdownState.options.length === 0) {
      setSearchState(prev => ({ ...prev, loading: true }));
      try {
        const response = await fetch(url);
        const data = await response.json();
        const formattedData = formatData(data);
        setDropdownState(prev => ({
          ...prev,
          options: formattedData,
          filteredOptions: formattedData,
        }));
      } catch (error) {
        console.error("Error fetching options:", error);
      } finally {
        setSearchState(prev => ({ ...prev, loading: false }));
      }
    }
  };

  // External data fetching
  const fetchExternalData = async (term) => {    
    setSearchState(prev => ({ ...prev, loading: true }));
    try {
      const response = await fetch(`${url}?title=${term}`);
      const data = await response.json();
      const formattedData = formatData(data);
      setDropdownState(prev => ({ ...prev, filteredOptions: formattedData }));
      setSearchState(prev => ({ ...prev, resultsFound: false }));
    } catch (error) {
      setSearchState(prev => ({ ...prev, resultsFound: true }));
      console.error("Error fetching search results:", error);
    }finally{
      setSearchState(prev => ({ ...prev, loading: false }));
    }
  };

  // Debounced external data fetching
  const debouncedFetchData = debounce(fetchExternalData, 300);  

  // Search and selection handlers
  const handleSearch = async (term) => {
    setSearchState(prev => ({ ...prev, searchTerm: term }));
    
    if (searchMode === "external") {
      debouncedFetchData(term);      
    } else {
      const filtered = dropdownState.options.filter((option) =>
        option.label.toLowerCase().includes(term.toLowerCase())
      );
      setDropdownState(prev => ({ ...prev, filteredOptions: filtered }));
    }
  };

  // Selection handler
  const handleSelect = (option) => {
    setDropdownState(prev => ({
      ...prev,
      selectedOption: option,
      isOpen: false,
    }));
    setSearchState(prev => ({ ...prev, searchTerm: "" }));
  };

  // Render methods
  const renderSearchInput = () => (
    <div className="dropdown__search-wrapper">
      <SearchIcon />
      <input
        type="text"
        className="dropdown__search"
        placeholder="Search..."
        value={searchState.searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );

  const renderOptions = () => (
    <ul className="dropdown__options">
      {dropdownState.filteredOptions.length === 0 || searchState.resultsFound ? (
        <li className="dropdown__option dropdown__option--empty">No results found</li>
      ) : (
        dropdownState.filteredOptions.map((option) => (
          <li
            key={option.id}
            className={`dropdown__option ${
              dropdownState.selectedOption?.id === option.id ? "dropdown__option--selected" : ""
            }`}
            onClick={() => handleSelect(option)}
          >
            {option.label}
            {dropdownState.selectedOption?.id === option.id && <CheckIcon />}
          </li>
        ))
      )}
    </ul>
  );

  // Main render
  return (
    <div className="dropdown" ref={searchInputRef}>
      <div
        className={`dropdown__input ${dropdownState.isOpen ? "dropdown__input--active" : ""}`}
        onClick={() => {
          setDropdownState(prev => ({ ...prev, isOpen: !prev.isOpen }));
          if (!dropdownState.isOpen) fetchOptions();
        }}
      >
        <span className="dropdown__selected-text">
          {dropdownState.selectedOption ? dropdownState.selectedOption.label : "Select an option"}
        </span>
        <ArrowIcon isOpen={dropdownState.isOpen} />
      </div>

      {dropdownState.isOpen && (
        <div className="dropdown__menu">
          {renderSearchInput()}
          {searchState.loading ? (
            <div className="dropdown__loading">
              <div className="dropdown__spinner"></div>
              <span>Loading options...</span>
            </div>
          ) : (
            renderOptions()
          )}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
