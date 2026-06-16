/**
 * Fonction globale pour récupérer le paramètre 'id' imbriqué dans l'URL de la page
 * @returns {string|null} L'identifiant unique de la peluche
 */
function getProductId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id");
}

/**
 * Fonction globale pour interroger l'API sur un produit spécifique
 */
function fetchSingleTeddy() {
    const productId = getProductId();

    if (!productId) {
        document.getElementById("product-details").innerHTML = "<p>Produit introuvable.</p>";
        return;
    }

    // Appel GET ciblé sur l'identifiant unique given_id
    fetch(`http://localhost:3000/api/teddies/${productId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Impossible de récupérer les détails de ce produit");
            }
            return response.json();
        })
        .then(teddy => {
            displaySingleProduct(teddy);
        })
        .catch(error => {
            console.error("Erreur :", error);
            document.getElementById("product-details").innerHTML = "<p>Erreur lors du chargement des spécifications du produit.</p>";
        });
}

/**
 * Fonction globale pour générer le layout Premium de la page produit
 * @param {Object} teddy - Objet contenant toutes les spécifications de la peluche sélectionnée
 */
function displaySingleProduct(teddy) {
    const container = document.getElementById("product-details");

    // Génération dynamique des balises <option> pour le tableau de personnalisation "couleurs"
    let colorsOptions = "";
    teddy.colors.forEach(color => {
        colorsOptions += `<option value="${color}">${color}</option>`;
    });

    // Injection de la structure de grille (Layout image à gauche / texte à droite)
    container.innerHTML = `
        <div class="product-detail-layout">
            <img src="${teddy.imageUrl}" alt="${teddy.name}">
            <div class="product-detail-info">
                <h2>${teddy.name}</h2>
                <p class="price">${(teddy.price / 100).toFixed(2)} €</p>
                <p style="color: #6c757d; margin-bottom: 2rem;">${teddy.description}</p>

                <label for="choix-couleur"><strong>Personnaliser la couleur :</strong></label>
                <select id="choix-couleur">
                    ${colorsOptions}
                </select>

                <label for="quantite"><strong>Quantité :</strong></label>
                <input type="number" id="quantite" min="1" value="1" style="width: 60px; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 1.5rem;">

                <button id="bouton-panier" class="btn-premium">Ajouter au panier</button>
            </div>
        </div>
    `;

    // Écouteur d'événement pour le stockage local du produit au clic
    document.getElementById("bouton-panier").addEventListener("click", () => {
        addToCart(teddy._id);
    });
}

/**
 * Fonction globale pour ajouter l'id de la peluche dans le panier (localStorage) avec quantité
 * @param {string} id - L'ID de l'élément à stocker
 */
function addToCart(id) {
    const quantity = parseInt(document.getElementById("quantite").value);
    let cart = JSON.parse(localStorage.getItem("panier")) || {};
    cart[id] = (cart[id] || 0) + quantity;
    localStorage.setItem("panier", JSON.stringify(cart));
    alert("🧸 Peluche ajoutée avec succès à votre panier !");
}

// Initialisation au chargement du script
fetchSingleTeddy();