/* =====================================================
   GYROPOS V2
   Sistem Kasir Sederhana
===================================================== */


/* =====================================================
   DATA
===================================================== */

let products = [

    {
        id: "P001",
        barcode: "899100000001",
        name: "Indomie Goreng",
        price: 3500,
        stock: 20
    },

    {
        id: "P002",
        barcode: "899100000002",
        name: "Aqua 600ml",
        price: 3000,
        stock: 15
    },

    {
        id: "P003",
        barcode: "899100000003",
        name: "Kopi Sachet",
        price: 2000,
        stock: 30
    },

    {
        id: "P004",
        barcode: "899100000004",
        name: "Teh Botol",
        price: 4000,
        stock: 12
    }

];


let cart = [];

let transactions = [];


/* =====================================================
   HELPER
===================================================== */

function rupiah(value) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }
    ).format(value);

}


function getProduct(id) {

    return products.find(
        product => product.id === id
    );

}


/* =====================================================
   JAM
===================================================== */

function updateClock() {

    const now = new Date();

    document.getElementById(
        "clock"
    ).textContent =
        now.toLocaleString(
            "id-ID",
            {
                dateStyle: "short",
                timeStyle: "short"
            }
        );

}


setInterval(
    updateClock,
    1000
);

updateClock();


/* =====================================================
   NAVIGASI
===================================================== */

document.querySelectorAll(
    ".menu-btn"
).forEach(button => {

    button.addEventListener(
        "click",
        () => {

            document.querySelectorAll(
                ".menu-btn"
            ).forEach(btn => {

                btn.classList.remove(
                    "active"
                );

            });


            document.querySelectorAll(
                ".page"
            ).forEach(page => {

                page.classList.remove(
                    "active"
                );

            });


            button.classList.add(
                "active"
            );


            const page =
                document.getElementById(
                    button.dataset.page
                );


            page.classList.add(
                "active"
            );

        }
    );

});


/* =====================================================
   PRODUK
===================================================== */

function renderProducts() {

    const keyword =
        document.getElementById(
            "searchProduct"
        ).value
        .toLowerCase()
        .trim();


    const container =
        document.getElementById(
            "productList"
        );


    container.innerHTML = "";


    const result =
        products.filter(product => {

            return (

                product.name
                    .toLowerCase()
                    .includes(keyword)

                ||

                product.id
                    .toLowerCase()
                    .includes(keyword)

                ||

                product.barcode
                    .includes(keyword)

            );

        });


    if (result.length === 0) {

        container.innerHTML = `
            <div class="card empty">
                Produk tidak ditemukan.
            </div>
        `;

        return;
    }


    result.forEach(product => {

        const div =
            document.createElement(
                "div"
            );


        div.className =
            "product";


        div.innerHTML = `

            <div class="product-name">
                ${escapeHTML(product.name)}
            </div>

            <div class="product-price">
                ${rupiah(product.price)}
            </div>

            <div class="product-stock
                ${product.stock <= 0
                    ? "out"
                    : ""}">

                Stok: ${product.stock}

            </div>

        `;


        div.addEventListener(
            "click",
            () => addToCart(product.id)
        );


        container.appendChild(div);

    });

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent = text;

    return div.innerHTML;

}


/* =====================================================
   KERANJANG
===================================================== */

function addToCart(id) {

    const product =
        getProduct(id);


    if (!product) {
        return;
    }


    if (product.stock <= 0) {

        alert(
            "Stok produk habis."
        );

        return;
    }


    const existing =
        cart.find(
            item => item.id === id
        );


    if (existing) {

        if (
            existing.qty >=
            product.stock
        ) {

            alert(
                "Jumlah melebihi stok."
            );

            return;
        }


        existing.qty++;

    } else {

        cart.push({

            id: product.id,

            name: product.name,

            price: product.price,

            qty: 1

        });

    }


    renderCart();

}


/* =====================================================
   RENDER KERANJANG
===================================================== */

function renderCart() {

    const container =
        document.getElementById(
            "cartList"
        );


    container.innerHTML = "";


    if (cart.length === 0) {

        container.innerHTML = `
            <div class="empty">
                Keranjang masih kosong
            </div>
        `;

        calculateTotal();

        return;
    }


    cart.forEach(item => {

        const product =
            getProduct(item.id);


        const div =
            document.createElement(
                "div"
            );


        div.className =
            "cart-item";


        div.innerHTML = `

            <div class="cart-row">

                <div>

                    <div class="cart-name">
                        ${escapeHTML(item.name)}
                    </div>

                    <div class="cart-price">
                        ${rupiah(item.price)}
                    </div>

                </div>

                <strong>
                    ${rupiah(
                        item.price * item.qty
                    )}
                </strong>

            </div>


            <div class="qty">

                <button
                    data-action="minus">
                    −
                </button>

                <strong>
                    ${item.qty}
                </strong>

                <button
                    data-action="plus">
                    +
                </button>

                <button
                    data-action="remove">
                    🗑
                </button>

            </div>

        `;


        div.querySelector(
            '[data-action="minus"]'
        ).onclick = () =>
            changeQty(
                item.id,
                -1
            );


        div.querySelector(
            '[data-action="plus"]'
        ).onclick = () =>
            changeQty(
                item.id,
                1
            );


        div.querySelector(
            '[data-action="remove"]'
        ).onclick = () =>
            removeFromCart(
                item.id
            );


        container.appendChild(div);

    });


    calculateTotal();

}


