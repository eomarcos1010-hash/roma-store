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
        checkout: "https://pay.cakto.com.br/3erj75x_1080094",
        link: "https://pay.cakto.com.br/3erj75x_1080094",
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
        checkout: "https://pay.cakto.com.br/szk82cw_1007831",
        link: "https://pay.cakto.com.br/szk82cw_1007831",
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
        checkout: "https://pay.cakto.com.br/po9btzm_997956",
        link: "https://pay.cakto.com.br/po9btzm_997956",
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
        checkout: "https://pay.cakto.com.br/r9phmxw_864564",
        link: "https://pay.cakto.com.br/r9phmxw_864564",
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
   ELEMENTOS DOS DETALHES
   ============================================================ */

let productDetailsModal;


/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */

document.addEventListener("DOMContentLoaded", async function () {

    productsGrid =
        document.getElementById("products-grid");

    emptyProducts =
        document.getElementById("empty-products");

    heroProductsCount =
        document.getElementById("hero-products-count");

    heroClicksCount =
        document.getElementById("hero-clicks-count");


    /*
     * Cria a área de detalhes automaticamente.
     * Assim não é necessário criar outro HTML.
     */

    createProductDetails();


    await initializeStore();
});


/* ============================================================
   INICIALIZAR LOJA
   ============================================================ */

async function initializeStore() {

    await loadProducts();

    setupFilters();

    renderProducts();

    updateHeroStats();

    setupStorageListener();

    /*
     * Atualiza os produtos periodicamente.
     * Isso permite que alterações feitas no
     * dashboard apareçam na loja.
     */

    setInterval(async function () {

        await loadProducts();

        renderProducts();

        updateHeroStats();

    }, 30000);
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

                    /*
                     * A chave publishable é enviada pelo
                     * header apikey. Não utiliza Bearer.
                     */

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

    /*
     * Primeiro tenta Supabase.
     */

    try {

        const data =
            await supabaseRequest(
                "products?select=*"
            );


        if (Array.isArray(data)) {

            allProducts =
                normalizeProducts(data);


            /*
             * Guarda uma cópia local apenas como
             * fallback/offline.
             */

            saveLocalCache();

            return;
        }

    } catch (error) {

        console.error(
            "Erro ao carregar produtos do Supabase:",
            error
        );
    }


    /*
     * Se Supabase falhar, usa cache local.
     */

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
                    localStorage.getItem(key);

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


    /*
     * Último fallback:
     * produtos padrão.
     */

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
            JSON.stringify(allProducts)
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
        .filter(product => product)
        .map((product, index) => {

            const normalized = {
                ...product
            };


            /* ID */

            if (
                !normalized.id ||
                String(normalized.id).trim() === ""
            ) {

                normalized.id =
                    createProductId(
                        normalized.name ||
                        `produto-${index + 1}`
                    );
            }


            /* NOME */

            normalized.name =
                String(
                    normalized.name ||
                    normalized.title ||
                    `Produto ${index + 1}`
                );


            /* DESCRIÇÃO */

            normalized.description =
                String(
                    normalized.description ||
                    normalized.desc ||
                    "Produto digital AXEUS."
                );


            /* CATEGORIA */

            normalized.category =
                normalizeCategory(
                    normalized.category ||
                    normalized.categoryName ||
                    "OUTROS"
                );


            /* IMAGEM */

            normalized.image =
                normalized.image ||
                normalized.imageUrl ||
                normalized.photo ||
                "";


            /* LINK DE COMPRA */

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


            /* CLIQUES */

            normalized.clicks =
                toNumber(
                    normalized.clicks
                );


            /* VENDIDOS */

            normalized.sold =
                toNumber(
                    normalized.sold
                );


            /* STATUS */

            normalized.status =
                normalizeStatus(
                    normalized.status
                );


            /* PREÇO */

            normalized.price =
                normalized.price == null
                    ? ""
                    : String(normalized.price);


            return normalized;
        });
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
        value = markdownMatch[1];
    }


    value =
        value.replace(/\s+/g, "");


    return value;
}


/* ============================================================
   SALVAR PRODUTOS
   ============================================================ */

