describe('Username input field', () => {
  beforeEach(() => {
    cy.login();
    cy.goToSettings();
  });

  it('Should show username is available if it is', () => {
    cy.typeUsername('brad');

    cy.contains('Username is available')
      .should('be.visible')
      .should('have.attr', 'role', 'alert');
  });

  it('Should info message if username is available', () => {
    cy.typeUsername('mrugesh');

    cy.contains(
      'Please note, changing your username will also change ' +
        'the URL to your profile and your certifications.'
    )
      .should('be.visible')
      .should('have.attr', 'role', 'alert');
  });

  it('Should be able to click the `Save` button if username is available', () => {
    cy.typeUsername('oliver');

    cy.get('@usernameForm').within(() => {
      cy.contains('Save').should('have.attr', 'aria-disabled', 'false');
    });
  });

  it('Should show username is unavailable if it is', () => {
    cy.typeUsername('twaha');

    cy.contains('Username not available')
      .should('be.visible')
      .should('have.attr', 'role', 'alert');
  });

  it('Should not be possible to click the `Save` button if username is unavailable', () => {
    cy.typeUsername('twaha');

    cy.contains('Username is available').should('not.exist');
    cy.contains('Username not available').should('not.exist');
    cy.contains(
      'Please note, changing your username will also change ' +
        'the URL to your profile and your certifications.'
    ).should('not.exist');

    cy.get('@usernameForm')
      .contains('Save')
      .should('have.attr', 'aria-disabled', 'true');
  });

  it('Should not show anything if user types their current name', () => {
    cy.typeUsername('developmentuser');

    cy.get('@usernameForm')
      .contains('Save')
      .should('have.attr', 'aria-disabled', 'true');
  });

  it('Should not be possible to click the `Save` button if user types their current name', () => {
    cy.typeUsername('developmentuser');

    cy.get('@usernameForm')
      .contains('Save')
      .should('have.attr', 'aria-disabled', 'true');
  });

  it('Should not be able to click the `Save` button if username includes invalid character', () => {
    cy.typeUsername('Quincy Larson');

    cy.get('@usernameForm')
      .contains('Save')
      .should('have.attr', 'aria-disabled', 'true');
  });

  it('Should change username if `Save` button is clicked', () => {
    cy.typeUsername('quincy');

    cy.contains('Username is available');

    cy.get('@usernameForm').contains('Save').click({ force: true });
    cy.contains('Account Settings for quincy').should('be.visible');

    cy.resetUsername();
  });

  it('Should change username with uppercase characters if `Save` button is clicked', () => {
    cy.typeUsername('Quincy');

    cy.contains('Username is available');

    cy.get('@usernameForm').contains('Save').click({ force: true });
    cy.contains('Account Settings for Quincy').should('be.visible');

    cy.resetUsername();
  });

  it('Should show flash message showing username has been updated', () => {
    cy.typeUsername('nhcarrigan');
    cy.contains('Username is available');

    cy.get('@usernameInput').type('{enter}', { force: true, release: false });

    cy.contains('We have updated your username to nhcarrigan').should(
      'be.visible'
    );
    cy.resetUsername();
  });

  it('Should be able to close the shown flash message', () => {
    cy.typeUsername('bjorno');
    cy.contains('Username is available');

    cy.get('@usernameInput').type('{enter}', { force: true, release: false });

    cy.contains('We have updated your username to bjorno').within(() => {
      cy.get('button').click();
    });

    cy.contains('We have updated your username to bjorno').should('not.exist');

    cy.resetUsername();
  });

  it('Should change username if enter is pressed', () => {
    cy.typeUsername('symbol');
    cy.contains('Username is available');

    cy.get('@usernameInput').type('{enter}', { force: true, release: false });

    cy.contains('Account Settings for symbol').should('be.visible');

    cy.resetUsername();
  });
});
