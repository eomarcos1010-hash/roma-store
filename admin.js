"use strict";

const ADMIN_USER = "romazx";
const ADMIN_PASSWORD = "anna0601";

const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");

if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        loginError.textContent = "";

        if (username === ADMIN_USER && password === ADMIN_PASSWORD) {
            sessionStorage.setItem("axeus_admin_logged", "true");
            window.location.href = "dashboard.html";
        } else {
            loginError.textContent = "Usuário ou senha incorretos.";
            passwordInput.value = "";
            passwordInput.focus();
        }
    });
}

const showPassword = document.getElementById("showPassword");

if (showPassword && passwordInput) {
    showPassword.addEventListener("click", function () {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            showPassword.textContent = "○";
        } else {
            passwordInput.type = "password";
            showPassword.textContent = "◉";
        }
    });
}

function verificarLoginAdmin() {
    const logged = sessionStorage.getItem("axeus_admin_logged");

    if (logged !== "true") {
        window.location.href = "index.html";
        return false;
    }

    return true;
}

const isDashboard = document.querySelector(".admin-layout");

if (isDashboard && !verificarLoginAdmin()) {
    throw new Error("Administrador não autenticado.");
}

const PRODUCTS_KEY = "axeus_products";
const OLD_PRODUCTS_KEY = "axeus_store_products";

const defaultProducts = [
    {
        id: "tiktok",
        name: "Ganchos para TikTok Shop",
        category: "TikTok Shop",
        price: "R$ 19,90",
        description: "Ganchos e estratégias para criar vídeos mais atrativos para TikTok Shop.",
        image: "",
        link: "https://pay.cakto.com.br/3erj75x_1080094",
        sold: 1207,
        clicks: 0,
        status: "active"
    },
    {
        id: "spotify",
        name: "Método Spotify PC",
        category: "PC",
        price: "R$ 19,90",
        description: "Método para melhorar sua experiência com Spotify no PC.",
        image: "",
        link: "https://pay.cakto.com.br/szk82cw_1007831",
        sold: 842,
        clicks: 0,
        status: "active"
    },
    {
        id: "streaming",
        name: "Aplicativo de Streaming",
        category: "Entretenimento",
        price: "R$ 19,90",
        description: "Aplicativo de entretenimento com filmes e séries.",
        image: "",
        link: "https://pay.cakto.com.br/po9btzm_997956",
        sold: 913,
        clicks: 0,
        status: "active"
    },
    {
        id: "otimizacao",
        name: "Painel de Otimização",
        category: "PC",
        price: "R$ 19,90",
        description: "Ferramenta para otimização e gerenciamento do Windows.",
        image: "",
        link: "https://pay.cakto.com.br/r9phmxw_864564",
        sold: 536,
        clicks: 0,
        status: "active"
    },
    {
        id: "axeus",
        name: "AXEUS",
        category: "Aplicativos",
        price: "",
        description: "O novo aplicativo AXEUS está chegando.",
        image: "",
        link: "",
        sold: 0,
        clicks: 0,
        status: "coming"
    }
];

function normalizeProduct(product) {
    return {
        id: String(product.id || ("product_" + Date.now())),
        name: String(product.name || ""),
        description: String(product.description || ""),
        category: String(product.category || ""),
        image: String(product.image || ""),
        checkout: String(product.checkout || product.link || ""),
        link: String(product.link || product.checkout || ""),
        clicks: Number(product.clicks || 0),
        sold: Number(product.sold || 0),
        status: String(product.status || "active"),
        price: String(product.price || "")
    };
}

function readStorage(key) {
    const saved = localStorage.getItem(key);

    if (!saved) {
        return null;
    }

    try {
        const products = JSON.parse(saved);

        if (!Array.isArray(products)) {
            return null;
        }

        return products.map(normalizeProduct);
    } catch {
        return null;
    }
}

function getProducts() {
    let products = readStorage(PRODUCTS_KEY);

    if (products) {
        return products;
    }

    products = readStorage(OLD_PRODUCTS_KEY);

    if (products) {
        localStorage.setItem(
            PRODUCTS_KEY,
            JSON.stringify(products)
        );

        return products;
    }

    products = defaultProducts.map(normalizeProduct);

    localStorage.setItem(
        PRODUCTS_KEY,
        JSON.stringify(products)
    );

    return products;
}

