import { classNames } from 'utils'

type Size = 'small' | 'medium' | 'large'

type AvatarProps = {
  size?: Size
  src?: string
  alt?: string
}

const sizes: Record<Size, string> = {
  small: 'w-10 h-10',
  medium: 'w-12 h-12',
  large: 'w-14 h-14'
}

const EmptyAvatar = ({ size = 'medium' }: Pick<AvatarProps, 'size'>) => (
  <span
    data-testid="empty-avatar"
    className={classNames(
      'inline-block overflow-hidden bg-gray-100 rounded-full',
      sizes[size]
    )}
  >
    <svg
      className="size-full text-gray-300"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  </span>
)

export default function Avatar({ size = 'medium', src, alt }: AvatarProps) {
  if (!src) {
    return <EmptyAvatar size={size} />
  }

  return (
    <img
      className={classNames('inline-block rounded-full', sizes[size])}
      src={src}
      alt={alt}
    />
  )
}
