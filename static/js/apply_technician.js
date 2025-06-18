document.getElementById("technicianForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
      full_name: form.full_name.value,
      email: form.email.value,
      phone_number: form.phone_number.value,
      skills: form.skills.value,
      experience_years: parseInt(form.experience_years.value)
    };

    try {
      const res = await fetch("/apply-technician", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      document.getElementById("formMessage").innerHTML = `<p style="color: green;">✅ ${result.message}</p>`;
      form.reset();
    } catch (err) {
      document.getElementById("formMessage").innerHTML = `<p style="color: red;">❌ Something went wrong. Try again.</p>`;
      console.error(err);
    }
  });