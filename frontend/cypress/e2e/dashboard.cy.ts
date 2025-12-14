describe('Dashboard & Profile', () => {
    beforeEach(() => {

        // Open Edit Dialog
        cy.contains('Editar Perfil').click();
        cy.get('p-dialog').should('be.visible');

        // Edit Name
        cy.get('input[id="name"]').clear().type('E2E User Updated');

        // Save
        cy.contains('Guardar').click();

        // Verify Success
        cy.get('.p-toast-message-success').should('be.visible');
        cy.contains('Perfil actualizado').should('be.visible');

        // Verify UI Update
        cy.contains('E2E User Updated').should('be.visible');
    });

    it('should navigate to Live Map', () => {
        // If not admin, should see "Ir al Mapa"
        // The e2e user is likely 'user' role
        cy.contains('Ir al Mapa').click();
        cy.url().should('include', '/en-vivo');
    });
});
