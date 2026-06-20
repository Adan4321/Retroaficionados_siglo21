/* ===================================================== */
/* APP.JS - VERSIÓN CORREGIDA Y ESTABLE                  */
/* PARTE 1/2                                             */
/* ===================================================== */

/* ===================================================== */
/* ESTADO GLOBAL                                          */
/* ===================================================== */

let productos = [];
let carrito = [];
let favoritos = [];
let productoActual = null;

const STORAGE_KEYS = {
    carrito: "retro_carrito",
    favoritos: "retro_favoritos"
};

/* ===================================================== */
/* DOM ELEMENTS                                           */
/* ===================================================== */

const productsGrid = document.getElementById("productsGrid");
const cartCount = document.getElementById("cartCount");
const favoritesCount = document.getElementById("favoritesCount");
const cartTotal = document.getElementById("cartTotal");

const notificationContainer = document.getElementById("notificationContainer");

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const sortFilter = document.getElementById("sortFilter");

/* ===================================================== */
/* INIT                                                   */
/* ===================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    cargarStorage();
    iniciarLoader();

    await cargarProductos();

    actualizarContadores();
    renderizarCarrito();
    renderizarFavoritos();

    inicializarEventos();
    inicializarFiltros();

    // FIX IMPORTANTE: asegurar estado cerrado real
    cerrarCarrito();
    cerrarFavoritos();
});

/* ===================================================== */
/* CARGA DE PRODUCTOS                                     */
/* ===================================================== */

async function cargarProductos() {

    try {

        const res = await fetch("data/productos.json");

        if (!res.ok) throw new Error("Error cargando productos.json");

        productos = await res.json();

        renderCatalogo(productos);
        actualizarResultados(productos.length);
        cargarCategorias();

    } catch (err) {
        console.error(err);
        notificar("Error cargando productos", "error");
    }
}

/* ===================================================== */
/* RENDER CATÁLOGO                                        */
/* ===================================================== */

