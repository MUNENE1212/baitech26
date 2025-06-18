document.addEventListener("DOMContentLoaded", () => {
  const orderForm = document.getElementById("orderForm");
  const messageDiv = document.getElementById("orderMessage");

  orderForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(orderForm);
    const item = {
      product_id: formData.get("product_id"),
      name: formData.get("product_name"),
      price: parseFloat(formData.get("price")),
      quantity: parseInt(formData.get("quantity"))
    };

    const order = {
      customer_name: formData.get("customer_name"),
      customer_contact: formData.get("contact"),
      service_note: formData.get("notes") || "",
      items: [item],
      total_price: item.price * item.quantity,
      payment_status: "Pending",
      order_status: "Processing"
    };

    try {
      const response = await fetch("/orders/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order)
      });

      const result = await response.json();

      if (response.ok) {
        messageDiv.innerHTML = `
          <p style="color: green;">
            ✅ Order placed successfully!<br>
            <strong>Order Number:</strong> ${result.order_number}
          </p>
        `;
        orderForm.reset();
      } else {
        messageDiv.innerHTML = `<p style="color: red;">❌ Error: ${result.detail || 'Could not place order'}</p>`;
      }
    } catch (error) {
      messageDiv.innerHTML = `<p style="color: red;">❌ Network error. Please try again.</p>`;
      console.error("Error submitting order:", error);
    }
  });
});
