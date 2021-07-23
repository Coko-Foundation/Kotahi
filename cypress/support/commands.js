/* eslint-disable no-undef */
import 'cypress-file-upload'

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add('setToken', token => {
  localStorage.setItem('token', token)
})

Cypress.Commands.add('login', (name, page) => {
  cy.task('createToken', name).then(token => {
    cy.setToken(token)
    cy.visit(page)
  })
})

Cypress.Commands.add('fillInput', { prevSubject: true }, (subject, text) => {
  return cy.wrap(subject).click().clear().type(text)
})

Cypress.Commands.add('getByDataTestId', dataTestId => {
  cy.get(`[data-testid='${dataTestId}']`)
})

Cypress.Commands.add('getByContainsDataTestId', dataTestId => {
  cy.get(`[data-testid*='${dataTestId}']`)
})

Cypress.Commands.add('getByClass', className => {
  cy.get(`[class='${className}']`)
})

Cypress.Commands.add('getByContainsClass', className => {
  cy.get(`[class*='${className}']`)
})

Cypress.Commands.add('getByContainsAriaLabel', ariaLabel => {
  cy.get(`[aria-label*='${ariaLabel}']`)
})

Cypress.Commands.add('getByName', name => {
  cy.get(`[name='${name}']`)
})

Cypress.Commands.add('getByContainsName', name => {
  cy.get(`[name*='${name}']`)
})

Cypress.Commands.add('getById', id => {
  cy.get(`[id='${id}']`)
})

Cypress.Commands.add('getByContainsId', id => {
  cy.get(`[id*='${id}']`)
})

Cypress.Commands.add('getByNameAndValue', (name, value) => {
  cy.get(`[name='${name}'][value=${value}]`)
})

Cypress.Commands.add('getByNameAndContainsValue', (name, value) => {
  cy.get(`[name='${name}'][value*=${value}]`)
})

Cypress.Commands.add('getByTitle', title => {
  cy.get(`[title='${title}']`)
})

Cypress.Commands.add('awaitDisappearSpinner', () => {
  cy.get('[class*=Spinner__LoadingPage]', { timeout: 50000 }).should(
    'not.exist',
  )
})
