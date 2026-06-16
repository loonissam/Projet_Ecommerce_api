let totalAmount = 0;
let cartData = {};

/**
 * Fonction pour mettre à jour la quantité d'un produit
 * @param {string} productId 
 * @param {number} newQuantity 
 */
function updateQuantity(productId, newQuantity) {
    let cart = JSON.parse(localStorage.getItem("panier")) || {};
    if (newQuantity <= 0) {
        delete cart[productId];
    } else {
        cart[productId] = newQuantity;
    }
    localStorage.setItem("panier", JSON.stringify(cart));
    loadCart();
}

/**
 * Fonction pour supprimer un produit du panier
 * @param {string} productId 
 */
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem("panier")) || {};
    delete cart[productId];
    localStorage.setItem("panier", JSON.stringify(cart));
    loadCart();
}

/**
 * Fonction globale pour charger le contenu du panier 
 */
function loadCart() {
    cartData = JSON.parse(localStorage.getItem("panier")) || {};
    const itemsContainer = document.getElementById("cart-items");
    const totalDisplay = document.getElementById("cart-total");

    if (Array.isArray(cartData)) {
        const newCart = {};
        cartData.forEach(id => {
            newCart[id] = (newCart[id] || 0) + 1;
        });
        localStorage.setItem("panier", JSON.stringify(newCart));
        cartData = newCart;
    }

    if (Object.keys(cartData).length === 0) {
        itemsContainer.innerHTML = "<p style='text-align:center; color:#6c757d; padding:2rem;'>Votre panier Orinoco est actuellement vide.</p>";
        totalDisplay.innerHTML = "Total : 0.00 €";
        return;
    }

    itemsContainer.innerHTML = "";
    totalAmount = 0;

    const productIds = Object.keys(cartData);
    const apiRequests = productIds.map(id =>
        fetch(`http://localhost:3000/api/teddies/${id}`).then(res => res.json())
    );

    Promise.all(apiRequests)
        .then(products => {
            products.forEach((teddy, index) => {
                const productId = productIds[index];
                const quantity = cartData[productId];
                const itemTotal = teddy.price * quantity;
                totalAmount += itemTotal;

                const row = document.createElement("div");
                row.className = "cart-item-row";
                row.innerHTML = `
                    <div style="flex: 1;">
                        <span><strong>${teddy.name}</strong></span>
                    </div>
                    <div style="width: 120px; text-align: right;">
                        <span style="font-weight: 700; color: #4a3b32;">${(teddy.price / 100).toFixed(2)} €</span>
                    </div>
                    <div class="quantity-control">
                        <button class="btn-qty" data-id="${productId}" data-action="decrease">−</button>
                        <input type="number" class="qty-input" value="${quantity}" min="1" data-id="${productId}">
                        <button class="btn-qty" data-id="${productId}" data-action="increase">+</button>
                    </div>
                    <div style="width: 100px; text-align: right;">
                        <span style="font-weight: 700; color: #3d2c25;">${(itemTotal / 100).toFixed(2)} €</span>
                    </div>
                    <button class="btn-delete" data-id="${productId}">Supprimer</button>
                `;
                itemsContainer.appendChild(row);
            });

            document.querySelectorAll(".btn-qty").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    const productId = e.target.dataset.id;
                    const action = e.target.dataset.action;
                    const currentQty = parseInt(cartData[productId]);
                    if (action === "increase") {
                        updateQuantity(productId, currentQty + 1);
                    } else if (action === "decrease") {
                        updateQuantity(productId, currentQty - 1);
                    }
                });
            });

            document.querySelectorAll(".qty-input").forEach(input => {
                input.addEventListener("change", (e) => {
                    const productId = e.target.dataset.id;
                    const newQty = parseInt(e.target.value) || 1;
                    updateQuantity(productId, newQty);
                });
            });

            document.querySelectorAll(".btn-delete").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    const productId = e.target.dataset.id;
                    removeFromCart(productId);
                });
            });

            totalDisplay.innerHTML = `Total : ${(totalAmount / 100).toFixed(2)} €`;
        })
        .catch(error => {
            console.error("Erreur lors de la consolidation du panier :", error);
        });
}

/**
 * Écouteur sur l'envoi du formulaire 
 */
document.getElementById("order-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Annule le rechargement de page automatique

    // Extraction et nettoyage des valeurs
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const address = document.getElementById("address").value.trim();
    const city = document.getElementById("city").value.trim();
    const email = document.getElementById("email").value.trim();

    const textRegex = /^[a-zA-ZÀ-ÿ\s-]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!textRegex.test(firstName) || !textRegex.test(lastName) || !textRegex.test(city)) {
        alert("⚠️ Erreur de saisie : Les champs Prénom, Nom et Ville ne doivent contenir que des lettres.");
        return;
    }

    if (!emailRegex.test(email)) {
        alert("⚠️ Erreur de saisie : Veuillez entrer un format d'adresse email valide.");
        return;
    }

    if (Object.keys(cartData).length === 0) {
        alert("⚠️ Votre panier est vide. Impossible de valider la commande.");
        return;
    }

    const products = [];
    for (const [productId, quantity] of Object.entries(cartData)) {
        for (let i = 0; i < quantity; i++) {
            products.push(productId);
        }
    }

    const orderPayload = {
        contact: {
            firstName: firstName,
            lastName: lastName,
            address: address,
            city: city,
            email: email
        },
        products: products
    };

    fetch("http://localhost:3000/api/teddies/order", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(orderPayload)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Erreur serveur lors de la soumission de la commande");
        }
        return response.json();
    })
    .then(data => {
        sessionStorage.setItem("orderId", data.orderId);
        sessionStorage.setItem("prixTotal", (totalAmount / 100).toFixed(2));

        localStorage.removeItem("panier");

        window.location.href = "confirmation.html";
    })
    .catch(error => {
        console.error("Erreur critique d'envoi :", error);
        alert("Une erreur est survenue pendant la finalisation de votre commande.");
    });
});

loadCart();