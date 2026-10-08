import test from 'node:test';
import assert from 'node:assert/strict';
import { splitAmount, completeShares, sumMoney, subtractMoney, expenseTotal, validateSummary } from '../src/utils/finance.js';
import { money, paidAmountOf, roundedMoney } from '../src/utils/format.js';
const thirds = ['a','b','c'].map(_id=>({_id,sharePercentage:100/3}));
test('₹19,000 thirds allocate every paise, with no ₹1 shortage',()=>{
  const rows=splitAmount(19000,thirds);
  assert.deepEqual(rows.map(r=>r.amount),[6333.34,6333.33,6333.33]);
  assert.equal(sumMoney(rows.map(r=>r.amount)),19000);
});
test('stable ID tie break independent of partner ordering',()=>{
  const a=splitAmount(0.01,thirds),b=splitAmount(0.01,[...thirds].reverse());
  assert.equal(a.find(r=>r.partnerId==='a').amount,.01);
  assert.equal(b.find(r=>r.partnerId==='a').amount,.01);
});
test('allocation covers small and large amounts without drift',()=>{
  for (const value of [.01,.02,.1,1,19,19000,19000.99,1000000000]) for (const shares of [[25,25,50],[100/3,100/3,100/3],[.01,99.99]]) {
    const rows=splitAmount(value,shares.map((sharePercentage,i)=>({_id:String(i),sharePercentage})));
    assert.equal(sumMoney(rows.map(r=>r.amount)),value);
    assert.ok(rows.every(r=>r.amount >= 0));
  }
});
test('invalid and incomplete shares are blocked',()=>{
  assert.equal(completeShares([{sharePercentage:33.33},{sharePercentage:33.33},{sharePercentage:33.33}]),false);
  assert.throws(()=>splitAmount(19000,[{_id:'a',sharePercentage:99}]));
  assert.equal(completeShares(thirds),true);
  assert.throws(()=>splitAmount(-1,thirds));
});
test('integer-paise totals and differences avoid floating drift',()=>{
  assert.equal(sumMoney([.1,.2]),.3);
  assert.equal(subtractMoney(19000,18999),1);
  assert.equal(subtractMoney(.3,.2),.1);
});
test('legacy expense amount fallback preserves explicit zero',()=>{
  assert.equal(expenseTotal({amount:19000}),19000);
  assert.equal(expenseTotal({amount:19000,totalAmount:0}),0);
  assert.equal(expenseTotal({amount:19000,totalAmount:20000}),20000);
});
test('paidAmount zero overrides historical paid flag',()=>{
  assert.equal(paidAmountOf({amount:100,paid:true,paidAmount:0}),0);
  assert.equal(paidAmountOf({amount:100,paid:true}),100);
});
test('clean money formatting never truncates amounts',()=>{
  assert.equal(money(19000),'₹19,000');
  assert.equal(money(6333.34),'₹6,333.34');
  assert.equal(money(18999),'₹18,999');
  assert.equal(roundedMoney(18999.8),'≈ ₹19,000');
});
test('valid summary includes legacy income once',()=>{
  const report={totals:{earnings:19000,legacyIncome:1000,expenses:2000,recordedSurplus:18000},partners:[],monthly:[]};
  assert.equal(validateSummary(report),report);
  assert.throws(()=>validateSummary({...report,totals:{...report.totals,recordedSurplus:17000}}));
});
test('missing API totals produce an error instead of a false zero dashboard',()=>{
  assert.throws(()=>validateSummary(null));
  assert.throws(()=>validateSummary({totals:{earnings:19000},partners:[],monthly:[]}));
});
