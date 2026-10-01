import Papa from 'papaparse';
export type Kind = 'income' | 'expense' | 'transfer';
export type Transaction = { id: string; date: string; merchant: string; category: string; amount: number; kind: Kind; accountId: string; toAccountId?: string; note?: string };
export type Account = { id: string; name: string; type: string; opening: number; color: string };
export type Budget = { id: string; category: string; limit: number; rollover: boolean; carry: number };
export type Goal = { id: string; name: string; target: number; saved: number; deadline: string; emoji: string };
export type Bill = { id: string; name: string; amount: number; date: string; category: string; accountId: string; frequency: 'monthly' | 'yearly'; active: boolean };
export type Job = { id: string; name: string; status: 'simulated' | 'queued' | 'failed'; date: string; detail: string; attempts: number };
export type State = { version: 1; accounts: Account[]; transactions: Transaction[]; budgets: Budget[]; goals: Goal[]; bills: Bill[]; jobs: Job[] };
export const categories = ['Housing', 'Food', 'Transport', 'Shopping', 'Utilities', 'Entertainment', 'Health', 'Other', 'Salary', 'Freelance'];
export const money = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
export const uid = () => crypto.randomUUID();
export const currentMonth = '2026-10';
export function seed(): State {
 const accounts: Account[] = [{id:'bank',name:'HDFC Everyday',type:'Bank account',opening:42000,color:'#26c5b5'},{id:'savings',name:'SBI Savings',type:'Savings account',opening:63000,color:'#9b83f4'},{id:'cash',name:'Cash wallet',type:'Cash',opening:2900,color:'#56a5f5'}];
 const transactions: Transaction[] = [];
 const expenseSets = [['Rent','Housing',11200],['Groceries','Food',3200],['Zomato','Food',640],['BigBasket','Food',2960],['Metro recharge','Transport',1600],['Uber','Transport',2700],['Amazon','Shopping',2399],['Uniqlo','Shopping',1501],['Electricity','Utilities',1400],['Netflix','Entertainment',800]] as const;
 for (let m=1;m<=10;m++) {
  const month=`2026-${String(m).padStart(2,'0')}`;
  transactions.push({id:`salary-${m}`,date:`${month}-01`,merchant:'Salary credit',category:'Salary',amount:65000+(m===7?15000:0),kind:'income',accountId:'bank'});
  expenseSets.forEach(([merchant,category,amount],i)=>transactions.push({id:`expense-${m}-${i}`,date:`${month}-${String(3+i*2).padStart(2,'0')}`,merchant,category,amount:m===10?amount:Math.round(amount*(0.85+(m%3)*.09)),kind:'expense',accountId:'bank'}));
  transactions.push({id:`transfer-${m}`,date:`${month}-25`,merchant:'Monthly savings',category:'Transfer',amount:25000,kind:'transfer',accountId:'bank',toAccountId:'savings'});
 }
 return {version:1,accounts,transactions,budgets:[{id:'b1',category:'Housing',limit:12000,rollover:false,carry:0},{id:'b2',category:'Food',limit:8000,rollover:true,carry:0},{id:'b3',category:'Transport',limit:6000,rollover:true,carry:0},{id:'b4',category:'Shopping',limit:5000,rollover:false,carry:0}],goals:[{id:'g1',name:'Emergency fund',target:300000,saved:75000,deadline:'2027-06-30',emoji:'🏝️'},{id:'g2',name:'New laptop',target:120000,saved:85000,deadline:'2027-01-31',emoji:'💻'}],bills:[{id:'bill1',name:'Airtel mobile',amount:999,date:'2026-11-02',category:'Utilities',accountId:'bank',frequency:'monthly',active:true},{id:'bill2',name:'Netflix',amount:649,date:'2026-11-10',category:'Entertainment',accountId:'bank',frequency:'monthly',active:true},{id:'bill3',name:'Rent',amount:11200,date:'2026-11-03',category:'Housing',accountId:'bank',frequency:'monthly',active:true}],jobs:[{id:'j1',name:'Weekly report',status:'simulated',date:'2026-10-01T08:00:00Z',detail:'Fictional sample history. No external workflow ran.',attempts:1}]};
}
export function totals(ts: Transaction[]) { return ts.reduce((r,t)=> {if(t.kind==='income')r.income+=t.amount;if(t.kind==='expense')r.expense+=t.amount;return r;},{income:0,expense:0}); }
export function balances(s: State) { return s.accounts.map(a=>({...a,balance:a.opening+s.transactions.reduce((n,t)=>n+(t.accountId===a.id?(t.kind==='expense'||t.kind==='transfer'?-t.amount:t.amount):0)+(t.kind==='transfer'&&t.toAccountId===a.id?t.amount:0),0)})); }
export function validateTransaction(t: Transaction, accounts: Account[]) {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(t.date)||new Date(t.date+'T00:00:00Z').toISOString().slice(0,10)!==t.date)throw new Error('Choose a valid date.');
 if(!t.merchant.trim()||!t.category.trim())throw new Error('Merchant and category are required.');
 if(!Number.isFinite(t.amount)||t.amount<=0||Math.abs(Math.round(t.amount*100)-t.amount*100)>1e-7)throw new Error('Amount must be positive with at most two decimal places.');
 if(!accounts.some(a=>a.id===t.accountId))throw new Error('Choose an existing account.');
 if(t.kind==='transfer'&&(!accounts.some(a=>a.id===t.toAccountId)||t.accountId===t.toAccountId))throw new Error('A transfer needs two different accounts.');
}
export const fingerprint=(t: Transaction)=>[t.date,t.merchant.trim().toLowerCase(),t.amount.toFixed(2),t.kind,t.accountId,t.toAccountId||''].join('|');
export type Mapping={date:string;merchant:string;amount:string;category:string;kind:string};
export function parseCSV(text:string) { const result=Papa.parse<Record<string,string>>(text,{header:true,skipEmptyLines:'greedy'}); if(result.errors.length)throw new Error(result.errors[0].message);return {headers:result.meta.fields||[],rows:result.data}; }
export function previewImport(rows:Record<string,string>[],map:Mapping,accountId:string,accounts:Account[],existing:Transaction[]) {
 const seen=new Set(existing.map(fingerprint));
 return rows.map((r,i)=>{const t:Transaction={id:`preview-${i}`,date:(r[map.date]||'').trim(),merchant:(r[map.merchant]||'').trim(),amount:Number((r[map.amount]||'').replace(/[₹,]/g,'')),category:r[map.category]?.trim()||'Other',kind:(r[map.kind]?.trim().toLowerCase()||'expense') as Kind,accountId};let error='';try{if(!['income','expense'].includes(t.kind))throw new Error('CSV supports income and expense; record transfers separately.');validateTransaction(t,accounts);if(seen.has(fingerprint(t)))throw new Error('Duplicate transaction');seen.add(fingerprint(t));}catch(e){error=e instanceof Error?e.message:'Invalid row';}return {transaction:t,error};});
}
export function exportCSV(ts:Transaction[]) { return Papa.unparse(ts.map(t=>({date:t.date,merchant:t.merchant,category:t.category,amount:t.amount,kind:t.kind,accountId:t.accountId,toAccountId:t.toAccountId||'',note:t.note||''})),{escapeFormulae:true}); }
export function budgetAvailable(b:Budget,ts:Transaction[],month:string) { if(!b.rollover)return b.limit;const months=[...new Set(ts.filter(t=>t.date.slice(0,7)<month).map(t=>t.date.slice(0,7)))].sort();let carry=b.carry;for(const m of months){const spent=ts.filter(t=>t.kind==='expense'&&t.category===b.category&&t.date.startsWith(m)).reduce((n,t)=>n+t.amount,0);carry=Math.max(0,carry+b.limit-spent);}return b.limit+carry; }
export function anomalies(ts:Transaction[],month:string) {return ts.filter(t=>t.kind==='expense'&&t.date.startsWith(month)).filter(t=>{const history=ts.filter(p=>p.kind==='expense'&&p.category===t.category&&p.date.slice(0,7)<month);const avg=history.reduce((n,p)=>n+p.amount,0)/(history.length||1);return history.length>=3&&t.amount>avg*1.8;});}
export function loadState():State { try{const raw=localStorage.getItem('financeflow.v1');if(raw){const s=JSON.parse(raw);if(s.version===1&&['accounts','transactions','budgets','goals','bills','jobs'].every(k=>Array.isArray(s[k])))return s;}}catch{/* UI displays persistence error on save */}return seed(); }
