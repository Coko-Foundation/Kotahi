/* eslint react/prop-types: 0 */
import React, { useContext, useMemo } from 'react'
import styled from 'styled-components'
import { WaxContext /*, DocumentHelpers */ } from 'wax-prosemirror-core'
import { MenuButton } from 'wax-prosemirror-components'
import { TextSelection } from 'prosemirror-state'

const AnyStyleDiv = styled(MenuButton)`
  margin-top: 8px;
  outline: 1px solid #ccc;

  &:after {
    background: #fff;
    border-radius: 4px;
    content: '';
    height: 100%;
    position: absolute;
    transition: 0.25s;
    width: 100%;
    z-index: 1;
  }

  & span {
    z-index: 2;
  }

  &:hover {
    &:after {
      background: #f1f5ff;
    }

    & span {
      /* stylelint-disable-next-line declaration-no-important */
      border-bottom-color: transparent !important;
    }
  }
`

const AnyStyleButton = ({ view = {}, item, anyStyle }) => {
  const { active, icon, label, /* run, */ select, title } = item

  const {
    // app,
    pmViews: { main },
    activeViewId,
    activeView,
  } = useContext(WaxContext)

  const { /* dispatch, */ state } = view
  // const serviceConfig = app.config.get('config.AnyStyleService')

  const handleMouseDown = (e, editorState) => {
    e.preventDefault()

    const {
      selection: { from, to, $from, $to },
    } = editorState

    if (from < to) {
      // this protects against no selection

      const textSelection = new TextSelection($from, $to)

      const content = textSelection.content()

      // This gets all the text out. It's separating the text with a newline;
      // Anystyle understands this. However: we're not really handling it on the return.

      const textContent = content.content.content
        .map(x => x.textContent)
        .join('\n')

      // TODO: This fails if it is in a footnote

      anyStyle({ content: textContent })
    }
  }

  // useEffect(() => {}, [])

  const isActive = !!active(state, activeViewId)
  let isDisabled = !select(state, activeViewId, activeView)

  const isEditable = main.props.editable(editable => {
    return editable
  })

  if (!isEditable) isDisabled = true

  const AnyStyleButtonComponent = useMemo(
    () => (
      <AnyStyleDiv
        active={isActive || false}
        disabled={isDisabled}
        iconName={icon}
        label={label}
        onMouseDown={e => handleMouseDown(e, activeView.state, view.dispatch)}
        title={title}
      />
    ),
    [isActive, isDisabled],
  )

  return AnyStyleButtonComponent
}

export default AnyStyleButton
