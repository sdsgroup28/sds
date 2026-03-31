import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Receipt, Calendar, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

const API_MAINT = 'http://localhost:5000/api/maintenances';
const API_HOUSES = 'http://localhost:5000/api/houses';

function MaintenanceAdmin() {
  const [records, setRecords] = useState([]);
  const [houses, setHouses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ houseId: '', month: '', year: new Date().getFullYear(), amount: '', subject: '', isHistorical: false, transactionDate: '', paymentMode: 'Cash' });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [expenseData, setExpenseData] = useState({ expenseName: '', vendorName: '', amount: '', description: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [exportStart, setExportStart] = useState('');
  const [exportEnd, setExportEnd] = useState('');

  const formatMonth = (str) => {
    if (!str) return 'N/A';
    if (str.includes(' to ')) {
       const [start, end] = str.split(' to ');
       const d1 = new Date(start);
       const d2 = new Date(end);
       const f1 = isNaN(d1.getTime()) ? start : d1.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
       const f2 = isNaN(d2.getTime()) ? end : d2.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
       return `${f1} to ${f2}`;
    }
    const d = new Date(str);
    if (isNaN(d.getTime())) return str;
    return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  };

  const downloadInvoice = (r) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html><head><title>Invoice - ${formatMonth(r.month)}</title>
      <style>
        body { font-family: sans-serif; padding: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px;}
        h1 { color: #4f46e5; margin: 0 0 10px 0; font-size: 28px; }
        .details { margin-bottom: 30px; }
        .details p { margin: 5px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #e2e8f0; padding: 12px 16px; text-align: left; }
        th { background-color: #f8fafc; font-weight: 600; text-transform: uppercase; font-size: 12px; }
        .total { text-align: right; font-weight: bold; font-size: 18px; margin-top: 20px; }
      </style></head>
      <body>
        <div class="header"><h1>SDS Society Invoice</h1></div>
        <div class="details">
          <p><strong>Bill To:</strong> House ${r.houseId?.houseId || 'N/A'}</p>
          <p><strong>Date / Period:</strong> ${formatMonth(r.month)}</p>
          <p><strong>Status:</strong> <span style="color: ${r.status === 'Paid' ? 'green' : 'red'};">${r.status.toUpperCase()}</span></p>
          <p><strong>Payment Mode:</strong> ${r.paymentMode || 'Cash'} ${r.paymentMode === 'Cheque' && r.chequeDetails ? `(Bank: ${r.chequeDetails.bankName}, Chq No: ${r.chequeDetails.chequeNumber}, Date: ${new Date(r.chequeDetails.date).toLocaleDateString()})` : ''}</p>
          ${r.rebateApplied ? `<p><strong>Rebate Applied:</strong> Yes, 1 Month Free (${r.financialYear})</p>` : ''}
        </div>
        <table>
          <thead><tr><th>Description</th><th>Amount</th></tr></thead>
          <tbody>
            <tr><td>${r.subject || 'Society Maintenance Dues'}</td><td>₹${r.amount}</td></tr>
          </tbody>
        </table>
        <div class="total">Total: ₹${r.amount}</div>
        <script>window.onload = () => { window.print(); window.close(); }</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  const filteredRecords = records.filter(r => 
    (r.houseId?.houseId || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (r.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.month || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportData = (format) => {
    if (!exportStart || !exportEnd) {
      toast.error("Please select a date range for export.", { duration: 3000 });
      return;
    }
    const dataToExport = filteredRecords.filter(r => {
       const rowDate = new Date(r.month);
       return rowDate >= new Date(exportStart) && rowDate <= new Date(exportEnd);
    });

    if (dataToExport.length === 0) {
      toast.error("No data available in this date range.", { duration: 3000 });
      return;
    }

    if (format === 'csv') {
      const headers = ['Type,Month,Amount,Status,Subject,HouseID'];
      const rows = dataToExport.map(r => `Maintenance,${formatMonth(r.month)},${r.amount},${r.status},"${r.subject || ''}","${r.houseId?.houseId || ''}"`);
      const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", "maintenance_records.csv");
      link.click();
    } else if (format === 'pdf') {
       const printWindow = window.open('', '_blank');
       printWindow.document.write(`
         <html><head><title>Maintenance Report</title>
         <style>
           body { font-family: sans-serif; padding: 40px; color: #333; }
           h1 { text-align: center; color: #4f46e5; margin-bottom: 5px; }
           p.date-range { text-align: center; color: #666; margin-bottom: 30px; }
           table { width: 100%; border-collapse: collapse; margin-top: 20px; }
           th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
           th { background-color: #f8fafc; font-weight: 600; }
         </style></head>
         <body>
           <h1>SDS Maintenance Report</h1>
           <p class="date-range">From ${exportStart} to ${exportEnd}</p>
           <table>
             <thead><tr><th>House ID</th><th>Subject</th><th>Month</th><th>Amount</th><th>Status</th></tr></thead>
             <tbody>
               ${dataToExport.map(r => `
                 <tr>
                   <td>${r.houseId?.houseId || 'N/A'}</td>
                   <td>${r.subject || 'Maintenance'}</td>
                   <td>${formatMonth(r.month)}</td>
                   <td>₹${r.amount}</td>
                   <td>${r.status}</td>
                 </tr>
               `).join('')}
             </tbody>
           </table>
           <script>window.onload = () => { window.print(); window.close(); }</script>
         </body></html>
       `);
       printWindow.document.close();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const hRes = await axios.get(API_HOUSES);
      setHouses(hRes.data);
      const mRes = await axios.get(API_MAINT);
      setRecords(mRes.data);
      const cRes = await axios.get('http://localhost:5000/api/categories/DueType');
      setCategories(cRes.data);
    } catch(err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_MAINT, formData);
      setFormData({ houseId: '', month: '', year: new Date().getFullYear(), amount: '', subject: '', isHistorical: false, transactionDate: '', paymentMode: 'Cash' });
      setIsFormOpen(false);
      fetchData();
      toast.success("Maintenance bill generated successfully.");
    } catch(err) {
      toast.error("Error adding maintenance: " + (err.response?.data?.error || err.message), { duration: 5000 });
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/debits', { ...expenseData, paymentMode: 'Cash' });
      setExpenseData({ expenseName: '', vendorName: '', amount: '', description: '' });
      setIsExpenseOpen(false);
      toast.success('Society expense logged successfully.', { duration: 4000 });
    } catch(err) {
      toast.error("Error adding expense: " + err.message);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await axios.post('http://localhost:5000/api/categories', { name: newCatName, type: 'DueType' });
      setNewCatName('');
      fetchData();
      toast.success("Due type added.");
    } catch(err) { toast.error(err.message); }
  };

  const handleDeleteCategory = async (id) => {
    if(!window.confirm('Delete this due type?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/categories/${id}`);
      fetchData();
      setFormData({...formData, subject: ''});
      toast.success("Due type deleted.");
    } catch(err) { toast.error(err.message); }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 border-b border-slate-200 pb-5 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Billing & Maintenance</h1>
          <p className="text-slate-500 mt-1 text-sm">Issue monthly society dues and track collections.</p>
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
          <button 
            onClick={() => { setIsExpenseOpen(!isExpenseOpen); setIsFormOpen(false); }} 
            className="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-amber-200 transition flex items-center gap-2 transform hover:-translate-y-0.5">
            <Settings size={18} /> Log Expense
          </button>

          <button 
            onClick={() => { setIsFormOpen(!isFormOpen); setIsExpenseOpen(false); }} 
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-indigo-700 transition flex items-center gap-2 transform hover:-translate-y-0.5">
            {isFormOpen ? "Cancel" : <><PlusCircle size={18} /> Custom Bill</>}
          </button>
        </div>
      </div>

      {isExpenseOpen && (
        <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-amber-200 mb-8 animate-in zoom-in-95 duration-200">
           <form onSubmit={handleExpenseSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="md:col-span-1 lg:col-span-1">
                 <label className="block text-sm font-semibold text-slate-700 mb-1">Expense Subject / Title</label>
                 <input required className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl outline-none focus:border-amber-500 transition" placeholder="e.g. Garden Cleaning" value={expenseData.expenseName} onChange={e=>setExpenseData({...expenseData, expenseName:e.target.value})} />
              </div>
              <div className="md:col-span-1 lg:col-span-1">
                 <label className="block text-sm font-semibold text-slate-700 mb-1">Vendor / Payee</label>
                 <input className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl outline-none focus:border-amber-500 transition" placeholder="Optional" value={expenseData.vendorName} onChange={e=>setExpenseData({...expenseData, vendorName:e.target.value})} />
              </div>
              <div className="md:col-span-1 lg:col-span-1">
                 <label className="block text-sm font-semibold text-slate-700 mb-1">Amount Paid (₹)</label>
                 <input required type="number" className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl outline-none focus:border-amber-500 transition" placeholder="e.g. 5000" value={expenseData.amount} onChange={e=>setExpenseData({...expenseData, amount:parseFloat(e.target.value)})} />
              </div>
              <div className="md:col-span-1 lg:col-span-1">
                 <label className="block text-sm font-semibold text-slate-700 mb-1">Additional Notes</label>
                 <input className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl outline-none focus:border-amber-500 transition" placeholder="Receipt info or notes" value={expenseData.description} onChange={e=>setExpenseData({...expenseData, description:e.target.value})} />
              </div>
              <button className="bg-amber-500 text-white p-3 rounded-xl font-bold hover:bg-amber-600 transition md:col-span-2 lg:col-span-4 mt-2 shadow-sm flex items-center justify-center gap-2">
                 Log Society Expense
              </button>
           </form>
        </div>
      )}

      {isFormOpen && (
        <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 mb-8 animate-in zoom-in-95 duration-200">
           <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="md:col-span-1">
               <label className="block text-sm font-semibold text-slate-700 mb-1">Target House</label>
               <select className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl outline-none focus:border-indigo-500 transition" required value={formData.houseId} onChange={e => setFormData({...formData, houseId: e.target.value})}>
                <option value="">-- Assign to House --</option>
                {houses.map(h => <option key={h._id} value={h._id}>{h.houseId} - {h.ownerName}</option>)}
              </select>
             </div>
             
             <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Billing Period</label>
                <input type="text" placeholder="e.g. 2026-04 or 2026-04 to 2027-03" className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl outline-none focus:border-indigo-500 transition" required value={formData.month} onChange={e => {
                  const val = e.target.value;
                  const year = val ? parseInt(val.substring(0,4)) : new Date().getFullYear();
                  setFormData({...formData, month: val, year: year});
                }} />
             </div>

             <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Due Amount (₹)</label>
                <input type="number" className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl outline-none focus:border-indigo-500 transition" placeholder="e.g. 5000" required value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} />
             </div>

             <div className="md:col-span-3">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Reason / Subject</label>
                <select className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl outline-none focus:border-indigo-500 transition" required value={formData.subject} onChange={e => {
                  if (e.target.value === 'ADD_EDIT') {
                    setIsCatModalOpen(true);
                  } else {
                    setFormData({...formData, subject: e.target.value});
                  }
                }}>
                  <option value="">-- Select Due Type --</option>
                  {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                  <option value="ADD_EDIT" className="font-bold text-indigo-600">+ Add / Edit Due Types...</option>
                </select>
             </div>

             <div className="md:col-span-3 mt-2 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                <label className="flex items-center gap-2 cursor-pointer mb-3">
                  <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" checked={formData.isHistorical} onChange={e => setFormData({...formData, isHistorical: e.target.checked})} />
                  <span className="text-sm font-bold text-indigo-900">This is a past / historical record (immediately mark Paid)</span>
                </label>
                {formData.isHistorical && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 animate-in slide-in-from-top-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Exact Payment Date</label>
                      <input type="date" required className="w-full border border-slate-200 bg-white p-2.5 rounded-lg outline-none focus:border-indigo-500 transition text-sm" value={formData.transactionDate} onChange={e => setFormData({...formData, transactionDate: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Mode</label>
                      <select required className="w-full border border-slate-200 bg-white p-2.5 rounded-lg outline-none focus:border-indigo-500 transition text-sm" value={formData.paymentMode} onChange={e => setFormData({...formData, paymentMode: e.target.value})}>
                        <option value="Cash">Cash</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Online">Online</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 mt-6 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 text-emerald-600" checked={formData.rebateApplied || false} onChange={e => {
                          const isPlot = houses.find(h => h._id === formData.houseId)?.propertyType === 'Plot';
                          setFormData({...formData, rebateApplied: e.target.checked, rebateAmount: e.target.checked ? (isPlot ? 250 : 500) : 0, amount: e.target.checked ? (isPlot ? 3000 : 6000) : formData.amount});
                        }} />
                        <span className="text-xs font-bold text-emerald-700">Rebate Applied (1 Month free)</span>
                      </label>
                    </div>
                    {formData.rebateApplied && (
                       <div>
                         <label className="block text-xs font-semibold text-slate-700 mb-1">Financial Year (e.g. 2013-2014)</label>
                         <input type="text" placeholder="2013-2014" required className="w-full border border-slate-200 bg-white p-2.5 rounded-lg outline-none focus:border-indigo-500 transition text-sm" value={formData.financialYear || ''} onChange={e => {
                           const fy = e.target.value;
                           setFormData(prev => {
                             let monthStr = prev.month;
                             let parsedYear = prev.year;
                             if (fy.match(/^\d{4}-\d{4}$/)) {
                               const start = fy.split('-')[0];
                               const end = fy.split('-')[1];
                               monthStr = `${start}-04 to ${end}-03`;
                               parsedYear = parseInt(start);
                             }
                             return {...prev, financialYear: fy, month: monthStr, year: parsedYear};
                           });
                         }} />
                       </div>
                    )}
                  </div>
                )}
             </div>
             
             <button className="bg-slate-900 text-white p-3 rounded-xl font-bold hover:bg-slate-800 transition md:col-span-3 mt-4 shadow-sm flex items-center justify-center gap-2">
               <Receipt size={18} /> Issue Invoice Segment
             </button>
           </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="px-6 py-4">House Ref</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Period</th>
                <th className="px-6 py-4">Amount Issued</th>
                <th className="px-6 py-4">Amount Pending</th>
                <th className="px-6 py-4">Financial Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {(() => {
                const sorted = [...filteredRecords].sort((a,b) => {
                  const getEnd = str => str?.includes(' to ') ? str.split(' to ')[1] : str;
                  return new Date(getEnd(b.month)) - new Date(getEnd(a.month));
                });
                const displayed = showAll ? sorted : sorted.slice(0, 10);
                return (
                  <>
                    {displayed.map(r => (
                      <tr key={r._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-semibold text-indigo-700">{r.houseId?.houseId || 'N/A'}</td>
                        <td className="px-6 py-4 font-medium text-slate-600">
                           {r.subject || 'Maintenance'}
                           {r.rebateApplied && <span className="block mt-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 w-fit px-1.5 py-0.5 rounded">Rebate: 1 Month Free ({r.financialYear})</span>}
                        </td>
                        <td className="px-6 py-4 flex items-center gap-2 text-slate-700"><Calendar size={14} className="text-slate-400"/> {formatMonth(r.month)}</td>
                        <td className="px-6 py-4 text-slate-800 font-medium">
                           ₹{r.amount}
                           {r.rebateApplied && <span className="block text-xs text-emerald-500 line-through mt-0.5">₹{r.amount + r.rebateAmount}</span>}
                        </td>
                        <td className="px-6 py-4 text-rose-600 font-bold">₹{r.pendingAmount}</td>
                        <td className="px-6 py-4">
                           {r.status === 'Paid' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Cleared</span>
                           ) : r.status === 'Verification Pending' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>Needs Approval</span>
                           ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>Pending</span>
                           )}
                           {r.status === 'Verification Pending' && (
                             <>
                               <button onClick={async () => {
                                 try {
                                   await axios.put(`${API_MAINT}/${r._id}`, { adminApproved: true });
                                   fetchData();
                                   toast.success('Payment Approved!');
                                 } catch(err) { toast.error('Approval failed'); }
                               }} className="ml-3 text-emerald-600 hover:text-emerald-800 text-xs font-bold hover:underline">Approve</button>
                               <button onClick={async () => {
                                 try {
                                   await axios.put(`${API_MAINT}/${r._id}`, { status: 'Pending', paidAmount: 0, paymentMode: 'None', rebateApplied: false, rebateAmount: 0, financialYear: '' });
                                   fetchData();
                                   toast.success('Payment Declined and Restored to Pending.');
                                 } catch(err) { toast.error('Decline failed'); }
                               }} className="ml-3 text-rose-600 hover:text-rose-800 text-xs font-bold hover:underline">Decline</button>
                             </>
                           )}
                           {r.status === 'Paid' && (
                             <button onClick={() => downloadInvoice(r)} className="ml-3 text-indigo-600 hover:text-indigo-800 text-xs font-bold hover:underline">Preview Invoice</button>
                           )}
                        </td>
                      </tr>
                    ))}
                    {filteredRecords.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                           <Receipt size={40} className="mx-auto text-slate-300 mb-3" />
                           <p>No maintenance logs created yet.</p>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })()}
            </tbody>
          </table>
        </div>
        {filteredRecords.length > 10 && (
          <div className="border-t border-slate-200 bg-slate-50 p-4 text-center">
             <button onClick={() => setShowAll(!showAll)} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition py-1 px-4 rounded-full hover:bg-indigo-100">
                {showAll ? 'Show Latest Only' : 'Show All Records Till Date'}
             </button>
          </div>
        )}
      </div>

      {isCatModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Manage Due Types</h3>
            <form onSubmit={handleCreateCategory} className="flex gap-2 mb-4">
              <input value={newCatName} onChange={e=>setNewCatName(e.target.value)} placeholder="New Due Type..." className="border p-2 rounded flex-1 text-sm bg-slate-50" />
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-bold">Add</button>
            </form>
            <div className="max-h-60 overflow-y-auto mb-4 border rounded divide-y">
              {categories.length === 0 && <p className="p-4 text-center text-sm text-slate-500">No due types configured.</p>}
              {categories.map(c => (
                <div key={c._id} className="flex justify-between items-center p-3 hover:bg-slate-50">
                  <span className="font-medium text-slate-700">{c.name}</span>
                  <button type="button" onClick={() => handleDeleteCategory(c._id)} className="text-rose-500 hover:text-rose-700 text-xs font-bold">Delete</button>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button onClick={() => setIsCatModalOpen(false)} className="bg-slate-100 text-slate-700 px-5 py-2 rounded-lg font-bold">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MaintenanceAdmin;
