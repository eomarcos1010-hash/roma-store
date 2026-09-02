"use strict";

/* ============================================================
   AXEUS STORE — ADMIN.JS
   PAINEL ADMINISTRATIVO + SUPABASE
   ============================================================ */

/* ============================================================
   CONFIGURAÇÃO SUPABASE
   ============================================================ */

const SUPABASE_URL =
    "https://qgztuzjqxnwdqdsasche.supabase.co";

const SUPABASE_KEY =
    "COLE_AQUI_SUA_PUBLISHABLE_KEY";


/* ============================================================
   CONFIGURAÇÃO LOCAL
   ============================================================ */

const PRODUCTS_KEY = "axeus_products";
const OLD_PRODUCTS_KEY = "axeus_store_products";
const CATEGORIES_KEY = "axeus_categories";

const ADMIN_USER = "SEU_USUARIO";
const ADMIN_PASSWORD = "SUA_SENHA";


/* ============================================================
   PRODUTOS PADRÃO
   ============================================================ */

const defaultProducts = [
    {
        id: "1",
        name: "Ganchos para TikTok Shop",
        description:
            "Pacote completo de ganchos para aumentar a retenção e as vendas no TikTok Shop.",
        category: "TikTok Shop",
        image: "",
        price: 19.90,
        link: "https://pay.cakto.com.br/3erj75x_1080094",
        sold: 1207,
        clicks: 0,
        status: "active"
    },
    {
        id: "2",
        name: "Método Spotify PC",
        description:
            "Método completo para utilizar o Spotify no PC de forma prática.",
        category: "PC",
        image: "",
        price: 19.90,
        link: "https://pay.cakto.com.br/szk82cw_1007831",
        sold: 842,
        clicks: 0,
        status: "active"
    },
    {
        id: "3",
        name: "Aplicativo de Streaming",
        description:
            "Aplicativo de streaming para entretenimento.",
        category: "Entretenimento",
        image: "",
        price: 19.90,
        link: "https://pay.cakto.com.br/po9btzm_997956",
        sold: 913,
        clicks: 0,
        status: "active"
    },
    {
        id: "4",
        name: "Painel de Otimização",
        description:
            "Painel com ferramentas para otimização do computador.",
        category: "PC",
        image: "",
        price: 19.90,
        link: "https://pay.cakto.com.br/r9phmxw_864564",
        sold: 536,
        clicks: 0,
        status: "active"
    },
    {
        id: "5",
        name: "AXEUS",
        description:
            "Aplicativo AXEUS.",
        category: "Aplicativos",
        image: "",
        price: 0,
        link: "",
        sold: 0,
        clicks: 0,
        status: "coming"
    }
];


/* ============================================================
   LOGIN
   ============================================================ */

function iniciarLogin() {
    const loginForm = document.getElementById("loginForm");

    if (!loginForm) {
        return;
    }

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const usernameInput =
            document.getElementById("username");

        const passwordInput =
            document.getElementById("password");

        const loginError =
            document.getElementById("loginError");

        const username =
            usernameInput ? usernameInput.value.trim() : "";

        const password =
            passwordInput ? passwordInput.value : "";

        if (
            username === ADMIN_USER &&
            password === ADMIN_PASSWORD
        ) {
            sessionStorage.setItem(
                "axeus_admin_logged",
                "true"
            );

            window.location.href = "dashboard.html";
            return;
        }

        if (loginError) {
            loginError.textContent =
                "Usuário ou senha incorretos.";
        }
    });
}


/* ============================================================
   MOSTRAR / OCULTAR SENHA
   ============================================================ */

function iniciarMostrarSenha() {
    const showPassword =
        document.getElementById("showPassword");

    const password =
        document.getElementById("password");

    if (!showPassword || !password) {
        return;
    }

    showPassword.addEventListener("change", function () {
        password.type =
            this.checked ? "text" : "password";
    });
}


/* ============================================================
   PROTEÇÃO DO DASHBOARD
   ============================================================ */

function verificarLoginAdmin() {
    const logged =
        sessionStorage.getItem("axeus_admin_logged");

    if (logged !== "true") {
        window.location.href = "adm.html";
        return false;
    }

    return true;
}

const isDashboard =
    document.querySelector(".admin-layout");

if (
    isDashboard &&
    !verificarLoginAdmin()
) {
    throw new Error(
        "Administrador não autenticado."
    );
}


/* ============================================================
   LOGOUT
   ============================================================ */

function iniciarLogout() {
    const logoutButton =
        document.getElementById("logoutButton");

    if (!logoutButton) {
        return;
    }

    logoutButton.addEventListener("click", function () {
        sessionStorage.removeItem(
            "axeus_admin_logged"
        );

        window.location.href = "adm.html";
    });
}


