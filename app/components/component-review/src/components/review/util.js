export const stripHtml = htmlString => {
  const temp = document.createElement('span')
  temp.innerHTML = htmlString
  return temp.textContent
}

export const reviewWithComment = ({
  id,
  value,
  values,
  commentType,
  name,
  isDecision,
}) => {
  const data = { id: values.id }

  data.isDecision = isDecision
  data[name] = {
    id,
    commentType,
    content: value ? stripHtml(value) : '',
  }
  return data
}
