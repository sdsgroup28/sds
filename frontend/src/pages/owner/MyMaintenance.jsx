import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import { CreditCard, AlertCircle, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const API_MAINT = 'http://localhost:5000/api/maintenances';
const API_PAY = 'http://localhost:5000/api/payments';

function MyMaintenance() {
  const { user } = useUser();
  const [records, setRecords] = useState([]);
  const [house, setHouse] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, maint: null, isAdvance: false, months: 1 });
  const [onlineSoon, setOnlineSoon] = useState(false);
  const [chequeUI, setChequeUI] = useState(false);
  const [chequeDetails, setChequeDetails] = useState({ bankName: '', chequeNumber: '', date: '' });
  
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
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const hRes = await axios.get(`http://localhost:5000/api/houses/my/${user.id}`);
      setHouse(hRes.data);
      const res = await axios.get(`${API_MAINT}/my/${user.id}`);
      setRecords(res.data);
    } catch(err) {
      console.error(err);
    }
  };

  const triggerPayment = (r) => {
    setPaymentModal({ isOpen: true, maint: r, isAdvance: false, months: 1 });
    setOnlineSoon(false);
    setChequeUI(false);
    setChequeDetails({ bankName: '', chequeNumber: '', date: '' });
  };

  const triggerAdvancePayment = () => {
    if(!house) return toast.error("House details not found. Please register house first.");
    setPaymentModal({ isOpen: true, maint: null, isAdvance: true, months: 1 });
    setOnlineSoon(false);
    setChequeUI(false);
    setChequeDetails({ bankName: '', chequeNumber: '', date: '' });
  };

  const processPaymentMode = async (mode) => {
     if (mode === 'Online') {
        setOnlineSoon(true);
        return;
     }
     
     if (mode === 'Cheque' && !chequeUI) {
        setChequeUI(true);
        return;
     }
     
     // Process Cash
     try {
      if (paymentModal.isAdvance) {
        await axios.post(`${API_MAINT}/pay-advance`, {
          houseId: house._id,
          monthsToPay: paymentModal.months,
          paymentMode: mode,
          chequeDetails: mode === 'Cheque' ? chequeDetails : undefined
        });
        setPaymentModal({ isOpen: false, maint: null, isAdvance: false, months: 1 });
        fetchData();
        toast.success('Advance/Monthly Payment successfully submitted.');
      } else {
        await axios.post(API_PAY, {
          houseId: paymentModal.maint.houseId._id,
          maintenanceId: paymentModal.maint._id,
          amount: paymentModal.maint.pendingAmount,
          paymentMode: mode,
          chequeDetails: mode === 'Cheque' ? chequeDetails : undefined
        });
        setPaymentModal({ isOpen: false, maint: null, isAdvance: false, months: 1 });
        fetchData();
        const updatedMaint = { ...paymentModal.maint, status: 'Verification Pending', paymentMode: mode };
        if (mode === 'Cash' || mode === 'Cheque') {
            toast.success('Payment submitted for verification. Receipt generated post Admin approval.', { duration: 4000 });
        } else {
            downloadInvoice(updatedMaint);
        }
      }
    } catch (err) {
      toast.error("Error processing: " + (err.response?.data?.error || err.message));
    }
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
        <div class="header"><h1>SDS Society Invoice</h1><p>Receipt of Payment</p></div>
        <div class="details">
          <p><strong>Bill To:</strong> House ${r.houseId?.houseId || 'N/A'}</p>
          <p><strong>Date / Period:</strong> ${formatMonth(r.month)}</p>
          <p><strong>Status:</strong> <span style="color: green;">PAID</span></p>
          <p><strong>Payment Mode:</strong> ${r.paymentMode || 'Cash'} ${r.paymentMode === 'Cheque' && r.chequeDetails ? `(Bank: ${r.chequeDetails.bankName}, Chq No: ${r.chequeDetails.chequeNumber}, Date: ${new Date(r.chequeDetails.date).toLocaleDateString()})` : ''}</p>
        </div>
        <table>
          <thead><tr><th>Description</th><th>Amount</th></tr></thead>
          <tbody>
            <tr><td>${r.subject || 'Society Maintenance Dues'}</td><td>₹${r.amount}</td></tr>
          </tbody>
        </table>
        <div class="total">Total Paid: ₹${r.amount}</div>
        <script>window.onload = () => { window.print(); window.close(); }</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Maintenance Dues</h1>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-8 flex justify-between items-center shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-indigo-900 mb-1">Maintenance Summary</h2>
          {records.filter(r => r.status === 'Paid').length > 0 ? (
            <p className="text-indigo-700/80 text-sm">
              Last Maintenance Paid: <span className="font-extrabold">{(() => {
                const paid = [...records].filter(r => r.status === 'Paid');
                if (!paid.length) return 'N/A';
                const getEnd = str => str.includes(' to ') ? str.split(' to ')[1] : str;
                paid.sort((a, b) => new Date(getEnd(b.month)) - new Date(getEnd(a.month)));
                const latestRaw = paid[0].month;
                const endMonthOnly = getEnd(latestRaw);
                const d = new Date(endMonthOnly);
                return isNaN(d.getTime()) ? endMonthOnly : d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
              })()}</span>
            </p>
          ) : (
            <p className="text-indigo-700/80 text-sm">No recorded payments found.</p>
          )}
        </div>
        <div className="text-right flex flex-col items-end">
          <p className="text-xs font-bold text-indigo-700/70 uppercase tracking-widest mb-1">Total Unpaid Dues</p>
          <span className="text-3xl font-extrabold text-indigo-900 mb-2">₹{records.filter(r => r.status !== 'Paid').reduce((s, r) => s + r.pendingAmount, 0)}</span>
          <button onClick={triggerAdvancePayment} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 transition">Pay Monthly / Advance Dues</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4 border-b">Subject</th>
                <th className="px-6 py-4 border-b">Billing Period</th>
                <th className="px-6 py-4 border-b">Total Bill</th>
                <th className="px-6 py-4 border-b">Dues Remaining</th>
                <th className="px-6 py-4 border-b">Mode</th>
                <th className="px-6 py-4 border-b">Status</th>
                <th className="px-6 py-4 border-b text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {(() => {
                const sorted = [...records].sort((a,b) => {
                  const getEnd = str => str?.includes(' to ') ? str.split(' to ')[1] : str;
                  return new Date(getEnd(b.month)) - new Date(getEnd(a.month));
                });
                const displayed = showAll ? sorted : sorted.slice(0, 10);
                return (
                  <>
                    {displayed.map(r => (
                      <tr key={r._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-800">
                          {r.subject || 'Maintenance'}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-800 flex flex-col gap-1">
                          <span className="flex items-center gap-2"><CalendarIcon /> {formatMonth(r.month)}</span>
                          {r.rebateApplied && <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 w-fit px-1.5 py-0.5 rounded">1 Month Rebate Applied ({r.financialYear})</span>}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold">₹{r.amount}</span>
                          {r.rebateApplied && <span className="block text-xs text-emerald-500 line-through">₹{r.amount + r.rebateAmount}</span>}
                        </td>
                        <td className="px-6 py-4">
                           {r.status === 'Paid' ? (
                             <span className="font-bold text-slate-500">₹0</span>
                           ) : (
                             <>
                               {r.pendingAmount > 0 ? (
                                 <span className="font-bold text-rose-500">₹{r.pendingAmount}</span>
                               ) : (
                                 <span className="font-bold text-slate-500">₹{r.amount}</span>
                               )}
                             </>
                           )}
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium">
                          {r.paymentMode && r.paymentMode !== 'None' ? r.paymentMode : '-'}
                        </td>
                        <td className="px-6 py-4">
                          {r.status === 'Paid' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Cleared
                            </span>
                          ) : r.status === 'Verification Pending' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              Approval Pending
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {r.status === 'Pending' ? (
                            <button onClick={() => triggerPayment(r)} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all transform hover:-translate-y-0.5">
                              <CreditCard size={16} /> Pay Now
                            </button>
                          ) : r.status === 'Verification Pending' ? (
                            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Post Approval</span>
                          ) : (
                            <button onClick={() => downloadInvoice(r)} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all transform hover:-translate-y-0.5">
                              <Download size={16} /> Download Invoice
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {records.length === 0 && (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                          <AlertCircle size={40} className="mx-auto text-slate-300 mb-3" />
                          <p>No maintenance bills have been generated for you yet.</p>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })()}
            </tbody>
          </table>
        </div>
        {records.length > 10 && (
          <div className="border-t border-slate-200 bg-slate-50 p-4 text-center">
             <button onClick={() => setShowAll(!showAll)} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition py-1 px-4 rounded-full hover:bg-indigo-100">
                {showAll ? 'Show Latest Only' : 'Show All Records Till Date'}
             </button>
          </div>
        )}
      </div>

      {paymentModal.isOpen && (
         <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200">
               <h3 className="text-xl font-bold text-slate-900 mb-2">Select Payment Method</h3>
               {(() => {
                 const getNextMonthRaw = () => {
                    const existing = records.filter(x => x.subject === 'Maintenance').sort((a,b) => {
                         const getEnd = str => str?.includes(' to ') ? str.split(' to ')[1] : str;
                         return new Date(getEnd(b.month)) - new Date(getEnd(a.month));
                    });
                    if (existing.length > 0) {
                         const getEnd = str => str?.includes(' to ') ? str.split(' to ')[1] : str;
                         const lastStr = getEnd(existing[0].month);
                         const [y, m] = lastStr.split('-');
                         const d = new Date(parseInt(y), parseInt(m), 1);
                         return { m: String(d.getMonth() + 1).padStart(2, '0'), y: d.getFullYear() };
                    }
                    const now = new Date();
                    return { m: String(now.getMonth() + 1).padStart(2, '0'), y: now.getFullYear() };
                 };
                 const nextRaw = getNextMonthRaw();
                 const nextMonthNum = nextRaw.m;
                 const nextYearNum = nextRaw.y;
                 const nowDate = new Date();
                 const currentYear = nowDate.getFullYear();
                 const currentMonth = nowDate.getMonth() + 1;
                 const requiredStartY = currentMonth >= 4 ? currentYear + 1 : currentYear;

                 const baseRate = house?.propertyType === 'Plot' ? 250 : 500;
                 const willGetRebate = paymentModal.isAdvance && paymentModal.months === 12 && nextMonthNum === '04' && nextYearNum >= requiredStartY;
                 const requestedAmount = paymentModal.isAdvance ? (baseRate * paymentModal.months) : (paymentModal.maint?.pendingAmount || 0);
                 const finalPayAmount = paymentModal.isAdvance ? (willGetRebate ? baseRate * 11 : requestedAmount) : requestedAmount;

                 return (
                 <>
                   <p className="text-slate-500 text-sm mb-4">How would you like to pay <span className="font-extrabold text-slate-900">₹{finalPayAmount}</span>?</p>
                   
                   {paymentModal.isAdvance && (
                     <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <label className="text-xs font-bold text-slate-500 mb-2 block">Number of Months to Pay</label>
                        <div className="flex items-center gap-4">
                          <input type="number" min="1" max="60" value={paymentModal.months} onChange={e => setPaymentModal({...paymentModal, months: parseInt(e.target.value)||1})} className="w-20 border border-slate-300 p-2 rounded text-center font-bold" />
                          <span className="text-sm font-medium text-slate-600">× ₹{baseRate} / month (for {house?.propertyType})</span>
                        </div>
                        {willGetRebate && (
                          <div className="mt-3 bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold p-2 rounded">
                            ✨ Financial Year Rebate Applied! 1 Month Free! You pay for 11 months instead of 12.
                          </div>
                        )}
                        {!willGetRebate && paymentModal.months < 12 && nextMonthNum === '04' && nextYearNum >= requiredStartY && (
                          <div className="mt-3 bg-blue-50 border border-blue-100 text-blue-800 text-xs font-bold p-2 rounded">
                            💡 Tip: Pay exactly 12 months today (covering Apr-Mar) to instantly get a full 1-month rebate!
                          </div>
                        )}
                     </div>
                   )}
               
               {onlineSoon ? (
                 <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl mb-6 text-center">
                    <h4 className="font-bold text-indigo-700 mb-2">Online Payment Gateway</h4>
                    <p className="text-indigo-600/80 text-sm">Our requested Online Payment Gateway integration is **Coming Soon**! Please make the payment via Cash to physical management in the meantime.</p>
                 </div>
               ) : chequeUI ? (
                 <div className="mb-6 animate-in slide-in-from-right-2">
                    <div className="relative overflow-hidden w-full max-w-lg mx-auto bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/80 rounded border-2 border-indigo-200/50 p-5 mb-5 shadow-inner">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/[0.03] rounded-bl-full pointer-events-none"></div>
                       <div className="flex justify-between items-center mb-4">
                         <div className="w-2/3">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Bank Name</label>
                            <input type="text" required value={chequeDetails.bankName} onChange={e=>setChequeDetails({...chequeDetails, bankName: e.target.value})} className="w-full border-b border-dashed border-slate-300 bg-transparent text-sm text-slate-800 font-bold focus:outline-none focus:border-indigo-500 transition py-1" placeholder="e.g. HDFC Bank" />
                         </div>
                         <div className="w-1/3 pl-4">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5 text-right">Date</label>
                            <input type="date" required value={chequeDetails.date} onChange={e=>setChequeDetails({...chequeDetails, date: e.target.value})} className="w-full border border-slate-200 rounded bg-white text-xs text-slate-800 font-mono focus:outline-none focus:border-indigo-500 transition py-1 px-2 text-right shadow-sm" />
                         </div>
                       </div>
                       
                       <div className="mb-6">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Pay To The Order Of</label>
                         <p className="border-b border-dashed border-slate-300 py-1 font-serif text-lg font-bold text-slate-800 tracking-tight">Society Maintenance Management</p>
                       </div>

                       <div className="flex justify-between items-end">
                         <div className="w-1/2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5 relative top-[18px]">Cheque No.</label>
                            <span className="font-mono text-xl mr-2 font-bold opacity-30">⑆</span>
                            <input type="text" required value={chequeDetails.chequeNumber} onChange={e=>setChequeDetails({...chequeDetails, chequeNumber: e.target.value})} className="w-3/4 border-b border-dashed border-slate-300 bg-transparent font-mono text-sm text-slate-800 tracking-[0.2em] focus:outline-none focus:border-indigo-500 transition py-1" placeholder="000123" />
                         </div>
                         
                         <div className="w-1/2 flex justify-end">
                           <div className="border border-indigo-200 bg-white/60 rounded px-4 py-2 flex items-center shadow-sm">
                             <span className="text-sm font-bold text-slate-400 mr-2">₹</span>
                             <span className="text-xl font-extrabold text-slate-800 font-mono tracking-tight">{finalPayAmount}</span>
                           </div>
                         </div>
                       </div>
                    </div>
                    <button onClick={() => processPaymentMode('Cheque')} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 pt-3 flex items-center justify-center gap-2 rounded-xl transition shadow-sm">
                       <CreditCard size={18}/> Deposit Virtual Cheque
                    </button>
                 </div>
               ) : (
                 <div className="grid grid-cols-3 gap-4 mb-6">
                   <button onClick={() => processPaymentMode('Online')} className="p-4 border-2 border-slate-200 hover:border-indigo-600 rounded-xl text-center font-bold text-slate-700 hover:text-indigo-700 transition">Online</button>
                   <button onClick={() => processPaymentMode('Cash')} className="p-4 border-2 border-slate-200 hover:border-emerald-600 rounded-xl text-center font-bold text-slate-700 hover:text-emerald-700 transition">Cash</button>
                   <button onClick={() => processPaymentMode('Cheque')} className="p-4 border-2 border-slate-200 hover:border-blue-600 rounded-xl text-center font-bold text-slate-700 hover:text-blue-700 transition">Cheque</button>
                 </div>
               )}

                 <div className="flex justify-end mt-2">
                    <button onClick={() => setPaymentModal({ isOpen: false, maint: null, isAdvance: false, months: 1 })} className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-5 py-2.5 rounded-xl font-bold">Cancel</button>
                 </div>
                 </>
                 );
               })()}
            </div>
         </div>
      )}
    </div>
  );
}

function CalendarIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
}

export default MyMaintenance;
