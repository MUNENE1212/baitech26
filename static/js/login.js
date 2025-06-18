document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const form = e.target;
    const data = new URLSearchParams();
    data.append("email", form.email.value);
    data.append("password", form.password.value);

    try {
      const res = await fetch("/login/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: data
      });
      const result = await res.json();

      if (res.ok) {
        document.getElementById("loginMessage").innerHTML = `<p style='color:green;'>✅ Login successful</p>`;
        // Redirect or save token if needed
      } else {
        document.getElementById("loginMessage").innerHTML = `<p style='color:red;'>❌ ${result.detail}</p>`;
      }
    } catch (err) {
      console.error(err);
      document.getElementById("loginMessage").innerHTML = `<p style='color:red;'>❌ Something went wrong. Try again.</p>`;
    }
  });