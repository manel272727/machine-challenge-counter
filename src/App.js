import React, { useState, useEffect, useMemo } from "react";
import "./App.css";
import { supabase } from "./supabaseClient";
import { FaSortDown, FaSearch, FaTimes } from "react-icons/fa";

function App() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    difficulty: "easy",
    type: "machine"
  });

  // New filter states
  const [difficultyFilter, setDifficultyFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems(query = "") {
    let req = supabase.from("items").select("*").order("created_at", { ascending: true });

    if (query) {
      req = req.ilike("name", `%${query}%`); // case-insensitive search
    }

    const { data, error } = await req;
    if (error) console.error(error);
    else setItems(data);
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from("items").insert([formData]).select();
    if (error) {
      console.error(error);
    } else {
      setItems([...items, ...data]);
      setFormData({ name: "", difficulty: "easy", type: "machine" });
      setShowForm(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchItems(value);
  };

  // Calculate counts for badges (summary)
  const counts = {
    machine: { easy: 0, medium: 0, hard: 0 },
    challenge: { easy: 0, medium: 0, hard: 0 }
  };

  items.forEach(item => {
    counts[item.type][item.difficulty]++;
  });

  // Memoized counts for filter dropdown options
  const difficultyOptions = useMemo(() => {
    const counts = {};
    items.forEach(item => {
      counts[item.difficulty] = (counts[item.difficulty] || 0) + 1;
    });
    return counts;
  }, [items]);

  const typeOptions = useMemo(() => {
    const counts = {};
    items.forEach(item => {
      counts[item.type] = (counts[item.type] || 0) + 1;
    });
    return counts;
  }, [items]);

  // Filter items based on search term and selected filters
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter ? item.difficulty === difficultyFilter : true;
    const matchesType = typeFilter ? item.type === typeFilter : true;
    return matchesSearch && matchesDifficulty && matchesType;
  });

  return (
    <div className="App">
      <div className="header">
        <h1>Machine & Challenge Tracker</h1>
        <button 
          onClick={() => {
            setShowSearch(!showSearch);
            setSearchTerm("");
          }} 
          className="icon-btn"
          aria-label={showSearch ? "Close search" : "Open search"}
        >
          {showSearch ? <FaTimes /> : <FaSearch />}
        </button>
      </div>

      {showSearch && (
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-bar"
        />
      )}

      <button onClick={() => setShowForm(!showForm)}>➕ Add</button>

      {showForm && (
        <div className="formContainer">
          <h3>Add New Entry</h3>
          <form onSubmit={handleSubmit}>
            <label>
              Name:
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Difficulty:
              <select id="difficulty" value={formData.difficulty} onChange={handleChange}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </label>
            <label>
              Type:
              <select id="type" value={formData.type} onChange={handleChange}>
                <option value="machine">Machine</option>
                <option value="challenge">Challenge</option>
              </select>
            </label>
            <button type="submit">Save</button>
          </form>
        </div>
      )}

      <h2>Summary</h2>
      <div className="summary-card">
        <strong>Machines:</strong> Easy {counts.machine.easy}, Medium {counts.machine.medium}, Hard {counts.machine.hard}
        <br />
        <strong>Challenges:</strong> Easy {counts.challenge.easy}, Medium {counts.challenge.medium}, Hard {counts.challenge.hard}
      </div>

      <h2>All Entries</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th style={{ position: 'relative' }}>
              Difficulty
              <button
                onClick={() => {
                  setShowDifficultyDropdown(!showDifficultyDropdown);
                  setShowTypeDropdown(false);
                }}
                className="filter-arrow"
                aria-label="Filter Difficulty"
                type="button"
              >
                <FaSortDown />
              </button>
              {showDifficultyDropdown && (
                <ul className="filter-dropdown">
                  <li
                    className={!difficultyFilter ? "selected" : ""}
                    onClick={() => {
                      setDifficultyFilter(null);
                      setShowDifficultyDropdown(false);
                    }}
                  >
                    All ({items.length})
                  </li>
                  {Object.entries(difficultyOptions).map(([key, count]) => (
                    <li
                      key={key}
                      className={difficultyFilter === key ? "selected" : ""}
                      onClick={() => {
                        setDifficultyFilter(key);
                        setShowDifficultyDropdown(false);
                      }}
                    >
                      {key} ({count})
                    </li>
                  ))}
                </ul>
              )}
            </th>
            <th style={{ position: 'relative' }}>
              Type
              <button
                onClick={() => {
                  setShowTypeDropdown(!showTypeDropdown);
                  setShowDifficultyDropdown(false);
                }}
                className="filter-arrow"
                aria-label="Filter Type"
                type="button"
              >
                <FaSortDown />
              </button>
              {showTypeDropdown && (
                <ul className="filter-dropdown">
                  <li
                    className={!typeFilter ? "selected" : ""}
                    onClick={() => {
                      setTypeFilter(null);
                      setShowTypeDropdown(false);
                    }}
                  >
                    All ({items.length})
                  </li>
                  {Object.entries(typeOptions).map(([key, count]) => (
                    <li
                      key={key}
                      className={typeFilter === key ? "selected" : ""}
                      onClick={() => {
                        setTypeFilter(key);
                        setShowTypeDropdown(false);
                      }}
                    >
                      {key} ({count})
                    </li>
                  ))}
                </ul>
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>
                <span className={`badge ${item.difficulty}`}>
                  {item.difficulty}
                </span>
              </td>
              <td>{item.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
