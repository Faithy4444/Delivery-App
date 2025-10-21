
// Add another goods item dynamically
const addItem = document.getElementById("addGoods");
const goodsInput = document.getElementById("goods"); 
const quantityInput = document.getElementById("weight");
const goodsList = []; // store all added goods

addItem.addEventListener("click", () => {
  const list = document.getElementById("goodslist");
  const goodsName = goodsInput.value.trim();
 const weightValue = parseFloat(quantityInput.value); // convert to number

if (!goodsName || !weightValue || weightValue < 20) {
    alert("Please enter a valid item name and weight (min 20kg).");
    return;
}

goodsList.push({ goodsName, weight: weightValue }); // store number


  const newItemDisplay = document.createElement("div"); 
  newItemDisplay.classList.add("added-goods-item");
  newItemDisplay.innerHTML = `
    <p><strong>Item:</strong> ${goodsName}</p>
    <p><strong>Weight:</strong> ${weightValue}kg</p>
    <hr>
  `;

  list.appendChild(newItemDisplay);

  goodsInput.value = "";
  quantityInput.value = 20;
  goodsInput.focus();
});

// Calculate quote
document.getElementById("getQuote").addEventListener("click", () => {
  const pickup = document.getElementById("pickup").value;
  const dropoff = document.getElementById("dropoff").value;
  const msg = document.getElementById("msg");

  if (!pickup || !dropoff) {
    msg.textContent = "⚠️ Please select pickup and drop-off locations.";
    msg.style.color = "red";
    return;
  }

  let total = 0;
  goodsList.forEach(item => {
    let { goodsName, weight } = item;
    weight = parseFloat(weight);

    let baseFee = 200;
    let perKg = 5;

    let distanceFee = 500;
    if (pickup === "Johannesburg" && dropoff === "Harare") distanceFee = 800;
    else if (pickup === "Durban" && dropoff === "Gweru") distanceFee = 700;

    let multiplier = 1;
    if (goodsName === "Fragile Items") multiplier = 1.1;
    if (goodsName === "Machinery") multiplier = 1.2;

    total += (baseFee + distanceFee + weight * perKg) * multiplier;
  });

  msg.textContent = `💰 Estimated Total Quote: R${total.toFixed(2)}`;
  msg.style.color = "#0066cc";
});

// Send order to backend
const form = document.getElementById("requestForm");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = document.getElementById("msg");

  if (goodsList.length === 0) {
    msg.textContent = "⚠️ Please add at least one goods item before placing an order.";
    msg.style.color = "red";
    return;
}

  const formData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    pickup: document.getElementById("pickup").value,
    dropoff: document.getElementById("dropoff").value,
    goodsList,
  };

  try {
    const response = await fetch("http://localhost:5000/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    if (result.success) {
      msg.textContent = "✅ Order placed! Email sent successfully!";
      msg.style.color = "green";
      form.reset();
      goodsList.length = 0; // clear array
      document.getElementById("goodslist").innerHTML = "";
    } else {
      msg.textContent = "❌ Failed to send email. Please try again.";
      msg.style.color = "red";
    }
  } catch (error) {
    console.error(error);
    msg.textContent = "⚠️ Server error. Please check connection.";
    msg.style.color = "red";
  }
});
