import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

import { ModalProvider } from '@/providers/modal-provider'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ModalProvider>
      {children}
    </ModalProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
