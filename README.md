# Unifev — Agendamento de Aulas

Dashboard para agendamento de salas de aula e laboratórios da Unifev.

## Stack

- [TanStack Start](https://tanstack.com/start) (React 19 + TanStack Router, roteamento por arquivos em `src/routes`)
- Vite + Tailwind CSS v4
- Componentes [shadcn/ui](https://ui.shadcn.com) (Radix UI)
- Nitro para o build de produção (preset Vercel no deploy)
- Banco: PostgreSQL no Supabase, acessado via [Prisma](https://www.prisma.io) (esquema portável para MySQL)
- Login: [Better Auth](https://www.better-auth.com) com RA (ou e-mail, para o administrador) + senha

## Desenvolvimento

Requer Node.js >= 20.12.

1. Copie `.env.example` para `.env` e preencha as strings de conexão do Supabase
   (botão **Connect** → aba **ORMs** → Prisma) e um `BETTER_AUTH_SECRET`.
2. Instale e rode:

```sh
npm install         # também gera o Prisma Client
npm run db:deploy   # aplica as migrations no banco
npm run db:seed     # configurações padrão + conta do administrador
npm run dev         # http://localhost:8080
```

Outros comandos: `npm run build`, `npm run lint`, `npm run db:migrate` (cria uma migration
após alterar `prisma/schema.prisma`), `npm run db:studio` (visualizar o banco) e
`npm run db:limpar-exemplos` (remove os dados fictícios inseridos pelo seed antigo).

## Acesso

O sistema tem um único administrador:

| E-mail             | Senha inicial |
| ------------------ | ------------- |
| unifev@admin.com   | admin102030   |

A conta é criada pelo seed e, se ele não tiver sido rodado, no primeiro acesso à tela de login.
O banco começa vazio: o administrador cadastra salas, disciplinas e usuários (Coordenador ou
Professor). Os usuários entram com o RA e a senha temporária (data de nascimento, DDMMAAAA, ou
aleatória, conforme as Configurações) e precisam definir uma senha pessoal no primeiro acesso.

## Deploy (Vercel)

A integração do Supabase cria `POSTGRES_PRISMA_URL` e as demais variáveis. Também é preciso
`BETTER_AUTH_SECRET` em Production e Preview. Migrations não rodam no build: aplique com
`npm run db:deploy` antes de publicar mudanças no esquema.

## Trocar para MySQL

1. Em `prisma/schema.prisma`, mude `provider = "postgresql"` para `"mysql"`.
2. Instale `@prisma/adapter-mariadb` e troque `PrismaPg` por `PrismaMariaDb` em `src/lib/db.server.ts`.
3. Em `src/lib/auth.server.ts`, use `provider: "mysql"` no `prismaAdapter`.
4. Apague `prisma/migrations` e gere de novo com `npm run db:migrate`.
