document.getElementById("serviceForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
      customer_name: form.customer_name.value,
      contact: form.contact.value,
      service_type: form.service_type.value,
      item: form.item.value,
      description: form.description.value
    };
  
    const response = await fetch("/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  
    const result = await response.json();
    const resBox = document.getElementById("serviceResponse");
  
    if (response.ok) {
      resBox.innerHTML = `<p style="color: green;">✅ Request submitted. Ref: ${result.service_id}</p>`;
      form.reset();
    } else {
      resBox.innerHTML = `<p style="color: red;">❌ Error: ${result.detail || "Unable to process request."}</p>`;
    }
  });
  