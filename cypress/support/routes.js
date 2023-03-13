export const login = '/login'
export const dashboard = '/kotahi/dashboard'
export const manuscripts = '/kotahi/admin/manuscripts'
export const formBuilder = '/kotahi/admin/form-builder'
export const reports = '/kotahi/admin/reports'
export const users = '/kotahi/admin/users'
export const profile = '/kotahi/profile'
export const submit = '/submit'
export const evaluate = '/evaluation'
export const submissionForm = '/kotahi/admin/submission-form-builder'
export const manuscriptStatus = `${manuscripts}?status=`
export const unsubmitted = 'new'
export const submitted = 'submitted'
export const evaluated = 'evaluated'
export const published = 'published'

export function evaluationResultUrl(id, int) {
  return `/versions/${id}/evaluation/${int}`
}

export function evaluationSummaryUrl(id) {
  return `/versions/${id}/article-evaluation-summary`
}
