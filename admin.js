"use strict";

/* ============================================================
   CONFIGURAÇÃO SUPABASE
   ============================================================ */

const SUPABASE_URL =
    "https://qgztuzjqxnwdqdsasche.supabase.co";

const SUPABASE_KEY =
    "https://qgztuzjqxnwdqdsasche.supabase.co/rest/v1/";

const PRODUCTS_KEY = "axeus_products";
const OLD_PRODUCTS_KEY = "axeus_store_products";


/* ============================================================
   LOGIN ADMINISTRATIVO
   ============================================================ */

const ADMIN_USER = "SEU_USUARIO";
const ADMIN_PASSWORD = "SUA_SENHA";

const loginForm =
    document.getElementById("loginForm");

const usernameInput =
    document.getElementById("username");

const passwordInput =
    document.getElementById("password");

const loginError =
    document.getElementById("loginError");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const username =
                usernameInput.value.trim();

            const password =
                passwordInput.value;

            loginError.textContent = "";

            if (
                username === ADMIN_USER &&
                password === ADMIN_PASSWORD
            ) {

                sessionStorage.setItem(
                    "axeus_admin_logged",
                    "true"
                );

                window.location.href =
                    "dashboard.html";

            } else {

                loginError.textContent =
                    "Usuário ou senha incorretos.";

                passwordInput.value = "";

                passwordInput.focus();
            }
        }
    );
}


/* ============================================================
   MOSTRAR SENHA
   ============================================================ */

const showPassword =
    document.getElementById("showPassword");

if (
    showPassword &&
    passwordInput
) {

    showPassword.addEventListener(
        "click",
        function () {

            if (
                passwordInput.type ===
                "password"
            ) {

                passwordInput.type =
                    "text";

                showPassword.textContent =
                    "○";

            } else {

                passwordInput.type =
                    "password";

                showPassword.textContent =
                    "◉";
            }
        }
    );
}


/* ============================================================
   VERIFICAR LOGIN
   ============================================================ */

function verificarLoginAdmin() {

    const logged =
        sessionStorage.getItem(
            "axeus_admin_logged"
        );

    if (logged !== "true") {

        window.location.href =
            "adm.html";

        return false;
    }

    return true;
}

const isDashboard =
    document.querySelector(
        ".admin-layout"
    );

if (
    isDashboard &&
    !verificarLoginAdmin()
) {

    throw new Error(
        "Administrador não autenticado."
    );
}


/* ============================================================
   PRODUTOS PADRÃO
   ============================================================ */

const defaultProducts = [

    {
        id: "tiktok",
        name: "Ganchos para TikTok Shop",
        category: "TikTok Shop",
        price: "R$ 19,90",
        description:
            "Ganchos e estratégias para criar vídeos mais atrativos para TikTok Shop.",
        image: "",
        link:
            "https://pay.cakto.com.br/3erj75x_1080094",
        sold: 1207,
        clicks: 0,
        status: "active"
    },

    {
        id: "spotify",
        name: "Método Spotify PC",
        category: "PC",
        price: "R$ 19,90",
        description:
            "Método para melhorar sua experiência com Spotify no PC.",
        image: "",
        link:
            "https://pay.cakto.com.br/szk82cw_1007831",
        sold: 842,
        clicks: 0,
        status: "active"
    },

    {
        id: "streaming",
        name: "Aplicativo de Streaming",
        category: "Entretenimento",
        price: "R$ 19,90",
        description:
            "Aplicativo de entretenimento com filmes e séries.",
        image: "",
        link:
            "https://pay.cakto.com.br/po9btzm_997956",
        sold: 913,
        clicks: 0,
        status: "active"
    },

    {
        id: "otimizacao",
        name: "Painel de Otimização",
        category: "PC",
        price: "R$ 19,90",
        description:
            "Ferramenta para otimização e gerenciamento do Windows.",
        image: "",
        link:
            "https://pay.cakto.com.br/r9phmxw_864564",
        sold: 536,
        clicks: 0,
        status: "active"
    },

    {
        id: "axeus",
        name: "AXEUS",
        category: "Aplicativos",
        price: "",
        description:
            "O novo aplicativo AXEUS está chegando.",
        image: "",
        link: "",
        sold: 0,
        clicks: 0,
        status: "coming"
    }

];


