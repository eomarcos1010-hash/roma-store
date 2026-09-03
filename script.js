/* ============================================================
   AXEUS STORE
   SCRIPT PRINCIPAL
   ============================================================ */

"use strict";

/* ============================================================
   CONFIGURAÇÃO SUPABASE
   ============================================================ */

const SUPABASE_URL =
    "https://qgztuzjqxnwdqdsasche.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_E4AZ79FjRSaXIuoLJead4A_DMaH51t_";

/* ============================================================
   CONFIGURAÇÃO LOCAL
   ============================================================ */

const STORAGE_KEY =
    window.AXEUS_STORAGE_KEY || "axeus_products";

const OLD_STORAGE_KEYS = [
    "axeus_products",
    "AXEUS_PRODUCTS",
    "products",
    "productsData"
];

/* ============================================================
   PRODUTOS PADRÃO
   ============================================================ */

const DEFAULT_PRODUCTS = [

    {
        id: "tiktok-shop",

        name: "Ganchos para TikTok Shop",

        description:
            "Estratégias, ganchos e ideias para criar conteúdos mais atrativos para TikTok Shop.",

        category: "TIKTOK SHOP",

        price: "29,90",

        image: "",

        checkout:
            "https://pay.cakto.com.br/3erj75x_1080094",

        link:
            "https://pay.cakto.com.br/3erj75x_1080094",

        sold: 1207,

        clicks: 0,

        status: "active"
    },

    {
        id: "spotify-pc",

        name: "Método Spotify PC",

        description:
            "Método para melhorar sua experiência utilizando Spotify no computador.",

        category: "PC",

        price: "19,90",

        image: "",

        checkout:
            "https://pay.cakto.com.br/szk82cw_1007831",

        link:
            "https://pay.cakto.com.br/szk82cw_1007831",

        sold: 842,

        clicks: 0,

        status: "active"
    },

    {
        id: "streaming",

        name: "Aplicativo de Streaming",

        description:
            "Aplicativo para assistir filmes e séries em uma experiência simples e prática.",

        category: "ENTRETENIMENTO",

        price: "24,90",

        image: "",

        checkout:
            "https://pay.cakto.com.br/po9btzm_997956",

        link:
            "https://pay.cakto.com.br/po9btzm_997956",

        sold: 913,

        clicks: 0,

        status: "active"
    },

    {
        id: "otimizacao",

        name: "Painel de Otimização",

        description:
            "Ferramenta para ajudar na otimização e configuração do Windows.",

        category: "PC",

        price: "29,90",

        image: "",

        checkout:
            "https://pay.cakto.com.br/r9phmxw_864564",

        link:
            "https://pay.cakto.com.br/r9phmxw_864564",

        sold: 536,

        clicks: 0,

        status: "active"
    },

    {
        id: "axeus",

        name: "AXEUS",

        description:
            "Uma nova experiência para personalizar, otimizar e transformar seu Windows.",

        category: "APLICATIVOS",

        price: "",

        image: "",

        checkout: "",

        link: "",

        sold: 0,

        clicks: 0,

        status: "coming-soon"
    }

];

/* ============================================================
   ESTADO
   ============================================================ */

let allProducts = [];

let currentFilter = "TODOS";

/* ============================================================
   ELEMENTOS
   ============================================================ */

let productsGrid;

let emptyProducts;

let heroProductsCount;

let heroClicksCount;

/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        productsGrid =
            document.getElementById(
                "products-grid"
            );

        emptyProducts =
            document.getElementById(
                "empty-products"
            );

        heroProductsCount =
            document.getElementById(
                "hero-products-count"
            );

        heroClicksCount =
            document.getElementById(
                "hero-clicks-count"
            );

        createProductDetails();

        await initializeStore();
    }
);

/* ============================================================
   INICIALIZAR LOJA
   ============================================================ */

