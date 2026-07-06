import { type ReactNode } from 'react'

export {
  ArrowRightOutlined as ArrowRight,
  BarChartOutlined as Report,
  ControlOutlined as Settings,
  FileTextOutlined as File,
  FormOutlined as Form,
  HomeOutlined as Home,
  ReadOutlined as Book,
  UnorderedListOutlined as Tasks,
  UserOutlined as User,
  VerticalAlignTopOutlined as ExpandMenu,
} from '@ant-design/icons'

type IconProps = {
  className?: string
}

export const Coar = ({ className }: IconProps): ReactNode => {
  return (
    <span aria-label="coar notify" role="img">
      <svg className={className} height="1em" viewBox="0 0 21 21" width="1em">
        <path
          clipRule="evenodd"
          d="M14.8334 1.48492C18.1727 1.55797 19.6727 3.19804 19.3334 6.40514C18.0017 8.62002 16.1684 9.16669 13.8334 8.04521C11.4017 5.46551 11.735 3.27877 14.8334 1.48492Z"
          fill="currentColor"
          fillRule="evenodd"
          stroke="none"
        />
        <path
          clipRule="evenodd"
          d="M1.16663 6.73315C2.49996 6.73315 3.83329 6.73315 5.16663 6.73315C5.09363 7.11857 5.20473 7.44659 5.49996 7.7172C7.26209 6.69953 9.15096 6.48085 11.1666 7.06117C11.7223 8.2639 12.611 9.13858 13.8333 9.68528C14.166 12.739 14.2773 15.8004 14.1666 18.8697C12.7223 18.8697 11.2776 18.8697 9.83329 18.8697C9.88863 16.2433 9.83329 13.6192 9.66663 10.9973C8.24379 10.0516 6.91046 10.161 5.66663 11.3254C5.50006 13.8376 5.44449 16.3525 5.49996 18.8697C4.05553 18.8697 2.61106 18.8697 1.16663 18.8697C1.16663 14.8243 1.16663 10.7787 1.16663 6.73315Z"
          fill="currentColor"
          fillRule="evenodd"
          stroke="none"
        />
      </svg>
    </span>
  )
}
