import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from './App'
import api from './services/api'

jest.mock('./services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn()
  }
}))

describe('App', () => {
  let alertSpy

  beforeEach(() => {
    jest.clearAllMocks()
    alertSpy = jest.fn()
    window.alert = alertSpy
  })

  it('shows "CEP não encontrado" and renders no result card when ViaCEP returns {erro: true}', async () => {
    api.get.mockResolvedValue({ data: { erro: true } })

    render(<App />)

    fireEvent.change(screen.getByPlaceholderText('Digite seu CEP...'), {
      target: { value: '99999999' }
    })
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('CEP não encontrado')
    })

    expect(screen.queryByText(/^CEP:/)).toBeNull()
    expect(screen.queryByText(/Logradouro:/)).toBeNull()
    expect(screen.getByPlaceholderText('Digite seu CEP...').value).toBe('')
  })

  it('renders the result card for a valid CEP and falls back to "-" for empty/missing fields', async () => {
    api.get.mockResolvedValue({
      data: {
        cep: '01001-000',
        logradouro: 'Praça da Sé',
        complemento: '',
        bairro: 'Sé',
        localidade: 'SP'
      }
    })

    render(<App />)

    fireEvent.change(screen.getByPlaceholderText('Digite seu CEP...'), {
      target: { value: '01001000' }
    })
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByText(/^CEP:/)).toBeTruthy()
    })

    expect(screen.getByText(/^CEP:/).textContent).toContain('01001-000')
    expect(screen.getByText(/^Complemento:/).textContent).toContain('-')
    expect(alertSpy).not.toHaveBeenCalled()
  })

  it('keeps the existing behavior on HTTP failure (catch branch)', async () => {
    api.get.mockRejectedValue(new Error('network'))

    render(<App />)

    fireEvent.change(screen.getByPlaceholderText('Digite seu CEP...'), {
      target: { value: '01001000' }
    })
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Ops! Erro ao buscar CEP!')
    })

    expect(screen.queryByText(/^CEP:/)).toBeNull()
  })
})