/* ============================================================
   NORMALIZAÇÃO DE PRODUTO
   ============================================================ */

function normalizeProduct(product, index = 0) {
    if (!product) {
        return null;
    }

    return {
        id:
            String(
                product.id ??
                Date.now() + index
            ),

        name:
            String(
                product.name ?? ""
            ),

        description:
            String(
                product.description ?? ""
            ),

        category:
            String(
                product.category ?? "Outros"
            ),

        image:
            String(
                product.image ?? ""
            ),

        price:
            Number(
                product.price ?? 0
            ),

        link:
            String(
                product.link ??
                product.checkout ??
                ""
            ),

        sold:
            Number(
                product.sold ?? 0
            ),

        clicks:
            Number(
                product.clicks ?? 0
            ),

        status:
            product.status ??
            "active"
    };
}


/* ============================================================
   STORAGE LOCAL
   ============================================================ */

function getLocalProducts() {
    try {
        const current =
            localStorage.getItem(
                PRODUCTS_KEY
            );

        if (current) {
            const parsed =
                JSON.parse(current);

            if (Array.isArray(parsed)) {
                return parsed.map(
                    normalizeProduct
                );
            }
        }

        const old =
            localStorage.getItem(
                OLD_PRODUCTS_KEY
            );

        if (old) {
            const parsed =
                JSON.parse(old);

            if (Array.isArray(parsed)) {
                const products =
                    parsed.map(
                        normalizeProduct
                    );

                localStorage.setItem(
                    PRODUCTS_KEY,
                    JSON.stringify(products)
                );

                return products;
            }
        }
    } catch (error) {
        console.error(
            "Erro ao ler produtos locais:",
            error
        );
    }

    return defaultProducts.map(
        normalizeProduct
    );
}


function saveLocalProducts(products) {
    try {
        localStorage.setItem(
            PRODUCTS_KEY,
            JSON.stringify(products)
        );

        localStorage.setItem(
            OLD_PRODUCTS_KEY,
            JSON.stringify(products)
        );

        localStorage.setItem(
            "axeusProductsUpdated",
            String(Date.now())
        );
    } catch (error) {
        console.error(
            "Erro ao salvar produtos:",
            error
        );
    }
}


/* ============================================================
   SUPABASE REQUEST
   ============================================================ */

async function supabaseRequest(
    endpoint,
    options = {}
) {
    const url =
        `${SUPABASE_URL}/rest/v1/${endpoint}`;

    const headers = {
        "apikey": SUPABASE_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
        ...(options.headers || {})
    };

    const response =
        await fetch(url, {
            ...options,
            headers
        });

    if (!response.ok) {
        const text =
            await response.text();

        throw new Error(
            `Supabase ${response.status}: ${text}`
        );
    }

    const contentType =
        response.headers.get(
            "content-type"
        );

    if (
        contentType &&
        contentType.includes(
            "application/json"
        )
    ) {
        return await response.json();
    }

    return null;
}


/* ============================================================
   CARREGAR PRODUTOS DO SUPABASE
   ============================================================ */

async function loadProductsFromSupabase() {
    try {
        const data =
            await supabaseRequest(
                "products?select=*&order=created_at.asc",
                {
                    method: "GET"
                }
            );

        if (
            Array.isArray(data) &&
            data.length > 0
        ) {
            const products =
                data.map(
                    normalizeProduct
                );

            saveLocalProducts(products);

            return products;
        }

        return getLocalProducts();

    } catch (error) {
        console.error(
            "Erro ao carregar produtos do Supabase:",
            error
        );

        return getLocalProducts();
    }
}


/* ============================================================
   SALVAR PRODUTO NO SUPABASE
   ============================================================ */

async function saveProductToSupabase(product) {
    const normalized =
        normalizeProduct(product);

    const payload = {
        id: normalized.id,
        name: normalized.name,
        description: normalized.description,
        category: normalized.category,
        image: normalized.image,
        price: normalized.price,
        link: normalized.link,
        sold: normalized.sold,
        clicks: normalized.clicks,
        status: normalized.status
    };

    return await supabaseRequest(
        "products?on_conflict=id",
        {
            method: "POST",
            headers: {
                "Prefer":
                    "resolution=merge-duplicates,return=representation"
            },
            body: JSON.stringify(payload)
        }
    );
}


/* ============================================================
   EXCLUIR PRODUTO DO SUPABASE
   ============================================================ */

async function deleteProductFromSupabase(id) {
    return await supabaseRequest(
        `products?id=eq.${encodeURIComponent(id)}`,
        {
            method: "DELETE"
        }
    );
}


/* ============================================================
   CARREGAR PRODUTOS
   ============================================================ */

let products = [];

async function loadProducts() {
    products =
        await loadProductsFromSupabase();

    renderEverything();
}