/* ============================================================
   NORMALIZAÇÃO
   ============================================================ */

function normalizeProduct(product) {

    return {

        id: String(
            product.id ||
            ("product_" + Date.now())
        ),

        name: String(
            product.name || ""
        ),

        description: String(
            product.description || ""
        ),

        category: String(
            product.category || ""
        ),

        image: String(
            product.image || ""
        ),

        checkout: String(
            product.checkout ||
            product.link ||
            ""
        ),

        link: String(
            product.link ||
            product.checkout ||
            ""
        ),

        clicks: Number(
            product.clicks || 0
        ),

        sold: Number(
            product.sold || 0
        ),

        status: String(
            product.status ||
            "active"
        ),

        price: String(
            product.price || ""
        )
    };
}


/* ============================================================
   SUPABASE REQUEST
   ============================================================ */

async function supabaseRequest(
    endpoint,
    options = {}
) {

    const response =
        await fetch(
            SUPABASE_URL +
            "/rest/v1/" +
            endpoint,
            {

                ...options,

                headers: {

                    "apikey":
                        SUPABASE_KEY,

                    "Authorization":
                        "Bearer " +
                        SUPABASE_KEY,

                    "Content-Type":
                        "application/json",

                    "Prefer":
                        "return=representation",

                    ...(options.headers || {})
                }
            }
        );

    if (!response.ok) {

        const errorText =
            await response.text();

        throw new Error(
            errorText ||
            "Erro ao acessar o Supabase."
        );
    }

    const text =
        await response.text();

    if (!text) {
        return [];
    }

    return JSON.parse(text);
}


/* ============================================================
   CARREGAR PRODUTOS DO SUPABASE
   ============================================================ */

async function loadProductsFromSupabase() {

    const products =
        await supabaseRequest(
            "products?select=*&order=created_at.asc"
        );

    return Array.isArray(products)
        ? products.map(normalizeProduct)
        : [];
}


/* ============================================================
   SALVAR PRODUTOS NO SUPABASE
   ============================================================ */

async function saveProductsToSupabase(
    products
) {

    const normalized =
        products.map(
            normalizeProduct
        );

    /*
       Primeiro buscamos os IDs atuais
       para saber quais registros existem.
    */

    const current =
        await loadProductsFromSupabase();

    const currentIds =
        new Set(
            current.map(
                product => product.id
            )
        );

    const newIds =
        new Set(
            normalized.map(
                product => product.id
            )
        );


    /* ========================================================
       INSERIR / ATUALIZAR
       ======================================================== */

    for (
        const product of normalized
    ) {

        await supabaseRequest(
            "products?on_conflict=id",
            {

                method: "POST",

                body: JSON.stringify(
                    product
                )
            }
        );
    }


    /* ========================================================
       EXCLUIR PRODUTOS REMOVIDOS
       ======================================================== */

    for (
        const oldProduct of current
    ) {

        if (
            !newIds.has(
                oldProduct.id
            )
        ) {

            await supabaseRequest(
                "products?id=eq." +
                encodeURIComponent(
                    oldProduct.id
                ),
                {
                    method: "DELETE"
                }
            );
        }
    }


    /* ========================================================
       CACHE LOCAL
       ======================================================== */

    localStorage.setItem(
        PRODUCTS_KEY,
        JSON.stringify(
            normalized
        )
    );

    window.dispatchEvent(
        new CustomEvent(
            "axeusProductsUpdated",
            {
                detail: normalized
            }
        )
    );

    return normalized;
}


/* ============================================================
   OBTER PRODUTOS
   ============================================================ */