function saveProducts(products) {
    const normalized = products.map(normalizeProduct);

    localStorage.setItem(
        PRODUCTS_KEY,
        JSON.stringify(normalized)
    );

    window.dispatchEvent(
        new CustomEvent("axeusProductsUpdated", {
            detail: normalized
        })
    );
}

function formatNumber(number) {
    return Number(number || 0).toLocaleString("pt-BR");
}

const navItems = document.querySelectorAll(".nav-item[data-section]");
const sectionButtons = document.querySelectorAll("[data-section]");
const sections = document.querySelectorAll(".admin-section");

function openSection(sectionName) {
    sections.forEach(section => {
        section.classList.remove("active");
    });

    const selected = document.getElementById(
        `section-${sectionName}`
    );

    if (selected) {
        selected.classList.add("active");
    }

    navItems.forEach(item => {
        item.classList.toggle(
            "active",
            item.dataset.section === sectionName
        );
    });

    const titles = {
        dashboard: "Dashboard",
        produtos: "Produtos",
        cliques: "Cliques",
        adicionar: "Novo produto"
    };

    const pageTitle = document.getElementById("pageTitle");

    if (pageTitle) {
        pageTitle.textContent =
            titles[sectionName] || "Dashboard";
    }

    if (sectionName === "dashboard") {
        renderDashboard();
    }

    if (sectionName === "produtos") {
        renderProductsTable();
    }

    if (sectionName === "cliques") {
        renderClicks();
    }

    if (sectionName === "adicionar") {
        prepareNewProduct();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

sectionButtons.forEach(button => {
    button.addEventListener("click", function () {
        const section = button.dataset.section;

        if (section) {
            openSection(section);
        }
    });
});

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", function () {
        sessionStorage.removeItem("axeus_admin_logged");
        window.location.href = "index.html";
    });
}

function renderDashboard() {
    const products = getProducts();

    const totalProducts =
        document.getElementById("totalProducts");

    const totalClicks =
        document.getElementById("totalClicks");

    const activeProducts =
        document.getElementById("activeProducts");

    const topProduct =
        document.getElementById("topProduct");

    const clicksTotal = products.reduce(
        (total, product) =>
            total + Number(product.clicks || 0),
        0
    );

    const active = products.filter(
        product => product.status === "active"
    ).length;

    const sorted = [...products].sort(
        (a, b) =>
            Number(b.clicks || 0) -
            Number(a.clicks || 0)
    );

    if (totalProducts) {
        totalProducts.textContent =
            formatNumber(products.length);
    }

    if (totalClicks) {
        totalClicks.textContent =
            formatNumber(clicksTotal);
    }

    if (activeProducts) {
        activeProducts.textContent =
            formatNumber(active);
    }

    if (topProduct) {
        topProduct.textContent =
            sorted.length &&
            Number(sorted[0].clicks || 0) > 0
                ? sorted[0].name
                : "—";
    }

    renderChart(products);
    renderRanking(products);
    renderDashboardProducts(products);
}

function renderChart(products) {
    const chart = document.getElementById("clickChart");

    if (!chart) return;

    chart.innerHTML = "";

    const sorted = [...products]
        .sort(
            (a, b) =>
                Number(b.clicks || 0) -
                Number(a.clicks || 0)
        )
        .slice(0, 6);

    if (!sorted.length) {
        chart.innerHTML =
            `<div class="empty-state">Nenhum produto cadastrado.</div>`;
        return;
    }

    const maxClicks = Math.max(
        ...sorted.map(
            product => Number(product.clicks || 0)
        ),
        1
    );

    sorted.forEach(product => {
        const clicks = Number(product.clicks || 0);
        const percentage = (clicks / maxClicks) * 100;

        const column = document.createElement("div");
        column.className = "chart-column";

        column.innerHTML = `
            <span class="chart-value">
                ${formatNumber(clicks)}
            </span>

            <div class="chart-bar-area">
                <div
                    class="chart-bar"
                    style="height:${Math.max(percentage, 3)}%"
                ></div>
            </div>

            <span class="chart-label">
                ${escapeHtml(product.name)}
            </span>
        `;

        chart.appendChild(column);
    });
}

