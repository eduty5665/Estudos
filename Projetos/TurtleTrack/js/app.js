const STORAGE_PRODUCTS = 'turtletrack_products';
const STORAGE_MOVEMENTS = 'turtletrack_movements';
const STORAGE_SESSION = 'turtletrack_logged_user';

const starterProducts = [
  { id: 1, nome: 'Água Mineral 500ml', quantidade: 120, preco: 3.5, categoria: 'Bebida' },
  { id: 2, nome: 'Coxinha', quantidade: 48, preco: 7, categoria: 'Salgado' },
  { id: 3, nome: 'Sanduíche Natural', quantidade: 24, preco: 12.9, categoria: 'Lanche' },
  { id: 4, nome: 'Batata Porção', quantidade: 32, preco: 18, categoria: 'Porção' }
];

const starterMovements = [
  { id: 1, data: '2026-05-30T09:15:00', produtoId: 1, produtoNome: 'Água Mineral 500ml', tipo: 'entrada', quantidade: 50, descricao: 'Reposição semanal', estoqueAtual: 120 },
  { id: 2, data: '2026-05-29T16:40:00', produtoId: 2, produtoNome: 'Coxinha', tipo: 'saida', quantidade: 12, descricao: 'Envio para loja', estoqueAtual: 48 },
  { id: 3, data: '2026-05-28T11:05:00', produtoId: 3, produtoNome: 'Sanduíche Natural', tipo: 'entrada', quantidade: 24, descricao: 'Produção do dia', estoqueAtual: 24 }
];

function ensureData() {
  if (!localStorage.getItem(STORAGE_PRODUCTS)) {
    localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(starterProducts));
  }
  if (!localStorage.getItem(STORAGE_MOVEMENTS)) {
    localStorage.setItem(STORAGE_MOVEMENTS, JSON.stringify(starterMovements));
  }
}

function getProducts() {
  ensureData();
  return JSON.parse(localStorage.getItem(STORAGE_PRODUCTS)) || [];
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(products));
}

function getMovements() {
  ensureData();
  return JSON.parse(localStorage.getItem(STORAGE_MOVEMENTS)) || [];
}

function saveMovements(movements) {
  localStorage.setItem(STORAGE_MOVEMENTS, JSON.stringify(movements));
}

function nextId(items) {
  return items.length ? Math.max(...items.map((item) => Number(item.id))) + 1 : 1;
}

function formatMoney(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(value) {
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

function escapeText(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));
}

function notify(message, type = 'success') {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.dataset.type = type;
  toast.classList.add('show');
  window.clearTimeout(notify.timer);
  notify.timer = window.setTimeout(() => toast.classList.remove('show'), 2400);
}

function handleLogin() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const user = document.getElementById('login-user').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if ((user === 'eduty' && password === '1234') || (user && password)) {
      localStorage.setItem(STORAGE_SESSION, user || 'visitante');
      window.location.href = 'menu.html';
      return;
    }

    notify('Usuário ou senha incorretos!', 'error');
  });
}

function handleCadastro() {
  const form = document.getElementById('cadastro-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const products = getProducts();
    const product = {
      id: nextId(products),
      nome: document.getElementById('nome').value.trim(),
      quantidade: Number(document.getElementById('quantidade').value),
      preco: Number(document.getElementById('preco').value),
      categoria: document.getElementById('categoria').value
    };

    products.unshift(product);
    saveProducts(products);
    notify('Produto cadastrado com sucesso!');
    window.setTimeout(() => { window.location.href = 'produtos.html'; }, 500);
  });
}

function renderProducts() {
  const tbody = document.getElementById('produtos-body');
  if (!tbody) return;

  const products = getProducts();
  if (!products.length) {
    tbody.innerHTML = '<tr><td colspan="6">Nenhum produto encontrado.</td></tr>';
    return;
  }

  tbody.innerHTML = products.map((product) => `
    <tr data-id="${product.id}" data-nome="${escapeText(product.nome)}" data-quantidade="${product.quantidade}" data-preco="${product.preco}" data-categoria="${escapeText(product.categoria)}">
      <td>${product.id}</td>
      <td>${escapeText(product.nome)}</td>
      <td>${product.quantidade}</td>
      <td>${formatMoney(product.preco)}</td>
      <td>${escapeText(product.categoria || '-')}</td>
      <td><button class="btn-edit" type="button">✏️</button> <button class="btn-del" type="button">🗑️</button></td>
    </tr>
  `).join('');
}

