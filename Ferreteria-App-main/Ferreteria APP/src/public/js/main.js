// src/public/js/main.js
document.addEventListener('DOMContentLoaded', () => {

    const cartCountElement = document.getElementById('cart-count');
    const cartContentElement = document.getElementById('cartContent');
    const cartModalElement = document.getElementById('cartModal');
    const buyNowBtn = document.getElementById('buy-now-btn');

    // --- FUNCIÓN PARA ACTUALIZAR LA INTERFAZ DEL CARRITO (CON NUEVO DISEÑO) ---
    const updateCartUI = (cart) => {
        // Solo intenta actualizar los elementos si existen en la página.
        if (cartCountElement) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountElement.textContent = totalItems;
        }

        if (cartContentElement) {
            if (!cart || cart.length === 0) {
                cartContentElement.innerHTML = `
                    <div class="text-center py-5">
                        <i class="bi bi-cart-x" style="font-size: 4rem; opacity: 0.5;"></i>
                        <h5 class="mt-3">Tu carrito está vacío</h5>
                        <p>Añade productos para verlos aquí.</p>
                    </div>`;
            } else {
                let total = 0;
                const cartHTML = `
                    <ul class="list-group list-group-flush">
                        ${cart.map(item => {
                            const itemPrice = parseFloat(item.precio);
                            const subtotal = itemPrice * item.quantity;
                            total += subtotal;
                            return `
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <div class="d-flex align-items-center">
                                        <img src="${item.imagen || '/logo.png'}" alt="${item.nombre}" style="width: 60px; height: 60px; object-fit: contain;" class="me-3 rounded">
                                        <div>
                                            <h6 class="my-0 card-title">${item.nombre}</h6>
                                            <small>${item.quantity} x $${itemPrice.toFixed(2)}</small>
                                        </div>
                                    </div>
                                    <div class="d-flex align-items-center">
                                        <span class="fw-bold me-3 card-title">$${subtotal.toFixed(2)}</span>
                                        <button class="btn btn-sm btn-outline-danger remove-from-cart-btn" data-id="${item.id}" title="Eliminar producto">
                                            <i class="bi bi-trash-fill"></i>
                                        </button>
                                    </div>
                                </li>`;
                        }).join('')}
                    </ul>
                    <hr>
                    <div class="d-flex justify-content-end px-3">
                        <div class="text-end">
                            <p class="mb-1">Total:</p>
                            <h4 class="fw-bold" style="color: var(--color-primary);">$${total.toFixed(2)}</h4>
                        </div>
                    </div>`;
                cartContentElement.innerHTML = cartHTML;
            }
        }
    };

    // --- FUNCIÓN PARA OBTENER LOS DATOS DEL CARRITO CON IMÁGENES ---
    const fetchCart = async () => {
        try {
            const response = await fetch('/api/cart');
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            const data = await response.json();
            
            // Si el carrito tiene items, buscamos los detalles de cada producto.
            if (data.cart && data.cart.length > 0) {
                const cartWithDetails = await Promise.all(data.cart.map(async item => {
                    try {
                        const productResponse = await fetch(`/api/product-details/${item.id}`);
                        if (!productResponse.ok) return item; // Si falla, devolvemos el item sin imagen
                        const productDetails = await productResponse.json();
                        return { ...item, imagen: productDetails.imagen };
                    } catch (e) {
                        return item; // En caso de error de red, devolvemos el item original
                    }
                }));
                updateCartUI(cartWithDetails);
            } else {
                updateCartUI([]); // Si el carrito está vacío, actualizamos la UI con un array vacío
            }
        } catch (error) { 
            console.error('Error al obtener el carrito:', error);
            updateCartUI([]); // En caso de un error mayor, mostramos el carrito vacío
        }
    };

    // --- LÓGICA DE CARGA Y EVENTOS ---
    if (cartCountElement) {
        fetchCart();
    }

    document.body.addEventListener('click', async (e) => {
        const addButton = e.target.closest('.add-to-cart-btn');
        if (addButton) {
            e.preventDefault();
            const id = addButton.dataset.id;
            try {
                const response = await fetch('/api/cart/add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
                if (response.status === 401) return window.location.href = '/login';
                if (!response.ok) throw new Error('Error al añadir al carrito');
                
                fetchCart();
                
                const cartIcon = document.querySelector('.header-actions .bi-bag, .header-actions .bi-cart-fill');
                if (cartIcon) {
                    cartIcon.classList.add('animate__animated', 'animate__tada');
                    setTimeout(() => cartIcon.classList.remove('animate__animated', 'animate__tada'), 1000);
                }
            } catch (error) { console.error('Error al añadir al carrito:', error); }
        }
    });

    if (cartContentElement) {
        cartContentElement.addEventListener('click', async (e) => {
            const removeButton = e.target.closest('.remove-from-cart-btn');
            if (removeButton) {
                const id = removeButton.dataset.id;
                try {
                    const response = await fetch(`/api/cart/remove/${id}`, { method: 'DELETE' });
                    if (!response.ok) throw new Error('Error al eliminar del carrito');
                    fetchCart();
                } catch (error) { console.error('Error al eliminar del carrito:', error); }
            }
        });
    }

    if (cartModalElement) {
        cartModalElement.addEventListener('show.bs.modal', fetchCart);
    }

    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const id = e.currentTarget.dataset.id;
            buyNowBtn.disabled = true;
            buyNowBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Redirigiendo...';
            try {
                const response = await fetch('/api/cart/add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
                if (response.status === 401) return window.location.href = '/login';
                if (!response.ok) throw new Error('No se pudo añadir el producto al carrito.');
                window.location.href = '/checkout';
            } catch (error) {
                console.error(error.message);
                alert('Hubo un problema al procesar la compra. Inténtalo de nuevo.');
                buyNowBtn.disabled = false;
                buyNowBtn.innerHTML = '<i class="bi bi-bag-check-fill me-2"></i> Comprar Ahora';
            }
        });
    }
});