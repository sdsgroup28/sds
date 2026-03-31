import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/complaints';

function ComplaintsAdmin() {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const cRes = await axios.get(API_URL);
      setComplaints(cRes.data);
    } catch(err) {
      console.error(err);
    }
  };



  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/${id}`, { status });
      fetchData();
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Resolution Center</h1>
        <p className="text-slate-500 mt-1 text-sm">Review, verify, and resolve society complaints.</p>
      </div>

      <div className="grid gap-4">
        {complaints.map(c => (
          <div key={c._id} className={`bg-white border p-6 rounded-2xl shadow-sm transition-all group flex flex-col md:flex-row justify-between items-start md:items-center ${c.status === 'Resolved' ? 'border-emerald-100 opacity-80' : 'border-rose-100'}`}>
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-2">
                 <h3 className={`font-bold text-xl tracking-tight ${c.status === 'Resolved' ? 'text-slate-600' : 'text-slate-900'}`}>{c.title}</h3>
                 <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold border border-slate-200 tracking-widest uppercase">
                   {c.houseId?.houseId || 'N/A'}
                 </span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">{c.description}</p>
              <div className="flex items-center gap-4 mt-6 text-xs font-medium text-slate-400">
                 <span>Reported on {new Date(c.dateRegistered).toLocaleDateString()}</span>
                 <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                 <span>ID: {c._id.slice(-6).toUpperCase()}</span>
              </div>
            </div>
            
            <div className="mt-6 md:mt-0 flex flex-col md:items-end gap-3 w-full md:w-auto">
              <span className={`inline-flex items-center justify-center md:justify-end gap-1.5 px-4 py-2 rounded-xl text-sm font-bold w-full md:w-auto ${c.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700' : c.status === 'In Progress' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
                {c.status === 'Resolved' ? <CheckCircle size={16}/> : <AlertTriangle size={16}/>}
                {c.status}
              </span>
              
              <select 
                value={c.status}
                onChange={(e) => updateStatus(c._id, e.target.value)}
                className="bg-white border border-slate-200 text-slate-700 w-full md:w-auto px-4 py-2 rounded-xl font-bold shadow-sm transition-all text-sm outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>
        ))}
        {complaints.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
             <CheckCircle className="mx-auto text-emerald-400 mb-3" size={48} />
             <p className="text-slate-500 font-medium text-lg">Clean slate!</p>
             <p className="text-slate-400 text-sm mt-1">There are no open complaints in the system.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ComplaintsAdmin;