function handleProductsPage() {
  const table = document.getElementById('tabela-produtos');
  if (!table) return;

  renderProducts();

  const search = document.getElementById('search');
  search?.addEventListener('input', () => {
    const term = search.value.toLowerCase();
    document.querySelectorAll('#produtos-body tr').forEach((row) => {
      row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none';
    });
  });

  table.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    const row = event.target.closest('tr');
    if (!button || !row) return;

    if (button.classList.contains('btn-edit')) {
      document.getElementById('edit-id').value = row.dataset.id;
      document.getElementById('edit-nome').value = row.dataset.nome;
      document.getElementById('edit-quantidade').value = row.dataset.quantidade;
      document.getElementById('edit-preco').value = row.dataset.preco;
      document.getElementById('edit-categoria').value = row.dataset.categoria;
      document.getElementById('modal-editar').hidden = false;
    }

    if (button.classList.contains('btn-del') && confirm(`Deseja realmente excluir ${row.dataset.nome}?`)) {
      saveProducts(getProducts().filter((product) => String(product.id) !== row.dataset.id));
      renderProducts();
      notify('Produto excluído com sucesso!');
    }
  });

  document.getElementById('fechar-modal')?.addEventListener('click', () => {
    document.getElementById('modal-editar').hidden = true;
  });

  document.getElementById('modal-editar')?.addEventListener('click', (event) => {
    if (event.target.id === 'modal-editar') event.target.hidden = true;
  });

  document.getElementById('form-editar')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const id = Number(document.getElementById('edit-id').value);
    const products = getProducts().map((product) => product.id === id ? {
      ...product,
      nome: document.getElementById('edit-nome').value.trim(),
      quantidade: Number(document.getElementById('edit-quantidade').value),
      preco: Number(document.getElementById('edit-preco').value),
      categoria: document.getElementById('edit-categoria').value.trim()
    } : product);

    saveProducts(products);
    document.getElementById('modal-editar').hidden = true;
    renderProducts();
    notify('Produto atualizado com sucesso!');
  });
}

function renderMovementProductOptions() {
  const select = document.getElementById('produto');
  if (!select) return;

  const current = select.value;
  select.innerHTML = '<option value="">Selecione o produto...</option>' + getProducts().map((product) => (
    `<option value="${product.id}">${escapeText(product.nome)} - estoque: ${product.quantidade}</option>`
  )).join('');
  select.value = current;
}

function renderMovements() {
  const tbody = document.getElementById('movimentos-body');
  if (!tbody) return;

  const movements = getMovements();
  if (!movements.length) {
    tbody.innerHTML = '<tr><td colspan="6">Nenhuma movimentação registrada.</td></tr>';
    return;
  }

  tbody.innerHTML = movements.map((movement) => `
    <tr>
      <td>${formatDate(movement.data)}</td>
      <td>${escapeText(movement.produtoNome)}</td>
      <td>${movement.tipo === 'entrada' ? 'Entrada' : 'Saída'}</td>
      <td>${movement.quantidade}</td>
      <td>${escapeText(movement.descricao || '-')}</td>
      <td><strong>${movement.estoqueAtual}</strong></td>
    </tr>
  `).join('');
}

function handleMovementsPage() {
  const form = document.getElementById('movimentacao-form');
  if (!form) return;

  renderMovementProductOptions();
  renderMovements();

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const productId = Number(document.getElementById('produto').value);
    const tipo = document.getElementById('tipo').value;
    const quantidade = Number(document.getElementById('quantidade').value);
    const descricao = document.getElementById('descricao').value.trim();
    const products = getProducts();
    const product = products.find((item) => item.id === productId);

    if (!product) {
      notify('Selecione um produto válido.', 'error');
      return;
    }

    if (tipo === 'saida' && quantidade > product.quantidade) {
      notify('Quantidade de saída maior que o estoque disponível.', 'error');
      return;
    }

    product.quantidade = tipo === 'entrada' ? product.quantidade + quantidade : product.quantidade - quantidade;
    saveProducts(products);

    const movements = getMovements();
    movements.unshift({
      id: nextId(movements),
      data: new Date().toISOString(),
      produtoId: product.id,
      produtoNome: product.nome,
      tipo,
      quantidade,
      descricao,
      estoqueAtual: product.quantidade
    });
    saveMovements(movements);

    notify('Movimentação registrada com sucesso!');
    form.reset();
    renderMovementProductOptions();
    renderMovements();
  });
}

ensureData();
document.addEventListener('DOMContentLoaded', () => {
  handleLogin();
  handleCadastro();
  handleProductsPage();
  handleMovementsPage();
});
