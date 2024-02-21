const config = require('config')
const path = require('path')

const { execSync } = require('child_process')

const run = () => {
  const webpackConfig = path.join(
    'webpack',
    `webpack.${config.util.getEnv('NODE_ENV')}.config.js`,
  )

  execSync(`yarn webpack-dev-server --config ${webpackConfig}`, {
    stdio: 'inherit',
  })
}

run()
