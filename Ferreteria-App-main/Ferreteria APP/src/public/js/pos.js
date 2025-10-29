// src/public/js/pos.js
document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos del DOM ---
    const productSearchInput = document.getElementById('productSearchInput');
    const productList = document.getElementById('productList');
    const clientSearchInput = document.getElementById('clientSearchInput');
    const clientList = document.getElementById('clientList');
    const selectedClientWrapper = document.getElementById('selectedClientWrapper');
    const selectedClientDisplay = document.getElementById('selectedClientDisplay');
    const clearClientBtn = document.getElementById('clearClientBtn');
    const genericClientCheck = document.getElementById('genericClientCheck');
    const saleCartElement = document.getElementById('saleCart');
    const subtotalAmount = document.getElementById('subtotalAmount');
    const ivaAmount = document.getElementById('ivaAmount');
    const totalAmount = document.getElementById('totalAmount');
    const paymentMethodSelect = document.getElementById('paymentMethod');
    const sucursalSelect = document.getElementById('sucursalSelect');
    const processPaymentBtn = document.getElementById('processPaymentBtn');
    const newSaleBtn = document.getElementById('newSaleBtn');
    let cart = [];
    let selectedClient = null;
    const GENERIC_CLIENT_ID = 9999;
    const calculateTotals = () => { const subtotal = cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0); const iva = subtotal * 0.15; const total = subtotal + iva; subtotalAmount.textContent = `$${subtotal.toFixed(2)}`; ivaAmount.textContent = `$${iva.toFixed(2)}`; totalAmount.textContent = `$${total.toFixed(2)}`; };
    const updateSaleUI = () => { if (cart.length === 0) { saleCartElement.innerHTML = '<p class="empty-cart-text">Añade productos para empezar.</p>'; } else { saleCartElement.innerHTML = cart.map((item, index) => `<div class="sale-item"><div><strong>${item.nombre}</strong><br><div class="d-flex align-items-center mt-1"><button class="btn btn-sm btn-secondary" onclick="changeQuantity(${index}, -1)">-</button><span class="mx-2">${item.quantity}</span><button class="btn btn-sm btn-secondary" onclick="changeQuantity(${index}, 1)">+</button></div></div><div class="d-flex align-items-center"><span class="fw-bold fs-5 me-3">$${(item.precio * item.quantity).toFixed(2)}</span><button class="btn btn-sm btn-outline-danger" onclick="removeFromCart(${index})"><i class="bi bi-trash-fill"></i></button></div></div>`).join(''); } calculateTotals(); };
    window.changeQuantity = (index, amount) => { const item = cart[index]; const newQuantity = item.quantity + amount; if (newQuantity > item.stock) { return alert(`No puedes añadir más. Stock disponible: ${item.stock}`); } if (newQuantity <= 0) { cart.splice(index, 1); } else { item.quantity = newQuantity; } updateSaleUI(); };
    window.removeFromCart = (index) => { cart.splice(index, 1); updateSaleUI(); };
    window.addProductToCart = (e) => { e.preventDefault(); const { id, nombre, precio, stock } = e.currentTarget.dataset; if (parseInt(stock, 10) <= 0) return alert(`El producto "${nombre}" no tiene stock disponible.`); const existingProduct = cart.find(item => item.id === id); if (existingProduct && existingProduct.quantity >= parseInt(stock, 10)) return alert(`No puedes añadir más de "${nombre}". Stock máximo alcanzado.`); if (existingProduct) { existingProduct.quantity++; } else { cart.push({ id, nombre, precio: parseFloat(precio), quantity: 1, stock: parseInt(stock, 10) }); } productSearchInput.value = ''; productList.innerHTML = ''; updateSaleUI(); };
    window.selectClient = (e) => { e.preventDefault(); const { id, nombre } = e.currentTarget.dataset; selectedClient = { id: parseInt(id), nombre }; clientSearchInput.style.display = 'none'; genericClientCheck.parentElement.style.display = 'none'; selectedClientDisplay.textContent = nombre; selectedClientWrapper.style.display = 'flex'; clientList.innerHTML = ''; };
    productSearchInput.addEventListener('keyup', async (e) => { const term = e.target.value; if (term.length < 2) { productList.innerHTML = ''; return; } const response = await fetch(`/api/pos/search-products?term=${term}`); const products = await response.json(); productList.innerHTML = products.map(p => `<a href="#" class="product-item ${p.stock <= 0 ? 'disabled' : ''}" data-id="${p.id_producto}" data-nombre="${p.nombre}" data-precio="${p.precio_venta}" data-stock="${p.stock}" onclick="addProductToCart(event)"><div><span class="product-item-name">${p.nombre}</span><small class="product-item-stock">Stock: ${p.stock}</small></div><span class="product-item-price">$${parseFloat(p.precio_venta).toFixed(2)}</span></a>`).join(''); });
    clientSearchInput.addEventListener('keyup', async (e) => { const term = e.target.value; if (term.length < 2) { clientList.innerHTML = ''; return; } const response = await fetch(`/api/pos/search-clients?term=${term}`); const clients = await response.json(); clientList.innerHTML = clients.map(c => `<a href="#" class="list-group-item" data-id="${c.id_usuario}" data-nombre="${c.nombre} ${c.apellido || ''}" onclick="selectClient(event)">${c.nombre} ${c.apellido || ''} <small>(${c.correo})</small></a>`).join(''); });
    clearClientBtn.addEventListener('click', () => { selectedClient = null; selectedClientWrapper.style.display = 'none'; clientSearchInput.style.display = 'block'; genericClientCheck.parentElement.style.display = 'block'; genericClientCheck.checked = false; clientSearchInput.value = ''; });
    genericClientCheck.addEventListener('change', () => { if (genericClientCheck.checked) { selectedClient = { id: GENERIC_CLIENT_ID, nombre: 'Cliente Mostrador' }; clientSearchInput.style.display = 'none'; selectedClientDisplay.textContent = 'Cliente Mostrador'; selectedClientWrapper.style.display = 'flex'; } else { clearClientBtn.click(); } });
    newSaleBtn.addEventListener('click', () => { if (confirm('¿Seguro que quieres empezar una nueva venta?')) { window.location.reload(); } });
    processPaymentBtn.addEventListener('click', async () => {
        const sucursalId = sucursalSelect ? sucursalSelect.value : null;
        if (cart.length === 0) return alert('El carrito de venta está vacío.');
        if (!selectedClient) return alert('Por favor, selecciona un cliente o marca "Cliente Mostrador".');
        if (!sucursalId) return alert('Por favor, selecciona una sucursal.');
        const subtotal = cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0); const total = subtotal * 1.15;
        const saleData = { cart: cart.map(item => ({ id: item.id, quantity: item.quantity, precio: item.precio })), clientId: selectedClient.id, paymentMethod: paymentMethodSelect.value, total: total.toFixed(2), sucursalId };
        processPaymentBtn.disabled = true; processPaymentBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Procesando...';
        try {
            const response = await fetch('/api/pos/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(saleData) });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            alert(`Venta #${result.ventaId} procesada exitosamente.`);
            window.location.reload();
        } catch (error) {
            alert(`Error al procesar la venta: ${error.message}`);
        } finally {
            processPaymentBtn.disabled = false;
            processPaymentBtn.textContent = 'Procesar Pago';
        }
    });
});