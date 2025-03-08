document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const loginSection = document.getElementById("loginSection");
  const profileSection = document.getElementById("profileSection");
  const sosButton = document.getElementById("sosButton");
  const sosButtonProfile = document.getElementById("sosButtonProfile");
  const messageDiv = document.getElementById("message");
  const logoutBtn = document.getElementById("logoutBtn");

  // User data will be populated from server response
  let userData = null;

  // Handle form submission
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Call the login API
    fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          userData = data.userData;
          showMessage(
            "Login successful! Loading your medical profile...",
            "success"
          );

          // Show profile section and hide login section after a delay
          setTimeout(() => {
            loginSection.style.display = "none";
            profileSection.style.display = "block";

            // Update UI with user data
            document.getElementById("profileName").textContent = userData.name;
            document.getElementById("ageTag").textContent = userData.age;
            document.getElementById("bloodType").textContent =
              userData.bloodType;
            document.getElementById("userGender").textContent = userData.gender;
            document.getElementById("userAddress").textContent =
              userData.address;
          }, 1000);
        } else {
          showMessage("Invalid username or password!", "error");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        showMessage("Server error. Please try again later.", "error");
      });
  });

  // Handle SOS button click (both buttons)
  [sosButton, sosButtonProfile].forEach((button) => {
    button.addEventListener("click", function () {
      const isActive = button.classList.contains("sos-pulse");
      const newState = !isActive;

      // Sync both buttons
      sosButton.classList.toggle("sos-pulse", newState);
      sosButtonProfile.classList.toggle("sos-pulse", newState);

      // Call the SOS API
      fetch("/api/sos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          active: newState,
          userId: userData ? userData.name : "unknown",
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success && newState) {
            showMessage(
              "EMERGENCY ALERT ACTIVATED! Emergency services and contacts are being notified.",
              "emergency"
            );
          } else if (!newState) {
            messageDiv.style.display = "none";
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    });
  });

  // Handle logout
  logoutBtn.addEventListener("click", function () {
    profileSection.style.display = "none";
    loginSection.style.display = "block";
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    sosButton.classList.remove("sos-pulse");
    sosButtonProfile.classList.remove("sos-pulse");
    messageDiv.style.display = "none";
    userData = null;
  });

  // Function to display messages
  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = "message " + type;
    messageDiv.style.display = "block";

    // Auto-hide success/error messages after 3 seconds (but not emergency messages)
    if (type !== "emergency") {
      setTimeout(() => {
        messageDiv.style.display = "none";
      }, 3000);
    }
  }
});