async function initializeStore() {

    await loadProducts();

    setupFilters();

    renderProducts();

    updateHeroStats();

    setupStorageListener();

    setInterval(
        async function () {

            await loadProducts();

            renderProducts();

            updateHeroStats();

        },
        30000
    );
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

                    "Content-Type":
                        "application/json",

                    "Prefer":
                        options.method === "POST"
                            ? "return=representation"
                            : "return=minimal",

                    ...(options.headers || {})
                }
            }
        );

    if (!response.ok) {

        const errorText =
            await response.text();

        throw new Error(
            `Supabase ${response.status}: ${errorText}`
        );
    }

    const text =
        await response.text();

    if (!text) {
        return null;
    }

    try {

        return JSON.parse(text);

    } catch {

        return null;
    }
}

/* ============================================================
   CARREGAR PRODUTOS
   ============================================================ */

async function loadProducts() {

    try {

        const data =
            await supabaseRequest(
                "products?select=*"
            );

        if (Array.isArray(data)) {

            allProducts =
                normalizeProducts(data);

            saveLocalCache();

            return;
        }

    } catch (error) {

        console.error(
            "Erro ao carregar produtos do Supabase:",
            error
        );
    }

    let savedProducts = null;

    try {

        const data =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (data) {

            savedProducts =
                JSON.parse(data);
        }

    } catch (error) {

        console.error(
            "Erro ao carregar cache:",
            error
        );
    }

    if (!Array.isArray(savedProducts)) {

        for (const key of OLD_STORAGE_KEYS) {

            try {

                const data =
                    localStorage.getItem(
                        key
                    );

                if (!data) {
                    continue;
                }

                const parsed =
                    JSON.parse(data);

                if (Array.isArray(parsed)) {

                    savedProducts =
                        parsed;

                    break;
                }

            } catch (error) {

                console.warn(
                    "Não foi possível ler:",
                    key
                );
            }
        }
    }

    if (Array.isArray(savedProducts)) {

        allProducts =
            normalizeProducts(
                savedProducts
            );

        return;
    }

    allProducts =
        normalizeProducts(
            DEFAULT_PRODUCTS
        );
}

/* ============================================================
   CACHE LOCAL
   ============================================================ */

function saveLocalCache() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
                allProducts
            )
        );

    } catch (error) {

        console.error(
            "Erro ao salvar cache local:",
            error
        );
    }
}

/* ============================================================
   NORMALIZAR PRODUTOS
   ============================================================ */

function normalizeProducts(products) {

    return products

        .filter(
            product => product
        )

        .map(
            (product, index) => {

                const normalized = {
                    ...product
                };

                if (
                    !normalized.id ||
                    String(
                        normalized.id
                    ).trim() === ""
                ) {

                    normalized.id =
                        createProductId(
                            normalized.name ||
                            `produto-${index + 1}`
                        );
                }

                normalized.name =
                    String(
                        normalized.name ||
                        normalized.title ||
                        `Produto ${index + 1}`
                    );

                normalized.description =
                    String(
                        normalized.description ||
                        normalized.desc ||
                        "Produto digital AXEUS."
                    );

                normalized.category =
                    normalizeCategory(
                        normalized.category ||
                        normalized.categoryName ||
                        "OUTROS"
                    );

                normalized.image =
                    normalized.image ||
                    normalized.imageUrl ||
                    normalized.photo ||
                    "";

                normalized.checkout =
                    cleanProductLink(
                        normalized.checkout ||
                        normalized.buyLink ||
                        normalized.paymentLink ||
                        normalized.link ||
                        ""
                    );

                normalized.link =
                    cleanProductLink(
                        normalized.link ||
                        normalized.checkout ||
                        ""
                    );

                normalized.clicks =
                    toNumber(
                        normalized.clicks
                    );

                normalized.sold =
                    toNumber(
                        normalized.sold
                    );

                normalized.status =
                    normalizeStatus(
                        normalized.status
                    );

                normalized.price =
                    normalized.price == null
                        ? ""
                        : String(
                            normalized.price
                        );

                return normalized;
            }
        );
}

/* ============================================================
   LIMPAR LINK
   ============================================================ */

function cleanProductLink(link) {

    if (!link) {
        return "";
    }

    let value =
        String(link).trim();

    const markdownMatch =
        value.match(
            /^\[.*?\]\((https?:\/\/.*?)\)$/
        );

    if (markdownMatch) {

        value =
            markdownMatch[1];
    }

    value =
        value.replace(
            /\s+/g,
            ""
        );

    return value;
}

