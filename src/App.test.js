import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import App from './App';
import api from './services/api';

jest.mock('./services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

describe('App', () => {
  let alertSpy;

  beforeEach(() => {
    api.get.mockReset();
    alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  // Types a CEP and clicks the search button, then waits for handleSearch to settle.
  async function searchFor(value) {
    render(<App />);
    const input = screen.getByPlaceholderText('Digite seu CEP...');
    fireEvent.change(input, { target: { value } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    return input;
  }

  describe('input validation', () => {
    it('normalizes a CEP typed with a hyphen', async () => {
      api.get.mockResolvedValue({ data: { cep: '01001-000' } });
      await searchFor('01001-000');
      expect(api.get).toHaveBeenCalledWith('01001000/json');
      expect(alertSpy).not.toHaveBeenCalled();
    });

    it('normalizes a CEP surrounded by spaces', async () => {
      api.get.mockResolvedValue({ data: { cep: '01001-000' } });
      await searchFor(' 01001000 ');
      expect(api.get).toHaveBeenCalledWith('01001000/json');
    });

    it('strips path-breaking characters before building the url', async () => {
      api.get.mockResolvedValue({ data: { cep: '01001-000' } });
      await searchFor('01001/000?#');
      expect(api.get).toHaveBeenCalledWith('01001000/json');
    });

    it('clears the input after a successful search', async () => {
      api.get.mockResolvedValue({ data: { cep: '01001-000' } });
      const input = await searchFor('01001000');
      expect(input).toHaveValue('');
    });

    it('does not call the api when the input is only spaces', async () => {
      const input = await searchFor('   ');
      expect(api.get).not.toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('Preencha algum CEP!');
      expect(input).toHaveValue('   ');
    });

    it('does not call the api when the input is empty', async () => {
      await searchFor('');
      expect(api.get).not.toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('Preencha algum CEP!');
    });

    it.each(['1234', '123456789'])('rejects a CEP with an invalid length: %s', async (value) => {
      const input = await searchFor(value);
      expect(api.get).not.toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('CEP deve ter 8 dígitos');
      expect(input).toHaveValue(value);
    });
  });

  describe('api results', () => {
    it('shows "CEP não encontrado" and renders no result card when ViaCEP returns {erro: true}', async () => {
      api.get.mockResolvedValue({ data: { erro: true } });

      render(<App />);

      fireEvent.change(screen.getByPlaceholderText('Digite seu CEP...'), {
        target: { value: '99999999' },
      });
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('CEP não encontrado');
      });

      expect(screen.queryByText(/^CEP:/)).toBeNull();
      expect(screen.queryByText(/Logradouro:/)).toBeNull();
      expect(screen.getByPlaceholderText('Digite seu CEP...').value).toBe('');
    });

    it('renders the result card for a valid CEP and falls back to "-" for empty/missing fields', async () => {
      api.get.mockResolvedValue({
        data: {
          cep: '01001-000',
          logradouro: 'Praça da Sé',
          complemento: '',
          bairro: 'Sé',
          localidade: 'SP',
        },
      });

      render(<App />);

      fireEvent.change(screen.getByPlaceholderText('Digite seu CEP...'), {
        target: { value: '01001000' },
      });
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText(/^CEP:/)).toBeTruthy();
      });

      expect(screen.getByText(/^CEP:/).textContent).toContain('01001-000');
      expect(screen.getByText(/^Complemento:/).textContent).toContain('-');
      expect(alertSpy).not.toHaveBeenCalled();
    });

    it('keeps the original error alert when the request fails', async () => {
      api.get.mockRejectedValue(new Error('network'));
      const input = await searchFor('01001000');
      expect(alertSpy).toHaveBeenCalledWith('Ops! Erro ao buscar CEP!');
      expect(input).toHaveValue('');
      expect(screen.queryByText(/^CEP:/)).toBeNull();
    });
  });
});
