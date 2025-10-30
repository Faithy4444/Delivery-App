import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "https://deliveryappfrontend.hosting.codeyourfuture.io",
  "http://127.0.0.1:3000",
  "http://localhost:3000"
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS policy: This origin is not allowed."), false);
  },
  methods: ['GET','POST','OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

app.options("/send-email", cors());


app.use(bodyParser.json());

// 📨 Route to handle sending email
app.post("/send-email", async (req, res) => {
  const { name, email, pickup, dropoff, goodsList, quoteAmount,pickupAddress, dropoffAddress, currency } = req.body;

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
  user: "muzondodelivery@gmail.com",
  pass: "vjyjuwpwvmftmtdb",
},

    });

    // Create formatted list of goods
    const goodsDetails = goodsList
      .map((g, i) => `${i + 1}. ${g.goodsName} — ${g.weight} kg`)
      .join("\n");

    // Email content

    const currencySymbols = {
  ZAR: "R",
  USD: "$",
  ZWL: "ZWL"
};
    const mailOptions = {
      from: "muzondodelivery@gmail.com",
      to: email,
      subject: "🚚 New Delivery Request",
      text: `
📦 New delivery request received:

👤 Name: ${name}
📧 Email: ${email}
📍 Pickup: ${pickup}, ${pickupAddress}
🏁 Drop-off: ${dropoff}, ${dropoffAddress}
💰 Quote Amount: ${currencySymbols[currency] || ""}${quoteAmount} (${currency})
🧾 Goods Details:
${goodsDetails}

🕒 Sent on: ${new Date().toLocaleString()}
      `,
      replyTo: "muzondodelivery@gmail.com",
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Email failed:", error);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

// Root route (for quick testing)
app.get("/", (req, res) => {
  res.send("🚀 Delivery backend is running!");
});

//Start the server
app.listen(PORT, () =>
  console.log(`Server running at: http://localhost:${PORT}`)
);