/* ============================================================
   SALVAR PRODUTOS
   ============================================================ */

async function saveProducts() {

    saveLocalCache();

    window.dispatchEvent(
        new CustomEvent(
            "axeusProductsUpdated"
        )
    );
}

/* ============================================================
   FILTROS
   ============================================================ */

function setupFilters() {

    const filterButtons =
        document.querySelectorAll(
            ".filter-button"
        );

    filterButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    const filter =
                        normalizeCategory(
                            this.dataset.filter ||
                            "TODOS"
                        );

                    currentFilter =
                        filter;

                    filterButtons.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );
                        }
                    );

                    this.classList.add(
                        "active"
                    );

                    renderProducts();
                }
            );
        }
    );
}

/* ============================================================
   RENDERIZAR PRODUTOS
   ============================================================ */

function renderProducts() {

    if (!productsGrid) {
        return;
    }

    let products =
        [...allProducts];

    if (
        currentFilter !==
        "TODOS"
    ) {

        products =
            products.filter(
                product => {

                    return normalizeCategory(
                        product.category
                    ) ===
                    currentFilter;
                }
            );
    }

    productsGrid.innerHTML =
        "";

    if (
        products.length ===
        0
    ) {

        if (emptyProducts) {

            emptyProducts.style.display =
                "flex";
        }

        return;
    }

    if (emptyProducts) {

        emptyProducts.style.display =
            "none";
    }

    products.forEach(
        product => {

            const card =
                createProductCard(
                    product
                );

            productsGrid.appendChild(
                card
            );
        }
    );

    updateHeroStats();
}

/* ============================================================
   CRIAR CARD DO PRODUTO
   ============================================================ */

function createProductCard(product) {

    const card =
        document.createElement(
            "article"
        );

    card.className =
        "product-card";

    card.dataset.productId =
        product.id;

    card.setAttribute(
        "tabindex",
        "0"
    );

    card.setAttribute(
        "role",
        "button"
    );

    card.setAttribute(
        "aria-label",
        `Ver detalhes de ${product.name}`
    );

    /* ========================================================
       CLIQUE
       ======================================================== */

    function handleProductOpen() {

        registerProductView(
            product.id
        );

        openProductDetails(
            product
        );
    }

    card.addEventListener(
        "click",
        function () {

            handleProductOpen();

        }
    );

    card.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                handleProductOpen();
            }
        }
    );

    /* ========================================================
       IMAGEM
       ======================================================== */

    const imageWrapper =
        document.createElement(
            "div"
        );

    imageWrapper.className =
        "product-image";

    if (product.image) {

        const image =
            document.createElement(
                "img"
            );

        image.src =
            product.image;

        image.alt =
            product.name;

        image.loading =
            "lazy";

        image.onerror =
            function () {

                image.style.display =
                    "none";

                imageWrapper.classList.add(
                    "image-error"
                );

                imageWrapper.insertAdjacentHTML(
                    "beforeend",
                    createProductPlaceholder(
                        product.name
                    )
                );
            };

        imageWrapper.appendChild(
            image
        );

    } else {

        imageWrapper.innerHTML =
            createProductPlaceholder(
                product.name
            );
    }

    /* ========================================================
       CATEGORIA
       ======================================================== */

    const categoryBadge =
        document.createElement(
            "span"
        );

    categoryBadge.className =
        "product-category";

    categoryBadge.textContent =
        product.category;

    imageWrapper.appendChild(
        categoryBadge
    );

    /* ========================================================
       CONTEÚDO
       ======================================================== */

    const content =
        document.createElement(
            "div"
        );

    content.className =
        "product-content";

    /* ========================================================
       NOME
       ======================================================== */

    const title =
        document.createElement(
            "h3"
        );

    title.className =
        "product-title";

    title.textContent =
        product.name;

    /* ========================================================
       ÁREA INFERIOR
       ======================================================== */

    const footer =
        document.createElement(
            "div"
        );

    footer.className =
        "product-footer";

    /* ========================================================
       INFORMAÇÕES
       ======================================================== */

    const info =
        document.createElement(
            "div"
        );

    info.className =
        "product-info";

    /* ========================================================
       VENDIDOS
       ======================================================== */

    const sold =
        document.createElement(
            "span"
        );

    sold.className =
        "product-sold";

    sold.dataset.soldFor =
        product.id;

    sold.innerHTML =
        `
            <span class="sold-icon">🔥</span>
            ${formatNumber(
                getDisplayedCount(
                    product
                )
            )} vendidos
        `;

    info.appendChild(
        sold
    );

    /* ========================================================
       TEXTO DE CLIQUE
       ======================================================== */

    const view =
        document.createElement(
            "div"
        );

    view.className =
        "product-view";

    view.innerHTML =
        `
            <span>Ver produto</span>
            <span class="product-view-arrow">→</span>
        `;

    /* ========================================================
       MONTAR
       ======================================================== */

    footer.appendChild(
        info
    );

    footer.appendChild(
        view
    );

    content.appendChild(
        title
    );

    content.appendChild(
        footer
    );

    card.appendChild(
        imageWrapper
    );

    card.appendChild(
        content
    );

    /* ========================================================
       EM BREVE
       ======================================================== */

    if (
        normalizeStatus(
            product.status
        ) ===
        "coming-soon"
    ) {

        card.classList.add(
            "product-coming-soon"
        );
    }

    return card;
}

