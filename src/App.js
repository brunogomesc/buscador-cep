import { FiSearch } from 'react-icons/fi'
import './styles.css'
import { useState } from 'react'
import api from './services/api'

function App() {

  const [input, setInput] = useState('')
  const [cep, setCep] = useState({})

  async function handleSearch() {
    if(input === '') {
      alert("Preencha algum CEP!");
      return;
    }
    try {
      const response = await api.get(`${input}/json`)
      setCep(response.data)
      setInput("")
    } catch (error) {
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
          value={input} 
          onChange={(event)=>{setInput(event.target.value)}}
        />
        <button className="buttonSearch" onClick={handleSearch}>
          <FiSearch size={25} color="#FFFF"/>
        </button>
      </div>
      {Object.keys(cep).length > 0 && (
        <main className='main'>
          {
            cep.cep === "" /* Condição */
            ? <h2>CEP: - </h2> /* Se for verdadeira */
            : <h2>CEP: {cep.cep}</h2> /* Se for falsa */
          }
          {
            cep.logradouro === "" /* Condição */
            ? <span>Logradouro: - </span> /* Se for verdadeira */
            : <span>Logradouro: {cep.logradouro}</span> /* Se for falsa */
          }
          {
            cep.complemento === "" /* Condição */
            ? <span>Complemento: - </span> /* Se for verdadeira */
            : <span>Complemento: {cep.complemento}</span> /* Se for falsa */
          }
          {
            cep.bairro === "" /* Condição */
            ? <span>Bairro: - </span> /* Se for verdadeira */
            : <span>Bairro: {cep.bairro}</span> /* Se for falsa */
          }
          {
            cep.localidade === "" /* Condição */
            ? <span>Localidade: - </span> /* Se for verdadeira */
            : <span>Localidade: {cep.localidade}</span> /* Se for falsa */
          }
        </main>
      )}
    </div>
  );
}

export default App;
