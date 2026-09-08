/* Assistente ObraFlow — conteúdo e navegação do site público.
 *
 * ESCOPO: só ajuda o visitante a achar artigo/calculadora ou entender qual
 * parte do ObraFlow resolve a dúvida dele. É 100% front-end: não faz fetch,
 * não fala com o backend do produto, não cria orçamento nem calcula composição
 * real, não acessa dado de tenant. Quando a pergunta só o produto logado
 * resolve, a resposta é direcionar para demonstração / WhatsApp.
 */
(function () {
  'use strict';

  var WA_NUMERO = '5581985576458';
  function waHref(msg) {
    return 'https://wa.me/' + WA_NUMERO + '?text=' + encodeURIComponent(
      msg || 'Olá! Vim pelo assistente do site do ObraFlow e quero solicitar uma demonstração.'
    );
  }

  // Catálogo de conteúdo do site (títulos + rota + palavras-chave).
  var CONTENT = [
    { t: 'Como fazer orçamento de obra pelo quantitativo', u: '/blog/como-fazer-orcamento-de-obra/',
      k: ['orcamento', 'orçar', 'quantitativo', 'composicao', 'composição', 'como fazer', 'passo a passo', 'sinapi'] },
    { t: 'Como montar o orçamento de uma obra rápido, sem perder precisão', u: '/blog/orcamento-de-obra-rapido/',
      k: ['rapido', 'rápido', 'demora', 'agil', 'ágil', 'tempo', 'demorado', 'acelerar', 'horas', 'dias'] },
    { t: 'Planilha de orçamento de obra: por que sempre dá problema', u: '/blog/planilha-de-orcamento-de-obra/',
      k: ['planilha', 'excel', 'xlsx', 'formula', 'fórmula', 'ref', 'aba', 'versao final', 'erro'] },
    { t: 'Curva ABC na obra: onde estão os 80% do custo', u: '/blog/curva-abc-na-obra/',
      k: ['curva abc', 'abc', 'pareto', '80 20', '80/20', 'onde economizar', 'comprar melhor', 'negociar'] },
    { t: 'CREA: o que é, quem precisa de registro e as taxas em 2026', u: '/blog/crea-registro-taxas-2026/',
      k: ['crea', 'art', 'confea', 'registro', 'responsavel tecnico', 'responsável técnico', 'anuidade', 'taxa', 'habite-se', 'regulariza'] },
    { t: 'Calculadora: bloco, cimento e areia por m² de alvenaria', u: '/calculadoras/alvenaria-bloco-ceramico/',
      k: ['alvenaria', 'bloco', 'tijolo', 'cimento', 'areia', 'calculadora', 'quanto de'] },
    { t: 'Calculadora: aço, fôrma e concreto por m³ de estrutura', u: '/calculadoras/concreto-forma-aco-estrutura/',
      k: ['concreto', 'aço', 'aco', 'forma', 'fôrma', 'estrutura', 'taxa de aço', 'm3', 'm³', 'calculadora'] }
  ];

  // Intenções que NÃO são conteúdo: dão resposta curta + WhatsApp.
  var norm = function (s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  };

  function findContent(q) {
    var n = norm(q), hits = [];
    CONTENT.forEach(function (c) {
      var score = 0;
      c.k.forEach(function (kw) { if (n.indexOf(norm(kw)) !== -1) score += 2; });
      norm(c.t).split(/\W+/).forEach(function (w) { if (w.length > 3 && n.indexOf(w) !== -1) score += 1; });
      if (score > 0) hits.push({ c: c, score: score });
    });
    hits.sort(function (a, b) { return b.score - a.score; });
    return hits.slice(0, 3).map(function (h) { return h.c; });
  }

  var GREET =
    'Oi! Eu ajudo a encontrar o conteúdo certo aqui do site e a entender qual parte do ObraFlow ' +
    'resolve a sua dúvida. Sobre o que você quer saber?';

  var QUICK = [
    'Como orçar uma obra',
    'Curva ABC',
    'Planilha x sistema',
    'CREA e ART',
    'Quanto custa o ObraFlow'
  ];

  // Perguntas que só o produto logado resolve → direciona, nunca executa.
  var PRODUCT_ONLY = ['meu orcamento', 'minha obra', 'criar orcamento', 'fazer o orcamento agora',
    'calcula pra mim', 'monta pra mim', 'cadastrar', 'criar conta', 'login', 'entrar no sistema',
    'testar gratis', 'teste gratis', 'quero usar', 'acessar'];

  var PRICING = ['preco', 'preço', 'quanto custa', 'valor', 'plano', 'planos', 'mensalidade', 'assinatura', 'quanto é'];

  function reply(q) {
    var n = norm(q);

    if (PRICING.some(function (p) { return n.indexOf(norm(p)) !== -1; })) {
      return {
        html: 'O ObraFlow é <strong>venda assistida</strong> — nada de autocadastro. O preço e o formato ' +
          'a gente alinha na conversa, junto com a demonstração usando uma obra real sua. ' +
          'O melhor caminho é falar no WhatsApp.',
        wa: 'Olá! Vim pelo assistente do site do ObraFlow e quero entender preço e como funciona a demonstração.'
      };
    }

    if (PRODUCT_ONLY.some(function (p) { return n.indexOf(norm(p)) !== -1; })) {
      return {
        html: 'Isso acontece dentro do ObraFlow, com a sua obra — eu aqui só cuido do conteúdo do site e ' +
          'não tenho acesso ao sistema. Para ver funcionando com um caso seu, agende uma demonstração:',
        wa: 'Olá! Vim pelo assistente do site do ObraFlow e quero agendar uma demonstração com uma obra minha.'
      };
    }

    var found = findContent(q);
    if (found.length) {
      var list = found.map(function (c) { return '<li><a href="' + c.u + '">' + c.t + '</a></li>'; }).join('');
      return {
        html: 'Isto aqui deve ajudar:<ul>' + list + '</ul>Se preferir ver na prática com uma obra sua, é só chamar no WhatsApp.',
        wa: 'Olá! Vim pelo assistente do site do ObraFlow e quero solicitar uma demonstração.'
      };
    }

    return {
      html: 'Não achei um artigo exato para isso. Os temas que cobrimos são orçamento pelo quantitativo, ' +
        'curva ABC, planilha x sistema, controle de compra por nota fiscal e CREA/ART. ' +
        'Se quiser, me diga com outras palavras — ou fale direto com a equipe no WhatsApp.',
      wa: 'Olá! Vim pelo assistente do site do ObraFlow e tenho uma dúvida: '
    };
  }

  // ---------- UI ----------
  // CSS próprio: usa os tokens de tema do site (--btn, --bg, --ink...) quando existem,
  // com fallback para os valores da identidade ObraFlow. Assim funciona em qualquer página.
  var STYLE = '' +
    '.afab{position:fixed;right:18px;bottom:18px;z-index:2147483000;display:flex;align-items:center;gap:9px;padding:12px 16px 12px 13px;border:0;border-radius:980px;background:var(--btn,#0071e3);color:#fff;font-family:inherit;font-size:14px;font-weight:500;letter-spacing:-.01em;cursor:pointer;box-shadow:0 10px 30px -8px rgba(0,0,0,.4)}' +
    '.afab:hover{background:var(--btn-hover,#0077ed)}' +
    '.afab svg{width:18px;height:18px;flex:0 0 auto}' +
    '.afab__txt{white-space:nowrap}' +
    '@media (max-width:520px){.afab__txt{display:none}.afab{padding:13px}}' +
    '.apanel{position:fixed;right:18px;bottom:18px;z-index:2147483001;width:min(370px,calc(100vw - 36px));height:min(560px,calc(100vh - 36px));background:var(--bg,#fff);color:var(--ink,#1d1d1f);border:1px solid var(--hairline,#d2d2d7);border-radius:18px;box-shadow:0 24px 60px -12px rgba(0,0,0,.45);display:flex;flex-direction:column;overflow:hidden}' +
    '.apanel[hidden]{display:none}' +
    '.apanel__top{display:flex;align-items:flex-start;gap:10px;padding:14px;border-bottom:1px solid var(--hairline,#d2d2d7)}' +
    '.apanel__mark{flex:0 0 auto;width:34px;height:34px;border-radius:9px;background:var(--bg-alt,#f5f5f7);border:1px solid var(--hairline,#d2d2d7);display:grid;place-items:center}' +
    '.apanel__mark svg{width:18px;height:19px}' +
    '.apanel__id{flex:1;min-width:0}' +
    '.apanel__id strong{display:block;font-size:13.5px;letter-spacing:-.01em}' +
    '.apanel__id span{display:block;font-size:11.5px;color:var(--ink-3,#86868b);line-height:1.35;margin-top:1px}' +
    '.apanel__x{flex:0 0 auto;border:0;background:transparent;color:var(--ink-3,#86868b);font-size:20px;line-height:1;cursor:pointer;padding:2px 4px}' +
    '.apanel__log{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px}' +
    '.amsg{max-width:88%;font-size:14px;line-height:1.5;padding:10px 12px;border-radius:13px}' +
    '.amsg--bot{align-self:flex-start;background:var(--bg-alt,#f5f5f7);color:var(--ink,#1d1d1f);border-bottom-left-radius:4px}' +
    '.amsg--me{align-self:flex-end;background:var(--btn,#0071e3);color:#fff;border-bottom-right-radius:4px}' +
    '.amsg a{color:inherit;text-decoration:underline;text-underline-offset:2px}' +
    '.amsg--bot a{color:var(--link,#0066cc)}' +
    '.amsg ul{margin:8px 0 0;padding-left:18px}.amsg li{margin-top:4px}' +
    '.achips{display:flex;flex-wrap:wrap;gap:7px;padding:0 14px 10px}' +
    '.achip{border:1px solid var(--hairline,#d2d2d7);background:var(--bg,#fff);color:var(--ink,#1d1d1f);font-family:inherit;font-size:12.5px;letter-spacing:-.01em;padding:7px 11px;border-radius:980px;cursor:pointer}' +
    '.achip:hover{border-color:var(--btn,#0071e3);color:var(--btn,#0071e3)}' +
    '.achip--wa{border-color:var(--btn,#0071e3);background:var(--btn,#0071e3);color:#fff}' +
    '.aform{display:flex;gap:8px;padding:12px 14px;border-top:1px solid var(--hairline,#d2d2d7)}' +
    '.aform input{flex:1;min-width:0;font-family:inherit;font-size:14px;color:var(--ink,#1d1d1f);background:var(--bg,#fff);border:1px solid var(--hairline,#d2d2d7);border-radius:11px;padding:9px 12px}' +
    '.aform input:focus{outline:none;border-color:var(--btn,#0071e3)}' +
    '.aform button{flex:0 0 auto;border:0;border-radius:11px;background:var(--btn,#0071e3);color:#fff;font-family:inherit;font-size:14px;padding:9px 14px;cursor:pointer}' +
    '.aform button:hover{background:var(--btn-hover,#0077ed)}';

  var LOGO = '<svg viewBox="0 0 40 42" fill="#0071e3" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M17.2 5.633 8.6.855 0 5.633v26.51l16.2 9 16.2-9v-8.442l7.6-4.223V9.856l-8.6-4.777-8.6 4.777V18.3l-5.6 3.111V5.633ZM38 18.301l-5.6 3.11v-6.157l5.6-3.11V18.3Zm-1.06-7.856-5.54 3.078-5.54-3.079 5.54-3.078 5.54 3.079ZM24.8 18.3v-6.157l5.6 3.111v6.158L24.8 18.3Zm-1 1.732 5.54 3.078-13.14 7.302-5.54-3.078 13.14-7.3v-.002Zm-16.2 7.89 7.6 4.222V38.3L2 30.966V7.92l5.6 3.111v16.892ZM8.6 9.3 3.06 6.222 8.6 3.143l5.54 3.08L8.6 9.3Zm21.8 15.51-13.2 7.334V38.3l13.2-7.334v-6.156ZM9.6 11.034l5.6-3.11v14.6l-5.6 3.11v-14.6Z"/></svg>';

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  var panel, log, opened = false;

  function scrollLog() { log.scrollTop = log.scrollHeight; }

  function addMsg(kind, html) {
    var m = el('div', 'amsg amsg--' + kind, html);
    log.appendChild(m);
    scrollLog();
    return m;
  }

  function addWaButton(msg) {
    var wrap = el('div', 'achips');
    var a = el('a', 'achip achip--wa', 'Falar no WhatsApp');
    a.href = waHref(msg);
    a.target = '_blank';
    a.rel = 'noopener';
    wrap.appendChild(a);
    log.appendChild(wrap);
    scrollLog();
  }

  function handle(text) {
    if (!text || !text.trim()) return;
    addMsg('me', text.replace(/</g, '&lt;'));
    var r = reply(text);
    window.setTimeout(function () {
      addMsg('bot', r.html);
      addWaButton(r.wa + (r.wa.slice(-2) === ': ' ? text.replace(/</g, '&lt;') : ''));
    }, 260);
  }

  function build() {
    if (document.getElementById('obraflow-assistant-css')) return;
    var st = document.createElement('style');
    st.id = 'obraflow-assistant-css';
    st.textContent = STYLE;
    document.head.appendChild(st);

    panel = el('div', 'apanel');
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Assistente ObraFlow, conteúdo e dúvidas');

    var top = el('div', 'apanel__top');
    top.appendChild(el('div', 'apanel__mark', LOGO));
    top.appendChild(el('div', 'apanel__id',
      '<strong>Assistente ObraFlow · conteúdo e dúvidas</strong>' +
      '<span>Automatizado. Ajuda a achar conteúdo do site — não acessa o sistema nem faz orçamento.</span>'));
    var x = el('button', 'apanel__x', '&times;');
    x.setAttribute('aria-label', 'Fechar');
    x.onclick = toggle;
    top.appendChild(x);
    panel.appendChild(top);

    log = el('div', 'apanel__log');
    panel.appendChild(log);

    var chips = el('div', 'achips');
    QUICK.forEach(function (q) {
      var b = el('button', 'achip', q);
      b.onclick = function () { handle(q); };
      chips.appendChild(b);
    });
    panel.appendChild(chips);

    var form = el('form', 'aform');
    var input = el('input');
    input.type = 'text';
    input.placeholder = 'Escreva sua dúvida...';
    input.setAttribute('aria-label', 'Sua dúvida');
    var send = el('button', null, 'Enviar');
    send.type = 'submit';
    form.appendChild(input);
    form.appendChild(send);
    form.onsubmit = function (ev) {
      ev.preventDefault();
      var v = input.value;
      input.value = '';
      handle(v);
    };
    panel.appendChild(form);

    document.body.appendChild(panel);

    var fab = el('button', 'afab',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 21 11.5z"/></svg>' +
      '<span class="afab__txt">Precisa de ajuda?</span>');
    fab.setAttribute('aria-label', 'Abrir assistente de conteúdo');
    fab.onclick = toggle;
    document.body.appendChild(fab);
    window.__afab = fab;

    addMsg('bot', GREET);
  }

  function toggle() {
    opened = !opened;
    panel.hidden = !opened;
    if (window.__afab) window.__afab.style.display = opened ? 'none' : '';
    if (opened) {
      var i = panel.querySelector('.aform input');
      if (i) i.focus();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
