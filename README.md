# Araras Transit Map

Contexto: https://github.com/luisluders05-stack/BUSTRAKING.git

Continue o desenvolvimento do projeto BUSTRAKING existente neste repositório.

Não recrie o projeto do zero. Antes de implementar, analise a estrutura atual, os componentes existentes, a identidade visual, a navegação e os padrões já utilizados no projeto. As novas páginas devem parecer parte do mesmo sistema.

O BUSTRAKING é um projeto acadêmico interdisciplinar do curso de Sistemas de Informação, voltado ao acompanhamento e consulta do transporte público urbano de Araras-SP.

O repositório já possui uma Landing Page e outras estruturas desenvolvidas. Quero adicionar principalmente duas novas funcionalidades:

Página de HORÁRIOS E BAIRROS

Página de MAPA / ROTAS

1. PÁGINA DE HORÁRIOS E BAIRROS

Criar uma nova página chamada:

"Horários"

Objetivo:
Permitir que o usuário consulte de forma muito mais simples e organizada os horários das linhas de transporte público de Araras-SP, utilizando como fonte de dados o PDF fornecido junto a este prompt.

IMPORTANTE:

O PDF anexado contém os horários e bairros das linhas.

Utilize os dados do PDF como fonte principal.

NÃO invente horários, bairros, linhas ou informações que não estejam presentes no PDF.

NÃO altere os horários existentes.

Quando houver alguma informação difícil de interpretar no PDF, mantenha a informação conforme a fonte em vez de criar uma suposição.

O PDF possui uma organização por linha, bairro e diferentes períodos:

Segunda-feira a sexta-feira

Sábado

Domingo

Feriado

A página deve transformar essas informações em uma interface web muito mais fácil de consultar.

Estrutura da página

Manter a Navbar/Header já existente no projeto.

Criar no topo:

Título:

"Horários de ônibus"

Subtítulo:

"Consulte os horários das linhas e encontre o melhor horário para sua viagem."

Adicionar uma área de filtros.

Filtros

Criar:

Campo de pesquisa

Seleção de linha

Seleção de bairro

Seleção do período/dia

A pesquisa deve permitir procurar pelo:

número da linha

nome do bairro

nome da região

Exemplos de linhas presentes no PDF:

0102
0101
0202
0201
1201
1001
0301
1003
0801
0901
0803
0401
0501
0403
0701
1501
1601
1502
0702
1101
0601
1103
1301
1401

Utilize somente as linhas efetivamente identificadas no PDF.

Cards de linhas

Antes da tabela, criar uma visualização em cards para as linhas.

Cada card deve apresentar:

Número da linha

Nome dos bairros atendidos

Indicador visual de disponibilidade

Botão "Ver horários"

Botão ou link "Ver rota"

Exemplos de informações presentes no documento:

Linha 0102
José Ometto | Jd. Morumbi

Linha 0202
Pq. Tiradentes | Dom Pedro | Jair Della Coletta

Linha 1201
Warley Colombini | Costa Verde | Portal do Sol

Linha 1001
Bela Vista

Linha 0301
Narciso Gomes

Linha 0801
Jardim Fátima | Vila Lobos

Linha 0901
Jd. Ouro Verde | Jd. das Nações | Abolição

Linha 0401
Parque das Árvores | Alto da Colina

Linha 0501
Jd. Alvorada | Jd. Pedras Preciosas

Linha 0701
Jd. São João | Jd. São Pedro

Linha 1501
Jd. Milton Severino

Linha 1601
Jd. Apolo | Jd. Vida Nova

Linha 1502
Jd. Milton Severino | Jd. Apolo | Jd. Vida Nova

Linha 0702
Jd. Milton Severino | Jd. Apolo | Jd. Vida Nova | Jd. São João

Linha 1101
Jd. Candida | Jd. Rosana

Linha 0601
Jd. Sobradinho | Jd. Nova Olinda

Linha 1103
Jd. Sobradinho | Jd. Cândida

Linha 1301
Distrito Industrial V | Tenneco | Savegnago

Linha 1401
Fazenda Cascata

Existem outras linhas/combinações no documento. Caso sejam identificadas no PDF, elas também devem ser incluídas.

TABELA DE HORÁRIOS

Ao selecionar uma linha, mostrar seus horários em uma tabela organizada.

A tabela deve permitir visualizar claramente:

Horário

Saída do Terminal

Destino/Bairro

Período

Organizar os horários conforme os quatro grupos existentes no PDF:

SEGUNDA A SEXTA
SÁBADO
DOMINGO
FERIADO

Criar tabs ou um seletor para alternar entre esses períodos.

Exemplo visual:

