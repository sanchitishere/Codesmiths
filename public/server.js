const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// MongoDB connection (uncomment and configure when ready)
// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(() => console.log('MongoDB connected'))
// .catch(err => console.log(err));

// Define user schema (uncomment and modify when ready)
// const UserSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   name: String,
//   age: String,
//   gender: String,
//   address: String,
//   bloodType: String,
//   allergies: [String],
//   conditions: [String],
//   riskFactors: [String],
//   prescriptions: [{ name: String, dosage: String }],
//   emergencyContacts: [{ name: String, relation: String, phone: String }]
// });
//
// const User = mongoose.model('User', UserSchema);

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Login API endpoint
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  // For demonstration - replace with database authentication
  if (username === "user" && password === "password") {
    // Demo user data - replace with database query
    const userData = {
      name: "John Doe",
      age: "42 years",
      gender: "Male",
      address: "123 Main Street, Anytown, CA 90210",
      bloodType: "O+",
      allergies: ["Penicillin", "Peanuts", "Shellfish", "Latex"],
      conditions: ["Asthma", "Hypertension", "Type 2 Diabetes"],
      riskFactors: ["Cardiac Arrest", "Seizures", "Anaphylaxis"],
      prescriptions: [
        { name: "Metformin", dosage: "500mg twice daily" },
        { name: "Lisinopril", dosage: "10mg once daily" },
        { name: "Ventolin Inhaler", dosage: "As needed for asthma" },
        { name: "Atorvastatin", dosage: "20mg daily at bedtime" },
      ],
      emergencyContacts: [
        { name: "Jane Doe", relation: "Spouse", phone: "+1 (555) 123-4567" },
        {
          name: "Dr. Sarah Johnson",
          relation: "Primary Physician",
          phone: "+1 (555) 987-6543",
        },
        { name: "Michael Doe", relation: "Son", phone: "+1 (555) 456-7890" },
      ],
    };

    return res.status(200).json({ success: true, userData });
  }

  return res
    .status(401)
    .json({ success: false, message: "Invalid credentials" });
});

// SOS API endpoint
app.post("/api/sos", (req, res) => {
  const { active, userId } = req.body;

  // In a real app, you would:
  // 1. Log the emergency
  // 2. Notify emergency contacts (SMS/email)
  // 3. Potentially connect with emergency services API

  console.log(`SOS ${active ? "ACTIVATED" : "DEACTIVATED"} for user ${userId}`);

  return res.status(200).json({
    success: true,
    message: active
      ? "Emergency services and contacts notified"
      : "Emergency alert deactivated",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
