export default {
  ascending: field => (a, b) => a[field] - b[field],
  descending: field => (a, b) => b[field] - a[field]
}
