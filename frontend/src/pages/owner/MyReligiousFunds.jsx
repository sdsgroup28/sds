import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import { HeartHandshake, Calendar, Filter } from 'lucide-react';

const API_FUNDS = 'http://localhost:5000/api/religious';

function MyReligiousFunds() {
  const { user } = useUser();
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchFunds = async () => {
      try {
        const res = await axios.get(`${API_FUNDS}/my/${user.id}`);
        setFunds(res.data);
      } catch(err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchFunds();
  }, [user]);

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading records...</div>;

  const totalDonated = funds.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="mb-6 border-b border-slate-200 pb-5 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <HeartHandshake className="text-rose-500" /> Religious History
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Review your past donations and contributions.</p>
        </div>
        <div className="text-right">
           <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Total Donated</p>
           <p className="text-3xl font-black text-rose-600">₹{totalDonated}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <ul className="divide-y divide-slate-100">
           {(() => {
              const sorted = [...funds].sort((a,b) => new Date(b.date) - new Date(a.date));
              const displayed = showAll ? sorted : sorted.slice(0, 10);
              return (
                 <>
                   {displayed.map(f => (
                     <li key={f._id} className="p-6 hover:bg-slate-50/50 transition flex items-center justify-between">
                        <div>
                           <h3 className="font-bold text-slate-800 text-lg mb-1">{f.eventName}</h3>
                           <p className="text-sm text-slate-500 max-w-md">{f.description || 'No specific description provided.'}</p>
                        </div>
                        <div className="text-right">
                           <p className="font-bold text-slate-800">₹{f.amount}</p>
                           <p className="text-xs text-slate-400 flex items-center justify-end gap-1 mt-1"><Calendar size={12}/> {new Date(f.date).toLocaleDateString()}</p>
                        </div>
                     </li>
                   ))}
                   {funds.length === 0 && (
                      <li className="p-10 text-center text-slate-500">
                         <HeartHandshake size={32} className="mx-auto text-slate-300 mb-3" />
                         <p>No donation history found for your account.</p>
                      </li>
                   )}
                 </>
              );
           })()}
        </ul>
        {funds.length > 10 && (
          <div className="border-t border-slate-200 bg-slate-50 p-4 text-center">
             <button onClick={() => setShowAll(!showAll)} className="text-sm font-bold text-rose-600 hover:text-rose-800 transition py-1 px-4 rounded-full hover:bg-rose-100">
                {showAll ? 'Show Latest Only' : 'Show All Records Till Date'}
             </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyReligiousFunds;
