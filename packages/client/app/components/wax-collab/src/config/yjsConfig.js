/* eslint-disable no-param-reassign */
import { YjsService } from 'wax-prosemirror-services'

export default (config, { yjsProvider, ydoc }) => {
  if (yjsProvider && ydoc) {
    config.YjsService = {
      provider: () => yjsProvider,
      ydoc: () => ydoc,
      cursorBuilder: user => {
        if (user) {
          const cursor = document.createElement('span')
          cursor.classList.add('ProseMirror-yjs-cursor')
          cursor.setAttribute('style', `border-color: ${user.color}`)
          const userDiv = document.createElement('div')
          userDiv.setAttribute('style', `background-color: ${user.color}`)
          userDiv.insertBefore(document.createTextNode(user.displayName), null)
          cursor.insertBefore(userDiv, null)
          return cursor
        }

        return ''
      },
    }

    config.services = [new YjsService(), ...config.services]
  }

  return config
}
