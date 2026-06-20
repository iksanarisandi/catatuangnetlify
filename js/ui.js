const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatRupiah(amount) {
  return rupiah.format(amount);
}

export function formatMonthYear(year, month) {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

export function formatDateId(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function showView(name) {
  document.querySelectorAll('.view').forEach((el) => {
    el.classList.remove('active');
  });
  const view = document.getElementById(`view-${name}`);
  if (view) view.classList.add('active');
}

export function setAuthError(elementId, message) {
  const el = document.getElementById(elementId);
  if (!message) {
    el.classList.add('hidden');
    el.textContent = '';
    return;
  }
  el.textContent = message;
  el.classList.remove('hidden');
}

export function renderSummary({ income, expense, balance }) {
  document.getElementById('summary-balance').textContent = formatRupiah(balance);
  document.getElementById('summary-income').textContent = formatRupiah(income);
  document.getElementById('summary-expense').textContent = formatRupiah(expense);
}

export function renderMonthLabel(year, month) {
  document.getElementById('month-label').textContent = formatMonthYear(year, month);
}

export function renderTransactionList(transactions, onDelete) {
  const list = document.getElementById('transaction-list');
  const empty = document.getElementById('empty-state');

  list.innerHTML = '';

  if (transactions.length === 0) {
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');

  const grouped = {};
  for (const t of transactions) {
    if (!grouped[t.transaction_date]) grouped[t.transaction_date] = [];
    grouped[t.transaction_date].push(t);
  }

  for (const date of Object.keys(grouped).sort((a, b) => b.localeCompare(a))) {
    const dateHeader = document.createElement('p');
    dateHeader.className = 'text-xs font-extrabold text-black/70 uppercase tracking-wide mt-4 mb-2 first:mt-0';
    dateHeader.textContent = formatDateId(date);
    list.appendChild(dateHeader);

    for (const t of grouped[date]) {
      const isIncome = t.type === 'income';
      const div = document.createElement('div');
      div.className =
        'group bg-white p-4 rounded-xl nb-shadow nb-border flex items-center justify-between gap-3 task-enter';
      div.id = `tx-${t.id}`;

      div.innerHTML = `
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-extrabold px-2 py-0.5 rounded border-3 border-black uppercase ${
              isIncome ? 'bg-brand-lime text-black' : 'bg-brand-pink text-black'
            }">${isIncome ? 'Pemasukan' : 'Pengeluaran'}</span>
            <span class="text-xs font-semibold text-black/70">${t.category}</span>
          </div>
          <p class="font-bold text-black truncate">${escapeHtml(t.description)}</p>
          <p class="text-lg font-extrabold text-black mt-0.5">
            ${isIncome ? '+' : '-'}${formatRupiah(Number(t.amount))}
          </p>
        </div>
        <button
          type="button"
          data-id="${t.id}"
          class="delete-btn bg-white border-3 border-black nb-shadow-sm text-black w-9 h-9 rounded-lg flex items-center justify-center shrink-0 hover:bg-brand-pink transition-colors"
          aria-label="Hapus transaksi"
        >
          <i class="fa-regular fa-trash-can"></i>
        </button>
      `;

      div.querySelector('.delete-btn').addEventListener('click', () => onDelete(t.id, div));
      list.appendChild(div);
    }
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function animateRemove(element, callback) {
  element.classList.remove('task-enter');
  element.classList.add('task-leave');
  setTimeout(callback, 300);
}

export function showConfirmDeleteModal() {
  return new Promise((resolve) => {
    const modal = document.getElementById('delete-modal');
    const content = document.getElementById('delete-modal-content');
    const btnCancel = document.getElementById('delete-modal-cancel');
    const btnConfirm = document.getElementById('delete-modal-confirm');

    if (!modal || !content || !btnCancel || !btnConfirm) {
      resolve(confirm('Hapus transaksi ini?'));
      return;
    }

    modal.classList.remove('hidden');
    
    // Trigger reflow to let the browser know the element is now visible
    // and apply transition styles
    modal.offsetHeight;

    modal.classList.remove('opacity-0');
    modal.classList.add('opacity-100');
    content.classList.remove('scale-95');
    content.classList.add('scale-100');

    const cleanUp = () => {
      modal.classList.remove('opacity-100');
      modal.classList.add('opacity-0');
      content.classList.remove('scale-100');
      content.classList.add('scale-95');

      setTimeout(() => {
        modal.classList.add('hidden');
      }, 200);

      btnCancel.removeEventListener('click', onCancel);
      btnConfirm.removeEventListener('click', onConfirm);
      modal.removeEventListener('click', onOutsideClick);
    };

    function onCancel() {
      cleanUp();
      resolve(false);
    }

    function onConfirm() {
      cleanUp();
      resolve(true);
    }

    function onOutsideClick(e) {
      if (e.target === modal) {
        cleanUp();
        resolve(false);
      }
    }

    btnCancel.addEventListener('click', onCancel);
    btnConfirm.addEventListener('click', onConfirm);
    modal.addEventListener('click', onOutsideClick);
  });
}