function renderRanking(products) {
    const container =
        document.getElementById("topProductsList");

    if (!container) return;

    const sorted = [...products]
        .sort(
            (a, b) =>
                Number(b.clicks || 0) -
                Number(a.clicks || 0)
        )
        .slice(0, 5);

    if (!sorted.length) {
        container.innerHTML =
            `<div class="empty-state">Nenhum produto cadastrado.</div>`;
        return;
    }

    container.innerHTML = sorted.map(
        (product, index) => `
            <div class="ranking-item">
                <div class="ranking-number">
                    ${index + 1}
                </div>

                <div class="ranking-info">
                    <strong>
                        ${escapeHtml(product.name)}
                    </strong>

                    <span>
                        ${escapeHtml(product.category)}
                    </span>
                </div>

                <div class="ranking-clicks">
                    ${formatNumber(product.clicks)}
                </div>
            </div>
        `
    ).join("");
}

function renderDashboardProducts(products) {
    const container =
        document.getElementById("dashboardProducts");

    if (!container) return;

    const items = products.slice(0, 6);

    if (!items.length) {
        container.innerHTML =
            `<div class="empty-state">Nenhum produto cadastrado.</div>`;
        return;
    }

    container.innerHTML = items.map(
        product => `
            <div class="dashboard-product">

                <div class="product-mini-image">
                    ${
                        product.image
                            ? `<img src="${escapeAttribute(product.image)}" alt="">`
                            : "AX"
                    }
                </div>

                <div class="dashboard-product-info">

                    <strong>
                        ${escapeHtml(product.name)}
                    </strong>

                    <span>
                        ${formatNumber(product.clicks)}
                        cliques
                    </span>

                </div>

            </div>
        `
    ).join("");
}

