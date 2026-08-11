import { Link } from 'react-router-dom'

import preview from '../../.storybook/preview'
import Breadcrumb from '../../app/ui/shared/Breadcrumb'

const meta = preview.meta({
  component: Breadcrumb,
})

export const Base = meta.story({
  args: {
    items: [
      { title: <Link to="/">First</Link> },
      { title: <Link to="/">Second</Link> },
      { title: <Link to="/">Third</Link> },
    ],
  },
})