/* ============================================================
   FORMATAÇÃO
   ============================================================ */

function formatPrice(value) {
    const number =
        Number(value || 0);

    return number.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}


function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ============================================================
   TOAST
   ============================================================ */

function showToast(message) {
    const toast =
        document.getElementById(
            "adminToast"
        );

    const toastMessage =
        document.getElementById(
            "toastMessage"
        );

    if (!toast) {
        return;
    }

    if (toastMessage) {
        toastMessage.textContent =
            message;
    }

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}


/* ============================================================
   CATEGORIAS
   ============================================================ */

let categories = [];


/* ============================================================
   CATEGORIAS PADRÃO
   ============================================================ */

const defaultCategories = [
    "TikTok Shop",
    "PC",
    "Entretenimento",
    "Aplicativos"
];


/* ============================================================
   NORMALIZAÇÃO DE CATEGORIA
   ============================================================ */

function normalizeCategory(
    category,
    index = 0
) {
    if (!category) {
        return null;
    }

    return {
        id:
            String(
                category.id ??
                `category-${Date.now()}-${index}`
            ),

        name:
            String(
                category.name ?? ""
            ).trim(),

        created_at:
            category.created_at ??
            null
    };
}


/* ============================================================
   STORAGE LOCAL — CATEGORIAS
   ============================================================ */

function getLocalCategories() {
    try {
        const saved =
            localStorage.getItem(
                CATEGORIES_KEY
            );

        if (saved) {
            const parsed =
                JSON.parse(saved);

            if (Array.isArray(parsed)) {
                return parsed
                    .map(normalizeCategory)
                    .filter(
                        category =>
                            category &&
                            category.name
                    );
            }
        }
    } catch (error) {
        console.error(
            "Erro ao carregar categorias locais:",
            error
        );
    }

    return defaultCategories.map(
        (name, index) =>
            normalizeCategory({
                id: `default-${index + 1}`,
                name
            })
    );
}


function saveLocalCategories(
    categoriesList
) {
    try {
        localStorage.setItem(
            CATEGORIES_KEY,
            JSON.stringify(categoriesList)
        );
    } catch (error) {
        console.error(
            "Erro ao salvar categorias locais:",
            error
        );
    }
}


/* ============================================================
   CARREGAR CATEGORIAS DO SUPABASE
   ============================================================ */

async function loadCategoriesFromSupabase() {
    try {
        const data =
            await supabaseRequest(
                "categories?select=*&order=name.asc",
                {
                    method: "GET"
                }
            );

        if (Array.isArray(data)) {
            const loaded =
                data
                    .map(normalizeCategory)
                    .filter(
                        category =>
                            category &&
                            category.name
                    );

            if (loaded.length > 0) {
                saveLocalCategories(
                    loaded
                );

                return loaded;
            }
        }

        return getLocalCategories();

    } catch (error) {
        console.error(
            "Erro ao carregar categorias do Supabase:",
            error
        );

        return getLocalCategories();
    }
}


/* ============================================================
   SALVAR CATEGORIA NO SUPABASE
   ============================================================ */

async function saveCategoryToSupabase(
    category
) {
    const normalized =
        normalizeCategory(category);

    const payload = {
        id: normalized.id,
        name: normalized.name
    };

    return await supabaseRequest(
        "categories",
        {
            method: "POST",
            headers: {
                "Prefer":
                    "return=representation"
            },
            body:
                JSON.stringify(payload)
        }
    );
}


/* ============================================================
   EXCLUIR CATEGORIA DO SUPABASE
   ============================================================ */

async function deleteCategoryFromSupabase(
    id
) {
    return await supabaseRequest(
        `categories?id=eq.${encodeURIComponent(id)}`,
        {
            method: "DELETE"
        }
    );
}


/* ============================================================
   CARREGAR CATEGORIAS
   ============================================================ */

async function loadCategories() {
    categories =
        await loadCategoriesFromSupabase();

    renderCategories();

    updateProductCategorySelect();
}


/* ============================================================
   RENDERIZAR CATEGORIAS
   ============================================================ */

function renderCategories() {
    const container =
        document.getElementById(
            "categoriesList"
        );

    const count =
        document.getElementById(
            "categoryCount"
        );

    if (count) {
        count.textContent =
            categories.length;
    }

    if (!container) {
        return;
    }

    if (!categories.length) {
        container.innerHTML = `
            <div class="category-empty">
                Nenhuma categoria cadastrada.
            </div>
        `;

        return;
    }

    container.innerHTML =
        categories.map(
            category => `
                <div
                    class="category-item"
                    data-category-id="${escapeHTML(category.id)}"
                >
                    <div class="category-item-info">
                        <strong>
                            ${escapeHTML(category.name)}
                        </strong>

                        <span>
                            Categoria da loja
                        </span>
                    </div>

                    <div class="category-item-actions">
                        <button
                            type="button"
                            class="delete-category"
                            data-id="${escapeHTML(category.id)}"
                        >
                            Excluir
                        </button>
                    </div>
                </div>
            `
        ).join("");

    bindCategoryActions();
}


