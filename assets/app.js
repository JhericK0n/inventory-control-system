/* Nexo Estoque — aplicação independente, sem dependências de JavaScript. */
(() => {
  'use strict';

  const STORAGE_KEY = 'nexo_estoque_v1';
  const CLOUD = window.NEXO_CONFIG || {};
  const cloudMode = Boolean(CLOUD.supabaseUrl && CLOUD.supabasePublishableKey);
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const number = new Intl.NumberFormat('pt-BR');
  const dateTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  const ICONS = {
    layout: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
    package: '<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="M3 7v10l9 5 9-5V7M12 12v10"/>',
    arrows: '<path d="M7 7h14m-5-5 5 5-5 5M17 17H3m5-5-5 5 5 5"/>',
    chart: '<path d="M3 3v18h18M7 16V9m5 7V5m5 11v-4"/>',
    settings: '<path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06-1.9 1.9-.06-.06A1.65 1.65 0 0 0 16 18.4a1.65 1.65 0 0 0-1.4 1.65V21h-5v-.95A1.65 1.65 0 0 0 8.2 18.4a1.65 1.65 0 0 0-1.82.33l-.06.06-1.9-1.9.06-.06A1.65 1.65 0 0 0 4.8 15 1.65 1.65 0 0 0 3.15 13.6H2v-3h1.15A1.65 1.65 0 0 0 4.8 9.2a1.65 1.65 0 0 0-.33-1.82l-.06-.06 1.9-1.9.06.06A1.65 1.65 0 0 0 8.2 5.8 1.65 1.65 0 0 0 9.6 4.15V3h5v1.15A1.65 1.65 0 0 0 16 5.8a1.65 1.65 0 0 0 1.82-.33l.06-.06 1.9 1.9-.06.06A1.65 1.65 0 0 0 19.4 9.2a1.65 1.65 0 0 0 1.65 1.4H22v3h-.95A1.65 1.65 0 0 0 19.4 15Z"/>',
    sparkles: '<path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3ZM5 17l.7 2.3L8 20l-2.3.7L5 23l-.7-2.3L2 20l2.3-.7L5 17ZM19 2l.6 2.4L22 5l-2.4.6L19 8l-.6-2.4L16 5l2.4-.6L19 2Z"/>',
    moon: '<path d="M20.5 14.2A8.7 8.7 0 0 1 9.8 3.5a8.7 8.7 0 1 0 10.7 10.7Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5"/>',
    alert: '<path d="m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0ZM12 9v4m0 4h.01"/>',
    wallet: '<rect x="3" y="5" width="18" height="15" rx="3"/><path d="M3 9V5a2 2 0 0 1 2-2h13M16 14h5"/>',
    'arrow-up-right': '<path d="M7 17 17 7M7 7h10v10"/>',
    'arrow-down-left': '<path d="M17 7 7 17M17 17H7V7"/>',
    activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M5 18v3h14v-3"/>',
    upload: '<path d="M12 16V4m-5 5 5-5 5 5M5 17v4h14v-4"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    edit: '<path d="m16 4 4 4M4 20l4.5-1 11-11a2.83 2.83 0 0 0-4-4l-11 11L4 20Z"/>',
    trash: '<path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 4 18 4 18 0V5M3 12c0 4 18 4 18 0"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 11v6m0-10h.01"/>',
    inbox: '<path d="M4 4h16l2 10v6H2v-6L4 4ZM2 14h6l2 3h4l2-3h6"/>',
    box: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 3v6"/>'
  };
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.box}</svg>`;
  const paintIcons = (root = document) => $$('[data-icon]', root).forEach(el => { el.innerHTML = icon(el.dataset.icon); });
  const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const money = n => currency.format(Number(n) || 0);
  const count = n => number.format(Number(n) || 0);
  const str = val => String(val ?? '').trim();
  const uid = () => (globalThis.crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const dayOffset = days => new Date(Date.now() - days * 86400000).toISOString();
  const isLow = product => product.qty <= product.min;
  const status = product => product.qty === 0 ? { label: 'Esgotado', key: 'zero' } : isLow(product) ? { label: 'Estoque baixo', key: 'low' } : { label: 'Em estoque', key: 'ok' };
  const initials = name => str(name).split(/\s+/).slice(0, 2).map(word => word[0] || '').join('').toUpperCase();
  const normalized = text => str(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const dateLabel = d => { const date = new Date(d); return isNaN(date.getTime()) ? 'Data desconhecida' : dateTime.format(date); };
  const palette = ['#7468ed', '#5dccb7', '#efa969', '#90a0f2', '#5aaff0', '#cf82cf', '#e1cb78', '#a3adb8'];

  const freshState = () => ({ products: [], movements: [], settings: { threshold: 5, theme: 'light' }, demo: false });
  const demoState = () => {
    const records = [
      ['Notebook Business 14', 'ELE-001', 'Eletrônicos', 18, 5, 3899.9, 'Tech Distribuidora'],
      ['Mouse sem fio', 'ELE-002', 'Eletrônicos', 4, 8, 89.9, 'Tech Distribuidora'],
      ['Cadeira Ergonômica', 'MOV-003', 'Móveis', 12, 4, 1269, 'Office Center'],
      ['Teclado Mecânico', 'ELE-004', 'Eletrônicos', 28, 6, 359.9, 'Tech Distribuidora'],
      ['Caderno Executivo', 'PAP-005', 'Papelaria', 68, 15, 29.9, 'Papéis Ltda.'],
      ['Monitor 27 polegadas', 'ELE-006', 'Eletrônicos', 3, 5, 1499, 'Tech Distribuidora'],
      ['Mesa de Escritório', 'MOV-007', 'Móveis', 9, 3, 899, 'Office Center'],
      ['Caneta Premium', 'PAP-008', 'Papelaria', 0, 10, 14.9, 'Papéis Ltda.'],
      ['Fone Bluetooth', 'ACE-009', 'Acessórios', 23, 8, 259.9, 'Áudio Supply'],
      ['Hub USB-C', 'ACE-010', 'Acessórios', 31, 10, 149.9, 'Áudio Supply']
    ];
    const products = records.map(([name, sku, category, qty, min, price, supplier]) => ({ id: uid(), name, sku, category, qty, min, price, supplier, createdAt: dayOffset(30) }));
    const samples = [
      [0, 'entrada', 12, 0, 'Recebimento de fornecedor'], [1, 'saida', 3, 0, 'Venda balcão'],
      [2, 'entrada', 8, 1, 'Reposição semanal'], [3, 'saida', 4, 1, 'Pedido entregue'],
      [5, 'saida', 2, 2, 'Venda online'], [8, 'entrada', 15, 3, 'Novo lote'],
      [4, 'saida', 8, 3, 'Saída para consumo'], [6, 'entrada', 5, 4, 'Recebimento'],
      [7, 'saida', 2, 5, 'Requisição interna'], [9, 'entrada', 12, 6, 'Reposição'],
      [0, 'saida', 2, 8, 'Pedido entregue'], [3, 'entrada', 10, 10, 'Fornecedor'],
      [8, 'saida', 5, 13, 'Venda'], [5, 'entrada', 7, 18, 'Reposição'],
      [2, 'saida', 3, 24, 'Entrega'], [9, 'entrada', 20, 40, 'Recebimento'],
      [4, 'entrada', 30, 50, 'Lote novo'], [6, 'saida', 4, 64, 'Venda'],
    ];
    const movements = samples.map(([idx, type, qty, ago, note]) => ({ id: uid(), productId: products[idx].id, productName: products[idx].name, sku: products[idx].sku, type, qty, note, createdAt: dayOffset(ago) }));
    return { products, movements, settings: { threshold: 5, theme: 'light' }, demo: true };
  };

  let state;
  try { const saved = localStorage.getItem(STORAGE_KEY); state = saved ? JSON.parse(saved) : demoState(); }
  catch { state = demoState(); }
  if (!state || !Array.isArray(state.products) || !Array.isArray(state.movements)) state = demoState();
  state.settings = { threshold: 5, theme: 'light', ...(state.settings || {}) };
  // Uma demo pública não deve mostrar dados locais como se viessem do banco.
  // Preservamos apenas a preferência de tema do visitante.
  if (cloudMode) {
    const theme = state.settings.theme;
    state = freshState();
    state.settings.theme = theme;
  }
  let currentView = 'dashboard';
  let currentPeriod = 7;
  let lastFocused = null;
  let lowOnly = false;

  function persist() {
    try {
      if (cloudMode) {
        // Sem escrita no Supabase ou substituição do estoque local nesta modalidade.
        localStorage.setItem('nexo_estoque_cloud_theme', state.settings.theme);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    } catch { toast('Não foi possível salvar a preferência neste navegador.', true); }
  }
  function toast(message, error = false) {
    const el = document.createElement('div');
    el.className = `toast${error ? ' error' : ''}`;
    el.innerHTML = `${icon(error ? 'alert' : 'check')}<span>${esc(message)}</span><button class="toast-close" type="button" aria-label="Fechar notificação">${icon('x')}</button>`;
    $('#toast-region').append(el);
    el.querySelector('button').addEventListener('click', () => el.remove());
    setTimeout(() => el.remove(), 4200);
  }
  function setTheme(nextTheme, save = true) {
    const theme = nextTheme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    state.settings.theme = theme;
    $('#theme-toggle').innerHTML = icon(theme === 'dark' ? 'sun' : 'moon');
    $('#settings-theme').innerHTML = `${icon(theme === 'dark' ? 'sun' : 'moon')} ${theme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro'}`;
    if (save) persist();
  }
  function changeView(view, options = {}) {
    if (!['dashboard', 'products', 'movements', 'reports', 'settings'].includes(view)) return;
    currentView = view;
    $$('.view').forEach(el => { el.hidden = el.id !== `view-${view}`; el.classList.toggle('active', !el.hidden); });
    $$('[data-view].nav-item').forEach(button => {
      const active = button.dataset.view === view;
      button.classList.toggle('active', active);
      if (active) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
    });
    const titles = { dashboard: 'Visão geral', products: 'Produtos', movements: 'Movimentações', reports: 'Relatórios', settings: 'Configurações' };
    $('#breadcrumb-current').textContent = titles[view];
    if (view === 'products' && options.lowOnly) { lowOnly = true; $('#product-status').value = 'low'; }
    if (view === 'products' && !options.lowOnly && lowOnly) { lowOnly = false; $('#product-status').value = ''; }
    if (view === 'products') renderProducts();
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  function animateStat(node, value, format = 'number') {
    const last = Number(node.dataset.current || 0);
    const end = Number(value) || 0;
    const formatter = format === 'money' ? money : count;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || last === end) { node.textContent = formatter(end); node.dataset.current = end; return; }
    if (node._animationId) cancelAnimationFrame(node._animationId);
    const startAt = performance.now();
    const duration = 650;
    const frame = now => { const t = Math.min(1, (now - startAt) / duration); const ease = 1 - (1 - t) ** 3; node.textContent = formatter(format === 'money' ? last + (end - last) * ease : Math.round(last + (end - last) * ease)); if (t < 1) node._animationId = requestAnimationFrame(frame); else node.dataset.current = end; };
    node._animationId = requestAnimationFrame(frame);
  }
  function renderStats() {
    const units = state.products.reduce((total, p) => total + p.qty, 0);
    const value = state.products.reduce((total, p) => total + p.qty * p.price, 0);
    const low = state.products.filter(isLow).length;
    animateStat($('#stat-products'), state.products.length);
    animateStat($('#stat-units'), units);
    animateStat($('#stat-low'), low);
    animateStat($('#stat-value'), value, 'money');
    $('#nav-product-count').textContent = count(state.products.length);
    $('#alert-dot').hidden = low === 0;
  }
  function renderChart() {
    const days = currentPeriod;
    const buckets = days === 7 ? 7 : 10;
    const width = days / buckets;
    const totals = Array.from({ length: buckets }, () => ({ entrada: 0, saida: 0 }));
    state.movements.forEach(m => {
      const age = Math.floor((Date.now() - new Date(m.createdAt).getTime()) / 86400000);
      if (!Number.isFinite(age) || age < 0 || age >= days) return;
      const position = Math.floor((days - 1 - age) / width);
      if (totals[position] && ['entrada', 'saida'].includes(m.type)) totals[position][m.type] += m.qty;
    });
    const max = Math.max(1, ...totals.flatMap(item => [item.entrada, item.saida]));
    $('#flow-chart').innerHTML = totals.map((item, i) => {
      const date = new Date(Date.now() - (days - 1 - Math.round(i * width)) * 86400000);
      const label = days === 7 ? date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '') : date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const h1 = Math.max(2, (item.entrada / max) * 100);
      const h2 = Math.max(2, (item.saida / max) * 100);
      return `<div class="chart-column" title="${esc(label)}: ${count(item.entrada)} entradas, ${count(item.saida)} saídas"><div class="bar-pair"><div class="bar in" style="height:${h1}%"></div><div class="bar out" style="height:${h2}%"></div></div><span class="chart-label">${esc(label)}</span></div>`;
    }).join('');
    $('#flow-chart').setAttribute('aria-label', `Fluxo dos últimos ${days} dias. ${totals.reduce((s, t) => s + t.entrada, 0)} entradas e ${totals.reduce((s, t) => s + t.saida, 0)} saídas, em unidades.`);
  }
  function categories() {
    const summary = new Map();
    for (const product of state.products) {
      const key = product.category || 'Sem categoria';
      const record = summary.get(key) || { name: key, count: 0, total: 0 };
      record.count += 1;
      record.total += product.qty * product.price;
      summary.set(key, record);
    }
    return [...summary.values()].sort((a, b) => b.count - a.count);
  }
  function renderDonut() {
    const all = categories();
    const top = all.slice(0, 4);
    if (all.length > 4) top.push({ name: 'Outros', count: all.slice(4).reduce((n, c) => n + c.count, 0) });
    const total = state.products.length;
    $('#donut-total').textContent = count(total);
    let pct = 0;
    const gradient = top.map((c, i) => { const from = pct; pct += (c.count / total) * 100; return `${palette[i]} ${from}% ${pct}%`; });
    $('#category-donut').style.background = total ? `conic-gradient(${gradient.join(',')})` : 'var(--line)';
    $('#category-legend').innerHTML = top.length ? top.map((c, i) => `<div class="category-row"><span class="category-color" style="background:${palette[i]}"></span><span class="category-row-name" title="${esc(c.name)}">${esc(c.name)}</span><strong class="category-row-value">${count(c.count)}</strong></div>`).join('') : '<div class="empty-box">Nenhuma categoria cadastrada.</div>';
  }
  function empty(message, title = 'Nada por aqui') { return `<div class="empty-box">${icon('inbox')}<strong>${esc(title)}</strong><span>${esc(message)}</span></div>`; }
  function renderDashboardLists() {
    const low = state.products.filter(isLow).sort((a, b) => a.qty - b.qty).slice(0, 4);
    $('#low-stock-list').innerHTML = low.length ? low.map(p => `<div class="list-row"><div class="product-symbol">${esc(initials(p.name))}</div><div class="list-detail"><strong>${esc(p.name)}</strong><small>${esc(p.sku)}</small></div><div class="list-trailing"><strong class="low-text">${count(p.qty)} unidades</strong><small>Mínimo: ${count(p.min)}</small></div></div>`).join('') : empty('Nenhum produto precisa de reposição.', 'Tudo em ordem!');
    const recent = [...state.movements].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
    $('#recent-movements').innerHTML = recent.length ? recent.map(m => `<div class="list-row"><div class="movement-symbol ${esc(m.type)}">${icon(m.type === 'entrada' ? 'arrow-down-left' : 'arrow-up-right')}</div><div class="list-detail"><strong>${esc(m.productName)}</strong><small>${esc(m.type === 'entrada' ? 'Entrada' : 'Saída')} · ${esc(dateLabel(m.createdAt))}</small></div><div class="list-trailing"><strong class="${m.type === 'entrada' ? 'positive-text' : 'negative-text'}">${m.type === 'entrada' ? '+' : '−'}${count(m.qty)}</strong></div></div>`).join('') : empty('Novas entradas e saídas aparecerão aqui.', 'Sem movimentações');
  }
  function updateCategoryOptions() {
    const select = $('#product-category');
    const original = select.value;
    const all = [...new Set(state.products.map(p => p.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    select.innerHTML = '<option value="">Todas as categorias</option>' + all.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
    select.value = all.includes(original) ? original : '';
    $('#category-options').innerHTML = all.map(c => `<option value="${esc(c)}"></option>`).join('');
  }
  function renderProducts() {
    const term = normalized($('#product-search').value);
    const selectedCategory = $('#product-category').value;
    const filter = $('#product-status').value;
    const selected = state.products.filter(p => {
      const found = normalized(`${p.name} ${p.sku} ${p.supplier || ''}`).includes(term);
      const categoryMatch = !selectedCategory || p.category === selectedCategory;
      const stat = status(p);
      return found && categoryMatch && (!filter || (filter === 'low' ? isLow(p) : stat.key === filter));
    }).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    $('#products-table').innerHTML = selected.length ? selected.map(p => {
      const s = status(p);
      return `<tr><td><div class="product-cell"><div class="product-symbol">${esc(initials(p.name))}</div><div><strong>${esc(p.name)}</strong><small>${esc(p.supplier || 'Fornecedor não informado')}</small></div></div></td><td class="code-cell">${esc(p.sku)}</td><td><span class="tag">${esc(p.category)}</span></td><td class="quantity-cell">${count(p.qty)}</td><td>${money(p.price)}</td><td><span class="status ${s.key}">${s.label}</span></td><td>${cloudMode ? '<span class="read-only-cell" title="Visualização pública: sem permissão de edição">Somente leitura</span>' : `<div class="row-actions"><button type="button" class="table-action" data-edit="${esc(p.id)}" aria-label="Editar ${esc(p.name)}" title="Editar produto">${icon('edit')}</button><button type="button" class="table-action danger" data-delete="${esc(p.id)}" aria-label="Excluir ${esc(p.name)}" title="Excluir produto">${icon('trash')}</button></div>`}</td></tr>`;
    }).join('') : `<tr><td colspan="7" class="table-empty">${empty('Experimente alterar os filtros ou cadastrar um produto.', 'Nenhum produto encontrado')}</td></tr>`;
    $('#products-footer').textContent = `Exibindo ${count(selected.length)} de ${count(state.products.length)} produto(s)`;
  }
  function renderMovements() {
    const term = normalized($('#movement-search').value);
    const filter = $('#movement-type').value;
    const all = [...state.movements].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const selected = all.filter(m => (!filter || m.type === filter) && normalized(`${m.productName} ${m.sku} ${m.note}`).includes(term));
    $('#movements-table').innerHTML = selected.length ? selected.map(m => `<tr><td>${esc(dateLabel(m.createdAt))}</td><td><div class="product-cell"><div class="product-symbol">${esc(initials(m.productName))}</div><div><strong>${esc(m.productName)}</strong><small>${esc(m.sku || '')}</small></div></div></td><td><span class="movement-label ${esc(m.type)}">${icon(m.type === 'entrada' ? 'arrow-down-left' : 'arrow-up-right')} ${m.type === 'entrada' ? 'Entrada' : 'Saída'}</span></td><td><strong class="${m.type === 'entrada' ? 'positive-text' : 'negative-text'}">${m.type === 'entrada' ? '+' : '−'}${count(m.qty)}</strong></td><td>${esc(m.note || '—')}</td></tr>`).join('') : `<tr><td colspan="5" class="table-empty">${empty('Registre uma entrada ou saída para começar.', 'Nenhuma movimentação encontrada')}</td></tr>`;
    $('#mov-in-total').textContent = count(all.filter(m => m.type === 'entrada').reduce((s, m) => s + m.qty, 0));
    $('#mov-out-total').textContent = count(all.filter(m => m.type === 'saida').reduce((s, m) => s + m.qty, 0));
    $('#mov-count-total').textContent = count(all.length);
    $('#movements-footer').textContent = `Exibindo ${count(selected.length)} de ${count(all.length)} registro(s)`;
  }
  function renderReports() {
    const grouped = categories().sort((a, b) => b.total - a.total);
    const totalValue = grouped.reduce((sum, g) => sum + g.total, 0);
    $('#report-categories').innerHTML = grouped.length ? grouped.map((g, i) => `<div class="report-item"><div class="report-item-head"><span>${esc(g.name)}</span><strong>${money(g.total)}</strong></div><div class="progress-track"><div class="progress-fill" style="width:${totalValue ? (g.total / totalValue) * 100 : 0}%;background:${palette[i % palette.length]}"></div></div></div>`).join('') : empty('Cadastre produtos para visualizar os valores.', 'Sem dados');
    const ranked = [...state.products].sort((a, b) => (b.qty * b.price) - (a.qty * a.price)).slice(0, 5);
    $('#report-products').innerHTML = ranked.length ? ranked.map((p, i) => `<div class="rank-row"><span class="rank-number">${i + 1}</span><div class="product-symbol">${esc(initials(p.name))}</div><div class="list-detail"><strong>${esc(p.name)}</strong><small>${count(p.qty)} unidades</small></div><strong class="rank-value">${money(p.qty * p.price)}</strong></div>`).join('') : empty('Os produtos aparecerão aqui.', 'Sem dados');
    const low = state.products.filter(isLow).length;
    const out = state.products.filter(p => p.qty === 0).length;
    const units = state.products.reduce((s, p) => s + p.qty, 0);
    $('#report-insights').innerHTML = [
      ['Saúde do estoque', low ? `${low} produto(s) estão no nível mínimo ou abaixo. Priorize a reposição.` : 'Todos os produtos estão acima do nível mínimo.'],
      ['Itens esgotados', out ? `${out} item(ns) sem unidades disponíveis. Verifique pedidos de reposição.` : 'Nenhum produto está esgotado no momento.'],
      ['Visão financeira', `${count(units)} unidades disponíveis, com valor total de ${money(totalValue)}.`]
    ].map(([title, description]) => `<div class="insight-box"><strong>${esc(title)}</strong><p>${esc(description)}</p></div>`).join('');
  }
  function renderAll() {
    $('#demo-banner').hidden = cloudMode || !state.demo;
    $('#default-min').value = state.settings.threshold;
    updateCategoryOptions();
    renderStats(); renderChart(); renderDonut(); renderDashboardLists(); renderProducts(); renderMovements(); renderReports();
  }
  function openModal(id) {
    closeModal(false);
    lastFocused = document.activeElement;
    const modal = $(`#${id}`);
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => $('input:not([type=hidden]),select,textarea,button', $('.modal', modal))?.focus(), 50);
  }
  function closeModal(restore = true) {
    $$('.modal-backdrop').forEach(el => { el.classList.remove('show'); el.setAttribute('aria-hidden', 'true'); });
    document.body.style.overflow = '';
    if (restore && lastFocused && lastFocused.isConnected) lastFocused.focus();
  }
  function openProduct(product = null) {
    if (cloudMode) { toast('A demonstração pública é somente leitura.', true); return; }
    $('#product-form').reset();
    $('#product-id').value = product?.id || '';
    $('#product-modal-title').textContent = product ? 'Editar produto' : 'Novo produto';
    $('#p-name').value = product?.name || '';
    $('#p-sku').value = product?.sku || '';
    $('#p-category').value = product?.category || '';
    $('#p-qty').value = product?.qty ?? 0;
    $('#p-min').value = product?.min ?? state.settings.threshold;
    $('#p-price').value = product?.price ?? '';
    $('#p-supplier').value = product?.supplier || '';
    $('#p-qty').readOnly = !!product;
    $('#quantity-note').hidden = !product;
    openModal('product-modal');
  }
  function openMovement(type = 'entrada', productId = '') {
    if (cloudMode) { toast('A demonstração pública é somente leitura.', true); return; }
    if (!state.products.length) { toast('Cadastre um produto antes de registrar movimentações.', true); openProduct(); return; }
    $('#movement-form').reset();
    $('#m-type').value = type;
    $('#movement-modal-title').textContent = type === 'entrada' ? 'Registrar entrada' : 'Registrar saída';
    $('#m-product').innerHTML = '<option value="">Selecione um produto</option>' + [...state.products].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')).map(p => `<option value="${esc(p.id)}">${esc(p.name)} · ${esc(p.sku)}</option>`).join('');
    $('#m-product').value = productId || '';
    updateMovementAvailable();
    openModal('movement-modal');
  }
  function updateMovementAvailable() {
    const p = state.products.find(product => product.id === $('#m-product').value);
    $('#movement-available').textContent = p ? `${count(p.qty)} unidade(s) disponíveis no estoque. ${$('#m-type').value === 'saida' ? 'Uma saída não pode ultrapassar este valor.' : 'A entrada aumentará a quantidade atual.'}` : 'Selecione um produto para consultar o saldo disponível.';
  }
  function handleProductSave(event) {
    event.preventDefault();
    if (cloudMode) { toast('Operação bloqueada na visualização pública.', true); return; }
    const id = $('#product-id').value;
    const existing = state.products.find(p => p.id === id);
    const product = {
      id: existing?.id || uid(),
      name: str($('#p-name').value), sku: str($('#p-sku').value).toUpperCase(), category: str($('#p-category').value),
      qty: existing ? existing.qty : Number($('#p-qty').value),
      min: Number($('#p-min').value), price: Number($('#p-price').value), supplier: str($('#p-supplier').value),
      createdAt: existing?.createdAt || new Date().toISOString()
    };
    if (!product.name || !product.sku || !product.category) { toast('Preencha os campos obrigatórios.', true); return; }
    if (![product.qty, product.min, product.price].every(Number.isFinite) || !Number.isInteger(product.qty) || !Number.isInteger(product.min) || product.qty < 0 || product.min < 0 || product.price < 0) { toast('Confira os valores de quantidade e preço.', true); return; }
    if (state.products.some(p => p.id !== product.id && normalized(p.sku) === normalized(product.sku))) { toast('Já existe um produto com esse código.', true); $('#p-sku').focus(); return; }
    if (existing) {
      Object.assign(existing, product);
    } else {
      state.products.unshift(product);
      if (product.qty > 0) state.movements.unshift({ id: uid(), productId: product.id, productName: product.name, sku: product.sku, type: 'entrada', qty: product.qty, note: 'Estoque inicial', createdAt: new Date().toISOString() });
    }
    persist(); closeModal(); renderAll();
    toast(existing ? 'Produto atualizado com sucesso.' : 'Produto cadastrado com sucesso.');
  }
  function handleMovementSave(event) {
    event.preventDefault();
    if (cloudMode) { toast('Operação bloqueada na visualização pública.', true); return; }
    const product = state.products.find(p => p.id === $('#m-product').value);
    const type = $('#m-type').value;
    const qty = Number($('#m-qty').value);
    if (!product || !['entrada', 'saida'].includes(type) || !Number.isSafeInteger(qty) || qty <= 0) { toast('Selecione o produto e informe uma quantidade válida.', true); return; }
    if (type === 'saida' && qty > product.qty) { toast(`Saída inválida: existem apenas ${count(product.qty)} unidade(s).`, true); $('#m-qty').focus(); return; }
    product.qty += type === 'entrada' ? qty : -qty;
    state.movements.unshift({ id: uid(), productId: product.id, productName: product.name, sku: product.sku, type, qty, note: str($('#m-note').value), createdAt: new Date().toISOString() });
    persist(); closeModal(); renderAll();
    toast(type === 'entrada' ? 'Entrada registrada com sucesso.' : 'Saída registrada com sucesso.');
  }
  function deleteProduct(id) {
    if (cloudMode) { toast('Operação bloqueada na visualização pública.', true); return; }
    const product = state.products.find(p => p.id === id);
    if (!product) return;
    if (!confirm(`Deseja excluir "${product.name}"? O histórico de movimentações será mantido.`)) return;
    state.products = state.products.filter(p => p.id !== id);
    persist(); renderAll(); toast('Produto excluído. Histórico preservado.');
  }
  function csvCell(value) {
    let text = String(value ?? '');
    if (/^[\s]*[=+@\-]/.test(text) && !/^-[0-9]+([.,][0-9]+)?$/.test(text)) text = "'" + text;
    return `"${text.replace(/"/g, '""')}"`;
  }
  function download(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = filename;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function toCSV(rows) { return '\ufeff' + rows.map(row => row.map(csvCell).join(';')).join('\r\n'); }
  function productCSV() {
    const rows = [['Nome', 'Código', 'Categoria', 'Quantidade', 'Mínimo', 'Preço unitário (R$)', 'Valor total (R$)', 'Fornecedor', 'Status']];
    state.products.forEach(p => rows.push([p.name, p.sku, p.category, p.qty, p.min, p.price.toFixed(2).replace('.', ','), (p.qty * p.price).toFixed(2).replace('.', ','), p.supplier, status(p).label]));
    download('nexo-produtos.csv', toCSV(rows), 'text/csv;charset=utf-8'); toast('Arquivo CSV de produtos gerado.');
  }
  function movementCSV() {
    const rows = [['Data', 'Produto', 'Código', 'Tipo', 'Quantidade', 'Observação']];
    [...state.movements].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).forEach(m => rows.push([dateLabel(m.createdAt), m.productName, m.sku, m.type, m.qty, m.note]));
    download('nexo-movimentacoes.csv', toCSV(rows), 'text/csv;charset=utf-8'); toast('Arquivo CSV de movimentações gerado.');
  }
  function backupJSON() {
    download(`nexo-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify({ ...state, exportedAt: new Date().toISOString(), format: 'nexo-estoque-v1' }, null, 2), 'application/json;charset=utf-8');
    toast('Backup JSON gerado.');
  }
  async function restoreJSON(file) {
    if (cloudMode) { toast('Importação desativada na visualização pública.', true); return; }
    if (!file) return;
    try {
      if (file.size > 3_000_000) throw new Error('Arquivo muito grande.');
      const parsed = JSON.parse(await file.text());
      if (!Array.isArray(parsed.products) || !Array.isArray(parsed.movements)) throw new Error('Este arquivo não contém um backup válido.');
      if (parsed.products.length > 10000 || parsed.movements.length > 30000) throw new Error('O backup excede os limites suportados.');
      const products = parsed.products.map(p => ({ id: str(p.id || uid()).slice(0, 100), name: str(p.name).slice(0, 90), sku: str(p.sku).slice(0, 36), category: str(p.category).slice(0, 45), qty: Number(p.qty), min: Number(p.min), price: Number(p.price), supplier: str(p.supplier).slice(0, 70), createdAt: str(p.createdAt) }));
      const movements = parsed.movements.map(m => ({ id: str(m.id || uid()).slice(0, 100), productId: str(m.productId).slice(0, 100), productName: str(m.productName).slice(0, 90), sku: str(m.sku).slice(0, 36), type: str(m.type), qty: Number(m.qty), note: str(m.note).slice(0, 180), createdAt: str(m.createdAt) }));
      if (products.some(p => !p.name || !p.sku || !Number.isSafeInteger(p.qty) || !Number.isSafeInteger(p.min) || p.qty < 0 || p.min < 0 || !Number.isFinite(p.price) || p.price < 0) || movements.some(m => !['entrada','saida'].includes(m.type) || !Number.isSafeInteger(m.qty) || m.qty < 1)) throw new Error('O backup contém valores inválidos.');
      if (!confirm('Restaurar este backup? Os produtos e registros atuais deste painel serão substituídos.')) return;
      state = { products, movements, settings: { threshold: Number(parsed.settings?.threshold) || 5, theme: state.settings.theme }, demo: false };
      persist(); renderAll(); toast('Backup restaurado com sucesso.');
    } catch (error) { toast(error?.message || 'Erro ao importar backup.', true); }
    finally { $('#restore-file').value = ''; }
  }
  function clearData(demoOnly = false) {
    if (cloudMode) { toast('Operação bloqueada na visualização pública.', true); return; }
    const message = demoOnly ? 'Remover todos os dados fictícios e começar com um estoque vazio?' : 'Deseja apagar todos os produtos e movimentações? Esta ação não pode ser desfeita sem um backup.';
    if (!confirm(message)) return;
    const settings = { ...state.settings };
    state = freshState(); state.settings = settings;
    lowOnly = false;
    $('#product-search').value = ''; $('#movement-search').value = ''; $('#product-status').value = ''; $('#movement-type').value = '';
    persist(); renderAll(); toast(demoOnly ? 'Exemplos removidos. Seu estoque está pronto.' : 'Todos os dados foram apagados.');
  }
  function bindEvents() {
    document.addEventListener('click', event => {
      const target = event.target;
      const navigation = target.closest('[data-view]');
      if (navigation) { changeView(navigation.dataset.view, { lowOnly: navigation.dataset.lowOnly === 'true' }); return; }
      if (target.closest('[data-open-product]')) { openProduct(); return; }
      const movement = target.closest('[data-open-movement]');
      if (movement) { openMovement(movement.dataset.openMovement); return; }
      const edit = target.closest('[data-edit]');
      if (edit) { const p = state.products.find(p => p.id === edit.dataset.edit); if (p) openProduct(p); return; }
      const remove = target.closest('[data-delete]');
      if (remove) { deleteProduct(remove.dataset.delete); return; }
      if (target.closest('[data-close-modal]') || target.classList.contains('modal-backdrop')) { closeModal(); return; }
      const period = target.closest('[data-period]');
      if (period) { currentPeriod = Number(period.dataset.period); $$('[data-period]').forEach(button => button.classList.toggle('active', button === period)); renderChart(); }
    });
    $('#product-form').addEventListener('submit', handleProductSave);
    $('#movement-form').addEventListener('submit', handleMovementSave);
    $('#m-product').addEventListener('change', updateMovementAvailable);
    $('#product-search').addEventListener('input', renderProducts);
    $('#product-category').addEventListener('change', renderProducts);
    $('#product-status').addEventListener('change', () => { lowOnly = false; renderProducts(); });
    $('#movement-search').addEventListener('input', renderMovements);
    $('#movement-type').addEventListener('change', renderMovements);
    $('#export-products').addEventListener('click', productCSV);
    $('#export-report').addEventListener('click', productCSV);
    $('#export-movements').addEventListener('click', movementCSV);
    $('#backup-json').addEventListener('click', backupJSON);
    $('#restore-json').addEventListener('click', () => $('#restore-file').click());
    $('#restore-file').addEventListener('change', event => restoreJSON(event.target.files?.[0]));
    $('#erase-data').addEventListener('click', () => clearData(false));
    $('#clear-demo').addEventListener('click', () => clearData(true));
    $('#settings-form').addEventListener('submit', event => {
      event.preventDefault();
      if (cloudMode) { toast('Configuração de estoque indisponível no modo público.', true); return; }
      const value = Number($('#default-min').value);
      if (!Number.isSafeInteger(value) || value < 0 || value > 999999) { toast('Informe uma quantidade entre 0 e 999.999.', true); return; }
      state.settings.threshold = value; persist(); toast('Configuração salva com sucesso.');
    });
    const toggleTheme = () => setTheme(state.settings.theme === 'dark' ? 'light' : 'dark');
    $('#theme-toggle').addEventListener('click', toggleTheme);
    $('#settings-theme').addEventListener('click', toggleTheme);
    $('#alerts-shortcut').addEventListener('click', () => changeView('products', { lowOnly: true }));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && $('.modal-backdrop.show')) closeModal();
      if (event.key === 'Tab') {
        const opened = $('.modal-backdrop.show');
        if (!opened) return;
        const focusable = $$('button:not(:disabled),input:not([type=hidden]):not(:disabled),select:not(:disabled),textarea:not(:disabled)', opened).filter(el => el.offsetParent !== null);
        if (!focusable.length) return;
        if (event.shiftKey && document.activeElement === focusable[0]) { event.preventDefault(); focusable.at(-1).focus(); }
        else if (!event.shiftKey && document.activeElement === focusable.at(-1)) { event.preventDefault(); focusable[0].focus(); }
      }
    });
  }

  function configureCloudUI() {
    if (!cloudMode) return;
    let savedTheme = null;
    try { savedTheme = localStorage.getItem('nexo_estoque_cloud_theme'); } catch { /* Cookies/armazenamento indisponíveis. */ }
    if (savedTheme === 'dark' || savedTheme === 'light') setTheme(savedTheme, false);
    $('#cloud-banner').hidden = false;
    // Oculta todas as operações de escrita na interface pública.
    $$('[data-open-product], [data-open-movement], #restore-json, #erase-data, #clear-demo').forEach(el => { el.hidden = true; });
    const settingsSubmit = $('#settings-form button[type="submit"]');
    if (settingsSubmit) settingsSubmit.hidden = true;
    $('#default-min').disabled = true;
    const profileName = $('.sidebar-profile strong');
    const profileCaption = $('.sidebar-profile small');
    if (profileName) profileName.textContent = 'Acesso público';
    if (profileCaption) profileCaption.textContent = 'Banco em somente leitura';
    $('.top-avatar').textContent = 'DE';
    $('#settings-readonly-note').hidden = false;
    $('#cloud-refresh').addEventListener('click', syncCloud);
  }

  async function loadTable(tableName) {
    const base = CLOUD.supabaseUrl.trim().replace(/\/+$/, '');
    if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(base)) throw new Error('URL do projeto Supabase inválida.');
    const collected = [];
    for (let offset = 0; offset < 10000; offset += 1000) {
      const url = `${base}/rest/v1/${tableName}?select=*&order=created_at.desc&limit=1000&offset=${offset}`;
      const response = await fetch(url, {
        headers: { apikey: CLOUD.supabasePublishableKey.trim(), Accept: 'application/json' },
        cache: 'no-store'
      });
      if (!response.ok) throw new Error(`Falha na consulta de ${tableName} (HTTP ${response.status}). Confirme o SQL, a chave pública e as permissões RLS.`);
      const page = await response.json();
      if (!Array.isArray(page)) throw new Error('Resposta inválida do banco de dados.');
      collected.push(...page);
      if (page.length < 1000) return collected;
    }
    throw new Error('A demonstração excede o limite de 10.000 registros por tabela.');
  }

  async function syncCloud() {
    if (!cloudMode) return;
    const label = $('#cloud-status');
    const refresh = $('#cloud-refresh');
    refresh.disabled = true;
    label.textContent = 'Atualizando dados do banco...';
    try {
      const [products, movements] = await Promise.all([
        loadTable('inventory_products'), loadTable('inventory_movements')
      ]);
      state.products = products.map(p => ({
        id: p.id, name: p.name, sku: p.sku, category: p.category,
        qty: Number(p.qty), min: Number(p.minimum_qty), price: Number(p.unit_price),
        supplier: p.supplier || '', createdAt: p.created_at
      }));
      state.movements = movements.map(m => ({
        id: m.id, productId: m.product_id, productName: m.product_name,
        sku: m.sku, type: m.movement_type, qty: Number(m.quantity),
        note: m.note || '', createdAt: m.created_at
      }));
      state.demo = false;
      label.textContent = `${count(products.length)} produtos carregados • sincronizado às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
      renderAll();
    } catch (error) {
      // Nunca substituímos uma consulta com erro por dados fictícios silenciosamente.
      state.products = [];
      state.movements = [];
      label.textContent = `Erro na conexão: ${error.message}`;
      renderAll();
      toast('Não foi possível carregar os dados do Supabase.', true);
      console.error('Supabase:', error);
    } finally {
      refresh.disabled = false;
    }
  }

  function init() {
    paintIcons();
    $('#today-label').textContent = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    $('#copyright-year').textContent = new Date().getFullYear();
    setTheme(state.settings.theme, false);
    bindEvents(); configureCloudUI(); renderAll();
    if (cloudMode) syncCloud();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
