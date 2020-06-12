import styled, { css } from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'

// import theme from 'shared/theme';

import { Truncate } from '../../../../globals'

export const MentionsInputStyle = {
  overflow: 'visible',
  suggestions: {
    zIndex: 99999,
    list: {
      backgroundColor: '#fff', // theme.bg.default,
      boxShadow: '1px 0 12px rgba(0,0,0,0.12)',
      borderRadius: '4px',
      overflow: 'hidden',
      bottom: '28px',
      position: 'absolute',
    },
  },
}

export const StyledMentionSuggestion = styled.div`
  display: flex;
  padding: 8px 12px;
  align-items: center;
  background: ${props =>
    props.focused ? th('colorBackgroundHue') : th('colorBackground')};
  min-width: 156px;
  line-height: 1.3;
  border-bottom: 1px solid ${th('colorBorder')};
`

export const MentionContent = styled.div`
  display: flex;
  flex-direction: column;
`

export const MentionName = styled.span`
  margin-left: 12px;
  width: calc(184px - 62px);
  ${Truncate};
  font-size: 14px;
  font-weight: 500;
  color: ${props => (props.focused ? th('colorPrimary') : th('colorText'))};
`

export const MentionUsername = styled.span`
  margin-left: 12px;
  font-size: 13px;
  font-weight: 400;
  width: calc(184px - 62px);
  ${Truncate};
  color: ${props => (props.focused ? th('colorPrimary') : th('colorWarning'))};
`
