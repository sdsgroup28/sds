import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, FileText, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

function AdminDashboard() {
  const [stats, setStats] = useState({ houses: 0, maintenanceRecords: 0, complaints: 0 });
  const [pendingApprovals, setPendingApprovals] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [h, m, c] = await Promise.all([
          axios.get(`${API_URL}/houses`),
          axios.get(`${API_URL}/maintenances`),
          axios.get(`${API_URL}/complaints`)
        ]);
        setStats({
          houses: h.data.length,
          maintenanceRecords: m.data.filter(x => x.status === 'Pending').length,
          complaints: c.data.filter(x => x.status === 'Pending').length,
        });
        setPendingApprovals(m.data.filter(x => x.status === 'Verification Pending'));
      } catch (err) {
        console.warn("Backend connect error");
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Overview</h1>
        <p className="text-slate-500 mt-1 text-sm">Monitor global society metrics and actionable insights.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -z-10 group-hover:bg-indigo-100 transition-colors"></div>
          <div className="flex items-center justify-between mb-4 z-10">
            <div className="bg-indigo-100 p-3 rounded-xl">
              <Users className="text-indigo-600" size={24} />
            </div>
          </div>
          <p className="text-slate-500 font-medium text-sm">Managed Households</p>
          <h2 className="text-4xl font-extrabold text-slate-900 mt-1">{stats.houses}</h2>
          <Link to="/houses" className="text-indigo-600 font-medium text-sm flex items-center gap-1 mt-4 hover:underline">
            Manage <ArrowRight size={14} />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -z-10 group-hover:bg-orange-100 transition-colors"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-xl">
              <FileText className="text-orange-600" size={24} />
            </div>
          </div>
          <p className="text-slate-500 font-medium text-sm">Pending Dues</p>
          <h2 className="text-4xl font-extrabold text-slate-900 mt-1">{stats.maintenanceRecords}</h2>
          <Link to="/maintenance" className="text-orange-600 font-medium text-sm flex items-center gap-1 mt-4 hover:underline">
            Review Billing <ArrowRight size={14} />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -z-10 group-hover:bg-red-100 transition-colors"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-xl">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
          </div>
          <p className="text-slate-500 font-medium text-sm">Active Complaints</p>
          <h2 className="text-4xl font-extrabold text-slate-900 mt-1">{stats.complaints}</h2>
          <Link to="/complaints" className="text-red-600 font-medium text-sm flex items-center gap-1 mt-4 hover:underline">
            Resolve Tickets <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="mt-10 mb-8 border-b border-slate-200 pb-4">
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Pending Payment Approvals</h2>
        <p className="text-slate-500 mt-1 text-sm">Review resident maintenance payments requiring manual verification.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-10">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="px-6 py-4">Target House</th>
                <th className="px-6 py-4">Due Target</th>
                <th className="px-6 py-4">Billing Period</th>
                <th className="px-6 py-4">Payment Info</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {pendingApprovals.map(p => {
                 const formatMonthDate = (str) => {
                   if (!str) return 'N/A';
                   if (str.includes(' to ')) {
                      const [start, end] = str.split(' to ');
                      const d1 = new Date(start);
                      const d2 = new Date(end);
                      const f1 = isNaN(d1.getTime()) ? start : d1.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
                      const f2 = isNaN(d2.getTime()) ? end : d2.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
                      return `${f1} - ${f2}`;
                   }
                   const d = new Date(str);
                   if (isNaN(d.getTime())) return str;
                   return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
                 };

                 return (
                 <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                   <td className="px-6 py-4 font-bold text-indigo-700">{p.houseId?.houseId || 'Unknown'}</td>
                   <td className="px-6 py-4 font-medium text-slate-600">{p.subject || 'Maintenance'}</td>
                   <td className="px-6 py-4 text-slate-700">{formatMonthDate(p.month)}</td>
                   <td className="px-6 py-4">
                     <div className="flex flex-col gap-0.5">
                       <span className="font-bold text-slate-800">₹{p.amount?.toLocaleString()} <span className="font-medium text-slate-400 text-xs ml-1">via {p.paymentMode}</span></span>
                       {p.paymentMode === 'Cheque' && p.chequeDetails && (
                         <span className="text-xs text-slate-500 font-mono">CHQ: {p.chequeDetails.chequeNumber} ({p.chequeDetails.bankName})</span>
                       )}
                     </div>
                   </td>
                   <td className="px-6 py-4 text-right">
                     <Link to="/maintenance" className="text-sm font-bold text-amber-600 hover:text-amber-800 bg-amber-50 px-3 py-1.5 rounded hover:bg-amber-100 transition">Review in Billing</Link>
                   </td>
                 </tr>
               )})}
              {pendingApprovals.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-slate-500">
                    <FileText size={32} className="mx-auto text-slate-300 mb-2"/>
                    <p>No new payments waiting for approval.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
