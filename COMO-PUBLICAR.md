# Como publicar o Heuris e testar no celular

Este é o projeto completo do Heuris, pronto para virar um site que você
abre e instala no celular como se fosse um app. Você não precisa saber
programar nem instalar nada no computador para isso. Todo o processo é
feito arrastando a pasta no site do Vercel.

## O que você vai fazer, em resumo

Você vai subir esta pasta no Vercel, um serviço gratuito que transforma
o projeto em um site com um link próprio. Depois abre esse link no
navegador do celular e adiciona na tela inicial. Pronto, vira um ícone
que abre em tela cheia.

## Passo 1 — Criar uma conta no Vercel

Acesse vercel.com e crie uma conta gratuita. Pode entrar com o Google,
é o mais rápido. Não precisa cadastrar cartão nem pagar nada.

## Passo 2 — Subir o projeto

Depois de logada, existem dois caminhos. O mais simples para quem não
usa GitHub é este:

1. No painel do Vercel, procure a opção de criar um novo projeto (New
   Project).
2. Em vez de conectar um repositório, use a opção de importar de forma
   manual. Se o Vercel pedir um repositório do GitHub e você não tiver,
   use o site vercel.com/new e arraste a pasta do projeto, ou instale
   a ferramenta de linha de comando conforme o passo alternativo abaixo.

Caminho alternativo, ainda sem GitHub, usando o terminal do seu
computador (funciona igual no Windows, Mac e Linux):

1. Instale o Node.js pelo site nodejs.org, versão LTS. É um passo único.
2. Abra o terminal dentro desta pasta.
3. Rode o comando: npx vercel
4. Ele vai fazer algumas perguntas simples. Aceite as respostas padrão
   apertando Enter. No fim ele te dá o link do site publicado.

Caminho recomendado a longo prazo, com GitHub:

1. Crie uma conta no github.com.
2. Suba esta pasta como um repositório novo.
3. No Vercel, conecte esse repositório. A partir daí, toda mudança que
   você fizer no código atualiza o site sozinha.

## Passo 3 — Abrir no celular e instalar na tela inicial

Depois de publicado, você recebe um link parecido com
heuris-algo.vercel.app. Abra esse link no celular.

No iPhone, usando o Safari:
1. Toque no botão de compartilhar, o quadrado com a seta para cima.
2. Escolha "Adicionar à Tela de Início".
3. Confirme. O ícone do Heuris aparece na sua tela como um app.

No Android, usando o Chrome:
1. Toque nos três pontinhos do menu.
2. Escolha "Adicionar à tela inicial" ou "Instalar app".
3. Confirme. O ícone aparece na sua tela.

Ao abrir por esse ícone, o Heuris abre em tela cheia, sem a barra do
navegador, com cara de aplicativo.

## Importante saber

Esta versão é para testar a experiência e o fluxo. Ela mostra
heurísticas de exemplo e ainda não salva o que você cria, não tem login,
e a parte da inteligência que lapida a identidade está encenada, não
conectada a uma IA real. Isso é de propósito. A ideia é você sentir se o
caminho das telas faz sentido no seu dedo antes de investir na parte de
baixo, que é banco de dados, contas de usuário e a IA de verdade.

Quando quiser dar esse próximo passo, o mesmo projeto serve de base.

## Rodar no seu próprio computador antes de publicar, se quiser

Se tiver o Node.js instalado, dentro desta pasta rode:

    npm install
    npm run dev

Ele mostra um endereço local, algo como localhost:5173, que você abre no
navegador do próprio computador para ver funcionando.
