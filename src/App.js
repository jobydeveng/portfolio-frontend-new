import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
} from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyCKAmCVksowwhui8Q_HusnaiB-3GyYQZNU",
  authDomain: "my-portfolio-app-4f5d5.firebaseapp.com",
  projectId: "my-portfolio-app-4f5d5",
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

export default function App() {
  const [assetType, setAssetType] = useState("stocks");
  const [value, setValue] = useState("");
  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  );
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // -------------------------------------------------
  // Keep Firebase auth alive (anonymous is fine)
  // -------------------------------------------------
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
      else signInAnonymously(auth).catch(console.error);
    });
    return () => unsub();
  }, []);

  // -------------------------------------------------
  // Save → ONLY through FastAPI backend
  // -------------------------------------------------
  const saveEntry = async () => {
    if (!user) return alert("Not signed in");
    if (!value || isNaN(Number(value))) return alert("Enter a valid number");

    setLoading(true);
    try {
      const idToken = await user.getIdToken();

      const payload = {
        assetType,
        value: Number(value),
        month,
      };

      const res = await fetch(
        "https://portfolio-backend-qj1o.onrender.com/save",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const txt = await res.text();
      if (res.ok) {
        alert("Saved!");
        setValue("");
      } else {
        alert(`Error ${res.status}: ${txt}`);
      }
    } catch (e) {
      alert("Network error: " + (e?.message || "Unknown error"));    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>Wealth Tracker — add monthly value</h2>

      <label>
        Asset type:
        <select
          value={assetType}
          onChange={(e) => setAssetType(e.target.value)}
        >
          <option value="stocks">Stocks</option>
          <option value="mutual_funds">Mutual Funds</option>
          <option value="gold">Gold</option>
          <option value="fd">FD</option>
          <option value="bitcoin">Bitcoin</option>
          <option value="nps">NPS</option>
          <option value="pf">PF</option>
          <option value="other">Other</option>
        </select>
      </label>
      <br />
      <br />

      <label>
        Month:
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </label>
      <br />
      <br />

      <label>
        Value:
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. 1000"
        />
      </label>
      <br />
      <br />

      <button onClick={saveEntry} disabled={loading}>
        {loading ? "Saving…" : "Save"}
      </button>
    </div>
  );
}