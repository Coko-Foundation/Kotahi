/* eslint-disable react/prop-types */

export const DragVerticalIcon = ({
  className,
  color = 'black',
  size = 24,
  strokeWidth = 2,
}) => {
  return (
    <svg
      className={className}
      fill="none"
      height={size}
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
      width={size}
    >
      <polyline points="9,6 12,3 15,6" />
      <line x1="3" x2="7" y1="12" y2="12" />
      <line x1="10" x2="14" y1="12" y2="12" />
      <line x1="17" x2="21" y1="12" y2="12" />
      <polyline points="9,18 12,21 15,18" />
    </svg>
  )
}

export const SendIcon = ({ className, height, width, stroke }) => {
  return (
    <svg
      className={className}
      fill="none"
      height={height}
      stroke={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <line x1="22" x2="11" y1="2" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}