async function getProductsAsync() {

    try {

        const products =
            await loadProductsFromSupabase();

        /*
           Se o banco estiver vazio,
           usamos os produtos padrão
           apenas na primeira configuração.
        */

        if (
            products.length === 0
        ) {

            await saveProductsToSupabase(
                defaultProducts
            );

            return defaultProducts.map(
                normalizeProduct
            );
        }

        localStorage.setItem(
            PRODUCTS_KEY,
            JSON.stringify(
                products
            )
        );

        return products;

    } catch (error) {

        console.error(
            "Erro ao carregar Supabase:",
            error
        );

        const saved =
            localStorage.getItem(
                PRODUCTS_KEY
            );

        if (saved) {

            try {

                const products =
                    JSON.parse(saved);

                if (
                    Array.isArray(
                        products
                    )
                ) {

                    return products.map(
                        normalizeProduct
                    );
                }

            } catch {}
        }

        return defaultProducts.map(
            normalizeProduct
        );
    }
}


/* ============================================================
   CACHE / COMPATIBILIDADE
   ============================================================ */

function getProducts() {

    const saved =
        localStorage.getItem(
            PRODUCTS_KEY
        );

    if (saved) {

        try {

            const products =
                JSON.parse(saved);

            if (
                Array.isArray(
                    products
                )
            ) {

                return products.map(
                    normalizeProduct
                );
            }

        } catch {}
    }

    return defaultProducts.map(
        normalizeProduct
    );
}


/* ============================================================
   SALVAR
   ============================================================ */

async function saveProducts(
    products
) {

    try {

        await saveProductsToSupabase(
            products
        );

        return true;

    } catch (error) {

        console.error(
            "Erro ao salvar produtos:",
            error
        );

        showToast(
            "Erro ao salvar no banco."
        );

        return false;
    }
}


/* ============================================================
   FORMATAÇÃO
   ============================================================ */

function formatNumber(number) {

    return Number(
        number || 0
    ).toLocaleString(
        "pt-BR"
    );
}


/* ============================================================
   NAVEGAÇÃO
   ============================================================ */

const navItems =
    document.querySelectorAll(
        ".nav-item[data-section]"
    );

const sectionButtons =
    document.querySelectorAll(
        "[data-section]"
    );

const sections =
    document.querySelectorAll(
        ".admin-section"
    );


async function openSection(
    sectionName
) {

    sections.forEach(
        section => {
            section.classList.remove(
                "active"
            );
        }
    );

    const selected =
        document.getElementById(
            `section-${sectionName}`
        );

    if (selected) {

        selected.classList.add(
            "active"
        );
    }

    navItems.forEach(
        item => {

            item.classList.toggle(
                "active",
                item.dataset.section ===
                sectionName
            );

        }
    );

    const titles = {

        dashboard:
            "Dashboard",

        produtos:
            "Produtos",

        cliques:
            "Cliques",

        adicionar:
            "Novo produto"
    };

    const pageTitle =
        document.getElementById(
            "pageTitle"
        );

    if (pageTitle) {

        pageTitle.textContent =
            titles[sectionName] ||
            "Dashboard";
    }

    if (
        sectionName ===
        "dashboard"
    ) {

        await renderDashboard();
    }

    if (
        sectionName ===
        "produtos"
    ) {

        await renderProductsTable();
    }

    if (
        sectionName ===
        "cliques"
    ) {

        await renderClicks();
    }

    if (
        sectionName ===
        "adicionar"
    ) {

        prepareNewProduct();
    }

    window.scrollTo({

        top: 0,

        behavior: "smooth"
    });
}


sectionButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            function () {

                const section =
                    button.dataset.section;

                if (section) {

                    openSection(
                        section
                    );
                }
            }
        );
    }
);


/* ============================================================
   LOGOUT
   ============================================================ */

