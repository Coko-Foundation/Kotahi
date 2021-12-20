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

export default function Image(props) {
  const { type, size, mobilesize } = props
  const { ...rest } = props

  const fallbackSrc =
    type === 'user'
      ? '/profiles/default_avatar.svg'
      : '/profiles/default_community.svg'

  return (
    <VisibilitySensor>
      <Img
        {...rest}
        decode={false}
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
