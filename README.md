# Revisão Residência: deploy em ~30 min, custo zero

## Como funciona
- A planilha do Google continua sendo o banco de dados e calcula as datas das revisões.
- O Apps Script lê a planilha e grava só **Questões** e **Acertos** da etapa registrada.
- O site (`index.html`) mostra:
  - **Hoje:** etapas com data de hoje.
  - **Atrasados:** etapas vencidas sem registro. Aparece só a mais antiga de cada assunto, ordenada por prioridade.

## Passo a passo
1. **Planilha em Google Sheets.** Se estiver como .xlsx, suba no Drive e abra com Planilhas Google (Arquivo → Salvar como Planilhas Google). Em Arquivo → Configurações, confira o fuso `America/Sao_Paulo`.
2. **Backend.** Na planilha, abra Extensões → Apps Script, apague o conteúdo e cole o `Code.gs`. Troque `TOKEN` por uma senha sua e confira `SHEET_NAME`.
3. **Publicar.** Implantar → Nova implantação → Tipo: App da Web → Executar como: **Eu** → Quem pode acessar: **Qualquer pessoa**. Autorize e copie a URL que termina em `/exec`.
4. **Frontend.** Abra `index.html` e troque `COLE_AQUI_A_URL_DO_APPS_SCRIPT` pela URL copiada.
5. **Hospedagem.** Crie um repositório no GitHub, envie `index.html`, `manifest.json`, `sw.js` e os dois `icon-*.png`. Em Settings → Pages, escolha Deploy from branch → `main` / root. O site fica no ar em ~1 min.
6. **Celular.** Abra a URL do site, digite a senha (`TOKEN`) e use "Adicionar à tela inicial".

## Teste obrigatório
Registre uma etapa e confira na planilha:
- Questões e Acertos preenchidos na linha certa.
- % de acertos calculado.
- Data da próxima revisão atualizada.

Se o % ou a data não mudarem, a célula não tem fórmula, e o ajuste é na planilha, não no site.

## Depois de editar o Code.gs
Implantar → Gerenciar implantações → lápis → Versão: Nova versão. Sem isso, a URL continua usando o código antigo.
