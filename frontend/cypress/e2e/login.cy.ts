describe('Login Flow', () => {
    beforeEach(() => {
        cy.visit('/login');
    });

    it('should show error with invalid credentials', () => {
        cy.get('input[id="email"]').type('wrong@test.com', { force: true });
        cy.get('input[id="password"]').type('wrongpassword', { force: true });
        cy.get('p-button[label="Ingresar"]').click();

        // Check for PrimeNG toast error
        cy.get('.p-toast-message-error').should('be.visible');
        cy.contains('Credenciales inválidas').should('be.visible');
    });

    it('should login successfully with valid credentials', () => {
        // Register a temp user first to be safe
        cy.contains('Registrarse').click();
        cy.get('input[id="reg-name"]').type('E2E User');
        cy.get('input[id="reg-email"]').type('e2e@test.com');
        cy.get('input[id="reg-password"]').type('password123');
        cy.get('p-button[label="Crear Cuenta"]').click();

        cy.get('.p-toast-message-success').should('be.visible');

        // Now Login
        cy.get('input[id="email"]').type('e2e@test.com', { force: true });
        cy.get('input[id="password"]').type('password123', { force: true });
        cy.get('p-button[label="Ingresar"]').click();

        cy.url().should('include', '/dashboard');
        cy.contains('Mi Perfil').should('be.visible');
    });
});
