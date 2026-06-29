# 01 - Monitor de Emendas Brasil 📊 (Front-end & UI)

🔗 **[CLIQUE AQUI PARA ACESSAR O PAINEL AO VIVO](https://monitor-de-emendas-brasil.lovable.app/)**

O **Monitor de Emendas Brasil** é uma plataforma inteligente de abrangência nacional voltada à transparência governamental e auditoria cidadã. O ecossistema integra engenharia de dados em nuvem, um painel analítico interativo (Power BI) e um assistente de inteligência artificial generativa (Google Gemini) capaz de cruzar dados financeiros e identificar padrões estratégicos em tempo real.

<img width="1181" height="632" alt="Mo01" src="https://github.com/user-attachments/assets/d7f1ef87-5e8e-48b7-a2ba-a2f85703cbd4" />


Este repositório contém o código-fonte da **Interface do Usuário (Front-end)**, desenvolvida sob os princípios do *Vibe Coding*, componentização e foco em Experiência do Usuário (UI/UX).

## 🛠️ Stack Tecnológico (Front-end)

* **Framework Principal:** React com Vite
* **Arquitetura:** TanStack Start com Server-Side Rendering (SSR)
* **Estilização:** Tailwind CSS
* **Geração de UI:** Lovable Dev Platform
* **Integração Analítica:** Microsoft Power BI (Embed)

---

## 🚀 Arquitetura de Interface e Fluxo de Uso

A aplicação foi desenhada para traduzir a complexidade dos orçamentos públicos em uma navegação intuitiva e acessível. O fluxo de uso é dividido em duas áreas centrais de interação:

### 1. O Dashboard Interativo (Macrovisão)
Um *iframe* embedado do Power BI contendo a totalidade da base de dados nacional. Permite ao usuário explorar bilhões em emendas através de mapas de calor, evolução histórica e detalhamento de destinatários, utilizando filtros por estado, município e área de aplicação.

<img width="1064" height="832" alt="Mo02" src="https://github.com/user-attachments/assets/74363cc0-fb60-4f20-a51a-abeb333438e8" />


### 2. Radar de Auditoria & Assistente IA (Microvisão e Investigação)
O núcleo cognitivo da plataforma. O usuário seleciona o Estado e o Parlamentar desejado, acionando o nosso orquestrador de backend. A interface é dividida metodicamente:

* **Consultoria de Transparência (Chatbot):** Interface de conversação direta onde o cidadão pode fazer perguntas em linguagem natural à base de dados filtrada.
* **Painéis de Resposta Dinâmica:** O retorno da IA não é um bloco de texto massivo, mas sim estruturado em três componentes visuais distintos:
    1. **Perfil:** Contextualização do parlamentar e foco de atuação.
    2. **Dossiê de Auditoria:** Classificação baseada em IA que categoriza as movimentações em *Anomalia* (indícios de risco), *Insight* (foco setorial atípico) ou *Monitorando* (fluxo transparente).
    3. **Fontes e Fatos:** Exibição de manchetes clicáveis geradas a partir de *web scraping* (RSS feeds) de notícias recentes relacionadas ao alvo investigado.

<img width="1043" height="783" alt="Mo03" src="https://github.com/user-attachments/assets/f539902b-a707-4713-a2ce-ad79ee180110" />


> 💡 **Foco em Acessibilidade (UX):** A interface conta com *tooltips* (balões explicativos) detalhados sobre os critérios de análise da IA e um mecanismo de apoio ao projeto (*Apoia-se*) integrado ao cabeçalho para sustentabilidade da infraestrutura de nuvem.

---

## 🔗 O Motor do Projeto (Backend)

Para garantir segurança, performance e obediência às restrições de infraestrutura, o processamento pesado não ocorre no navegador. O motor de orquestração (n8n), o pipeline ETL automatizado e a integração com a API do LLM atuam de forma totalmente desacoplada e assíncrona em nosso backend.

👉 **Consulte a arquitetura de dados e infraestrutura aqui:** [Repositório 02 - Engenharia de Dados & Orquestração (n8n)](https://github.com/CarloGiacomoni/02-monitor_de_emendas_brasil-n8n)

---

## 🔄 Histórico de Evolução da Interface (V1 para V2)

A interface atual é o resultado de um processo iterativo focado em maturidade de dados e refinamento de experiência do usuário (UX):
* **Expansão de Escopo (Regional para Nacional):** O projeto original nasceu mapeando dados restritos a um estado (PoC). Na V2, o ecossistema foi escalado para cobrir toda a base de dados de emendas parlamentares federais do Brasil.
* **Refatoração do Radar de Auditoria:** O formato anterior exibia a resposta do chatbot de IA em blocos de texto únicos e estáticos. O layout atual desacoplou essas respostas, distribuindo a informação dinamicamente em componentes especializados de Perfil, Dossiê de risco e checagem de fatos em tempo real.

---

## 👨‍💻 Sobre o Desenvolvedor

Desenvolvido por **Carlo Giacomoni**, Analista de Dados Júnior e graduando em Ciência de Dados pela UNINTER. Este projeto consolida conhecimentos avançados em metodologias ágeis de desenvolvimento, orquestração de APIs, modelagem de dados e a aplicação de Inteligência Artificial Generativa como ferramenta de utilidade pública e controle social.