[ Segunda a Sexta ] [ Sábado ] [ Domingo ] [ Feriado ]

Abaixo:

HorárioSentido/Destino05:20Bairro06:40Bairro08:00Bairro

Os valores acima são apenas exemplos de estrutura. Os horários reais devem ser carregados a partir do PDF.

BUSCA POR BAIRRO

Também quero que seja possível pesquisar um bairro.

Exemplo:

Usuário pesquisa:

"Jd. São João"

O sistema deve apresentar as linhas relacionadas ao bairro e permitir visualizar os horários correspondentes.

Criar uma experiência semelhante a:

"Encontre seu bairro"

[ Digite o nome do bairro... ]

Resultado:

Linha 0701
Jd. São João | Jd. São Pedro

Linha 0702
Jd. Milton Severino | Jd. Apolo | Jd. Vida Nova | Jd. São João

RESPONSIVIDADE

No desktop, utilizar tabelas completas.

No celular, não deixar a tabela quebrar o layout.

Pode utilizar:

rolagem horizontal
OU

transformação das linhas em cards.

O layout deve funcionar em:

Desktop

Notebook

Tablet

Smartphone

2. PÁGINA DE MAPA E ROTAS

Criar uma nova página chamada:

"Mapa"

ou

"Rotas"

Essa será uma das páginas principais do BUSTRAKING.

O objetivo é apresentar um mapa interativo de Araras-SP mostrando as linhas e suas rotas.

Utilizar preferencialmente:

Leaflet + OpenStreetMap

ou a solução de mapas já utilizada no projeto, caso exista.

NÃO substituir uma solução existente sem necessidade.

ESTRUTURA DO MAPA

Criar uma página com layout semelhante a aplicativos modernos de mobilidade urbana.

O mapa deve ocupar a maior parte da tela.

Adicionar um painel lateral.

Desktop:

┌──────────────────────────────────────┐
│ NAVBAR │
├───────────────┬──────────────────────┤
│ │ │
│ CONTROLES │ │
│ │ MAPA │
│ Linhas │ │
│ Bairros │ │
│ Pesquisa │ │
│ │ │
└───────────────┴──────────────────────┘

No celular, transformar o painel lateral em um painel retrátil/bottom sheet ou botão para abrir os controles.

CONTROLES DO MAPA

Adicionar:

Campo:

"Pesquisar linha ou bairro"

Filtro:

"Todas as linhas"

E opções para selecionar uma linha específica.

Exemplo:

☐ Todas
☐ 0102
☐ 0101
☐ 0202
☐ 0201
☐ 1201
...

Utilizar as linhas presentes no PDF.

ROTAS

Quando o usuário selecionar uma linha:

destacar a rota no mapa

mostrar o número da linha

mostrar os bairros atendidos

mostrar os pontos/locais importantes da rota, quando esses dados estiverem disponíveis

permitir ocultar a rota

permitir voltar para "Todas as linhas"

Cada linha pode ter uma representação visual própria no mapa, mas mantenha a identidade visual geral do sistema.

IMPORTANTE SOBRE AS ROTAS

O PDF fornecido contém horários e bairros, mas NÃO fornece coordenadas geográficas detalhadas das rotas.

Portanto:

NÃO inventar ruas, coordenadas ou trajetos exatos como se fossem dados oficiais.

Criar a arquitetura do mapa preparada para receber futuramente as coordenadas reais das rotas.

Enquanto os dados geográficos reais não estiverem disponíveis, utilizar dados de demonstração claramente identificados como:

"Rota demonstrativa"

ou

"Dados de demonstração"

Não apresentar uma rota fictícia como se fosse o trajeto oficial do TCA.

Estruturar os dados de maneira que futuramente seja possível substituir os dados de demonstração por GeoJSON ou coordenadas reais.

MARCADORES

O mapa deve estar preparado para mostrar:

Terminal

Pontos de parada

Ônibus

Rotas

Utilizar ícones intuitivos.

Exemplo:

🚌 Ônibus
📍 Ponto
🏁 Terminal

Os elementos devem utilizar componentes do sistema em vez de emojis sempre que houver ícones apropriados disponíveis.

PAINEL DA LINHA

Ao clicar em uma linha no mapa ou no painel lateral, abrir um card com:

Número da linha

Nome dos bairros

Horários

Botão:

"Ver horários"

Botão:

"Ver rota completa"

Exemplo:

LINHA 0701

Jd. São João
Jd. São Pedro

[Ver horários]
[Ver rota]

INTEGRAÇÃO COM A PÁGINA DE HORÁRIOS

As duas páginas devem estar conectadas.

Na página "Horários":

Botão:

"Ver rota"

→ abre a página de Mapa já com a linha selecionada.