/* ============================================================
   ATUALIZAR SELECT DE CATEGORIA
   ============================================================ */

function updateProductCategorySelect() {
    const select =
        document.getElementById(
            "productCategory"
        );

    if (!select) {
        return;
    }

    const currentValue =
        select.value;

    select.innerHTML = "";

    if (!categories.length) {
        const option =
            document.createElement(
                "option"
            );

        option.value = "";
        option.textContent =
            "Nenhuma categoria";

        select.appendChild(
            option
        );

        return;
    }

    categories.forEach(
        category => {
            const option =
                document.createElement(
                    "option"
                );

            option.value =
                category.name;

            option.textContent =
                category.name;

            select.appendChild(
                option
            );
        }
    );

    if (
        currentValue &&
        categories.some(
            category =>
                category.name ===
                currentValue
        )
    ) {
        select.value =
            currentValue;
    }
}


/* ============================================================
   AÇÕES DAS CATEGORIAS
   ============================================================ */

function bindCategoryActions() {
    document
        .querySelectorAll(
            ".delete-category"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                async function () {
                    const id =
                        this.dataset.id;

                    const category =
                        categories.find(
                            item =>
                                String(item.id) ===
                                String(id)
                        );

                    if (!category) {
                        return;
                    }

                    const usedByProducts =
                        products.some(
                            product =>
                                String(
                                    product.category
                                ).toLowerCase() ===
                                String(
                                    category.name
                                ).toLowerCase()
                        );

                    if (usedByProducts) {
                        showToast(
                            "Não é possível excluir uma categoria usada por produtos."
                        );

                        return;
                    }

                    const confirmed =
                        window.confirm(
                            `Excluir a categoria "${category.name}"?`
                        );

                    if (!confirmed) {
                        return;
                    }

                    try {
                        if (
                            !String(
                                category.id
                            ).startsWith(
                                "default-"
                            )
                        ) {
                            await deleteCategoryFromSupabase(
                                category.id
                            );
                        }

                        categories =
                            categories.filter(
                                item =>
                                    String(
                                        item.id
                                    ) !==
                                    String(id)
                            );

                        saveLocalCategories(
                            categories
                        );

                        renderCategories();

                        updateProductCategorySelect();

                        showToast(
                            "Categoria excluída com sucesso!"
                        );

                    } catch (error) {
                        console.error(
                            "Erro ao excluir categoria:",
                            error
                        );

                        showToast(
                            "Erro ao excluir categoria."
                        );
                    }
                }
            );
        });
}


/* ============================================================
   FORMULÁRIO DE CATEGORIA
   ============================================================ */

function iniciarCategoryForm() {
    const form =
        document.getElementById(
            "categoryForm"
        );

    if (!form) {
        return;
    }

    form.addEventListener(
        "submit",
        async function (event) {
            event.preventDefault();

            const input =
                document.getElementById(
                    "categoryName"
                );

            const name =
                input
                    ? input.value.trim()
                    : "";

            if (!name) {
                showToast(
                    "Digite o nome da categoria."
                );

                return;
            }

            const alreadyExists =
                categories.some(
                    category =>
                        category.name
                            .toLowerCase() ===
                        name.toLowerCase()
                );

            if (alreadyExists) {
                showToast(
                    "Essa categoria já existe."
                );

                return;
            }

            const category =
                normalizeCategory({
                    id:
                        crypto.randomUUID(),
                    name
                });

            try {
                await saveCategoryToSupabase(
                    category
                );

                categories.push(
                    category
                );

                categories =
                    categories.sort(
                        (a, b) =>
                            a.name.localeCompare(
                                b.name,
                                "pt-BR"
                            )
                    );

                saveLocalCategories(
                    categories
                );

                renderCategories();

                updateProductCategorySelect();

                form.reset();

                showToast(
                    "Categoria adicionada com sucesso!"
                );

            } catch (error) {
                console.error(
                    "Erro ao salvar categoria:",
                    error
                );

                showToast(
                    "Erro ao salvar categoria no Supabase."
                );
            }
        }
    );
}


/* ============================================================
   DASHBOARD — ESTATÍSTICAS
   ============================================================ */