/* ============================================================
   CRIAR MODAL DE PRODUTO
   ============================================================ */

function createProductDetails() {

    if (
        document.getElementById(
            "productDetailsModal"
        )
    ) {

        return;
    }

    const modal =
        document.createElement(
            "div"
        );

    modal.id =
        "productDetailsModal";

    modal.className =
        "product-details-modal";

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    modal.innerHTML = `

        <div
            class="product-details-backdrop"
            data-product-details-close
        ></div>

        <div
            class="product-details-container"
            role="dialog"
            aria-modal="true"
            aria-labelledby="productDetailsTitle"
        >

            <button
                type="button"
                class="product-details-close"
                id="productDetailsClose"
                aria-label="Fechar produto"
            >
                ×
            </button>


            <div
                class="product-details-image-wrapper"
            >

                <img
                    id="productDetailsImage"
                    class="product-details-image"
                    src=""
                    alt=""
                >

                <div
                    id="productDetailsPlaceholder"
                    class="product-details-placeholder"
                ></div>

            </div>


            <div
                class="product-details-content"
            >

                <span
                    id="productDetailsCategory"
                    class="product-details-category"
                ></span>


                <h2
                    id="productDetailsTitle"
                    class="product-details-title"
                ></h2>


                <div
                    class="product-details-meta"
                >

                    <div
                        class="product-details-price-box"
                    >

                        <span>
                            PREÇO
                        </span>

                        <strong
                            id="productDetailsPrice"
                        ></strong>

                    </div>


                    <div
                        class="product-details-sold-box"
                    >

                        <span>
                            VENDIDOS
                        </span>

                        <strong
                            id="productDetailsSold"
                        ></strong>

                    </div>

                </div>


                <div
                    class="product-details-description-box"
                >

                    <span>
                        SOBRE O PRODUTO
                    </span>

                    <p
                        id="productDetailsDescription"
                    ></p>

                </div>


                <a
                    id="productDetailsBuy"
                    class="product-details-buy"
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    COMPRAR AGORA
                </a>

            </div>

        </div>
    `;

    document.body.appendChild(
        modal
    );

    /* ========================================================
       FECHAR
       ======================================================== */

    const closeButton =
        document.getElementById(
            "productDetailsClose"
        );

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeProductDetails
        );
    }

    modal.addEventListener(
        "click",
        function (event) {

            if (
                event.target.hasAttribute(
                    "data-product-details-close"
                )
            ) {

                closeProductDetails();
            }
        }
    );

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Escape"
            ) {

                closeProductDetails();
            }
        }
    );
}

/* ============================================================
   ABRIR PRODUTO
   ============================================================ */

