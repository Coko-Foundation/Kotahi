import React from 'react'
import { JournalProvider } from 'xpub-journal'
import BaseWrapper from '@pubsweet/styleguide/src/components/Wrapper'

import 'xpub-theme'
import * as journal from '../config/journal'

const Wrapper = ({ children }) => (
  <JournalProvider journal={journal}>
    <BaseWrapper>{children}</BaseWrapper>
  </JournalProvider>
)

export default Wrapper
