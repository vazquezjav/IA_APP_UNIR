describe('Live Map', () => {
    beforeEach(() => {
        // The /en-vivo route is public, so we can visit it directly
        cy.visit('/en-vivo');
    });

    it('should load the map successfully', () => {
        // Verify URL
        cy.url().should('include', '/en-vivo');
        
        // Check Map Container
        cy.get('#map').should('be.visible');
        
        // Check if Leaflet has initialized
        cy.get('.leaflet-container').should('exist');
        cy.get('#map').click();
        cy.get('#map div:nth-child(84) path').click();
        cy.get('#map div:nth-child(16) svg').click();
        cy.get('button:nth-child(3)').click();
        cy.get('button:nth-child(2)').click();
        cy.get('button:nth-child(1)').click();
    });

    it('should allow filtering flights', () => {
        // Test filter buttons
        cy.contains('button', 'Comerciales').click();
        cy.contains('button', 'Comerciales').should('have.class', 'active');

        cy.contains('button', 'Militares').click();
        cy.contains('button', 'Militares').should('have.class', 'active');

        cy.contains('button', 'Todos').click();
        cy.contains('button', 'Todos').should('have.class', 'active');
    });

    it('should display flight markers', () => {
        // Wait for potential API call/polling
        cy.wait(2000);

        // Check for the existence of the marker pane
        // This confirms Leaflet is attempting to render markers
        cy.get('.leaflet-marker-pane').should('exist');
    });
});
