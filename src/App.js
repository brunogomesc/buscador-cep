import { FiSearch, FiArrowLeft, FiMapPin } from 'react-icons/fi'
import './styles.css'
import { useState } from 'react'
import api from './services/api'

const COMPANY_URL = 'https://sistemas.devcorehub.com.br/'
const SYSTEMS_URL = `${COMPANY_URL}#sistemas`

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
      const response = await api.get(`${digits}/json`)

      if (response.data.erro) {
        alert('CEP não encontrado')
        setCep({})
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
    <div className="page">
      <header className="nav">
        <div className="wrap nav__in">
          <a href={COMPANY_URL} className="brand" aria-label="DevCore HUB — site da empresa">
            <img src="/logo-mark.png" alt="" width="44" height="44" />
            <span className="brand__txt"><b className="c-blue">DEV</b><b>CORE</b> <b className="c-coral">HUB</b></span>
          </a>
          <a href={SYSTEMS_URL} className="back">
            <FiArrowLeft size={16} aria-hidden="true" /> Todos os sistemas
          </a>
        </div>
      </header>

      <main className="hero">
        <div className="hero__glow" aria-hidden="true"></div>
        <div className="wrap hero__in">
          <p className="eyebrow"><span className="dot"></span> Ferramenta DevCore HUB</p>
          <h1 className="title">Buscador <span className="grad">CEP</span></h1>
          <p className="lead">Digite o CEP e encontre o endereço completo em segundos.</p>

          <div className="containerInput">
            <input
              type="text"
              placeholder="Digite seu CEP..."
              inputMode="numeric"
              maxLength={9}
              aria-label="CEP"
              value={input}
              onChange={(event)=>{setInput(event.target.value)}}
              onKeyDown={(event)=>{ if (event.key === 'Enter') handleSearch() }}
            />
            <button className="buttonSearch" onClick={handleSearch} aria-label="Buscar CEP">
              <FiSearch size={22} aria-hidden="true" />
            </button>
          </div>

          {Object.keys(cep).length > 0 && (
            <section className='main' aria-live="polite">
              <FiMapPin className="main__pin" size={26} aria-hidden="true" />
              <h2>CEP: {cep.cep || '-'}</h2>
              <span>Logradouro: {cep.logradouro || '-'}</span>
              <span>Complemento: {cep.complemento || '-'}</span>
              <span>Bairro: {cep.bairro || '-'}</span>
              <span>Localidade: {cep.localidade || '-'}</span>
            </section>
          )}
        </div>
      </main>

      <footer className="foot">
        <div className="wrap foot__in">
          <p>© {new Date().getFullYear()} DevCore HUB. Todos os direitos reservados.</p>
          <p className="foot__links"><a href={COMPANY_URL}>sistemas.devcorehub.com.br</a></p>
        </div>
      </footer>
    </div>
  );
}

export default App;
