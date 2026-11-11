import type { Slide } from "./types";

export const slides: Slide[] = [
  {
    id: "join",
    visual: { kind: "join" },
    interaction: {
      kind: "choice",
      pollId: "warmup",
      question: "Enquanto a gente começa: de onde você vem?",
      options: [
        { id: "es", label: "Engenharia de Software" },
        { id: "it", label: "Outro curso de computação" },
        { id: "other", label: "Outro curso da PUC" },
        { id: "market", label: "Já trabalho ou vim de fora" },
      ],
    },
    notes:
      "Tela aberta enquanto o pessoal chega. Peça pra todo mundo apontar o celular pro QR. Não precisa instalar nada nem criar conta.",
    cues: ["bora começar"],
  },
  {
    id: "title",
    section: "Abertura",
    visual: {
      kind: "title",
      eyebrow: "Turbinando sua carreira internacional · PUC Minas · 11 nov 2026",
      title: "De BH pro mundo.",
      subtitle:
        "O que eu aprendi trabalhando daqui pra empresas de fora, e o que a IA mudou nisso.",
    },
    notes:
      "Eu sentei nessas cadeiras. Formei aqui em 2019 e nunca saí de BH, mas trabalho pra empresas de fora há anos. Hoje eu quero mostrar com dados como funciona esse mercado, o que a IA mudou nele, e o que eu faria se estivesse no lugar de vocês.",
    cues: ["no lugar de vocês"],
  },
  {
    id: "me",
    section: "Abertura",
    visual: {
      kind: "list",
      eyebrow: "Quem está falando",
      title: "Formei aqui. Trabalho pro mundo daqui.",
      items: [
        { title: "PUC Minas, 2019", body: "Engenharia de Software" },
        { title: "Coinbase e Brex", body: "Times globais, remoto daqui" },
        { title: "PostHog", body: "Senior Product Engineer, remoto de BH desde 2024" },
        { title: "NaGringa", body: "Comunidade e dados de carreira pra dev brasileiro" },
      ],
    },
    notes:
      "Rápido, sem currículo. O ponto: geografia não é destino. E o NaGringa me dá uma coisa que pouca gente tem, que é dado de salário e vaga de milhares de devs brasileiros. Vou usar isso hoje.",
    cues: ["vou usar isso hoje"],
  },
  {
    id: "poll-abroad",
    section: "Abertura",
    visual: { kind: "results", eyebrow: "Pergunta pra vocês" },
    interaction: {
      kind: "choice",
      pollId: "abroad",
      question: "Trabalhar pra uma empresa de fora, morando no Brasil: onde você está?",
      options: [
        { id: "already", label: "Já trabalho assim" },
        { id: "want", label: "Quero, mas não sei por onde começar" },
        { id: "maybe", label: "Talvez, ainda não sei" },
        { id: "never", label: "Nunca tinha pensado nisso" },
      ],
    },
    notes:
      "Deixa votar uns 20 segundos e aperta R. Se a maioria estiver no 'quero, mas não sei por onde', é pra essa pessoa que eu fiz esta talk.",
  },
  {
    id: "doubts",
    section: "Abertura",
    visual: { kind: "questionsWall" },
    interaction: { kind: "questions" },
    notes:
      "Antes de começar: manda pelo celular a sua maior dúvida sobre carreira internacional, e vota nas dos outros. Eu vou olhar as mais votadas no meio da talk e respondo as que sobrarem no final.",
    cues: ["respondo as que sobrarem"],
  },
  {
    id: "outline",
    section: "Abertura",
    visual: {
      kind: "list",
      eyebrow: "O roteiro de hoje",
      title: "Quatro partes, uns 25 minutos.",
      items: [
        {
          title: "Mercado global",
          body: "Contra quem a empresa compete por talento define o seu teto",
        },
        { title: "O que a IA mudou", body: "Escrever software ficou barato. Julgamento, não" },
        { title: "O que o mundo compra", body: "Gente responsável pelo negócio, não pelo ticket" },
        { title: "Como chegar lá", body: "As portas de entrada, todas a partir de BH" },
      ],
    },
    notes:
      "Esse é o roteiro. Primeiro o mercado, com dados de salário de verdade. Depois o que a IA mudou nesse jogo, o que as empresas de fora compram agora, e por fim como sair daqui e chegar lá. Começando pelo mercado.",
    cues: ["começando pelo mercado"],
  },
  {
    id: "part-1",
    section: "1. Mercado global",
    visual: {
      kind: "section",
      number: "1",
      title: "Mercado global",
      lead: "Contra quem a empresa compete por talento define o seu teto.",
    },
    notes: 'Pausa curta. Anuncie a parte: "Parte um: mercado global." Dizer "parte um" avança.',
    cues: ["parte um", "parte 1"],
  },
  {
    id: "s2",
    section: "1. Mercado global",
    visual: {
      kind: "statement",
      eyebrow: "A tese",
      text: "Carreira internacional é escolher em que mercado você compete.",
      sub: "Não é sobre sair do país. É sobre aumentar as empresas que podem te contratar.",
    },
    notes:
      "O objetivo desta noite não é convencer ninguém a trabalhar pra fora. É mostrar que quanto mais empresas podem te contratar, mais opção você tem, e o mercado global é o maior conjunto delas. A mesma pessoa, morando em BH, pode estar no mercado local, no nacional ou no global. O que muda é contra quem a empresa compete por talento. Vou mostrar com salário.",
    cues: ["mostrar com salário"],
  },
  {
    id: "guess",
    section: "1. Mercado global",
    visual: { kind: "results", eyebrow: "Chute no celular" },
    interaction: {
      kind: "guess",
      pollId: "senior-guess",
      question: "Quanto ganha por mês, na mediana, um dev sênior que mora no Brasil?",
      min: 5000,
      max: 60000,
      step: 1000,
      answer: 20000,
      format: "brl-month",
    },
    notes:
      "Deixa chutar uns 20 segundos e revela com R. Resposta: uns R$ 20 mil por mês de remuneração total, que inclui bônus e ações. Metade ganha mais que isso, e 12% ganham mais de R$ 40 mil. Dado autodeclarado, 597 sêniores nos últimos 12 meses.",
  },
  {
    id: "by-tier",
    section: "1. Mercado global",
    visual: {
      kind: "bars",
      eyebrow: "Engenheiro de software sênior no Brasil, mediana mensal por mercado",
      title: "Três mercados, três salários.",
      bars: [
        { label: "Tier 1 · empresa que compete localmente", value: 13.5, display: "R$ 13,5 mil" },
        { label: "Tier 2 · compete no Brasil inteiro", value: 21.3, display: "R$ 21,3 mil" },
        {
          label: "Tier 3 · compete com o mundo",
          value: 65.3,
          display: "R$ 65,3 mil",
          highlight: true,
        },
      ],
      source:
        "Bases públicas de salários + NaGringa: 687 salários de engenheiro de software sênior no Brasil, desde ago/2024, nos tiers do modelo trimodal de Gergely Orosz (The Pragmatic Engineer). Remuneração total.",
    },
    notes:
      "Esse é o modelo trimodal, do Gergely Orosz. Tier 1 é a empresa que compete por talento na cidade, como consultoria. Tier 2 compete no Brasil inteiro. Tier 3 compete com o mundo. Só sênior, pra comparar igual com igual: a mesma pessoa, com a mesma stack, ganha quase cinco vezes mais dependendo de contra quem a empresa compete. A linguagem que você usa mexe uns 50% no salário. O mercado mexe cinco vezes.",
    cues: ["o mercado mexe cinco vezes", "mexe cinco vezes"],
  },
  {
    id: "connect-dots",
    section: "1. Mercado global",
    visual: { kind: "results", eyebrow: "Ligue os pontos" },
    interaction: {
      kind: "match",
      pollId: "connect-dots",
      question: "Contra quem cada uma compete por talento?",
      targets: [
        { id: "1", label: "Tier 1" },
        { id: "2", label: "Tier 2" },
        { id: "3", label: "Tier 3" },
      ],
      items: [
        { id: "dti", name: "dti digital", logo: "/logos/dtidigital.com.br.webp", answer: "1" },
        { id: "nubank", name: "Nubank", logo: "/logos/nubank.com.br.webp", answer: "2" },
        { id: "google", name: "Google", logo: "/logos/google.com.webp", answer: "3" },
      ],
    },
    notes:
      "Uma daqui de BH, uma brasileira gigante e uma global. Liga cada uma no tier dela. Deixa uns 20 segundos e fala mostra o resultado. A dti compete por talento aqui, o Nubank no Brasil inteiro, o Google com o mundo. Pelos nossos dados, sênior na dti fica perto de 14 mil por mês, no Nubank perto de 31 mil, e no Google bem acima de 50 mil.",
  },
  {
    id: "tier-list",
    section: "1. Mercado global",
    visual: {
      kind: "tierList",
      eyebrow: "Exemplos pela remuneração de sênior no NaGringa",
      title: "Nubank compete no Brasil. Uber, com o mundo.",
      rows: [
        {
          tier: "3",
          label: "Compete com o mundo",
          companies: [
            { name: "Uber", logo: "/logos/uber.com.webp" },
            { name: "Google", logo: "/logos/google.com.webp" },
            { name: "Coinbase", logo: "/logos/coinbase.com.webp" },
            { name: "Spotify", logo: "/logos/spotify.com.webp" },
            { name: "Brex", logo: "/logos/brex.com.webp" },
            { name: "GitHub", logo: "/logos/github.com.webp" },
            { name: "Airbnb", logo: "/logos/airbnb.com.webp" },
            { name: "PostHog", logo: "/logos/posthog.com.webp" },
          ],
        },
        {
          tier: "2",
          label: "Compete no Brasil",
          companies: [
            { name: "Nubank", logo: "/logos/nubank.com.br.webp" },
            { name: "Mercado Livre", logo: "/logos/mercadolivre.com.br.webp" },
            { name: "iFood", logo: "/logos/ifood.com.br.webp" },
            { name: "Itaú", logo: "/logos/itau.com.br.webp" },
            { name: "Bradesco", logo: "/logos/bradesco.com.br.webp" },
            { name: "Stone", logo: "/logos/stone.com.br.webp" },
            { name: "QuintoAndar", logo: "/logos/quintoandar.com.br.webp" },
            { name: "VTEX", logo: "/logos/vtex.com.webp" },
          ],
        },
        {
          tier: "1",
          label: "Compete na cidade",
          companies: [
            { name: "CI&T", logo: "/logos/ciandt.com.webp" },
            { name: "Accenture", logo: "/logos/accenture.com.webp" },
            { name: "Avanade", logo: "/logos/avanade.com.webp" },
            { name: "ThoughtWorks", logo: "/logos/thoughtworks.com.webp" },
            { name: "Zup", logo: "/logos/zup.com.br.webp" },
            { name: "Compass UOL", logo: "/logos/compass.uol.webp" },
            { name: "NTT DATA", logo: "/logos/nttdata.com.webp" },
            { name: "dti digital", logo: "/logos/dtidigital.com.br.webp" },
          ],
        },
      ],
      highlight: "Nubank",
      source:
        "Sênior, mediana mensal, dez/2025 a nov/2026: consultorias R$ 11 a 19 mil, bancos e grandes nacionais R$ 23 a 31 mil, globais R$ 50 a 66 mil.",
    },
    notes:
      "O Nubank é ótimo e paga bem, mas compete com o mercado brasileiro: tier 2. Consultoria compete na cidade: tier 1. E as globais competem com o mundo inteiro, e várias contratam quem mora aqui. Marca não é tier: tem empresa famosa pagando mercado local. E isso dá pra fazer morando em Belo Horizonte.",
    cues: ["morando em belo horizonte"],
  },
  {
    id: "tier-top",
    section: "1. Mercado global",
    visual: {
      kind: "tierTop",
      eyebrow: "Engenheiro de software sênior no Brasil, mediana mensal",
      title: "Empresas que vocês conhecem, tier por tier.",
      tiers: [
        {
          tier: "1",
          label: "Compete na cidade",
          median: 13500,
          companies: [
            { name: "ThoughtWorks", logo: "/logos/thoughtworks.com.webp", median: 15500 },
            { name: "GFT", logo: "/logos/gft.com.webp", median: 14900 },
            { name: "CI&T", logo: "/logos/ciandt.com.webp", median: 13500 },
          ],
        },
        {
          tier: "2",
          label: "Compete no Brasil",
          median: 21278,
          companies: [
            { name: "Nubank", logo: "/logos/nubank.com.br.webp", median: 26000 },
            { name: "BTG Pactual", logo: "/logos/btgpactual.com.webp", median: 20083 },
            { name: "Itaú", logo: "/logos/itau.com.br.webp", median: 19417 },
          ],
        },
        {
          tier: "3",
          label: "Compete com o mundo",
          median: 65313,
          companies: [
            { name: "Uber", logo: "/logos/uber.com.webp", median: 67500 },
            { name: "Google", logo: "/logos/google.com.webp", median: 62500 },
            { name: "Brex", logo: "/logos/brex.com.webp", median: 61667 },
          ],
        },
      ],
      source:
        "Bases públicas de salários + NaGringa, engenheiro de software sênior no Brasil, desde ago/2024, remuneração total mensal. 687 salários; cada empresa com 11 ou mais.",
    },
    notes:
      "Os mesmos números, agora com empresas que vocês conhecem. Nubank, BTG e Itaú pagam bem, e ainda assim ficam a um terço de quem compete com o mundo. Do tier 1 pro tier 2 são uns sessenta por cento. Do 2 pro 3, três vezes. Mesma pessoa, mesmo código, outra liga.",
    cues: ["outra liga"],
  },
  {
    id: "part-2",
    section: "2. O que a IA mudou",
    visual: {
      kind: "section",
      number: "2",
      title: "O que a IA mudou",
      lead: "Escrever software ficou barato. Julgamento, não.",
    },
    notes:
      'Pausa curta. Anuncie a parte: "Parte dois: o que a IA mudou." Dizer "parte dois" avança.',
    cues: ["parte dois", "parte 2"],
  },
  {
    id: "poll-ai",
    section: "2. O que a IA mudou",
    visual: { kind: "results", eyebrow: "Pergunta pra vocês" },
    interaction: {
      kind: "choice",
      pollId: "ai-share",
      question: "Quanto do que você produziu no último mês, código ou não, teve IA no meio?",
      options: [
        { id: "none", label: "Quase nada" },
        { id: "some", label: "Até um terço" },
        { id: "most", label: "Mais da metade" },
        { id: "all", label: "A IA faz, eu reviso" },
      ],
    },
    notes:
      "Parte 2. Escrever software deixou de ser o gargalo, e isso muda o que as empresas de fora procuram. Deixa votar uns 20 segundos e aperta R.",
  },
  {
    id: "posthog-output",
    section: "2. O que a IA mudou",
    visual: {
      kind: "bars",
      eyebrow: "Meus PRs mergeados na PostHog",
      title: "Mesmo engenheiro, outra ferramenta.",
      bars: [
        { label: "Jan a mar de 2025 · 90 dias", value: 101, display: "101 PRs · 11 mil linhas" },
        {
          label: "Set a nov de 2026 · 71 dias",
          value: 211,
          display: "211 PRs · 87 mil linhas",
          highlight: true,
        },
      ],
      source:
        "GitHub, PRs mergeados de lucasheriques na org PostHog. Entrei em dez/2024. Só novembro de 2026 já tem 88 PRs em 10 dias.",
    },
    notes:
      "Entrei na PostHog no fim de 2024. No primeiro trimestre eu fiz 101 PRs. Nos últimos 71 dias, 211, com quase oito vezes mais código. No NaGringa, fora do emprego, foram 395 PRs só em outubro. E esta apresentação que está no celular de vocês foi feita ontem, por agentes. Eu não virei mais rápido digitando. Eu passei a escrever menos código à mão e a decidir mais.",
    cues: ["decidir mais"],
  },
  {
    id: "scarce",
    section: "2. O que a IA mudou",
    visual: {
      kind: "compare",
      eyebrow: "Quando algo fica barato",
      title: "O escasso muda de lugar.",
      left: {
        label: "Ficou barato",
        items: ["Escrever código", "Aprender uma stack nova", "Fazer um protótipo"],
      },
      right: {
        label: "Ficou caro",
        items: ["Saber o que construir", "Ter gosto pra saber se está bom", "Fazer alguém usar"],
      },
    },
    notes:
      "Economia básica. Quando o custo de uma coisa cai, o valor vai pra o que é complementar a ela. O complemento do código é julgamento.",
    cues: ["complemento do código é julgamento"],
  },
  {
    id: "part-3",
    section: "3. O que o mundo compra",
    visual: {
      kind: "section",
      number: "3",
      title: "O que o mundo compra",
      lead: "Gente responsável pelo negócio, não pelo ticket.",
    },
    notes:
      'Pausa curta. Anuncie a parte: "Parte três: o que o mundo compra." Dizer "parte três" avança.',
    cues: ["parte três", "parte 3"],
  },
  {
    id: "pe-def",
    section: "3. O que o mundo compra",
    visual: {
      kind: "compare",
      eyebrow: "Product engineer",
      title: "Responsável pelo negócio, não pelo ticket.",
      left: {
        label: "Engenheiro de ticket",
        items: ["Recebe a especificação", "Entrega o que pediram", "Mede por código entregue"],
      },
      right: {
        label: "Product engineer",
        items: [
          "Conversa com o usuário",
          "Decide o que vale construir",
          "Mede pelo resultado do negócio",
        ],
      },
    },
    notes:
      "Se escrever código ficou barato, a empresa lá fora paga por quem sabe o que construir. No meu cargo isso tem nome: product engineer. Na PostHog, cada time pequeno de engenheiros é dono de um produto: fala com cliente, olha os dados de uso, decide o que construir e responde pelo resultado. Quem mais contrata product engineer são justamente as empresas tier 3. Com IA, quem só executa ticket compete com a máquina. Quem é responsável pelo negócio fica mais valioso.",
    cues: ["responsável pelo negócio fica mais valioso", "negócio fica mais valioso"],
  },
  {
    id: "positioning",
    section: "3. O que o mundo compra",
    visual: {
      kind: "compare",
      eyebrow: "Posicionamento",
      title: "Venda o problema que você resolve, não a stack.",
      left: {
        label: "Como quase todo mundo se apresenta",
        items: [
          "Dev Full Stack | React | Node | AWS",
          "Uma lista de tecnologias",
          "O que eu sei usar",
        ],
      },
      right: {
        label: "Como um product engineer se apresenta",
        items: [
          "Construo produtos de pagamento que milhares usam",
          "Problemas resolvidos e o resultado",
          "O que mudou pro negócio",
        ],
      },
    },
    notes:
      "Lembra do dado: a linguagem é o menor dos fatores de salário. Então não faz sentido se vender pela stack. Quem contrata lá fora quer saber que problema você resolve e que resultado gerou. E isso vale pra quem não é dev: a designer que reduziu o abandono do cadastro, o analista que achou onde o dinheiro vazava. Estudante também tem isso: um projeto com usuário de verdade e um número que mudou. Esse é o posicionamento que vence o mercado global.",
    cues: ["vence o mercado global"],
  },
  {
    id: "poll-skill",
    section: "3. O que o mundo compra",
    visual: { kind: "results", eyebrow: "Sinceridade" },
    interaction: {
      kind: "choice",
      pollId: "weak-skill",
      question: "Qual dessas você treina menos hoje?",
      options: [
        { id: "users", label: "Conversar com usuário" },
        { id: "data", label: "Olhar dados de uso e métricas" },
        { id: "ship", label: "Entregar algo do zero ao ar" },
        { id: "write", label: "Escrever bem" },
      ],
    },
    notes:
      "Revela com R. A faculdade treina quase só a parte técnica. As outras três vocês treinam por conta própria.",
  },
  {
    id: "part-4",
    section: "4. Como chegar lá",
    visual: {
      kind: "section",
      number: "4",
      title: "Como chegar lá",
      lead: "As portas de entrada, todas a partir de BH.",
    },
    notes:
      'Pausa curta. Anuncie a parte: "Parte quatro: como chegar lá." Dizer "parte quatro" avança.',
    cues: ["parte quatro", "parte 4"],
  },
  {
    id: "junior",
    section: "4. Como chegar lá",
    visual: {
      kind: "bigNumber",
      eyebrow: "A porta de entrada",
      value: "1 em 6",
      label: "vagas abertas no NaGringa com nível informado é pra júnior ou pleno.",
      source:
        "Vagas ativas em 10/11/2026: 52 júnior + 125 pleno de 1.064 com nível informado (1.111 sem nível).",
    },
    notes:
      "Tá, mas como sai de BH e chega lá? Começo com um dado que pouca gente fala pra estudante: o mercado global contrata quem já provou. Isso não é pra desanimar. É pra vocês não aplicarem só pra vaga tier 3 e acharem que o problema é vocês. O caminho honesto é começar onde se aprende rápido, acumular prova e subir de tier.",
    cues: ["acumular prova e subir de tier", "subir de tier"],
  },
  {
    id: "paths",
    section: "4. Como chegar lá",
    visual: {
      kind: "list",
      eyebrow: "Três portas, todas a partir de BH. Eu passei pelas três",
      title: "Escolha a porta pelo que ela te ensina.",
      items: [
        {
          title: "Trampolim local ou nacional",
          body: "Onde você aprende rápido. Eu: Rock Content e ioasys",
        },
        {
          title: "Contractor, direto ou por marketplace",
          body: "Paga em dólar, sem 13º nem FGTS. Eu: Coinbase pela G2i e PostHog direto",
        },
        {
          title: "CLT numa empresa global",
          body: "Padrão de fora sem sair do país. Eu: Brex",
        },
      ],
    },
    notes:
      "Lembrando: o objetivo não é trabalhar pra fora. É ter mais empresas pra escolher, e trabalhar pra fora é um meio. Comecei com WordPress em CLT local, depois PJ em consultoria. Primeira porta não é prêmio de consolação, muitas vezes é a melhor jogada pra estudante. Em 2020 entrei na G2i, um marketplace, com medo de nem passar na entrevista e com inglês longe de perfeito. Contractor não é informal: é vender confiança profissional. Quando teve layoff na Coinbase em 2022, quem me salvou foi o relacionamento com a Increment. Cada degrau foi porta aberta por gente que já tinha trabalhado comigo.",
    cues: ["já tinha trabalhado comigo", "trabalhado comigo"],
  },
  {
    id: "myths",
    section: "4. Como chegar lá",
    visual: {
      kind: "compare",
      eyebrow: "As dúvidas de sempre",
      title: "O que trava, e o que realmente pesa.",
      left: {
        label: "O que parece que trava",
        items: ["Inglês perfeito, sem sotaque", "Só FAANG vale a pena", "Decorar LeetCode"],
      },
      right: {
        label: "O que pesa de verdade",
        items: [
          "Inglês de trabalho: escrever claro e se explicar",
          "Indicação de quem já trabalhou com você",
          "Prova pública do que você fez",
        ],
      },
    },
    notes:
      "Isso vem das minhas mentorias: as dúvidas que mais aparecem são entrevista, salário e indicação. Sotaque ninguém liga, mas escrever bem em inglês pesa muito, porque trabalho remoto é escrito. Indicação vem de quem já trabalhou com você, então todo trabalho de agora conta. E projeto no ar, texto e contribuição contam mais que currículo: prova pública ganha de currículo.",
    cues: ["prova pública ganha de currículo", "ganha de currículo"],
  },
  {
    id: "referral",
    section: "4. Como chegar lá",
    visual: {
      kind: "bigNumber",
      eyebrow: "Indicação vs. aplicar online, com o mesmo currículo",
      value: "11x",
      label: "mais chance de ser contratado quando alguém te indica.",
      source:
        "Gem, 165 milhões de aplicações (2021 a 2025). Na Ashby, indicação é 1% das aplicações e 17 a 18% das contratações.",
    },
    notes:
      "Aplicar online é jogar na loteria. Na PostHog foram mais de 9 mil aplicações em 12 meses, uns 460 candidatos por vaga. Indicação é 1% das aplicações e quase um quinto das contratações. Então a pergunta não é onde aplicar. É quem pode te indicar.",
    cues: ["quem pode te indicar"],
  },
  {
    id: "who-refers",
    section: "4. Como chegar lá",
    visual: {
      kind: "list",
      eyebrow: "Quem pode te indicar, do mais forte pro mais fraco",
      title: "Sua rede já começou aqui na PUC.",
      items: [
        {
          title: "Colegas e ex-colegas",
          body: "Projeto de faculdade e estágio contam",
        },
        {
          title: "Professores e orientadores",
          body: "Conhecem ex-alunos no mercado inteiro",
        },
        {
          title: "Amigo de amigo",
          body: "Peça a apresentação com contexto",
        },
        {
          title: "Conexão fria com algo em comum",
          body: "Ex-aluno da PUC responde ex-aluno da PUC",
        },
      ],
    },
    notes:
      "Quem trabalhou com você e gostou de você é seu melhor recurso pras próximas oportunidades. Foi assim comigo: no layoff da Coinbase, quem me salvou foi a Increment. Cada trabalho em grupo daqui é a sua rede começando. E professor é atalho: eles conhecem gente do mercado inteiro.",
    cues: ["professor é atalho"],
  },
  {
    id: "cold-founder",
    section: "4. Como chegar lá",
    visual: {
      kind: "list",
      eyebrow: "Mensagem direta pra founder ou CTO de startup",
      title: "Fale direto com quem decide.",
      items: [
        {
          title: "Gancho específico",
          body: "Por que essa empresa, por que agora",
        },
        {
          title: "Valor antes de pedir",
          body: "Use o produto e mande uma melhoria real",
        },
        {
          title: "Pedido pequeno",
          body: "Uma conversa de 15 minutos, não um emprego",
        },
        {
          title: "Até 3 mensagens",
          body: "Follow-up educado funciona",
        },
      ],
    },
    notes:
      "Em 2019, júnior, eu queria trabalhar na Microsoft. Li um post de um engenheiro principal de lá e mandei uma mensagem contando a minha história de verdade, desde o servidor de Ragnarok aos 12 anos. Ele respondeu: love it, me manda um email. Founder de startup pequena lê o próprio LinkedIn. Quem usou o produto e chegou com feedback real vale mais que qualquer currículo.",
    cues: ["vale mais que qualquer currículo"],
  },
  {
    id: "homework",
    section: "Fechamento",
    visual: {
      kind: "list",
      eyebrow: "Se eu estivesse no seu lugar",
      title: "O que eu faria este semestre.",
      items: [
        { title: "Coloque algo no ar", body: "Com usuários de verdade, nem que sejam dez" },
        {
          title: "Mande uma mensagem por semana",
          body: "Pra um colega, um professor ou um founder. Peça indicação antes de aplicar",
        },
        {
          title: "Aumente suas opções",
          body: "Local, nacional ou global: quanto mais empresas podem te contratar, melhor",
        },
        {
          title: "Escreva em público, em inglês também",
          body: "O que aprendeu, o que errou, o que mediu",
        },
      ],
    },
    notes: "Quatro coisas concretas. Nenhuma depende de sair de BH.",
    cues: ["nenhuma depende de sair de bh"],
  },
  {
    id: "close",
    section: "Fechamento",
    visual: {
      kind: "statement",
      text: "IA deixa julgamento fraco mais alto e julgamento forte mais rápido.",
      sub: "De BH pro mundo · nagringa.dev",
    },
    presenterOnlyNotes: true,
    notes:
      "Frase final, devagar. Pausa. Depois: Obrigado! Agora eu quero ouvir as perguntas de vocês.",
    cues: ["perguntas de vocês", "ouvir as perguntas"],
  },
  {
    id: "qa",
    section: "Perguntas",
    visual: { kind: "questionsWall" },
    interaction: { kind: "questions" },
    notes: "As mais votadas sobem. Esconde as que não fizerem sentido.",
  },
];
