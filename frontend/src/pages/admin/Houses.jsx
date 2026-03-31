import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Home, Users, Phone, MapPin, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api/houses';

function Houses() {
  const [houses, setHouses] = useState([]);
  const [formData, setFormData] = useState({ houseId: '', propertyType: 'House', ownerName: '', contact: '' });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedHouse, setSelectedHouse] = useState(null);



  const handleViewDocument = (e, base64) => {
    e.preventDefault();
    const docWindow = window.open("");
    if (!docWindow) return toast.error("Please allow popups to view document.");
    if (base64.startsWith('data:application/pdf')) {
       docWindow.document.write(`<iframe width="100%" height="100%" src="${base64}" frameborder="0"></iframe>`);
    } else {
       docWindow.document.write(`<div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#000;"><img src="${base64}" style="max-width:100%;max-height:100%;" /></div>`);
    }
  };

  useEffect(() => {
    fetchHouses();
  }, []);

  const fetchHouses = async () => {
    try {
      const res = await axios.get(API_URL);
      setHouses(res.data);
    } catch(err) {
      console.error(err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }
      setFormData({ houseId: '', propertyType: 'House', ownerName: '', contact: '' });
      setIsFormOpen(false);
      setEditId(null);
      fetchHouses();
      toast.success(editId ? "House updated successfully" : "House added successfully");
    } catch(err) {
      toast.error("Error saving house: " + (err.response?.data?.error || err.message));
    }
  }

  const handleEdit = (h, e) => {
    e.stopPropagation();
    setFormData({ houseId: h.houseId, propertyType: h.propertyType || 'House', ownerName: h.ownerName, contact: h.contact });
    setEditId(h._id);
    setIsFormOpen(true);
  };

  const handleUnlinkUser = async (id) => {
    if (!window.confirm("Are you sure you want to unlink the registered resident? This allows a new owner to login and claim this house.")) return;
    try {
      await axios.post(`${API_URL}/unlink/${id}`);
      fetchHouses();
      setSelectedHouse({...selectedHouse, clerkUserId: null});
      toast.success("Resident account unlinked successfully. A new owner can now register.");
    } catch(err) {
      toast.error("Error unlinking resident: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 border-b border-slate-200 pb-5 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manage Houses</h1>
          <p className="text-slate-500 mt-1 text-sm">Add and monitor all properties in your society.</p>
        </div>
        <button 
          onClick={() => {
            setIsFormOpen(!isFormOpen);
            if(isFormOpen) { setEditId(null); setFormData({ houseId: '', propertyType: 'House', ownerName: '', contact: '' }); }
          }} 
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-indigo-700 transition flex items-center gap-2 transform hover:-translate-y-0.5">
          {isFormOpen ? "Cancel" : <><Plus size={18} /> Add House</>}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 mb-8 animate-in zoom-in-95 duration-200">
           <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">House Identifier</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Home size={16} className="text-slate-400"/></div>
                  <input className="w-full border border-slate-200 bg-slate-50 pl-10 p-3 rounded-xl outline-none focus:border-indigo-500 transition" placeholder="e.g., A-101" required value={formData.houseId} onChange={e => setFormData({...formData, houseId: e.target.value})} />
                </div>
             </div>
             
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Owner Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Users size={16} className="text-slate-400"/></div>
                  <input className="w-full border border-slate-200 bg-slate-50 pl-10 p-3 rounded-xl outline-none focus:border-indigo-500 transition" placeholder="John Doe" required value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} />
                </div>
             </div>
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Property Type</label>
                <select className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl outline-none focus:border-indigo-500 transition" value={formData.propertyType} onChange={e => setFormData({...formData, propertyType: e.target.value})}>
                  <option value="House">House</option>
                  <option value="Plot">Plot</option>
                </select>
             </div>
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Contact Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone size={16} className="text-slate-400"/></div>
                  <input className="w-full border border-slate-200 bg-slate-50 pl-10 p-3 rounded-xl outline-none focus:border-indigo-500 transition" placeholder="+1 234 567 890" required value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} />
                </div>
             </div>
             
             <button className="bg-slate-900 text-white p-3 rounded-xl font-bold hover:bg-slate-800 transition md:col-span-2 mt-4 shadow-sm">{editId ? 'Update Record' : 'Save Record'}</button>
           </form>
        </div>
      )}

      {selectedHouse && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white/90 backdrop-blur border-b border-slate-100 p-6 flex justify-between items-center z-10">
               <div>
                 <h2 className="text-2xl font-extrabold text-slate-900">House {selectedHouse.houseId}</h2>
               </div>
               <button onClick={() => setSelectedHouse(null)} className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-full transition">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
               </button>
            </div>
            
            <div className="p-6 space-y-8">
               <section>
                 <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Users size={18} className="text-indigo-600"/> Occupancy</h3>
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
                    <div><span className="text-xs text-slate-400 font-bold uppercase">Status</span><p className="font-semibold text-slate-800">{selectedHouse.livingStatus || 'Owner Living'}</p></div>
                    <div><span className="text-xs text-slate-400 font-bold uppercase">Owner Name</span><p className="font-semibold text-slate-800">{selectedHouse.ownerName}</p></div>
                    <div><span className="text-xs text-slate-400 font-bold uppercase">Owner Contact</span><p className="font-semibold text-slate-800">{selectedHouse.contact}</p></div>
                    <div>
                      <span className="text-xs text-slate-400 font-bold uppercase">Owner ID Proof</span>
                      <p className="font-semibold text-slate-800">
                        {selectedHouse.ownerIdProof ? <button onClick={(e) => handleViewDocument(e, selectedHouse.ownerIdProof)} className="text-indigo-600 hover:underline">View Document</button> : 'Not Provided'}
                      </p>
                    </div>

                    <div className="col-span-2 mt-2 pt-4 border-t border-slate-200">
                      <h4 className="text-sm font-bold text-slate-700 mb-2">Ownership & Login Management</h4>
                      {selectedHouse.clerkUserId ? (
                        <div className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                          <div>
                            <p className="text-sm text-slate-800 font-semibold mb-0.5">Resident Account Linked</p>
                            <p className="text-xs text-slate-500 max-w-sm">A resident is currently registered to this house. Unlink the account when the house is sold to allow the new owner to register and login.</p>
                          </div>
                          <button onClick={() => handleUnlinkUser(selectedHouse._id)} className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-rose-100 hover:text-rose-700 transition">Unlink Resident</button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                          <div>
                            <p className="text-sm text-slate-800 font-semibold flex items-center gap-1.5 mb-0.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> No Resident Registered</p>
                            <p className="text-xs text-slate-500 max-w-sm">This house is available for linking. A new owner can login and securely claim this house during onboarding.</p>
                          </div>
                        </div>
                      )}
                    </div>
                 </div>
               </section>

               {selectedHouse.livingStatus === 'Tenant Living' && (
                 <section>
                   <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Users size={18} className="text-emerald-600"/> Tenant Details</h3>
                   <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 grid grid-cols-2 gap-4">
                      <div><span className="text-xs text-emerald-600/70 font-bold uppercase">Tenant Name</span><p className="font-semibold text-emerald-900">{selectedHouse.tenantDetails?.name || 'N/A'}</p></div>
                      <div><span className="text-xs text-emerald-600/70 font-bold uppercase">Tenant Contact</span><p className="font-semibold text-emerald-900">{selectedHouse.tenantDetails?.contact || 'N/A'}</p></div>
                      <div className="col-span-2">
                        <span className="text-xs text-emerald-600/70 font-bold uppercase">Tenant ID Proof</span>
                        <p className="font-semibold text-emerald-900">
                          {selectedHouse.tenantIdProof ? <button onClick={(e) => handleViewDocument(e, selectedHouse.tenantIdProof)} className="text-indigo-600 hover:underline">View Document</button> : 'Not Provided'}
                        </p>
                      </div>
                   </div>
                 </section>
               )}

               <section>
                 <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Home size={18} className="text-blue-600"/> Family Members</h3>
                 {selectedHouse.familyMembers && selectedHouse.familyMembers.length > 0 ? (
                   <ul className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                     {selectedHouse.familyMembers.map((fm, i) => (
                        <li key={i} className="p-3 bg-white flex justify-between items-center text-sm">
                           <span className="font-semibold text-slate-800">{fm.name}</span>
                           <div className="flex gap-3 text-slate-500 text-xs"><span>{fm.age} yrs</span><span className="bg-slate-100 px-2 py-0.5 rounded-full">{fm.relation}</span></div>
                        </li>
                     ))}
                   </ul>
                 ) : <p className="text-slate-500 text-sm bg-slate-50 p-4 rounded-xl">No family members listed.</p>}
               </section>

               <section>
                 <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg> Vehicles</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                     <h4 className="font-bold text-slate-700 mb-3 text-sm border-b pb-2">Two Wheelers</h4>
                     {selectedHouse.vehicles?.twoWheelers?.length > 0 ? (
                       <ul className="space-y-2">
                         {selectedHouse.vehicles.twoWheelers.map((v, i) => (
                           <li key={i} className="flex justify-between text-sm"><span className="font-medium">{v.make}</span><span className="text-slate-500 font-mono text-xs bg-slate-100 px-1 rounded">{v.plateNumber}</span></li>
                         ))}
                       </ul>
                     ) : <p className="text-xs text-slate-400">None registered</p>}
                   </div>
                   <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                     <h4 className="font-bold text-slate-700 mb-3 text-sm border-b pb-2">Four Wheelers</h4>
                     {selectedHouse.vehicles?.fourWheelers?.length > 0 ? (
                       <ul className="space-y-2">
                         {selectedHouse.vehicles.fourWheelers.map((v, i) => (
                           <li key={i} className="flex justify-between text-sm"><span className="font-medium">{v.make}</span><span className="text-slate-500 font-mono text-xs bg-slate-100 px-1 rounded">{v.plateNumber}</span></li>
                         ))}
                       </ul>
                     ) : <p className="text-xs text-slate-400">None registered</p>}
                   </div>
                 </div>
               </section>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {houses.map(h => (
          <div key={h._id} onClick={() => setSelectedHouse(h)} className="bg-white cursor-pointer border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all group relative overflow-hidden">
             <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50 rounded-bl-full -z-10 group-hover:bg-indigo-100 transition-colors"></div>
             <div className="flex justify-between items-start mb-4">
                 <div className="flex bg-slate-100 text-indigo-700 font-extrabold px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm text-lg tracking-tight items-center gap-2">
                   {h.houseId} <span className="text-xs text-slate-500 bg-white px-1.5 rounded border">{h.propertyType}</span>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={(e) => handleEdit(h, e)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition relative z-20">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    </button>
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-full">
                      <Home size={18} />
                    </div>
                 </div>
              </div>
             
             <h3 className="text-xl font-bold text-slate-900 mb-1">{h.ownerName}</h3>
             
             <div className="flex flex-col gap-2 mt-4 text-sm text-slate-600">
               <div className="flex items-center gap-2"><Phone size={14} className="text-slate-400"/> {h.contact}</div>
             </div>
          </div>
        ))}
        {houses.length === 0 && (
          <div className="col-span-1 md:col-span-3 text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
             <Users className="mx-auto text-slate-300 mb-3" size={48} />
             <p className="text-slate-500">No households tracked currently.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Houses;
