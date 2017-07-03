export const ascending = field => (a, b) => a[field] - b[field]

export const descending = field => (a, b) => b[field] - a[field]