/* =====================================================
   UBAH QTY
===================================================== */

function changeQty(
    id,
    amount
) {

    const item =
        cart.find(
            item => item.id === id
        );


    const product =
        getProduct(id);


    if (!item || !product) {
        return;
    }


    const newQty =
        item.qty + amount;


    if (newQty <= 0) {

        removeFromCart(id);

        return;
    }


    if (
        newQty >
        product.stock
    ) {

        alert(
            "Stok tidak mencukupi."
        );

        return;
    }


    item.qty =
        newQty;


    renderCart();

}


/* =====================================================
   HAPUS KERANJANG
===================================================== */

function removeFromCart(id) {

    cart =
        cart.filter(
            item => item.id !== id
        );


    renderCart();

}


/* =====================================================
   TOTAL
===================================================== */

function calculateTotal() {

    let subtotal = 0;


    cart.forEach(item => {

        subtotal +=
            item.price *
            item.qty;

    });


    let discount =
        Number(
            document.getElementById(
                "discount"
            ).value
        ) || 0;


    /*
       Diskon tidak boleh
       lebih besar dari subtotal.
    */

    discount =
        Math.min(
            Math.max(
                0,
                discount
            ),
            subtotal
        );


    const total =
        subtotal -
        discount;


    document.getElementById(
        "subtotal"
    ).textContent =
        rupiah(subtotal);


    document.getElementById(
        "total"
    ).textContent =
        rupiah(total);


    calculateChange();

}


/* =====================================================
   KEMBALIAN
===================================================== */

function calculateChange() {

    const total =
        getCurrentTotal();


    const payment =
        Number(
            document.getElementById(
                "payment"
            ).value
        ) || 0;


    const change =
        Math.max(
            0,
            payment - total
        );


    document.getElementById(
        "change"
    ).textContent =
        rupiah(change);

}


function getCurrentTotal() {

    let subtotal = 0;


    cart.forEach(item => {

        subtotal +=
            item.price *
            item.qty;

    });


    const discount =
        Math.min(

            Math.max(

                Number(
                    document.getElementById(
                        "discount"
                    ).value
                ) || 0,

                0

            ),

            subtotal

        );


    return subtotal -
        discount;

}


/* =====================================================
   PEMBAYARAN
===================================================== */

function processPayment() {

    if (cart.length === 0) {

        alert(
            "Keranjang masih kosong."
        );

        return;
    }


    const total =
        getCurrentTotal();


    const payment =
        Number(
            document.getElementById(
                "payment"
            ).value
        ) || 0;


    const method =
        document.getElementById(
            "paymentMethod"
        ).value;


    if (payment < total) {

        alert(
            "Jumlah pembayaran belum cukup."
        );

        return;
    }


    /*
       Kurangi stok
    */

    cart.forEach(item => {

        const product =
            getProduct(item.id);


        if (product) {

            product.stock -=
                item.qty;

        }

    });


    const transaction = {

        id:
            generateTransactionID(),

        date:
            new Date()
                .toISOString(),

        items:
            JSON.parse(
                JSON.stringify(cart)
            ),

        total:
            total,

        payment:
            payment,

        change:
            payment - total,

        method:
            method

    };


    transactions.unshift(
        transaction
    );


    alert(
        "Transaksi berhasil!\n\n" +
        "Total: " +
        rupiah(total) +
        "\nBayar: " +
        rupiah(payment) +
        "\nKembali: " +
        rupiah(
            payment - total
        )
    );


    cart = [];


    document.getElementById(
        "payment"
    ).value = "";


    document.getElementById(
        "discount"
    ).value = 0;


    renderProducts();

    renderCart();

    renderInventory();

    renderTransactions();

    updateReport();

}


/* =====================================================
   ID TRANSAKSI
===================================================== */

function generateTransactionID() {

    const now =
        new Date();


    const date =
        now.getFullYear() +
        String(
            now.getMonth() + 1
        ).padStart(2, "0") +
        String(
            now.getDate()
        ).padStart(2, "0");


    const number =
        String(
            transactions.length + 1
        ).padStart(4, "0");


    return `TRX-${date}-${number}`;

}


/* =====================================================
   PRODUK BARU
===================================================== */

