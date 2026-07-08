import Modal from 'react-modal'
import { App } from 'antd'

import GlobalStyle from './theme/elements/GlobalStyle'

import AssetManager from './components/asset-manager/src/AssetManagerPage'
import { JournalProvider } from './components/xpub-journal'
import journal from '../config/journal'
import ModalProvider from './components/asset-manager/src/ui/Modal/ModalProvider'
import { XpubProvider } from './components/xpub-with-context/src/index'

import Router from './Router'

const modals = {
  assetManagerEditor: AssetManager,
}

const DefaultPage = () => {
  Modal.setAppElement('#root')

  return (
    <App notification={{ maxCount: 3, duration: 4 }}>
      <XpubProvider>
        <JournalProvider journal={JSON.parse(JSON.stringify(journal))}>
          <ModalProvider modals={modals}>
            <GlobalStyle />
            <Router />
          </ModalProvider>
        </JournalProvider>
      </XpubProvider>
    </App>
  )
}

export default <DefaultPage />
