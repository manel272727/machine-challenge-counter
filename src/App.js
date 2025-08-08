import React, { useState, useEffect } from "react";
import "./App.css";
import { supabase } from "./supabaseClient";

function App() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    difficulty: "easy",
    type: "machine"
  });

  // Load data from Supabase on startup
  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) console.error(error);
    else setItems(data);
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from("items")
      .delete()
      .eq("id", id);
  
    if (error) {
      console.error("Delete error:", error);
      alert("Failed to delete item.");
    } else {
      setItems(items.filter(item => item.id !== id));
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from("items")
      .insert([formData])
      .select();

    if (error) {
      console.error(error);
    } else {
      setItems([...items, ...data]); // Add new row from Supabase
      setFormData({ name: "", difficulty: "easy", type: "machine" });
      setShowForm(false);
    }
  };

  const counts = {
    machine: { easy: 0, medium: 0, hard: 0 },
    challenge: { easy: 0, medium: 0, hard: 0 }
  };

  items.forEach(item => {
    counts[item.type][item.difficulty]++;
  });

  return (
    <div className="App">
      <h1>Machine & Challenge Tracker</h1>
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
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </label>

            <label>
              Type:
              <select
                id="type"
                value={formData.type}
                onChange={handleChange}
              >
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
      <th>Difficulty</th>
      <th>Type</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    {items.map((item) => (
      <tr key={item.id}>
        <td>{item.name}</td>
        <td>
          <span className={`badge ${item.difficulty}`}>
            {item.difficulty}
          </span>
        </td>
        <td>{item.type}</td>
        <td>
          <button onClick={() => handleDelete(item.id)} className="delete-button">
            Delete
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

    </div>
  );
}

export default App;
