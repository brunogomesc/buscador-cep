import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import api from './services/api'

jest.mock('./services/api', () => ({
  __esModule: true,
  default: { get: jest.fn() }
}))

const previousResult = {
  cep: '01001-000',
  logradouro: 'Praça da Sé',
  complemento: 'lado ímpar',
  bairro: 'Sé',
  localidade: 'São Paulo'
}

async function search(value) {
  await userEvent.type(screen.getByPlaceholderText('Digite seu CEP...'), value)
  await userEvent.click(screen.getByRole('button'))
}

beforeEach(() => {
  jest.clearAllMocks()
  jest.spyOn(window, 'alert').mockImplementation(() => {})
})

test('removes the previous result when the search is rejected', async () => {
  api.get.mockResolvedValueOnce({ data: previousResult })
  render(<App />)

  await search('01001000')
  await screen.findByText('CEP: 01001-000')

  api.get.mockRejectedValueOnce(new Error('network error'))
  await search('99999999')

  await waitFor(() => {
    expect(screen.queryByText('CEP: 01001-000')).toBeNull()
  })
})

test('removes the previous result when ViaCEP replies with erro: true', async () => {
  api.get.mockResolvedValueOnce({ data: previousResult })
  render(<App />)

  await search('01001000')
  await screen.findByText('CEP: 01001-000')

  api.get.mockResolvedValueOnce({ data: { erro: true } })
  await search('99999999')

  await waitFor(() => {
    expect(screen.queryByText('CEP: 01001-000')).toBeNull()
  })
})
