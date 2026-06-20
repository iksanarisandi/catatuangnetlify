import { supabase } from './supabase.js';

export const CATEGORIES = [
  'Makanan',
  'Transport',
  'Belanja',
  'Tagihan',
  'Gaji',
  'Investasi',
  'Lainnya',
];

function monthRange(year, month) {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { start, end };
}

export async function fetchTransactions(year, month) {
  const { start, end } = monthRange(year, month);
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .gte('transaction_date', start)
    .lte('transaction_date', end)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addTransaction({ userId, type, amount, description, category, transactionDate }) {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type,
      amount,
      description,
      category,
      transaction_date: transactionDate,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTransaction(id) {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
}

export function calculateSummary(transactions) {
  let income = 0;
  let expense = 0;

  for (const t of transactions) {
    const amount = Number(t.amount);
    if (t.type === 'income') income += amount;
    else expense += amount;
  }

  return { income, expense, balance: income - expense };
}
