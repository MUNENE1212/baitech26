function addToCart(productId, name, price) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find(p => p.productId === productId);
  
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ productId, name, price, quantity: 1 });
    }
  
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${name} added to cart`);
  }
  
  function loadCartToPage() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartTable = document.getElementById("cartTableBody");
    const totalDisplay = document.getElementById("cartTotal");
    cartTable.innerHTML = "";
  
    let total = 0;
    cart.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
  
      cartTable.innerHTML += `
        <tr>
          <td>${item.name}</td>
          <td>Ksh ${item.price}</td>
          <td><input type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${index}, this.value)"></td>
          <td>Ksh ${itemTotal}</td>
          <td><button onclick="removeItem(${index})">❌</button></td>
        </tr>
      `;
    });
  
    totalDisplay.textContent = `Total: Ksh ${total}`;
  }
  
  function updateQuantity(index, qty) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart[index].quantity = parseInt(qty);
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCartToPage();
  }
  
  function removeItem(index) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCartToPage();
  }
  