module.exports = {
  'pubsweet-client': {
    API_ENDPOINT: '/api',
  },
  'pubsweet-component-xpub-dashboard': {
    acceptUploadFiles: [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/x-latex',
      'text/vnd.latex-z',
      'text/plain',
      'text/x-tex',
      'application/x-tex',
      'application/x-dvi',
      'application/pdf',
      'application/epub+zip',
      'application/zip',
      '.tex',
    ],
  },
  publicKeys: ['pubsweet-client', 'pubsweet-component-xpub-dashboard'],
}
