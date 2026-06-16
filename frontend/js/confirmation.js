/**
 * Fonction globale pour extraire de la session courante l'identifiant et le prix total,
 * puis vider la session par sécurité.
 */
function checkConfirmationDetails() {
    const orderId = sessionStorage.getItem("orderId");
    const totalPaid = sessionStorage.getItem("prixTotal");
    const container = document.getElementById("confirmation-details");

    if (!orderId || !totalPaid) {
        container.innerHTML = `
            <p style="color: #6c757d;">Aucun reçu de commande récent n'a été détecté.</p>
        `;
        return;
    }

    container.innerHTML = `
        <p style="font-size: 1.1rem; color: #2b2d42; margin-bottom: 1rem;">
            Montant total débité : <strong style="color: #d4a373; font-size: 1.4rem;">${totalPaid} €</strong>
        </p>
        <p style="color: #6c757d; margin-bottom: 0.5rem; font-size: 0.95rem;">Référence unique de commande :</p>
        <p style="font-family: 'Courier New', Courier, monospace; font-weight: 700; background: #f4f1ea; padding: 12px 20px; border-radius: 8px; display: inline-block; color: #4a3b32; border: 1px dashed #d4a373; letter-spacing: 0.5px;">
            ${orderId}
        </p>
    `;

    sessionStorage.removeItem("orderId");
    sessionStorage.removeItem("prixTotal");
}

checkConfirmationDetails();