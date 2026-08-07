import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Member {
  id: string;
  nama: string;
  jabatan: string;
  noHp: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  tanggal: string; // YYYY-MM-DD
  jenis: 'Pemasukan' | 'Pengeluaran';
  nominal: number;
  keterangan: string;
  anggota?: string; // Member ID
  anggotaNama?: string; // Member Name
  createdAt: string;
}

// Initial seed data if collection is completely empty
const initialMembers: Omit<Member, 'id'>[] = [
  { nama: 'Ahmad Rizky', jabatan: 'Ketua Remaja', noHp: '081234567890', createdAt: new Date().toISOString() },
  { nama: 'Siti Nurhaliza', jabatan: 'Bendahara Kas', noHp: '082198765432', createdAt: new Date().toISOString() },
  { nama: 'Budi Santoso', jabatan: 'Sekretaris', noHp: '085712341234', createdAt: new Date().toISOString() },
  { nama: 'Dewi Lestari', jabatan: 'Anggota Active', noHp: '088899990000', createdAt: new Date().toISOString() },
  { nama: 'Fajar Kurniawan', jabatan: 'Anggota Active', noHp: '081344556677', createdAt: new Date().toISOString() },
];

const initialTransactions: Omit<Transaction, 'id'>[] = [
  {
    tanggal: '2026-08-01',
    jenis: 'Pemasukan',
    nominal: 500000,
    keterangan: 'Saldo Awal Kas Remaja Bulan Agustus',
    anggotaNama: 'Siti Nurhaliza',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    tanggal: '2026-08-02',
    jenis: 'Pemasukan',
    nominal: 20000,
    keterangan: 'Iuran Kas Bulanan Agustus',
    anggotaNama: 'Ahmad Rizky',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    tanggal: '2026-08-03',
    jenis: 'Pemasukan',
    nominal: 20000,
    keterangan: 'Iuran Kas Bulanan Agustus',
    anggotaNama: 'Dewi Lestari',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    tanggal: '2026-08-04',
    jenis: 'Pengeluaran',
    nominal: 75000,
    keterangan: 'Pembelian Kertas HVS & Konsumsi Rapat Anggota',
    anggotaNama: 'Budi Santoso',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    tanggal: '2026-08-05',
    jenis: 'Pemasukan',
    nominal: 150000,
    keterangan: 'Donasi Kegiatan Karang Taruna',
    anggotaNama: 'Umum / Non-Anggota',
    createdAt: new Date().toISOString(),
  },
];

function cleanPayload<T extends Record<string, any>>(obj: T): T {
  const cleaned: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  }
  return cleaned as T;
}

// MEMBERS CRUD
export function subscribeMembers(callback: (members: Member[]) => void) {
  try {
    const q = query(collection(db, 'members'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      async (snapshot) => {
        if (snapshot.empty) {
          // Seed initial data if empty
          const seeded: Member[] = [];
          for (const m of initialMembers) {
            try {
              const docRef = await addDoc(collection(db, 'members'), m);
              seeded.push({ ...m, id: docRef.id });
            } catch (err) {
              console.warn('Error seeding member:', err);
            }
          }
          if (seeded.length > 0) {
            callback(seeded);
            return;
          }
        }
        const data: Member[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Member, 'id'>),
        }));
        callback(data);
      },
      (error) => {
        console.warn('Firestore member snapshot error, using local storage fallback:', error);
        // Fallback to local storage
        const local = localStorage.getItem('kas_remaja_members');
        if (local) {
          callback(JSON.parse(local));
        } else {
          const defaultList = initialMembers.map((m, idx) => ({ ...m, id: `m-${idx + 1}` }));
          localStorage.setItem('kas_remaja_members', JSON.stringify(defaultList));
          callback(defaultList);
        }
      }
    );
  } catch (err) {
    const defaultList = initialMembers.map((m, idx) => ({ ...m, id: `m-${idx + 1}` }));
    callback(defaultList);
    return () => {};
  }
}

export async function addMemberData(member: Omit<Member, 'id'>) {
  const payload = cleanPayload(member);
  try {
    const docRef = await addDoc(collection(db, 'members'), payload);
    return docRef.id;
  } catch (err) {
    console.warn('Firestore write error, saving to local storage fallback:', err);
    const local = JSON.parse(localStorage.getItem('kas_remaja_members') || '[]');
    const newId = `m-${Date.now()}`;
    const newMember = { ...payload, id: newId };
    local.unshift(newMember);
    localStorage.setItem('kas_remaja_members', JSON.stringify(local));
    return newId;
  }
}

export async function updateMemberData(id: string, member: Partial<Member>) {
  const payload = cleanPayload(member);
  try {
    const docRef = doc(db, 'members', id);
    await updateDoc(docRef, payload);
  } catch (err) {
    const local: Member[] = JSON.parse(localStorage.getItem('kas_remaja_members') || '[]');
    const updated = local.map((m) => (m.id === id ? { ...m, ...payload } : m));
    localStorage.setItem('kas_remaja_members', JSON.stringify(updated));
  }
}