function renderDashboardStats() {
    const totalProducts =
        document.getElementById(
            "totalProducts"
        );

    const totalClicks =
        document.getElementById(
            "totalClicks"
        );

    const activeProducts =
        document.getElementById(
            "activeProducts"
        );

    const topProduct =
        document.getElementById(
            "topProduct"
        );

    const total =
        products.length;

    const clicks =
        products.reduce(
            (sum, product) =>
                sum +
                Number(product.clicks || 0),
            0
        );

    const active =
        products.filter(
            product =>
                product.status === "active"
        ).length;

    const top =
        [...products]
            .sort(
                (a, b) =>
                    Number(b.clicks || 0) -
                    Number(a.clicks || 0)
            )[0];

    if (totalProducts) {
        totalProducts.textContent =
            total;
    }

    if (totalClicks) {
        totalClicks.textContent =
            clicks;
    }

    if (activeProducts) {
        activeProducts.textContent =
            active;
    }

    if (topProduct) {
        topProduct.textContent =
            top
                ? top.name
                : "Nenhum";
    }
}


/* ============================================================
   RANKING DE PRODUTOS
   ============================================================ */

function renderTopProducts() {
    const container =
        document.getElementById(
            "topProductsList"
        );

    if (!container) {
        return;
    }

    const ranking =
        [...products]
            .sort(
                (a, b) =>
                    Number(b.clicks || 0) -
                    Number(a.clicks || 0)
            )
            .slice(0, 5);

    if (!ranking.length) {
        container.innerHTML =
            "<p>Nenhum produto encontrado.</p>";

        return;
    }

    container.innerHTML =
        ranking.map(
            (product, index) => `
                <div class="top-product-item">
                    <div class="top-product-position">
                        ${index + 1}
                    </div>

                    <div class="top-product-info">
                        <strong>
                            ${escapeHTML(product.name)}
                        </strong>

                        <span>
                            ${Number(product.clicks || 0)} cliques
                        </span>
                    </div>
                </div>
            `
        ).join("");
}


/* ============================================================
   PRODUTOS DO DASHBOARD
   ============================================================ */

function renderDashboardProducts() {
    const container =
        document.getElementById(
            "dashboardProducts"
        );

    if (!container) {
        return;
    }

    container.innerHTML =
        products.map(
            product => `
                <div class="dashboard-product">
                    <div>
                        <strong>
                            ${escapeHTML(product.name)}
                        </strong>

                        <span>
                            ${escapeHTML(product.category)}
                        </span>
                    </div>

                    <div>
                        <strong>
                            ${formatPrice(product.price)}
                        </strong>
                    </div>
                </div>
            `
        ).join("");
}


/* ============================================================
   TABELA DE PRODUTOS
   ============================================================ */

function renderProductsTable(
    searchTerm = ""
) {
    const tbody =
        document.getElementById(
            "productsTableBody"
        );

    if (!tbody) {
        return;
    }

    const term =
        searchTerm
            .trim()
            .toLowerCase();

    const filtered =
        products.filter(product => {
            if (!term) {
                return true;
            }

            return (
                product.name
                    .toLowerCase()
                    .includes(term) ||

                product.category
                    .toLowerCase()
                    .includes(term) ||

                product.description
                    .toLowerCase()
                    .includes(term)
            );
        });

    if (!filtered.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8">
                    Nenhum produto encontrado.
                </td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML =
        filtered.map(
            product => `
                <tr>
                    <td>
                        ${
                            product.image
                                ? `
                                    <img
                                        src="${escapeHTML(product.image)}"
                                        alt=""
                                        class="product-table-image"
                                    >
                                  `
                                : `
                                    <div class="product-table-placeholder">
                                        AX
                                    </div>
                                  `
                        }
                    </td>

                    <td>
                        <strong>
                            ${escapeHTML(product.name)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(product.category)}
                    </td>

                    <td>
                        ${formatPrice(product.price)}
                    </td>

                    <td>
                        ${Number(product.sold || 0)}
                    </td>

                    <td>
                        ${Number(product.clicks || 0)}
                    </td>

                    <td>
                        <span class="status status-${escapeHTML(product.status)}">
                            ${getStatusLabel(product.status)}
                        </span>
                    </td>

                    <td>
                        <div class="table-actions">
                            <button
                                type="button"
                                class="edit-product"
                                data-id="${escapeHTML(product.id)}"
                            >
                                Editar
                            </button>

                            <button
                                type="button"
                                class="delete-product"
                                data-id="${escapeHTML(product.id)}"
                            >
                                Excluir
                            </button>
                        </div>
                    </td>
                </tr>
            `
        ).join("");

    bindTableActions();
}


/* ============================================================
   STATUS
   ============================================================ */

function getStatusLabel(status) {
    switch (status) {
        case "active":
            return "Ativo";

        case "inactive":
            return "Inativo";

        case "coming":
            return "Em breve";

        default:
            return "Ativo";
    }
}


/* ============================================================
   AÇÕES DA TABELA
   ============================================================ */

function bindTableActions() {
    document
        .querySelectorAll(".edit-product")
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    editProduct(
                        button.dataset.id
                    );
                }
            );
        });

    document
        .querySelectorAll(".delete-product")
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    openDeleteModal(
                        button.dataset.id
                    );
                }
            );
        });
}


