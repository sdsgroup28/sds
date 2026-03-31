import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, HeartHandshake, Calendar } from 'lucide-react';

const API_FUNDS = 'http://localhost:5000/api/religious';
const API_HOUSES = 'http://localhost:5000/api/houses';

function ReligiousFunds() {
  const [funds, setFunds] = useState([]);
  const [houses, setHouses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [formData, setFormData] = useState({
    eventName: '',
    type: 'Donation',
    amount: '',
    memberId: '',
    description: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [exportStart, setExportStart] = useState('');
  const [exportEnd, setExportEnd] = useState('');

  const filteredFunds = funds.filter(f => 
    (f.eventName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (f.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.memberId?.houseId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportData = (format) => {
    if (!exportStart || !exportEnd) {
      alert("Please select a date range for export.");
      return;
    }
    
    const dataToExport = filteredFunds.filter(f => {
       const rowDate = new Date(f.date);
       return rowDate >= new Date(exportStart) && rowDate <= new Date(exportEnd);
    });

    if (dataToExport.length === 0) {
      alert("No records to export matching filter and date range");
      return;
    }
    
    const headers = ['Event', 'Type', 'Amount (₹)', 'Contributor', 'Date'];
    const rows = dataToExport.map(f => {
      const contributor = f.memberId ? `${f.memberId.houseId} (${f.memberId.ownerName})` : f.description || 'Anonymous';
      return [f.eventName, f.type, f.amount, contributor, new Date(f.date).toLocaleDateString()];
    });

    if (format === 'pdf') {
       const printWindow = window.open('', '_blank');
       printWindow.document.write(`
         <html><head><title>Religious & Festival Funds Report</title>
         <style>
           body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #333; }
           .header { text-align: center; margin-bottom: 40px; }
           h1 { color: #8b5cf6; margin: 0 0 10px 0; font-size: 28px; }
           h3 { color: #64748b; margin: 0; font-weight: 500; }
           table { width: 100%; border-collapse: collapse; margin-top: 20px; }
           th, td { border: 1px solid #e2e8f0; padding: 12px 16px; text-align: left; font-size: 14px; }
           th { background-color: #f8fafc; color: #0f172a; font-weight: 600; text-transform: uppercase; font-size: 12px; }
           tr:nth-child(even) { background-color: #f8fafc; }
           .amount { font-family: monospace; font-weight: bold; }
         </style></head>
         <body>
           <div class="header"><h1>SDS</h1><h3>Religious & Festival Funds Report</h3><p>From ${exportStart} to ${exportEnd}</p></div>
           <table>
             <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
             <tbody>${rows.map(row => `<tr>${row.map((c, i) => `<td class="${i === 2 ? 'amount' : ''}">${c}</td>`).join('')}</tr>`).join('')}</tbody>
           </table>
           <script>window.onload = () => { window.print(); window.close(); }</script>
         </body></html>
       `);
       printWindow.document.close();
    } else {
       const csv = "data:text/csv;charset=utf-8," + headers.join(',') + "\n" + rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
       const link = document.createElement("a");
       link.setAttribute("href", encodeURI(csv));
       link.setAttribute("download", "religious_funds.csv");
       link.click();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const hRes = await axios.get(API_HOUSES);
      setHouses(hRes.data);
      const fRes = await axios.get(API_FUNDS);
      setFunds(fRes.data);
      const cRes = await axios.get('http://localhost:5000/api/categories/Festival');
      setCategories(cRes.data);
    } catch(err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.memberId) {
        delete payload.memberId;
      }

      await axios.post(API_FUNDS, payload);
      setFormData({ eventName: '', type: 'Donation', amount: '', memberId: '', description: '' });
      setIsFormOpen(false);
      fetchData();
    } catch(err) {
      alert("Error adding record: " + err.response?.data?.error || err.message);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await axios.post('http://localhost:5000/api/categories', { name: newCatName, type: 'Festival' });
      setNewCatName('');
      fetchData();
    } catch(err) { alert(err.message); }
  };

  const handleDeleteCategory = async (id) => {
    if(!window.confirm('Delete this festival name?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/categories/${id}`);
      fetchData();
      setFormData({...formData, eventName: ''});
    } catch(err) { alert(err.message); }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 border-b border-slate-200 pb-5 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Religious & Festival Funds</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage donations and event expenses for the society.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <input 
            type="text" 
            placeholder="Filter records..." 
            className="border border-slate-200 bg-slate-50 px-3 py-1.5 rounded-lg outline-none focus:border-indigo-500 text-sm w-48 transition"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <div className="flex bg-slate-100 rounded-lg p-1 mr-2 opacity-90 hover:opacity-100 transition-opacity">
            <input type="date" value={exportStart} onChange={e=>setExportStart(e.target.value)} className="bg-white border border-slate-200 text-xs px-2 py-1.5 rounded outline-none h-full shadow-sm mx-1 hidden sm:block" title="Start Date Export" />
            <input type="date" value={exportEnd} onChange={e=>setExportEnd(e.target.value)} className="bg-white border border-slate-200 text-xs px-2 py-1.5 rounded outline-none h-full shadow-sm mr-2 hidden sm:block" title="End Date Export" />
            <button onClick={() => exportData('csv')} className="text-xs font-bold text-slate-700 px-3 py-1.5 hover:bg-white rounded shadow-sm transition">CSV</button>
             <button onClick={() => exportData('pdf')} className="text-xs font-bold text-slate-700 px-3 py-1.5 hover:bg-white rounded shadow-sm transition">PDF</button>
          </div>
          <button 
            onClick={() => setIsFormOpen(!isFormOpen)} 
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-indigo-700 transition flex items-center gap-2 transform hover:-translate-y-0.5">
            {isFormOpen ? "Cancel" : <><PlusCircle size={18} /> New Record</>}
          </button>
        </div>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 mb-8 animate-in zoom-in-95 duration-200">
           <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             <div className="md:col-span-1 border border-slate-200 bg-slate-50 p-3 rounded-xl focus-within:border-indigo-500 transition relative">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Event / Festival Name</label>
                <select className="w-full bg-transparent outline-none" required value={formData.eventName} onChange={e => {
                  if (e.target.value === 'ADD_EDIT') {
                    setIsCatModalOpen(true);
                  } else {
                    setFormData({...formData, eventName: e.target.value});
                  }
                }}>
                  <option value="">-- Select Event --</option>
                  {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                  <option value="ADD_EDIT" className="font-bold text-indigo-600">+ Add / Edit Festivals...</option>
                </select>
             </div>

             <div className="md:col-span-1">
               <label className="block text-sm font-semibold text-slate-700 mb-1">Record Type</label>
               <select className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl outline-none focus:border-indigo-500 transition" required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="Donation">Received Donation</option>
                <option value="Expense">Event Expense</option>
              </select>
             </div>

             <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Amount (₹)</label>
                <input type="number" className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl outline-none focus:border-indigo-500 transition" placeholder="e.g. 1000" required value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} />
             </div>

             {formData.type === 'Donation' && (
               <div className="md:col-span-3 lg:col-span-1">
                 <label className="block text-sm font-semibold text-slate-700 mb-1">Contributing House (Optional)</label>
                 <select className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl outline-none focus:border-indigo-500 transition" value={formData.memberId} onChange={e => setFormData({...formData, memberId: e.target.value})}>
                  <option value="">-- General Anonymous / Dropdown --</option>
                  {houses.map(h => <option key={h._id} value={h._id}>{h.houseId} - {h.ownerName}</option>)}
                </select>
               </div>
             )}

             <div className="md:col-span-3 lg:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Notes / Description</label>
                <input className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl outline-none focus:border-indigo-500 transition" placeholder="Cash collection, specific requirements..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
             </div>
             
             <button className="bg-slate-900 text-white p-3 rounded-xl font-bold hover:bg-slate-800 transition md:col-span-3 mt-2 shadow-sm flex items-center justify-center gap-2">
               <HeartHandshake size={18} /> Save Record
             </button>
           </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="px-6 py-4">Event</th>
                <th className="px-6 py-4">Record Type</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4">Contributor / Details</th>
                <th className="px-6 py-4">Date Logged</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredFunds.map(f => (
                <tr key={f._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-800">{f.eventName}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${f.type === 'Donation' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                      {f.type}
                    </span>
                  </td>
                  <td className={`px-6 py-4 font-bold text-right ${f.type === 'Donation' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {f.type === 'Donation' ? '+' : '-'}₹{f.amount}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {f.type === 'Donation' && f.memberId ? (
                       <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded border border-indigo-100 font-medium text-xs">
                         {f.memberId.houseId} ({f.memberId.ownerName})
                       </span>
                    ) : (
                      f.description || <span className="text-slate-400 italic">No notes</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500 flex items-center gap-2">
                     <Calendar size={14} className="text-slate-400" />
                     {new Date(f.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {filteredFunds.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                     <HeartHandshake size={40} className="mx-auto text-slate-300 mb-3" />
                     <p>No festival or religious fund records logged yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isCatModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Manage Festival Names</h3>
            <form onSubmit={handleCreateCategory} className="flex gap-2 mb-4">
              <input value={newCatName} onChange={e=>setNewCatName(e.target.value)} placeholder="New Festival Name..." className="border p-2 rounded flex-1 text-sm bg-slate-50" />
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-bold">Add</button>
            </form>
            <div className="max-h-60 overflow-y-auto mb-4 border rounded divide-y">
              {categories.length === 0 && <p className="p-4 text-center text-sm text-slate-500">No festivals configured.</p>}
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

export default ReligiousFunds;