function openProductDetails(
    product
) {

    if (!product) {
        return;
    }

    createProductDetails();

    const modal =
        document.getElementById(
            "productDetailsModal"
        );

    if (!modal) {
        return;
    }

    const image =
        document.getElementById(
            "productDetailsImage"
        );

    const placeholder =
        document.getElementById(
            "productDetailsPlaceholder"
        );

    const category =
        document.getElementById(
            "productDetailsCategory"
        );

    const title =
        document.getElementById(
            "productDetailsTitle"
        );

    const price =
        document.getElementById(
            "productDetailsPrice"
        );

    const sold =
        document.getElementById(
            "productDetailsSold"
        );

    const description =
        document.getElementById(
            "productDetailsDescription"
        );

    const buyButton =
        document.getElementById(
            "productDetailsBuy"
        );

    /* ========================================================
       CATEGORIA
       ======================================================== */

    if (category) {

        category.textContent =
            product.category ||
            "OUTROS";
    }

    /* ========================================================
       NOME
       ======================================================== */

    if (title) {

        title.textContent =
            product.name ||
            "Produto";
    }

    /* ========================================================
       PREÇO
       ======================================================== */

    if (price) {

        price.textContent =
            product.price
                ? formatPrice(
                    product.price
                )
                : "Grátis";
    }

    /* ========================================================
       VENDIDOS
       ======================================================== */

    if (sold) {

        sold.textContent =
            formatNumber(
                getDisplayedCount(
                    product
                )
            );
    }

    /* ========================================================
       DESCRIÇÃO
       ======================================================== */

    if (description) {

        description.textContent =
            product.description ||
            "Produto digital AXEUS.";
    }

    /* ========================================================
       IMAGEM
       ======================================================== */

    if (
        image &&
        placeholder
    ) {

        if (product.image) {

            image.src =
                product.image;

            image.alt =
                product.name ||
                "Produto";

            image.style.display =
                "block";

            placeholder.innerHTML =
                "";

            placeholder.style.display =
                "none";

            image.onerror =
                function () {

                    image.style.display =
                        "none";

                    placeholder.innerHTML =
                        createProductPlaceholder(
                            product.name
                        );

                    placeholder.style.display =
                        "flex";
                };

        } else {

            image.removeAttribute(
                "src"
            );

            image.style.display =
                "none";

            placeholder.innerHTML =
                createProductPlaceholder(
                    product.name
                );

            placeholder.style.display =
                "flex";
        }
    }

    /* ========================================================
       BOTÃO COMPRAR
       ======================================================== */

    if (buyButton) {

        const productLink =
            getProductLink(
                product
            );

        const comingSoon =
            normalizeStatus(
                product.status
            ) ===
            "coming-soon";

        if (
            comingSoon ||
            !productLink
        ) {

            buyButton.href =
                "#";

            buyButton.textContent =
                comingSoon
                    ? "EM BREVE"
                    : "INDISPONÍVEL";

            buyButton.classList.add(
                "disabled"
            );

            buyButton.setAttribute(
                "aria-disabled",
                "true"
            );

            buyButton.onclick =
                function (event) {

                    event.preventDefault();

                };

        } else {

            buyButton.href =
                productLink;

            buyButton.target =
                "_blank";

            buyButton.rel =
                "noopener noreferrer";

            buyButton.textContent =
                "COMPRAR AGORA";

            buyButton.classList.remove(
                "disabled"
            );

            buyButton.removeAttribute(
                "aria-disabled"
            );

            buyButton.onclick =
                function () {

                    registerPurchaseClick(
                        product.id
                    );
                };
        }
    }

    /* ========================================================
       ABRIR
       ======================================================== */

    modal.classList.add(
        "active"
    );

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "product-details-open"
    );

    document.body.style.overflow =
        "hidden";
}

/* ============================================================
   FECHAR PRODUTO
   ============================================================ */

function closeProductDetails() {

    const modal =
        document.getElementById(
            "productDetailsModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "active"
    );

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "product-details-open"
    );

    document.body.style.overflow =
        "";
}

/* ============================================================
   REGISTRAR VISUALIZAÇÃO
   ============================================================ */

/*
 * IMPORTANTE:
 *
 * Visualizar um produto NÃO aumenta "vendidos".
 *
 * Apenas aumenta "clicks".
 */

