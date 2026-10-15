# Buscador de CEP

Ferramenta da DevCore HUB para consultar endereço a partir do CEP (API ViaCEP). Publicada em https://cep.devcorehub.com.br/ e listada na aba Sistemas de https://sistemas.devcorehub.com.br/.

## Stack

React 18 (Create React App), axios, react-icons. Visual no padrão da marca DevCore HUB (azul-noturno, azul elétrico e coral, fonte Montserrat).

## Executar localmente

```bash
npm ci
npm start      # http://localhost:3000
npm test
npm run build
```

## Deploy (produção)

Container `buscador_cep` (build em duas etapas: Node → nginx) no VPS, ouvindo em `127.0.0.1:3035`. O Cloudflare Tunnel mapeia `cep.devcorehub.com.br` para essa porta.

```bash
git ls-files -co --exclude-standard -z | tar --null -T - -czf - | ssh root@147.93.36.194 'mkdir -p /root/buscador-cep && cd /root/buscador-cep && tar -xzf - && docker build -q -t buscador_cep:latest . && docker rm -f buscador_cep; docker run -d --name buscador_cep --restart unless-stopped -p 127.0.0.1:3035:80 buscador_cep:latest'
```
