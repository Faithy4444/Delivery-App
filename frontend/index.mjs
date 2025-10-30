
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
  quantityInput.value = "";
  goodsInput.focus();
});

// Calculate quote
let total = 0;
let convertedTotal = 0;
let selectedCurrency = "ZAR";
document.getElementById("getQuote").addEventListener("click", async () => {
  const pickup = document.getElementById("pickup").value;
  const dropoff = document.getElementById("dropoff").value;
  const msg = document.getElementById("msg");

  const currencyRadios = document.getElementsByName("currency");
  for (const radio of currencyRadios) {
    if (radio.checked) {
      selectedCurrency = radio.value;
      break;
    }
  }

  if (!pickup || !dropoff) {
    msg.textContent = "⚠️ Please select pickup and drop-off locations.";
    msg.style.color = "red";
    return;
  }

  total = 0;
  let distanceFee = 500;
   if (pickup === "Johannesburg" && dropoff === "Harare") distanceFee = 800;
    else if (pickup === "Durban" && dropoff === "Gweru") distanceFee = 700;

  total += distanceFee;
  goodsList.forEach(item => {
    let { goodsName, weight } = item;
    weight = parseFloat(weight);

    let baseFee = 200;
    let perKg = 5;
    let multiplier = 1;

    if (goodsName === "Fragile Items") multiplier = 1.1;
    if (goodsName === "Machinery") multiplier = 1.2;

    total += (baseFee + weight * perKg) * multiplier;
  });
  // Convert to selected currency
  convertedTotal = total;
  if (selectedCurrency !== "ZAR") {
    try {
      const response = await fetch("https://v6.exchangerate-api.com/v6/ca543deae5c24045862728f5/latest/ZAR");
      const data = await response.json();
      const rate = data.conversion_rates[selectedCurrency];

      convertedTotal = total * rate;
    } catch (err) {
      console.error(err);
      msg.textContent = "⚠️ Could not fetch currency rates. Showing ZAR total.";
      msg.style.color = "orange";
    }
  }

  msg.textContent = `💰 Estimated Total Quote: ${selectedCurrency} ${convertedTotal.toFixed(2)}`;
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
    pickAddress: document.getElementById("pickupAddress").value,
    dropoff: document.getElementById("dropoff").value,
    dropoffAddress: document.getElementById("dropoffAddress").value,
    goodsList,
    quoteAmount: convertedTotal.toFixed(2),
    currency: selectedCurrency,
  };

const backendURL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://deliveryappbackend.hosting.codeyourfuture.io";


  try {
    const response = await fetch(`${backendURL}/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    if (result.success) {
      msg.textContent = "Order placed! Email sent successfully!";
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