async function registerProductView(
    productId
) {

    const product =
        allProducts.find(
            item =>
                String(item.id) ===
                String(productId)
        );

    if (!product) {
        return;
    }

    product.clicks =
        toNumber(
            product.clicks
        ) + 1;

    updateHeroStats();

    saveLocalCache();

    try {

        await supabaseRequest(
            `products?id=eq.${encodeURIComponent(
                product.id
            )}`,
            {
                method: "PATCH",

                headers: {
                    "Prefer":
                        "return=minimal"
                },

                body: JSON.stringify({
                    clicks:
                        product.clicks
                })
            }
        );

    } catch (error) {

        console.error(
            "Erro ao registrar visualização:",
            error
        );
    }
}

/* ============================================================
   REGISTRAR CLIQUE DE COMPRA
   ============================================================ */

async function registerPurchaseClick(
    productId
) {

    const product =
        allProducts.find(
            item =>
                String(item.id) ===
                String(productId)
        );

    if (!product) {
        return;
    }

    product.clicks =
        toNumber(
            product.clicks
        ) + 1;

    updateHeroStats();

    saveLocalCache();

    try {

        await supabaseRequest(
            `products?id=eq.${encodeURIComponent(
                product.id
            )}`,
            {
                method: "PATCH",

                headers: {
                    "Prefer":
                        "return=minimal"
                },

                body: JSON.stringify({
                    clicks:
                        product.clicks
                })
            }
        );

    } catch (error) {

        console.error(
            "Erro ao registrar clique:",
            error
        );
    }
}

/* ============================================================
   OBTER LINK
   ============================================================ */

function getProductLink(
    product
) {

    if (!product) {
        return "";
    }

    const checkout =
        cleanProductLink(
            product.checkout
        );

    const link =
        cleanProductLink(
            product.link
        );

    return checkout ||
        link ||
        "";
}

/* ============================================================
   PLACEHOLDER
   ============================================================ */

function createProductPlaceholder(
    name
) {

    const letter =
        String(
            name || "A"
        )
            .trim()
            .charAt(0)
            .toUpperCase();

    return `
        <div class="product-placeholder">

            <div class="product-placeholder-logo">
                ${escapeHTML(letter)}
            </div>

        </div>
    `;
}

/* ============================================================
   CONTADOR DE VENDIDOS
   ============================================================ */

function updateProductCounter(
    product
) {

    const counter =
        document.querySelector(
            `[data-sold-for="${CSS.escape(
                String(product.id)
            )}"]`
        );

    if (!counter) {
        return;
    }

    counter.innerHTML =
        `
            <span class="sold-icon">🔥</span>
            ${formatNumber(
                getDisplayedCount(
                    product
                )
            )} vendidos
        `;
}

/* ============================================================
   CONTADOR EXIBIDO
   ============================================================ */

function getDisplayedCount(
    product
) {

    if (
        Number.isFinite(
            Number(product.sold)
        )
    ) {

        return Number(
            product.sold
        );
    }

    return 0;
}

/* ============================================================
   ESTATÍSTICAS DO HERO
   ============================================================ */

function updateHeroStats() {

    if (heroProductsCount) {

        heroProductsCount.textContent =
            formatNumber(
                allProducts.length
            );
    }

    if (heroClicksCount) {

        const total =
            allProducts.reduce(
                (
                    sum,
                    product
                ) => {

                    return sum +
                        toNumber(
                            product.clicks
                        );

                },
                0
            );

        heroClicksCount.textContent =
            formatNumber(
                total
            );
    }
}

/* ============================================================
   SINCRONIZAÇÃO
   ============================================================ */

function setupStorageListener() {

    window.addEventListener(
        "storage",
        function (event) {

            if (
                event.key !==
                STORAGE_KEY
            ) {

                return;
            }

            loadProducts();

            renderProducts();

            updateHeroStats();
        }
    );

    window.addEventListener(
        "axeusProductsUpdated",
        function () {

            loadProducts();

            renderProducts();

            updateHeroStats();
        }
    );
}

/* ============================================================
   ATUALIZAR LOJA
   ============================================================ */

window.refreshAxeusStore =
    async function () {

        await loadProducts();

        renderProducts();

        updateHeroStats();
    };

/* ============================================================
   CONVERTER NÚMERO
   ============================================================ */