/* ============================================================
   EDITAR PRODUTO
   ============================================================ */

function editProduct(id) {
    const product =
        products.find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (!product) {
        return;
    }

    const editingProductId =
        document.getElementById(
            "editingProductId"
        );

    const productName =
        document.getElementById(
            "productName"
        );

    const productCategory =
        document.getElementById(
            "productCategory"
        );

    const productPrice =
        document.getElementById(
            "productPrice"
        );

    const productDescription =
        document.getElementById(
            "productDescription"
        );

    const productImage =
        document.getElementById(
            "productImage"
        );

    const productLink =
        document.getElementById(
            "productLink"
        );

    const productSold =
        document.getElementById(
            "productSold"
        );

    const productStatus =
        document.getElementById(
            "productStatus"
        );

    if (editingProductId)
        editingProductId.value =
            product.id;

    if (productName)
        productName.value =
            product.name;

    if (productCategory)
        productCategory.value =
            product.category;

    if (productPrice)
        productPrice.value =
            product.price;

    if (productDescription)
        productDescription.value =
            product.description;

    if (productImage)
        productImage.value =
            product.image;

    if (productLink)
        productLink.value =
            product.link;

    if (productSold)
        productSold.value =
            product.sold;

    if (productStatus)
        productStatus.value =
            product.status;

    const section =
        document.getElementById(
            "section-adicionar"
        );

    if (section) {
        section.scrollIntoView({
            behavior: "smooth"
        });
    }
}


/* ============================================================
   NOVO PRODUTO
   ============================================================ */

function resetProductForm() {
    const form =
        document.getElementById(
            "productForm"
        );

    if (form) {
        form.reset();
    }

    const editingProductId =
        document.getElementById(
            "editingProductId"
        );

    if (editingProductId) {
        editingProductId.value = "";
    }

    const productSold =
        document.getElementById(
            "productSold"
        );

    if (productSold) {
        productSold.value = "0";
    }

    const productStatus =
        document.getElementById(
            "productStatus"
        );

    if (productStatus) {
        productStatus.value =
            "active";
    }
}


/* ============================================================
   SALVAR FORMULÁRIO
   ============================================================ */

function iniciarProductForm() {
    const form =
        document.getElementById(
            "productForm"
        );

    if (!form) {
        return;
    }

    form.addEventListener(
        "submit",
        async function (event) {
            event.preventDefault();

            const editingProductId =
                document.getElementById(
                    "editingProductId"
                );

            const productName =
                document.getElementById(
                    "productName"
                );

            const productCategory =
                document.getElementById(
                    "productCategory"
                );

            const productPrice =
                document.getElementById(
                    "productPrice"
                );

            const productDescription =
                document.getElementById(
                    "productDescription"
                );

            const productImage =
                document.getElementById(
                    "productImage"
                );

            const productLink =
                document.getElementById(
                    "productLink"
                );

            const productSold =
                document.getElementById(
                    "productSold"
                );

            const productStatus =
                document.getElementById(
                    "productStatus"
                );

            const editingId =
                editingProductId
                    ? editingProductId.value
                    : "";

            const existing =
                products.find(
                    item =>
                        String(item.id) ===
                        String(editingId)
                );

            const product = normalizeProduct({
                id:
                    existing
                        ? existing.id
                        : crypto.randomUUID(),

                name:
                    productName
                        ? productName.value.trim()
                        : "",

                category:
                    productCategory
                        ? productCategory.value.trim()
                        : "Outros",

                price:
                    productPrice
                        ? Number(productPrice.value || 0)
                        : 0,

                description:
                    productDescription
                        ? productDescription.value.trim()
                        : "",

                image:
                    productImage
                        ? productImage.value.trim()
                        : "",

                link:
                    productLink
                        ? productLink.value.trim()
                        : "",

                sold:
                    productSold
                        ? Number(productSold.value || 0)
                        : 0,

                clicks:
                    existing
                        ? existing.clicks
                        : 0,

                status:
                    productStatus
                        ? productStatus.value
                        : "active"
            });

            if (!product.name) {
                showToast(
                    "Digite o nome do produto."
                );

                return;
            }

            try {
                await saveProductToSupabase(
                    product
                );

                if (existing) {
                    const index =
                        products.findIndex(
                            item =>
                                String(item.id) ===
                                String(product.id)
                        );

                    if (index !== -1) {
                        products[index] =
                            product;
                    }
                } else {
                    products.push(product);
                }

                saveLocalProducts(
                    products
                );

                renderEverything();

                resetProductForm();

                showToast(
                    existing
                        ? "Produto atualizado com sucesso!"
                        : "Produto adicionado com sucesso!"
                );

            } catch (error) {
                console.error(error);

                showToast(
                    "Erro ao salvar produto no Supabase."
                );
            }
        }
    );
}


