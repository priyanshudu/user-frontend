// signup.js

document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value;

  if (!name || !email || !phone || !password) {
    alert("All fields are required");
    return;
  }

  try {
    // 1️⃣ Send OTP / confirmation email via Supabase
    const { error } = await supabaseClient.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "http://localhost:5000/login.html"
      }
    });

    if (error) {
      alert(error.message);
      return;
    }

    // 2️⃣ Save candidate data in backend (DB insert)
    const res = await fetch("http://localhost:5000/api/candidates/signup-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone,
        password
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Signup failed");
      return;
    }

    alert("Verification email sent ✅\nPlease check your inbox and confirm.");

  } catch (err) {
    console.error("Signup error:", err);
    alert("Server error");
  }
});
