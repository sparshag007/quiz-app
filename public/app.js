function toggleAuthForm() {
    document.getElementById("authForm").style.display = document.getElementById("authForm").style.display === "none" ? "block" : "none";
    document.getElementById("registerForm").style.display = document.getElementById("registerForm").style.display === "none" ? "block" : "none";
}

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
  
    if (token) {
      try {
        const response = await fetch('/api/auth/checkToken', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          }
        });
  
        if (response.ok) {
          window.location.href = '/dashboard.html';
        }
      } catch (error) {
        console.error('Error verifying token:', error);
      }
    }
  });
  
  // Handle login form submission
  document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
  
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        window.location.href = "/dashboard.html";
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  });
  
  // Handle registration form submission
  document.getElementById("signupForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = document.getElementById("username").value; // Get username
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;
  
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }), // Include username
      });
  
      const data = await response.json();
      if (response.ok) {
        alert("Registration successful! You can now log in.");
        toggleAuthForm();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error registering:", error);
    }
  });
  