document.getElementById("signupForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const form = e.target;
    const payload = {
      name: form.name.value,
      email: form.email.value,
      password: form.password.value,
      role: "customer"
    };

    try {
      const res = await fetch("/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (res.ok) {
        document.getElementById("signupMessage").innerHTML = `<p style='color: green;'>✅ Account created! You can now <a href='/login'>login</a>.</p>`;
        form.reset();
      } else {
        document.getElementById("signupMessage").innerHTML = `<p style='color: red;'>❌ ${result.detail}</p>`;
      }
    } catch (err) {
      console.error(err);
      document.getElementById("signupMessage").innerHTML = `<p style='color: red;'>❌ Network error. Try again.</p>`;
    }
  });