import { describe,it,expect } from 'vitest';
import { seed,balances,totals,validateTransaction,parseCSV,previewImport,exportCSV,budgetAvailable,anomalies } from '../src/domain';
import { validateSnapshot } from '../netlify/functions/api';
describe('money accounting',()=>{
 it('preserves aggregate balance for a transfer and excludes it from income/expenses',()=>{const s=seed();const before=balances(s).reduce((n,a)=>n+a.balance,0);const baseline=totals(s.transactions);s.transactions.push({id:'test',date:'2026-10-31',merchant:'Move',category:'Transfer',amount:1234,kind:'transfer',accountId:'bank',toAccountId:'savings'});expect(balances(s).reduce((n,a)=>n+a.balance,0)).toBe(before);expect(totals(s.transactions)).toEqual(baseline);});
 it('rejects self transfers and impossible dates',()=>{const s=seed();const t={...s.transactions[0],kind:'transfer' as const,toAccountId:'bank'};expect(()=>validateTransaction(t,s.accounts)).toThrow();expect(()=>validateTransaction({...t,kind:'income',date:'2026-02-30'},s.accounts)).toThrow();});
 it('computes rollover from earlier months only',()=>{const b={id:'b',category:'Food',limit:1000,carry:0,rollover:true};const t={...seed().transactions[0],kind:'expense' as const,category:'Food',amount:600,date:'2026-09-01'};expect(budgetAvailable(b,[t],'2026-10')).toBe(1400);expect(budgetAvailable({...b,rollover:false},[t],'2026-10')).toBe(1000);});
});
describe('statement import',()=>{
 it('handles quoted merchants and deduplicates existing and within-file rows',()=>{const s=seed();const t=s.transactions[0];const csv=`date,merchant,amount,category,kind\n${t.date},${t.merchant},${t.amount},Salary,income\n2026-10-30,"Cafe, South",120,Food,expense\n2026-10-30,"Cafe, South",120,Food,expense\n2026-10-30,Invalid,-1,Food,expense`;const p=parseCSV(csv);const rows=previewImport(p.rows,{date:'date',merchant:'merchant',amount:'amount',category:'category',kind:'kind'},'bank',s.accounts,s.transactions);expect(rows.filter(r=>!r.error)).toHaveLength(1);expect(rows[1].transaction.merchant).toBe('Cafe, South');});
 it('escapes formula injection on export',()=>{expect(exportCSV([{...seed().transactions[0],merchant:'=SUM(A1:A3)'}])).toContain("'=SUM(A1:A3)");});
});
describe('backend validation',()=>{
 it('accepts the fictional workspace but rejects malformed and foreign-account records',()=>{const s=seed();expect(()=>validateSnapshot(s)).not.toThrow();s.transactions[0].accountId='someone-else';expect(()=>validateSnapshot(s)).toThrow();expect(()=>validateSnapshot({version:1})).toThrow();});
 it('requires historical context for anomaly flags',()=>{const s=seed();s.transactions.push({...s.transactions[0],id:'outlier',merchant:'Large purchase',category:'Food',kind:'expense',amount:50000,date:'2026-10-28'});expect(anomalies(s.transactions,'2026-10').some(t=>t.id==='outlier')).toBe(true);});
});
