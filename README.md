# ObraFlow — site

Landing page do **ObraFlow**, sistema de orçamentação de obra.

## Rodar localmente

```bash
node server.js
```

Abre em http://localhost:4173 — ou é só abrir `index.html` direto no navegador.

## Arquivos

| Arquivo | Descrição |
|---|---|
| `index.html` | Página completa, single-file (CSS, JS e vídeo de demonstração embutidos). |
| `obraflow-30s.mp4` | Vídeo do anúncio comprimido, versão avulsa. |
| `server.js` | Servidor estático simples para desenvolvimento. |

## Configuração

O número do WhatsApp e a mensagem pré-preenchida dos botões "Solicitar uma demonstração"
ficam no `<script>` de `index.html`, nas constantes `WA_NUMERO` e `WA_MSG`.

## Deploy

Qualquer hospedagem estática serve (GitHub Pages, Vercel, Netlify, Hostinger).
O site é um único HTML sem dependências externas.
