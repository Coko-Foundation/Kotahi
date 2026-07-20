import { type ReactNode } from 'react'
import styled, { css } from 'styled-components'
import {
  Breadcrumb as AntBreadcrumb,
  type BreadcrumbProps as AntBreadcrumbProps,
} from 'antd'

import { grid, th, lighten } from '@coko/client'

const flatEdges = css`
  .ant-breadcrumb-item:first-child .ant-breadcrumb-link {
    clip-path: polygon(
      0 0,
      calc(100% - var(--depth)) 0,
      100% 50%,
      calc(100% - var(--depth)) 100%,
      0 100%
    );

    padding-left: ${grid(6)};

    border-top-left-radius: ${th('borderRadius')};
    border-bottom-left-radius: ${th('borderRadius')};
  }

  .ant-breadcrumb-item:last-child .ant-breadcrumb-link {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, var(--depth) 50%);

    padding-right: ${grid(6)};

    border-top-right-radius: ${th('borderRadius')};
    border-bottom-right-radius: ${th('borderRadius')};
  }
`

const StyledBreadcrumb = styled(AntBreadcrumb)`
  li.ant-breadcrumb-separator {
    display: none;
  }

  .ant-breadcrumb-link {
    background-color: ${th('colorPrimary')};
    color: ${th('colorTextReverse')};
    padding: ${grid(3)} ${grid(8)};
    font-weight: 500;
    cursor: pointer;

    margin-left: ${grid(-4)};

    --depth: ${grid(5)};

    clip-path: polygon(
      0 0,
      calc(100% - var(--depth)) 0,
      100% 50%,
      calc(100% - var(--depth)) 100%,
      0 100%,
      var(--depth) 50%
    );

    transition:
      background-color 0.2s ease,
      color 0.2s ease;

    a {
      color: ${th('colorTextReverse')};
      transition: background-color 0.2s ease;

      &:hover {
        color: ${th('colorTextReverse')};
        background-color: ${th('colorPrimary')};
      }
    }
  }

  .ant-breadcrumb-item:first-child .ant-breadcrumb-link {
    margin-left: 0;
  }

  .ant-breadcrumb-item:not(:last-child) .ant-breadcrumb-link {
    &:hover {
      background: ${lighten('colorPrimary', 30)};

      a:hover {
        background: ${lighten('colorPrimary', 30)};
      }
    }
  }

  ${flatEdges};
`

const Breadcrumb = ({ items }: AntBreadcrumbProps): ReactNode => {
  return <StyledBreadcrumb items={items} />
}

export default Breadcrumb
