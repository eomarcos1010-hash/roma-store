/* ============================================================
   AXEUS STORE
   SCRIPT PRINCIPAL
   ============================================================ */

"use strict";


/* ============================================================
   CONFIGURAÇÃO
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
   Usados somente se o Admin ainda não tiver criado produtos.
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

document.addEventListener("DOMContentLoaded", function () {

    productsGrid =
        document.getElementById("products-grid");

    emptyProducts =
        document.getElementById("empty-products");

    heroProductsCount =
        document.getElementById("hero-products-count");

    heroClicksCount =
        document.getElementById("hero-clicks-count");


    initializeStore();

});


/* ============================================================
   INICIALIZAR LOJA
   ============================================================ */

function initializeStore() {

    loadProducts();

    setupFilters();

    renderProducts();

    updateHeroStats();

    setupStorageListener();

}


/* ============================================================
   CARREGAR PRODUTOS
   ============================================================ */

function loadProducts() {

    let savedProducts = null;

    /*
     * Primeiro tenta a chave principal.
     */

    try {

        const data =
            localStorage.getItem(STORAGE_KEY);

        if (data) {

            savedProducts =
                JSON.parse(data);

        }

    } catch (error) {

        console.error(
            "Erro ao carregar produtos:",
            error
        );

    }


    /*
     * Se não encontrou, tenta chaves antigas.
     */

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

                    savedProducts = parsed;

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


    /*
     * Se o Admin ainda não criou produtos,
     * cria os produtos iniciais.
     */

    if (!Array.isArray(savedProducts)) {

        allProducts =
            normalizeProducts(DEFAULT_PRODUCTS);

        saveProducts();

        return;
    }


    allProducts =
        normalizeProducts(savedProducts);

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


            /*
             * ID
             */

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


            /*
             * Nome
             */

            normalized.name =
                String(
                    normalized.name ||
                    normalized.title ||
                    `Produto ${index + 1}`
                );


            /*
             * Descrição
             */

            normalized.description =
                String(
                    normalized.description ||
                    normalized.desc ||
                    "Produto digital AXEUS."
                );


            /*
             * Categoria
             */

            normalized.category =
                normalizeCategory(
                    normalized.category ||
                    normalized.categoryName ||
                    "OUTROS"
                );


            /*
             * Imagem
             */

            normalized.image =
                normalized.image ||
                normalized.imageUrl ||
                normalized.photo ||
                "";


            /*
             * Link de compra
             */

            normalized.checkout =
                normalized.checkout ||
                normalized.buyLink ||
                normalized.paymentLink ||
                normalized.link ||
                "";


            normalized.link =
                normalized.link ||
                normalized.checkout ||
                "";


            /*
             * Cliques
             */

            normalized.clicks =
                toNumber(
                    normalized.clicks
                );


            /*
             * Vendidos
             *
             * Se o Admin já usa "sold", mantém.
             */

            normalized.sold =
                toNumber(
                    normalized.sold
                );


            /*
             * Status
             */

            normalized.status =
                normalizeStatus(
                    normalized.status
                );


            /*
             * Preço
             */

            normalized.price =
                normalized.price == null
                    ? ""
                    : String(normalized.price);


            return normalized;

        });

}


/* ============================================================
   SALVAR PRODUTOS
   ============================================================ */