/* ============================================================
   DELETE MODAL
   ============================================================ */

let productToDelete = null;


function openDeleteModal(id) {
    productToDelete = id;

    const modal =
        document.getElementById(
            "deleteModal"
        );

    if (modal) {
        modal.classList.add("show");
    }
}


function closeDeleteModal() {
    productToDelete = null;

    const modal =
        document.getElementById(
            "deleteModal"
        );

    if (modal) {
        modal.classList.remove("show");
    }
}


function iniciarDeleteModal() {
    const cancelButton =
        document.getElementById(
            "cancelDeleteButton"
        );

    const confirmButton =
        document.getElementById(
            "confirmDeleteButton"
        );

    if (cancelButton) {
        cancelButton.addEventListener(
            "click",
            closeDeleteModal
        );
    }

    if (confirmButton) {
        confirmButton.addEventListener(
            "click",
            async function () {
                if (!productToDelete) {
                    return;
                }

                try {
                    await deleteProductFromSupabase(
                        productToDelete
                    );

                    products =
                        products.filter(
                            product =>
                                String(product.id) !==
                                String(productToDelete)
                        );

                    saveLocalProducts(
                        products
                    );

                    closeDeleteModal();

                    renderEverything();

                    showToast(
                        "Produto excluído com sucesso!"
                    );

                } catch (error) {
                    console.error(error);

                    showToast(
                        "Erro ao excluir produto."
                    );
                }
            }
        );
    }
}


/* ============================================================
   BUSCA
   ============================================================ */

function iniciarBusca() {
    const search =
        document.getElementById(
            "productSearch"
        );

    if (!search) {
        return;
    }

    search.addEventListener(
        "input",
        function () {
            renderProductsTable(
                this.value
            );
        }
    );
}


/* ============================================================
   CLIQUES
   ============================================================ */

function renderClicks() {
    const totalElement =
        document.getElementById(
            "clicksTotalPage"
        );

    const averageElement =
        document.getElementById(
            "clickAverage"
        );

    const list =
        document.getElementById(
            "clicksList"
        );

    const total =
        products.reduce(
            (sum, product) =>
                sum +
                Number(product.clicks || 0),
            0
        );

    if (totalElement) {
        totalElement.textContent =
            total;
    }

    const average =
        products.length
            ? Math.round(
                  total /
                  products.length
              )
            : 0;

    if (averageElement) {
        averageElement.textContent =
            average;
    }

    if (!list) {
        return;
    }

    const ranking =
        [...products]
            .sort(
                (a, b) =>
                    Number(b.clicks || 0) -
                    Number(a.clicks || 0)
            );

    if (!ranking.length) {
        list.innerHTML =
            "<p>Nenhum clique registrado.</p>";

        return;
    }

    list.innerHTML =
        ranking.map(
            product => `
                <div class="click-item">
                    <div>
                        <strong>
                            ${escapeHTML(product.name)}
                        </strong>

                        <span>
                            ${escapeHTML(product.category)}
                        </span>
                    </div>

                    <strong>
                        ${Number(product.clicks || 0)}
                    </strong>
                </div>
            `
        ).join("");
}


/* ============================================================
   GRÁFICO
   ============================================================ */

function renderClickChart() {
    const canvas =
        document.getElementById(
            "clickChart"
        );

    if (!canvas) {
        return;
    }

    const ctx =
        canvas.getContext("2d");

    const width =
        canvas.width =
            canvas.clientWidth * 2;

    const height =
        canvas.height =
            canvas.clientHeight * 2;

    ctx.scale(2, 2);

    const drawWidth =
        canvas.clientWidth;

    const drawHeight =
        canvas.clientHeight;

    ctx.clearRect(
        0,
        0,
        drawWidth,
        drawHeight
    );

    const values =
        products
            .slice(0, 7)
            .map(
                product =>
                    Number(
                        product.clicks || 0
                    )
            );

    if (!values.length) {
        return;
    }

    const max =
        Math.max(
            ...values,
            1
        );

    const padding = 30;

    const chartWidth =
        drawWidth -
        padding * 2;

    const chartHeight =
        drawHeight -
        padding * 2;

    ctx.beginPath();

    values.forEach(
        (value, index) => {
            const x =
                padding +
                (
                    index /
                    Math.max(
                        values.length - 1,
                        1
                    )
                ) *
                    chartWidth;

            const y =
                drawHeight -
                padding -
                (
                    value / max
                ) *
                    chartHeight;

            if (index === 0) {
                ctx.moveTo(
                    x,
                    y
                );
            } else {
                ctx.lineTo(
                    x,
                    y
                );
            }
        }
    );

    ctx.stroke();


    values.forEach(
        (value, index) => {
            const x =
                padding +
                (
                    index /
                    Math.max(
                        values.length - 1,
                        1
                    )
                ) *
                    chartWidth;

            const y =
                drawHeight -
                padding -
                (
                    value / max
                ) *
                    chartHeight;

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                4,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }
    );
}


