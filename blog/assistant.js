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
      msg || 'Olá! Vim pelo assistente do blog do ObraFlow e quero solicitar uma demonstração.'
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
        wa: 'Olá! Vim pelo assistente do blog do ObraFlow e quero entender preço e como funciona a demonstração.'
      };
    }

    if (PRODUCT_ONLY.some(function (p) { return n.indexOf(norm(p)) !== -1; })) {
      return {
        html: 'Isso acontece dentro do ObraFlow, com a sua obra — eu aqui só cuido do conteúdo do site e ' +
          'não tenho acesso ao sistema. Para ver funcionando com um caso seu, agende uma demonstração:',
        wa: 'Olá! Vim pelo assistente do blog do ObraFlow e quero agendar uma demonstração com uma obra minha.'
      };
    }

    var found = findContent(q);
    if (found.length) {
      var list = found.map(function (c) { return '<li><a href="' + c.u + '">' + c.t + '</a></li>'; }).join('');
      return {
        html: 'Isto aqui deve ajudar:<ul>' + list + '</ul>Se preferir ver na prática com uma obra sua, é só chamar no WhatsApp.',
        wa: 'Olá! Vim pelo assistente do blog do ObraFlow e quero solicitar uma demonstração.'
      };
    }

    return {
      html: 'Não achei um artigo exato para isso. Os temas que cobrimos são orçamento pelo quantitativo, ' +
        'curva ABC, planilha x sistema, controle de compra por nota fiscal e CREA/ART. ' +
        'Se quiser, me diga com outras palavras — ou fale direto com a equipe no WhatsApp.',
      wa: 'Olá! Vim pelo assistente do blog do ObraFlow e tenho uma dúvida: '
    };
  }

  // ---------- UI ----------
  var LOGO = '<svg viewBox="0 0 40 42" fill="#7db3ff" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M17.2 5.633 8.6.855 0 5.633v26.51l16.2 9 16.2-9v-8.442l7.6-4.223V9.856l-8.6-4.777-8.6 4.777V18.3l-5.6 3.111V5.633ZM38 18.301l-5.6 3.11v-6.157l5.6-3.11V18.3Zm-1.06-7.856-5.54 3.078-5.54-3.079 5.54-3.078 5.54 3.079ZM24.8 18.3v-6.157l5.6 3.111v6.158L24.8 18.3Zm-1 1.732 5.54 3.078-13.14 7.302-5.54-3.078 13.14-7.3v-.002Zm-16.2 7.89 7.6 4.222V38.3L2 30.966V7.92l5.6 3.111v16.892ZM8.6 9.3 3.06 6.222 8.6 3.143l5.54 3.08L8.6 9.3Zm21.8 15.51-13.2 7.334V38.3l13.2-7.334v-6.156ZM9.6 11.034l5.6-3.11v14.6l-5.6 3.11v-14.6Z"/></svg>';

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