export async function deleteMemberData(id: string) {
  try {
    const docRef = doc(db, 'members', id);
    await deleteDoc(docRef);
  } catch (err) {
    const local: Member[] = JSON.parse(localStorage.getItem('kas_remaja_members') || '[]');
    const filtered = local.filter((m) => m.id !== id);
    localStorage.setItem('kas_remaja_members', JSON.stringify(filtered));
  }
}

// TRANSACTIONS CRUD
export function subscribeTransactions(callback: (transactions: Transaction[]) => void) {
  try {
    const q = query(collection(db, 'transactions'), orderBy('tanggal', 'desc'));
    return onSnapshot(
      q,
      async (snapshot) => {
        const hasInitialized = typeof window !== 'undefined' && localStorage.getItem('kas_remaja_tx_initialized');
        if (snapshot.empty) {
          if (!hasInitialized) {
            if (typeof window !== 'undefined') localStorage.setItem('kas_remaja_tx_initialized', 'true');
            const seeded: Transaction[] = [];
            for (const t of initialTransactions) {
              try {
                const docRef = await addDoc(collection(db, 'transactions'), t);
                seeded.push({ ...t, id: docRef.id });
              } catch (err) {
                console.warn('Error seeding transaction:', err);
              }
            }
            if (seeded.length > 0) {
              callback(seeded);
              return;
            }
          } else {
            callback([]);
            return;
          }
        }
        if (typeof window !== 'undefined') localStorage.setItem('kas_remaja_tx_initialized', 'true');
        const data: Transaction[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Transaction, 'id'>),
        }));
        callback(data);
      },
      (error) => {
        console.warn('Firestore transaction snapshot error, fallback to local storage:', error);
        const hasInitialized = typeof window !== 'undefined' && localStorage.getItem('kas_remaja_tx_initialized');
        if (!hasInitialized) {
          if (typeof window !== 'undefined') localStorage.setItem('kas_remaja_tx_initialized', 'true');
          const defaultList = initialTransactions.map((t, idx) => ({ ...t, id: `t-${idx + 1}` }));
          if (typeof window !== 'undefined') localStorage.setItem('kas_remaja_transactions', JSON.stringify(defaultList));
          callback(defaultList);
        } else {
          const local = typeof window !== 'undefined' ? localStorage.getItem('kas_remaja_transactions') : null;
          callback(local ? JSON.parse(local) : []);
        }
      }
    );
  } catch (err) {
    const hasInitialized = typeof window !== 'undefined' && localStorage.getItem('kas_remaja_tx_initialized');
    if (!hasInitialized) {
      if (typeof window !== 'undefined') localStorage.setItem('kas_remaja_tx_initialized', 'true');
      const defaultList = initialTransactions.map((t, idx) => ({ ...t, id: `t-${idx + 1}` }));
      callback(defaultList);
    } else {
      const local = typeof window !== 'undefined' ? localStorage.getItem('kas_remaja_transactions') : null;
      callback(local ? JSON.parse(local) : []);
    }
    return () => {};
  }
}

export async function addTransactionData(transaction: Omit<Transaction, 'id'>) {
  if (typeof window !== 'undefined') localStorage.setItem('kas_remaja_tx_initialized', 'true');
  const payload = cleanPayload(transaction);
  try {
    const docRef = await addDoc(collection(db, 'transactions'), payload);
    return docRef.id;
  } catch (err) {
    console.warn('Firestore transaction write error, saving locally:', err);
    const local = JSON.parse(localStorage.getItem('kas_remaja_transactions') || '[]');
    const newId = `t-${Date.now()}`;
    const newTx = { ...payload, id: newId };
    local.unshift(newTx);
    localStorage.setItem('kas_remaja_transactions', JSON.stringify(local));
    return newId;
  }
}

export async function updateTransactionData(id: string, transaction: Partial<Transaction>) {
  if (typeof window !== 'undefined') localStorage.setItem('kas_remaja_tx_initialized', 'true');
  const payload = cleanPayload(transaction);
  try {
    const docRef = doc(db, 'transactions', id);
    await updateDoc(docRef, payload);
  } catch (err) {
    const local: Transaction[] = JSON.parse(localStorage.getItem('kas_remaja_transactions') || '[]');
    const updated = local.map((t) => (t.id === id ? { ...t, ...payload } : t));
    localStorage.setItem('kas_remaja_transactions', JSON.stringify(updated));
  }
}

export async function deleteTransactionData(id: string) {
  if (typeof window !== 'undefined') localStorage.setItem('kas_remaja_tx_initialized', 'true');
  try {
    const docRef = doc(db, 'transactions', id);
    await deleteDoc(docRef);
  } catch (err) {
    const local: Transaction[] = JSON.parse(localStorage.getItem('kas_remaja_transactions') || '[]');
    const filtered = local.filter((t) => t.id !== id);
    localStorage.setItem('kas_remaja_transactions', JSON.stringify(filtered));
  }
}

export async function deleteAllTransactionsData() {
  if (typeof window !== 'undefined') localStorage.setItem('kas_remaja_tx_initialized', 'true');
  try {
    const q = query(collection(db, 'transactions'));
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map((docItem) => deleteDoc(doc(db, 'transactions', docItem.id)));
    await Promise.all(deletePromises);
  } catch (err) {
    console.warn('Firestore bulk delete error, clearing local storage:', err);
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem('kas_remaja_transactions', JSON.stringify([]));
  }
}
