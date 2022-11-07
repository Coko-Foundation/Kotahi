import React from 'react'
import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'

/* stylelint-disable declaration-no-important */
const Button = styled.button`
  align-items: center;
  background: none;
  border: none;
  color: #828282;
  display: flex;
  font-family: 'Fira Sans Condensed', sans-serif !important;
  padding: 0;
  /* padding: calc(${th('gridUnit')} / 2); */
  svg {
    svg {
      path {
        fill: #828282;
      }
    }
    height: 28px;
    width: 28px;
  }

  &:disabled {
    color: ${th('colorFurniture')};

    svg {
      path {
        fill: ${th('colorFurniture')};
      }
    }

    cursor: not-allowed !important;
    font-size: ${th('fontSizeBase')} !important;
    font-style: normal !important;
    font-weight: 200 !important;
    line-height: ${th('lineHeightBase')} !important;
  }

  &:focus {
    outline: 0;
  }

  &:not(:disabled):hover {
    /* background-color: ${th('colorBackgroundHue')}; */
    color: ${th('colorPrimary')};

    svg {
      path {
        fill: ${th('colorPrimary')};
      }
    }
  }

  &:not(:disabled):active {
    /* background-color: ${th('colorFurniture')}; */
    border: none;
    color: ${th('colorPrimary')};
    outline: none;

    svg {
      path {
        fill: ${th('colorPrimary')};
      }
    }
  }
`
/* stylelint-enable declaration-no-important */

const Icon = styled.span`
  height: calc(3.5 * ${th('gridUnit')});
  /* margin: 0 ${th('gridUnit')} 0 0; */
  padding: 0;
  width: calc(3.5 * ${th('gridUnit')});
`

const OnlyIcon = styled.span`
  height: calc(3.5 * ${th('gridUnit')});
  padding: 0;
  width: calc(3.5 * ${th('gridUnit')});
`

const Label = styled.div`
  font-size: ${th('fontSizeBase')};
  line-height: ${th('lineHeightBase')};
  /* padding-right: 4px; */
`

const ButtonWithIcon = ({
  onClick,
  icon,
  label,
  disabled,
  title,
  className,
}) => {
  return (
    <Button
      className={className}
      disabled={disabled}
      onClick={onClick}
      title={title}
    >
      <Icon>{icon}</Icon>
      <Label>{label.toUpperCase()}</Label>
    </Button>
  )
}

const DefaultButton = ({ onClick, label, disabled, className, title }) => {
  return (
    <Button
      className={className}
      disabled={disabled}
      onClick={onClick}
      title={title}
    >
      <Label>{label.toUpperCase()}</Label>
    </Button>
  )
}

const ButtonWithoutLabel = ({ onClick, icon, disabled, className, title }) => {
  return (
    <Button
      className={className}
      disabled={disabled}
      onClick={onClick}
      title={title}
    >
      <OnlyIcon>{icon}</OnlyIcon>
    </Button>
  )
}

export { ButtonWithIcon, DefaultButton, ButtonWithoutLabel }