async function saveProducts() {

    /*
     * Mantém cache local.
     */

    saveLocalCache();


    /*
     * O dashboard será responsável pelas
     * alterações principais no Supabase.
     */

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


    filterButtons.forEach(button => {

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
    });
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


    if (currentFilter !== "TODOS") {

        products =
            products.filter(product => {

                return normalizeCategory(
                    product.category
                ) === currentFilter;
            });
    }


    productsGrid.innerHTML = "";


    if (products.length === 0) {

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


    products.forEach(product => {

        const card =
            createProductCard(product);

        productsGrid.appendChild(card);
    });


    updateHeroStats();
}


/* ============================================================
   CRIAR CARD DO PRODUTO
   ============================================================ */

function createProductCard(product) {

    const card =
        document.createElement("article");


    card.className =
        "product-card";


    card.dataset.productId =
        product.id;


    /* ========================================================
       CLIQUE NO CARD
       ======================================================== */

    card.addEventListener(
        "click",
        function (event) {

            /*
             * Se clicou no botão Comprar,
             * deixa o link funcionar normalmente.
             */

            if (
                event.target.closest(
                    ".product-buy-button"
                )
            ) {
                return;
            }


            if (
                event.target.closest("a")
            ) {
                return;
            }


            /*
             * Registra o clique.
             */

            registerClick(
                product.id
            );


            /*
             * Agora abre os detalhes em vez
             * de mandar diretamente para o checkout.
             */

            openProductDetails(product);
        }
    );


    /* ========================================================
       IMAGEM
       ======================================================== */

    const imageWrapper =
        document.createElement("div");


    imageWrapper.className =
        "product-image";


    if (product.image) {

        const image =
            document.createElement("img");


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


                imageWrapper.innerHTML +=
                    createProductPlaceholder(
                        product.name
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
       BADGE
       ======================================================== */

    const categoryBadge =
        document.createElement("span");


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
        document.createElement("div");


    content.className =
        "product-content";


    /* TÍTULO */

    const title =
        document.createElement("h3");


    title.className =
        "product-title";


    title.textContent =
        product.name;


    /* DESCRIÇÃO */

    const description =
        document.createElement("p");


    description.className =
        "product-description";


    description.textContent =
        product.description;


    /* ========================================================
       RODAPÉ
       ======================================================== */

    const footer =
        document.createElement("div");


    footer.className =
        "product-footer";


    /* ========================================================
       INFORMAÇÕES
       ======================================================== */

    const info =
        document.createElement("div");


    info.className =
        "product-info";


    /* PREÇO */

    if (product.price) {

        const price =
            document.createElement("strong");


        price.className =
            "product-price";


        price.textContent =
            formatPrice(
                product.price
            );


        info.appendChild(
            price
        );
    }


    /* VENDIDOS */

    const sold =
        document.createElement("span");


    sold.className =
        "product-sold";


    sold.dataset.soldFor =
        product.id;


    sold.textContent =
        formatNumber(
            getDisplayedCount(product)
        ) +
        " vendidos";


    info.appendChild(
        sold
    );


    /* ========================================================
       BOTÃO COMPRAR
       ======================================================== */

    const button =
        document.createElement("a");


    button.className =
        "product-buy-button";


    /* ========================================================
       PRODUTO EM BREVE
       ======================================================== */

    if (
        normalizeStatus(
            product.status
        ) === "coming-soon"
    ) {

        button.href =
            "#";


        button.classList.add(
            "coming-soon"
        );


        button.textContent =
            "Em breve";


        button.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();
            }
        );
    }


    /* ========================================================
       PRODUTO DISPONÍVEL
       ======================================================== */

    else {

        const productLink =
            getProductLink(product);


        if (productLink) {

            button.href =
                productLink;


            button.target =
                "_blank";


            button.rel =
                "noopener noreferrer";


            button.textContent =
                "Comprar";


            button.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    registerClick(
                        product.id
                    );
                }
            );

        } else {

            button.href =
                "#";


            button.textContent =
                "Ver produto";


            button.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();

                    registerClick(
                        product.id
                    );

                    openProductDetails(
                        product
                    );
                }
            );
        }
    }


    /* ========================================================
       MONTAR CARD
       ======================================================== */

    footer.appendChild(
        info
    );


    footer.appendChild(
        button
    );


    content.appendChild(
        title
    );


    content.appendChild(
        description
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


    if (
        normalizeStatus(
            product.status
        ) === "coming-soon"
    ) {

        card.classList.add(
            "product-coming-soon"
        );
    }


    return card;
}


/* ============================================================
   CRIAR ÁREA DE DETALHES
   ============================================================ */

