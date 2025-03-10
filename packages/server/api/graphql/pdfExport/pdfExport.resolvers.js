const {
  htmlHandler,
  pdfHandler,
} = require('../../../controllers/pdfExport.controllers')

const { generateCss } = require('../../../utils/applyTemplate')

module.exports = {
  Query: {
    convertToPdf: async (_, { manuscriptId, useHtml }) => {
      const outUrl = await (useHtml
        ? htmlHandler(manuscriptId)
        : pdfHandler(manuscriptId))

      return { pdfUrl: outUrl || 'busted!' }
    },

    builtCss: async () => {
      const css = await generateCss(true)
      return { css }
    },
  },
}
