/**
 * Fonction globale pour récupérer la liste des ours en peluche depuis l'API
 */
function fetchTeddies() {
    fetch("http://localhost:3000/api/teddies")
        .then(response => {
            if (!response.ok) {
                throw new Error("Erreur lors de la communication avec l'API");
            }
            return response.json();
        })
        .then(teddies => {
            displayTeddies(teddies);
        })
        .catch(error => {
            console.error("Erreur d'API :", error);
            document.getElementById("products-container").innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: #fdf2f2; border-radius: 12px; color: #9b1c1c;">
                    <p><strong>Erreur de chargement :</strong> Impossible de joindre le serveur.</p>
                    <p style="font-size: 0.9rem; margin-top: 0.5rem;">Vérifiez que votre backend tourne bien sur le port 3000.</p>
                </div>
            `;
        });
}

/**
 * Fonction globale pour injecter les cartes produits 
 * @param {Array} teddies 
 */
function displayTeddies(teddies) {
    const container = document.getElementById("products-container");
    container.innerHTML = ""; 

    teddies.forEach(teddy => {
        const productCard = document.createElement("div");
        productCard.className = "product-card";
        
        productCard.innerHTML = `
            <img src="${teddy.imageUrl}" alt="${teddy.name}">
            <div class="product-card-body">
                <h3>${teddy.name}</h3>
                <p>${teddy.description}</p>
                <div class="product-card-footer">
                    <span class="price">${(teddy.price / 100).toFixed(2)} €</span>
                    <a href="product.html?id=${teddy._id}">Découvrir</a>
                </div>
            </div>
        `;
        container.appendChild(productCard);
    });
}

fetchTeddies();