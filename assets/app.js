/* Nexo Estoque — interface estática. jsPDF e AutoTable carregados via CDN para relatórios. */
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
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18M8 14h3m2 0h3M8 18h3"/>',
    file: '<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M13 2v7h7M8 13h8M8 17h8"/>',
    scan: '<path d="M4 8V5a1 1 0 0 1 1-1h3m8 0h3a1 1 0 0 1 1 1v3M4 16v3a1 1 0 0 0 1 1h3m8 0h3a1 1 0 0 0 1-1v-3M7 12h10"/>',
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

  const CATEGORY_PRESETS = ['Acessórios', 'Alimentos e bebidas', 'Automotivo', 'Bebidas', 'Brinquedos', 'Cama, mesa e banho', 'Carnes e frios', 'Congelados', 'Cosméticos', 'Eletrônicos', 'Embalagens', 'Farmácia e higiene', 'Ferramentas', 'Frutas e verduras', 'Informática', 'Laticínios', 'Limpeza', 'Materiais de construção', 'Mercearia', 'Móveis', 'Padaria', 'Papelaria', 'Pet shop', 'Roupas e calçados', 'Suplementos', 'Utilidades domésticas'];
  const LETTERHEAD_KEY = 'nexo_estoque_letterhead_v1';
  const DEFAULT_LETTERHEAD = { company: 'Nexo Estoque', subtitle: 'Relatório de gestão de estoque', id: '', contact: '', address: '', color: '#6258e8', logo: '' };
  let letterhead = { ...DEFAULT_LETTERHEAD };
  try { letterhead = { ...letterhead, ...JSON.parse(localStorage.getItem(LETTERHEAD_KEY) || '{}') }; } catch { /* Sem dados salvos. */ }
  const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const offsetISO = days => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate()+days); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const validISO = value => /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) && !isNaN(new Date(`${value}T12:00:00`).getTime());
  const daysUntil = value => validISO(value) ? Math.round((Date.parse(`${value}T00:00:00Z`) - Date.parse(`${todayISO()}T00:00:00Z`))/86400000) : null;
  const displayDate = value => validISO(value) ? new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR') : 'Não informada';
  const positiveInteger = n => Number.isSafeInteger(Number(n)) && Number(n) >= 0;
  const normalizeProduct = source => {
    const p = { ...source };
    p.price = Math.max(0, Number(p.price) || 0);
    p.min = Math.max(0, Number(p.min) || 0);
    p.barcode = str(p.barcode).replace(/\D/g, '').slice(0,14);
    p.perishable = Boolean(p.perishable);
    p.wholesaleEnabled = Boolean(p.wholesaleEnabled);
    p.wholesalePrice = Math.max(0, Number(p.wholesalePrice) || 0);
    p.wholesaleMin = Math.max(2, Math.floor(Number(p.wholesaleMin) || 10));
    p.promotionEnabled = Boolean(p.promotionEnabled);
    p.promotionPrice = Math.max(0, Number(p.promotionPrice) || 0);
    p.promotionStart = validISO(p.promotionStart) ? p.promotionStart : '';
    p.promotionEnd = validISO(p.promotionEnd) ? p.promotionEnd : '';
    p.batches = Array.isArray(p.batches) ? p.batches.filter(b => b && positiveInteger(b.qty)).map(b => ({ id: str(b.id || uid()), code: str(b.code || 'LOTE-INICIAL').slice(0,45), qty: Number(b.qty), expiry: validISO(b.expiry) ? b.expiry : '' })) : [];
    if (!p.batches.length && Number(p.qty) > 0) p.batches.push({ id: uid(), code: 'LOTE-INICIAL', qty: Number(p.qty), expiry: '' });
    p.qty = p.batches.reduce((sum, b) => sum+b.qty, 0);
    return p;
  };
  const activeBatches = p => (p.batches || []).filter(b => b.qty > 0);
  const expiryInfo = (p,b) => {
    if (!p.perishable) return { key:'none', label:'Não perecível', days:null };
    const days = daysUntil(b.expiry);
    if (days === null) return { key:'missing', label:'Sem validade', days:null };
    if (days < 0) return { key:'expired', label:`Vencido há ${Math.abs(days)} dia(s)`, days };
    if (days <= state.settings.expiryDays) return { key:'soon', label: days === 0 ? 'Vence hoje' : `Vence em ${days} dia(s)`, days };
    return { key:'ok', label:'Dentro do prazo', days };
  };
  const allLots = () => state.products.flatMap(p => (p.batches || []).filter(b => b.qty > 0).map(b => ({ product:p, batch:b, expiry:expiryInfo(p,b) })));
  const productExpirySummary = p => {
    const statuses = activeBatches(p).map(b => expiryInfo(p,b).key);
    return statuses.includes('expired') ? 'expired' : statuses.includes('soon') ? 'soon' : statuses.includes('missing') && p.perishable ? 'missing' : 'ok';
  };
  const promoStatus = p => {
    if (!p.promotionEnabled) return 'none';
    const today = todayISO();
    if (p.promotionStart && today < p.promotionStart) return 'scheduled';
    if (p.promotionEnd && today > p.promotionEnd) return 'ended';
    return 'active';
  };
  const retailPrice = p => promoStatus(p) === 'active' ? p.promotionPrice : p.price;
  function persistLetterhead() {
    try { localStorage.setItem(LETTERHEAD_KEY, JSON.stringify(letterhead)); return true; }
    catch { toast('Não foi possível salvar o papel timbrado neste navegador.', true); return false; }
  }
  function toggleProductFields() {
    const wholesale = $('#p-wholesale-enabled').checked;
    $$('[data-wholesale-field]').forEach(el => { el.hidden = !wholesale; });
    $('#p-wholesale-price').required = wholesale;
    $('#p-wholesale-min').required = wholesale;
    const promo = $('#p-promo-enabled').checked;
    $$('[data-promo-field]').forEach(el => { el.hidden = !promo; });
    $('#p-promo-price').required = promo;
    const newProduct = !$('#product-id').value;
    $('#p-initial-lot').disabled = !newProduct;
    $('#p-initial-expiry').disabled = !newProduct;
    $('#initial-expiry-field').hidden = !newProduct || !$('#p-perishable').checked;
    $('#p-initial-lot').required = newProduct && Number($('#p-qty').value) > 0;
    $('#p-initial-expiry').required = newProduct && $('#p-perishable').checked && Number($('#p-qty').value) > 0;
  }
  function updateLotChoice() {
    const p = state.products.find(x => x.id === $('#m-product').value);
    const entry = $('#m-type').value === 'entrada';
    $('#movement-lot-select-field').hidden = entry;
    $('#movement-lot-code-field').hidden = !entry;
    $('#movement-lot-expiry-field').hidden = !entry || !p?.perishable;
    $('#m-batch').required = !entry;
    $('#m-lot-code').required = entry;
    $('#m-expiry').required = entry && !!p?.perishable;
    if (!entry) {
      const opts = p ? [...activeBatches(p)].sort((a,b) => (a.expiry || '9999').localeCompare(b.expiry || '9999')) : [];
      const current = $('#m-batch').value;
      $('#m-batch').innerHTML = '<option value="">Selecione o lote</option>' + opts.map(b => `<option value="${esc(b.id)}">${esc(b.code)} · ${count(b.qty)} un. · ${esc(p.perishable ? displayDate(b.expiry) : 'Sem controle de validade')}</option>`).join('');
      if (opts.some(b => b.id === current)) $('#m-batch').value = current;
    } else {
      const input = $('#m-lot-code');
      if (!input.value) input.value = `LOT-${todayISO().replace(/-/g,'')}`;
    }
    updateMovementAvailable();
  }
  function openLotEditor(productId, batchId) {
    if (cloudMode) return toast('Visualização pública em modo somente leitura.', true);
    const p = state.products.find(x=>x.id===productId);
    const b = p?.batches.find(x=>x.id===batchId);
    if (!b) return;
    $('#lot-product-id').value = productId; $('#lot-batch-id').value = batchId;
    $('#lot-code').value = b.code; $('#lot-expiry').value = b.expiry;
    $('#lot-expiry').required = p.perishable && b.qty > 0;
    openModal('lot-modal');
  }
  function saveLot(event) {
    event.preventDefault();
    if (cloudMode) return;
    const p = state.products.find(x=>x.id===$('#lot-product-id').value);
    const b = p?.batches.find(x=>x.id===$('#lot-batch-id').value);
    const code = str($('#lot-code').value);
    const expiry = $('#lot-expiry').value;
    if (!b || !code || (p.perishable && b.qty > 0 && !validISO(expiry))) return toast('Informe um número de lote e uma validade válida.', true);
    if (p.batches.some(x=>x.id!==b.id && normalized(x.code)===normalized(code))) return toast('Este número de lote já existe para o produto.', true);
    b.code=code; b.expiry=expiry;
    persist(); closeModal(); renderAll(); toast('Dados do lote atualizados.');
  }
  let cameraStream = null, cameraTimer = null, cameraBusy = false;
  function stopCamera() {
    if (cameraTimer) clearTimeout(cameraTimer);
    cameraTimer=null;
    if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
    cameraStream=null; cameraBusy=false;
    $('#barcode-video').srcObject = null;
    $('#camera-box').hidden=true;
  }
  async function startCamera() {
    if (!('BarcodeDetector' in window) || !navigator.mediaDevices?.getUserMedia) return toast('Leitura por câmera indisponível neste navegador. Use um leitor USB ou digite o código.', true);
    if (cameraStream) { stopCamera(); return; }
    try {
      const supported = await BarcodeDetector.getSupportedFormats();
      const formats = ['ean_13','ean_8','upc_a','upc_e','itf'].filter(f=>supported.includes(f));
      if (!formats.length) throw new Error('Formatos EAN/UPC não suportados.');
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio:false });
      const video = $('#barcode-video'); video.srcObject = cameraStream;
      $('#camera-box').hidden=false;
      await video.play();
      const detector = new BarcodeDetector({ formats });
      async function loop() {
        if (!cameraStream) return;
        if (!cameraBusy && video.readyState >= 2) {
          cameraBusy = true;
          try { const codes = await detector.detect(video); if (codes.length) { $('#p-barcode').value=str(codes[0].rawValue).replace(/\D/g,''); stopCamera(); lookupBarcode(); return; } }
          catch (e) { console.warn('Detector de código de barras:',e); }
          finally { cameraBusy=false; }
        }
        cameraTimer = setTimeout(loop, 350);
      }
      loop();
    } catch (error) { stopCamera(); toast(`Não foi possível usar a câmera: ${error.message}`, true); }
  }
  async function lookupBarcode() {
    const code = str($('#p-barcode').value).replace(/\D/g,'');
    if (!/^\d{8,14}$/.test(code)) return toast('Informe um código de barras numérico com 8 a 14 dígitos.', true);
    const btn = $('#barcode-lookup'); btn.disabled = true;
    $('#barcode-feedback').textContent='Consultando Open Food Facts...';
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=code,product_name,product_name_pt,brands,categories_tags`, { headers: { Accept:'application/json' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data=await response.json();
      if (data.status !== 1 || !data.product) { $('#barcode-feedback').textContent='Produto não encontrado na base pública. Complete o cadastro manualmente.'; toast('Código não encontrado. Você ainda pode cadastrar manualmente.', true); return; }
      const product=data.product;
      const name=str(product.product_name_pt || product.product_name);
      if (name) $('#p-name').value=name.slice(0,90);
      const tags=Array.isArray(product.categories_tags)?product.categories_tags.join(' '):'';
      const category=/dair(y|ies)|latic|yogurt|milk|cheese/.test(tags) ? 'Laticínios' : /beverage|juice|drink|water|soda/.test(tags) ? 'Bebidas' : /coffee|cafe/.test(tags) ? 'Mercearia' : 'Alimentos e bebidas';
      if (!$('#p-category').value) $('#p-category').value=category;
      if (!$('#p-sku').value) $('#p-sku').value=`EAN-${code}`.slice(0,36);
      $('#barcode-feedback').textContent=`Encontrado${product.brands ? ` · Marca: ${str(product.brands).slice(0,60)}` : ''}. Confira a descrição, categoria e complete preços, lotes e validade.`;
      toast('Dados encontrados! Confira e complete o cadastro.');
    } catch (error) { $('#barcode-feedback').textContent='Consulta indisponível no momento. O cadastro manual continua disponível.'; toast('Falha na consulta online. Verifique a conexão ou tente mais tarde.',true); }
    finally { btn.disabled=false; }
  }
  function updateLetterheadForm() {
    $('#lh-company').value=letterhead.company;
    $('#lh-subtitle').value=letterhead.subtitle;
    $('#lh-id').value=letterhead.id;
    $('#lh-contact').value=letterhead.contact;
    $('#lh-address').value=letterhead.address;
    $('#lh-color').value=/^#[0-9a-f]{6}$/i.test(letterhead.color)?letterhead.color:'#6258e8';
    $('#lh-logo-preview').hidden=!letterhead.logo;
    $('#lh-logo-remove').hidden=!letterhead.logo;
    if (letterhead.logo) $('#lh-logo-preview').src=letterhead.logo;
  }
  function saveLetterhead(e) {
    e.preventDefault();
    letterhead = { ...letterhead, company: str($('#lh-company').value).slice(0,80), subtitle: str($('#lh-subtitle').value).slice(0,90), id: str($('#lh-id').value).slice(0,40), contact: str($('#lh-contact').value).slice(0,110), address: str($('#lh-address').value).slice(0,150), color:$('#lh-color').value };
    if (!letterhead.company) return toast('Preencha o nome da empresa.', true);
    if (persistLetterhead()) toast('Papel timbrado atualizado. Próximos PDFs usarão essas informações.');
  }
  async function uploadLogo(file) {
    if (!file) return;
    if (!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size>2_000_000) return toast('Envie uma imagem PNG, JPEG ou WebP de até 2 MB.',true);
    try {
      const bitmap=await createImageBitmap(file);
      const factor=Math.min(1,650/Math.max(bitmap.width,bitmap.height));
      const canvas=document.createElement('canvas'); canvas.width=Math.max(1,Math.round(bitmap.width*factor)); canvas.height=Math.max(1,Math.round(bitmap.height*factor));
      canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);
      bitmap.close?.();
      letterhead.logo=canvas.toDataURL('image/png');
      if (letterhead.logo.length>1_000_000) throw new Error('O logotipo ficou muito grande. Escolha uma imagem menor.');
      updateLetterheadForm();
      if (persistLetterhead()) toast('Logotipo salvo.');
    } catch(e) { toast(e.message || 'Não foi possível processar a imagem.',true); }
    finally { $('#lh-logo').value=''; }
  }
  function exportReportPDF(sample=false) {
    if (!window.jspdf?.jsPDF) return toast('A biblioteca de PDF não carregou. Verifique a conexão com a internet.', true);
    const doc=new window.jspdf.jsPDF({orientation:'landscape',unit:'mm',format:'a4',compress:true});
    if (typeof doc.autoTable !== 'function') return toast('Componente de tabelas PDF indisponível. Atualize a página.',true);
    const hex=/^#[0-9a-f]{6}$/i.test(letterhead.color)?letterhead.color:'#6258e8';
    const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
    const pageWidth=doc.internal.pageSize.getWidth(), pageHeight=doc.internal.pageSize.getHeight();
    const company=str(letterhead.company)||'Nexo Estoque';
    const products=sample?state.products.slice(0,5):state.products;
    const ids=new Set(products.map(p=>p.id));
    const lots=(sample?allLots().filter(x=>ids.has(x.product.id)).slice(0,8):allLots());
    const movements=sample?state.movements.slice(0,5):[...state.movements].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    const issued=new Date().toLocaleString('pt-BR');
    const clean=value=>str(value).replace(/[\r\n]+/g,' ').slice(0,130);
    const header=()=>{
      doc.setFillColor(...rgb);doc.rect(0,0,pageWidth,7,'F');
      if (letterhead.logo) { try {doc.addImage(letterhead.logo,'PNG',14,13,24,19,undefined,'FAST');} catch { /* Logo inválido: relatório segue sem imagem. */ } }
      const x=letterhead.logo?43:15;
      doc.setFont('helvetica','bold');doc.setFontSize(16);doc.setTextColor(30,42,63);doc.text(clean(company),x,20,{maxWidth:170});
      doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor(93,106,126);
      if(letterhead.subtitle)doc.text(clean(letterhead.subtitle),x,26,{maxWidth:200});
      const right=[letterhead.id,letterhead.contact,letterhead.address].filter(Boolean).map(clean);
      right.forEach((line,i)=>doc.text(line,pageWidth-14,17+i*5,{align:'right',maxWidth:106}));
      doc.setDrawColor(220,226,237);doc.line(14,36,pageWidth-14,36);
      doc.setTextColor(...rgb);doc.setFont('helvetica','bold');doc.setFontSize(13);doc.text('RELATÓRIO DE ESTOQUE',14,45);
      doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(110,123,140);doc.text(`Emissão: ${issued}  ·  ${sample?'Amostra do papel timbrado':'Consolidado de estoque'}`,pageWidth-14,45,{align:'right'});
    };
    const base={theme:'grid', margin:{top:51,bottom:16,left:14,right:14}, styles:{font:'helvetica',fontSize:7.2,cellPadding:2.1,textColor:[45,56,77],overflow:'linebreak'},headStyles:{fillColor:rgb, textColor:[255,255,255],fontStyle:'bold',fontSize:7.3},alternateRowStyles:{fillColor:[247,249,252]}, didDrawPage:header};
    const totalUnits=products.reduce((s,p)=>s+p.qty,0), totalValue=products.reduce((s,p)=>s+p.qty*p.price,0);
    let y=51;
    doc.autoTable({ ...base, startY:y, head:[['Produtos cadastrados','Unidades disponíveis','Valor referencial de varejo','Lotes vencidos','Lotes próximos']], body:[[String(products.length),String(totalUnits),money(totalValue),String(lots.filter(l=>l.expiry.key==='expired').length),String(lots.filter(l=>l.expiry.key==='soon').length)]], styles:{...base.styles,fontSize:8.5,cellPadding:3} });
    y=doc.lastAutoTable.finalY+9;
    const section=(title,head,body,widths={})=>{
      if (y>pageHeight-35) {doc.addPage();y=51;}
      doc.setFontSize(10.5);doc.setFont('helvetica','bold');doc.setTextColor(...rgb);doc.text(title,14,y-3);
      doc.autoTable({...base,startY:y,head:[head],body:body.length?body:[['Nenhum registro',...head.slice(1).map(()=>'')]],columnStyles:widths});
      y=doc.lastAutoTable.finalY+10;
    };
    section('1. Produtos e preços',['Produto / SKU','Categoria','Quantidade','Mínimo','Varejo','Atacado','Promoção','Valor referencial'],products.map(p=>[clean(p.name)+'\n'+clean(p.sku),clean(p.category),String(p.qty),String(p.min),money(p.price),p.wholesaleEnabled?`${money(p.wholesalePrice)} (mín. ${p.wholesaleMin})`:'-',p.promotionEnabled?`${money(p.promotionPrice)} · ${promoStatus(p)==='active'?'ativa':promoStatus(p)==='scheduled'?'agendada':'encerrada'}`:'-',money(p.qty*p.price)]),{0:{cellWidth:56},1:{cellWidth:36}});
    section('2. Controle de lotes e validades',['Produto','Lote','Saldo','Perecível','Validade','Situação'],lots.map(({product:p,batch:b,expiry:s})=>[clean(p.name),clean(b.code),String(b.qty),p.perishable?'Sim':'Não',displayDate(b.expiry),clean(s.label)]),{0:{cellWidth:70}});
    section('3. Movimentações',['Data / hora','Produto','Tipo','Lote','Qtde.','Observação'],movements.map(m=>[dateLabel(m.createdAt),clean(m.productName),m.type==='entrada'?'Entrada':'Saída',clean(m.lotCode||'-'),String(m.qty),clean(m.note||'-')]));
    const pages=doc.internal.getNumberOfPages();
    for(let i=1;i<=pages;i++) {doc.setPage(i);doc.setDrawColor(223,229,238);doc.line(14,pageHeight-12,pageWidth-14,pageHeight-12);doc.setFont('helvetica','normal');doc.setFontSize(7);doc.setTextColor(127,140,158);doc.text(`${clean(company)} · Documento gerado pelo Nexo Estoque`,14,pageHeight-8);doc.text(`Página ${i} de ${pages}`,pageWidth-14,pageHeight-8,{align:'right'});}
    doc.save(`${sample?'nexo-modelo-timbrado':'nexo-relatorio-estoque'}-${todayISO()}.pdf`);
    toast('Relatório PDF gerado com papel timbrado.');
  }

  const freshState = () => ({ products: [], movements: [], settings: { threshold: 5, theme: 'light', expiryDays: 30 }, demo: false });
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
    const extra = [
      ['Iogurte natural 170g','ALI-011','Laticínios',24,6,5.90,'Laticínios Exemplo',7,'2026-001'],
      ['Café gourmet 500g','ALI-012','Mercearia',35,8,39.90,'Torrefação Exemplo',65,'2026-002'],
      ['Suco de laranja 1L','BEB-013','Bebidas',12,5,12.50,'Bebidas Exemplo',-3,'2026-003']
    ];
    extra.forEach(([name,sku,category,qty,min,price,supplier,days,lot]) => {
      const p={id:uid(),name,sku,category,qty,min,price,supplier,createdAt:dayOffset(18),perishable:true,wholesaleEnabled:true,wholesalePrice:Number((price*.78).toFixed(2)),wholesaleMin:12,promotionEnabled:sku==='ALI-011',promotionPrice:4.50,promotionStart:offsetISO(-2),promotionEnd:offsetISO(9),batches:[{id:uid(),code:lot,qty,expiry:offsetISO(days)}]};
      products.push(p);
    });
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
    return { products, movements, settings: { threshold: 5, theme: 'light', expiryDays: 30 }, demo: true };
  };

  let state;
  try { const saved = localStorage.getItem(STORAGE_KEY); state = saved ? JSON.parse(saved) : demoState(); }
  catch { state = demoState(); }
  if (!state || !Array.isArray(state.products) || !Array.isArray(state.movements)) state = demoState();
  state.settings = { threshold: 5, theme: 'light', expiryDays: 30, ...(state.settings || {}) };
  state.products=state.products.map(normalizeProduct);
  state.movements=state.movements.map(m=>({...m,lotCode:m.lotCode||''}));
  // Uma demo pública não deve mostrar dados locais como se viessem do banco.
  // Preservamos apenas a preferência de tema do visitante.
  if (cloudMode) {
    const theme=state.settings.theme,days=state.settings.expiryDays;
    state=freshState();state.settings.theme=theme;state.settings.expiryDays=days;
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
        localStorage.setItem('nexo_estoque_cloud_expiry_days',String(state.settings.expiryDays));
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
    if (!['dashboard', 'products', 'lots', 'movements', 'reports', 'settings'].includes(view)) return;
    currentView = view;
    $$('.view').forEach(el => { el.hidden = el.id !== `view-${view}`; el.classList.toggle('active', !el.hidden); });
    $$('[data-view].nav-item').forEach(button => {
      const active = button.dataset.view === view;
      button.classList.toggle('active', active);
      if (active) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
    });
    const titles = { dashboard: 'Visão geral', products: 'Produtos', lots: 'Lotes e validades', movements: 'Movimentações', reports: 'Relatórios', settings: 'Configurações' };
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
    const all = [...new Set([...CATEGORY_PRESETS,...state.products.map(p => p.category).filter(Boolean)])].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    select.innerHTML = '<option value="">Todas as categorias</option>' + all.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
    select.value = all.includes(original) ? original : '';
    $('#category-options').innerHTML = all.map(c => `<option value="${esc(c)}"></option>`).join('');
  }
  function renderProducts() {
    const term = normalized($('#product-search').value);
    const selectedCategory = $('#product-category').value;
    const filter = $('#product-status').value;
    const selected = state.products.filter(p => {
      const found = normalized(`${p.name} ${p.sku} ${p.barcode||''} ${p.supplier||''} ${(p.batches||[]).map(b=>b.code).join(' ')}`).includes(term);
      const categoryMatch = !selectedCategory || p.category === selectedCategory;
      const s = status(p);
      const match = !filter || (filter==='low' ? isLow(p) : filter==='perishable' ? p.perishable : filter==='expiring' ? productExpirySummary(p)==='soon' : filter==='expired' ? productExpirySummary(p)==='expired' : filter==='promotion' ? promoStatus(p)==='active' : filter==='wholesale' ? p.wholesaleEnabled : s.key===filter);
      return found && categoryMatch && match;
    }).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
    $('#products-table').innerHTML = selected.length ? selected.map(p=>{
      const s=status(p), expiry=productExpirySummary(p), promo=promoStatus(p);
      const price=`<div class="price-stack"><strong>${money(promo==='active'?p.promotionPrice:p.price)}</strong>${promo==='active'?`<small class="strike-price">${money(p.price)}</small><span class="micro-pill promo-pill">Promoção ativa</span>`:''}${promo==='scheduled'?'<span class="micro-pill neutral-pill">Promoção agendada</span>':''}${p.wholesaleEnabled?`<small>Atacado: <b>${money(p.wholesalePrice)}</b> · mín. ${p.wholesaleMin}</small>`:''}</div>`;
      const lotCount=activeBatches(p).length;
      const stateTag=p.perishable && expiry!=='ok' ? `<span class="micro-pill ${expiry==='expired'?'expired-pill':'soon-pill'}">${expiry==='expired'?'Vencido':expiry==='soon'?'Vencimento próximo':'Sem validade'}</span>`:'';
      return `<tr><td><div class="product-cell"><div class="product-symbol">${esc(initials(p.name))}</div><div><strong>${esc(p.name)}</strong><small>${esc(p.supplier||'Fornecedor não informado')}</small>${p.perishable?'<small class="small-highlight">Perecível</small>':''}</div></div></td><td class="code-cell">${esc(p.sku)}${p.barcode?`<small>${esc(p.barcode)}</small>`:''}</td><td><span class="tag">${esc(p.category)}</span></td><td class="quantity-cell">${count(p.qty)}</td><td>${price}</td><td><div class="status-stack"><span class="status ${s.key}">${s.label}</span>${stateTag}<small>${lotCount} lote(s)</small></div></td><td>${cloudMode?'<span class="read-only-cell">Somente leitura</span>':`<div class="row-actions"><button type="button" class="table-action" data-edit="${esc(p.id)}" title="Editar produto" aria-label="Editar ${esc(p.name)}">${icon('edit')}</button><button type="button" class="table-action danger" data-delete="${esc(p.id)}" title="Excluir produto" aria-label="Excluir ${esc(p.name)}">${icon('trash')}</button></div>`}</td></tr>`;
    }).join('') : `<tr><td colspan="7" class="table-empty">${empty('Experimente alterar os filtros ou cadastrar um produto.', 'Nenhum produto encontrado')}</td></tr>`;
    $('#products-footer').textContent=`Exibindo ${count(selected.length)} de ${count(state.products.length)} produto(s)`;
  }

  function renderMovements() {
    const term=normalized($('#movement-search').value), filter=$('#movement-type').value;
    const all=[...state.movements].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    const selected=all.filter(m=>(!filter||m.type===filter)&&normalized(`${m.productName} ${m.sku} ${m.lotCode||''} ${m.note||''}`).includes(term));
    $('#movements-table').innerHTML=selected.length?selected.map(m=>`<tr><td>${esc(dateLabel(m.createdAt))}</td><td><div class="product-cell"><div class="product-symbol">${esc(initials(m.productName))}</div><div><strong>${esc(m.productName)}</strong><small>${esc(m.sku||'')}</small></div></div></td><td><span class="movement-label ${esc(m.type)}">${icon(m.type==='entrada'?'arrow-down-left':'arrow-up-right')} ${m.type==='entrada'?'Entrada':'Saída'}</span></td><td><strong class="${m.type==='entrada'?'positive-text':'negative-text'}">${m.type==='entrada'?'+':'−'}${count(m.qty)}</strong></td><td><span class="code-cell">${esc(m.lotCode||'—')}</span></td><td>${esc(m.note||'—')}</td></tr>`).join(''):`<tr><td colspan="6" class="table-empty">${empty('Registre uma entrada ou saída para começar.', 'Nenhuma movimentação encontrada')}</td></tr>`;
    $('#mov-in-total').textContent=count(all.filter(m=>m.type==='entrada').reduce((s,m)=>s+m.qty,0));
    $('#mov-out-total').textContent=count(all.filter(m=>m.type==='saida').reduce((s,m)=>s+m.qty,0));
    $('#mov-count-total').textContent=count(all.length);
    $('#movements-footer').textContent=`Exibindo ${count(selected.length)} de ${count(all.length)} registro(s)`;
  }

  function renderLots() {
    const lots=allLots();
    const exp=lots.filter(l=>l.expiry.key==='expired').length, soon=lots.filter(l=>l.expiry.key==='soon').length, missing=lots.filter(l=>l.expiry.key==='missing').length;
    $('#lot-count').textContent=count(lots.length);
    $('#lot-expired').textContent=count(exp);$('#lot-soon').textContent=count(soon);$('#lot-missing').textContent=count(missing);
    $('#nav-expiry-count').textContent=count(exp+soon+missing);
    const problems=exp+soon+missing;
    $('#expiry-flash').hidden=!problems;
    $('#expiry-flash-title').textContent=`${count(problems)} lote(s) precisam de atenção`;
    $('#expiry-flash-text').textContent=[exp?`${exp} vencido(s)`:null,soon?`${soon} próximo(s) do vencimento`:null,missing?`${missing} sem validade cadastrada`:null].filter(Boolean).join(' · ')+`. Aviso com ${state.settings.expiryDays} dias de antecedência.`;
    const term=normalized($('#lot-search').value),filter=$('#lot-filter').value;
    const selected=lots.filter(l=>(!filter||l.expiry.key===filter)&&normalized(`${l.product.name} ${l.product.sku} ${l.batch.code}`).includes(term)).sort((a,b)=>{
      const rank={expired:0,missing:1,soon:2,ok:3,none:4};
      return rank[a.expiry.key]-rank[b.expiry.key] || (a.batch.expiry||'9999').localeCompare(b.batch.expiry||'9999');
    });
    $('#lots-table').innerHTML=selected.length?selected.map(({product:p,batch:b,expiry:e})=>`<tr><td><div class="product-cell"><div class="product-symbol">${esc(initials(p.name))}</div><div><strong>${esc(p.name)}</strong><small>${esc(p.sku)}${p.perishable?' · Perecível':''}</small></div></div></td><td class="code-cell">${esc(b.code)}</td><td><strong>${count(b.qty)}</strong></td><td>${esc(displayDate(b.expiry))}</td><td><span class="micro-pill ${e.key==='expired'?'expired-pill':e.key==='soon'||e.key==='missing'?'soon-pill':'neutral-pill'}">${esc(e.label)}</span></td><td>${cloudMode?'<span class="read-only-cell">Somente leitura</span>':`<button class="btn btn-outline btn-small" data-edit-lot="${esc(b.id)}" data-lot-product="${esc(p.id)}" type="button">Editar lote</button>`}</td></tr>`).join(''):`<tr><td colspan="6" class="table-empty">${empty('Cadastre ou filtre lotes para visualizar o controle de validade.','Nenhum lote encontrado')}</td></tr>`;
    $('#lots-footer').textContent=`Exibindo ${count(selected.length)} de ${count(lots.length)} lote(s) com saldo`;
    $('#alert-dot').hidden=state.products.filter(isLow).length+problems===0;
    $('#alerts-shortcut').title=problems?`${problems} lote(s) com alertas de validade`:'Alertas de estoque';
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
    $('#demo-banner').hidden=cloudMode||!state.demo;
    $('#default-min').value=state.settings.threshold;
    $('#expiry-days').value=state.settings.expiryDays;
    updateCategoryOptions();
    renderStats();renderChart();renderDonut();renderDashboardLists();renderProducts();renderMovements();renderLots();renderReports();
    const lots=allLots(), exp=lots.filter(x=>x.expiry.key==='expired').length, soon=lots.filter(x=>x.expiry.key==='soon').length;
    $('#report-expiry').innerHTML=[['Lotes vencidos',exp?`${exp} lote(s) vencido(s). Não disponibilize para venda sem avaliação adequada.`:'Nenhum lote vencido.'],['Lotes próximos do vencimento',soon?`${soon} lote(s) vencendo em até ${state.settings.expiryDays} dias.`:'Nenhum lote com vencimento próximo.'],['Promoções ativas',`${state.products.filter(p=>promoStatus(p)==='active').length} produto(s) com preço promocional em vigor.`]].map(([a,b])=>`<div class="insight-box"><strong>${esc(a)}</strong><p>${esc(b)}</p></div>`).join('');
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
    stopCamera();
    $$('.modal-backdrop').forEach(el => { el.classList.remove('show'); el.setAttribute('aria-hidden', 'true'); });
    document.body.style.overflow = '';
    if (restore && lastFocused && lastFocused.isConnected) lastFocused.focus();
  }
  function openProduct(product=null) {
    if (cloudMode) return toast('Demonstração pública somente leitura.',true);
    $('#product-form').reset();
    $('#product-id').value=product?.id||'';
    $('#product-modal-title').textContent=product?'Editar produto':'Novo produto';
    $('#p-name').value=product?.name||'';
    $('#p-sku').value=product?.sku||'';
    $('#p-barcode').value=product?.barcode||'';
    $('#barcode-feedback').textContent='Consulta à Open Food Facts. Preços e validade são preenchidos manualmente.';
    $('#p-category').value=product?.category||'';
    $('#p-qty').value=product?.qty??0;
    $('#p-min').value=product?.min??state.settings.threshold;
    $('#p-price').value=product?.price??'';
    $('#p-supplier').value=product?.supplier||'';
    $('#p-perishable').checked=Boolean(product?.perishable);
    $('#p-wholesale-enabled').checked=Boolean(product?.wholesaleEnabled);
    $('#p-wholesale-price').value=product?.wholesalePrice??'';
    $('#p-wholesale-min').value=product?.wholesaleMin??10;
    $('#p-promo-enabled').checked=Boolean(product?.promotionEnabled);
    $('#p-promo-price').value=product?.promotionPrice??'';
    $('#p-promo-start').value=product?.promotionStart||'';
    $('#p-promo-end').value=product?.promotionEnd||'';
    $('#p-initial-lot').value='';$('#p-initial-expiry').value='';
    $('#p-qty').readOnly=!!product;
    $('#quantity-note').hidden=!product;
    toggleProductFields();openModal('product-modal');
  }

  function openMovement(type='entrada',productId='') {
    if (cloudMode) return toast('Demonstração pública somente leitura.',true);
    if (!state.products.length) {toast('Cadastre um produto antes de registrar movimentações.',true);openProduct();return;}
    $('#movement-form').reset();$('#m-type').value=type;
    $('#movement-modal-title').textContent=type==='entrada'?'Registrar entrada e lote':'Registrar saída por lote';
    $('#m-product').innerHTML='<option value="">Selecione um produto</option>'+[...state.products].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')).map(p=>`<option value="${esc(p.id)}">${esc(p.name)} · ${esc(p.sku)}</option>`).join('');
    $('#m-product').value=productId||'';
    $('#m-lot-code').value='';$('#m-expiry').value='';
    updateLotChoice();openModal('movement-modal');
  }

  function updateMovementAvailable() {
    const p=state.products.find(x=>x.id===$('#m-product').value),entry=$('#m-type').value==='entrada';
    const b=p?.batches.find(x=>x.id===$('#m-batch').value);
    $('#movement-available').textContent=p?`${count(p.qty)} unidade(s) disponíveis. ${entry?'Nova entrada: informe o lote e, para perecíveis, a validade.':b?`Lote ${b.code}: ${count(b.qty)} unidade(s) disponíveis.`:'Selecione um lote com saldo para realizar a saída.'}`:'Selecione um produto para consultar o saldo.';
  }

  function handleProductSave(event) {
    event.preventDefault();
    if(cloudMode)return toast('Operação bloqueada na visualização pública.',true);
    const existing=state.products.find(p=>p.id===$('#product-id').value);
    const product={
      id:existing?.id||uid(), name:str($('#p-name').value),sku:str($('#p-sku').value).toUpperCase(),category:str($('#p-category').value),
      barcode:str($('#p-barcode').value).replace(/\D/g,''),qty:existing?existing.qty:Number($('#p-qty').value),min:Number($('#p-min').value),
      price:Number($('#p-price').value),supplier:str($('#p-supplier').value),perishable:$('#p-perishable').checked,
      wholesaleEnabled:$('#p-wholesale-enabled').checked, wholesalePrice:Number($('#p-wholesale-price').value||0),wholesaleMin:Number($('#p-wholesale-min').value||10),
      promotionEnabled:$('#p-promo-enabled').checked,promotionPrice:Number($('#p-promo-price').value||0),promotionStart:$('#p-promo-start').value,promotionEnd:$('#p-promo-end').value,
      batches:existing?.batches||[],createdAt:existing?.createdAt||new Date().toISOString()
    };
    if(!product.name||!product.sku||!product.category)return toast('Preencha nome, SKU e categoria.',true);
    if(product.barcode&&!/^\d{8,14}$/.test(product.barcode))return toast('Código de barras deve ter entre 8 e 14 dígitos.',true);
    if(![product.qty,product.min].every(positiveInteger)||!Number.isFinite(product.price)||product.price<0||product.qty>99999999||product.min>99999999)return toast('Confira quantidades e preço.',true);
    if(state.products.some(p=>p.id!==product.id&&normalized(p.sku)===normalized(product.sku)))return toast('SKU já cadastrado.',true);
    if(product.barcode&&state.products.some(p=>p.id!==product.id&&p.barcode===product.barcode))return toast('Código de barras já associado a outro produto.',true);
    if(product.wholesaleEnabled && (!Number.isFinite(product.wholesalePrice)||product.wholesalePrice<0||!Number.isSafeInteger(product.wholesaleMin)||product.wholesaleMin<2||product.wholesalePrice>=product.price))return toast('Atacado precisa ter preço inferior ao varejo e mínimo de 2 unidades.',true);
    if(product.promotionEnabled && (!Number.isFinite(product.promotionPrice)||product.promotionPrice<0||product.promotionPrice>=product.price||product.promotionStart&& !validISO(product.promotionStart)||product.promotionEnd && !validISO(product.promotionEnd)||product.promotionStart && product.promotionEnd && product.promotionEnd<product.promotionStart))return toast('Confira preço promocional (inferior ao varejo) e período da oferta.',true);
    if(!existing&&product.qty>0) {
      const code=str($('#p-initial-lot').value),expiry=$('#p-initial-expiry').value;
      if(!code)return toast('Informe o número do lote inicial.',true);
      if(product.perishable&&!validISO(expiry))return toast('Informe uma validade para o lote perecível.',true);
      product.batches=[{id:uid(),code,qty:product.qty,expiry:validISO(expiry)?expiry:''}];
    }
    if(existing)Object.assign(existing,product);
    else {
      state.products.unshift(product);
      if(product.qty>0) state.movements.unshift({id:uid(),productId:product.id,productName:product.name,sku:product.sku,type:'entrada',qty:product.qty,lotCode:product.batches[0].code,batchId:product.batches[0].id,note:'Estoque inicial',createdAt:new Date().toISOString()});
    }
    persist();closeModal();renderAll();toast(existing?'Produto atualizado.':'Produto cadastrado com lote inicial.');
  }

  function handleMovementSave(event) {
    event.preventDefault();
    if(cloudMode)return toast('Operação bloqueada na visualização pública.',true);
    const p=state.products.find(x=>x.id===$('#m-product').value),type=$('#m-type').value,qty=Number($('#m-qty').value);
    if(!p||!['entrada','saida'].includes(type)||!Number.isSafeInteger(qty)||qty<=0)return toast('Selecione um produto e uma quantidade válida.',true);
    let b;
    if(type==='entrada') {
      const code=str($('#m-lot-code').value),exp=$('#m-expiry').value;
      if(!code)return toast('Informe o número do lote.',true);
      if(p.perishable&&!validISO(exp))return toast('Para produtos perecíveis, informe a validade.',true);
      b=p.batches.find(x=>normalized(x.code)===normalized(code));
      if(b && b.expiry && exp && b.expiry!==exp)return toast('Este lote já possui outra data de validade. Confira a identificação.',true);
      if(!b){b={id:uid(),code,qty:0,expiry:exp||''};p.batches.push(b);}
      else if(!b.expiry&&exp)b.expiry=exp;
      b.qty+=qty;
    } else {
      b=p.batches.find(x=>x.id===$('#m-batch').value);
      if(!b)return toast('Selecione o lote para registrar a saída.',true);
      if(qty>b.qty)return toast(`Lote ${b.code} possui apenas ${count(b.qty)} unidade(s).`,true);
      b.qty-=qty;
    }
    p.qty=p.batches.reduce((sum,b)=>sum+b.qty,0);
    state.movements.unshift({id:uid(),productId:p.id,productName:p.name,sku:p.sku,type,qty,lotCode:b.code,batchId:b.id,note:str($('#m-note').value),createdAt:new Date().toISOString()});
    persist();closeModal();renderAll();toast(type==='entrada'?'Entrada registrada no lote.':'Saída registrada com identificação do lote.');
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
    const rows=[['Nome','SKU','Código de barras','Categoria','Quantidade','Estoque mínimo','Varejo (R$)','Atacado (R$)','Mínimo atacado','Promoção (R$)','Início promoção','Fim promoção','Perecível','Lotes','Fornecedor']];
    state.products.forEach(p=>rows.push([p.name,p.sku,p.barcode,p.category,p.qty,p.min,p.price.toFixed(2).replace('.',','),p.wholesaleEnabled?p.wholesalePrice.toFixed(2).replace('.',','):'',p.wholesaleEnabled?p.wholesaleMin:'',p.promotionEnabled?p.promotionPrice.toFixed(2).replace('.',','):'',p.promotionStart,p.promotionEnd,p.perishable?'Sim':'Não',activeBatches(p).map(b=>`${b.code} (${b.qty}; validade ${b.expiry||'N/I'})`).join(' | '),p.supplier]));
    download('nexo-produtos.csv',toCSV(rows),'text/csv;charset=utf-8');toast('CSV de produtos gerado.');
  }

  function movementCSV() {
    const rows=[['Data','Produto','SKU','Tipo','Lote','Quantidade','Observação']];
    [...state.movements].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).forEach(m=>rows.push([dateLabel(m.createdAt),m.productName,m.sku,m.type,m.lotCode||'',m.qty,m.note]));
    download('nexo-movimentacoes.csv',toCSV(rows),'text/csv;charset=utf-8');toast('CSV de movimentações gerado.');
  }

  function backupJSON() {
    download(`nexo-backup-${todayISO()}.json`,JSON.stringify({...state,letterhead,exportedAt:new Date().toISOString(),format:'nexo-estoque-v3'},null,2),'application/json;charset=utf-8');
    toast('Backup completo gerado.');
  }

  async function restoreJSON(file) {
    if(cloudMode)return toast('Importação indisponível no modo público.',true);
    if(!file)return;
    try {
      if(file.size>5_000_000)throw new Error('Arquivo muito grande.');
      const parsed=JSON.parse(await file.text());
      if(!Array.isArray(parsed.products)||!Array.isArray(parsed.movements))throw new Error('Backup inválido.');
      if(parsed.products.length>10000||parsed.movements.length>30000)throw new Error('Limite de registros excedido.');
      const products=parsed.products.map(p=>normalizeProduct({id:str(p.id||uid()).slice(0,100),name:str(p.name).slice(0,90),sku:str(p.sku).slice(0,36),barcode:str(p.barcode).slice(0,14),category:str(p.category).slice(0,45),qty:Number(p.qty),min:Number(p.min),price:Number(p.price),supplier:str(p.supplier).slice(0,70),perishable:Boolean(p.perishable),wholesaleEnabled:Boolean(p.wholesaleEnabled),wholesalePrice:Number(p.wholesalePrice||0),wholesaleMin:Number(p.wholesaleMin||10),promotionEnabled:Boolean(p.promotionEnabled),promotionPrice:Number(p.promotionPrice||0),promotionStart:str(p.promotionStart),promotionEnd:str(p.promotionEnd),createdAt:str(p.createdAt),batches:Array.isArray(p.batches)?p.batches:undefined}));
      const movements=parsed.movements.map(m=>({id:str(m.id||uid()).slice(0,100),productId:str(m.productId).slice(0,100),productName:str(m.productName).slice(0,90),sku:str(m.sku).slice(0,36),type:str(m.type),qty:Number(m.qty),note:str(m.note).slice(0,180),lotCode:str(m.lotCode).slice(0,45),batchId:str(m.batchId).slice(0,100),createdAt:str(m.createdAt)}));
      if(products.some(p=>!p.name||!p.sku||!positiveInteger(p.min)||!Number.isFinite(p.price)||p.price<0||p.batches.some(b=>!positiveInteger(b.qty)||!b.code)) || movements.some(m=>!['entrada','saida'].includes(m.type)||!Number.isSafeInteger(m.qty)||m.qty<1))throw new Error('Backup com valores inválidos.');
      if(!confirm('Restaurar backup? Os dados locais atuais serão substituídos.'))return;
      state={products,movements,settings:{...state.settings,threshold:Number(parsed.settings?.threshold)||5,expiryDays:Number(parsed.settings?.expiryDays)||30},demo:false};
      if(parsed.letterhead&&typeof parsed.letterhead==='object') { letterhead={...DEFAULT_LETTERHEAD,...parsed.letterhead};persistLetterhead();updateLetterheadForm(); }
      persist();renderAll();toast('Backup restaurado com sucesso.');
    }catch(e){toast(e.message||'Erro ao importar backup.',true);}
    finally{$('#restore-file').value='';}
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
      const editLot=target.closest('[data-edit-lot]');
      if(editLot){openLotEditor(editLot.dataset.lotProduct,editLot.dataset.editLot);return;}
      const remove = target.closest('[data-delete]');
      if (remove) { deleteProduct(remove.dataset.delete); return; }
      if (target.closest('[data-close-modal]') || target.classList.contains('modal-backdrop')) { closeModal(); return; }
      const period = target.closest('[data-period]');
      if (period) { currentPeriod = Number(period.dataset.period); $$('[data-period]').forEach(button => button.classList.toggle('active', button === period)); renderChart(); }
    });
    $('#product-form').addEventListener('submit', handleProductSave);
    $('#movement-form').addEventListener('submit', handleMovementSave);
    $('#lot-form').addEventListener('submit',saveLot);
    $('#p-wholesale-enabled').addEventListener('change',toggleProductFields);
    $('#p-promo-enabled').addEventListener('change',toggleProductFields);
    $('#p-perishable').addEventListener('change',toggleProductFields);
    $('#p-qty').addEventListener('input',toggleProductFields);
    $('#barcode-lookup').addEventListener('click',lookupBarcode);
    $('#barcode-camera').addEventListener('click',startCamera);
    $('#camera-stop').addEventListener('click',stopCamera);
    $('#p-barcode').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();lookupBarcode();}});
    $('#lot-search').addEventListener('input',renderLots);
    $('#lot-filter').addEventListener('change',renderLots);
    $('#m-batch').addEventListener('change',updateMovementAvailable);
    $('#letterhead-form').addEventListener('submit',saveLetterhead);
    $('#lh-logo').addEventListener('change',e=>uploadLogo(e.target.files?.[0]));
    $('#lh-logo-remove').addEventListener('click',()=>{letterhead.logo='';updateLetterheadForm();persistLetterhead();toast('Logotipo removido.');});
    $('#preview-pdf').addEventListener('click',()=>{saveLetterhead(new Event('submit',{cancelable:true}));exportReportPDF(true);});
    $('#expiry-settings-form').addEventListener('submit',e=>{e.preventDefault();const n=Number($('#expiry-days').value);if(!Number.isSafeInteger(n)||n<1||n>365)return toast('Informe entre 1 e 365 dias.',true);state.settings.expiryDays=n;persist();renderAll();toast('Prazo de alerta atualizado.');});
    $('#m-product').addEventListener('change',()=>{ $('#m-lot-code').value='';updateLotChoice(); });
    $('#product-search').addEventListener('input', renderProducts);
    $('#product-category').addEventListener('change', renderProducts);
    $('#product-status').addEventListener('change', () => { lowOnly = false; renderProducts(); });
    $('#movement-search').addEventListener('input', renderMovements);
    $('#movement-type').addEventListener('change', renderMovements);
    $('#export-products').addEventListener('click', productCSV);
    $('#export-report').addEventListener('click',()=>exportReportPDF(false));
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
    $('#alerts-shortcut').addEventListener('click', () => allLots().some(x=>['expired','soon','missing'].includes(x.expiry.key)) ? changeView('lots') : changeView('products',{lowOnly:true}));
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
    if(!cloudMode)return;
    let savedTheme=null,savedDays=null;
    try {savedTheme=localStorage.getItem('nexo_estoque_cloud_theme');savedDays=localStorage.getItem('nexo_estoque_cloud_expiry_days');}catch{}
    if(savedTheme==='dark'||savedTheme==='light')setTheme(savedTheme,false);
    if(savedDays&&Number(savedDays)>0)state.settings.expiryDays=Number(savedDays);
    $('#cloud-banner').hidden=false;
    $$('[data-open-product],[data-open-movement],#restore-json,#erase-data,#clear-demo').forEach(el=>el.hidden=true);
    const submit=$('#settings-form button[type="submit"]');if(submit)submit.hidden=true;
    $('#default-min').disabled=true;
    $('.sidebar-profile strong').textContent='Acesso público';
    $('.sidebar-profile small').textContent='Consulta segura';
    $('.top-avatar').textContent='DE';
    $('#settings-readonly-note').hidden=false;
    $('#cloud-refresh').addEventListener('click',syncCloud);
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
    if(!cloudMode)return;
    const label=$('#cloud-status'),refresh=$('#cloud-refresh');
    refresh.disabled=true;label.textContent='Atualizando dados do banco...';
    try {
      const [products,movements,batches]=await Promise.all([loadTable('inventory_products'),loadTable('inventory_movements'),loadTable('inventory_batches')]);
      const byProduct=new Map();
      batches.forEach(b=>{const entries=byProduct.get(b.product_id)||[];entries.push({id:b.id,code:b.lot_code,qty:Number(b.quantity),expiry:b.expires_on||''});byProduct.set(b.product_id,entries);});
      state.products=products.map(p=>normalizeProduct({id:p.id,name:p.name,sku:p.sku,barcode:p.barcode||'',category:p.category,qty:Number(p.qty),min:Number(p.minimum_qty),price:Number(p.unit_price),supplier:p.supplier||'',perishable:p.is_perishable,wholesaleEnabled:p.wholesale_enabled,wholesalePrice:Number(p.wholesale_price||0),wholesaleMin:Number(p.wholesale_min_qty||10),promotionEnabled:p.promotion_enabled,promotionPrice:Number(p.promotion_price||0),promotionStart:p.promotion_starts_on||'',promotionEnd:p.promotion_ends_on||'',batches:byProduct.get(p.id)||[],createdAt:p.created_at}));
      state.movements=movements.map(m=>({id:m.id,productId:m.product_id,productName:m.product_name,sku:m.sku,type:m.movement_type,qty:Number(m.quantity),lotCode:m.lot_code||'',batchId:m.batch_id||'',note:m.note||'',createdAt:m.created_at}));
      state.demo=false;
      label.textContent=`${count(products.length)} produtos e ${count(batches.length)} lotes · sincronizado às ${new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`;
      renderAll();
    }catch(error){state.products=[];state.movements=[];label.textContent=`Erro: ${error.message} · Execute sql/02_atualizar_banco.sql`;renderAll();toast('Falha ao carregar: verifique a migração do Supabase.',true);console.error('Supabase:',error);}
    finally{refresh.disabled=false;}
  }

  function init() {
    paintIcons();
    $('#today-label').textContent = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    $('#copyright-year').textContent = new Date().getFullYear();
    setTheme(state.settings.theme, false);
    updateLetterheadForm();
    bindEvents(); configureCloudUI(); renderAll();
    if (!cloudMode) persist();
    if (cloudMode) syncCloud();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
