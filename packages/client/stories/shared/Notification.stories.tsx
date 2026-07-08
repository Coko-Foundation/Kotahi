import { type ReactNode } from 'react'
import { App, Button, Space } from 'antd'

import preview from '../../.storybook/preview'

const NotificationDemo = (): ReactNode => {
  const { notification } = App.useApp()

  return (
    <Space>
      <Button
        onClick={() =>
          notification.success({
            // duration: 0,
            message: 'Saved successfully',
          })
        }
      >
        Success
      </Button>

      <Button
        onClick={() =>
          notification.warning({
            // duration: 0,
            message: 'Connection to the server lost',
          })
        }
      >
        Warning
      </Button>

      <Button
        onClick={() =>
          notification.info({
            // duration: 0,
            message: 'A new version is available',
          })
        }
      >
        Info
      </Button>

      <Button
        onClick={() =>
          notification.error({
            // duration: 0,
            message: 'Something went wrong',
          })
        }
      >
        Error
      </Button>

      <Button
        onClick={() =>
          notification.info({
            // duration: 0,
            message:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum turpis libero, pellentesque ut enim sed, vehicula eleifend justo. Aenean quis libero sit amet mi bibendum tincidunt. Pellentesque ut ex ex.',
          })
        }
      >
        Long
      </Button>
    </Space>
  )
}

const meta = preview.meta({
  component: NotificationDemo,
})

export const Base = meta.story({})
