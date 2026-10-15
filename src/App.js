import { FiSearch } from 'react-icons/fi'
import './styles.css'
import { useState } from 'react'
import api from './services/api'

function App() {

  const [input, setInput] = useState('')
  const [cep, setCep] = useState({})

  async function handleSearch() {
    const digits = input.replace(/\D/g, '')
    if(digits.length === 0) {
      alert("Preencha algum CEP!");
      return;
    }
    if(digits.length !== 8) {
      alert("CEP deve ter 8 dígitos");
      return;
    }
    try {

      const response = await api.get(`${input}/json`)

      if (response.data.erro) {
        setCep({})
        alert("Ops! Erro ao buscar CEP!")
        setInput("")
        return
      }
      setCep(response.data)
      setInput("")
    } catch (error) {
      setCep({})
      alert("Ops! Erro ao buscar CEP!")
      setInput("")
    }
  }

  return (
    <div className="container">
      <h1 className="title">Buscador CEP</h1>
      <div className="containerInput">
        <input 
          type="text" 
          placeholder="Digite seu CEP..." 
          inputMode="numeric"
          maxLength={9}
          value={input} 
          onChange={(event)=>{setInput(event.target.value)}}
        />
        <button className="buttonSearch" onClick={handleSearch}>
          <FiSearch size={25} color="#FFFF"/>
        </button>
      </div>
      {Object.keys(cep).length > 0 && (
        <main className='main'>
          <h2>CEP: {cep.cep || '-'}</h2>
          <span>Logradouro: {cep.logradouro || '-'}</span>
          <span>Complemento: {cep.complemento || '-'}</span>
          <span>Bairro: {cep.bairro || '-'}</span>
          <span>Localidade: {cep.localidade || '-'}</span>
        </main>
      )}
    </div>
  );
}

export default App;
