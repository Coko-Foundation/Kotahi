/* eslint-disable react/prop-types */

import * as React from 'react'
import VisibilitySensor from 'react-visibility-sensor'

import { Img, FallbackImg, LoadingImg } from './style'

// type Props = {
//   src: any,
//   type: 'user' | 'community',
//   size: number,
//   mobilesize?: number,
//   isClickable?: boolean,
// };

const Image = props => {
  const { type, size, mobilesize, src } = props

  const fallbackSrc =
    type === 'user'
      ? '/profiles/default_avatar.svg'
      : '/profiles/default_community.svg'

  return (
    <VisibilitySensor>
      <Img
        {...props}
        decode={false}
        key={
          src // Otherwise, upon updating src it shows only the loading image, not the new image.
          // TODO This workaround might not be needed with react-image's more modern useImage hook.
          // What we're using is the legacy standalone component.
        }
        loader={
          <LoadingImg
            alt=""
            mobilesize={mobilesize}
            size={size}
            src={fallbackSrc}
            type={type}
          />
        }
        unloader={
          <FallbackImg
            alt=""
            mobilesize={mobilesize}
            size={size}
            src={fallbackSrc}
            type={type}
          />
        }
      />
    </VisibilitySensor>
  )
}

export default Image
