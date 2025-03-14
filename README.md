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
docker build -t dockerconexia/agentesv2:v2.5 .

# Push para Docker Hub
docker push dockerconexia/agentesv2:v2.5
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