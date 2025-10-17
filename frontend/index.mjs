  document.getElementById("requestForm").onsubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const res = await fetch("http://localhost:4000/api/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    document.getElementById("msg").innerHTML = 
      `✅ ${json.message}<br>Your Tracking ID: <b>${json.trackingId}</b>`;
  };