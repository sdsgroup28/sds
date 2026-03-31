import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Megaphone, Calendar, Info } from 'lucide-react';

const API_NOTICES = 'http://localhost:5000/api/notices';

function NoticeBoard() {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await axios.get(API_NOTICES);
        setNotices(res.data);
      } catch(err) {
        console.error(err);
      }
    };
    fetchNotices();
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="mb-6 border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Megaphone className="text-indigo-600" /> Digital Notice Board
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Important announcements and updates from the Society Management.</p>
      </div>

      <div className="space-y-6 relative border-l-2 border-indigo-100 pl-6 ml-3">
        {notices.map(n => (
           <div key={n._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative group transition-all hover:shadow-md">
              <div className="absolute w-4 h-4 bg-indigo-500 rounded-full -left-[33px] top-6 border-4 border-white shadow-sm ring-1 ring-slate-200"></div>
              <div className="flex justify-between flex-wrap gap-2 items-start mb-3">
                 <h2 className="text-xl font-bold text-slate-800 tracking-tight">{n.title}</h2>
                 <span className="flex items-center gap-1 text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full shadow-sm"><Calendar size={12}/> {new Date(n.date).toLocaleDateString()}</span>
              </div>
              <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{n.content}</p>
              <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                 <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Info size={14}/> Published by {n.author}</span>
              </div>
           </div>
        ))}
        {notices.length === 0 && (
           <div className="text-center py-16">
              <Megaphone className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-500">No new announcements.</p>
           </div>
        )}
      </div>
    </div>
  );
}

export default NoticeBoard;