Na página "Mapa":

Botão:

"Ver horários"

→ abre a página de Horários já filtrada pela linha selecionada.

Exemplo:

/horarios?linha=0701

/mapa?linha=0701

Utilizar parâmetros de URL ou outra solução limpa para manter o estado selecionado.

TERMINAL

Adicionar o Terminal Municipal como ponto de referência no mapa.

O terminal deve possuir um marcador diferenciado.

Ao clicar:

"Terminal"

Mostrar informações básicas disponíveis no projeto.

Não inventar endereço ou informações que não estejam na fonte fornecida.

DESIGN

Manter exatamente a identidade visual já criada no BUSTRAKING.

O repositório define uma identidade moderna, tecnológica e relacionada à mobilidade urbana, utilizando principalmente:

Azul

Branco

Detalhes em verde

Cards arredondados

Sombras suaves

Ícones de transporte/mapa/localização

Interface limpa

Não criar uma identidade visual completamente diferente.

As novas páginas devem parecer extensões naturais da Landing Page existente.

NAVEGAÇÃO

Adicionar as novas páginas ao sistema de navegação existente.

Garantir que:

Landing Page
↓
Horários

e

Landing Page
↓
Mapa / Rotas

funcionem corretamente.

Também integrar com as páginas existentes de:

Dashboard

Rastrear ônibus

Itinerários

Pontos de parada

Caso essas rotas já existam, reutilizar os componentes e estruturas existentes em vez de duplicá-los.

DADOS

Criar uma estrutura de dados organizada e reutilizável.

Sugestão:

busLines
neighborhoods
schedules
routes
stops

Separar os dados da interface.

Não colocar grandes quantidades de dados diretamente dentro dos componentes React.

Criar tipos TypeScript para representar:

BusLine
Neighborhood
Schedule
Route
BusStop

A arquitetura deve permitir futuramente substituir os dados locais por dados vindos do Supabase/API.

PDF COMO FONTE

O PDF anexado deve ser considerado a fonte dos horários e bairros.

O sistema deve preservar os dados fornecidos pelo documento.

Algumas informações presentes no documento incluem:

código da linha

bairros atendidos

horários de saída do terminal

horários de retorno

segunda a sexta

sábado

domingo

feriado

Exemplo de fonte:

0102 — José Ometto | Jd. Morumbi

0202 — Pq. Tiradentes | Dom Pedro | Jair Della Coletta

1201 — Warley Colombini | Costa Verde | Portal do Sol

1001 — Bela Vista

0301 — Narciso Gomes

0801 — Jardim Fátima | Vila Lobos

0901 — Jd. Ouro Verde | Jd. das Nações | Abolição

0401 — Parque das Árvores | Alto da Colina

0501 — Jd. Alvorada | Jd. Pedras Preciosas

0701 — Jd. São João | Jd. São Pedro

1501 — Jd. Milton Severino

1601 — Jd. Apolo | Jd. Vida Nova

1502 — Jd. Milton Severino | Jd. Apolo | Jd. Vida Nova

0702 — Jd. Milton Severino | Jd. Apolo | Jd. Vida Nova | Jd. São João

1101 — Jd. Candida | Jd. Rosana

0601 — Jd. Sobradinho | Jd. Nova Olinda

1103 — Jd. Sobradinho | Jd. Cândida

1301 — Distrito Industrial V | Tenneco | Savegnago

1401 — Fazenda Cascata

Use o PDF completo para complementar a base de dados e não apenas essa lista de exemplos.

QUALIDADE DE IMPLEMENTAÇÃO

Antes de finalizar:

Verifique as rotas existentes.

Não quebre nenhuma página existente.

Reutilize componentes existentes.

Não duplique Navbar, Sidebar ou componentes desnecessariamente.

Garanta que os links funcionem.

Garanta que os filtros funcionem.

Garanta que a pesquisa funcione.

Garanta que a seleção de uma linha filtre os horários.

Garanta que "Ver rota" abra o mapa correto.

Garanta que "Ver horários" abra a linha correta.

Garanta responsividade.

Garanta estados de loading.

Garanta estados vazios.

Garanta mensagens de erro amigáveis.

Garanta que o mapa carregue corretamente.

Garanta que os dados do PDF não sejam alterados ou inventados.

Priorize código limpo, modular, reutilizável e fácil de entender.

O resultado deve parecer uma aplicação real de mobilidade urbana, mas deixar claro quando algum dado for apenas demonstrativo.

Não remova funcionalidades existentes do BUSTRAKING.

Implemente as duas novas páginas dentro da arquitetura atual do projeto.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://ara-bus-buddy.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4df6f627-9701-4ca3-9f3f-584a6516a87b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
