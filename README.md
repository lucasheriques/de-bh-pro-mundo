# De BH pro mundo

Live deck for the talk "De BH pro mundo" (PUC Minas, November 2026). The projector shows the slides, the room joins on their phones through a QR code, votes, guesses, reacts and asks questions, and results update live through Convex. The presenter can advance slides by voice. Built with React, Vite and Convex. MIT licensed, fork it for your own talk.

Deck ao vivo da talk "De BH pro mundo". O projetor mostra os slides, a plateia entra pelo celular via QR code, vota, palpita, reage e pergunta, e os resultados aparecem na hora pelo Convex. Os slides avançam por voz.

## Rotas

| Rota | Quem usa | O que mostra |
| --- | --- | --- |
| `/` | Celular da plateia | A interação do slide atual, legendas ao vivo, reações |
| `/stage` | Projetor | Canvas 1920x1080 escalado para a janela, QR, resultados ao vivo, mural de perguntas |
| `/presenter` | Notebook de quem apresenta | Slide atual e próximo, notas, cronômetro, contagem de votos, moderação, voz |
| `/admin` | Quem apresenta | Controles de administração da sessão |
| `/overview` | Qualquer tela | Visão geral de todos os slides |
| `/legendas` | Qualquer tela | Legendas ao vivo em tela cheia |
| `/conteudo` | Quem quiser ler depois | A talk como artigo simples, para compartilhar |

O QR do slide de entrada usa `window.location.origin`, então abra o `/stage` pela URL pública. Abra `/stage?key=SUA_CHAVE` uma vez: a chave é guardada no navegador e removida da barra de endereço.

## Teclado

Funciona no stage e no presenter. Passadores de slide (clickers) enviam essas teclas também.

| Tecla | Ação |
| --- | --- |
| Direita, Baixo, PageDown, Espaço | Próximo slide |
| Esquerda, Cima, PageUp | Slide anterior |
| R | Mostrar ou esconder a votação atual |
| V | Ligar ou desligar a voz |
| C | Linha de legenda no stage |
| F | Tela cheia |
| T | Tema escuro ou claro do stage, lembrado por janela (o celular fica escuro) |

A navegação é otimista: o stage muda na hora e a mutação sincroniza em segundo plano. Se o wifi cair, as trocas ficam na fila e chegam quando o socket voltar.

## Comandos de voz

Só a página do presenter escuta (Chrome, `pt-BR`). Ligue com V e permita o microfone.

Comandos falados valem em todos os slides, inclusive nas votações: "próximo slide", "pra frente" ou "slide seguinte" avançam um; "volta um", "volta slide" ou "slide anterior" voltam um; "mostra o resultado" revela a votação atual (nunca esconde). Depois de cada comando há um bloqueio de 2 segundos.

Um slide avança quando quem apresenta diz qualquer uma das suas `cues`. A comparação ignora maiúsculas, acentos e pontuação, aceita até 2 palavras extras entre as palavras da cue, dentro de uma janela das últimas 25 palavras faladas. Depois de um acerto, a voz fica travada por 2 segundos e até o slide mudar, e o resto da frase é ignorado, então uma frase nunca pula dois slides. Slides sem `cues` só avançam por comando falado ou clicker, e as cues nunca voltam slides. As transcrições finais viram legendas ao vivo.

O matcher é o módulo puro `src/voice/match.ts` (testes em `match.test.ts`). Em dev, a página do presenter expõe `window.__voiceFeed(text, isFinal)` para alimentar o mesmo pipeline com texto.

## Rode a sua

Precisa de Node 20 ou mais novo e pnpm (`corepack enable`).

```sh
pnpm install
npx convex dev          # cria o projeto Convex, gera .env.local e observa convex/
node scripts/presenter-key.mjs   # cria a PRESENTER_KEY no deployment e guarda no .env.local
pnpm dev                # Vite em http://localhost:3051
```

Rode `npx convex dev` e `pnpm dev` em terminais separados. O `.env.local` (fora do git) guarda `CONVEX_DEPLOYMENT`, `VITE_CONVEX_URL` e `PRESENTER_KEY`. Para o deployment de produção, passe `--prod` ao `presenter-key.mjs`.

### Publicar

```sh
npx convex deploy                          # funções e schema de produção
VITE_CONVEX_URL=https://<your-deployment>.convex.cloud pnpm build
```

Sirva a pasta `dist/` em qualquer hospedagem estática (Vercel, Netlify, Cloudflare Pages). O app tem várias rotas, então configure o fallback de SPA para `index.html`.

## Editar os slides

O conteúdo fica em `src/talk/slides.ts`, tipado por `src/talk/types.ts`. Um único registro alimenta as três superfícies (celular, stage e presenter). Troque os slides, as votações e as `cues`, e o resto acompanha.

## Verificações

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build              # precisa de VITE_CONVEX_URL
pnpm e2e                # precisa de convex dev e vite rodando; salva screenshots em .checks/
```

O e2e controla um stage, um presenter e três celulares contra o deployment de desenvolvimento. Ele zera sessão, votações e perguntas antes de começar, então nunca aponte para produção.

## Decisão de design: visuais dos resultados

- Direção "Multidão", um gráfico de unidades. Cada voto é um ponto que cai na pilha da sua opção; no celular, o ponto de quem votou pulsa com a etiqueta "você". Cores vivas por opção, sans arredondada, números grandes.
- Tema do stage: escuro por padrão, claro na tecla T. Projetores não desenham preto, então a sala iluminada lava o fundo escuro para cinza. Teste do fundo da sala antes de escolher.
- Os pontos escalam com o total de votos, para a maior pilha ocupar cerca de 60% do gráfico entre 12 e 150 votos.
- Descartados: "Placar" (placar de eleição, azul e laranja), barulhento mas genérico, e o líder nunca sobe; "Editorial" (papel estilo FT, serifa, frase anotada), o movimento some no fundo da sala.
- Risco em aberto: efeito manada no palco, já que quem vota por último vê o líder. O celular continua honesto: o resultado só aparece depois do seu próprio voto.

## Licença e créditos

MIT, veja [LICENSE](./LICENSE). Os logos em `public/logos` são marcas dos respectivos donos e aparecem só para ilustrar a talk.

Feito por Lucas Faria ([NaGringa](https://nagringa.dev)) para a PUC Minas, novembro de 2026.