function renderCatalogo(lista) {

    if (!productsGrid) return;

    productsGrid.innerHTML = "";

    lista.forEach(p => {

        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
            <img src="${p.imagen}" alt="${p.nombre}">
            <h3>${p.nombre}</h3>
            <p>${formatearPrecio(p.precio)}</p>

            <div class="product-actions">
                <button class="details-btn" data-id="${p.id}">Ver</button>
                <button class="add-cart-btn" data-id="${p.id}">🛒</button>
                <button class="favorite-btn" data-id="${p.id}">❤</button>
            </div>
        `;

        productsGrid.appendChild(card);
    });
}

/* ===================================================== */
/* CATEGORÍAS                                             */
/* ===================================================== */

function cargarCategorias() {

    if (!categoryFilter) return;

    const cats = [...new Set(productos.map(p => p.tipo))];

    cats.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        categoryFilter.appendChild(opt);
    });
}

/* ===================================================== */
/* FILTROS                                                */
/* ===================================================== */

function inicializarFiltros() {

    searchInput?.addEventListener("input", aplicarFiltros);
    categoryFilter?.addEventListener("change", aplicarFiltros);
    sortFilter?.addEventListener("change", aplicarFiltros);
}

function aplicarFiltros() {

    let lista = [...productos];

    const texto = searchInput?.value.toLowerCase() || "";
    const cat = categoryFilter?.value || "all";
    const orden = sortFilter?.value || "default";

    if (texto) {
        lista = lista.filter(p =>
            p.nombre.toLowerCase().includes(texto)
        );
    }

    if (cat !== "all") {
        lista = lista.filter(p => p.tipo === cat);
    }

    if (orden === "priceAsc") lista.sort((a,b) => a.precio - b.precio);
    if (orden === "priceDesc") lista.sort((a,b) => b.precio - a.precio);

    renderCatalogo(lista);
    actualizarResultados(lista.length);
}

/* ===================================================== */
/* STORAGE                                                */
/* ===================================================== */

function cargarStorage() {

    try {
        carrito = JSON.parse(localStorage.getItem(STORAGE_KEYS.carrito)) || [];
        favoritos = JSON.parse(localStorage.getItem(STORAGE_KEYS.favoritos)) || [];
    } catch {
        carrito = [];
        favoritos = [];
    }
}

function guardarCarrito() {
    localStorage.setItem(STORAGE_KEYS.carrito, JSON.stringify(carrito));
}

function guardarFavoritos() {
    localStorage.setItem(STORAGE_KEYS.favoritos, JSON.stringify(favoritos));
}

/* ===================================================== */
/* UTILIDADES                                             */
/* ===================================================== */

function formatearPrecio(precio) {

    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS"
    }).format(precio);
}

function obtenerProducto(id) {
    return productos.find(p => p.id === id);
}

function notificar(msg, tipo = "success") {

    if (!notificationContainer) return;

    const div = document.createElement("div");
    div.className = "notification";

    if (tipo === "error") {
        div.style.borderLeftColor = "#ff4444";
    }

    div.textContent = msg;

    notificationContainer.appendChild(div);

    setTimeout(() => div.remove(), 3000);
}

/* ===================================================== */
/* CONTADORES                                             */
/* ===================================================== */

function actualizarContadores() {

    cartCount &&
        (cartCount.textContent =
            carrito.reduce((a,i)=>a+i.cantidad,0));

    favoritesCount &&
        (favoritesCount.textContent = favoritos.length);
}

/* ===================================================== */
/* RESULTADOS                                             */
/* ===================================================== */

function actualizarResultados(n) {

    const el = document.getElementById("resultsCounter");
    if (el) el.textContent = `${n} productos encontrados`;
}

/* ===================================================== */
/* LOADER                                                 */
/* ===================================================== */

function iniciarLoader() {

    const loader = document.getElementById("loader");
    const bar = document.getElementById("progressBar");
    const percent = document.getElementById("loaderPercent");

    if (!loader || !bar || !percent) return;

    let p = 0;

    const int = setInterval(() => {

        p += 2;

        bar.style.width = p + "%";
        percent.textContent = p + "%";

        if (p >= 100) {
            clearInterval(int);
            setTimeout(() => loader.style.display = "none", 300);
        }

    }, 25);
}

/* ===================================================== */
/* SIDEBARS (SOLO BASE LIMPIA)                            */
/* ===================================================== */

function abrirCarrito() {
    document.getElementById("cartSidebar")?.classList.add("active");
}

function cerrarCarrito() {
    document.getElementById("cartSidebar")?.classList.remove("active");
}

function abrirFavoritos() {
    document.getElementById("favoritesSidebar")?.classList.add("active");
}

function cerrarFavoritos() {
    document.getElementById("favoritesSidebar")?.classList.remove("active");
}
/* ===================================================== */
/* CARRITO                                               */
/* ===================================================== */

function agregarAlCarrito(id) {

    const producto = obtenerProducto(id);
    if (!producto) return;

    const item = carrito.find(i => i.id === id);

    if (item) {
        item.cantidad++;
    } else {
        carrito.push({ id: producto.id, cantidad: 1 });
    }

    guardarCarrito();
    actualizarContadores();
    renderizarCarrito();

    notificar("Producto agregado");
}

/* ===================================================== */

function eliminarDelCarrito(id) {

    carrito = carrito.filter(i => i.id !== id);

    guardarCarrito();
    actualizarContadores();
    renderizarCarrito();
}

/* ===================================================== */
/* RENDER CARRITO                                        */
/* ===================================================== */

function renderizarCarrito() {

    const cont = document.getElementById("cartItems");
    if (!cont) return;

    cont.innerHTML = "";

    if (carrito.length === 0) {
        cont.innerHTML = "<p>El carrito está vacío</p>";
        if (cartTotal) cartTotal.textContent = formatearPrecio(0);
        return;
    }

    let total = 0;

    carrito.forEach(item => {

        const p = obtenerProducto(item.id);
        if (!p) return;

        total += p.precio * item.cantidad;

        const div = document.createElement("div");
        div.className = "sidebar-product";

        div.innerHTML = `
            <strong>${p.nombre}</strong>
            <p>Cant: ${item.cantidad}</p>
            <p>${formatearPrecio(p.precio)}</p>

            <button class="remove-cart" data-id="${p.id}">✖</button>
        `;

        cont.appendChild(div);
    });

    if (cartTotal) cartTotal.textContent = formatearPrecio(total);
}

/* ===================================================== */
/* FAVORITOS                                             */
/* ===================================================== */

function toggleFavorito(id) {

    const i = favoritos.indexOf(id);

    if (i === -1) {
        favoritos.push(id);
        notificar("Agregado a favoritos");
    } else {
        favoritos.splice(i, 1);
        notificar("Eliminado de favoritos");
    }

    guardarFavoritos();
    actualizarContadores();
    renderizarFavoritos();
}

/* ===================================================== */

function renderizarFavoritos() {

    const cont = document.getElementById("favoritesItems");
    if (!cont) return;

    cont.innerHTML = "";

    if (favoritos.length === 0) {
        cont.innerHTML = "<p>No hay favoritos</p>";
        return;
    }

    favoritos.forEach(id => {

        const p = obtenerProducto(id);
        if (!p) return;

        const div = document.createElement("div");
        div.className = "sidebar-product";

        div.innerHTML = `<strong>${p.nombre}</strong>`;

        cont.appendChild(div);
    });
}

/* ===================================================== */
/* MODAL PRODUCTO                                        */
/* ===================================================== */

function abrirModalProducto(id) {

    productoActual = obtenerProducto(id);
    if (!productoActual) return;

    document.getElementById("modalTitle").textContent = productoActual.nombre;
    document.getElementById("modalImage").src = productoActual.imagen;
    document.getElementById("modalPrice").textContent = formatearPrecio(productoActual.precio);
    document.getElementById("modalDescription").textContent = productoActual.descripcion;
    document.getElementById("modalCategory").textContent = productoActual.tipo;

    document.getElementById("productModal")?.classList.add("active");
     
}

/* ===================================================== */
/* ZOOM                                                  */
/* ===================================================== */

function abrirZoomImagen() {

    if (!productoActual) return;

    const img = document.getElementById("zoomedImage");
    if (img) img.src = productoActual.imagen;

    document.getElementById("imageZoomModal")?.classList.add("active");
}

/* ===================================================== */
/* CHECKOUT                                              */
/* ===================================================== */

function abrirCheckout() {

    if (carrito.length === 0) {
        notificar("El carrito está vacío", "error");
        return;
    }

    document.getElementById("checkoutModal")?.classList.add("active");
}

function cerrarCheckout() {
    document.getElementById("checkoutModal")?.classList.remove("active");
}

function confirmarPedido(e) {

    e.preventDefault();

    notificar("Pedido realizado correctamente");

    carrito = [];

    guardarCarrito();
    actualizarContadores();
    renderizarCarrito();

    cerrarCheckout();

    e.target.reset();
}

/* ===================================================== */
/* EVENTOS PRINCIPALES                                   */
/* ===================================================== */

function inicializarEventos() {

    renderizarCarrito();
    renderizarFavoritos();

    /* ================= EVENT DELEGATION ================= */
    document.addEventListener("click", (event) => {

    const btnCart = event.target.closest(".add-cart-btn");
    if (btnCart) {
        agregarAlCarrito(Number(btnCart.dataset.id));
        return;
    }

    const btnFav = event.target.closest(".favorite-btn");
    if (btnFav) {
        toggleFavorito(Number(btnFav.dataset.id));
        return;
    }

    const btnDetails = event.target.closest(".details-btn");
    if (btnDetails) {
        abrirModalProducto(Number(btnDetails.dataset.id));
        return;
    }

    const btnRemove = event.target.closest(".remove-cart");
    if (btnRemove) {
        eliminarDelCarrito(Number(btnRemove.dataset.id));
        return;
    }
});

document.getElementById("addToCartModal")?.addEventListener("click", () => {
    if (!productoActual) return;
    agregarAlCarrito(productoActual.id);
});

document.getElementById("addToFavoritesModal")?.addEventListener("click", () => {
    if (!productoActual) return;
    toggleFavorito(productoActual.id);
});


    /* ===================================================== */
    /* SIDEBARS BUTTONS                                      */
    /* ===================================================== */

    document.getElementById("cartButton")?.addEventListener("click", abrirCarrito);
    document.getElementById("closeCart")?.addEventListener("click", cerrarCarrito);

    document.getElementById("favoritesButton")?.addEventListener("click", abrirFavoritos);
    document.getElementById("closeFavorites")?.addEventListener("click", cerrarFavoritos);

    /* ===================================================== */
    /* MODALES                                               */
    /* ===================================================== */

    document.getElementById("closeProductModal")
        ?.addEventListener("click", () =>
            document.getElementById("productModal")?.classList.remove("active")
        );

    document.getElementById("zoomImageButton")
        ?.addEventListener("click", abrirZoomImagen);

    document.getElementById("closeZoomModal")
        ?.addEventListener("click", () =>
            document.getElementById("imageZoomModal")?.classList.remove("active")
        );

    /* ===================================================== */
    /* CHECKOUT                                              */
    /* ===================================================== */

    document.getElementById("checkoutButton")
        ?.addEventListener("click", abrirCheckout);

    document.getElementById("closeCheckoutModal")
        ?.addEventListener("click", cerrarCheckout);

    document.getElementById("checkoutForm")
        ?.addEventListener("submit", confirmarPedido);

    /* ===================================================== */
    /* ENTER STORE                                           */
    /* ===================================================== */

    document.getElementById("enterStoreButton")
        ?.addEventListener("click", () => {
            document.getElementById("catalogo")
                ?.scrollIntoView({ behavior: "smooth" });
        });
}