const logoutButton =
    document.getElementById(
        "logoutButton"
    );

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            sessionStorage.removeItem(
                "axeus_admin_logged"
            );

            window.location.href =
                "adm.html";
        }
    );
}


/* ============================================================
   DASHBOARD
   ============================================================ */

async function renderDashboard() {

    const products =
        await getProductsAsync();

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

    const clicksTotal =
        products.reduce(
            (total, product) =>
                total +
                Number(
                    product.clicks || 0
                ),
            0
        );

    const active =
        products.filter(
            product =>
                product.status ===
                "active"
        ).length;

    const sorted =
        [...products].sort(
            (a, b) =>
                Number(
                    b.clicks || 0
                ) -
                Number(
                    a.clicks || 0
                )
        );

    if (totalProducts) {

        totalProducts.textContent =
            formatNumber(
                products.length
            );
    }

    if (totalClicks) {

        totalClicks.textContent =
            formatNumber(
                clicksTotal
            );
    }

    if (activeProducts) {

        activeProducts.textContent =
            formatNumber(
                active
            );
    }

    if (topProduct) {

        topProduct.textContent =
            sorted.length &&
            Number(
                sorted[0].clicks || 0
            ) > 0
                ? sorted[0].name
                : "—";
    }

    renderChart(products);
    renderRanking(products);
    renderDashboardProducts(
        products
    );
}


/* ============================================================
   GRÁFICO
   ============================================================ */

function renderChart(
    products
) {

    const chart =
        document.getElementById(
            "clickChart"
        );

    if (!chart) return;

    chart.innerHTML = "";

    const sorted =
        [...products]
            .sort(
                (a, b) =>
                    Number(
                        b.clicks || 0
                    ) -
                    Number(
                        a.clicks || 0
                    )
            )
            .slice(0, 6);

    if (!sorted.length) {

        chart.innerHTML =
            `<div class="empty-state">
                Nenhum produto cadastrado.
            </div>`;

        return;
    }

    const maxClicks =
        Math.max(
            ...sorted.map(
                product =>
                    Number(
                        product.clicks ||
                        0
                    )
            ),
            1
        );

    sorted.forEach(
        product => {

            const clicks =
                Number(
                    product.clicks ||
                    0
                );

            const percentage =
                (clicks /
                    maxClicks) *
                100;

            const column =
                document.createElement(
                    "div"
                );

            column.className =
                "chart-column";

            column.innerHTML = `

                <span class="chart-value">
                    ${formatNumber(clicks)}
                </span>

                <div class="chart-bar-area">

                    <div
                        class="chart-bar"
                        style="height:${Math.max(
                            percentage,
                            3
                        )}%"
                    ></div>

                </div>

                <span class="chart-label">
                    ${escapeHtml(
                        product.name
                    )}
                </span>
            `;

            chart.appendChild(
                column
            );
        }
    );
}


/* ============================================================
   RANKING
   ============================================================ */

function renderRanking(
    products
) {

    const container =
        document.getElementById(
            "topProductsList"
        );

    if (!container) return;

    const sorted =
        [...products]
            .sort(
                (a, b) =>
                    Number(
                        b.clicks || 0
                    ) -
                    Number(
                        a.clicks || 0
                    )
            )
            .slice(0, 5);

    if (!sorted.length) {

        container.innerHTML =
            `<div class="empty-state">
                Nenhum produto cadastrado.
            </div>`;

        return;
    }

    container.innerHTML =
        sorted
            .map(
                (
                    product,
                    index
                ) => `

                    <div class="ranking-item">

                        <div class="ranking-number">
                            ${index + 1}
                        </div>

                        <div class="ranking-info">

                            <strong>
                                ${escapeHtml(
                                    product.name
                                )}
                            </strong>

                            <span>
                                ${escapeHtml(
                                    product.category
                                )}
                            </span>

                        </div>

                        <div class="ranking-clicks">
                            ${formatNumber(
                                product.clicks
                            )}
                        </div>

                    </div>
                `
            )
            .join("");
}


