export const stripHtml = htmlString => {
  const temp = document.createElement('span')
  temp.innerHTML = htmlString
  return temp.textContent
}

export const getCommentFiles = (review = {}, type) => {
  const comments =
    (review.comments || []).find(comment => (comment || {}).type === type) || {}
  return comments.files || []
}

export const getCommentContent = (review = {}, type) => {
  const comments =
    (review.comments || []).find(comment => (comment || {}).type === type) || {}
  return comments.content || ''
}

export const createComments = (values, val, type) => {
  let updateIndex = (values.comments || []).findIndex(
    comment => (comment || {}).type === type,
  )
  updateIndex =
    (values.comments || []).length > 0 && updateIndex < 0 ? 1 : updateIndex
  updateIndex = updateIndex < 0 ? 0 : updateIndex

  const comment = Object.assign(
    {
      type,
      content: '',
      files: [],
    },
    (values.comments || [])[updateIndex],
    val,
  )

  return { updateIndex, comment }
}
