// eslint-disable-next-line import/prefer-default-export
export const stripHtml = htmlString => {
  const temp = document.createElement('span')
  temp.innerHTML = htmlString
  return temp.textContent
}