/* ============================================================
   CONTAGEM DE PRODUTOS
   ============================================================ */

function renderProductCount() {
    const count =
        document.getElementById(
            "productCount"
        );

    if (count) {
        count.textContent =
            `${products.length} produto${
                products.length === 1
                    ? ""
                    : "s"
            }`;
    }
}


/* ============================================================
   RENDERIZAÇÃO GERAL
   ============================================================ */

function renderEverything() {
    renderDashboardStats();
    renderTopProducts();
    renderDashboardProducts();
    renderProductsTable();
    renderClicks();
    renderClickChart();
    renderProductCount();
    renderCategories();
}


/* ============================================================
   MENU MOBILE
   ============================================================ */

function iniciarMobileMenu() {
    const menuButton =
        document.querySelector(
            ".mobile-menu-button"
        );

    const sidebar =
        document.querySelector(
            ".admin-sidebar"
        );

    if (!menuButton || !sidebar) {
        return;
    }

    menuButton.addEventListener(
        "click",
        () => {
            sidebar.classList.toggle(
                "open"
            );
        }
    );
}


/* ============================================================
   NAVEGAÇÃO DO DASHBOARD
   ============================================================ */

function iniciarNavegacao() {
    const links =
        document.querySelectorAll(
            "[data-section]"
        );

    const sections =
        document.querySelectorAll(
            ".admin-section"
        );

    if (!links.length) {
        return;
    }

    links.forEach(link => {
        link.addEventListener(
            "click",
            function (event) {
                event.preventDefault();

                const target =
                    this.dataset.section;

                sections.forEach(
                    section => {
                        section.classList.remove(
                            "active"
                        );
                    }
                );

                const selected =
                    document.getElementById(
                        `section-${target}`
                    );

                if (selected) {
                    selected.classList.add(
                        "active"
                    );
                }

                links.forEach(
                    item => {
                        item.classList.remove(
                            "active"
                        );
                    }
                );

                this.classList.add(
                    "active"
                );
            }
        );
    });
}


/* ============================================================
   BOTÃO CANCELAR FORMULÁRIO
   ============================================================ */

function iniciarResetButton() {
    const buttons =
        document.querySelectorAll(
            "[data-reset-product]"
        );

    buttons.forEach(button => {
        button.addEventListener(
            "click",
            resetProductForm
        );
    });
}


/* ============================================================
   EXPORTAR PRODUTOS
   ============================================================ */

function exportProducts() {
    const data =
        JSON.stringify(
            products,
            null,
            2
        );

    const blob =
        new Blob(
            [data],
            {
                type:
                    "application/json"
            }
        );

    const url =
        URL.createObjectURL(
            blob
        );

    const a =
        document.createElement(
            "a"
        );

    a.href = url;

    a.download =
        "axeus-products.json";

    document.body.appendChild(a);

    a.click();

    a.remove();

    URL.revokeObjectURL(
        url
    );
}


function iniciarExportacao() {
    const buttons =
        document.querySelectorAll(
            "[data-export]"
        );

    buttons.forEach(button => {
        button.addEventListener(
            "click",
            exportProducts
        );
    });
}


/* ============================================================
   ATUALIZAÇÃO ENTRE ABAS
   ============================================================ */

window.addEventListener(
    "storage",
    function (event) {
        if (
            event.key ===
            "axeusProductsUpdated"
        ) {
            products =
                getLocalProducts();

            renderEverything();
        }
    }
);


/* ============================================================
   AUTO REFRESH
   ============================================================ */

setInterval(
    async function () {
        if (!isDashboard) {
            return;
        }

        try {
            products =
                await loadProductsFromSupabase();

            categories =
                await loadCategoriesFromSupabase();

            renderEverything();

            updateProductCategorySelect();

        } catch (error) {
            console.error(
                "Erro no auto refresh:",
                error
            );
        }
    },
    30000
);


/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        iniciarLogin();

        iniciarMostrarSenha();

        iniciarLogout();

        iniciarProductForm();

        iniciarCategoryForm();

        iniciarDeleteModal();

        iniciarBusca();

        iniciarMobileMenu();

        iniciarNavegacao();

        iniciarResetButton();

        iniciarExportacao();

        if (isDashboard) {
            await loadProducts();

            await loadCategories();
        }
    }
);
