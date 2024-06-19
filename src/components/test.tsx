import { render, screen } from '@testing-library/react'

import App from './App'

describe('<App />', () => {
  it('should render the App', () => {
    const { container } = render(<App />)

    expect(
      screen.getByRole('heading', {
        name: /Welcome!/i,
        level: 1
      })
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        /This is a boilerplate build with Vite, React 18, TypeScript, Vitest, Testing Library, TailwindCSS 3, Eslint and Prettier./i
      )
    ).toBeInTheDocument()

    expect(
      screen.getByRole('link', {
        name: /start building for free/i
      })
    ).toBeInTheDocument()

    expect(screen.getByRole('img')).toBeInTheDocument()

    expect(container.firstChild).toBeInTheDocument()
  })
})