function createProductDetails() {

    /*
     * Evita criar duas vezes.
     */

    if (
        document.getElementById(
            "productDetailsModal"
        )
    ) {

        productDetailsModal =
            document.getElementById(
                "productDetailsModal"
            );

        return;
    }


    const modal =
        document.createElement("div");


    modal.id =
        "productDetailsModal";


    modal.className =
        "product-details-modal";


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    modal.innerHTML = `

        <div class="product-details-backdrop"></div>

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
                aria-label="Fechar"
            >
                ×
            </button>


            <div class="product-details-image-wrapper">

                <img
                    id="productDetailsImage"
                    class="product-details-image"
                    src=""
                    alt=""
                >

                <div
                    id="productDetailsPlaceholder"
                    class="product-details-placeholder"
                >
                </div>

            </div>


            <div class="product-details-content">

                <span
                    id="productDetailsCategory"
                    class="product-details-category"
                >
                </span>


                <h2
                    id="productDetailsTitle"
                    class="product-details-title"
                >
                </h2>


                <div class="product-details-meta">

                    <div class="product-details-price-box">

                        <span>
                            PREÇO
                        </span>

                        <strong
                            id="productDetailsPrice"
                        >
                        </strong>

                    </div>


                    <div class="product-details-sold-box">

                        <span>
                            VENDIDOS
                        </span>

                        <strong
                            id="productDetailsSold"
                        >
                        </strong>

                    </div>

                </div>


                <div class="product-details-description-box">

                    <span>
                        SOBRE O PRODUTO
                    </span>

                    <p
                        id="productDetailsDescription"
                    >
                    </p>

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


    productDetailsModal =
        modal;


    /* ========================================================
       FECHAR
       ======================================================== */

    const closeButton =
        document.getElementById(
            "productDetailsClose"
        );


    const backdrop =
        modal.querySelector(
            ".product-details-backdrop"
        );


    closeButton.addEventListener(
        "click",
        closeProductDetails
    );


    backdrop.addEventListener(
        "click",
        closeProductDetails
    );


    /*
     * ESC fecha o detalhe.
     */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                modal.classList.contains("active")
            ) {

                closeProductDetails();
            }
        }
    );
}


/* ============================================================
   ABRIR DETALHES
   ============================================================ */

function openProductDetails(product) {

    if (!product) {
        return;
    }


    /*
     * Garante que o modal existe.
     */

    if (!productDetailsModal) {
        createProductDetails();
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

    category.textContent =
        product.category;


    /* ========================================================
       TÍTULO
       ======================================================== */

    title.textContent =
        product.name;


    /* ========================================================
       PREÇO
       ======================================================== */

    if (product.price) {

        price.textContent =
            formatPrice(
                product.price
            );

    } else {

        price.textContent =
            "Em breve";
    }


    /* ========================================================
       VENDIDOS
       ======================================================== */

    sold.textContent =
        formatNumber(
            getDisplayedCount(product)
        );


    /* ========================================================
       DESCRIÇÃO
       ======================================================== */

    description.textContent =
        product.description;


    /* ========================================================
       IMAGEM
       ======================================================== */

    if (product.image) {

        image.src =
            product.image;


        image.alt =
            product.name;


        image.style.display =
            "block";


        placeholder.innerHTML =
            "";


        image.onerror =
            function () {

                image.style.display =
                    "none";


                placeholder.innerHTML =
                    createProductPlaceholder(
                        product.name
                    );
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
    }


    /* ========================================================
       BOTÃO DE COMPRA
       ======================================================== */

    const productLink =
        getProductLink(product);


    if (
        normalizeStatus(
            product.status
        ) === "coming-soon"
    ) {

        buyButton.href =
            "#";


        buyButton.textContent =
            "EM BREVE";


        buyButton.classList.add(
            "disabled"
        );


        buyButton.onclick =
            function (event) {

                event.preventDefault();
            };

    } else if (productLink) {

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


        buyButton.onclick =
            function () {

                registerClick(
                    product.id
                );
            };

    } else {

        buyButton.href =
            "#";


        buyButton.textContent =
            "LINK INDISPONÍVEL";


        buyButton.classList.add(
            "disabled"
        );


        buyButton.onclick =
            function (event) {

                event.preventDefault();
            };
    }


    /* ========================================================
       ABRIR MODAL
       ======================================================== */

    productDetailsModal.classList.add(
        "active"
    );


    productDetailsModal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "product-details-open"
    );


    /*
     * Volta para o topo do detalhe.
     */

    const container =
        productDetailsModal.querySelector(
            ".product-details-container"
        );


    if (container) {
        container.scrollTop = 0;
    }
}


/* ============================================================
   FECHAR DETALHES
   ============================================================ */

function closeProductDetails() {

    if (!productDetailsModal) {
        return;
    }


    productDetailsModal.classList.remove(
        "active"
    );


    productDetailsModal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "product-details-open"
    );
}


/* ============================================================
   OBTER LINK DO PRODUTO
   ============================================================ */

function getProductLink(product) {

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


    return checkout || link || "";
}


/* ============================================================
   PLACEHOLDER
   ============================================================ */

function createProductPlaceholder(name) {

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
   REGISTRAR CLIQUE
   ============================================================ */

async function registerClick(productId) {

    const product =
        allProducts.find(
            item =>
                String(item.id) ===
                String(productId)
        );


    if (!product) {
        return;
    }


    /*
     * Incrementa localmente imediatamente.
     */

    product.clicks =
        toNumber(
            product.clicks
        ) + 1;


    /*
     * Mantém exatamente o comportamento
     * antigo do seu site.
     */

    product.sold =
        toNumber(
            product.sold
        ) + 1;


    /*
     * Atualiza visual.
     */

    updateProductCounter(
        product
    );


    updateHeroStats();


    /*
     * Salva cache local.
     */

    saveLocalCache();


    /*
     * Atualiza diretamente o Supabase.
     */

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
                        product.clicks,

                    sold:
                        product.sold
                })
            }
        );

    } catch (error) {

        console.error(
            "Erro ao registrar clique no Supabase:",
            error
        );
    }


    /*
     * Evento personalizado.
     */

    window.dispatchEvent(
        new CustomEvent(
            "axeusProductClick",
            {
                detail: product
            }
        )
    );
}


/* ============================================================
   ATUALIZAR CONTADOR
   ============================================================ */

function updateProductCounter(product) {

    const counter =
        document.querySelector(
            `[data-sold-for="${CSS.escape(
                String(product.id)
            )}"]`
        );


    if (!counter) {
        return;
    }


    counter.textContent =
        formatNumber(
            getDisplayedCount(product)
        ) +
        " vendidos";
}


