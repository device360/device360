import { useEffect, useState, useCallback } from 'react';
import {
  RefreshCw, Video, Phone, IndianRupee,
  Plus, Trash2, Edit3, Save, X, Package, Wrench, BarChart3,
  TrendingUp, Users, CheckCircle, AlertCircle, Search, ChevronDown,
  MessageCircle, Menu, Smartphone, Settings, Star, Shield,
  ToggleLeft, ToggleRight, ChevronRight, Copy,
  ExternalLink, Zap, Wifi, Download, Clock,
} from 'lucide-react';
import type { Lead } from '../types';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const STATUS_OPTIONS = ['pending','confirmed','picked_up','in_progress','completed','cancelled'] as const;
type Status = typeof STATUS_OPTIONS[number];

const STATUS_META: Record<Status, { color: string; dot: string; label: string }> = {
  pending:     { color: 'bg-amber-50 text-amber-700 border-amber-200',      dot: 'bg-amber-400',   label: 'Pending'     },
  confirmed:   { color: 'bg-blue-50 text-blue-700 border-blue-200',         dot: 'bg-blue-500',    label: 'Confirmed'   },
  picked_up:   { color: 'bg-violet-50 text-violet-700 border-violet-200',   dot: 'bg-violet-500',  label: 'Picked Up'   },
  in_progress: { color: 'bg-orange-50 text-orange-700 border-orange-200',   dot: 'bg-orange-500',  label: 'In Progress' },
  completed:   { color: 'bg-emerald-50 text-emerald-700 border-emerald-200',dot: 'bg-emerald-500', label: 'Completed'   },
  cancelled:   { color: 'bg-red-50 text-red-700 border-red-200',            dot: 'bg-red-400',     label: 'Cancelled'   },
};

interface ServiceItem {
  id: string; brand: string; model?: string; issue: string;
  price: number; oldPrice?: number; isLiveRepair: boolean;
  duration: string; warranty: string; active: boolean;
}
interface BrandItem { id: string; name: string; models: string[]; active: boolean; sortOrder: number; }
interface IssueItem { id: string; name: string; icon: string; time: string; category: 'live'|'other'; active: boolean; }
interface SiteSettings {
  businessName: string; phone: string; whatsapp: string; email: string;
  address: string; city: string; pincode: string; repairPromise: string;
  warrantyMonths: number; openTime: string; closeTime: string;
  enableLiveRepair: boolean; enableBooking: boolean;
  socialInstagram: string; socialFacebook: string; socialYoutube: string;
}

type AdminTab = 'bookings' | 'services' | 'catalog' | 'analytics' | 'settings';

const BRANDS_LIST = ['Apple','Samsung','OnePlus','Xiaomi','Motorola','OPPO','Vivo','Google','Huawei','Realme','POCO','iQOO','Others'];
const ISSUES_LIST = ['Screen Replacement','Battery Replacement','Charging Port Repair','Back Glass Repair','Camera Fix','Water Damage Repair','Speaker Repair','Mic Repair','Motherboard Repair'];
const BAR_COLORS  = ['from-blue-500 to-blue-400','from-violet-500 to-violet-400','from-emerald-500 to-emerald-400','from-amber-500 to-amber-400','from-pink-500 to-pink-400'];

