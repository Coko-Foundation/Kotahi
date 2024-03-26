const schedule = require('node-schedule')
const { initiateJobSchedules } = require('./jobUtils')

const redact = str => {
  return str && str.replace(/./g, '*')
}

const hideSensitiveInformation = async configData => {
  const config = configData

  // Publishing - Crossref password
  if (config.formData.publishing.crossref.password)
    config.formData.publishing.crossref.password = redact(
      config.formData.publishing.crossref.password,
    )

  // Notifications - Gmail password
  if (config.formData.notification.gmailAuthPassword)
    config.formData.notification.gmailAuthPassword = redact(
      config.formData.notification.gmailAuthPassword,
    )

  return config
}

const revertHiddenSensitiveInformation = async (
  existingConfig,
  inputFormData,
) => {
  const formData = inputFormData

  // Publishing - Crossref password
  if (formData.publishing.crossref.password) {
    const passwordIsHidden =
      redact(existingConfig.formData.publishing.crossref.password) ===
      formData.publishing.crossref.password

    if (passwordIsHidden)
      formData.publishing.crossref.password =
        existingConfig.formData.publishing.crossref.password
  }

  // Notifications - Gmail password
  if (formData.notification.gmailAuthPassword) {
    const gmailAuthPasswordIsHidden =
      redact(existingConfig.formData.notification.gmailAuthPassword) ===
      formData.notification.gmailAuthPassword

    if (gmailAuthPasswordIsHidden)
      formData.notification.gmailAuthPassword =
        existingConfig.formData.notification.gmailAuthPassword
  }

  return formData
}

const stripSensitiveInformation = async configData => {
  const config = configData

  // kotahiApis - tokens
  delete config.formData.kotahiApis

  // publishing - credentials
  delete config.formData.publishing.crossref.login
  delete config.formData.publishing.crossref.password
  delete config.formData.publishing.crossref.depositorName
  delete config.formData.publishing.crossref.depositorEmail
  delete config.formData.publishing.crossref.doiPrefix
  delete config.formData.publishing.crossref.licenseUrl
  delete config.formData.publishing.crossref.registrant
  delete config.formData.publishing.crossref.publicationType
  delete config.formData.publishing.crossref.publishedArticleLocationPrefix
  delete config.formData.publishing.hypothesis.group
  delete config.formData.publishing.hypothesis.apiKey
  delete config.formData.publishing.webhook
  config?.formData?.openAi?.apiKey && delete config.formData.openAi.apiKey
  // notification - credentials
  delete config.formData.notification

  return config
}

const rescheduleJobsOnChange = async (previousConfig, currentConfig) => {
  if (
    previousConfig.formData.manuscript.autoImportHourUtc !==
      currentConfig.formData.manuscript.autoImportHourUtc ||
    previousConfig.formData.taskManager.teamTimezone !==
      currentConfig.formData.taskManager.teamTimezone
  ) {
    await schedule.gracefulShutdown() // Gracefullly cancels all scheduled jobs
    await initiateJobSchedules() // Reinitiate all job schedules
  }
}

module.exports = {
  hideSensitiveInformation,
  revertHiddenSensitiveInformation,
  stripSensitiveInformation,
  rescheduleJobsOnChange,
}