document.getElementById(
    "addProductButton"
).onclick = function () {

    const id =
        document.getElementById(
            "productCode"
        ).value.trim();


    const name =
        document.getElementById(
            "productName"
        ).value.trim();


    const price =
        Number(
            document.getElementById(
                "productPrice"
            ).value
        );


    const stock =
        Number(
            document.getElementById(
                "productStock"
            ).value
        );


    if (
        !id ||
        !name ||
        price <= 0 ||
        stock < 0
    ) {

        alert(
            "Data produk belum lengkap."
        );

        return;
    }


    if (
        products.some(
            product =>
                product.id === id
        )
    ) {

        alert(
            "Kode produk sudah digunakan."
        );

        return;
    }


    products.push({

        id: id,

        barcode: id,

        name: name,

        price: price,

        stock: stock

    });


    document.getElementById(
        "productCode"
    ).value = "";


    document.getElementById(
        "productName"
    ).value = "";


    document.getElementById(
        "productPrice"
    ).value = "";


    document.getElementById(
        "productStock"
    ).value = "";


    renderProducts();

    renderInventory();

    updateReport();

};


/* =====================================================
   INVENTORY
===================================================== */

function renderInventory() {

    const container =
        document.getElementById(
            "inventoryList"
        );


    container.innerHTML = "";


    products.forEach(product => {

        const row =
            document.createElement(
                "div"
            );


        row.className =
            "inventory";


        row.innerHTML = `

            <div>

                <div class="inventory-name">
                    ${escapeHTML(product.name)}
                </div>

                <div class="inventory-small">
                    ${product.id}
                </div>

            </div>


            <strong>
                ${rupiah(product.price)}
            </strong>


            <strong>
                Stok: ${product.stock}
            </strong>

        `;


        container.appendChild(row);

    });

}


/* =====================================================
   TRANSAKSI
===================================================== */

function renderTransactions() {

    const container =
        document.getElementById(
            "transactionList"
        );


    container.innerHTML = "";


    if (
        transactions.length === 0
    ) {

        container.innerHTML = `
            <div class="card empty">
                Belum ada transaksi.
            </div>
        `;

        return;
    }


    transactions.forEach(transaction => {

        const div =
            document.createElement(
                "div"
            );


        div.className =
            "transaction";


        const date =
            new Date(
                transaction.date
            );


        div.innerHTML = `

            <div class="transaction-header">

                <span class="transaction-id">
                    ${transaction.id}
                </span>

                <span>
                    ${date.toLocaleString(
                        "id-ID"
                    )}
                </span>

            </div>


            <p>
                ${transaction.items.length}
                jenis produk
            </p>


            <div class="transaction-header">

                <span>
                    ${transaction.method}
                </span>

                <strong class="transaction-total">
                    ${rupiah(
                        transaction.total
                    )}
                </strong>

            </div>

        `;


        container.appendChild(div);

    });

}


/* =====================================================
   PENCARIAN TRANSAKSI
===================================================== */

document.getElementById(
    "searchTransaction"
).addEventListener(
    "input",
    function () {

        const keyword =
            this.value
                .toLowerCase()
                .trim();


        document.querySelectorAll(
            ".transaction"
        ).forEach(transaction => {

            transaction.style.display =
                transaction.textContent
                    .toLowerCase()
                    .includes(keyword)
                    ? ""
                    : "none";

        });

    }
);


/* =====================================================
   LAPORAN
===================================================== */

function updateReport() {

    let sales = 0;


    transactions.forEach(
        transaction => {

            sales +=
                transaction.total;

        }
    );


    const lowStock =
        products.filter(
            product =>
                product.stock <= 5
        ).length;


    document.getElementById(
        "reportSales"
    ).textContent =
        rupiah(sales);


    document.getElementById(
        "reportTransactions"
    ).textContent =
        transactions.length;


    document.getElementById(
        "reportProducts"
    ).textContent =
        products.length;


    document.getElementById(
        "reportLowStock"
    ).textContent =
        lowStock;


    document.getElementById(
        "dailyReport"
    ).innerHTML = `

        <p>
            Total omzet:
            <strong>
                ${rupiah(sales)}
            </strong>
        </p>

        <p>
            Jumlah transaksi:
            <strong>
                ${transactions.length}
            </strong>
        </p>

    `;

}


/* =====================================================
   EVENT
===================================================== */

document.getElementById(
    "searchProduct"
).addEventListener(
    "input",
    renderProducts
);


document.getElementById(
    "discount"
).addEventListener(
    "input",
    calculateTotal
);


document.getElementById(
    "payment"
).addEventListener(
    "input",
    calculateChange
);


document.getElementById(
    "payButton"
).addEventListener(
    "click",
    processPayment
);


/* =====================================================
   START
===================================================== */

renderProducts();

renderCart();

renderInventory();

renderTransactions();

updateReport();
