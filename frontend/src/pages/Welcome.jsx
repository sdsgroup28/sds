import React from 'react';
import { SignInButton } from "@clerk/clerk-react";
import { Building2, ShieldCheck, Home, ArrowRight, Zap, Users, Wallet, CheckCircle2 } from "lucide-react";

function Welcome() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Navbar - Glassmorphism */}
      <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-6 py-4 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-2 text-indigo-700">
          <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
             <Building2 size={24} />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">Society <span className="text-indigo-600">SDS</span></span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-6 text-sm font-semibold text-slate-600">
             <a href="#features" className="hover:text-indigo-600 transition">Features</a>
             <a href="#benefits" className="hover:text-indigo-600 transition">Benefits</a>
             <a href="#testimonials" className="hover:text-indigo-600 transition">Testimonials</a>
          </div>
          <SignInButton mode="modal">
            <button className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-bold hover:bg-indigo-600 transition-all shadow-md transform hover:-translate-y-0.5">
              Login to Portal
            </button>
          </SignInButton>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex items-center justify-center min-h-[90vh]">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-gradient-to-bl from-indigo-100 via-purple-50 to-transparent rounded-full blur-3xl opacity-60 z-0 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-50 via-teal-50 to-transparent rounded-full blur-3xl opacity-60 z-0 pointer-events-none"></div>

        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold text-sm mb-8 animate-in slide-in-from-bottom-4 duration-700">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
              </span>
              Next-Gen Society Management
           </div>
           
           <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-8 tracking-tight leading-[1.1] animate-in slide-in-from-bottom-6 duration-700 delay-100">
             Modern living deserves <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">smarter management.</span>
           </h1>
           
           <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto animate-in slide-in-from-bottom-8 duration-700 delay-200">
             SDS brings admins and residents together on a single, powerful platform. Automate billing, track complaints, and modernize your community effortlessly.
           </p>
           
           <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-in slide-in-from-bottom-10 duration-700 delay-300">
              <SignInButton mode="modal">
                <button className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 transform hover:-translate-y-1 flex items-center gap-2">
                  Get Started Now <ArrowRight size={20} />
                </button>
              </SignInButton>
              <button className="bg-white text-slate-800 border-2 border-slate-200 px-8 py-4 rounded-full font-bold text-lg hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm">
                Watch Demo
              </button>
           </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 bg-white relative z-10 border-t border-slate-100">
         <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-16">
               <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Everything your society needs</h2>
               <p className="text-slate-500 max-w-xl mx-auto text-lg">Powerful tools designed specifically for Indian housing societies, reducing administrative overhead by 80%.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {/* Feature 1 */}
               <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="bg-white w-14 h-14 rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                     <Wallet className="text-emerald-500" size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Automated Billing</h3>
                  <p className="text-slate-600 leading-relaxed">Instantly generate custom invoices, auto-calculate monthly dues, and track online payments without spreadsheets.</p>
               </div>

               {/* Feature 2 */}
               <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="bg-white w-14 h-14 rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                     <Zap className="text-amber-500" size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Rapid Complaints</h3>
                  <p className="text-slate-600 leading-relaxed">Residents can log maintenance issues with photos. Admins process, assign, and resolve tickets transparently.</p>
               </div>

               {/* Feature 3 */}
               <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="bg-white w-14 h-14 rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                     <Users className="text-indigo-500" size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Detailed Profiles</h3>
                  <p className="text-slate-600 leading-relaxed">Maintain exhaustive records including tenant details, family members, vehicle registrations, and ID proofs securely.</p>
               </div>
            </div>
         </div>
      </section>

      {/* Split Section */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden">
         <div className="container mx-auto px-6 max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
               <h2 className="text-4xl font-extrabold mb-6 tracking-tight leading-tight">Built for both Admins and Residents.</h2>
               <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                 Finally, a platform that doesn't just focus on the front office. SDS provides a dual-portal system ensuring everyone has the exact functionality they need at their fingertips.
               </p>
               
               <ul className="space-y-4 mb-8">
                 <li className="flex items-center gap-3"><CheckCircle2 className="text-emerald-400" size={20}/> <span className="font-medium">Admin: Execute broad financial operations</span></li>
                 <li className="flex items-center gap-3"><CheckCircle2 className="text-emerald-400" size={20}/> <span className="font-medium">Admin: Publish digital notice boards</span></li>
                 <li className="flex items-center gap-3"><CheckCircle2 className="text-indigo-400" size={20}/> <span className="font-medium">Resident: Instant payment gateway integration</span></li>
                 <li className="flex items-center gap-3"><CheckCircle2 className="text-indigo-400" size={20}/> <span className="font-medium">Resident: Keep track of religious funds</span></li>
               </ul>

               <SignInButton mode="modal">
                  <button className="bg-white text-slate-900 px-6 py-3 rounded-full font-bold hover:bg-slate-200 transition-colors">Start managing today</button>
               </SignInButton>
            </div>
            <div className="relative">
               <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-3xl transform rotate-3 scale-105 opacity-50 blur-lg"></div>
               <img src="https://images.unsplash.com/photo-1574362848149-11496d93a7c7?q=80&w=2884&auto=format&fit=crop" alt="Dashboard preview" className="relative z-10 rounded-3xl border border-white/10 shadow-2xl object-cover h-[500px] w-full" />
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-slate-200">
         <div className="container mx-auto px-6 max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 text-indigo-700">
               <Building2 size={24} />
               <span className="text-xl font-extrabold tracking-tight text-slate-900">Society <span className="text-indigo-600">SDS</span></span>
            </div>
            <p className="text-slate-500 text-sm">© 2026 Society Management System. All rights reserved.</p>
         </div>
      </footer>
    </div>
  );
}

export default Welcome;
