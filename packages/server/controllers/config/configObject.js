let configJsonString = '{}'

const getConfigJsonString = () => configJsonString

const setConfig = configObject => {
  configJsonString = JSON.stringify(configObject)
}

module.exports = { setConfig, getConfigJsonString }