/* ============================================================
   PRODUTOS DO DASHBOARD
   ============================================================ */

function renderDashboardProducts(
    products
) {

    const container =
        document.getElementById(
            "dashboardProducts"
        );

    if (!container) return;

    const items =
        products.slice(0, 6);

    if (!items.length) {

        container.innerHTML =
            `<div class="empty-state">
                Nenhum produto cadastrado.
            </div>`;

        return;
    }

    container.innerHTML =
        items
            .map(
                product => `

                    <div class="dashboard-product">

                        <div class="product-mini-image">

                            ${
                                product.image
                                    ? `
                                        <img
                                            src="${escapeAttribute(
                                                product.image
                                            )}"
                                            alt=""
                                        >
                                      `
                                    : "AX"
                            }

                        </div>

                        <div class="dashboard-product-info">

                            <strong>
                                ${escapeHtml(
                                    product.name
                                )}
                            </strong>

                            <span>
                                ${formatNumber(
                                    product.clicks
                                )}
                                cliques
                            </span>

                        </div>

                    </div>
                `
            )
            .join("");
}


/* ============================================================
   TABELA DE PRODUTOS
   ============================================================ */

async function renderProductsTable(
    search = ""
) {

    const tbody =
        document.getElementById(
            "productsTableBody"
        );

    if (!tbody) return;

    let products =
        await getProductsAsync();

    const searchValue =
        search.trim().toLowerCase();

    if (searchValue) {

        products =
            products.filter(
                product =>

                    product.name
                        .toLowerCase()
                        .includes(
                            searchValue
                        ) ||

                    product.category
                        .toLowerCase()
                        .includes(
                            searchValue
                        )
            );
    }

    const productCount =
        document.getElementById(
            "productCount"
        );

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

                <td
                    colspan="6"
                    class="table-empty"
                >
                    Nenhum produto encontrado.
                </td>

            </tr>
        `;

        return;
    }

    tbody.innerHTML =
        products
            .map(
                product => `

                    <tr>

                        <td>

                            <div class="table-product">

                                <div class="table-product-image">

                                    ${
                                        product.image
                                            ? `
                                                <img
                                                    src="${escapeAttribute(
                                                        product.image
                                                    )}"
                                                    alt=""
                                                >
                                              `
                                            : "AX"
                                    }

                                </div>

                                <div>

                                    <div class="table-product-name">
                                        ${escapeHtml(
                                            product.name
                                        )}
                                    </div>

                                    <div class="table-product-category">
                                        ${formatNumber(
                                            product.sold
                                        )}
                                        vendidos
                                    </div>

                                </div>

                            </div>

                        </td>

                        <td>

                            <span class="category-tag">
                                ${escapeHtml(
                                    product.category
                                )}
                            </span>

                        </td>

                        <td>
                            ${escapeHtml(
                                product.price ||
                                "—"
                            )}
                        </td>

                        <td>

                            <strong>
                                ${formatNumber(
                                    product.clicks
                                )}
                            </strong>

                        </td>

                        <td>
                            ${getStatusHTML(
                                product.status
                            )}
                        </td>

                        <td>

                            <div class="action-buttons">

                                <button
                                    class="action-button"
                                    title="Editar"
                                    onclick="editProduct('${escapeAttribute(
                                        product.id
                                    )}')"
                                >
                                    ✎
                                </button>

                                <button
                                    class="action-button delete"
                                    title="Remover"
                                    onclick="openDeleteModal('${escapeAttribute(
                                        product.id
                                    )}')"
                                >
                                    ×
                                </button>

                            </div>

                        </td>

                    </tr>
                `
            )
            .join("");
}


/* ============================================================
   STATUS
   ============================================================ */

function getStatusHTML(
    status
) {

    if (
        status ===
        "coming"
    ) {

        return `
            <span class="status coming">
                <i></i>
                Em breve
            </span>
        `;
    }

    if (
        status ===
        "inactive"
    ) {

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


/* ============================================================
   PESQUISA
   ============================================================ */

const productSearch =
    document.getElementById(
        "productSearch"
    );

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


/* ============================================================
   FORMULÁRIO
   ============================================================ */

const productForm =
    document.getElementById(
        "productForm"
    );

if (productForm) {

    productForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            saveProductFromForm();
        }
    );
}


/* ============================================================
   SALVAR PRODUTO
   ============================================================ */

async function saveProductFromForm() {

    const products =
        await getProductsAsync();

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

    if (
        !name ||
        !category
    ) {

        showToast(
            "Preencha os campos obrigatórios."
        );

        return;
    }


    /* ========================================================
       EDITAR
       ======================================================== */

    if (editingId) {

        const index =
            products.findIndex(
                item =>
                    item.id ===
                    editingId
            );

        if (index === -1) {

            showToast(
                "Produto não encontrado."
            );

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

            clicks:
                Number(
                    products[index]
                        .clicks || 0
                )
        };

        const saved =
            await saveProducts(
                products
            );

        if (!saved) return;

        showToast(
            "Produto atualizado com sucesso!"
        );


    /* ========================================================
       NOVO PRODUTO
       ======================================================== */

    } else {

        products.push({

            id:
                "product_" +
                Date.now(),

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

        const saved =
            await saveProducts(
                products
            );

        if (!saved) return;

        showToast(
            "Produto adicionado com sucesso!"
        );
    }

    resetProductForm();

    await renderDashboard();

    await renderProductsTable();

    await renderClicks();

    setTimeout(
        () =>
            openSection(
                "produtos"
            ),
        500
    );
}


/* ============================================================
   EDITAR PRODUTO
   ============================================================ */

async function editProduct(
    id
) {

    const products =
        await getProductsAsync();

    const product =
        products.find(
            item =>
                item.id === id
        );

    if (!product) return;

    document.getElementById(
        "editingProductId"
    ).value =
        product.id;

    document.getElementById(
        "productName"
    ).value =
        product.name || "";

    document.getElementById(
        "productCategory"
    ).value =
        product.category || "";

    document.getElementById(
        "productPrice"
    ).value =
        product.price || "";

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
        product.link ||
        product.checkout ||
        "";

    document.getElementById(
        "productSold"
    ).value =
        product.sold || 0;

    document.getElementById(
        "productStatus"
    ).value =
        product.status ||
        "active";

    const formTitle =
        document.getElementById(
            "formTitle"
        );

    if (formTitle) {

        formTitle.textContent =
            "Editar produto";
    }

    openSection(
        "adicionar"
    );
}


/* ============================================================
   NOVO PRODUTO
   ============================================================ */

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


/* ============================================================
   RESET FORM
   ============================================================ */

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
    ).value =
        "active";

    const formTitle =
        document.getElementById(
            "formTitle"
        );

    if (formTitle) {

        formTitle.textContent =
            "Novo produto";
    }
}


/* ============================================================
   CANCELAR PRODUTO
   ============================================================ */

const cancelProductButton =
    document.getElementById(
        "cancelProductButton"
    );

if (cancelProductButton) {

    cancelProductButton.addEventListener(
        "click",
        function () {

            resetProductForm();

            openSection(
                "produtos"
            );
        }
    );
}


/* ============================================================
   EXCLUSÃO
   ============================================================ */

let productToDelete = null;


function openDeleteModal(
    id
) {

    productToDelete = id;

    const modal =
        document.getElementById(
            "deleteModal"
        );

    if (modal) {

        modal.classList.add(
            "show"
        );
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

    productToDelete =
        null;

    const modal =
        document.getElementById(
            "deleteModal"
        );

    if (modal) {

        modal.classList.remove(
            "show"
        );
    }
}


const confirmDeleteButton =
    document.getElementById(
        "confirmDeleteButton"
    );

if (confirmDeleteButton) {

    confirmDeleteButton.addEventListener(
        "click",
        async function () {

            if (
                !productToDelete
            ) {
                return;
            }

            let products =
                await getProductsAsync();

            products =
                products.filter(
                    product =>
                        product.id !==
                        productToDelete
                );

            const saved =
                await saveProducts(
                    products
                );

            if (!saved) return;

            closeDeleteModal();

            showToast(
                "Produto removido com sucesso!"
            );

            await renderProductsTable();

            await renderDashboard();

            await renderClicks();
        }
    );
}


/* ============================================================
   CLIQUES
   ============================================================ */

async function renderClicks() {

    const products =
        await getProductsAsync();

    const total =
        products.reduce(
            (sum, product) =>
                sum +
                Number(
                    product.clicks ||
                    0
                ),
            0
        );

    const average =
        products.length
            ? Math.round(
                total /
                products.length
            )
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
            formatNumber(
                total
            );
    }

    if (averageElement) {

        averageElement.textContent =
            formatNumber(
                average
            );
    }

    const container =
        document.getElementById(
            "clicksList"
        );

    if (!container) return;

    const sorted =
        [...products].sort(
            (a, b) =>
                Number(
                    b.clicks || 0
                ) -
                Number(
                    a.clicks || 0
                )
        );

    if (!sorted.length) {

        container.innerHTML =
            `<div class="empty-state">
                Nenhum produto cadastrado.
            </div>`;

        return;
    }

    const max =
        Math.max(
            ...sorted.map(
                product =>
                    Number(
                        product.clicks ||
                        0
                    )
            ),
            1
        );

    container.innerHTML =
        sorted
            .map(
                product => {

                    const clicks =
                        Number(
                            product.clicks ||
                            0
                        );

                    const percentage =
                        (
                            clicks /
                            max
                        ) * 100;

                    return `

                        <div class="click-item">

                            <div class="click-item-info">

                                <strong>
                                    ${escapeHtml(
                                        product.name
                                    )}
                                </strong>

                                <span>
                                    ${escapeHtml(
                                        product.category
                                    )}
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
                                ${formatNumber(
                                    clicks
                                )}
                            </div>

                        </div>
                    `;
                }
            )
            .join("");
}


/* ============================================================
   TOAST
   ============================================================ */

let toastTimer;


function showToast(
    message
) {

    const toast =
        document.getElementById(
            "adminToast"
        );

    const messageElement =
        document.getElementById(
            "toastMessage"
        );

    if (
        !toast ||
        !messageElement
    ) {
        return;
    }

    messageElement.textContent =
        message;

    toast.classList.add(
        "show"
    );

    clearTimeout(
        toastTimer
    );

    toastTimer =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );
}


/* ============================================================
   SEGURANÇA HTML
   ============================================================ */

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


function escapeAttribute(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* ============================================================
   MENU MOBILE
   ============================================================ */

const mobileMenu =
    document.getElementById(
        "mobileMenu"
    );

const sidebar =
    document.querySelector(
        ".sidebar"
    );

if (
    mobileMenu &&
    sidebar
) {

    mobileMenu.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle(
                "mobile-open"
            );
        }
    );
}


/* ============================================================
   EXPORTAÇÕES
   ============================================================ */

window.editProduct =
    editProduct;

window.openDeleteModal =
    openDeleteModal;

window.closeDeleteModal =
    closeDeleteModal;

window.getProducts =
    getProducts;

window.getProductsAsync =
    getProductsAsync;

window.saveProducts =
    saveProducts;


/* ============================================================
   ATUALIZAÇÃO ENTRE ABAS
   ============================================================ */

window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key ===
            PRODUCTS_KEY
        ) {

            renderDashboard();

            renderProductsTable(
                productSearch
                    ? productSearch.value
                    : ""
            );

            renderClicks();
        }
    }
);


/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */

if (isDashboard) {

    renderDashboard();

    renderProductsTable();

    renderClicks();
}
