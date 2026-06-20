import {
  getSession,
  onAuthStateChange,
  signUp,
  signIn,
  signOut,
  translateAuthError,
} from './auth.js';
import {
  CATEGORIES,
  fetchTransactions,
  addTransaction,
  deleteTransaction,
  calculateSummary,
} from './transactions.js';
import {
  showView,
  setAuthError,
  renderSummary,
  renderMonthLabel,
  renderTransactionList,
  animateRemove,
} from './ui.js';

let currentUser = null;
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth() + 1;
let transactionType = 'expense';
let transactions = [];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function populateCategories() {
  const select = document.getElementById('tx-category');
  select.innerHTML = CATEGORIES.map((c) => `<option value="${c}">${c}</option>`).join('');
}

function setTransactionType(type) {
  transactionType = type;
  const incomeBtn = document.getElementById('btn-income');
  const expenseBtn = document.getElementById('btn-expense');
  incomeBtn.classList.toggle('active-income', type === 'income');
  expenseBtn.classList.toggle('active-expense', type === 'expense');
}

async function loadDashboard() {
  if (!currentUser) return;

  renderMonthLabel(currentYear, currentMonth);

  try {
    transactions = await fetchTransactions(currentYear, currentMonth);
    renderSummary(calculateSummary(transactions));
    renderTransactionList(transactions, handleDelete);
  } catch (err) {
    console.error(err);
    alert('Gagal memuat transaksi: ' + err.message);
  }
}

async function handleDelete(id, element) {
  if (!confirm('Hapus transaksi ini?')) return;

  try {
    await deleteTransaction(id);
    animateRemove(element, async () => {
      transactions = transactions.filter((t) => t.id !== id);
      renderSummary(calculateSummary(transactions));
      if (transactions.length === 0) {
        document.getElementById('empty-state').classList.remove('hidden');
      }
    });
  } catch (err) {
    alert('Gagal menghapus: ' + err.message);
  }
}

function shiftMonth(delta) {
  currentMonth += delta;
  if (currentMonth > 12) {
    currentMonth = 1;
    currentYear += 1;
  } else if (currentMonth < 1) {
    currentMonth = 12;
    currentYear -= 1;
  }
  loadDashboard();
}

async function handleLogin(e) {
  e.preventDefault();
  setAuthError('login-error', '');

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    await signIn(email, password);
  } catch (err) {
    setAuthError('login-error', translateAuthError(err.message));
  }
}

async function handleRegister(e) {
  e.preventDefault();
  setAuthError('register-error', '');

  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;

  try {
    const data = await signUp(email, password);
    if (!data.session) {
      setAuthError(
        'register-error',
        'Registrasi berhasil! Cek email untuk konfirmasi, lalu login.'
      );
      showView('login');
    }
  } catch (err) {
    setAuthError('register-error', translateAuthError(err.message));
  }
}

async function handleAddTransaction(e) {
  e.preventDefault();

  const amount = parseFloat(document.getElementById('tx-amount').value);
  const description = document.getElementById('tx-description').value.trim();
  const category = document.getElementById('tx-category').value;
  const transactionDate = document.getElementById('tx-date').value;

  if (!amount || amount <= 0) {
    alert('Jumlah harus lebih dari 0.');
    return;
  }
  if (!description) {
    alert('Deskripsi wajib diisi.');
    return;
  }

  try {
    await addTransaction({
      userId: currentUser.id,
      type: transactionType,
      amount,
      description,
      category,
      transactionDate,
    });

    document.getElementById('tx-amount').value = '';
    document.getElementById('tx-description').value = '';
    document.getElementById('tx-date').value = todayISO();

    await loadDashboard();
  } catch (err) {
    alert('Gagal menambah transaksi: ' + err.message);
  }
}

async function handleLogout() {
  await signOut();
}

function onSessionChange(session) {
  currentUser = session?.user ?? null;

  if (currentUser) {
    showView('dashboard');
    loadDashboard();
  } else {
    showView('login');
  }
}

function bindEvents() {
  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('register-form').addEventListener('submit', handleRegister);
  document.getElementById('tx-form').addEventListener('submit', handleAddTransaction);
  document.getElementById('btn-logout').addEventListener('click', handleLogout);

  document.getElementById('go-register').addEventListener('click', (e) => {
    e.preventDefault();
    setAuthError('login-error', '');
    showView('register');
  });

  document.getElementById('go-login').addEventListener('click', (e) => {
    e.preventDefault();
    setAuthError('register-error', '');
    showView('login');
  });

  document.getElementById('btn-income').addEventListener('click', () => setTransactionType('income'));
  document.getElementById('btn-expense').addEventListener('click', () => setTransactionType('expense'));
  document.getElementById('btn-prev-month').addEventListener('click', () => shiftMonth(-1));
  document.getElementById('btn-next-month').addEventListener('click', () => shiftMonth(1));
}

async function init() {
  populateCategories();
  document.getElementById('tx-date').value = todayISO();
  setTransactionType('expense');
  bindEvents();

  onAuthStateChange(onSessionChange);

  const session = await getSession();
  onSessionChange(session);
}

init();
