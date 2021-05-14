export const login = '/login'
export const dashboard = '/kotahi/dashboard'
export const manuscripts = '/kotahi/admin/manuscripts'
export const formBuilder = '/kotahi/admin/form-builder'
export const users = '/kotahi/admin/users'
export const profile = '/kotahi/profile'
export const submit = '/submit'
export const evaluate = '/evaluate'

export function evaluationResultUrl(id, int) {
  return `/kotahi/versions/${id}/article-evaluation-result/${int}`
}

export function evaluationSummaryUrl(id) {
  return `/kotahi/versions/${id}/article-evaluation-summary`
}
