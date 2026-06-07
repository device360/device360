/**
 * AdminDashboard.tsx — Fully Firebase-integrated version
 */

import { useEffect, useState, useCallback } from 'react';
import {
  RefreshCw, Video, Phone, IndianRupee,
  Plus, Trash2, Edit3, Save, X, Package, Wrench, BarChart3,
  TrendingUp, Users, CheckCircle, AlertCircle, Search, ChevronDown,
  MessageCircle, Menu, Smartphone, Settings, Star, Shield, LogOut,
  ToggleLeft, ToggleRight, ChevronRight, Copy,
  ExternalLink, Zap, Wifi, Download, Clock, Image as ImageIcon,
  Send, Eye, Database,
} from 'lucide-react';
import {
  collection, getDocs, doc, setDoc, updateDoc, deleteDoc, addDoc,
  query, orderBy,
} from 'firebase/firestore';
import { db } from '../firebaseClient';
import type { Lead } from '../types';
import { useNavigate } from 'react-router-dom';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// ─── UTILITIES ───────────────────────────────────────────────────
// CRITICAL FIX: Firestore completely rejects undefined values. 
// This utility forces any undefined fields to null before saving.
const sanitizeForFirestore = (obj: any): any => {
  const sanitized: any = {};
  for (const key in obj) {
    sanitized[key] = obj[key] === undefined ? null : obj[key];
  }
  return sanitized;
};

const slugifyKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

async function apiFetch(path:string,opts?:RequestInit){
  const res=await fetch(`${BACKEND}${path}`,{headers:{'Content-Type':'application/json'},...opts});
  const data=await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data.error||`HTTP ${res.status}`);
  return data;
}

// ─── Types ───────────────────────────────────────────────────────
const STATUS_OPTIONS = ['pending','confirmed','picked_up','in_progress','completed','cancelled'] as const;
type Status = typeof STATUS_OPTIONS[number];
const STATUS_META: Record<Status,{color:string;dot:string;label:string}> = {
  pending:     {color:'bg-amber-50 text-amber-700 border-amber-200',    dot:'bg-amber-400',   label:'Pending'},
  confirmed:   {color:'bg-blue-50 text-blue-700 border-blue-200',       dot:'bg-blue-500',    label:'Confirmed'},
  picked_up:   {color:'bg-violet-50 text-violet-700 border-violet-200', dot:'bg-violet-500',  label:'Picked Up'},
  in_progress: {color:'bg-orange-50 text-orange-700 border-orange-200', dot:'bg-orange-500',  label:'In Progress'},
  completed:   {color:'bg-emerald-50 text-emerald-700 border-emerald-200',dot:'bg-emerald-500',label:'Completed'},
  cancelled:   {color:'bg-red-50 text-red-700 border-red-200',          dot:'bg-red-400',     label:'Cancelled'},
};

interface FirestoreBrand {
  id: string; name: string; color: string;
  models: string[]; modelFileMap: Record<string,string>;
  active?: boolean; sortOrder?: number;
}
interface FirestoreIssue {
  id: string; name: string; icon: string; category: 'live'|'other';
  liveRepair: boolean; description: string; estimatedTime: string; active?: boolean;
}
interface FirestorePricing {
  id: string;
  brandId: string;
  brandName: string | null;
  modelId: string | null;
  modelName: string | null;
  issueId: string;
  name: string;
  price: number;
  oldPrice: number | null;
  time: string;
}
interface SiteSettings {
  businessName:string; phone:string; whatsapp:string; email:string;
  address:string; city:string; pincode:string; repairPromise:string;
  warrantyMonths:number; openTime:string; closeTime:string;
  enableLiveRepair:boolean; enableBooking:boolean;
  socialInstagram:string; socialFacebook:string; socialYoutube:string;
}

type AdminTab = 'bookings'|'catalog'|'pricing'|'whatsapp'|'analytics'|'settings';
const BAR_COLORS = ['from-blue-500 to-blue-400','from-violet-500 to-violet-400','from-emerald-500 to-emerald-400','from-amber-500 to-amber-400','from-pink-500 to-pink-400'];


// ─── Hook: live Firestore brands ──────────────────────────────────

function useFirestoreBrands(){
  const [brands,setBrands]=useState<FirestoreBrand[]>([]);
  const [loading,setLoading]=useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try{
      const snap = await getDocs(collection(db,'brands'));
      setBrands(snap.docs.map(d=>({id:d.id,...d.data()} as FirestoreBrand)));
    }catch(err){
      console.error('brands load failed', err);
    }finally{
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => { void refresh(); }, 30000);
    return () => window.clearInterval(id);
  }, [refresh]);

  return {brands,loading,refresh};
}

function useFirestoreIssues(){
  const [issues,setIssues]=useState<FirestoreIssue[]>([]);
  const [loading,setLoading]=useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try{
      const snap = await getDocs(collection(db,'issues'));
      setIssues(snap.docs.map(d=>({id:d.id,...d.data()} as FirestoreIssue)));
    }catch(err){
      console.error('issues load failed', err);
    }finally{
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => { void refresh(); }, 30000);
    return () => window.clearInterval(id);
  }, [refresh]);

  return {issues,loading,refresh};
}

function useFirestorePricing(){
  const [pricing,setPricing]=useState<FirestorePricing[]>([]);
  const [loading,setLoading]=useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try{
      const snap = await getDocs(collection(db,'pricing'));
      const mapDoc = (docData: any, id: string): FirestorePricing => ({
        id,
        brandId: docData.brandId || '',
        brandName: docData.brandName ?? null,
        // Fallback to legacy fields shown in your screenshot (modelSlug, model)
        modelId: docData.modelId ?? docData.modelSlug ?? null,     
        modelName: docData.modelName ?? docData.model ?? docData.modelLabel ?? null, 
        issueId: docData.issueId || '',
        name: docData.name ?? docData.issueName ?? '',
        price: Number(docData.price || 0),
        oldPrice: docData.oldPrice === null || docData.oldPrice === undefined || docData.oldPrice === '' ? null : Number(docData.oldPrice),
        time: docData.time || '45–60 min',
      });

      const pricingDocs = snap.docs.map(d=>mapDoc(d.data(), d.id));
      pricingDocs.sort((a, b) => {
        const brandA = (a.brandName || a.brandId || '').toLowerCase();
        const brandB = (b.brandName || b.brandId || '').toLowerCase();
        if (brandA !== brandB) return brandA.localeCompare(brandB);
        const modelA = (a.modelName || a.modelId || '').toLowerCase();
        const modelB = (b.modelName || b.modelId || '').toLowerCase();
        if (modelA !== modelB) return modelA.localeCompare(modelB);
        return (a.name || '').localeCompare(b.name || '');
      });
      setPricing(pricingDocs);
    }catch(err){
      console.error('pricing load failed', err);
    }finally{
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => { void refresh(); }, 30000);
    return () => window.clearInterval(id);
  }, [refresh]);

  return {pricing,loading,refresh};
}


