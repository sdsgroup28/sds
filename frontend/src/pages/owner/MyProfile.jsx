import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import { User, Users, Car, CreditCard, Plus, Trash2, Save, ExternalLink } from 'lucide-react';

const API_HOUSES = 'http://localhost:5000/api/houses';

function MyProfile() {
  const { user } = useUser();
  const [house, setHouse] = useState(null);
  const [formData, setFormData] = useState({
    ownerIdProof: '',
    tenantIdProof: '',
    familyMembers: [],
    vehicles: { twoWheelers: [], fourWheelers: [] }
  });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_HOUSES}/my/${user.id}`);
      if (res.data) {
        setHouse(res.data);
        setFormData({
          ownerIdProof: res.data.ownerIdProof || '',
          tenantIdProof: res.data.tenantIdProof || '',
          familyMembers: res.data.familyMembers || [],
          vehicles: res.data.vehicles || { twoWheelers: [], fourWheelers: [] }
        });
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      if(!house) return;
      await axios.put(`${API_HOUSES}/${house._id}`, formData);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchProfile();
    } catch (err) {
      setErrorMsg('Error saving profile: ' + (err.response?.data?.error || err.message));
    }
  };

  const addFamilyMember = () => setFormData({...formData, familyMembers: [...formData.familyMembers, { name: '', age: '', relation: '' }]});
  const updateFamily = (i, field, val) => {
    const arr = [...formData.familyMembers];
    arr[i][field] = val;
    setFormData({...formData, familyMembers: arr});
  };
  const removeFamily = (i) => setFormData({...formData, familyMembers: formData.familyMembers.filter((_, idx)=>idx!==i)});

  const handleViewDocument = (e, base64) => {
    e.preventDefault();
    const docWindow = window.open("");
    if (!docWindow) return setErrorMsg("Please allow popups to view document.");
    if (base64 && base64.startsWith('data:application/pdf')) {
       docWindow.document.write(`<iframe width="100%" height="100%" src="${base64}" frameborder="0"></iframe>`);
    } else {
       docWindow.document.write(`<div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#000;"><img src="${base64}" style="max-width:100%;max-height:100%;" /></div>`);
    }
  };

  const addVehicle = (type) => setFormData({...formData, vehicles: { ...formData.vehicles, [type]: [...formData.vehicles[type], { make: '', plateNumber: '' }] }});
  const updateVehicle = (type, i, field, val) => {
    const arr = [...formData.vehicles[type]];
    arr[i][field] = val;
    setFormData({...formData, vehicles: { ...formData.vehicles, [type]: arr }});
  };
  const removeVehicle = (type, i) => setFormData({...formData, vehicles: { ...formData.vehicles, [type]: formData.vehicles[type].filter((_, idx)=>idx!==i) }});

  const handleFileUpload = (e, field) => {
    setErrorMsg('');
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return setErrorMsg('File size must be under 5MB.');
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, [field]: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading profile...</div>;
  if (!house) return <div className="p-8 text-center text-slate-500">Please link a house in the dashboard first.</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="mb-6 border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <User className="text-indigo-600" /> Resident Profile
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Update your family, vehicles, and identity proofs.</p>
      </div>

      {errorMsg && <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-medium shadow-sm animate-in zoom-in-95">{errorMsg}</div>}
      {successMsg && <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-medium shadow-sm animate-in zoom-in-95">{successMsg}</div>}

      <form onSubmit={handleSave} className="space-y-8 pb-12">
        
        {/* Identity Proofs */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
           <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><CreditCard size={18} className="text-indigo-600"/> Identity Documents</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                 <div className="flex justify-between items-center text-sm font-semibold text-slate-700 mb-2">
                  <span>Owner Identity Document (Base64)</span>
                  {formData.ownerIdProof && <button type="button" onClick={e => handleViewDocument(e, formData.ownerIdProof)} className="text-indigo-600 hover:text-indigo-800 text-xs flex items-center gap-1 transition-colors"><ExternalLink size={14}/> View Current</button>}
                </div>
                 <input type="file" accept=".pdf,image/*" className="w-full border border-slate-200 bg-slate-50 p-2 rounded-xl outline-none focus:border-indigo-500 transition" onChange={e => handleFileUpload(e, 'ownerIdProof')} />
              </div>
              {house.livingStatus === 'Tenant Living' && (
                <div>
                   <div className="flex justify-between items-center text-sm font-semibold text-emerald-700 mb-2">
                    <span>Tenant Identity Document</span>
                    {formData.tenantIdProof && <button type="button" onClick={e => handleViewDocument(e, formData.tenantIdProof)} className="text-emerald-700 hover:text-emerald-900 text-xs flex items-center gap-1 transition-colors"><ExternalLink size={14}/> View Current</button>}
                  </div>
                   <input type="file" accept=".pdf,image/*" className="w-full border border-slate-200 bg-slate-50 p-2 rounded-xl outline-none focus:border-indigo-500 transition" onChange={e => handleFileUpload(e, 'tenantIdProof')} />
                </div>
              )}
           </div>
        </section>

        {/* Family Members */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
           <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Users size={18} className="text-blue-500"/> Family Members</h3>
               <button type="button" onClick={addFamilyMember} className="text-sm font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-blue-100 transition"><Plus size={16}/> Add Member</button>
           </div>
           
           <div className="space-y-4">
             {formData.familyMembers.map((fm, i) => (
                <div key={i} className="flex flex-col md:flex-row gap-3 items-end bg-slate-50 p-4 rounded-xl border border-slate-100 relative">
                   <div className="flex-1 w-full"><label className="text-xs font-semibold text-slate-500 mb-1 block">Full Name</label><input required className="w-full border border-slate-200 p-2.5 rounded-lg" value={fm.name} onChange={e=>updateFamily(i, 'name', e.target.value)} /></div>
                   <div className="w-full md:w-24"><label className="text-xs font-semibold text-slate-500 mb-1 block">Age</label><input required type="number" className="w-full border border-slate-200 p-2.5 rounded-lg" value={fm.age} onChange={e=>updateFamily(i, 'age', e.target.value)} /></div>
                   <div className="flex-1 w-full"><label className="text-xs font-semibold text-slate-500 mb-1 block">Relation</label><input required placeholder="e.g. Spouse, Son" className="w-full border border-slate-200 p-2.5 rounded-lg" value={fm.relation} onChange={e=>updateFamily(i, 'relation', e.target.value)} /></div>
                   <button type="button" onClick={()=>removeFamily(i)} className="p-2.5 text-rose-500 hover:bg-rose-100 rounded-lg transition mb-[1px]"><Trash2 size={18}/></button>
                </div>
             ))}
             {formData.familyMembers.length === 0 && <p className="text-sm text-slate-400">No family members added.</p>}
           </div>
        </section>

        {/* Vehicles */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
           <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><Car size={18} className="text-emerald-500"/> Vehicles</h3>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Two Wheelers */}
              <div>
                 <div className="flex justify-between items-center mb-3">
                     <h4 className="font-semibold text-slate-700">Two Wheelers</h4>
                     <button type="button" onClick={()=>addVehicle('twoWheelers')} className="text-xs font-bold bg-emerald-50 text-emerald-600 px-2 py-1 rounded flex items-center hover:bg-emerald-100"><Plus size={14}/> Add Setup</button>
                 </div>
                 <div className="space-y-3">
                   {formData.vehicles.twoWheelers.map((v, i) => (
                      <div key={i} className="flex gap-2 items-center">
                         <input placeholder="Make (e.g. Honda Activa)" required className="flex-1 border border-slate-200 p-2 text-sm rounded-lg" value={v.make} onChange={e=>updateVehicle('twoWheelers', i, 'make', e.target.value)} />
                         <input placeholder="Number (e.g. MH12 AB1234)" required className="flex-1 border border-slate-200 p-2 text-sm rounded-lg" value={v.plateNumber} onChange={e=>updateVehicle('twoWheelers', i, 'plateNumber', e.target.value)} />
                         <button type="button" onClick={()=>removeVehicle('twoWheelers', i)} className="text-rose-400 hover:text-rose-600"><Trash2 size={16}/></button>
                      </div>
                   ))}
                   {formData.vehicles.twoWheelers.length === 0 && <p className="text-xs text-slate-400">None added</p>}
                 </div>
              </div>

              {/* Four Wheelers */}
              <div>
                 <div className="flex justify-between items-center mb-3">
                     <h4 className="font-semibold text-slate-700">Four Wheelers</h4>
                     <button type="button" onClick={()=>addVehicle('fourWheelers')} className="text-xs font-bold bg-emerald-50 text-emerald-600 px-2 py-1 rounded flex items-center hover:bg-emerald-100"><Plus size={14}/> Add Setup</button>
                 </div>
                 <div className="space-y-3">
                   {formData.vehicles.fourWheelers.map((v, i) => (
                      <div key={i} className="flex gap-2 items-center">
                         <input placeholder="Make (e.g. Hyundai i20)" required className="flex-1 border border-slate-200 p-2 text-sm rounded-lg" value={v.make} onChange={e=>updateVehicle('fourWheelers', i, 'make', e.target.value)} />
                         <input placeholder="Number Plate" required className="flex-1 border border-slate-200 p-2 text-sm rounded-lg" value={v.plateNumber} onChange={e=>updateVehicle('fourWheelers', i, 'plateNumber', e.target.value)} />
                         <button type="button" onClick={()=>removeVehicle('fourWheelers', i)} className="text-rose-400 hover:text-rose-600"><Trash2 size={16}/></button>
                      </div>
                   ))}
                   {formData.vehicles.fourWheelers.length === 0 && <p className="text-xs text-slate-400">None added</p>}
                 </div>
              </div>
           </div>
        </section>

        <div className="pt-4 flex justify-end gap-4">
          <button type="button" onClick={() => fetchProfile()} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all">
             Cancel
          </button>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transform hover:-translate-y-0.5 transition-all">
             <Save size={18} /> Save Complete Profile
          </button>
        </div>

      </form>
    </div>
  );
}

export default MyProfile;
