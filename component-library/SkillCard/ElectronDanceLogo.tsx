"use client"

export const ElectronDanceLogo = ({
  x,
  y,
  width,
  height,
  instanceId,
  text = "electron.dance",
}: {
  x: number
  y: number
  width: number
  height: number
  instanceId?: string
  text?: string
}) => {
  const uid = instanceId ? `-${instanceId}` : ""
  const gradientId = `electron-dance-pink${uid}`

  return (
    <svg
      x={x}
      y={y}
      width={width}
      height={height}
      viewBox="0 0 907.1 907.1"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff6ec4" />
          <stop offset="100%" stopColor="#7873f5" />
        </linearGradient>
      </defs>
      <g fill={`url(#${gradientId})`} stroke="aliceblue" strokeWidth={2} strokeLinejoin="round">
        <polygon points="708.6,453.5 623.6,368.6 538.5,28.4 453.6,198.5 368.6,28.4 334.5,164.4 368.6,113.4 538.5,283.5 878.7,368.6 711.2,453.5 715.1,447.2 793.1,368.9 538.5,198.5 368.6,198.5 283.5,283.5 283.5,368.6 113.4,538.5 368.6,708.6 453.5,708.6 453.5,708.6 538.5,793.7 572.4,743.6 538.5,878.8 453.6,708.6 538.5,623.6 607.2,605.7 623.6,538.5 708.6,453.5 878.7,538.5 744.5,572.1 793.7,538.5 708.6,453.5 708.6,538.4 641.9,639.3 538.5,708.6 453.5,708.6 368.4,623.6 28.3,538.5 191.1,457.4 192.6,450.6 28.3,368.6 164.6,334.4 113.4,368.4 283.5,538.5 368.6,878.8 451.8,712.2 369.5,792.2 198.5,538.5 198.5,368.6 283.5,283.5 368.6,283.5 538.5,113.4 708.6,368.6" />
      </g>
      <text
        x="453.5"
        y="490"
        textAnchor="middle"
        fontFamily="'Arial Black', 'Helvetica Neue', sans-serif"
        fontWeight={900}
        fontSize="46"
        fill={`url(#${gradientId})`}
      >
        {text}
      </text>
    </svg>
  )
}