async function apiFetch(path: string, opts?: RequestInit) {
  const res  = await fetch(`${BACKEND}${path}`, { headers: { 'Content-Type': 'application/json' }, ...opts });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('bookings');
  const [mobileOpen, setMobileOpen] = useState(false);

  const tabs: { id: AdminTab; label: string; short: string; icon: React.ElementType }[] = [
    { id:'bookings',  label:'Bookings',          short:'Bookings',  icon:Package     },
    { id:'services',  label:'Pricing & Services', short:'Pricing',   icon:IndianRupee },
    { id:'catalog',   label:'Brands & Models',    short:'Catalog',   icon:Smartphone  },
    { id:'analytics', label:'Analytics',          short:'Analytics', icon:BarChart3   },
    { id:'settings',  label:'Settings',           short:'Settings',  icon:Settings    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 h-14">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200">
                <Wrench className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="font-black text-gray-900 text-sm">Device360</span>
                <span className="text-gray-400 text-sm"> Admin</span>
              </div>
            </div>
            <nav className="hidden lg:flex items-center gap-1 ml-4 flex-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab===id?'bg-blue-600 text-white shadow-md shadow-blue-100':'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
                  <Icon className="w-3.5 h-3.5" />{label}
                </button>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-2">
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-50 border border-green-100 text-green-700 text-xs font-bold hover:bg-green-100 transition-all">
                <MessageCircle className="w-4 h-4 text-green-600" /> WhatsApp
              </a>
              <a href="tel:+919876543210"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-all">
                <Phone className="w-4 h-4 text-blue-600" /> Call
              </a>
              <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
          {mobileOpen && (
            <div className="lg:hidden border-t border-gray-100 py-2 space-y-1 pb-3">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => { setActiveTab(id); setMobileOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-left transition-all ${activeTab===id?'bg-blue-600 text-white':'text-gray-600 hover:bg-gray-100'}`}>
                  <Icon className="w-4 h-4" />{label}
                </button>
              ))}
            </div>
          )}
          <div className="lg:hidden flex border-t border-gray-100 -mx-4">
            {tabs.map(({ id, short, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 text-[9px] font-black transition-all ${activeTab===id?'text-blue-600':'text-gray-400'}`}>
                <Icon className={`w-4 h-4 ${activeTab===id?'text-blue-600':'text-gray-400'}`} />
                {short}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab==='bookings'  && <BookingsTab />}
        {activeTab==='services'  && <ServicesTab />}
        {activeTab==='catalog'   && <CatalogTab />}
        {activeTab==='analytics' && <AnalyticsTab />}
        {activeTab==='settings'  && <SettingsTab />}
      </div>
    </div>
  );
};

// ── BOOKINGS ────────────────────────────────────────────────────────────────
const BookingsTab: React.FC = () => {
  const [leads, setLeads]       = useState<Lead[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [updating, setUpdating] = useState<Record<string,boolean>>({});
  const [videoInputs, setVideoInputs] = useState<Record<string,string>>({});
  const [noteInputs,  setNoteInputs]  = useState<Record<string,string>>({});
  const [filter, setFilter]     = useState<'all'|Status>('all');
  const [search, setSearch]     = useState('');
  const [expandedId, setExpandedId] = useState<string|null>(null);
  const [sortBy, setSortBy]     = useState<'newest'|'oldest'|'price'>('newest');

  const fetchLeads = useCallback(async () => {
    setLoading(true); setError('');
    try { const d = await apiFetch('/api/leads'); setLeads(d.leads||[]); }
    catch (e:any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const updateLead = async (id:string, updates:Partial<Lead>) => {
    setUpdating(u=>({...u,[id]:true}));
    try { await apiFetch(`/api/leads/${id}`,{method:'PATCH',body:JSON.stringify(updates)}); await fetchLeads(); }
    catch(e:any){ alert(e.message); }
    finally { setUpdating(u=>({...u,[id]:false})); }
  };

  const deleteLead = async (id:string) => {
    if(!confirm('Delete this booking permanently?')) return;
    try { await apiFetch(`/api/leads/${id}`,{method:'DELETE'}); await fetchLeads(); }
    catch(e:any){ alert(e.message); }
  };

  const exportCSV = () => {
    const rows=[['ID','Name','Phone','Brand','Model','Issue','Price','Status','Time Slot','Address','Created'],...leads.map(l=>[l.id,l.name,l.phone,l.brand,l.model,l.issue,l.price,l.status,l.timeSlot,l.address,l.createdAt])];
    const csv=rows.map(r=>r.map(c=>`"${c??''}"`).join(',')).join('\n');
    const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download='bookings.csv'; a.click();
  };

  const stats = {
    total:     leads.length,
    pending:   leads.filter(l=>l.status==='pending').length,
    active:    leads.filter(l=>['confirmed','picked_up','in_progress'].includes(l.status)).length,
    completed: leads.filter(l=>l.status==='completed').length,
    revenue:   leads.filter(l=>l.status==='completed').reduce((s,l)=>s+(l.price||0),0),
  };

  let filtered = (filter==='all'?leads:leads.filter(l=>l.status===filter))
    .filter(l=>!search||[l.name,l.phone,l.id,l.brand,l.model].some(v=>v?.toLowerCase().includes(search.toLowerCase())));
  if(sortBy==='newest') filtered=[...filtered].sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''));
  if(sortBy==='oldest') filtered=[...filtered].sort((a,b)=>(a.createdAt||'').localeCompare(b.createdAt||''));
  if(sortBy==='price')  filtered=[...filtered].sort((a,b)=>(b.price||0)-(a.price||0));

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {[
          {label:'Total',    val:stats.total,                         icon:Package,    col:'text-gray-800',    bg:'bg-white',      bd:'border-gray-100'   },
          {label:'Pending',  val:stats.pending,                       icon:AlertCircle,col:'text-amber-600',   bg:'bg-amber-50',   bd:'border-amber-100'  },
          {label:'Active',   val:stats.active,                        icon:Clock,      col:'text-blue-600',    bg:'bg-blue-50',    bd:'border-blue-100'   },
          {label:'Done',     val:stats.completed,                     icon:CheckCircle,col:'text-emerald-600', bg:'bg-emerald-50', bd:'border-emerald-100'},
          {label:'Revenue',  val:`₹${stats.revenue.toLocaleString()}`,icon:IndianRupee,col:'text-violet-600',  bg:'bg-violet-50',  bd:'border-violet-100' },
        ].map(({label,val,icon:Icon,col,bg,bd})=>(
          <div key={label} className={`${bg} rounded-2xl p-4 flex items-center gap-3 border ${bd} shadow-sm`}>
            <div className={`w-9 h-9 rounded-xl ${bg} border ${bd} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-4 h-4 ${col}`} />
            </div>
            <div className="min-w-0">
              <p className={`text-lg font-black ${col} truncate`}>{val}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input type="text" placeholder="Search name, phone, ID, brand…" value={search} onChange={e=>setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none bg-white" />
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
        <button onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 text-xs font-bold hover:border-green-300 hover:text-green-700 transition-all">
          <Download className="w-3.5 h-3.5" /> CSV
        </button>
        <button onClick={fetchLeads} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 text-xs font-bold hover:border-blue-300 hover:text-blue-600 transition-all disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${loading?'animate-spin':''}`} /> Refresh
        </button>
      </div>
      {error && (
        <div className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
          <button onClick={fetchLeads} className="ml-auto text-xs font-bold underline">Retry</button>
        </div>
      )}
      {loading && leads.length===0 ? (
        <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length===0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <Package className="w-12 h-12 mb-3 opacity-20" />
          <p className="text-sm font-medium">No bookings found</p>
          {search && <button onClick={()=>setSearch('')} className="mt-2 text-xs text-blue-500 hover:underline">Clear search</button>}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(lead=>{
            const meta=STATUS_META[lead.status as Status]||STATUS_META.pending;
            const isExpanded=expandedId===lead.id;
            return (
              <div key={lead.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex flex-wrap items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50/80 transition-colors"
                  onClick={()=>setExpandedId(isExpanded?null:lead.id)}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-2.5 h-2.5 rounded-full ${meta.dot} flex-shrink-0`} />
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{lead.name}</p>
                      <p className="text-xs text-gray-400 font-mono">#{lead.id?.slice(0,8)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.phone}</span>
                    <span className="hidden sm:flex items-center gap-1"><Smartphone className="w-3 h-3" />{lead.brand} {lead.model}</span>
                    <span className="hidden md:flex font-bold text-gray-700">₹{lead.price}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {lead.isLiveRepair && (
                      <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-black border border-green-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />LIVE
                      </span>
                    )}
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${meta.color}`}>{meta.label}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform ${isExpanded?'rotate-180':''}`} />
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-5 bg-gray-50/50 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[{label:'Issue',val:lead.issue},{label:'Time Slot',val:lead.timeSlot},{label:'Amount',val:`₹${lead.price}`},{label:'Address',val:lead.address}].map(({label,val})=>(
                        <div key={label}>
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{label}</p>
                          <p className="font-semibold text-gray-800 text-xs leading-relaxed">{val}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-all">
                        <Phone className="w-3 h-3" /> Call
                      </a>
                      <a href={`https://wa.me/91${lead.phone?.replace('+91','').replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${lead.name}! Update on your Device360 booking #${lead.id?.slice(0,8)}: `)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 border border-green-100 text-green-700 text-xs font-bold hover:bg-green-100 transition-all">
                        <MessageCircle className="w-3 h-3" /> WhatsApp
                      </a>
                      <button onClick={()=>navigator.clipboard.writeText(lead.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200 transition-all">
                        <Copy className="w-3 h-3" /> Copy ID
                      </button>
                      <a href={`/dashboard/${lead.id}`} target="_blank"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200 transition-all">
                        <ExternalLink className="w-3 h-3" /> Customer View
                      </a>
                    </div>
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
                          className="w-28 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 focus:border-blue-400 outline-none bg-white" />
                      </div>
                      <div className="space-y-1 flex-1 min-w-48">
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Technician Note</label>
                        <div className="flex gap-2">
                          <input type="text" placeholder="Add internal note…"
                            value={noteInputs[lead.id]??lead.technicianNote??''}
                            onChange={e=>setNoteInputs(n=>({...n,[lead.id]:e.target.value}))}
                            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-blue-400 bg-white" />
                          <button onClick={()=>updateLead(lead.id,{technicianNote:noteInputs[lead.id]})} disabled={updating[lead.id]}
                            className="px-3 py-2 rounded-xl bg-gray-700 text-white text-xs font-bold hover:bg-gray-800 disabled:opacity-50 transition-all">
                            <Save className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      {lead.isLiveRepair && (
                        <div className="space-y-1 flex-1 min-w-52">
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Live Video URL</label>
                          <div className="flex gap-2">
                            <input type="url" placeholder="Paste YouTube/Meet link…"
                              value={videoInputs[lead.id]??lead.videoLink??''}
                              onChange={e=>setVideoInputs(v=>({...v,[lead.id]:e.target.value}))}
                              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-blue-400 bg-white" />
                            <button onClick={()=>updateLead(lead.id,{videoLink:videoInputs[lead.id]||null})}
                              disabled={updating[lead.id]||!videoInputs[lead.id]}
                              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 disabled:opacity-50 transition-all">
                              <Video className="w-3 h-3" /> Set
                            </button>
                          </div>
                        </div>
                      )}
                      <button onClick={()=>deleteLead(lead.id)}
                        className="px-3 py-2 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold hover:bg-red-100 transition-all flex items-center gap-1.5 self-end">
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                      {updating[lead.id] && (
                        <span className="text-xs text-blue-500 font-bold animate-pulse flex items-center gap-1 self-end">
                          <RefreshCw className="w-3 h-3 animate-spin" /> Saving…
                        </span>
                      )}
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

// ── SERVICES ────────────────────────────────────────────────────────────────
const ServicesTab: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState<Record<string,boolean>>({});
  const [editId, setEditId]     = useState<string|null>(null);
  const [editData, setEditData] = useState<Partial<ServiceItem>>({});
  const [showAdd, setShowAdd]   = useState(false);
  const [filterBrand, setFilterBrand] = useState('all');
  const [search, setSearch]     = useState('');
  const [newSvc, setNewSvc]     = useState<Partial<ServiceItem>>({brand:'',model:'',issue:'',price:0,oldPrice:0,isLiveRepair:false,duration:'60 min',warranty:'6 months',active:true});

  const load = useCallback(async ()=>{
    setLoading(true);
    try{const d=await apiFetch('/api/services');setServices(d.services||[]);}
    catch{setServices([]);}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{load();},[load]);

  const save=async(id:string,updates:Partial<ServiceItem>)=>{
    setSaving(s=>({...s,[id]:true}));
    try{await apiFetch(`/api/services/${id}`,{method:'PATCH',body:JSON.stringify(updates)});await load();setEditId(null);}
    catch(e:any){alert(e.message);}
    finally{setSaving(s=>({...s,[id]:false}));}
  };
  const add=async()=>{
    if(!newSvc.brand||!newSvc.issue||!newSvc.price){alert('Brand, Issue, and Price are required.');return;}
    setSaving(s=>({...s,new:true}));
    try{await apiFetch('/api/services',{method:'POST',body:JSON.stringify(newSvc)});await load();setShowAdd(false);setNewSvc({brand:'',model:'',issue:'',price:0,oldPrice:0,isLiveRepair:false,duration:'60 min',warranty:'6 months',active:true});}
    catch(e:any){alert(e.message);}
    finally{setSaving(s=>({...s,new:false}));}
  };
  const del=async(id:string)=>{
    if(!confirm('Delete this service?'))return;
    try{await apiFetch(`/api/services/${id}`,{method:'DELETE'});await load();}
    catch(e:any){alert(e.message);}
  };

  const brands=['all',...Array.from(new Set(services.map(s=>s.brand)))];
  const filtered=services.filter(s=>filterBrand==='all'||s.brand===filterBrand).filter(s=>!search||s.brand.toLowerCase().includes(search.toLowerCase())||s.issue.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-gray-900">Pricing & Services</h2>
          <p className="text-sm text-gray-400 mt-0.5">{services.length} services · {services.filter(s=>s.active).length} active</p>
        </div>
        <button onClick={()=>setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input type="text" placeholder="Search services…" value={search} onChange={e=>setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:border-blue-400 outline-none bg-white" />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {brands.map(b=>(
            <button key={b} onClick={()=>setFilterBrand(b)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filterBrand===b?'bg-blue-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'}`}>{b}</button>
          ))}
        </div>
      </div>
      {showAdd && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-blue-900 text-sm">Add New Service</h3>
            <button onClick={()=>setShowAdd(false)} className="p-1.5 rounded-xl hover:bg-blue-100 text-blue-400"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Brand *</label>
              <select value={newSvc.brand} onChange={e=>setNewSvc(p=>({...p,brand:e.target.value}))} className="w-full px-3 py-2 text-sm border border-blue-200 rounded-xl outline-none bg-white">
                <option value="">Select brand</option>{BRANDS_LIST.map(b=><option key={b}>{b}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Model (optional)</label>
              <input type="text" placeholder="All models" value={newSvc.model||''} onChange={e=>setNewSvc(p=>({...p,model:e.target.value}))} className="w-full px-3 py-2 text-sm border border-blue-200 rounded-xl outline-none bg-white" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Issue *</label>
              <select value={newSvc.issue} onChange={e=>setNewSvc(p=>({...p,issue:e.target.value}))} className="w-full px-3 py-2 text-sm border border-blue-200 rounded-xl outline-none bg-white">
                <option value="">Select issue</option>{ISSUES_LIST.map(i=><option key={i}>{i}</option>)}
              </select>
            </div>
            {[{key:'price',label:'Price (₹) *',type:'number',ph:'1999'},{key:'oldPrice',label:'Old Price (₹)',type:'number',ph:'2999'},{key:'duration',label:'Duration',type:'text',ph:'60 min'},{key:'warranty',label:'Warranty',type:'text',ph:'6 months'}].map(({key,label,type,ph})=>(
              <div key={key} className="space-y-1">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</label>
                <input type={type} placeholder={ph} value={(newSvc as any)[key]||''} onChange={e=>setNewSvc(p=>({...p,[key]:type==='number'?parseInt(e.target.value)||0:e.target.value}))} className="w-full px-3 py-2 text-sm border border-blue-200 rounded-xl outline-none bg-white" />
              </div>
            ))}
            <div className="flex flex-col gap-2 justify-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={newSvc.isLiveRepair||false} onChange={e=>setNewSvc(p=>({...p,isLiveRepair:e.target.checked}))} className="w-4 h-4 rounded accent-blue-600" /><span className="text-xs font-bold text-blue-800">Live Repair</span></label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={newSvc.active!==false} onChange={e=>setNewSvc(p=>({...p,active:e.target.checked}))} className="w-4 h-4 rounded accent-blue-600" /><span className="text-xs font-bold text-blue-800">Active</span></label>
            </div>
          </div>
          <button onClick={add} disabled={saving['new']} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all">
            {saving['new']?<RefreshCw className="w-3.5 h-3.5 animate-spin" />:<Save className="w-3.5 h-3.5" />}{saving['new']?'Saving…':'Save Service'}
          </button>
        </div>
      )}
      {loading?(<div className="flex items-center justify-center py-20"><div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>):(
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Brand','Model','Issue','Price','Old Price','Duration','Warranty','Live','Active','Actions'].map(h=>(
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(svc=>{
                  const isEditing=editId===svc.id;
                  return (
                    <tr key={svc.id} className={`${isEditing?'bg-blue-50':svc.active?'hover:bg-gray-50':'bg-gray-50/50 opacity-60'} transition-colors`}>
                      {isEditing?(
                        <>
                          <td className="px-3 py-2"><select value={editData.brand||''} onChange={e=>setEditData(p=>({...p,brand:e.target.value}))} className="w-28 px-2 py-1 text-xs border border-blue-300 rounded-lg outline-none bg-white">{BRANDS_LIST.map(b=><option key={b}>{b}</option>)}</select></td>
                          <td className="px-3 py-2"><input value={editData.model||''} onChange={e=>setEditData(p=>({...p,model:e.target.value}))} placeholder="All models" className="w-24 px-2 py-1 text-xs border border-blue-300 rounded-lg outline-none bg-white" /></td>
                          <td className="px-3 py-2"><select value={editData.issue||''} onChange={e=>setEditData(p=>({...p,issue:e.target.value}))} className="w-40 px-2 py-1 text-xs border border-blue-300 rounded-lg outline-none bg-white">{ISSUES_LIST.map(i=><option key={i}>{i}</option>)}</select></td>
                          {(['price','oldPrice'] as const).map(f=>(
                            <td key={f} className="px-3 py-2"><input type="number" value={(editData as any)[f]||''} onChange={e=>setEditData(p=>({...p,[f]:parseInt(e.target.value)||0}))} className="w-20 px-2 py-1 text-xs border border-blue-300 rounded-lg outline-none bg-white" /></td>
                          ))}
                          {(['duration','warranty'] as const).map(f=>(
                            <td key={f} className="px-3 py-2"><input value={(editData as any)[f]||''} onChange={e=>setEditData(p=>({...p,[f]:e.target.value}))} className="w-20 px-2 py-1 text-xs border border-blue-300 rounded-lg outline-none bg-white" /></td>
                          ))}
                          <td className="px-3 py-2"><input type="checkbox" checked={editData.isLiveRepair||false} onChange={e=>setEditData(p=>({...p,isLiveRepair:e.target.checked}))} className="w-4 h-4 accent-blue-600" /></td>
                          <td className="px-3 py-2"><input type="checkbox" checked={editData.active!==false} onChange={e=>setEditData(p=>({...p,active:e.target.checked}))} className="w-4 h-4 accent-blue-600" /></td>
                          <td className="px-3 py-2">
                            <div className="flex gap-1.5">
                              <button onClick={()=>save(svc.id,editData)} disabled={saving[svc.id]} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50"><Save className="w-3 h-3" />Save</button>
                              <button onClick={()=>setEditId(null)} className="p-1 rounded-lg hover:bg-gray-200 text-gray-500"><X className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </>
                      ):(
                        <>
                          <td className="px-4 py-3 font-bold text-gray-900">{svc.brand}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{svc.model||<span className="text-gray-300">All</span>}</td>
                          <td className="px-4 py-3 text-gray-700">{svc.issue}</td>
                          <td className="px-4 py-3 font-black text-emerald-700">₹{svc.price?.toLocaleString()}</td>
                          <td className="px-4 py-3 text-gray-400 line-through text-xs">{svc.oldPrice?`₹${svc.oldPrice.toLocaleString()}`:'—'}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{svc.duration}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{svc.warranty}</td>
                          <td className="px-4 py-3">{svc.isLiveRepair?<span className="px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-black border border-green-200 flex items-center gap-1 w-fit"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />Yes</span>:<span className="text-gray-300 text-xs">—</span>}</td>
                          <td className="px-4 py-3">
                            <button onClick={()=>save(svc.id,{active:!svc.active})}>
                              {svc.active?<ToggleRight className="w-6 h-6 text-blue-600" />:<ToggleLeft className="w-6 h-6 text-gray-300" />}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button onClick={()=>{setEditId(svc.id);setEditData({...svc});}} className="p-1.5 rounded-xl hover:bg-blue-50 text-blue-400 hover:text-blue-700 transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                              <button onClick={()=>del(svc.id)} className="p-1.5 rounded-xl hover:bg-red-50 text-red-300 hover:text-red-600 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length===0&&<div className="text-center py-12 text-gray-400 text-sm">No services found.</div>}
          </div>
        </div>
      )}
    </>
  );
};

// ── CATALOG ──────────────────────────────────────────────────────────────────
const CatalogTab: React.FC = () => {
  const [brands, setBrands]     = useState<BrandItem[]>([]);
  const [issues, setIssues]     = useState<IssueItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [activeBrand, setActiveBrand] = useState<BrandItem|null>(null);
  const [newModel, setNewModel] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [newIssueName, setNewIssueName] = useState('');
  const [newIssueTime, setNewIssueTime] = useState('60 min');
  const [newIssueCat, setNewIssueCat]   = useState<'live'|'other'>('live');
  const [saving, setSaving]     = useState(false);
  const [section, setSection]   = useState<'brands'|'issues'>('brands');

  const load=useCallback(async()=>{
    setLoading(true);
    try{const[bd,id]=await Promise.all([apiFetch('/api/catalog/brands'),apiFetch('/api/catalog/issues')]);setBrands(bd.brands||[]);setIssues(id.issues||[]);}
    catch{}finally{setLoading(false);}
  },[]);
  useEffect(()=>{load();},[load]);

  const saveBrand=async(brand:BrandItem)=>{setSaving(true);try{await apiFetch(`/api/catalog/brands/${brand.id}`,{method:'PATCH',body:JSON.stringify(brand)});await load();setActiveBrand(b=>b?.id===brand.id?{...brand}:b);}catch(e:any){alert(e.message);}finally{setSaving(false);};};
  const addBrand=async()=>{if(!newBrandName.trim())return;setSaving(true);try{await apiFetch('/api/catalog/brands',{method:'POST',body:JSON.stringify({name:newBrandName,models:[],active:true,sortOrder:brands.length})});setNewBrandName('');await load();}catch(e:any){alert(e.message);}finally{setSaving(false);};};
  const deleteBrand=async(id:string)=>{if(!confirm('Delete this brand?'))return;try{await apiFetch(`/api/catalog/brands/${id}`,{method:'DELETE'});if(activeBrand?.id===id)setActiveBrand(null);await load();}catch(e:any){alert(e.message);};};
  const addModel=async()=>{if(!activeBrand||!newModel.trim())return;const u={...activeBrand,models:[...activeBrand.models,newModel.trim()]};setActiveBrand(u);setNewModel('');await saveBrand(u);};
  const removeModel=async(m:string)=>{if(!activeBrand)return;const u={...activeBrand,models:activeBrand.models.filter(x=>x!==m)};setActiveBrand(u);await saveBrand(u);};
  const saveIssue=async(issue:IssueItem)=>{try{await apiFetch(`/api/catalog/issues/${issue.id}`,{method:'PATCH',body:JSON.stringify(issue)});await load();}catch(e:any){alert(e.message);};};
  const addIssue=async()=>{if(!newIssueName.trim())return;setSaving(true);try{await apiFetch('/api/catalog/issues',{method:'POST',body:JSON.stringify({name:newIssueName,icon:'Wrench',time:newIssueTime,category:newIssueCat,active:true})});setNewIssueName('');setNewIssueTime('60 min');await load();}catch(e:any){alert(e.message);}finally{setSaving(false);};};
  const deleteIssue=async(id:string)=>{if(!confirm('Delete this issue?'))return;try{await apiFetch(`/api/catalog/issues/${id}`,{method:'DELETE'});await load();}catch(e:any){alert(e.message);};};

  if(loading)return<div className="flex items-center justify-center py-24"><div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div><h2 className="text-xl font-black text-gray-900">Brands, Models & Issues</h2><p className="text-sm text-gray-400 mt-0.5">Control what appears in the repair booking flow</p></div>
        <div className="flex gap-2">
          <button onClick={()=>setSection('brands')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${section==='brands'?'bg-blue-600 text-white':'bg-white border border-gray-200 text-gray-600'}`}>Brands & Models</button>
          <button onClick={()=>setSection('issues')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${section==='issues'?'bg-blue-600 text-white':'bg-white border border-gray-200 text-gray-600'}`}>Issue Types</button>
        </div>
      </div>

      {section==='brands'&&(
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 space-y-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50"><p className="text-xs font-black text-gray-700 uppercase tracking-widest">Brands ({brands.length})</p></div>
              <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
                {brands.map(brand=>(
                  <div key={brand.id} className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all hover:bg-gray-50 ${activeBrand?.id===brand.id?'bg-blue-50':''}`} onClick={()=>setActiveBrand(brand)}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${brand.active?'bg-green-500':'bg-gray-300'}`} />
                    <div className="flex-1 min-w-0"><p className="font-bold text-gray-900 text-sm">{brand.name}</p><p className="text-xs text-gray-400">{brand.models.length} models</p></div>
                    <div className="flex items-center gap-1">
                      <button onClick={e=>{e.stopPropagation();saveBrand({...brand,active:!brand.active});}}>{brand.active?<ToggleRight className="w-5 h-5 text-blue-600" />:<ToggleLeft className="w-5 h-5 text-gray-300" />}</button>
                      <button onClick={e=>{e.stopPropagation();deleteBrand(brand.id);}} className="p-1 rounded-lg hover:bg-red-50 text-red-300 hover:text-red-600 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      <ChevronRight className={`w-4 h-4 text-gray-300 ${activeBrand?.id===brand.id?'text-blue-500':''}`} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
                <input type="text" placeholder="New brand name…" value={newBrandName} onChange={e=>setNewBrandName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addBrand()} className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-blue-400 outline-none" />
                <button onClick={addBrand} disabled={saving||!newBrandName.trim()} className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50 transition-all"><Plus className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
          <div className="lg:col-span-3">
            {activeBrand?(
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <div><p className="font-black text-gray-900 text-sm">{activeBrand.name}</p><p className="text-xs text-gray-400">{activeBrand.models.length} models</p></div>
                  <span className={`flex items-center gap-1.5 text-xs font-bold ${activeBrand.active?'text-green-600':'text-gray-400'}`}><span className={`w-2 h-2 rounded-full ${activeBrand.active?'bg-green-500':'bg-gray-300'}`} />{activeBrand.active?'Active':'Hidden'}</span>
                </div>
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto">
                  {activeBrand.models.map(model=>(
                    <div key={model} className="flex items-center justify-between gap-1 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 group">
                      <span className="text-xs font-semibold text-gray-800 truncate">{model}</span>
                      <button onClick={()=>removeModel(model)} className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-red-400 hover:text-red-600 transition-all flex-shrink-0"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                  {activeBrand.models.length===0&&<p className="col-span-3 text-xs text-gray-400 text-center py-4">No models yet. Add one below.</p>}
                </div>
                <div className="px-4 pb-4 pt-2 border-t border-gray-100 flex gap-2">
                  <input type="text" placeholder={`Add ${activeBrand.name} model…`} value={newModel} onChange={e=>setNewModel(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addModel()} className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-50 outline-none" />
                  <button onClick={addModel} disabled={saving||!newModel.trim()} className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-1.5"><Plus className="w-4 h-4" /> Add</button>
                </div>
              </div>
            ):(
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center h-64 text-gray-400">
                <div className="text-center"><Smartphone className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm">Select a brand to manage its models</p></div>
              </div>
            )}
          </div>
        </div>
      )}

      {section==='issues'&&(
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-wrap items-end gap-3">
            <div className="space-y-1 flex-1 min-w-40">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Issue Name *</label>
              <input type="text" placeholder="e.g. Back Glass Repair" value={newIssueName} onChange={e=>setNewIssueName(e.target.value)} className="w-full px-3 py-2 text-sm border border-blue-200 rounded-xl outline-none bg-white" />
            </div>
            <div className="space-y-1 w-28">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Time</label>
              <input type="text" placeholder="60 min" value={newIssueTime} onChange={e=>setNewIssueTime(e.target.value)} className="w-full px-3 py-2 text-sm border border-blue-200 rounded-xl outline-none bg-white" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Category</label>
              <select value={newIssueCat} onChange={e=>setNewIssueCat(e.target.value as any)} className="px-3 py-2 text-sm border border-blue-200 rounded-xl outline-none bg-white font-semibold">
                <option value="live">LIVE Repair</option>
                <option value="other">Standard</option>
              </select>
            </div>
            <button onClick={addIssue} disabled={saving||!newIssueName.trim()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all self-end">
              <Plus className="w-4 h-4" /> Add Issue
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 bg-gray-50">{['Issue Name','Category','Duration','Active','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {issues.map(issue=>(
                  <tr key={issue.id} className={`hover:bg-gray-50 transition-colors ${!issue.active?'opacity-50':''}`}>
                    <td className="px-4 py-3 font-bold text-gray-900">{issue.name}</td>
                    <td className="px-4 py-3">{issue.category==='live'?<span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-black border border-green-200">LIVE</span>:<span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold">Standard</span>}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{issue.time}</td>
                    <td className="px-4 py-3"><button onClick={()=>saveIssue({...issue,active:!issue.active})}>{issue.active?<ToggleRight className="w-6 h-6 text-blue-600" />:<ToggleLeft className="w-6 h-6 text-gray-300" />}</button></td>
                    <td className="px-4 py-3"><button onClick={()=>deleteIssue(issue.id)} className="p-1.5 rounded-xl hover:bg-red-50 text-red-300 hover:text-red-600 transition-all"><Trash2 className="w-3.5 h-3.5" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

// ── ANALYTICS ───────────────────────────────────────────────────────────────
const AnalyticsTab: React.FC = () => {
  const [leads, setLeads]   = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{apiFetch('/api/leads').then(d=>setLeads(d.leads||[])).catch(()=>{}).finally(()=>setLoading(false));;},[]);
  if(loading)return<div className="flex items-center justify-center py-24"><div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

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
        <span className="px-3 py-1.5 rounded-xl bg-green-50 text-green-700 text-xs font-bold border border-green-100 flex items-center gap-1.5"><Wifi className="w-3 h-3" /> Live Data</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          {label:'Total Bookings',val:leads.length,icon:Package,col:'text-blue-600',bg:'bg-blue-50',bd:'border-blue-100'},
          {label:'Total Revenue',val:`₹${revenue.toLocaleString()}`,icon:IndianRupee,col:'text-emerald-600',bg:'bg-emerald-50',bd:'border-emerald-100'},
          {label:'Avg Order',val:`₹${avgOrder.toLocaleString()}`,icon:TrendingUp,col:'text-violet-600',bg:'bg-violet-50',bd:'border-violet-100'},
          {label:'Completed',val:completed.length,icon:CheckCircle,col:'text-amber-600',bg:'bg-amber-50',bd:'border-amber-100'},
        ].map(({label,val,icon:Icon,col,bg,bd})=>(
          <div key={label} className={`${bg} rounded-2xl p-4 border ${bd} shadow-sm`}>
            <div className={`w-8 h-8 rounded-xl ${bg} border ${bd} flex items-center justify-center mb-3`}><Icon className={`w-4 h-4 ${col}`} /></div>
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
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full bg-gradient-to-r ${BAR_COLORS[i%BAR_COLORS.length]} rounded-full`} style={{width:`${pct}%`}} /></div></div>
            );})}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-black text-gray-900 text-sm mb-5">Repairs by Brand</h3>
          <div className="space-y-3.5">
            {topBrands.length===0&&<p className="text-xs text-gray-400">No data yet</p>}
            {topBrands.map(([name,count],i)=>{const pct=Math.round((count/totalBrands)*100);return(
              <div key={name}><div className="flex items-center justify-between mb-1.5"><span className="text-xs text-gray-700 font-bold">{name}</span><span className="text-xs text-gray-400">{count} ({pct}%)</span></div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full bg-gradient-to-r ${BAR_COLORS[i]} rounded-full`} style={{width:`${pct}%`}} /></div></div>
            );})}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-black text-gray-900 text-sm mb-5">Status Breakdown</h3>
          <div className="space-y-2">
            {STATUS_OPTIONS.map(s=>{const count=statusMap[s]||0;const pct=Math.round((count/(leads.length||1))*100);const meta=STATUS_META[s];return(
              <div key={s} className={`flex items-center gap-3 p-2.5 rounded-xl border ${meta.color}`}>
                <div className={`w-2 h-2 rounded-full ${meta.dot} flex-shrink-0`} />
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

// ── SETTINGS ─────────────────────────────────────────────────────────────────
const DEFAULT_SETTINGS: SiteSettings = {
  businessName:'Device360',phone:'+919876543210',whatsapp:'919876543210',
  email:'support@device360.in',address:'Indiranagar',city:'Bengaluru',pincode:'560038',
  repairPromise:'60',warrantyMonths:6,openTime:'09:00',closeTime:'21:00',
  enableLiveRepair:true,enableBooking:true,socialInstagram:'',socialFacebook:'',socialYoutube:'',
};

const SettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [section, setSection]   = useState<'business'|'features'|'social'|'danger'>('business');

  useEffect(()=>{apiFetch('/api/settings').then(d=>setSettings({...DEFAULT_SETTINGS,...d.settings})).catch(()=>{}).finally(()=>setLoading(false));;},[]);

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
        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-2xl focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none bg-gray-50 focus:bg-white transition-all" />
    </div>
  );
  const Toggle=({label,desc,value,onChange}:{label:string;desc:string;value:boolean;onChange:(v:boolean)=>void})=>(
    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100">
      <div><p className="text-sm font-bold text-gray-900">{label}</p><p className="text-xs text-gray-400 mt-0.5">{desc}</p></div>
      <button onClick={()=>onChange(!value)} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${value?'bg-blue-600 text-white':'bg-gray-100 text-gray-500'}`}>
        {value?<><ToggleRight className="w-4 h-4" />On</>:<><ToggleLeft className="w-4 h-4" />Off</>}
      </button>
    </div>
  );

  if(loading)return<div className="flex items-center justify-center py-24"><div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div><h2 className="text-xl font-black text-gray-900">Settings</h2><p className="text-sm text-gray-400 mt-0.5">Configure your repair business</p></div>
        <button onClick={saveSettings} disabled={saving}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all disabled:opacity-50 ${saved?'bg-emerald-600 text-white':'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'}`}>
          {saving?<RefreshCw className="w-4 h-4 animate-spin" />:saved?<CheckCircle className="w-4 h-4" />:<Save className="w-4 h-4" />}
          {saving?'Saving…':saved?'Saved!':'Save Settings'}
        </button>
      </div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {([{id:'business',label:'Business Info',icon:Wrench},{id:'features',label:'Features',icon:Zap},{id:'social',label:'Social Media',icon:Star},{id:'danger',label:'Danger Zone',icon:Shield}] as const).map(({id,label,icon:Icon})=>(
          <button key={id} onClick={()=>setSection(id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${section===id?'bg-gray-900 text-white':'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}><Icon className="w-3.5 h-3.5" />{label}</button>
        ))}
      </div>
      {section==='business'&&(
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Business Name" value={settings.businessName} onChange={(v:string)=>set('businessName',v)} placeholder="Device360" />
          <Input label="Phone Number" value={settings.phone} onChange={(v:string)=>set('phone',v)} placeholder="+919876543210" />
          <Input label="WhatsApp Number" value={settings.whatsapp} onChange={(v:string)=>set('whatsapp',v)} placeholder="919876543210 (no +)" />
          <Input label="Email" value={settings.email} onChange={(v:string)=>set('email',v)} type="email" placeholder="support@device360.in" />
          <Input label="Address" value={settings.address} onChange={(v:string)=>set('address',v)} placeholder="4th Cross, Indiranagar" />
          <Input label="City" value={settings.city} onChange={(v:string)=>set('city',v)} placeholder="Bengaluru" />
          <Input label="Pincode" value={settings.pincode} onChange={(v:string)=>set('pincode',v)} placeholder="560038" />
          <Input label="Repair Promise (mins)" value={settings.repairPromise} onChange={(v:string)=>set('repairPromise',v)} type="number" placeholder="60" />
          <Input label="Warranty (months)" value={settings.warrantyMonths} onChange={(v:number)=>set('warrantyMonths',v)} type="number" placeholder="6" />
          <div className="space-y-1.5"><label className="block text-xs font-black text-gray-500 uppercase tracking-widest">Opening Time</label><input type="time" value={settings.openTime} onChange={e=>set('openTime',e.target.value)} className="w-full px-4 py-3 text-sm border border-gray-200 rounded-2xl focus:border-blue-400 outline-none bg-gray-50 focus:bg-white transition-all" /></div>
          <div className="space-y-1.5"><label className="block text-xs font-black text-gray-500 uppercase tracking-widest">Closing Time</label><input type="time" value={settings.closeTime} onChange={e=>set('closeTime',e.target.value)} className="w-full px-4 py-3 text-sm border border-gray-200 rounded-2xl focus:border-blue-400 outline-none bg-gray-50 focus:bg-white transition-all" /></div>
        </div>
      )}
      {section==='features'&&(
        <div className="space-y-3 max-w-lg">
          <Toggle label="Enable Bookings" desc="Allow customers to book repairs from the website" value={settings.enableBooking} onChange={v=>set('enableBooking',v)} />
          <Toggle label="Enable LIVE Repairs" desc="Show LIVE repair option and video tracking features" value={settings.enableLiveRepair} onChange={v=>set('enableLiveRepair',v)} />
        </div>
      )}
      {section==='social'&&(
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
          <Input label="Instagram URL" value={settings.socialInstagram} onChange={(v:string)=>set('socialInstagram',v)} placeholder="https://instagram.com/device360" />
          <Input label="Facebook URL" value={settings.socialFacebook} onChange={(v:string)=>set('socialFacebook',v)} placeholder="https://facebook.com/device360" />
          <Input label="YouTube URL" value={settings.socialYoutube} onChange={(v:string)=>set('socialYoutube',v)} placeholder="https://youtube.com/@device360" />
        </div>
      )}
      {section==='danger'&&(
        <div className="space-y-3 max-w-lg">
          <div className="p-5 bg-red-50 border border-red-200 rounded-2xl space-y-4">
            <div className="flex items-start gap-3"><Shield className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" /><div><p className="font-black text-red-800 text-sm">Danger Zone</p><p className="text-xs text-red-600 mt-0.5">These actions are irreversible. Be careful.</p></div></div>
            <button onClick={()=>{if(confirm('Delete ALL bookings? This cannot be undone.'))apiFetch('/api/leads/all',{method:'DELETE'}).catch(e=>alert(e.message));}} className="w-full py-3 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all">🗑 Delete All Bookings</button>
            <button onClick={()=>{localStorage.removeItem('adminAuth');window.location.href='/admin/login';}} className="w-full py-3 rounded-xl bg-gray-800 text-white text-sm font-bold hover:bg-gray-900 transition-all">🔒 Logout</button>
          </div>
        </div>
      )}
    </>
  );
};
