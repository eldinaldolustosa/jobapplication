# GitHub Project Board Setup

## Pré-requisito: Habilitar escopo `project` no token

O escopo `project` não está habilitado no token atual. Para criar o Kanban board:

### Opção A — Via GitHub CLI (recomendado)

```bash
gh auth refresh -h github.com -s project,read:project
```

Abrirá o browser para autenticação. Após autorizar, execute:

```bash
# Criar o projeto Kanban
gh project create \
  --owner eldinaldolustosa \
  --title "JobApplication API — Sprint Board"

# Listar projetos para pegar o número
gh project list --owner eldinaldolustosa

# Adicionar todas as issues ao projeto (substitua <PROJECT_NUMBER>)
for i in 3 4 8 9 10 11 12 13 14 15 16 17; do
  gh project item-add <PROJECT_NUMBER> \
    --owner eldinaldolustosa \
    --url "https://github.com/eldinaldolustosa/jobapplication/issues/$i"
done
```

### Opção B — Via GitHub UI

1. Acesse [github.com/eldinaldolustosa](https://github.com/eldinaldolustosa)
2. Clique em **Projects** → **New project**
3. Selecione template **Board** (Kanban)
4. Nomeie: `JobApplication API — Sprint Board`
5. Clique em **+ Add item** e adicione as issues:
   - Issues #3, #4, #8, #9, #10 (Epics)
   - Issues #11, #12, #13, #14, #15, #16, #17 (User Stories)
 
### Estrutura do Kanban

| Coluna | Issues |
|--------|--------|
| **Done ✅** | #11 US01, #12 US02, #13 US03, #14 US04, #15 US05, #16 US06, #17 US07 |
| **In Review 🔍** | PR #1 (initial API), PR #2 (Atlas setup) |
| **Backlog 📋** | #3, #4, #8, #9, #10 (Epics — aguardando sub-stories futuras) |

### Automação via GitHub Actions

Após criar o projeto, configure:
1. **Settings → Variables (Repository)** → `PROJECT_NUMBER` = número do projeto
2. **Settings → Secrets → Actions** → `PROJECT_TOKEN` = PAT com escopos `project,read:project,repo`

A workflow `.github/workflows/project-automation.yml` moverá issues automaticamente.