/* ============================================================
   CONTADOR EXIBIDO
   ============================================================ */

function getDisplayedCount(product) {

    if (
        Number.isFinite(
            Number(product.sold)
        )
    ) {

        return Number(
            product.sold
        );
    }


    return Number(
        product.clicks || 0
    );
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
                (sum, product) => {

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
   SINCRONIZAÇÃO ENTRE ABAS
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
   FORÇAR ATUALIZAÇÃO
   ============================================================ */

window.refreshAxeusStore =
    async function () {

        await loadProducts();

        renderProducts();

        updateHeroStats();
    };


/* ============================================================
   CONVERTER PARA NÚMERO
   ============================================================ */

function toNumber(value) {

    if (
        typeof value === "number" &&
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
            .replace(/\./g, "")
            .replace(",", ".");


    const number =
        Number(normalized);


    return Number.isFinite(number)
        ? number
        : 0;
}


/* ============================================================
   FORMATAR NÚMEROS
   ============================================================ */

function formatNumber(value) {

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

function formatPrice(value) {

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
                .replace(/[^\d,.-]/g, "")
                .replace(/\./g, "")
                .replace(",", ".")
        );


    if (
        Number.isFinite(number)
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

function normalizeCategory(category) {

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

function normalizeStatus(status) {

    if (!status) {
        return "active";
    }


    const value =
        String(status)
            .trim()
            .toLowerCase();


    if (
        value === "coming-soon" ||
        value === "comingsoon" ||
        value === "em breve" ||
        value === "breve"
    ) {

        return "coming-soon";
    }


    return "active";
}


/* ============================================================
   CRIAR ID
   ============================================================ */

function createProductId(name) {

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

        + "-" +
        Date.now();
}


/* ============================================================
   ESCAPAR HTML
   ============================================================ */

function escapeHTML(value) {

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
   DISPONIBILIZAR FUNÇÕES GLOBALMENTE
   ============================================================ */

window.AxeusStore = {

    getProducts: function () {

        return [
            ...allProducts
        ];
    },


    refresh: async function () {

        await loadProducts();

        renderProducts();

        updateHeroStats();
    },


    registerClick: function (productId) {

        registerClick(
            productId
        );
    },


    getStorageKey: function () {

        return STORAGE_KEY;
    },


    getSupabaseUrl: function () {

        return SUPABASE_URL;
    },


    openProductDetails: function (productId) {

        const product =
            allProducts.find(
                item =>
                    String(item.id) ===
                    String(productId)
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
        }
};
