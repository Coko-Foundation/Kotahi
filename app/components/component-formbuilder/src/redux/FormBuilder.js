// import * as api from 'pubsweet-client/src/helpers/api'

// export const GET_FORM_REQUEST = 'GET_FORM_REQUEST'
// export const GET_FORM_SUCCESS = 'GET_FORM_SUCCESS'
// export const GET_FORM_FAILURE = 'GET_FORM_FAILURE'

// function getFormRequest(project, version) {
//   return {
//     type: GET_FORM_REQUEST,
//   }
// }

// function getFormSuccess(forms) {
//   return {
//     type: GET_FORM_SUCCESS,
//     forms,
//   }
// }

// function getFormFailure(error) {
//   return {
//     type: GET_FORM_FAILURE,
//     error,
//   }
// }

// export function getForms() {
//   return dispatch => {
//     dispatch(getFormRequest())

//     return api
//       .get('/get-forms', {})
//       .then(result => {
//         dispatch(getFormSuccess(result))
//       })
//       .catch(error => dispatch(getFormFailure(error)))
//   }
// }

// export function getForm(formId) {
//   return dispatch => {
//     dispatch(getFormRequest())

//     return api
//       .get(`/get-form/${formId}`, {})
//       .then(result => {
//         dispatch(getFormSuccess(result))
//       })
//       .catch(error => dispatch(getFormFailure(error)))
//   }
// }

// export function updateForms(form, properties) {
//   return dispatch => {
//     dispatch(getFormRequest())

//     return api
//       .update(`/update-forms/${form.id}`, properties)
//       .then(result => {
//         dispatch(getFormSuccess(result))
//       })
//       .catch(error => dispatch(getFormFailure(error)))
//   }
// }

// export function updateElements(form, properties) {
//   return dispatch => {
//     dispatch(getFormRequest())

//     return api
//       .update(
//         `/update-forms/${form.id}/element/${properties.children.id}`,
//         properties,
//       )
//       .then(result => {
//         dispatch(getFormSuccess(result))
//       })
//       .catch(error => dispatch(getFormFailure(error)))
//   }
// }

// export function deleteForms(form) {
//   return dispatch => {
//     dispatch(getFormRequest())

//     return api
//       .remove(`/delete-forms/${form.id}`)
//       .then(result => {
//         dispatch(getFormSuccess(result))
//       })
//       .catch(error => dispatch(getFormFailure(error)))
//   }
// }

// export function deleteElements(form, element) {
//   return dispatch => {
//     dispatch(getFormRequest())

//     return api
//       .remove(`/delete-forms/${form.id}/elements/${element.id}`)
//       .then(result => {
//         dispatch(getFormSuccess(result))
//       })
//       .catch(error => dispatch(getFormFailure(error)))
//   }
// }

// export function createForms(properties) {
//   return dispatch => {
//     dispatch(getFormRequest())

//     return api
//       .create('/create-forms', properties)
//       .then(result => {
//         dispatch(getFormSuccess(result))
//       })
//       .catch(error => dispatch(getFormFailure(error)))
//   }
// }

// const initialState = {}
// export default (state = initialState, action) => {
//   switch (action.type) {
//     case GET_FORM_SUCCESS:
//       return {
//         forms: action.forms.forms,
//       }

//     case GET_FORM_FAILURE:
//       return { error: action.error }

//     default:
//       return state
//   }
// }
