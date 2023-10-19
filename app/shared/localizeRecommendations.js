const localizeRecommendations = (recommendations, t) => {
  const clonedOptions = JSON.parse(JSON.stringify(recommendations))
  return clonedOptions.map(option => {
    const newOption = { ...option }

    newOption.label = t(`common.recommendations.${option.label}`)
    return newOption
  })
}

export default localizeRecommendations
