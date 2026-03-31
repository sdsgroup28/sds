import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import { AlertCircle, PlusCircle, LayoutList } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/complaints';
const API_HOUSES = 'http://localhost:5000/api/houses';

function MyComplaints() {
  const { user } = useUser();
  const [complaints, setComplaints] = useState([]);
  const [houses, setHouses] = useState([]);
  const [formData, setFormData] = useState({ houseId: '', title: '', description: '' });
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const hRes = await axios.get(`${API_HOUSES}/my/${user.id}`);
      const userHouse = hRes.data;
      setHouses(userHouse ? [userHouse] : []);
      setFormData(prev => ({ ...prev, houseId: userHouse?._id || '' }));
      
      const cRes = await axios.get(`${API_URL}/my/${user.id}`);
      setComplaints(cRes.data);
    } catch(err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, formData);
      setFormData({ houseId: '', title: '', description: '' });
      setIsFormOpen(false);
      fetchData();
    } catch(err) {
      alert("Error logging ticket.");
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 border-b border-slate-200 pb-5 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Support Tickets</h1>
          <p className="text-slate-500 mt-1 text-sm">Log requests and track resolutions instantly.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)} 
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-indigo-700 transition flex items-center gap-2 transform hover:-translate-y-0.5">
          {isFormOpen ? "Close Form" : <><PlusCircle size={18} /> New Ticket</>}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 mb-8 animate-in zoom-in-95 duration-200">
           <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><LayoutList size={18}/> Issue Details</h3>
           <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="md:col-span-2">
               <label className="block text-sm font-semibold text-slate-700 mb-1">Select House</label>
               <select className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl outline-none focus:border-indigo-500 transition" required value={formData.houseId} onChange={e => setFormData({...formData, houseId: e.target.value})}>
                <option value="">-- Require House Reference --</option>
                {houses.map(h => <option key={h._id} value={h._id}>{h.houseId} - {h.ownerName}</option>)}
              </select>
             </div>
             
             <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                <input className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl outline-none focus:border-indigo-500 transition" placeholder="Short description of issue..." required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
             </div>

             <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Detailed Description</label>
                <textarea rows="4" className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl outline-none focus:border-indigo-500 transition" placeholder="Please provide all necessary details..." required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
             </div>
             
             <button className="bg-slate-900 text-white p-3 rounded-xl font-bold hover:bg-slate-800 transition md:col-span-2 mt-2">Submit Ticket to Admin</button>
           </form>
        </div>
      )}

      <div className="space-y-4">
        {complaints.map(c => (
          <div key={c._id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow transition-all group flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <div className="flex items-center gap-3 mb-2">
                 <h3 className="font-bold text-lg text-slate-800 tracking-tight">{c.title}</h3>
                 <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-slate-200">{c.houseId?.houseId || 'N/A'}</span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed max-w-2xl">{c.description}</p>
              <p className="text-xs text-slate-400 mt-4 flex items-center gap-1 font-medium">Logged on {new Date(c.dateRegistered).toLocaleDateString()}</p>
            </div>
            <div className="mt-4 md:mt-0 items-end flex flex-col">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${c.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'Resolved' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></span>
                {c.status}
              </span>
            </div>
          </div>
        ))}
        {complaints.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
             <AlertCircle className="mx-auto text-slate-300 mb-3" size={48} />
             <p className="text-slate-500">No active complaints logged.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyComplaints;