function toNumber(
    value
) {

    if (
        typeof value ===
        "number" &&
        Number.isFinite(value)
    ) {

        return value;
    }

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return 0;
    }

    const normalized =
        String(value)
            .replace(
                /\./g,
                ""
            )
            .replace(
                ",",
                "."
            );

    const number =
        Number(
            normalized
        );

    return Number.isFinite(
        number
    )
        ? number
        : 0;
}

/* ============================================================
   FORMATAR NÚMERO
   ============================================================ */

function formatNumber(
    value
) {

    return new Intl.NumberFormat(
        "pt-BR"
    ).format(
        Math.max(
            0,
            Math.round(
                toNumber(value)
            )
        )
    );
}

/* ============================================================
   FORMATAR PREÇO
   ============================================================ */

function formatPrice(
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "";
    }

    const stringValue =
        String(value).trim();

    if (
        stringValue
            .toUpperCase()
            .includes("R$")
    ) {

        return stringValue;
    }

    const number =
        Number(
            stringValue
                .replace(
                    /[^\d,.-]/g,
                    ""
                )
                .replace(
                    /\./g,
                    ""
                )
                .replace(
                    ",",
                    "."
                )
        );

    if (
        Number.isFinite(
            number
        )
    ) {

        return number.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );
    }

    return stringValue;
}

/* ============================================================
   NORMALIZAR CATEGORIA
   ============================================================ */

function normalizeCategory(
    category
) {

    if (!category) {
        return "OUTROS";
    }

    const value =
        String(category)
            .trim()
            .toUpperCase();

    const aliases = {

        "TIKTOK":
            "TIKTOK SHOP",

        "TIKTOK SHOP":
            "TIKTOK SHOP",

        "PC":
            "PC",

        "COMPUTADOR":
            "PC",

        "ENTRETENIMENTO":
            "ENTRETENIMENTO",

        "STREAMING":
            "ENTRETENIMENTO",

        "APLICATIVO":
            "APLICATIVOS",

        "APLICATIVOS":
            "APLICATIVOS",

        "APP":
            "APLICATIVOS",

        "APPS":
            "APLICATIVOS",

        "TODOS":
            "TODOS"
    };

    return aliases[value] ||
        value;
}

/* ============================================================
   NORMALIZAR STATUS
   ============================================================ */

function normalizeStatus(
    status
) {

    if (!status) {
        return "active";
    }

    const value =
        String(status)
            .trim()
            .toLowerCase();

    if (
        value ===
            "coming-soon" ||

        value ===
            "comingsoon" ||

        value ===
            "em breve" ||

        value ===
            "breve"
    ) {

        return "coming-soon";
    }

    return "active";
}

/* ============================================================
   CRIAR ID
   ============================================================ */

function createProductId(
    name
) {

    return String(name)

        .toLowerCase()

        .normalize("NFD")

        .replace(
            /[\u0300-\u036f]/g,
            ""
        )

        .replace(
            /[^a-z0-9]+/g,
            "-"
        )

        .replace(
            /^-+|-+$/g,
            ""
        )

        .substring(
            0,
            60
        )

        +
        "-" +
        Date.now();
}

/* ============================================================
   ESCAPAR HTML
   ============================================================ */

function escapeHTML(
    value
) {

    return String(
        value || ""
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

/* ============================================================
   API GLOBAL DA AXEUS
   ============================================================ */

window.AxeusStore = {

    getProducts:
        function () {

            return [
                ...allProducts
            ];
        },

    refresh:
        async function () {

            await loadProducts();

            renderProducts();

            updateHeroStats();
        },

    registerClick:
        function (productId) {

            registerProductView(
                productId
            );
        },

    openProductDetails:
        function (productId) {

            const product =
                allProducts.find(
                    item =>
                        String(
                            item.id
                        ) ===
                        String(
                            productId
                        )
                );

            if (product) {

                openProductDetails(
                    product
                );
            }
        },

    closeProductDetails:
        function () {

            closeProductDetails();
        },

    getStorageKey:
        function () {

            return STORAGE_KEY;
        },

    getSupabaseUrl:
        function () {

            return SUPABASE_URL;
        }
};
