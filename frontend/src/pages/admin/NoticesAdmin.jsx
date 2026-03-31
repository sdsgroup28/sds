import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Megaphone, Calendar, Trash2 } from 'lucide-react';

const API_NOTICES = 'http://localhost:5000/api/notices';

function NoticesAdmin() {
  const [notices, setNotices] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [editId, setEditId] = useState(null);



  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await axios.get(API_NOTICES);
      setNotices(res.data);
    } catch(err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API_NOTICES}/${editId}`, formData);
      } else {
        await axios.post(API_NOTICES, formData);
      }
      setFormData({ title: '', content: '' });
      setEditId(null);
      setIsFormOpen(false);
      fetchNotices();
    } catch (err) {
      alert("Error saving notice");
    }
  };

  const handleEdit = (n) => {
    setFormData({ title: n.title, content: n.content });
    setEditId(n._id);
    setIsFormOpen(true);
  };

  const handleCreateNew = () => {
    setFormData({ title: '', content: '' });
    setEditId(null);
    setIsFormOpen(!isFormOpen);
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this notice permanently?")) return;
    try {
      await axios.delete(`${API_NOTICES}/${id}`);
      fetchNotices();
    } catch (err) {
      alert("Error deleting notice");
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 border-b border-slate-200 pb-5 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Megaphone className="text-indigo-600" /> Executive Notice Board
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Publish announcements and circulars for all residents.</p>
        </div>
        <button 
          onClick={handleCreateNew} 
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-indigo-700 transition flex items-center gap-2 transform hover:-translate-y-0.5">
          {isFormOpen ? "Close Form" : <><PlusCircle size={18} /> New Notice</>}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 mb-8 animate-in zoom-in-95 duration-200">
           <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-1">Notice Title / Subject</label>
                 <input className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl outline-none focus:border-indigo-500 transition" placeholder="e.g. Annual General Meeting (AGM)" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-1">Detailed Content</label>
                 <textarea rows="4" className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl outline-none focus:border-indigo-500 transition" placeholder="Provide full details here..." required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}></textarea>
              </div>
              <button className="bg-slate-900 text-white p-3 rounded-xl font-bold hover:bg-slate-800 transition w-full md:w-auto px-8 shadow-sm">
                {editId ? 'Update Notice' : 'Publish Notice'}
              </button>
           </form>
        </div>
      )}

      <div className="space-y-6">
        {notices.map(n => (
           <div key={n._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow transition-shadow relative group">
              <div className="flex justify-between items-start mb-3">
                 <h2 className="text-xl font-bold text-slate-800 tracking-tight">{n.title}</h2>
                 <div className="opacity-0 group-hover:opacity-100 transition flex gap-1">
                   <button onClick={()=>handleEdit(n)} className="text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded flex items-center gap-1 text-xs font-bold transition">Edit</button>
                   <button onClick={()=>handleDelete(n._id)} className="text-slate-300 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded transition"><Trash2 size={16}/></button>
                 </div>
              </div>
              <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{n.content}</p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-4 text-xs font-semibold text-slate-400">
                 <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(n.date).toLocaleString()}</span>
                 <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded uppercase tracking-wider text-[10px]">{n.author}</span>
              </div>
           </div>
        ))}
        {notices.length === 0 && (
           <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
              <Megaphone className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-500">No active notices.</p>
           </div>
        )}
      </div>
    </div>
  );
}

export default NoticesAdmin;