// ─── Root Shell ───────────────────────────────────────────────────
export const AdminDashboard: React.FC = () => {
  const [activeTab,setActiveTab]=useState<AdminTab>('bookings');
  const [mobileOpen,setMobileOpen]=useState(false);
  const navigate=useNavigate();

  const tabs:{id:AdminTab;label:string;short:string;icon:React.ElementType}[]=[
    {id:'bookings', label:'Bookings',       short:'Orders',   icon:Package},
    {id:'catalog',  label:'Brands & Models',short:'Catalog',  icon:Database},
    {id:'pricing',  label:'Pricing',        short:'Pricing',  icon:IndianRupee},
    {id:'whatsapp', label:'WhatsApp',       short:'WA',       icon:MessageCircle},
    {id:'analytics',label:'Analytics',      short:'Stats',    icon:BarChart3},
    {id:'settings', label:'Settings',       short:'Settings', icon:Settings},
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 h-14">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-gray-900 text-sm hidden sm:block">Device360 <span className="text-gray-400 font-semibold">Admin</span></span>
            </div>
            <nav className="hidden lg:flex items-center gap-1 ml-4 flex-1">
              {tabs.map(({id,label,icon:Icon})=>(
                <button key={id} onClick={()=>setActiveTab(id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab===id?'bg-blue-600 text-white shadow-md shadow-blue-100':'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
                  <Icon className="w-3.5 h-3.5"/>{label}
                </button>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-2">
              <button onClick={()=>navigate('/technician')} className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-50 border border-orange-100 text-orange-700 text-xs font-bold hover:bg-orange-100 transition-all">
                <Wrench className="w-3.5 h-3.5"/>Tech
              </button>
              <button onClick={()=>{localStorage.removeItem('adminAuth');navigate('/admin/login');}}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold hover:bg-red-100 transition-all">
                <LogOut className="w-3.5 h-3.5"/>Sign out
              </button>
              <button onClick={()=>setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500">
                <Menu className="w-5 h-5"/>
              </button>
            </div>
          </div>
          {/* Mobile menu */}
          {mobileOpen&&(
            <div className="lg:hidden border-t border-gray-100 py-2 space-y-1 pb-3">
              {tabs.map(({id,label,icon:Icon})=>(
                <button key={id} onClick={()=>{setActiveTab(id);setMobileOpen(false);}}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-left transition-all ${activeTab===id?'bg-blue-600 text-white':'text-gray-600 hover:bg-gray-100'}`}>
                  <Icon className="w-4 h-4"/>{label}
                </button>
              ))}
            </div>
          )}
          {/* Mobile bottom bar */}
          <div className="lg:hidden flex border-t border-gray-100 -mx-4">
            {tabs.map(({id,short,icon:Icon})=>(
              <button key={id} onClick={()=>setActiveTab(id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 text-[9px] font-black transition-all ${activeTab===id?'text-blue-600':'text-gray-400'}`}>
                <Icon className={`w-4 h-4 ${activeTab===id?'text-blue-600':'text-gray-400'}`}/>
                {short}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab==='bookings'  && <BookingsTab/>}
        {activeTab==='catalog'   && <CatalogTab/>}
        {activeTab==='pricing'   && <PricingTab/>}
        {activeTab==='whatsapp'  && <WhatsAppTab/>}
        {activeTab==='analytics' && <AnalyticsTab/>}
        {activeTab==='settings'  && <SettingsTab/>}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// BOOKINGS TAB
// ═══════════════════════════════════════════════════════════════════
const BookingsTab: React.FC = () => {
  const [leads,setLeads]=useState<Lead[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [updating,setUpdating]=useState<Record<string,boolean>>({});
  const [videoInputs,setVideoInputs]=useState<Record<string,string>>({});
  const [noteInputs,setNoteInputs]=useState<Record<string,string>>({});
  const [filter,setFilter]=useState<'all'|Status>('all');
  const [search,setSearch]=useState('');
  const [expandedId,setExpandedId]=useState<string|null>(null);
  const [sortBy,setSortBy]=useState<'newest'|'oldest'|'price'>('newest');

  const fetchLeads=useCallback(async()=>{
    setLoading(true);setError('');
    try{const d=await apiFetch('/api/leads');setLeads(d.leads||[]);}
    catch(e:any){setError(e.message);}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{fetchLeads();},[fetchLeads]);

  const updateLead=async(id:string,updates:Partial<Lead>)=>{
    setUpdating(u=>({...u,[id]:true}));
    try{await apiFetch(`/api/leads/${id}`,{method:'PATCH',body:JSON.stringify(updates)});await fetchLeads();}
    catch(e:any){alert(e.message);}
    finally{setUpdating(u=>({...u,[id]:false}));}
  };
  const deleteLead=async(id:string)=>{
    if(!confirm('Delete this booking permanently?'))return;
    try{await apiFetch(`/api/leads/${id}`,{method:'DELETE'});await fetchLeads();}
    catch(e:any){alert(e.message);}
  };
  const exportCSV=()=>{
    const rows=[['ID','Name','Phone','Brand','Model','Issue','Price','Status','Address','Created'],
      ...leads.map(l=>[l.id,l.name,l.phone,l.brand,l.model,l.issue,l.price,l.status,l.address,l.createdAt])];
    const csv=rows.map(r=>r.map(c=>`"${c??''}"`).join(',')).join('\n');
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='bookings.csv';a.click();
  };

  const stats={
    total:leads.length,
    pending:leads.filter(l=>l.status==='pending').length,
    active:leads.filter(l=>['confirmed','picked_up','in_progress'].includes(l.status)).length,
    completed:leads.filter(l=>l.status==='completed').length,
    revenue:leads.filter(l=>l.status==='completed').reduce((s,l)=>s+(l.price||0),0),
  };

  let filtered=(filter==='all'?leads:leads.filter(l=>l.status===filter))
    .filter(l=>!search||[l.name,l.phone,l.id,l.brand,l.model].some(v=>v?.toLowerCase().includes(search.toLowerCase())));
  if(sortBy==='newest') filtered=[...filtered].sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''));
  if(sortBy==='oldest') filtered=[...filtered].sort((a,b)=>(a.createdAt||'').localeCompare(b.createdAt||''));
  if(sortBy==='price')  filtered=[...filtered].sort((a,b)=>(b.price||0)-(a.price||0));

  const buildWAMsg=(lead:Lead)=>{
    const name=lead.name||'Customer';
    const bid=lead.id?.slice(0,8)||'—';
    const device=`${lead.brand||''} ${lead.model||''}`.trim()||'Your device';
    const issue=lead.issue||'Repair';
    const price=lead.price?`₹${lead.price}`:'TBD';
    return encodeURIComponent(
`Hi ${name}! 👋 Your booking with *Device360* is confirmed ✅

📋 *Booking ID:* #${bid}
📱 *Device:* ${device}
🔧 *Service:* ${issue}
💰 *Price:* ${price}
🚀 *Pickup:* Within 60 minutes
🔗 *Track:* ${window.location.origin}/dashboard/${lead.id}

Questions? Reply here or call us! 🙏`);
  };

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {[
          {label:'Total',val:stats.total,icon:Package,col:'text-gray-800',bg:'bg-white',bd:'border-gray-100'},
          {label:'Pending',val:stats.pending,icon:AlertCircle,col:'text-amber-600',bg:'bg-amber-50',bd:'border-amber-100'},
          {label:'Active',val:stats.active,icon:Clock,col:'text-blue-600',bg:'bg-blue-50',bd:'border-blue-100'},
          {label:'Done',val:stats.completed,icon:CheckCircle,col:'text-emerald-600',bg:'bg-emerald-50',bd:'border-emerald-100'},
          {label:'Revenue',val:`₹${stats.revenue.toLocaleString()}`,icon:IndianRupee,col:'text-violet-600',bg:'bg-violet-50',bd:'border-violet-100'},
        ].map(({label,val,icon:Icon,col,bg,bd})=>(
          <div key={label} className={`${bg} rounded-2xl p-4 flex items-center gap-3 border ${bd} shadow-sm`}>
            <div className={`w-9 h-9 rounded-xl ${bg} border ${bd} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-4 h-4 ${col}`}/>
            </div>
            <div className="min-w-0">
              <p className={`text-lg font-black ${col} truncate`}>{val}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"/>
          <input type="text" placeholder="Search name, phone, ID…" value={search} onChange={e=>setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none bg-white"/>
        </div>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value as any)}
          className="px-3 py-2.5 text-xs font-bold border border-gray-200 rounded-xl bg-white text-gray-700 outline-none">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="price">Highest price</option>
        </select>
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['all',...STATUS_OPTIONS] as const).map(s=>(
            <button key={s} onClick={()=>setFilter(s as any)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${filter===s?'bg-blue-600 text-white shadow-md shadow-blue-100':'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'}`}>
              {s==='all'?'All':STATUS_META[s as Status].label}
            </button>
          ))}
        </div>
        <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 text-xs font-bold hover:border-green-300 hover:text-green-700 transition-all">
          <Download className="w-3.5 h-3.5"/> CSV
        </button>
        <button onClick={fetchLeads} disabled={loading} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 text-xs font-bold hover:border-blue-300 hover:text-blue-600 transition-all disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${loading?'animate-spin':''}`}/> Refresh
        </button>
      </div>

      {error&&(
        <div className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0"/>{error}
          <button onClick={fetchLeads} className="ml-auto text-xs font-bold underline">Retry</button>
        </div>
      )}

      {loading&&leads.length===0?(
        <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/></div>
      ):filtered.length===0?(
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <Package className="w-12 h-12 mb-3 opacity-20"/>
          <p className="text-sm font-medium">No bookings found</p>
          {search&&<button onClick={()=>setSearch('')} className="mt-2 text-xs text-blue-500 hover:underline">Clear search</button>}
        </div>
      ):(
        <div className="space-y-2">
          {filtered.map(lead=>{
            const meta=STATUS_META[lead.status as Status]||STATUS_META.pending;
            const isExpanded=expandedId===lead.id;
            return (
              <div key={lead.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex flex-wrap items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50/80 transition-colors"
                  onClick={()=>setExpandedId(isExpanded?null:lead.id)}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-2.5 h-2.5 rounded-full ${meta.dot} flex-shrink-0`}/>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{lead.name}</p>
                      <p className="text-xs text-gray-400 font-mono">#{lead.id?.slice(0,8)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3"/>{lead.phone}</span>
                    <span className="hidden sm:flex items-center gap-1"><Smartphone className="w-3 h-3"/>{lead.brand} {lead.model}</span>
                    <span className="hidden md:flex font-bold text-gray-700">₹{lead.price}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {lead.isLiveRepair&&(
                      <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-black border border-green-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/>LIVE
                      </span>
                    )}
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${meta.color}`}>{meta.label}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform ${isExpanded?'rotate-180':''}`}/>
                  </div>
                </div>
                {isExpanded&&(
                  <div className="border-t border-gray-100 px-5 py-5 bg-gray-50/50 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[{label:'Issue',val:lead.issue},{label:'Price',val:`₹${lead.price}`},{label:'Address',val:lead.address},{label:'Created',val:lead.createdAt?new Date(lead.createdAt).toLocaleDateString():'—'}].map(({label,val})=>(
                        <div key={label}>
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{label}</p>
                          <p className="font-semibold text-gray-800 text-xs leading-relaxed">{val}</p>
                        </div>
                      ))}
                    </div>
                    {/* Quick actions */}
                    <div className="flex gap-2 flex-wrap">
                      <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-all">
                        <Phone className="w-3 h-3"/> Call
                      </a>
                      <a href={`https://wa.me/91${lead.phone?.replace('+91','').replace(/\D/g,'')}?text=${buildWAMsg(lead)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 border border-green-100 text-green-700 text-xs font-bold hover:bg-green-100 transition-all">
                        <MessageCircle className="w-3 h-3"/> WhatsApp
                      </a>
                      <button onClick={()=>navigator.clipboard.writeText(lead.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200 transition-all">
                        <Copy className="w-3 h-3"/> Copy ID
                      </button>
                      <a href={`/dashboard/${lead.id}`} target="_blank"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200 transition-all">
                        <ExternalLink className="w-3 h-3"/> Track Page
                      </a>
                    </div>
                    {/* Edit panel */}
                    <div className="flex flex-wrap items-end gap-4 p-4 bg-white rounded-2xl border border-gray-100">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</label>
                        <select value={lead.status} onChange={e=>updateLead(lead.id,{status:e.target.value as any})} disabled={updating[lead.id]}
                          className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 focus:border-blue-400 outline-none disabled:opacity-50 bg-white">
                          {STATUS_OPTIONS.map(s=><option key={s} value={s}>{STATUS_META[s].label}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Price (₹)</label>
                        <input type="number" defaultValue={lead.price}
                          onBlur={e=>{const v=parseInt(e.target.value);if(!isNaN(v)&&v!==lead.price)updateLead(lead.id,{price:v});}}
                          className="w-28 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 focus:border-blue-400 outline-none bg-white"/>
                      </div>
                      <div className="space-y-1 flex-1 min-w-48">
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Technician Note</label>
                        <div className="flex gap-2">
                          <input type="text" placeholder="Add internal note…"
                            value={noteInputs[lead.id]??lead.technicianNote??''}
                            onChange={e=>setNoteInputs(n=>({...n,[lead.id]:e.target.value}))}
                            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-blue-400 bg-white"/>
                          <button onClick={()=>updateLead(lead.id,{technicianNote:noteInputs[lead.id]})} disabled={updating[lead.id]}
                            className="px-3 py-2 rounded-xl bg-gray-700 text-white text-xs font-bold hover:bg-gray-800 disabled:opacity-50 transition-all">
                            <Save className="w-3 h-3"/>
                          </button>
                        </div>
                      </div>
                      {lead.isLiveRepair&&(
                        <div className="space-y-1 flex-1 min-w-52">
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Live Video URL</label>
                          <div className="flex gap-2">
                            <input type="url" placeholder="Paste YouTube/Meet link…"
                              value={videoInputs[lead.id]??lead.videoLink??''}
                              onChange={e=>setVideoInputs(v=>({...v,[lead.id]:e.target.value}))}
                              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-blue-400 bg-white"/>
                            <button onClick={()=>updateLead(lead.id,{videoLink:videoInputs[lead.id]||null})}
                              disabled={updating[lead.id]||!videoInputs[lead.id]}
                              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 disabled:opacity-50 transition-all">
                              <Video className="w-3 h-3"/> Set
                            </button>
                          </div>
                        </div>
                      )}
                      <button onClick={()=>deleteLead(lead.id)}
                        className="px-3 py-2 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold hover:bg-red-100 transition-all flex items-center gap-1.5 self-end">
                        <Trash2 className="w-3 h-3"/> Delete
                      </button>
                      {updating[lead.id]&&<span className="text-xs text-blue-500 font-bold animate-pulse flex items-center gap-1 self-end"><RefreshCw className="w-3 h-3 animate-spin"/> Saving…</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════
// CATALOG TAB 
// ═══════════════════════════════════════════════════════════════════
const CatalogTab: React.FC = () => {
  const {brands,loading:bLoading}=useFirestoreBrands();
  const {issues,loading:iLoading}=useFirestoreIssues();
  const [section,setSection]=useState<'brands'|'issues'>('brands');
  const [activeBrand,setActiveBrand]=useState<FirestoreBrand|null>(null);
  const [saving,setSaving]=useState(false);

  // Brand form
  const [newBrandName,setNewBrandName]=useState('');
  const [newBrandColor,setNewBrandColor]=useState('#3b82f6');
  const [newModel,setNewModel]=useState('');

  // Issue form
  const [newIssueName,setNewIssueName]=useState('');
  const [newIssueDesc,setNewIssueDesc]=useState('');
  const [newIssueTime,setNewIssueTime]=useState('45–60 min');
  const [newIssueCat,setNewIssueCat]=useState<'live'|'other'>('live');
  const [newIssueIcon,setNewIssueIcon]=useState('Wrench');

  // ── Brand CRUD ────────────────────────────────────────────────
  const addBrand=async()=>{
    if(!newBrandName.trim()){alert('Enter a brand name');return;}
    setSaving(true);
    const id=newBrandName.toLowerCase().replace(/[^a-z0-9]+/g,'-');
    await setDoc(doc(db,'brands',id), sanitizeForFirestore({
      id,name:newBrandName.trim(),color:newBrandColor,
      models:[],modelFileMap:{},active:true,sortOrder:brands.length,
    }));
    setNewBrandName('');setSaving(false);
  };
  const toggleBrand=async(brand:FirestoreBrand)=>{
    await updateDoc(doc(db,'brands',brand.id), sanitizeForFirestore({active:!(brand.active!==false)}));
  };
  const deleteBrand=async(brand:FirestoreBrand)=>{
    if(!confirm(`Delete brand "${brand.name}"? This won't delete its pricing.`))return;
    await deleteDoc(doc(db,'brands',brand.id));
    if(activeBrand?.id===brand.id)setActiveBrand(null);
  };

  // ── Model CRUD ────────────────────────────────────────────────
  const addModel=async()=>{
    if(!activeBrand||!newModel.trim())return;
    setSaving(true);
    const updated={...activeBrand,models:[...activeBrand.models,newModel.trim()]};
    await updateDoc(doc(db,'brands',activeBrand.id), sanitizeForFirestore({models:updated.models}));
    setActiveBrand(updated);setNewModel('');setSaving(false);
  };
  const removeModel=async(m:string)=>{
    if(!activeBrand)return;
    const updated={...activeBrand,models:activeBrand.models.filter(x=>x!==m)};
    await updateDoc(doc(db,'brands',activeBrand.id), sanitizeForFirestore({models:updated.models}));
    setActiveBrand(updated);
  };

  // ── Issue CRUD ────────────────────────────────────────────────
  const addIssue=async()=>{
    if(!newIssueName.trim()){alert('Enter an issue name');return;}
    setSaving(true);
    const id=newIssueName.toLowerCase().replace(/[^a-z0-9]+/g,'_');
    await setDoc(doc(db,'issues',id), sanitizeForFirestore({
      id,name:newIssueName.trim(),description:newIssueDesc,
      icon:newIssueIcon,category:newIssueCat,liveRepair:newIssueCat==='live',
      estimatedTime:newIssueTime,active:true,
    }));
    setNewIssueName('');setNewIssueDesc('');setSaving(false);
  };
  const toggleIssue=async(issue:FirestoreIssue)=>{
    await updateDoc(doc(db,'issues',issue.id), sanitizeForFirestore({active:!(issue.active!==false)}));
  };
  const deleteIssue=async(issue:FirestoreIssue)=>{
    if(!confirm(`Delete issue "${issue.name}"?`))return;
    await deleteDoc(doc(db,'issues',issue.id));
  };

  const loading=bLoading||iLoading;

  useEffect(()=>{
    if(activeBrand){
      const fresh=brands.find(b=>b.id===activeBrand.id);
      if(fresh)setActiveBrand(fresh);
    }
  },[brands]);

  if(loading)return<div className="flex items-center justify-center py-24"><div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-gray-900">Brands, Models & Issues</h2>
          <p className="text-sm text-gray-400 mt-0.5">Changes sync instantly to the customer-facing booking flow</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 text-green-700 text-xs font-bold border border-green-100">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>Live sync
          </span>
          <button onClick={()=>setSection('brands')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${section==='brands'?'bg-blue-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'}`}>
            Brands & Models
          </button>
          <button onClick={()=>setSection('issues')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${section==='issues'?'bg-blue-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'}`}>
            Issue Types
          </button>
        </div>
      </div>

      {/* ── BRANDS SECTION ── */}
      {section==='brands'&&(
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 space-y-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <p className="text-xs font-black text-gray-700 uppercase tracking-widest">Brands ({brands.length})</p>
                <span className="text-xs text-gray-400">{brands.filter(b=>b.active!==false).length} active</span>
              </div>
              <div className="divide-y divide-gray-50 max-h-[420px] overflow-y-auto">
                {brands.sort((a,b)=>(a.sortOrder??0)-(b.sortOrder??0)).map(brand=>(
                  <div key={brand.id}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all hover:bg-gray-50 ${activeBrand?.id===brand.id?'bg-blue-50 border-l-4 border-blue-500':''}`}
                    onClick={()=>setActiveBrand(brand)}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-black"
                      style={{backgroundColor:brand.color||'#6366f1'}}>
                      {brand.name.slice(0,2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm">{brand.name}</p>
                      <p className="text-xs text-gray-400">{brand.models.length} models</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={e=>{e.stopPropagation();toggleBrand(brand);}}>
                        {brand.active!==false?<ToggleRight className="w-5 h-5 text-blue-600"/>:<ToggleLeft className="w-5 h-5 text-gray-300"/>}
                      </button>
                      <button onClick={e=>{e.stopPropagation();deleteBrand(brand);}} className="p-1 rounded-lg hover:bg-red-50 text-red-300 hover:text-red-600 transition-all">
                        <Trash2 className="w-3.5 h-3.5"/>
                      </button>
                      <ChevronRight className={`w-4 h-4 ${activeBrand?.id===brand.id?'text-blue-500':'text-gray-300'}`}/>
                    </div>
                  </div>
                ))}
                {brands.length===0&&<p className="text-center text-xs text-gray-400 py-8">No brands yet. Add one below.</p>}
              </div>
              <div className="px-4 py-3 border-t border-gray-100 space-y-2">
                <div className="flex gap-2">
                  <input type="text" placeholder="New brand name…" value={newBrandName} onChange={e=>setNewBrandName(e.target.value)}
                    onKeyDown={e=>e.key==='Enter'&&addBrand()}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-blue-400 outline-none"/>
                  <input type="color" value={newBrandColor} onChange={e=>setNewBrandColor(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer p-1"/>
                  <button onClick={addBrand} disabled={saving||!newBrandName.trim()}
                    className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50 transition-all">
                    <Plus className="w-4 h-4"/>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {activeBrand?(
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm"
                      style={{backgroundColor:activeBrand.color||'#6366f1'}}>
                      {activeBrand.name.slice(0,2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-sm">{activeBrand.name}</p>
                      <p className="text-xs text-gray-400">{activeBrand.models.length} models — click × to remove</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold flex items-center gap-1 ${activeBrand.active!==false?'text-green-600':'text-gray-400'}`}>
                    <span className={`w-2 h-2 rounded-full ${activeBrand.active!==false?'bg-green-500':'bg-gray-300'}`}/>
                    {activeBrand.active!==false?'Visible on site':'Hidden'}
                  </span>
                </div>
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto">
                  {activeBrand.models.map(model=>(
                    <div key={model} className="flex items-center justify-between gap-1 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 group hover:border-red-200 transition-all">
                      <span className="text-xs font-semibold text-gray-800 truncate">{model}</span>
                      <button onClick={()=>removeModel(model)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-red-400 hover:text-red-600 transition-all flex-shrink-0">
                        <X className="w-3 h-3"/>
                      </button>
                    </div>
                  ))}
                  {activeBrand.models.length===0&&(
                    <p className="col-span-3 text-xs text-gray-400 text-center py-6">No models yet — add one below</p>
                  )}
                </div>
                <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                  <div className="flex gap-2">
                    <input type="text" placeholder={`Add ${activeBrand.name} model (e.g. Galaxy S25 Ultra)…`}
                      value={newModel} onChange={e=>setNewModel(e.target.value)}
                      onKeyDown={e=>e.key==='Enter'&&addModel()}
                      className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-50 outline-none"/>
                    <button onClick={addModel} disabled={saving||!newModel.trim()}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-1.5">
                      <Plus className="w-4 h-4"/> Add
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Model appears instantly on the customer booking page ✓</p>
                </div>
              </div>
            ):(
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center h-64 text-gray-400">
                <div className="text-center">
                  <Smartphone className="w-8 h-8 mx-auto mb-2 opacity-30"/>
                  <p className="text-sm">Select a brand to manage its models</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ISSUES SECTION ── */}
      {section==='issues'&&(
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
            <h3 className="font-black text-blue-900 text-sm mb-4">Add New Issue Type</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Issue Name *</label>
                <input type="text" placeholder="e.g. Screen Replacement" value={newIssueName} onChange={e=>setNewIssueName(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-blue-200 rounded-xl outline-none bg-white focus:border-blue-500"/>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Description</label>
                <input type="text" placeholder="Cracked, broken display…" value={newIssueDesc} onChange={e=>setNewIssueDesc(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-blue-200 rounded-xl outline-none bg-white"/>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Est. Time</label>
                <input type="text" placeholder="45–60 min" value={newIssueTime} onChange={e=>setNewIssueTime(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-blue-200 rounded-xl outline-none bg-white"/>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Category</label>
                <select value={newIssueCat} onChange={e=>setNewIssueCat(e.target.value as any)}
                  className="w-full px-3 py-2.5 text-sm border border-blue-200 rounded-xl outline-none bg-white font-semibold">
                  <option value="live">🔴 LIVE Repair (fast, video stream)</option>
                  <option value="other">🔧 Standard Repair</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Icon (lucide name)</label>
                <input type="text" placeholder="Monitor, Battery, Camera…" value={newIssueIcon} onChange={e=>setNewIssueIcon(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-blue-200 rounded-xl outline-none bg-white"/>
              </div>
            </div>
            <button onClick={addIssue} disabled={saving||!newIssueName.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all">
              {saving?<RefreshCw className="w-4 h-4 animate-spin"/>:<Plus className="w-4 h-4"/>}
              Add Issue Type
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <p className="text-xs font-black text-gray-700 uppercase tracking-widest">Issue Types ({issues.length})</p>
            </div>
            <div className="divide-y divide-gray-50">
              {issues.map(issue=>(
                <div key={issue.id} className={`flex items-center gap-4 px-5 py-4 ${issue.active===false?'opacity-50':''}`}>
                  <div className={`px-2 py-1 rounded-full text-[10px] font-black border flex-shrink-0 ${issue.category==='live'?'bg-red-50 text-red-700 border-red-200':'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {issue.category==='live'?'LIVE':'STD'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm">{issue.name}</p>
                    <p className="text-xs text-gray-400 truncate">{issue.description} · {issue.estimatedTime}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={()=>toggleIssue(issue)}>
                      {issue.active!==false?<ToggleRight className="w-6 h-6 text-blue-600"/>:<ToggleLeft className="w-6 h-6 text-gray-300"/>}
                    </button>
                    <button onClick={()=>deleteIssue(issue)} className="p-1.5 rounded-xl hover:bg-red-50 text-red-300 hover:text-red-600 transition-all">
                      <Trash2 className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                </div>
              ))}
              {issues.length===0&&<p className="text-center text-xs text-gray-400 py-12">No issues yet. Add one above.</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════
// PRICING TAB
// ═══════════════════════════════════════════════════════════════════
const PricingTab: React.FC = () => {
  const {brands}=useFirestoreBrands();
  const {issues}=useFirestoreIssues();
  const {pricing,loading,refresh:refreshPricing}=useFirestorePricing();
  const [filterBrand,setFilterBrand]=useState('all');
  const [saving,setSaving]=useState(false);
  const [editId,setEditId]=useState<string|null>(null);
  const [editData,setEditData]=useState<Partial<FirestorePricing>>({});

  const [newBrandId,setNewBrandId]=useState('');
  const [newModelName,setNewModelName]=useState('');
  const [newIssueId,setNewIssueId]=useState('');
  const [newPrice,setNewPrice]=useState('');
  const [newOldPrice,setNewOldPrice]=useState('');
  const [newTime,setNewTime]=useState('45–60 min');
  const [showAdd,setShowAdd]=useState(false);

  const selectedBrand = brands.find(b=>b.id===newBrandId);
  const selectedBrandModels = selectedBrand?.models || [];

  const addPricing=async()=>{
    if(!newBrandId||!newModelName.trim()||!newIssueId||!newPrice){
      alert('Brand, Model, Issue and Price are required');
      return;
    }

    setSaving(true);
    const brand = brands.find(b=>b.id===newBrandId);
    const issue = issues.find(i=>i.id===newIssueId);

    if(!brand||!issue){
      alert('Brand or issue not found');
      setSaving(false);
      return;
    }

    const payloadId = `${newBrandId}__${slugifyKey(newModelName)}__${newIssueId}`;
    
    const payload = {
      id: payloadId,
      brandId: newBrandId,
      brandName: brand.name || null,
      modelId: slugifyKey(newModelName),
      modelName: newModelName.trim(),
      issueId: newIssueId,
      name: issue.name || null,
      price: Number(newPrice),
      oldPrice: newOldPrice ? Number(newOldPrice) : null,
      time: newTime || '45–60 min',
    };

    await setDoc(doc(db,'pricing',payload.id), sanitizeForFirestore(payload));

    setNewBrandId('');
    setNewModelName('');
    setNewIssueId('');
    setNewPrice('');
    setNewOldPrice('');
    setNewTime('45–60 min');
    setShowAdd(false);
    setSaving(false);
    await refreshPricing();
  };

  const savePricing=async(item:FirestorePricing)=>{
    setSaving(true);
    
    // Explicitly construct object to prevent state bleed
    const rawPayload: Record<string, any> = {
      id: item.id,
      brandId: editData.brandId ?? item.brandId ?? '',
      brandName: editData.brandName ?? item.brandName ?? null,
      modelId: editData.modelId ?? item.modelId ?? null,
      modelName: editData.modelName ?? item.modelName ?? null,
      issueId: editData.issueId ?? item.issueId ?? '',
      name: editData.name ?? item.name ?? '',
      price: Number(editData.price ?? item.price ?? 0),
      oldPrice: editData.oldPrice !== undefined ? editData.oldPrice : (item.oldPrice ?? null),
      time: editData.time ?? item.time ?? '45–60 min',
    };

    try {
      // Pass it through our sanitizer to ensure 0 undefined properties exist
      await setDoc(doc(db,'pricing',item.id), sanitizeForFirestore(rawPayload), { merge: true });
      setEditId(null);
      setEditData({});
      await refreshPricing();
    } catch(err) {
      console.error('Save failed:', err);
      alert('Failed to save pricing: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const deletePricing=async(id:string)=>{
    if(!confirm('Delete this pricing entry?'))return;
    setSaving(true);
    try{
      await deleteDoc(doc(db,'pricing',id));
      await refreshPricing();
    }catch(err){
      console.error('pricing delete failed', err);
      alert('Unable to delete pricing right now.');
    }finally{
      setSaving(false);
    }
  };

  const filtered=filterBrand==='all'?pricing:pricing.filter(p=>p.brandId===filterBrand);

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-gray-900">Repair Pricing</h2>
          <p className="text-sm text-gray-400 mt-0.5">{pricing.length} entries · changes sync instantly to booking flow</p>
        </div>
        <button onClick={()=>setShowAdd(!showAdd)} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
          <Plus className="w-4 h-4"/> Add Pricing
        </button>
      </div>

      {showAdd&&(
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-blue-900 text-sm">New Pricing Entry</h3>
            <button onClick={()=>setShowAdd(false)} className="p-1.5 rounded-xl hover:bg-blue-100 text-blue-400"><X className="w-4 h-4"/></button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
            <div className="space-y-1 lg:col-span-2">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Brand *</label>
              <select
                value={newBrandId}
                onChange={e=>{
                  setNewBrandId(e.target.value);
                  setNewModelName('');
                }}
                className="w-full px-3 py-2.5 text-sm border border-blue-200 rounded-xl outline-none bg-white"
              >
                <option value="">Select brand</option>
                {brands.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
              </select>

              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mt-3">Model *</label>
              <select
                value={newModelName}
                onChange={e=>setNewModelName(e.target.value)}
                disabled={!newBrandId}
                className="w-full px-3 py-2.5 text-sm border border-blue-200 rounded-xl outline-none bg-white disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">{newBrandId ? 'Select model' : 'Select brand first'}</option>
                {selectedBrandModels.map(model=><option key={model} value={model}>{model}</option>)}
              </select>
            </div>
            <div className="space-y-1 lg:col-span-2">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Issue *</label>
              <select value={newIssueId} onChange={e=>setNewIssueId(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-blue-200 rounded-xl outline-none bg-white">
                <option value="">Select issue</option>
                {issues.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Price ₹ *</label>
              <input type="number" placeholder="1999" value={newPrice} onChange={e=>setNewPrice(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-blue-200 rounded-xl outline-none bg-white"/>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Old Price ₹</label>
              <input type="number" placeholder="2999" value={newOldPrice} onChange={e=>setNewOldPrice(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-blue-200 rounded-xl outline-none bg-white"/>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Time</label>
              <input type="text" placeholder="45–60 min" value={newTime} onChange={e=>setNewTime(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-blue-200 rounded-xl outline-none bg-white"/>
            </div>
          </div>
          <button onClick={addPricing} disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all">
            {saving?<RefreshCw className="w-3.5 h-3.5 animate-spin"/>:<Save className="w-3.5 h-3.5"/>}
            {saving?'Saving…':'Save Pricing'}
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={()=>setFilterBrand('all')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filterBrand==='all'?'bg-blue-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'}`}>
          All ({pricing.length})
        </button>
        {brands.map(b=>{
          const cnt=pricing.filter(p=>p.brandId===b.id).length;
          return(
            <button key={b.id} onClick={()=>setFilterBrand(b.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filterBrand===b.id?'bg-blue-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'}`}>
              {b.name} ({cnt})
            </button>
          );
        })}
      </div>

      {loading?(
        <div className="flex items-center justify-center py-20"><div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/></div>
      ):(
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Brand','Issue','Price ₹','Old Price ₹','Time','Actions'].map(h=>(
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p=>{
                  const isEditing=editId===p.id;
                  return(
                    <tr key={p.id} className={isEditing?'bg-blue-50':'hover:bg-gray-50 transition-colors'}>
                      {isEditing?(
                        <>
                          <td className="px-4 py-3 font-bold text-gray-900">{brands.find(b=>b.id===p.brandId)?.name||p.brandName||p.brandId}</td>
                          <td className="px-4 py-3 text-gray-700">
                            <div className="font-semibold text-gray-900">{p.modelName||p.modelId||'—'}</div>
                            <div className="text-[11px] text-gray-400">{p.name}</div>
                          </td>
                          <td className="px-3 py-2"><input type="number" value={editData.price??p.price} onChange={e=>setEditData(d=>({...d,price:Number(e.target.value)}))} className="w-24 px-2 py-1.5 text-xs border border-blue-300 rounded-lg outline-none bg-white font-bold"/></td>
                          <td className="px-3 py-2"><input type="number" value={editData.oldPrice??p.oldPrice??''} onChange={e=>setEditData(d=>({...d,oldPrice:e.target.value?Number(e.target.value):null}))} className="w-24 px-2 py-1.5 text-xs border border-blue-300 rounded-lg outline-none bg-white"/></td>
                          <td className="px-3 py-2"><input value={editData.time??p.time} onChange={e=>setEditData(d=>({...d,time:e.target.value}))} className="w-24 px-2 py-1.5 text-xs border border-blue-300 rounded-lg outline-none bg-white"/></td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1.5">
                              <button onClick={()=>savePricing(p)} disabled={saving} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50"><Save className="w-3 h-3"/>Save</button>
                              <button onClick={()=>{setEditId(null);setEditData({});}} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500"><X className="w-3.5 h-3.5"/></button>
                            </div>
                          </td>
                        </>
                      ):(
                        <>
                          <td className="px-4 py-3 font-bold text-gray-900">{brands.find(b=>b.id===p.brandId)?.name||p.brandName||p.brandId}</td>
                          <td className="px-4 py-3 text-gray-700">
                            <div className="font-semibold text-gray-900">{p.modelName||p.modelId||'—'}</div>
                            <div className="text-[11px] text-gray-400">{p.name}</div>
                          </td>
                          <td className="px-4 py-3 font-black text-emerald-700">₹{p.price?.toLocaleString()}</td>
                          <td className="px-4 py-3 text-gray-400 line-through text-xs">{p.oldPrice?`₹${p.oldPrice.toLocaleString()}`:'—'}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{p.time}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button onClick={()=>{
                                setEditId(p.id);
                                setEditData({
                                  price: p.price,
                                  oldPrice: p.oldPrice,
                                  time: p.time,
                                  brandId: p.brandId,
                                  issueId: p.issueId,
                                  name: p.name,
                                  brandName: p.brandName,
                                  modelId: p.modelId,
                                  modelName: p.modelName
                                });
                              }} className="p-1.5 rounded-xl hover:bg-blue-50 text-blue-400 hover:text-blue-700 transition-all"><Edit3 className="w-3.5 h-3.5"/></button>
                              <button onClick={()=>deletePricing(p.id)} className="p-1.5 rounded-xl hover:bg-red-50 text-red-300 hover:text-red-600 transition-all"><Trash2 className="w-3.5 h-3.5"/></button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length===0&&<div className="text-center py-12 text-gray-400 text-sm">No pricing entries found.</div>}
          </div>
        </div>
      )}
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════
// WHATSAPP TAB
// ═══════════════════════════════════════════════════════════════════
const WA_TEMPLATES = [
  {
    id:'booking_confirmed',
    label:'✅ Booking Confirmed',
    color:'bg-green-50 border-green-200 text-green-800',
    build:(l:Lead)=>`Hi ${l.name}! 👋 Your repair booking is *confirmed* ✅

📋 *Booking ID:* #${l.id?.slice(0,8)}
📱 *Device:* ${l.brand} ${l.model}
🔧 *Service:* ${l.issue}
💰 *Price:* ₹${l.price}
🚀 *Pickup:* Within 60 minutes
📍 *Address:* ${l.address}

🔗 *Track your repair:*
${window.location.origin}/dashboard/${l.id}

Pay only after repair is done ✓
Questions? Reply here! 🙏`,
  },
  {
    id:'pickup_done',
    label:'🛵 Device Picked Up',
    color:'bg-violet-50 border-violet-200 text-violet-800',
    build:(l:Lead)=>`Hi ${l.name}! 📦 We've picked up your *${l.brand} ${l.model}*.

Our technician has it and repair is starting now.

🔧 *Issue:* ${l.issue}
⏱ *Expected time:* ${l.issue?.toLowerCase().includes('screen')||l.issue?.toLowerCase().includes('battery')?'45-60 min':'2-4 hours'}

🔗 Track live: ${window.location.origin}/dashboard/${l.id}

We'll message you when it's ready! 🙌`,
  },
  {
    id:'repair_done',
    label:'🎉 Repair Complete',
    color:'bg-emerald-50 border-emerald-200 text-emerald-800',
    build:(l:Lead)=>`Hi ${l.name}! 🎉 Great news — your *${l.brand} ${l.model}* is *repaired!*

✅ *${l.issue}* — Done
💰 *Amount:* ₹${l.price}
🛡 *Warranty:* 6 months on parts & labour

We're on our way to deliver it back to you.
Please keep ₹${l.price} ready for payment.

Thank you for choosing Device360! ⭐`,
  },
  {
    id:'reminder',
    label:'🔔 Follow-up Reminder',
    color:'bg-amber-50 border-amber-200 text-amber-800',
    build:(l:Lead)=>`Hi ${l.name}! 👋 Just checking in on your Device360 booking.

📋 *Booking ID:* #${l.id?.slice(0,8)}
📊 *Status:* ${l.status?.replace(/_/g,' ').toUpperCase()}

🔗 View full status: ${window.location.origin}/dashboard/${l.id}

Need help? Reply here or call us! 📞`,
  },
  {
    id:'custom',
    label:'✏️ Custom Message',
    color:'bg-blue-50 border-blue-200 text-blue-800',
    build:(l:Lead)=>`Hi ${l.name}! 👋\n\n[Your message here]\n\nDevice360 Team`,
  },
];

const WhatsAppTab: React.FC = () => {
  const [leads,setLeads]=useState<Lead[]>([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState('');
  const [selectedLead,setSelectedLead]=useState<Lead|null>(null);
  const [selectedTemplate,setSelectedTemplate]=useState(WA_TEMPLATES[0].id);
  const [customMsg,setCustomMsg]=useState('');
  const [previewMode,setPreviewMode]=useState(false);

  useEffect(()=>{
    apiFetch('/api/leads').then(d=>setLeads(d.leads||[])).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  const template=WA_TEMPLATES.find(t=>t.id===selectedTemplate)||WA_TEMPLATES[0];
  const builtMsg=selectedLead?(selectedTemplate==='custom'?customMsg:template.build(selectedLead)):'';
  const waUrl=selectedLead?`https://wa.me/91${selectedLead.phone?.replace('+91','').replace(/\D/g,'')}?text=${encodeURIComponent(builtMsg)}`:'';

  const filteredLeads=leads.filter(l=>!search||[l.name,l.phone,l.id].some(v=>v?.toLowerCase().includes(search.toLowerCase())));

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-black text-gray-900">WhatsApp Messenger</h2>
        <p className="text-sm text-gray-400 mt-0.5">Send templated messages to customers — opens WhatsApp Web with pre-filled text</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <p className="text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Select Customer</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"/>
                <input type="text" placeholder="Search name or phone…" value={search} onChange={e=>setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:border-blue-400 outline-none bg-white"/>
              </div>
            </div>
            <div className="divide-y divide-gray-50 max-h-[420px] overflow-y-auto">
              {loading&&<div className="flex items-center justify-center py-8"><div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"/></div>}
              {filteredLeads.map(lead=>{
                const meta=STATUS_META[lead.status as Status]||STATUS_META.pending;
                return(
                  <button key={lead.id} onClick={()=>setSelectedLead(lead)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-gray-50 ${selectedLead?.id===lead.id?'bg-green-50 border-l-4 border-green-500':''}`}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${meta.dot}`}/>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-xs">{lead.name}</p>
                      <p className="text-[10px] text-gray-400">{lead.phone} · {lead.brand} {lead.model}</p>
                    </div>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border ${meta.color}`}>{meta.label}</span>
                  </button>
                );
              })}
              {filteredLeads.length===0&&!loading&&<p className="text-center text-xs text-gray-400 py-8">No customers found</p>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-black text-gray-700 uppercase tracking-widest mb-3">Message Template</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {WA_TEMPLATES.map(t=>(
                <button key={t.id} onClick={()=>setSelectedTemplate(t.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border text-left transition-all ${selectedTemplate===t.id?t.color+' ring-2 ring-offset-1 ring-green-400':t.color+' opacity-60 hover:opacity-100'}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {selectedTemplate==='custom'&&(
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Your Message</label>
              <textarea value={customMsg} onChange={e=>setCustomMsg(e.target.value)} rows={6} placeholder="Type your custom message here…"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-green-400 resize-none"/>
            </div>
          )}

          {selectedLead&&builtMsg&&(
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-gray-700">Preview → {selectedLead.name}</p>
                  <p className="text-[10px] text-gray-400">+91 {selectedLead.phone?.replace('+91','').replace(/\D/g,'')}</p>
                </div>
                <button onClick={()=>setPreviewMode(!previewMode)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200 transition-all">
                  <Eye className="w-3.5 h-3.5"/>{previewMode?'Raw':'Preview'}
                </button>
              </div>
              <div className="p-4">
                {previewMode?(
                  <div className="bg-[#e9fbe5] rounded-2xl rounded-tl-sm px-4 py-3 max-w-sm ml-auto">
                    <p className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">{builtMsg}</p>
                    <p className="text-[9px] text-gray-400 text-right mt-1">12:00 PM ✓✓</p>
                  </div>
                ):(
                  <pre className="text-xs text-gray-600 bg-gray-50 rounded-xl p-3 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">{builtMsg}</pre>
                )}
              </div>
              <div className="px-4 pb-4">
                <a href={waUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-[#25D366] text-white font-black text-sm hover:bg-[#1fb855] shadow-lg shadow-green-200 transition-all active:scale-95">
                  <MessageCircle className="w-5 h-5"/>
                  Open in WhatsApp
                </a>
                <p className="text-center text-xs text-gray-400 mt-2">Opens WhatsApp Web with message pre-filled</p>
              </div>
            </div>
          )}

          {!selectedLead&&(
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center h-40 text-gray-400">
              <div className="text-center">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-20"/>
                <p className="text-sm">Select a customer to compose a message</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════
// ANALYTICS TAB
// ═══════════════════════════════════════════════════════════════════
const AnalyticsTab: React.FC = () => {
  const [leads,setLeads]=useState<Lead[]>([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{apiFetch('/api/leads').then(d=>setLeads(d.leads||[])).catch(()=>{}).finally(()=>setLoading(false));},[]);
  if(loading)return<div className="flex items-center justify-center py-24"><div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/></div>;

  const completed=leads.filter(l=>l.status==='completed');
  const revenue=completed.reduce((s,l)=>s+(l.price||0),0);
  const avgOrder=completed.length?Math.round(revenue/completed.length):0;
  const issueMap:Record<string,number>={};leads.forEach(l=>{if(l.issue)issueMap[l.issue]=(issueMap[l.issue]||0)+1;});
  const topIssues=Object.entries(issueMap).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const totalIssues=Object.values(issueMap).reduce((a,b)=>a+b,0)||1;
  const brandMap:Record<string,number>={};leads.forEach(l=>{if(l.brand)brandMap[l.brand]=(brandMap[l.brand]||0)+1;});
  const topBrands=Object.entries(brandMap).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const totalBrands=Object.values(brandMap).reduce((a,b)=>a+b,0)||1;
  const statusMap:Record<string,number>={};leads.forEach(l=>{statusMap[l.status]=(statusMap[l.status]||0)+1;});

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div><h2 className="text-xl font-black text-gray-900">Analytics</h2><p className="text-sm text-gray-400 mt-0.5">Live data from your bookings</p></div>
        <span className="px-3 py-1.5 rounded-xl bg-green-50 text-green-700 text-xs font-bold border border-green-100 flex items-center gap-1.5"><Wifi className="w-3 h-3"/> Live</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          {label:'Total Bookings',val:leads.length,icon:Package,col:'text-blue-600',bg:'bg-blue-50',bd:'border-blue-100'},
          {label:'Total Revenue',val:`₹${revenue.toLocaleString()}`,icon:IndianRupee,col:'text-emerald-600',bg:'bg-emerald-50',bd:'border-emerald-100'},
          {label:'Avg Order',val:`₹${avgOrder.toLocaleString()}`,icon:TrendingUp,col:'text-violet-600',bg:'bg-violet-50',bd:'border-violet-100'},
          {label:'Completed',val:completed.length,icon:CheckCircle,col:'text-amber-600',bg:'bg-amber-50',bd:'border-amber-100'},
        ].map(({label,val,icon:Icon,col,bg,bd})=>(
          <div key={label} className={`${bg} rounded-2xl p-4 border ${bd} shadow-sm`}>
            <div className={`w-8 h-8 rounded-xl ${bg} border ${bd} flex items-center justify-center mb-3`}><Icon className={`w-4 h-4 ${col}`}/></div>
            <p className={`text-2xl font-black ${col}`}>{val}</p>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">{label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-black text-gray-900 text-sm mb-5">Top Issues</h3>
          <div className="space-y-3.5">
            {topIssues.length===0&&<p className="text-xs text-gray-400">No data yet</p>}
            {topIssues.map(([name,count],i)=>{const pct=Math.round((count/totalIssues)*100);return(
              <div key={name}><div className="flex items-center justify-between mb-1.5"><span className="text-xs text-gray-700 font-bold truncate flex-1 mr-2">{name}</span><span className="text-xs text-gray-400 flex-shrink-0">{count} ({pct}%)</span></div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full bg-gradient-to-r ${BAR_COLORS[i%BAR_COLORS.length]} rounded-full`} style={{width:`${pct}%`}}/></div></div>
            );})}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-black text-gray-900 text-sm mb-5">Repairs by Brand</h3>
          <div className="space-y-3.5">
            {topBrands.length===0&&<p className="text-xs text-gray-400">No data yet</p>}
            {topBrands.map(([name,count],i)=>{const pct=Math.round((count/totalBrands)*100);return(
              <div key={name}><div className="flex items-center justify-between mb-1.5"><span className="text-xs text-gray-700 font-bold">{name}</span><span className="text-xs text-gray-400">{count} ({pct}%)</span></div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full bg-gradient-to-r ${BAR_COLORS[i]} rounded-full`} style={{width:`${pct}%`}}/></div></div>
            );})}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-black text-gray-900 text-sm mb-5">Status Breakdown</h3>
          <div className="space-y-2">
            {STATUS_OPTIONS.map(s=>{const count=statusMap[s]||0;const pct=Math.round((count/(leads.length||1))*100);const meta=STATUS_META[s];return(
              <div key={s} className={`flex items-center gap-3 p-2.5 rounded-xl border ${meta.color}`}>
                <div className={`w-2 h-2 rounded-full ${meta.dot} flex-shrink-0`}/>
                <span className="text-xs font-bold flex-1">{meta.label}</span>
                <span className="text-xs font-black">{count}</span>
                <span className="text-xs opacity-60">({pct}%)</span>
              </div>
            );})}
          </div>
        </div>
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SETTINGS TAB
// ═══════════════════════════════════════════════════════════════════
const DEFAULT_SETTINGS: SiteSettings={
  businessName:'Device360',phone:'+919876543210',whatsapp:'919876543210',
  email:'support@device360.in',address:'Indiranagar',city:'Bengaluru',pincode:'560038',
  repairPromise:'60',warrantyMonths:6,openTime:'09:00',closeTime:'21:00',
  enableLiveRepair:true,enableBooking:true,socialInstagram:'',socialFacebook:'',socialYoutube:'',
};

const SettingsTab: React.FC = () => {
  const [settings,setSettings]=useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false);
  const [section,setSection]=useState<'business'|'features'|'social'|'danger'>('business');

  useEffect(()=>{apiFetch('/api/settings').then(d=>setSettings({...DEFAULT_SETTINGS,...d.settings})).catch(()=>{}).finally(()=>setLoading(false));},[]);

  const set=(key:keyof SiteSettings,val:any)=>setSettings(s=>({...s,[key]:val}));
  const saveSettings=async()=>{
    setSaving(true);
    try{await apiFetch('/api/settings',{method:'POST',body:JSON.stringify(settings)});setSaved(true);setTimeout(()=>setSaved(false),2500);}
    catch(e:any){alert(e.message);}
    finally{setSaving(false);}
  };

  const Input=({label,value,onChange,type='text',placeholder=''}:any)=>(
    <div className="space-y-1.5">
      <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">{label}</label>
      <input type={type} value={value} onChange={(e:any)=>onChange(type==='number'?parseInt(e.target.value)||0:e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-2xl focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none bg-gray-50 focus:bg-white transition-all"/>
    </div>
  );
  const Toggle=({label,desc,value,onChange}:{label:string;desc:string;value:boolean;onChange:(v:boolean)=>void})=>(
    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100">
      <div><p className="text-sm font-bold text-gray-900">{label}</p><p className="text-xs text-gray-400 mt-0.5">{desc}</p></div>
      <button onClick={()=>onChange(!value)} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${value?'bg-blue-600 text-white':'bg-gray-100 text-gray-500'}`}>
        {value?<><ToggleRight className="w-4 h-4"/>On</>:<><ToggleLeft className="w-4 h-4"/>Off</>}
      </button>
    </div>
  );

  if(loading)return<div className="flex items-center justify-center py-24"><div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div><h2 className="text-xl font-black text-gray-900">Settings</h2><p className="text-sm text-gray-400 mt-0.5">Configure your repair business</p></div>
        <button onClick={saveSettings} disabled={saving}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all disabled:opacity-50 ${saved?'bg-emerald-600 text-white':'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'}`}>
          {saving?<RefreshCw className="w-4 h-4 animate-spin"/>:saved?<CheckCircle className="w-4 h-4"/>:<Save className="w-4 h-4"/>}
          {saving?'Saving…':saved?'Saved!':'Save Settings'}
        </button>
      </div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {([{id:'business',label:'Business'},{id:'features',label:'Features'},{id:'social',label:'Social'},{id:'danger',label:'Danger Zone'}] as const).map(({id,label})=>(
          <button key={id} onClick={()=>setSection(id)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${section===id?'bg-gray-900 text-white':'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>{label}</button>
        ))}
      </div>
      {section==='business'&&(
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Business Name" value={settings.businessName} onChange={(v:string)=>set('businessName',v)} placeholder="Device360"/>
          <Input label="Phone" value={settings.phone} onChange={(v:string)=>set('phone',v)} placeholder="+919876543210"/>
          <Input label="WhatsApp (no +)" value={settings.whatsapp} onChange={(v:string)=>set('whatsapp',v)} placeholder="919876543210"/>
          <Input label="Email" value={settings.email} onChange={(v:string)=>set('email',v)} type="email"/>
          <Input label="Address" value={settings.address} onChange={(v:string)=>set('address',v)}/>
          <Input label="City" value={settings.city} onChange={(v:string)=>set('city',v)}/>
          <Input label="Pincode" value={settings.pincode} onChange={(v:string)=>set('pincode',v)}/>
          <Input label="Repair Promise (mins)" value={settings.repairPromise} onChange={(v:string)=>set('repairPromise',v)} type="number"/>
          <Input label="Warranty (months)" value={settings.warrantyMonths} onChange={(v:number)=>set('warrantyMonths',v)} type="number"/>
          <div className="space-y-1.5"><label className="block text-xs font-black text-gray-500 uppercase tracking-widest">Open Time</label><input type="time" value={settings.openTime} onChange={e=>set('openTime',e.target.value)} className="w-full px-4 py-3 text-sm border border-gray-200 rounded-2xl outline-none bg-gray-50 focus:bg-white transition-all"/></div>
          <div className="space-y-1.5"><label className="block text-xs font-black text-gray-500 uppercase tracking-widest">Close Time</label><input type="time" value={settings.closeTime} onChange={e=>set('closeTime',e.target.value)} className="w-full px-4 py-3 text-sm border border-gray-200 rounded-2xl outline-none bg-gray-50 focus:bg-white transition-all"/></div>
        </div>
      )}
      {section==='features'&&(
        <div className="space-y-3 max-w-lg">
          <Toggle label="Enable Bookings" desc="Allow customers to book repairs from the website" value={settings.enableBooking} onChange={v=>set('enableBooking',v)}/>
          <Toggle label="Enable LIVE Repairs" desc="Show LIVE repair option and video tracking features" value={settings.enableLiveRepair} onChange={v=>set('enableLiveRepair',v)}/>
        </div>
      )}
      {section==='social'&&(
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
          <Input label="Instagram URL" value={settings.socialInstagram} onChange={(v:string)=>set('socialInstagram',v)} placeholder="https://instagram.com/device360"/>
          <Input label="Facebook URL" value={settings.socialFacebook} onChange={(v:string)=>set('socialFacebook',v)}/>
          <Input label="YouTube URL" value={settings.socialYoutube} onChange={(v:string)=>set('socialYoutube',v)}/>
        </div>
      )}
      {section==='danger'&&(
        <div className="space-y-3 max-w-lg">
          <div className="p-5 bg-red-50 border border-red-200 rounded-2xl space-y-4">
            <div className="flex items-start gap-3"><Shield className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"/><div><p className="font-black text-red-800 text-sm">Danger Zone</p><p className="text-xs text-red-600 mt-0.5">These actions are irreversible.</p></div></div>
            <button onClick={()=>{if(confirm('Delete ALL bookings? Cannot be undone.'))apiFetch('/api/leads/all',{method:'DELETE'}).catch(e=>alert(e.message));}}
              className="w-full py-3 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all">🗑 Delete All Bookings</button>
            <button onClick={()=>{localStorage.removeItem('adminAuth');window.location.href='/admin/login';}}
              className="w-full py-3 rounded-xl bg-gray-800 text-white text-sm font-bold hover:bg-gray-900 transition-all">🔒 Logout</button>
          </div>
        </div>
      )}
    </>
  );
};