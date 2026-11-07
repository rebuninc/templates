# Spec: file-upload

## Relacionadas
- Altera: [002 — blog](./002-blog.md) — o campo "Imagem" vira o `FileUpload`, e na edição a imagem atual pode ser removida
- Altera: [012 — link-in-bio](./012-link-in-bio.md) — o campo "Avatar" vira o `FileUpload`, e na edição o avatar atual pode ser removido

## Objetivo
Um componente `FileUpload` (dropzone + lista de arquivos), inspirado no bloco de file upload do beui.dev, substitui os `<input type="file">` do post (blog) e do perfil (link-in-bio).

## Fora do escopo
- Progresso de envio, retry, player de áudio e lightbox da referência.
- Upload separado do submit: os arquivos continuam indo no `FormData` do form.
- Mais de uma imagem por post ou perfil: o modo múltiplo existe no componente, mas nenhum form usa.

## Comportamento
1. `FileUpload` (`src/components/ui/file-upload.tsx`, igual nos dois templates) recebe `label`, `name`, `accept`, `maxSize` (bytes), `multiple` (default `false`), `maxFiles` (default 1, ou 12 com `multiple`) e `current` (`{ url, name } | null`, o arquivo já salvo).
2. A dropzone é um `<label>` com borda tracejada, ícone de upload, o texto "Arraste ou clique para escolher" e a dica "Até {N} MB". Ela envolve um `<input type="file">` visualmente oculto, com o nome acessível igual a `label`. Clicar, ou focar e apertar Enter/Espaço, abre o seletor.
3. Arrastar um arquivo por cima destaca a dropzone (borda sólida, fundo realçado). Soltar o arquivo tem o mesmo efeito que escolher pelo seletor.
4. Cada arquivo aceito vira uma linha com thumbnail (URL temporária do arquivo), nome, tamanho ("1,2 MB") e um botão X com `aria-label` "Remover {nome}". As linhas entram com o fade/slide do `lib/motion.ts` e respeitam `prefers-reduced-motion`.
5. Os arquivos escolhidos são sincronizados no `input` nativo, então o `FormData` do form os envia com o `name` do campo. Um arquivo novo substitui o anterior no modo único e é adicionado à lista no modo múltiplo, até `maxFiles`. Ao atingir o limite, a dropzone fica desabilitada e mostra "Limite de arquivos atingido".
6. Arquivos rejeitados não entram na lista e mostram um `role="alert"` abaixo da dropzone: "{nome} é maior que {N} MB" ou "{nome} não é um tipo aceito".
7. Edição: com `current`, a lista começa com a linha do arquivo salvo (thumbnail da URL assinada). Remover essa linha adiciona um `<input type="hidden" name="{name}-remove" value="on">`. Ao salvar sem arquivo novo, o servidor grava `null` na coluna e exclui o arquivo antigo do storage. Escolher um arquivo novo substitui a linha atual, e o servidor faz a troca como já fazia.
8. Uso: post-form com `label="Imagem"`, `name="image"`, `maxSize` de 5 MB e `current` = imagem do post. profile-form com `label="Avatar"`, `name="avatar"`, `maxSize` de 2 MB e `current` = avatar do perfil. Os dois usam `accept="image/*"`. `getMine` (blog) passa a devolver `imageUrl`. O `Input` perde a variante de arquivo, que ficou sem uso.

## Casos de borda
- Soltar vários arquivos no modo único → só o primeiro entra.
- Soltar arquivos além de `maxFiles` no modo múltiplo → entram até o limite, e o resto mostra "Limite de arquivos atingido".
- Remover o arquivo atual e depois escolher um novo → vale o novo (o `-remove` sai do form).
- Uma linha removida ou o componente desmontado → a URL temporária é liberada (`URL.revokeObjectURL`).

## Critérios de aceite
- [x] Dado o form de post, quando solto uma imagem PNG na dropzone "Imagem", então aparece uma linha com o nome e o tamanho, e ao salvar a API recebe `image` com o caminho enviado ao storage.
- [x] Dado o form de perfil, quando escolho um avatar pelo seletor, então ele aparece na lista e ao salvar o avatar é enviado ao storage.
- [x] Dado o form de post, quando escolho uma imagem maior que 5 MB, então vejo o alerta "{nome} é maior que 5 MB" e a lista continua vazia.
- [x] Dado o form de perfil, quando escolho um arquivo que não é imagem, então vejo o alerta "{nome} não é um tipo aceito".
- [x] Dado um arquivo escolhido, quando clico em "Remover {nome}", então a linha some e o form não envia arquivo.
- [x] Dado a edição de um post com imagem, quando abro o form, então vejo a linha da imagem atual. Quando a removo e salvo, então a API recebe `image: null` e a imagem antiga é excluída do storage.
- [x] Dado a edição de um perfil com avatar, quando removo o avatar atual e salvo, então a API recebe `avatar: null` e o avatar antigo é excluído do storage.
- [x] Dado a edição com imagem, quando salvo sem mexer no campo, então a imagem atual é mantida.
