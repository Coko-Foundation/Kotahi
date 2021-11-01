export const stripHtml = htmlString => {
  const temp = document.createElement('span')
  temp.innerHTML = htmlString
  return temp.textContent
}

export const reviewWithComment = ({
  values,
  commentType,
  name,
  isDecision,
}) => {
  const data = { id: values.id }

  data.isDecision = isDecision
  data[name] = {
    id: values[name]?.id,
    commentType,
    content: values[name]?.content ? stripHtml(values[name].content) : '',
  }
  return data
}
