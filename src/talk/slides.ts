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
        { id: "it", label: "Outro curso do ICEI" },
        { id: "other", label: "Outro curso da PUC" },
        { id: "market", label: "Já trabalho ou vim de fora" },
      ],
    },
    notes: [
      "Tela aberta enquanto o pessoal chega",
      "Peça pra todo mundo apontar o celular pro QR: sem app, sem conta",
    ],
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
    notes: [
      "Eu sentei nessas cadeiras: PUC 2019, nunca saí de BH",
      "Promessa: dados de mercado, o que a IA mudou, e o que eu faria no lugar de vocês",
    ],
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
    notes: [
      "Rápido, sem currículo",
      "Geografia não é destino",
      "NaGringa: dados de salário e vaga de milhares de devs brasileiros, é daí que vêm os números",
    ],
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
    notes: [
      "O timer revela sozinho",
      "Se a maioria for 'quero, mas não sei por onde': é pra essa pessoa que eu fiz esta talk",
    ],
  },
  {
    id: "doubts",
    section: "Abertura",
    visual: { kind: "questionsWall" },
    interaction: { kind: "questions" },
    notes: [
      "Mandem a maior dúvida pelo celular, a qualquer momento, e votem nas dos outros",
      "As mais votadas eu respondo no final",
    ],
    cues: ["respondo as que sobrarem"],
  },
  {
    id: "part-1",
    section: "1. Mercado global",
    visual: {
      kind: "section",
      number: "1",
      title: "Mercado global",
      lead: "O que mais mexe no seu salário é o mercado em que a empresa compete. E dá pra escolher isso daqui.",
    },
    notes: [
      "A tese: carreira internacional é escolher em que mercado você compete",
      "Objetivo não é sair do país, é ter mais empresas que podem te contratar",
      "Mesma pessoa, em BH, pode estar no mercado local, nacional ou global",
    ],
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
    notes: [
      "Deixa o timer correr, é chute mesmo",
      "Resposta: uns R$ 20 mil por mês, remuneração total com bônus e ações",
      "Comentar o chute da sala contra o número real",
    ],
  },
  {
    id: "by-tier",
    section: "1. Mercado global",
    visual: {
      kind: "bars",
      eyebrow: "Engenheiro de software sênior no Brasil, mediana mensal por mercado",
      title: "Três mercados, três salários.",
      bars: [
        { label: "Tier 1 · compete na cidade", value: 13.5, display: "R$ 13,5 mil" },
        { label: "Tier 2 · compete no Brasil", value: 21.3, display: "R$ 21,3 mil" },
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
    notes: [
      "Modelo trimodal do Gergely Orosz: tier 1 compete na cidade, tier 2 no Brasil, tier 3 com o mundo",
      "Só sênior, igual com igual: R$ 13,5 mil, 21,3 mil, 65,3 mil",
      "Momento: a stack mexe uns 50% no salário. O mercado mexe cinco vezes",
    ],
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
    notes: [
      "Uma de BH, uma brasileira gigante, uma global",
      "Revela: dti tier 1, Nubank tier 2, Google tier 3",
      "Nubank é ótimo e paga bem, mas compete no Brasil",
    ],
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
    notes: [
      "Os mesmos números, com empresas que vocês conhecem",
      "Nubank, BTG e Itaú pagam bem e ainda ficam a um terço de quem compete com o mundo",
      "Do tier 1 pro 2, uns 60%. Do 2 pro 3, três vezes. Mesma pessoa, outra liga",
    ],
    cues: ["outra liga"],
  },
  {
    id: "part-2",
    section: "2. O que a IA mudou",
    visual: {
      kind: "section",
      number: "2",
      title: "O que a IA mudou",
      lead: "Escrever código ficou barato. Saber o que construir, não.",
    },
    notes: ["Parte dois: o que a IA mudou"],
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
    notes: [
      "Escrever software deixou de ser o gargalo",
      "Comentar quanto da sala já usa IA no dia a dia",
    ],
  },
  {
    id: "posthog-output",
    section: "2. O que a IA mudou",
    visual: {
      kind: "bars",
      eyebrow: "Meus PRs mergeados, em todos os projetos",
      title: "Dá pra fazer 10x mais. A\u00a0ambição tem que subir junto.",
      bars: [
        { label: "Jan a mar de 2025 · 90 dias", value: 101, display: "101 PRs · 1 por dia" },
        {
          label: "Set a nov de 2026 · 71 dias",
          value: 928,
          display: "928 PRs · 13 por dia",
          highlight: true,
        },
      ],
      source:
        "GitHub, PRs mergeados de lucasheriques: em 2025 só PostHog; em 2026 PostHog, NaGringa e projetos pessoais.",
    },
    notes: [
      "Momento: 1 PR por dia no começo de 2025, 13 por dia agora",
      "Esta apresentação foi feita ontem, por agentes",
      "Dá pra fazer muito mais, então a ambição tem que subir junto",
      "Fazer mais só vale se for a coisa certa: por isso o gosto pesa mais",
    ],
    cues: ["o gosto pesa mais"],
  },
  {
    id: "scarce",
    section: "2. O que a IA mudou",
    visual: {
      kind: "compare",
      eyebrow: "Escrever código ficou barato",
      title: "O que continua sendo com você.",
      left: {
        label: "A IA já faz",
        items: ["Escrever código", "Aprender uma stack nova", "Fazer um protótipo"],
      },
      right: {
        label: "Ainda é com você, e dá pra treinar agora",
        items: ["Saber o que construir", "Saber se ficou bom", "Fazer alguém usar"],
      },
    },
    notes: [
      "Quando algo fica barato, o valor vai pro que é complementar a ele",
      "O complemento do código é julgamento",
      "E isso dá pra treinar agora, na faculdade",
    ],
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
    notes: ["Parte três: o que o mundo compra"],
    cues: ["parte três", "parte 3"],
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
        label: "Como quem cuida do negócio se apresenta",
        items: [
          "Construo produtos de pagamento que milhares usam",
          "Problemas resolvidos e o resultado",
          "O que mudou pro negócio",
        ],
      },
    },
    notes: [
      "A stack é o menor fator de salário: não se venda por ela",
      "Quem contrata quer saber que problema você resolveu e que número mudou",
      "Vale pra estudante: um projeto com usuário de verdade já conta",
    ],
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
    notes: [
      "A faculdade treina quase só a parte técnica",
      "As outras três vocês treinam por conta própria",
    ],
  },
  {
    id: "part-4",
    section: "4. Como chegar lá",
    visual: {
      kind: "section",
      number: "4",
      title: "Como chegar lá",
      lead: "Três caminhos que eu fiz, todos daqui de BH.",
    },
    notes: ["Parte quatro: como chegar lá"],
    cues: ["parte quatro", "parte 4"],
  },
  {
    id: "junior",
    section: "4. Como chegar lá",
    visual: {
      kind: "bigNumber",
      eyebrow: "Vaga pra quem está começando",
      value: "1 em 6",
      label: "vagas abertas no NaGringa com nível informado é pra júnior ou pleno.",
      source:
        "Vagas ativas em 10/11/2026: 52 júnior + 125 pleno de 1.064 com nível informado (1.111 sem nível).",
    },
    notes: [
      "O mercado global contrata quem já provou",
      "Não é pra desanimar: é pra não aplicar só pra tier 3 e achar que o problema é você",
      "Caminho honesto: começa onde aprende rápido, acumula prova, sobe de tier",
    ],
    cues: ["acumular prova e subir de tier", "subir de tier"],
  },
  {
    id: "paths",
    section: "4. Como chegar lá",
    visual: {
      kind: "list",
      eyebrow: "Três caminhos, todos daqui de BH. Eu fiz os três",
      title: "Comece onde você aprende mais rápido.",
      items: [
        {
          title: "Empresa local ou nacional",
          body: "Onde você aprende rápido. Eu: Rock Content e ioasys",
        },
        {
          title: "Contractor pra empresa de fora",
          body: "Paga em dólar, sem 13º nem FGTS. Eu: Coinbase pela G2i e PostHog direto",
        },
        {
          title: "CLT numa empresa de fora",
          body: "Salário de fora sem sair do país. Eu: Brex",
        },
      ],
    },
    notes: [
      "O primeiro emprego aqui não é prêmio de consolação",
      "Minha história: WordPress CLT, consultoria PJ, G2i em 2020 com inglês longe de perfeito",
      "Contractor é trabalho sério: você vende confiança profissional",
      "Cada emprego veio de alguém que já tinha trabalhado comigo",
    ],
    cues: ["já tinha trabalhado comigo", "trabalhado comigo"],
  },
  {
    id: "myths",
    section: "4. Como chegar lá",
    visual: {
      kind: "compare",
      eyebrow: "As dúvidas de sempre",
      title: "O que pesa de verdade na contratação.",
      left: {
        label: "O que todo mundo acha",
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
    notes: [
      "Sotaque ninguém liga; escrever bem em inglês pesa, porque remoto é escrito",
      "Indicação vem de quem trabalhou com você: todo trabalho de agora conta",
      "Prova pública ganha de currículo",
    ],
    cues: ["prova pública ganha de currículo", "ganha de currículo"],
  },
  {
    id: "who-refers",
    section: "4. Como chegar lá",
    visual: {
      kind: "list",
      eyebrow: "Indicação dá 11x mais chance que aplicar online",
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
    notes: [
      "Aplicar online é loteria: 9 mil aplicações em 12 meses na PostHog",
      "Momento: indicação dá 11 vezes mais chance com o mesmo currículo",
      "Layoff da Coinbase: quem me salvou foi a Increment",
      "Trabalho em grupo daqui já é rede. Professor é atalho",
    ],
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
          title: "Um motivo específico",
          body: "Por que essa empresa, por que agora",
        },
        {
          title: "Mostre algo antes de pedir",
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
    notes: [
      "2019, júnior: mensagem pra um principal da Microsoft, ele respondeu 'love it'",
      "Founder de startup pequena lê o próprio LinkedIn",
      "Usar o produto e chegar com feedback real vale mais que currículo",
    ],
    cues: ["vale mais que qualquer currículo"],
  },
  {
    id: "recap",
    section: "Fechamento",
    visual: {
      kind: "list",
      eyebrow: "Resumo da noite",
      title: "Quatro coisas pra levar daqui.",
      items: [
        {
          title: "O mercado define o seu salário",
          body: "Contra quem a empresa compete pesa mais que a stack: quase 5x",
        },
        {
          title: "Escrever código ficou barato",
          body: "Dá pra fazer 10x mais. Saber o que construir é a parte cara",
        },
        {
          title: "Mostre o problema que você resolveu",
          body: "Se apresente pelo resultado, não pela lista de tecnologias",
        },
        {
          title: "Indicação ganha de aplicação",
          body: "Sua rede começa aqui: colegas, professores, ex-alunos",
        },
      ],
    },
    notes: [
      "Uma frase por parte, sem repetir a talk inteira",
      "Fecha perguntando qual delas cada um quer tentar primeiro",
    ],
    cues: ["quatro coisas pra levar"],
  },
  {
    id: "commit",
    section: "Fechamento",
    visual: { kind: "results", eyebrow: "Um passo pra essa semana" },
    interaction: {
      kind: "choice",
      pollId: "commit",
      question: "Qual destes você começa essa semana?",
      options: [
        { id: "ship", label: "Colocar um projeto no ar" },
        { id: "message", label: "Pedir uma indicação" },
        { id: "options", label: "Olhar vagas de empresas de fora" },
        { id: "write", label: "Postar o que eu aprendi" },
      ],
    },
    notes: [
      "Quatro coisas concretas pra essa semana, nenhuma depende de sair de BH",
      "Projeto no ar, com gente de verdade usando, nem que sejam dez",
      "Indicação: um colega, um professor ou alguém que já trabalhou com você",
      "Vagas de fora: só olhar já muda o que você acha possível",
      "Comentar o que a sala escolheu",
    ],
    cues: ["começa essa semana"],
  },
  {
    id: "close",
    section: "Fechamento",
    visual: {
      kind: "statement",
      text: "Escolha o seu mercado. Treine o seu julgamento.",
      sub: "nagringa.dev/links",
    },
    presenterOnlyNotes: true,
    notes: ["Frase final, devagar. Pausa", "Obrigado! Agora quero ouvir as perguntas de vocês"],
    cues: ["perguntas de vocês", "ouvir as perguntas"],
  },
  {
    id: "qa",
    section: "Perguntas",
    visual: { kind: "questionsWall", footer: "Minhas redes e contatos: nagringa.dev/links" },
    interaction: { kind: "questions" },
    notes: ["As mais votadas sobem; esconde as que não fizerem sentido"],
  },
];