function saveProducts() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(allProducts)
        );

    } catch (error) {

        console.error(
            "Erro ao salvar produtos:",
            error
        );

    }

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


    /*
     * Aplicar filtro
     */

    if (currentFilter !== "TODOS") {

        products =
            products.filter(product => {

                return normalizeCategory(
                    product.category
                ) === currentFilter;

            });

    }


    /*
     * Limpar grid
     */

    productsGrid.innerHTML = "";


    /*
     * Nenhum produto
     */

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


    /*
     * Criar cards
     */

    products.forEach(product => {

        const card =
            createProductCard(product);

        productsGrid.appendChild(card);

    });


    /*
     * Atualizar estatísticas
     */

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


    /*
     * Clique no card
     */

    card.addEventListener(
        "click",
        function (event) {

            /*
             * Se clicou em botão ou link,
             * não conta novamente.
             */

            if (
                event.target.closest(
                    ".product-buy-button"
                ) ||
                event.target.closest(
                    "a"
                )
            ) {

                return;
            }


            registerClick(product.id);

        }
    );


    /*
     * IMAGEM
     */

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


    /*
     * BADGE DA CATEGORIA
     */

    const categoryBadge =
        document.createElement("span");

    categoryBadge.className =
        "product-category";

    categoryBadge.textContent =
        product.category;


    imageWrapper.appendChild(
        categoryBadge
    );


    /*
     * CONTEÚDO
     */

    const content =
        document.createElement("div");

    content.className =
        "product-content";


    /*
     * Título
     */

    const title =
        document.createElement("h3");

    title.className =
        "product-title";

    title.textContent =
        product.name;


    /*
     * Descrição
     */

    const description =
        document.createElement("p");

    description.className =
        "product-description";

    description.textContent =
        product.description;


    /*
     * Rodapé
     */

    const footer =
        document.createElement("div");

    footer.className =
        "product-footer";


    /*
     * Informações
     */

    const info =
        document.createElement("div");

    info.className =
        "product-info";


    /*
     * Preço
     */

    if (product.price) {

        const price =
            document.createElement("strong");

        price.className =
            "product-price";

        price.textContent =
            formatPrice(product.price);

        info.appendChild(
            price
        );

    }


    /*
     * Contador
     */

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


    /*
     * BOTÃO
     */

    const button =
        document.createElement("a");

    button.className =
        "product-buy-button";


    /*
     * Produto em breve
     */

    if (
        normalizeStatus(
            product.status
        ) === "coming-soon"
    ) {

        button.href =
            "javascript:void(0)";

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

    /*
     * Produto disponível
     */

    else if (
        product.checkout ||
        product.link
    ) {

        button.href =
            product.checkout ||
            product.link;

        button.target =
            "_blank";

        button.rel =
            "noopener noreferrer";

        button.textContent =
            "Comprar";


        /*
         * Clique no botão não conta
         * como clique no card.
         */

        button.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

            }
        );

    }

    /*
     * Sem link
     */

    else {

        button.href =
            "javascript:void(0)";

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

            }
        );

    }


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


    /*
     * Classes adicionais
     */

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
   PLACEHOLDER DA IMAGEM
   ============================================================ */

function createProductPlaceholder(name) {

    const letter =
        String(name || "A")
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

function registerClick(productId) {

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
     * Incrementa clique.
     */

    product.clicks =
        toNumber(product.clicks) + 1;


    /*
     * O contador visual da loja
     * também aumenta.
     *
     * Isso mantém compatibilidade
     * com a lógica antiga da loja.
     */

    product.sold =
        toNumber(product.sold) + 1;


    saveProducts();


    /*
     * Atualizar somente o card
     * sem precisar recarregar página.
     */

    updateProductCounter(
        product
    );


    updateHeroStats();


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
   ATUALIZAR CONTADOR DO CARD
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

    /*
     * Se existe sold, utiliza sold.
     *
     * Isso preserva os números originais
     * dos produtos da loja.
     */

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
            formatNumber(total);

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


            /*
             * Recarrega os produtos
             * quando o Admin alterar
             * o localStorage.
             */

            loadProducts();

            renderProducts();

            updateHeroStats();

        }
    );


    /*
     * Evento personalizado para quando
     * o Admin estiver na mesma página.
     */

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
   FUNÇÃO PARA FORÇAR ATUALIZAÇÃO
   ============================================================ */

window.refreshAxeusStore =
    function () {

        loadProducts();

        renderProducts();

        updateHeroStats();

    };


/* ============================================================
   FUNÇÕES AUXILIARES
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
        String(value)
            .trim();


    /*
     * Se já contém R$,
     * não adiciona novamente.
     */

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

    if (
        !category
    ) {

        return "OUTROS";

    }


    const value =
        String(category)
            .trim()
            .toUpperCase();


    const aliases = {

        "TIKTOK": "TIKTOK SHOP",
        "TIKTOK SHOP": "TIKTOK SHOP",

        "PC": "PC",
        "COMPUTADOR": "PC",

        "ENTRETENIMENTO": "ENTRETENIMENTO",
        "STREAMING": "ENTRETENIMENTO",

        "APLICATIVO": "APLICATIVOS",
        "APLICATIVOS": "APLICATIVOS",
        "APP": "APLICATIVOS",
        "APPS": "APLICATIVOS",

        "TODOS": "TODOS"

    };


    return aliases[value] ||
        value;

}


/* ============================================================
   NORMALIZAR STATUS
   ============================================================ */

function normalizeStatus(status) {

    if (
        !status
    ) {

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
        +
        "-" +
        Date.now();

}


/* ============================================================
   ESCAPAR HTML
   ============================================================ */

function escapeHTML(value) {

    return String(value || "")
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

        return [...allProducts];

    },

    refresh: function () {

        loadProducts();

        renderProducts();

        updateHeroStats();

    },

    registerClick: function (productId) {

        registerClick(productId);

    },

    getStorageKey: function () {

        return STORAGE_KEY;

    }

};