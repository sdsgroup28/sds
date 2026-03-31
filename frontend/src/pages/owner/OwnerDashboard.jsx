import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import { ShieldCheck, CalendarCheck, Home } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

function OwnerDashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState({ pendingDues: 0, openComplaints: 0 });
  const [houseInfo, setHouseInfo] = useState(null);
  const [onboardData, setOnboardData] = useState({ houseId: '', livingStatus: 'Owner Living', tenantName: '', tenantContact: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const hRes = await axios.get(`${API_URL}/houses/my/${user.id}`);
        setHouseInfo(hRes.data);
        if (hRes.data) {
          setOnboardData({
            houseId: hRes.data.houseId,
            livingStatus: hRes.data.livingStatus || 'Owner Living',
            tenantName: hRes.data.tenantDetails?.name || '',
            tenantContact: hRes.data.tenantDetails?.contact || ''
          });
        }
        const [mRes, cRes] = await Promise.all([
          axios.get(`${API_URL}/maintenances/my/${user.id}`),
          axios.get(`${API_URL}/complaints/my/${user.id}`)
        ]);
        
        setStats({
          pendingDues: mRes.data.filter(x => x.status === 'Pending').length,
          openComplaints: cRes.data.filter(x => x.status === 'Pending' || x.status !== 'Resolved').length,
        });
      } catch (err) {
        console.warn("Backend connect error");
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchStatus();
  }, [user]);

  const handleLinkHouse = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await axios.post(`${API_URL}/houses/link-user`, {
        clerkUserId: user.id,
        ownerName: user.fullName || user.firstName || 'Owner',
        ...onboardData
      });
      setHouseInfo(res.data);
      setIsEditing(false);
    } catch (err) {
      setErrorMsg("Error saving details: " + (err.response?.data?.error || err.message));
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading dashboard...</div>;

  if (!houseInfo || isEditing) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto mt-10">
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200">
           <h2 className="text-3xl font-extrabold text-slate-900 mb-2">{isEditing ? 'Edit Profile' : 'Welcome! Complete Your Profile'}</h2>
           <p className="text-slate-500 mb-8">{isEditing ? 'Update your living status and tenant details.' : 'Please link your account to a registered house to access the dashboard.'}</p>
           
            <form onSubmit={handleLinkHouse} className="space-y-6">
              {errorMsg && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium">{errorMsg}</div>}
              <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-1">House Identifier</label>
                 <input className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl outline-none focus:border-indigo-500 transition" placeholder="e.g. A-101" required value={onboardData.houseId} onChange={e => setOnboardData({...onboardData, houseId: e.target.value})} disabled={isEditing && houseInfo?.houseId} />
                 {isEditing && houseInfo?.houseId && <p className="text-xs text-amber-600 mt-1">House ID cannot be changed once linked. Contact Admin for modifications.</p>}
              </div>

              {isEditing && (
                <>
                  <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1">Living Status</label>
                     <select className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl outline-none focus:border-indigo-500 transition" value={onboardData.livingStatus} onChange={e => setOnboardData({...onboardData, livingStatus: e.target.value})}>
                        <option value="Owner Living">I live in this house (Owner)</option>
                        <option value="Tenant Living">I have rented this house out (Tenant Living)</option>
                     </select>
                  </div>

                  {onboardData.livingStatus === 'Tenant Living' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in zoom-in-95 duration-200 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Tenant Name</label>
                        <input className="w-full border border-slate-200 bg-white p-3 rounded-xl outline-none focus:border-indigo-500 transition" placeholder="John Doe" required value={onboardData.tenantName} onChange={e => setOnboardData({...onboardData, tenantName: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Tenant Contact</label>
                        <input className="w-full border border-slate-200 bg-white p-3 rounded-xl outline-none focus:border-indigo-500 transition" placeholder="+1 234 567 890" required value={onboardData.tenantContact} onChange={e => setOnboardData({...onboardData, tenantContact: e.target.value})} />
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-4 mt-6">
                <button type="submit" className="flex-1 bg-indigo-600 text-white p-3.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-sm">
                  {isEditing ? 'Save Changes' : 'Link House'}
                </button>
                {isEditing && (
                  <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-slate-100 text-slate-700 p-3.5 rounded-xl font-bold hover:bg-slate-200 transition">
                    Cancel
                  </button>
                )}
              </div>
           </form>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Resident Portal</h1>
        <p className="text-slate-500 mt-1 text-sm">Welcome home, {user?.firstName}. Quick overview of your obligations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl cursor-default">
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-10 group-hover:bg-emerald-100 transition-colors"></div>
          <div className="flex items-center justify-between mb-4 z-10">
            <div className="bg-emerald-100 p-3 rounded-xl">
              <CalendarCheck className="text-emerald-600" size={24} />
            </div>
            <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">Updated</span>
          </div>
          <p className="text-slate-500 font-medium text-sm">Your Unpaid Invoices</p>
          <h2 className="text-4xl font-extrabold text-slate-900 mt-1">{stats.pendingDues}</h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 group-hover:bg-blue-100 transition-colors"></div>
           <div className="flex items-center justify-between mb-4 z-10">
            <div className="bg-blue-100 p-3 rounded-xl">
              <ShieldCheck className="text-blue-600" size={24} />
            </div>
          </div>
          <p className="text-slate-500 font-medium text-sm">Open Complaints Logged</p>
          <h2 className="text-4xl font-extrabold text-slate-900 mt-1">{stats.openComplaints}</h2>
        </div>
      </div>

      <div className="mt-8 bg-gradient-to-tr from-indigo-900 to-indigo-700 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
         <div className="z-10 relative mb-6 md:mb-0 max-w-md">
           <h3 className="text-2xl font-bold mb-2">My Profile Details</h3>
           <p className="text-indigo-100 text-sm leading-relaxed mb-4">
             House: <span className="font-bold text-white">{houseInfo.houseId}</span><br />
             Status: <span className="font-bold text-white">{houseInfo.livingStatus}</span>
             {houseInfo.livingStatus === 'Tenant Living' && (
               <span> (Tenant: {houseInfo.tenantDetails?.name})</span>
             )}
           </p>
           <button onClick={() => setIsEditing(true)} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition backdrop-blur-sm border border-white/10 shadow-sm">
             Edit Living Status
           </button>
         </div>
         <Home className="text-indigo-400 absolute right-6 opacity-20 transform -rotate-12" size={120} />
      </div>
    </div>
  );
}

export default OwnerDashboard;
