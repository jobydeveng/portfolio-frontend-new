import React, { useState } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCKAmCVksowwhui8Q_HusnaiB-3GyYQZNU",
  authDomain: "my-portfolio-app-4f5d5.firebaseapp.com",
  projectId: "my-portfolio-app-4f5d5",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function App() {
  const [assetType, setAssetType] = useState('stocks');
  const [value, setValue] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0,7)); // YYYY-MM

  async function ensureSignIn() {
    if (!auth.currentUser) {
      try {
        await signInAnonymously(auth);
      } catch (e) {
        console.error('Sign-in failed', e);
      }
    }
  }

  async function saveEntry() {
    await ensureSignIn();
    const user = auth.currentUser;
    const idToken = await user.getIdToken();

    const payload = {
      assetType, value: Number(value), month
    };

    const res = await fetch('https://portfolio-backend-qj1o.onrender.com/save', { // change to deployed backend later
      method: 'POST',
      headers: {
        'Content-Type':'application/json',
        'Authorization': 'Bearer ' + idToken
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert('Saved!');
      setValue('');
    } else {
      const txt = await res.text();
      alert('Error: ' + txt);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Wealth Tracker — add monthly value</h2>

      <label>Asset type:
        <select value={assetType} onChange={e=>setAssetType(e.target.value)}>
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
      <br/>
      <label>Month:
        <input type="month" value={month} onChange={e=>setMonth(e.target.value)} />
      </label>
      <br/>
      <label>Value:
        <input value={value} onChange={e=>setValue(e.target.value)} />
      </label>
      <br/>
      <button onClick={saveEntry}>Save</button>
    </div>
  );
}

export default App;