function renderProductsTable(search = "") {
    const tbody =
        document.getElementById("productsTableBody");

    if (!tbody) return;

    let products = getProducts();

    const searchValue =
        search.trim().toLowerCase();

    if (searchValue) {
        products = products.filter(
            product =>
                product.name
                    .toLowerCase()
                    .includes(searchValue) ||
                product.category
                    .toLowerCase()
                    .includes(searchValue)
        );
    }

    const productCount =
        document.getElementById("productCount");

    if (productCount) {
        productCount.textContent =
            `${products.length} ${
                products.length === 1
                    ? "produto"
                    : "produtos"
            }`;
    }

    if (!products.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="table-empty">
                    Nenhum produto encontrado.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = products.map(
        product => `
            <tr>

                <td>
                    <div class="table-product">

                        <div class="table-product-image">
                            ${
                                product.image
                                    ? `<img src="${escapeAttribute(product.image)}" alt="">`
                                    : "AX"
                            }
                        </div>

                        <div>

                            <div class="table-product-name">
                                ${escapeHtml(product.name)}
                            </div>

                            <div class="table-product-category">
                                ${formatNumber(product.sold)}
                                vendidos
                            </div>

                        </div>

                    </div>
                </td>

                <td>
                    <span class="category-tag">
                        ${escapeHtml(product.category)}
                    </span>
                </td>

                <td>
                    ${escapeHtml(product.price || "—")}
                </td>

                <td>
                    <strong>
                        ${formatNumber(product.clicks)}
                    </strong>
                </td>

                <td>
                    ${getStatusHTML(product.status)}
                </td>

                <td>
                    <div class="action-buttons">

                        <button
                            class="action-button"
                            title="Editar"
                            onclick="editProduct('${escapeAttribute(product.id)}')"
                        >
                            ✎
                        </button>

                        <button
                            class="action-button delete"
                            title="Remover"
                            onclick="openDeleteModal('${escapeAttribute(product.id)}')"
                        >
                            ×
                        </button>

                    </div>
                </td>

            </tr>
        `
    ).join("");
}

function getStatusHTML(status) {
    if (status === "coming") {
        return `
            <span class="status coming">
                <i></i>
                Em breve
            </span>
        `;
    }

    if (status === "inactive") {
        return `
            <span class="status inactive">
                <i></i>
                Inativo
            </span>
        `;
    }

    return `
        <span class="status active">
            <i></i>
            Ativo
        </span>
    `;
}

const productSearch =
    document.getElementById("productSearch");

if (productSearch) {
    productSearch.addEventListener(
        "input",
        function () {
            renderProductsTable(
                productSearch.value
            );
        }
    );
}

const productForm =
    document.getElementById("productForm");

if (productForm) {
    productForm.addEventListener(
        "submit",
        function (event) {
            event.preventDefault();
            saveProductFromForm();
        }
    );
}

function saveProductFromForm() {
    const products = getProducts();

    const editingId =
        document.getElementById(
            "editingProductId"
        ).value;

    const name =
        document.getElementById(
            "productName"
        ).value.trim();

    const category =
        document.getElementById(
            "productCategory"
        ).value;

    const price =
        document.getElementById(
            "productPrice"
        ).value.trim();

    const description =
        document.getElementById(
            "productDescription"
        ).value.trim();

    const image =
        document.getElementById(
            "productImage"
        ).value.trim();

    const link =
        document.getElementById(
            "productLink"
        ).value.trim();

    const sold =
        Number(
            document.getElementById(
                "productSold"
            ).value
        ) || 0;

    const status =
        document.getElementById(
            "productStatus"
        ).value;

    if (!name || !category) {
        showToast("Preencha os campos obrigatórios.");
        return;
    }

    if (editingId) {
        const index = products.findIndex(
            item => item.id === editingId
        );

        if (index === -1) {
            showToast("Produto não encontrado.");
            return;
        }

        products[index] = {
            ...products[index],
            name,
            category,
            price,
            description,
            image,
            link,
            checkout: link,
            sold,
            status,
            clicks: Number(
                products[index].clicks || 0
            )
        };

        saveProducts(products);

        showToast(
            "Produto atualizado com sucesso!"
        );
    } else {
        products.push({
            id: "product_" + Date.now(),
            name,
            category,
            price,
            description,
            image,
            link,
            checkout: link,
            sold,
            clicks: 0,
            status
        });

        saveProducts(products);

        showToast(
            "Produto adicionado com sucesso!"
        );
    }

    resetProductForm();

    renderDashboard();
    renderProductsTable();
    renderClicks();

    setTimeout(
        () => openSection("produtos"),
        500
    );
}

function editProduct(id) {
    const products = getProducts();

    const product = products.find(
        item => item.id === id
    );

    if (!product) return;

    document.getElementById(
        "editingProductId"
    ).value = product.id;

    document.getElementById(
        "productName"
    ).value = product.name || "";

    document.getElementById(
        "productCategory"
    ).value = product.category || "";

    document.getElementById(
        "productPrice"
    ).value = product.price || "";

    document.getElementById(
        "productDescription"
    ).value =
        product.description || "";

    document.getElementById(
        "productImage"
    ).value =
        product.image || "";

    document.getElementById(
        "productLink"
    ).value =
        product.link || product.checkout || "";

    document.getElementById(
        "productSold"
    ).value =
        product.sold || 0;

    document.getElementById(
        "productStatus"
    ).value =
        product.status || "active";

    const formTitle =
        document.getElementById("formTitle");

    if (formTitle) {
        formTitle.textContent =
            "Editar produto";
    }

    openSection("adicionar");
}

function prepareNewProduct() {
    const editing =
        document.getElementById(
            "editingProductId"
        );

    if (!editing) return;

    if (!editing.value) {
        const formTitle =
            document.getElementById(
                "formTitle"
            );

        if (formTitle) {
            formTitle.textContent =
                "Novo produto";
        }
    }
}

function resetProductForm() {
    if (!productForm) return;

    productForm.reset();

    document.getElementById(
        "editingProductId"
    ).value = "";

    document.getElementById(
        "productSold"
    ).value = 0;

    document.getElementById(
        "productStatus"
    ).value = "active";

    const formTitle =
        document.getElementById(
            "formTitle"
        );

    if (formTitle) {
        formTitle.textContent =
            "Novo produto";
    }
}

const cancelProductButton =
    document.getElementById(
        "cancelProductButton"
    );

if (cancelProductButton) {
    cancelProductButton.addEventListener(
        "click",
        function () {
            resetProductForm();
            openSection("produtos");
        }
    );
}

let productToDelete = null;

function openDeleteModal(id) {
    productToDelete = id;

    const modal =
        document.getElementById("deleteModal");

    if (modal) {
        modal.classList.add("show");
    }
}

const cancelDeleteButton =
    document.getElementById(
        "cancelDeleteButton"
    );

if (cancelDeleteButton) {
    cancelDeleteButton.addEventListener(
        "click",
        closeDeleteModal
    );
}

function closeDeleteModal() {
    productToDelete = null;

    const modal =
        document.getElementById("deleteModal");

    if (modal) {
        modal.classList.remove("show");
    }
}

const confirmDeleteButton =
    document.getElementById(
        "confirmDeleteButton"
    );

if (confirmDeleteButton) {
    confirmDeleteButton.addEventListener(
        "click",
        function () {
            if (!productToDelete) return;

            let products = getProducts();

            products = products.filter(
                product =>
                    product.id !== productToDelete
            );

            saveProducts(products);

            closeDeleteModal();

            showToast(
                "Produto removido com sucesso!"
            );

            renderProductsTable();
            renderDashboard();
            renderClicks();
        }
    );
}

function renderClicks() {
    const products = getProducts();

    const total = products.reduce(
        (sum, product) =>
            sum + Number(product.clicks || 0),
        0
    );

    const average = products.length
        ? Math.round(total / products.length)
        : 0;

    const totalElement =
        document.getElementById(
            "clicksTotalPage"
        );

    const averageElement =
        document.getElementById(
            "clickAverage"
        );

    if (totalElement) {
        totalElement.textContent =
            formatNumber(total);
    }

    if (averageElement) {
        averageElement.textContent =
            formatNumber(average);
    }

    const container =
        document.getElementById("clicksList");

    if (!container) return;

    const sorted = [...products].sort(
        (a, b) =>
            Number(b.clicks || 0) -
            Number(a.clicks || 0)
    );

    if (!sorted.length) {
        container.innerHTML =
            `<div class="empty-state">Nenhum produto cadastrado.</div>`;
        return;
    }

    const max = Math.max(
        ...sorted.map(
            product => Number(product.clicks || 0)
        ),
        1
    );

    container.innerHTML = sorted.map(
        product => {
            const clicks =
                Number(product.clicks || 0);

            const percentage =
                (clicks / max) * 100;

            return `
                <div class="click-item">

                    <div class="click-item-info">

                        <strong>
                            ${escapeHtml(product.name)}
                        </strong>

                        <span>
                            ${escapeHtml(product.category)}
                        </span>

                    </div>

                    <div class="click-progress">
                        <span
                            style="width:${Math.max(
                                percentage,
                                2
                            )}%"
                        ></span>
                    </div>

                    <div class="click-value">
                        ${formatNumber(clicks)}
                    </div>

                </div>
            `;
        }
    ).join("");
}

let toastTimer;

function showToast(message) {
    const toast =
        document.getElementById(
            "adminToast"
        );

    const messageElement =
        document.getElementById(
            "toastMessage"
        );

    if (!toast || !messageElement) {
        return;
    }

    messageElement.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(
        function () {
            toast.classList.remove("show");
        },
        3000
    );
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
    return String(value ?? "")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

const mobileMenu =
    document.getElementById(
        "mobileMenu"
    );

const sidebar =
    document.querySelector(".sidebar");

if (mobileMenu && sidebar) {
    mobileMenu.addEventListener(
        "click",
        function () {
            sidebar.classList.toggle(
                "mobile-open"
            );
        }
    );
}

window.editProduct = editProduct;
window.openDeleteModal = openDeleteModal;
window.closeDeleteModal = closeDeleteModal;
window.getProducts = getProducts;
window.saveProducts = saveProducts;

window.addEventListener("storage", function (event) {
    if (event.key === PRODUCTS_KEY) {
        renderDashboard();
        renderProductsTable(
            productSearch
                ? productSearch.value
                : ""
        );
        renderClicks();
    }
});

if (isDashboard) {
    renderDashboard();
    renderProductsTable();
    renderClicks();
}