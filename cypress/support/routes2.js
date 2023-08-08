export const login = '/single_form/login'
export const dashboard = '/single_form/dashboard'
export const manuscripts = '/single_form/admin/manuscripts'
export const formBuilder = '/single_form/admin/form-builder'
export const reports = '/single_form/admin/reports'
export const users = '/single_form/admin/users'
export const profile = '/single_form/profile'
export const submit = '/submit'
export const evaluate = '/evaluation'
export const submissionForm = '/single_form/admin/submission-form-builder'
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
