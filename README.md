# ConexIA - Frontend

Frontend da aplicação ConexIA, desenvolvida para automatizar a gestão de condomínios com inteligência artificial.

## Requisitos

- Node.js 20+
- Docker e Docker Compose para deploy

## Configuração

1. Clone o repositório
2. Copie `.env.example` para `.env` e configure as variáveis
3. Instale as dependências:
```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

## Build e Deploy

### Build Local
```bash
# Limpar arquivos temporários
./clean.sh

# Build da imagem Docker
docker build -t fmguardia/agentesv2:v2.5 .

# Push para Docker Hub
docker push fmguardia/agentesv2:v2.5
```

### Deploy com Docker Swarm
```bash
docker stack deploy -c docker-compose.yml conexia
```

## Variáveis de Ambiente

- `VITE_SUPABASE_URL`: URL do projeto Supabase
- `VITE_SUPABASE_KEY`: Chave anônima do Supabase
- `VITE_MINIO_ENDPOINT`: Endpoint do Minio para upload de arquivos
- `VITE_BACKEND_URL`: URL da API backend
- `VITE_MINIATURA`: URL da miniatura do app
- `VITE_URLINFO`: Informações adicionais
- `VITE_TITULO`: Título do app
- `VITE_FAVICON`: URL do favicon
- `VITE_DESCRICAO`: Descrição do app

## Funcionalidades

- Autenticação via Supabase
- Upload de arquivos para Minio
- Interface moderna e responsiva
- Integração com IA para gestão condominial

## Observações Importantes

### Carregamento de Variáveis de Ambiente no Docker

**ATENÇÃO**: Para que as variáveis de ambiente sejam carregadas corretamente no frontend quando executado em Docker, é essencial que o arquivo `index.html` contenha a seguinte linha antes do script principal:

```html
<script src="/env-config.js"></script>
```

Este script é gerado dinamicamente pelo container Docker durante a inicialização e substitui as variáveis de ambiente do template. Sem esta referência, o frontend não conseguirá acessar as variáveis de ambiente através do objeto `window.env` e resultará em erros como:

```
Uncaught Error: Missing Supabase environment variables. Please check your .env file.
```

Nunca remova esta linha ao fazer alterações no arquivo `index.html`.