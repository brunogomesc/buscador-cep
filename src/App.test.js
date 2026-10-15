import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import App from './App';
import api from './services/api';

jest.mock('./services/api', () => ({
  get: jest.fn(),
}));

describe('App CEP search validation', () => {
  let alertSpy;

  beforeEach(() => {
    alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    api.get.mockReset();
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

  it('keeps the original error alert when the request fails', async () => {
    api.get.mockRejectedValue(new Error('network'));
    const input = await searchFor('01001000');
    expect(alertSpy).toHaveBeenCalledWith('Ops! Erro ao buscar CEP!');
    expect(input).toHaveValue('');
  });
});
