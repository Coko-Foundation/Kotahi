const localizeReviewFilterOptions = (reviewFilterOptions, t) => {
  const clonedOptions = JSON.parse(JSON.stringify(reviewFilterOptions))
  return clonedOptions.map(option => {
    return { ...option, label: t(`reviewerStatus.${option.value}`) }
  })
}

export default localizeReviewFilterOptions
