import { useEffect } from 'react'

const DynamicFavicon = ({ config }) => {
  try {
    const { icon } = config
    const iconPath = icon.storedObjects[0].url

    const addFavicon = iconUrl => {
      const newFavicon = document.createElement('link')
      newFavicon.rel = 'icon'
      newFavicon.id = 'dynamic-favicon'
      newFavicon.href = iconUrl
      document.head.appendChild(newFavicon)
    }

    useEffect(() => {
      addFavicon(iconPath)
    }, [iconPath])

    return null
  } catch (error) {
    return null
  }
}

export default DynamicFavicon
