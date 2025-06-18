document.addEventListener("DOMContentLoaded", () => {
  loadCartToPage();

  document.getElementById("checkoutForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const form = e.target;
    const order = {
      customer_name: form.customer_name.value,
      customer_contact: form.contact.value,  // ✅ correct key
      service_note: form.notes?.value || "", // ✅ optional field mapped correctly
      items: cart.map(item => ({
        product_id: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      total_price: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      payment_status: "Pending",
      order_status: "Processing"
    };

    console.log("🚀 Order payload:", JSON.stringify(order, null, 2)); // Debug

    try {
      const response = await fetch("/orders/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order)
      });

      const result = await response.json();
      const msg = document.getElementById("checkoutMessage");

      if (response.ok) {
        msg.innerHTML = `<p style="color: green;">✅ Order placed! Order No: <strong>${result.order_number}</strong></p>`;
        localStorage.removeItem("cart");
        form.reset();
        loadCartToPage();
      } else {
        msg.innerHTML = `<p style="color: red;">❌ Error: ${result.detail || 'Order failed'}</p>`;
        console.error(result);
      }
    } catch (err) {
      alert("Network error. Try again.");
      console.error(err);
    }
  });
});
