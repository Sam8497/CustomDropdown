import React from "react";
import Dropdown from "./components/Dropdown/Dropdown";
import "./components/Dropdown/dropdown.scss";

const App = () => {
  
  return (
    <div className="app-container">
      <h1>Dropdown with Search</h1>
      <div className="dropdown-container">
        <Dropdown url="https://6301a75d9a1035c7f804ccb5.mockapi.io/dropdown-info-api" searchMode="internal" />
      </div>
    </div>
  );
};

export default App;
