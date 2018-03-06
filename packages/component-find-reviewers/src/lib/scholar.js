export const scholar = path =>
  window
    .fetch(`https://api.semanticscholar.org/v1/${path}`)
    .then(res => res.json())
