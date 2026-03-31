import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, TrendingUp, TrendingDown, DollarSign, Wallet, Landmark, ArrowDownRight, ArrowUpRight } from 'lucide-react';

const API_MAINT = 'http://localhost:5000/api/maintenances';
const API_DEBITS = 'http://localhost:5000/api/debits';
const API_RELIGIOUS = 'http://localhost:5000/api/religious';
const API_BANK = 'http://localhost:5000/api/bank';

function Reports() {
  const [activeTab, setActiveTab] = useState('maintenance');
  const [maintenance, setMaintenance] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [religious, setReligious] = useState([]);
  const [showAll, setShowAll] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setShowAll(false);
  };
  const [bankTxns, setBankTxns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [exportStart, setExportStart] = useState('');
  const [exportEnd, setExportEnd] = useState('');
  const [yearlyStart, setYearlyStart] = useState('');
  const [yearlyEnd, setYearlyEnd] = useState('');
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [bankFormData, setBankFormData] = useState({ subject: '', type: 'Credit', amount: '', interestAmount: '', description: '' });

  const filteredExpenses = (Array.isArray(expenses) ? expenses : []).filter(e =>
    (e.expenseName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.vendorName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReligious = (Array.isArray(religious) ? religious : []).filter(r =>
    (r.eventName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.type || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const parseDataDateStr = (str) => {
    if (!str) return new Date(0);
    if (str.includes(' to ')) return new Date(str.split(' to ')[0]);
    return new Date(str);
  };

  const bankStatement = [
    ...(Array.isArray(maintenance) ? maintenance : []).filter(m => m.status === 'Paid').map(m => ({ _id: m._id, date: m.transactionDate || m.updatedAt || new Date().toISOString(), subject: m.subject || 'Maintenance', desc: m.houseId?.houseId || 'System', amount: m.paidAmount !== undefined ? m.paidAmount : m.amount, type: 'Credit', source: 'Maintenance', mode: m.paymentMode || 'Cash', displayMonth: m.month, rebateApplied: m.rebateApplied })),
    ...(Array.isArray(bankTxns) ? bankTxns : []).map(b => ({ _id: b._id, date: b.date, subject: b.subject + (b.interestAmount ? ` (Incl. ₹${b.interestAmount} Int.)` : ''), desc: b.description || 'Bank Txn', amount: b.amount + (b.interestAmount || 0), type: b.type, source: 'Bank Record', mode: b.mode || 'Online' })),
    ...(Array.isArray(expenses) ? expenses : []).map(e => ({ _id: e._id, date: e.date, subject: e.expenseName, desc: e.vendorName || '-', amount: e.amount, type: 'Debit', source: 'Maintenance Expense', mode: e.paymentMode || 'Cash' }))
  ].sort((a, b) => parseDataDateStr(b.date) - parseDataDateStr(a.date));

  const filteredBank = bankStatement.filter(b => 
    (b.mode === 'Online' || b.mode === 'Cheque') && (
      (b.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.desc || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const filteredCash = bankStatement.filter(b => 
    b.mode === 'Cash' && (
      (b.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.desc || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const exportData = (format) => {
    if (!exportStart || !exportEnd) {
      alert("Please select a date range for export.");
      return;
    }

    if (activeTab === 'maintenance') {
       const dataToExport = filteredExpenses.filter(e => {
          const rowDate = new Date(e.date);
          return rowDate >= new Date(exportStart) && rowDate <= new Date(exportEnd);
       });
       if (dataToExport.length === 0) return alert('No records to export matching filter and date range');
       const headers = ['Transaction Date', 'Expense Title', 'Vendor', 'Debit Amount (₹)'];
       const rows = dataToExport.map(e => [new Date(e.date).toLocaleDateString(), e.expenseName, e.vendorName || '-', e.amount]);
       
       if (format === 'pdf') {
         const printWindow = window.open('', '_blank');
         printWindow.document.write(`<html><head><title>Society Maintenance Finance Report</title><style>body { font-family: sans-serif; padding: 40px; color: #333; } .header { text-align: center; margin-bottom: 20px; } p.date-range { text-align: center; color: #666; margin-bottom: 30px; } h1 { color: #4f46e5; margin: 0 0 10px 0; font-size: 28px; } h3 { color: #64748b; margin: 0; font-weight: 500; } table { width: 100%; border-collapse: collapse; margin-top: 20px; } th, td { border: 1px solid #e2e8f0; padding: 12px 16px; text-align: left; font-size: 14px; } th { background-color: #f8fafc; font-weight: 600; text-transform: uppercase; font-size: 12px; } </style></head><body><div class="header"><h1>SDS</h1><h3>Maintenance Finance Expense Report</h3><p class="date-range">From ${exportStart} to ${exportEnd}</p></div><table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table><script>window.onload = () => { window.print(); window.close(); }</script></body></html>`);
         printWindow.document.close();
       } else {
         const csv = "data:text/csv;charset=utf-8," + headers.join(',') + "\n" + rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
         const link = document.createElement("a"); link.href = encodeURI(csv); link.download = "maintenance_expenses.csv"; link.click();
       }
    } else if (activeTab === 'religious') {
       const dataToExport = filteredReligious.filter(r => {
          const rowDate = new Date(r.date);
          return rowDate >= new Date(exportStart) && rowDate <= new Date(exportEnd);
       });
       if (dataToExport.length === 0) return alert('No records to export matching filter and date range');
       const headers = ['Event Date', 'Event Name', 'Record Type', 'Amount (₹)'];
       const rows = dataToExport.map(e => [new Date(e.date).toLocaleDateString(), e.eventName, e.type, e.amount]);
       
       if (format === 'pdf') {
         const printWindow = window.open('', '_blank');
         printWindow.document.write(`<html><head><title>Society Religious Finance Report</title><style>body { font-family: sans-serif; padding: 40px; color: #333; } .header { text-align: center; margin-bottom: 20px; } p.date-range { text-align: center; color: #666; margin-bottom: 30px; } h1 { color: #8b5cf6; margin: 0 0 10px 0; font-size: 28px; } h3 { color: #64748b; margin: 0; font-weight: 500; } table { width: 100%; border-collapse: collapse; margin-top: 20px; } th, td { border: 1px solid #e2e8f0; padding: 12px 16px; text-align: left; font-size: 14px; } th { background-color: #f8fafc; font-weight: 600; text-transform: uppercase; font-size: 12px; } </style></head><body><div class="header"><h1>SDS</h1><h3>Religious & Festival Finance Report</h3><p class="date-range">From ${exportStart} to ${exportEnd}</p></div><table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table><script>window.onload = () => { window.print(); window.close(); }</script></body></html>`);
         printWindow.document.close();
       } else {
         const csv = "data:text/csv;charset=utf-8," + headers.join(',') + "\n" + rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
         const link = document.createElement("a"); link.href = encodeURI(csv); link.download = "religious_finances.csv"; link.click();
       }
    } else if (activeTab === 'bank' || activeTab === 'cashbook') {
       const isCash = activeTab === 'cashbook';
       const targetData = isCash ? filteredCash : filteredBank;
       const dataToExport = targetData.filter(b => {
          const rowDate = new Date(b.date);
          return rowDate >= new Date(exportStart) && rowDate <= new Date(exportEnd);
       });
       if (dataToExport.length === 0) return alert('No records to export matching filter and date range');
       const headers = ['Date', 'Subject', 'Description', 'Period/Source', 'Type', 'Amount (₹)', 'Mode'];
       const rows = dataToExport.map(b => [parseDataDateStr(b.date).toLocaleDateString(), b.subject, b.desc, b.displayMonth || b.source, b.type, b.amount, b.mode]);
       
       if (format === 'pdf') {
         const printWindow = window.open('', '_blank');
         printWindow.document.write(`<html><head><title>Society ${isCash ? 'Cash Book' : 'Bank Statement'}</title><style>body { font-family: sans-serif; padding: 40px; color: #333; } .header { text-align: center; margin-bottom: 20px; } p.date-range { text-align: center; color: #666; margin-bottom: 30px; } h1 { color: #d97706; margin: 0 0 10px 0; font-size: 28px; } h3 { color: #64748b; margin: 0; font-weight: 500; } table { width: 100%; border-collapse: collapse; margin-top: 20px; } th, td { border: 1px solid #e2e8f0; padding: 12px 16px; text-align: left; font-size: 14px; } th { background-color: #f8fafc; font-weight: 600; text-transform: uppercase; font-size: 12px; } </style></head><body><div class="header"><h1>SDS</h1><h3>Consolidated ${isCash ? 'Cash Book' : 'Bank Statement'}</h3><p class="date-range">From ${exportStart} to ${exportEnd}</p></div><table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table><script>window.onload = () => { window.print(); window.close(); }</script></body></html>`);
         printWindow.document.close();
       } else {
         const csv = "data:text/csv;charset=utf-8," + headers.join(',') + "\n" + rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
         const link = document.createElement("a"); link.href = encodeURI(csv); link.download = `${isCash ? 'cash_book' : 'bank_statement'}.csv`; link.click();
       }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const mRes = await axios.get(API_MAINT);
      const dRes = await axios.get(API_DEBITS);
      const rRes = await axios.get(API_RELIGIOUS);
      const bRes = await axios.get(API_BANK);
      setMaintenance(mRes.data);
      setExpenses(dRes.data);
      setReligious(rRes.data);
      setBankTxns(bRes.data);
    } catch(err) {
      console.error(err);
    }
  };

  const totalCollected = (Array.isArray(maintenance) ? maintenance : []).reduce((acc, curr) => acc + (curr.paidAmount || 0), 0);
  const totalPending = (Array.isArray(maintenance) ? maintenance : []).reduce((acc, curr) => acc + (curr.pendingAmount || 0), 0);
  const totalExpenses = (Array.isArray(expenses) ? expenses : []).reduce((acc, curr) => acc + (curr.amount || 0), 0);
  
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 border-b border-slate-200 pb-5 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Financial Reports</h1>
          <p className="text-slate-500 mt-1 text-sm">Comprehensive view of society's financial health.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <input 
            type="text" 
            placeholder="Search filtered view..." 
            className="border border-slate-200 bg-white px-4 py-2 rounded-xl text-sm focus:border-indigo-500 outline-none min-w-[200px]"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <div className="flex bg-slate-100 rounded-lg p-1 mr-2 opacity-90 hover:opacity-100 transition-opacity items-center">
            <input type="date" value={exportStart} onChange={e=>setExportStart(e.target.value)} className="bg-white border border-slate-200 text-xs px-2 py-1.5 rounded outline-none h-full shadow-sm mx-1 hidden sm:block" title="Start Date Export" />
            <input type="date" value={exportEnd} onChange={e=>setExportEnd(e.target.value)} className="bg-white border border-slate-200 text-xs px-2 py-1.5 rounded outline-none h-full shadow-sm mr-2 hidden sm:block" title="End Date Export" />
            <div className="h-6 w-px bg-slate-300 mx-1"></div>
            <button onClick={() => exportData('csv')} className="text-xs font-bold text-slate-700 px-3 py-1.5 hover:bg-white rounded shadow-sm transition">CSV</button>
            <button onClick={() => exportData('pdf')} className="text-xs font-bold text-slate-700 px-3 py-1.5 hover:bg-white rounded shadow-sm transition">PDF</button>
          </div>
        </div>
      </div>
      
      <div className="flex gap-4 mb-6 border-b border-slate-200 overflow-x-auto whitespace-nowrap pb-2">
        <button onClick={() => handleTabChange('maintenance')} className={`px-4 py-2 font-semibold border-b-2 transition ${activeTab === 'maintenance' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
          Maintenance
        </button>
        <button onClick={() => handleTabChange('religious')} className={`px-4 py-2 font-semibold border-b-2 transition ${activeTab === 'religious' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
          Religious
        </button>
        <button onClick={() => handleTabChange('cashbook')} className={`px-4 py-2 font-semibold border-b-2 transition flex items-center gap-2 ${activeTab === 'cashbook' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
          <DollarSign size={18} /> Cash Finance
        </button>
        <button onClick={() => handleTabChange('bank')} className={`px-4 py-2 font-semibold border-b-2 transition flex items-center gap-2 ${activeTab === 'bank' ? 'border-amber-600 text-amber-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
          <Landmark size={18} /> Society Bank
        </button>
        <button onClick={() => handleTabChange('yearly')} className={`px-4 py-2 font-semibold border-b-2 transition flex items-center gap-2 ${activeTab === 'yearly' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
          <PieChart size={18} /> Yearly Balance Report
        </button>
      </div>

      {activeTab === 'maintenance' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 hover:shadow-lg transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-10 group-hover:bg-emerald-100 transition-colors"></div>
              <div className="flex justify-between items-start mb-4">
                 <div className="bg-emerald-100 p-3 rounded-xl"><TrendingUp className="text-emerald-600" size={24} /></div>
              </div>
              <p className="text-emerald-700 font-bold text-sm mb-1 tracking-widest uppercase">Total Collected</p>
              <h3 className="text-4xl font-extrabold text-slate-900 flex items-center"><span className="text-slate-400 mr-2">₹</span>{totalCollected.toLocaleString()}</h3>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-100 hover:shadow-lg transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -z-10 group-hover:bg-rose-100 transition-colors"></div>
              <div className="flex justify-between items-start mb-4">
                 <div className="bg-rose-100 p-3 rounded-xl"><DollarSign className="text-rose-600" size={24} /></div>
              </div>
              <p className="text-rose-700 font-bold text-sm mb-1 tracking-widest uppercase">Pending Dues</p>
              <h3 className="text-4xl font-extrabold text-slate-900 flex items-center"><span className="text-slate-400 mr-2">₹</span>{totalPending.toLocaleString()}</h3>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 hover:shadow-lg transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -z-10 group-hover:bg-indigo-100 transition-colors"></div>
              <div className="flex justify-between items-start mb-4">
                 <div className="bg-indigo-100 p-3 rounded-xl"><Wallet className="text-indigo-600" size={24} /></div>
              </div>
              <p className="text-indigo-700 font-bold text-sm mb-1 tracking-widest uppercase">Society Expenses</p>
              <h3 className="text-4xl font-extrabold text-slate-900 flex items-center"><span className="text-slate-400 mr-2">₹</span>{totalExpenses.toLocaleString()}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50 text-slate-800 font-bold">
               <h3 className="text-lg flex items-center gap-2"><PieChart size={20} className="text-indigo-600"/> Recorded Expense Ledger (Debits)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-white text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                    <th className="px-6 py-4">Transaction Date</th>
                    <th className="px-6 py-4">Expense Title / Vendor</th>
                    <th className="px-6 py-4 text-right">Debit Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                   {(() => {
                      const sorted = [...filteredExpenses].sort((a,b) => new Date(b.date) - new Date(a.date));
                      const displayed = showAll ? sorted : sorted.slice(0, 10);
                      return displayed.map(e => (
                        <tr key={e._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 text-slate-500 font-medium">{new Date(e.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                          <td className="px-6 py-4 text-slate-800 font-bold">{e.expenseName} <span className="text-slate-400 font-normal text-xs block mt-0.5">{e.vendorName || ''}</span></td>
                          <td className="px-6 py-4 text-rose-600 font-bold text-right">-₹{(e.amount || 0).toLocaleString()}</td>
                        </tr>
                      ));
                   })()}
                   {filteredExpenses.length === 0 && (
                     <tr>
                       <td colSpan="3" className="px-6 py-12 text-center text-slate-500">
                          <Wallet size={40} className="mx-auto text-slate-300 mb-3" />
                          <p>No external expenses logged in society ledger.</p>
                       </td>
                     </tr>
                   )}
                </tbody>
              </table>
            </div>
            {filteredExpenses.length > 10 && (
              <div className="border-t border-slate-200 bg-slate-50 p-4 text-center">
                 <button onClick={() => setShowAll(!showAll)} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition py-1 px-4 rounded-full hover:bg-indigo-100">
                    {showAll ? 'Show Latest Only' : 'Show All Records Till Date'}
                 </button>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'religious' && (() => {
         const relCollected = religious.filter(r => r.type === 'Donation').reduce((sum, r) => sum + r.amount, 0);
         const relExpenses = religious.filter(r => r.type === 'Expense').reduce((sum, r) => sum + r.amount, 0);
         const balance = relCollected - relExpenses;
         return (
         <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 hover:shadow-lg transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-10 group-hover:bg-emerald-100 transition-colors"></div>
              <p className="text-emerald-700 font-bold text-sm mb-1 tracking-widest uppercase">Total Donations</p>
              <h3 className="text-4xl font-extrabold text-slate-900 flex items-center"><span className="text-slate-400 mr-2">₹</span>{relCollected.toLocaleString()}</h3>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-100 hover:shadow-lg transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -z-10 group-hover:bg-rose-100 transition-colors"></div>
              <p className="text-rose-700 font-bold text-sm mb-1 tracking-widest uppercase">Total Setup Expenses</p>
              <h3 className="text-4xl font-extrabold text-slate-900 flex items-center"><span className="text-slate-400 mr-2">₹</span>{relExpenses.toLocaleString()}</h3>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100 hover:shadow-lg transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -z-10 group-hover:bg-purple-100 transition-colors"></div>
              <p className="text-purple-700 font-bold text-sm mb-1 tracking-widest uppercase">Current Balance</p>
              <h3 className="text-4xl font-extrabold text-slate-900 flex items-center"><span className="text-slate-400 mr-2">₹</span>{balance.toLocaleString()}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50 text-slate-800 font-bold">
               <h3 className="text-lg flex items-center gap-2"><PieChart size={20} className="text-purple-600"/> Religious Funds Ledger</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-white text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Event / Details</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                   {(() => {
                      const sorted = [...filteredReligious].sort((a,b) => new Date(b.date) - new Date(a.date));
                      const displayed = showAll ? sorted : sorted.slice(0, 10);
                      return displayed.map(r => (
                        <tr key={r._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 text-slate-500 font-medium">{new Date(r.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-slate-800 font-bold">{r.eventName} <span className="text-slate-400 font-normal text-xs block mt-0.5">{r.type}</span></td>
                          <td className={`px-6 py-4 font-bold text-right ${r.type === 'Donation' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {r.type === 'Donation' ? '+' : '-'}₹{(r.amount || 0).toLocaleString()}
                          </td>
                        </tr>
                      ));
                   })()}
                   {filteredReligious.length === 0 && (
                     <tr>
                       <td colSpan="3" className="px-6 py-12 text-center text-slate-500">
                          <p>No religious or festival expenses logged.</p>
                       </td>
                     </tr>
                   )}
                </tbody>
              </table>
            </div>
            {filteredReligious.length > 10 && (
              <div className="border-t border-slate-200 bg-slate-50 p-4 text-center">
                 <button onClick={() => setShowAll(!showAll)} className="text-sm font-bold text-purple-600 hover:text-purple-800 transition py-1 px-4 rounded-full hover:bg-purple-100">
                    {showAll ? 'Show Latest Only' : 'Show All Records Till Date'}
                 </button>
              </div>
            )}
          </div>
         </>
      )})()}

      {(activeTab === 'cashbook' || activeTab === 'bank') && (() => {
         const isCash = activeTab === 'cashbook';
         const activeData = isCash ? filteredCash : filteredBank;
         const totalCr = activeData.filter(b => b.type === 'Credit').reduce((a, c) => a + c.amount, 0);
         const totalDr = activeData.filter(b => b.type === 'Debit').reduce((a, c) => a + c.amount, 0);
         const bal = totalCr - totalDr;
         
         const themeC = isCash ? 'emerald' : 'amber';
         
         return (
         <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className={`bg-white p-6 rounded-2xl shadow-sm border border-${themeC}-100 hover:shadow-lg transition-all relative overflow-hidden group`}>
              <div className={`absolute top-0 right-0 w-24 h-24 bg-${themeC}-50 rounded-bl-full -z-10 group-hover:bg-${themeC}-100 transition-colors`}></div>
              <p className={`text-${themeC}-700 font-bold text-sm mb-1 tracking-widest uppercase`}>Total Credits In</p>
              <h3 className="text-4xl font-extrabold text-slate-900 flex items-center"><span className="text-slate-400 mr-2">₹</span>{totalCr.toLocaleString()}</h3>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-100 hover:shadow-lg transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -z-10 group-hover:bg-rose-100 transition-colors"></div>
              <p className="text-rose-700 font-bold text-sm mb-1 tracking-widest uppercase">Total Debits Out</p>
              <h3 className="text-4xl font-extrabold text-slate-900 flex items-center"><span className="text-slate-400 mr-2">₹</span>{totalDr.toLocaleString()}</h3>
            </div>
            
            <div className={`bg-white p-6 rounded-2xl shadow-sm border border-${themeC}-100 hover:shadow-lg transition-all relative overflow-hidden group`}>
              <div className={`absolute top-0 right-0 w-24 h-24 bg-${themeC}-50 rounded-bl-full -z-10 group-hover:bg-${themeC}-100 transition-colors`}></div>
              <p className={`text-${themeC}-700 font-bold text-sm mb-1 tracking-widest uppercase`}>Available {isCash ? 'Cash' : 'Bank'} Balance</p>
              <h3 className="text-4xl font-extrabold text-slate-900 flex items-center"><span className="text-slate-400 mr-2">₹</span>{bal.toLocaleString()}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50 text-slate-800 font-bold">
               <h3 className="text-lg flex items-center gap-2">
                 {isCash ? <DollarSign size={20} className="text-emerald-600"/> : <Landmark size={20} className="text-amber-600"/>} 
                 {isCash ? 'Cash Transactions Ledger' : 'Society Bank Statement (Online)'}
               </h3>
               {!isCash && (
                 <button onClick={() => setIsBankModalOpen(!isBankModalOpen)} className="bg-amber-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-amber-700 transition shadow">
                   + Log Bank Txn
                 </button>
               )}
            </div>
            {isBankModalOpen && !isCash && (
               <div className="p-4 bg-amber-50 border-b border-slate-200">
                 <form onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      await axios.post(API_BANK, bankFormData);
                      setIsBankModalOpen(false);
                      setBankFormData({ subject: '', type: 'Credit', amount: '', interestAmount: '', description: '' });
                      fetchData();
                    } catch(err) { alert('Error: ' + err.message); }
                 }}>
                   <div className="grid grid-cols-5 gap-3">
                     <select required value={bankFormData.type} onChange={e=>setBankFormData({...bankFormData, type: e.target.value})} className="border border-slate-200 p-2 rounded text-sm bg-white">
                       <option value="Credit">Credit</option>
                       <option value="Debit">Debit</option>
                     </select>
                     <input required placeholder="Subject (e.g. FD Interest)" value={bankFormData.subject} onChange={e=>setBankFormData({...bankFormData, subject: e.target.value})} className="border border-slate-200 p-2 rounded text-sm bg-white" />
                     <input required type="number" placeholder="Principal Amount" value={bankFormData.amount} onChange={e=>setBankFormData({...bankFormData, amount: parseFloat(e.target.value)})} className="border border-slate-200 p-2 rounded text-sm bg-white" />
                     {bankFormData.type === 'Credit' ? (
                       <input type="number" placeholder="Interest (Optional)" value={bankFormData.interestAmount} onChange={e=>setBankFormData({...bankFormData, interestAmount: parseFloat(e.target.value) || 0})} className="border border-slate-200 p-2 rounded text-sm bg-white" />
                     ) : <div />}
                     <button type="submit" className="bg-amber-600 text-white p-2 text-sm rounded cursor-pointer font-bold w-full transition hover:bg-amber-700">Save Txn</button>
                   </div>
                 </form>
               </div>
            )}
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-white text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                    <th className="px-6 py-4">Transaction Date</th>
                    <th className="px-6 py-4">Subject & Description</th>
                    <th className="px-6 py-4">Mode</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                   {(() => {
                      // activeData is derived from bankStatement which is already sorted DESC
                      const displayed = showAll ? activeData : activeData.slice(0, 10);
                      return displayed.map((b, i) => (
                        <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 text-slate-500 font-medium">{parseDataDateStr(b.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-slate-800 font-bold flex flex-col gap-0.5">
                            <span>{b.subject} {b.displayMonth && <span className="text-slate-400 font-normal text-[10px] ml-2">({b.displayMonth}) {b.rebateApplied && <span className="text-emerald-500 font-bold"> - Rebated 1mo</span>}</span>}</span>
                            <span className="text-slate-400 font-normal text-xs">{b.desc} • {b.source}</span>
                          </td>
                          <td className="px-6 py-4"><span className="text-slate-600 font-bold">{b.mode}</span></td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${b.type === 'Credit' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                              {b.type === 'Credit' ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>} {b.type}
                            </span>
                          </td>
                          <td className={`px-6 py-4 font-bold text-right ${b.type === 'Credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {b.type === 'Credit' ? '+' : '-'}₹{(b.amount || 0).toLocaleString()}
                          </td>
                        </tr>
                      ));
                   })()}
                   {activeData.length === 0 && (
                     <tr>
                       <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                          <p>No transactions found in this date range.</p>
                       </td>
                     </tr>
                   )}
                </tbody>
              </table>
            </div>
            {activeData.length > 10 && (
              <div className="border-t border-slate-200 bg-slate-50 p-4 text-center">
                 <button onClick={() => setShowAll(!showAll)} className={`text-sm font-bold ${isCash ? 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100' : 'text-amber-600 hover:text-amber-800 hover:bg-amber-100'} transition py-1 px-4 rounded-full`}>
                    {showAll ? 'Show Latest Only' : 'Show All Records Till Date'}
                 </button>
              </div>
            )}
          </div>
         </>
      )})()}

      {activeTab === 'yearly' && (() => {
         const ms = yearlyStart ? new Date(yearlyStart).getTime() : 0;
         const me = yearlyEnd ? new Date(yearlyEnd).getTime() : Infinity;

         const periodMaint = maintenance.filter(m => m.status === 'Paid' && parseDataDateStr(m.month).getTime() >= ms && parseDataDateStr(m.month).getTime() <= me);
         const periodExp = expenses.filter(e => new Date(e.date).getTime() >= ms && new Date(e.date).getTime() <= me);
         
         const periodRelDon = religious.filter(r => r.type === 'Donation' && new Date(r.date).getTime() >= ms && new Date(r.date).getTime() <= me);
         const periodRelExp = religious.filter(r => r.type === 'Expense' && new Date(r.date).getTime() >= ms && new Date(r.date).getTime() <= me);
         
         const totalSocCr = periodMaint.reduce((s, m) => s + (m.paidAmount || m.amount), 0);
         const totalSocDr = periodExp.reduce((s, e) => s + e.amount, 0);
         const socBal = totalSocCr - totalSocDr;

         const totalRelCr = periodRelDon.reduce((s, r) => s + r.amount, 0);
         const totalRelDr = periodRelExp.reduce((s, r) => s + r.amount, 0);
         const relBal = totalRelCr - totalRelDr;

         const dueTotals = periodMaint.reduce((acc, m) => {
            const subj = m.subject || 'Maintenance';
            acc[subj] = (acc[subj] || 0) + (m.paidAmount || m.amount);
            return acc;
         }, {});

         return (
         <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 animate-in zoom-in-95">
           <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-2xl font-bold flex items-center gap-2 text-blue-800"><PieChart size={24}/> Yearly Balance Report</h3>
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-500">From:</label>
                <input type="date" className="border p-2 text-sm rounded" value={yearlyStart} onChange={e=>setYearlyStart(e.target.value)} />
                <label className="text-xs font-bold text-slate-500">To:</label>
                <input type="date" className="border p-2 text-sm rounded" value={yearlyEnd} onChange={e=>setYearlyEnd(e.target.value)} />
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-8">
             <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl">
               <h4 className="text-xl font-bold text-indigo-800 mb-4 border-b pb-2">Society Funds (Maintenance)</h4>
               <div className="mb-2">
                 <p className="flex justify-between text-sm font-bold border-b border-slate-200 pb-1 mb-2"><span className="text-slate-700">Total Collections:</span> <span className="text-emerald-700">+₹{totalSocCr.toLocaleString()}</span></p>
                 {Object.entries(dueTotals).map(([subj, amt]) => (
                    <p key={subj} className="flex justify-between text-xs text-slate-500 mb-1 pl-4"><span className="truncate max-w-[200px]" title={subj}>• {subj}</span> <span>+₹{amt.toLocaleString()}</span></p>
                 ))}
               </div>
               <p className="flex justify-between text-sm mb-4"><span className="text-slate-700 font-bold">Total Expenses:</span> <span className="font-bold text-rose-600">-₹{totalSocDr.toLocaleString()}</span></p>
               <div className="pt-3 border-t border-slate-300"><p className="flex justify-between text-lg"><span className="font-bold">Balance P&L:</span> <span className={`font-extrabold ${socBal >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>₹{socBal.toLocaleString()}</span></p></div>
             </div>
             
             <div className="bg-purple-50 border border-purple-100 p-6 rounded-xl">
               <h4 className="text-xl font-bold text-purple-900 mb-4 border-b pb-2">Religious Funds</h4>
               <p className="flex justify-between text-sm mb-2"><span className="text-purple-700">Total Donations:</span> <span className="font-bold text-emerald-600">+₹{totalRelCr.toLocaleString()}</span></p>
               <p className="flex justify-between text-sm mb-4"><span className="text-purple-700">Setup Expenses:</span> <span className="font-bold text-rose-600">-₹{totalRelDr.toLocaleString()}</span></p>
               <div className="pt-3 border-t"><p className="flex justify-between text-lg"><span className="font-bold text-purple-900">Fund Balance:</span> <span className={`font-extrabold ${relBal >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>₹{relBal.toLocaleString()}</span></p></div>
             </div>
           </div>
         </div>
         )}
      )()}
    </div>
  );
}

export default Reports;
