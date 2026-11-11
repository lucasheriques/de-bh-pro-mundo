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
      title: "De BH pro mundo, sem sair de BH.",
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
    id: "s2",
    section: "1. Mercado global",
    visual: {
      kind: "statement",
      eyebrow: "Parte 1",
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
      eyebrow: "Dev sênior no Brasil, mediana mensal, por tier da empresa",
      title: "O tier é o mercado, não a marca.",
      bars: [
        { label: "Sem tier · mercado local", value: 17.7, display: "R$ 17,7 mil" },
        { label: "Tier B · US$ 50 a 89 mil/ano", value: 26.5, display: "R$ 26,5 mil" },
        { label: "Tier A · US$ 90 a 120 mil/ano", value: 51, display: "R$ 51 mil" },
        { label: "Tier S · US$ 120 mil+ remoto", value: 91, display: "R$ 91 mil", highlight: true },
      ],
      source:
        "Remuneração total/12, dez/2025 a nov/2026. Sem tier n=466, B n=104, A n=20, S n=7 (amostra pequena).",
    },
    notes:
      "A mesma pessoa, com a mesma stack, ganha várias vezes mais dependendo de contra quem a empresa compete por talento. E marca não é tier: tem empresa famosa pagando mercado local, e empresa que ninguém conhece pagando como as maiores do mundo. Aliás, a linguagem que você usa mexe uns 50% no salário. O tier mexe cinco vezes.",
    cues: ["mexe cinco vezes", "tier mexe cinco"],
  },
  {
    id: "tier-poll",
    section: "1. Mercado global",
    visual: { kind: "results", eyebrow: "Chute rápido" },
    interaction: {
      kind: "choice",
      pollId: "google-tier",
      question: "Em que tier o NaGringa coloca o Google?",
      options: [
        { id: "S", label: "Tier S" },
        { id: "A", label: "Tier A" },
        { id: "B", label: "Tier B" },
        { id: "none", label: "Sem tier" },
      ],
    },
    notes:
      "Deixa votar uns 15 segundos e aperta R. A maioria vai cravar S. Não fala a resposta, ela aparece logo depois.",
  },
  {
    id: "tier-list",
    section: "1. Mercado global",
    visual: {
      kind: "tierList",
      eyebrow: "Tier list do NaGringa · empresas que contratam quem mora no Brasil",
      title: "O Google é tier A. O Spotify é tier S.",
      rows: [
        {
          tier: "S",
          label: "US$ 120 mil+ e 100% remoto",
          companies: [
            { name: "NVIDIA", logo: "/logos/nvidia.com.webp" },
            { name: "GitHub", logo: "/logos/github.com.webp" },
            { name: "Spotify", logo: "/logos/spotify.com.webp" },
            { name: "Airbnb", logo: "/logos/airbnb.com.webp" },
            { name: "Shopify", logo: "/logos/shopify.com.webp" },
            { name: "Coinbase", logo: "/logos/coinbase.com.webp" },
            { name: "PostHog", logo: "/logos/posthog.com.webp" },
            { name: "Vercel", logo: "/logos/vercel.com.webp" },
          ],
        },
        {
          tier: "A",
          label: "US$ 90 a 120 mil ou presencial",
          companies: [
            { name: "Google", logo: "/logos/google.com.webp" },
            { name: "Apple", logo: "/logos/apple.com.webp" },
            { name: "Meta", logo: "/logos/meta.com.webp" },
            { name: "Microsoft", logo: "/logos/microsoft.com.webp" },
            { name: "Netflix", logo: "/logos/netflix.com.webp" },
            { name: "Amazon", logo: "/logos/amazon.com.webp" },
            { name: "Stripe", logo: "/logos/stripe.com.webp" },
            { name: "Uber", logo: "/logos/uber.com.webp" },
          ],
        },
        {
          tier: "B",
          label: "US$ 50 a 89 mil",
          companies: [
            { name: "Nubank", logo: "/logos/nubank.com.br.webp" },
            { name: "Mercado Livre", logo: "/logos/mercadolivre.com.br.webp" },
            { name: "iFood", logo: "/logos/ifood.com.br.webp" },
            { name: "QuintoAndar", logo: "/logos/quintoandar.com.br.webp" },
            { name: "XP", logo: "/logos/xpi.com.br.webp" },
            { name: "BTG Pactual", logo: "/logos/btgpactual.com.webp" },
            { name: "VTEX", logo: "/logos/vtex.com.webp" },
            { name: "BairesDev", logo: "/logos/bairesdev.com.webp" },
          ],
        },
      ],
      highlight: "Google",
      source:
        "nagringa.dev/vagas/tier-list. Hoje são 464 vagas abertas em tier S, 534 em A e 1.183 em B.",
    },
    notes:
      "Google, Apple, Meta e Microsoft são tier A, porque pra quem mora no Brasil as vagas são híbridas ou presenciais. Tier S é 100% remoto e paga US$ 120 mil ou mais. E Nubank, Mercado Livre e iFood estão no B: ótimas empresas pra começar e aprender, competindo no mercado nacional. São 464 vagas tier S abertas hoje, que dá pra fazer morando em Belo Horizonte.",
    cues: ["morando em belo horizonte"],
  },
  {
    id: "poll-ai",
    section: "2. O que a IA mudou",
    visual: { kind: "results", eyebrow: "Parte 2 · O que a IA mudou" },
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
    id: "pe-def",
    section: "3. O que o mundo compra",
    visual: {
      kind: "compare",
      eyebrow: "Parte 3 · O que o mundo compra",
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
      "Se escrever código ficou barato, a empresa lá fora paga por quem sabe o que construir. No meu cargo isso tem nome: product engineer. Na PostHog, cada time pequeno de engenheiros é dono de um produto: fala com cliente, olha os dados de uso, decide o que construir e responde pelo resultado. Das vagas de product engineer abertas hoje no NaGringa, 14 de 17 são em tier S ou A. Com IA, quem só executa ticket compete com a máquina. Quem é responsável pelo negócio fica mais valioso.",
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
    id: "junior",
    section: "4. Como chegar lá",
    visual: {
      kind: "bigNumber",
      eyebrow: "Parte 4 · Como chegar lá",
      value: "1 em 6",
      label: "vagas abertas no NaGringa com nível informado é pra júnior ou pleno.",
      source:
        "Vagas ativas em 10/11/2026: 52 júnior + 125 pleno de 1.064 com nível informado (1.111 sem nível).",
    },
    notes:
      "Tá, mas como sai de BH e chega lá? Começo com um dado que pouca gente fala pra estudante: o mercado global contrata quem já provou. Isso não é pra desanimar. É pra vocês não aplicarem só pra vaga tier S e acharem que o problema é vocês. O caminho honesto é começar onde se aprende rápido, acumular prova e subir de tier.",
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
          body: "Paga em dólar, sem 13º nem FGTS. Eu: Coinbase pela G2i e PostHog, tier S, direto",
        },
        {
          title: "CLT numa empresa global",
          body: "Padrão de fora sem sair do país. Eu: Brex, tier A",
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
    id: "homework",
    section: "Fechamento",
    visual: {
      kind: "list",
      eyebrow: "Se eu estivesse no seu lugar",
      title: "O que eu faria este semestre.",
      items: [
        { title: "Coloque algo no ar", body: "Com usuários de verdade, nem que sejam dez" },
        { title: "Use IA pra ir mais longe", body: "Não pra pular o entendimento" },
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
