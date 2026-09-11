/* ObraFlow — captura de lead antes do WhatsApp.
 *
 * Intercepta todo clique em ".js-wa" (os botões "Solicitar/Agendar demonstração"
 * espalhados pelo site) e abre um formulário curto. O envio vai para o Web3Forms
 * (serviço gratuito de terceiros — só recebe os campos deste formulário, nunca
 * dado de tenant/produto). Depois do envio, mostra um link para continuar a
 * conversa no WhatsApp já com os dados preenchidos.
 *
 * CONFIGURAÇÃO NECESSÁRIA: troque ACCESS_KEY abaixo pela chave gratuita gerada
 * em https://web3forms.com (informe o e-mail onde quer receber os pedidos,
 * confirme e cole a chave aqui). Sem isso o formulário não envia.
 */
(function () {
  'use strict';

  var ACCESS_KEY = '5908c080-16af-4f83-a3df-f20396711e79';
  var WA_NUMERO = '5581985576458';

  function waHref(nome, empresa, cidade, obras) {
    var msg = 'Olá! Preenchi o formulário do site pedindo uma demonstração do ObraFlow.\n\n' +
      'Nome: ' + nome + '\n' +
      'Construtora: ' + (empresa || '-') + '\n' +
      'Cidade: ' + (cidade || '-') + '\n' +
      'Obras por ano (aprox.): ' + (obras || '-') + '\n\n' +
      'Fico no aguardo!';
    return 'https://wa.me/' + WA_NUMERO + '?text=' + encodeURIComponent(msg);
  }

  var STYLE = '' +
    '.lm-overlay{position:fixed;inset:0;z-index:3000000000;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:18px}' +
    '.lm-overlay[hidden]{display:none}' +
    '.lm-modal{width:min(440px,100%);max-height:calc(100vh - 36px);overflow-y:auto;background:var(--bg,#fff);color:var(--ink,#1d1d1f);border-radius:20px;box-shadow:0 30px 80px -20px rgba(0,0,0,.5);padding:26px 26px 24px;position:relative}' +
    '.lm-close{position:absolute;right:16px;top:16px;border:0;background:transparent;color:var(--ink-3,#86868b);font-size:22px;line-height:1;cursor:pointer;padding:4px 6px}' +
    '.lm-eyebrow{font-size:13px;font-weight:600;color:var(--btn,#0071e3);margin:0 0 6px;letter-spacing:-.01em}' +
    '.lm-title{font-size:22px;font-weight:600;letter-spacing:-.02em;margin:0 0 8px;line-height:1.2}' +
    '.lm-sub{font-size:14px;color:var(--ink-2,#6e6e73);line-height:1.5;margin:0 0 18px}' +
    '.lm-field{margin-bottom:12px}' +
    '.lm-field label{display:block;font-size:12.5px;color:var(--ink-2,#6e6e73);margin-bottom:5px;letter-spacing:-.01em}' +
    '.lm-input{width:100%;font-family:inherit;font-size:15px;color:var(--ink,#1d1d1f);background:var(--bg-alt,#f5f5f7);border:1px solid var(--hairline,#d2d2d7);border-radius:11px;padding:11px 13px;box-sizing:border-box}' +
    '.lm-input:focus{outline:none;border-color:var(--btn,#0071e3);box-shadow:0 0 0 4px rgba(0,113,227,.15)}' +
    '.lm-row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}' +
    '.lm-honey{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}' +
    '.lm-submit{width:100%;border:0;border-radius:980px;background:var(--btn,#0071e3);color:#fff;font-family:inherit;font-size:15px;font-weight:500;padding:13px;cursor:pointer;margin-top:6px}' +
    '.lm-submit:hover{background:var(--btn-hover,#0077ed)}' +
    '.lm-submit:disabled{opacity:.6;cursor:default}' +
    '.lm-note{font-size:11.5px;color:var(--ink-3,#86868b);margin:12px 0 0;line-height:1.4}' +
    '.lm-err{font-size:13px;color:#d93a3a;margin:10px 0 0;display:none}' +
    '.lm-err.is-on{display:block}' +
    '.lm-ok{display:none;text-align:center;padding:8px 0 4px}' +
    '.lm-ok.is-on{display:block}' +
    '.lm-ok-mark{width:52px;height:52px;border-radius:50%;background:rgba(48,209,88,.15);color:#1a7f4b;display:grid;place-items:center;margin:0 auto 14px}' +
    '.lm-ok-mark svg{width:24px;height:24px}' +
    '.lm-wa-btn{display:inline-flex;align-items:center;gap:8px;justify-content:center;width:100%;border:0;border-radius:980px;background:#25d366;color:#fff;text-decoration:none;font-size:15px;font-weight:500;padding:13px;box-sizing:border-box;margin-top:6px}' +
    '.lm-wa-btn:hover{opacity:.92;text-decoration:none}';

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  var overlay, modal, formEl, errEl, okEl, submitBtn;

  function injectStyle() {
    if (document.getElementById('obraflow-leadform-css')) return;
    var st = document.createElement('style');
    st.id = 'obraflow-leadform-css';
    st.textContent = STYLE;
    document.head.appendChild(st);
  }

  function open() {
    formEl.hidden = false;
    okEl.classList.remove('is-on');
    errEl.classList.remove('is-on');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Solicitar demonstração';
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    var first = formEl.querySelector('input');
    if (first) window.setTimeout(function () { first.focus(); }, 30);
  }

  function close() {
    overlay.hidden = true;
    document.body.style.overflow = '';
  }

  function build() {
    injectStyle();

    overlay = el('div', 'lm-overlay');
    overlay.hidden = true;
    overlay.setAttribute('role', 'presentation');

    modal = el('div', 'lm-modal');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'lmTitle');

    var closeBtn = el('button', 'lm-close', '&times;');
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Fechar');
    closeBtn.onclick = close;
    modal.appendChild(closeBtn);

    var titleEl = el('h2', 'lm-title', 'Solicitar uma demonstração');
    titleEl.id = 'lmTitle';

    modal.appendChild(el('p', 'lm-eyebrow', 'ObraFlow'));
    modal.appendChild(titleEl);
    modal.appendChild(el('p', 'lm-sub', 'Preencha e a gente entra em contato pra combinar o melhor horário. Sem cadastro no sistema, sem compromisso.'));

    formEl = el('form');
    formEl.noValidate = true;
    formEl.innerHTML =
      '<div class="lm-field"><label for="lmNome">Nome *</label><input class="lm-input" id="lmNome" name="nome" required autocomplete="name"></div>' +
      '<div class="lm-field"><label for="lmFone">WhatsApp *</label><input class="lm-input" id="lmFone" name="telefone" type="tel" placeholder="(81) 9xxxx-xxxx" required autocomplete="tel"></div>' +
      '<div class="lm-field"><label for="lmEmpresa">Construtora *</label><input class="lm-input" id="lmEmpresa" name="empresa" required autocomplete="organization"></div>' +
      '<div class="lm-row2">' +
        '<div class="lm-field"><label for="lmCidade">Cidade</label><input class="lm-input" id="lmCidade" name="cidade" autocomplete="address-level2"></div>' +
        '<div class="lm-field"><label for="lmObras">Obras/ano</label><input class="lm-input" id="lmObras" name="obras" placeholder="ex.: 3"></div>' +
      '</div>' +
      '<input class="lm-honey" type="text" name="botcheck" tabindex="-1" autocomplete="off">' +
      '<button class="lm-submit" type="submit">Solicitar demonstração</button>' +
      '<p class="lm-err"></p>' +
      '<p class="lm-note">Seus dados são usados só para agendar essa conversa — nada de spam.</p>';
    modal.appendChild(formEl);
    submitBtn = formEl.querySelector('.lm-submit');
    errEl = formEl.querySelector('.lm-err');

    okEl = el('div', 'lm-ok');
    okEl.innerHTML =
      '<div class="lm-ok-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>' +
      '<p class="lm-title" style="font-size:19px">Recebemos seu pedido!</p>' +
      '<p class="lm-sub">Pode continuar agora mesmo no WhatsApp pra já combinar o horário:</p>' +
      '<a class="lm-wa-btn" id="lmWaLink" target="_blank" rel="noopener">Continuar no WhatsApp</a>';
    modal.appendChild(okEl);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !overlay.hidden) close();
    });

    formEl.addEventListener('submit', function (e) {
      e.preventDefault();
      if (formEl.botcheck && formEl.botcheck.value) return; // honeypot: bot preencheu, ignora silenciosamente

      var nome = formEl.nome.value.trim();
      var telefone = formEl.telefone.value.trim();
      var empresa = formEl.empresa.value.trim();
      var cidade = formEl.cidade.value.trim();
      var obras = formEl.obras.value.trim();

      if (!nome || !telefone || !empresa) {
        errEl.textContent = 'Preencha nome, WhatsApp e construtora.';
        errEl.classList.add('is-on');
        return;
      }
      errEl.classList.remove('is-on');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';

      var payload = {
        access_key: ACCESS_KEY,
        subject: 'Novo pedido de demonstração — ObraFlow (site)',
        from_name: 'Site ObraFlow',
        nome: nome,
        telefone: telefone,
        construtora: empresa,
        cidade: cidade || '-',
        obras_por_ano: obras || '-',
        pagina_origem: location.href
      };

      var wa = waHref(nome, empresa, cidade, obras);

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function (data) {
          document.getElementById('lmWaLink').href = wa;
          formEl.hidden = true;
          okEl.classList.add('is-on');
          if (!data || data.success !== true) {
            // Não conseguimos confirmar o envio, mas não perdemos o lead: WhatsApp segue disponível.
            okEl.querySelector('.lm-sub').textContent = 'Não deu pra confirmar o envio automático, mas pode chamar direto no WhatsApp:';
          }
        })
        .catch(function () {
          document.getElementById('lmWaLink').href = wa;
          formEl.hidden = true;
          okEl.classList.add('is-on');
          okEl.querySelector('.lm-sub').textContent = 'Não deu pra confirmar o envio automático, mas pode chamar direto no WhatsApp:';
        });
    });

    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('.js-wa');
      if (!trigger) return;
      e.preventDefault();
      open();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
