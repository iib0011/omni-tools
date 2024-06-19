import { render, screen } from '@testing-library/react'

import Avatar from '.'

describe('<Avatar />', () => {
  const props = {
    src: 'https://gravatar.com/4405735f6f3129e0286d9d43e7b460d0',
    alt: 'Avatar'
  }

  it('should render the medium Avatar as default', () => {
    const { container } = render(<Avatar {...props} />)

    expect(screen.getByRole('img', { name: /Avatar/i })).toBeInTheDocument()

    expect(container.firstChild).toHaveClass(
      'inline-block w-12 h-12 rounded-full'
    )

    expect(container.firstChild).toMatchSnapshot()
  })

  it('should render the small Avatar', () => {
    const { container } = render(<Avatar size="small" {...props} />)

    expect(screen.getByRole('img', { name: /Avatar/i })).toBeInTheDocument()

    expect(container.firstChild).toHaveClass(
      'inline-block w-10 h-10 rounded-full'
    )

    expect(container.firstChild).toMatchSnapshot()
  })

  it('should render the medium Avatar', () => {
    const { container } = render(<Avatar size="medium" {...props} />)

    expect(screen.getByRole('img', { name: /Avatar/i })).toBeInTheDocument()

    expect(container.firstChild).toHaveClass(
      'inline-block w-12 h-12 rounded-full'
    )
  })

  it('should render the large Avatar', () => {
    const { container } = render(<Avatar size="large" {...props} />)

    expect(screen.getByRole('img', { name: /Avatar/i })).toBeInTheDocument()

    expect(container.firstChild).toHaveClass(
      'inline-block w-14 h-14 rounded-full'
    )

    expect(container.firstChild).toMatchSnapshot()
  })

  it('should render the empty Avatar', () => {
    const { container } = render(<Avatar />)

    expect(screen.getByTestId('empty-avatar')).toBeInTheDocument()

    expect(container.firstChild).toMatchSnapshot()
  })
})
