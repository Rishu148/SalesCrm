import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { useAuth } from "../context/authContext";
import LeadModal from "../pages/LeadModal";
import {
  Plus,
  Search,
  Phone,
  MessageCircle,
  Mail,
  X,
  Loader2,
  FileSpreadsheet,
  LayoutGrid,
  FileUp,
  Download,
  Users,
  Filter,
  AlertCircle,
  UserX,
  CheckCircle,
  XCircle,
  Trash2,
  ChevronDown,
  RefreshCw,
  Zap,
  Lock,
  Check,
} from "lucide-react";

// --- CUSTOM TOAST ---
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-[120] flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-2xl backdrop-blur-xl animate-in slide-in-from-right-10 duration-300 ${type === "success"
          ? "bg-[#0A0A0C]/95 border-emerald-500/20 text-emerald-400"
          : "bg-[#0A0A0C]/95 border-rose-500/20 text-rose-400"
        }`}
    >
      <div
        className={`p-1 rounded-full ${type === "success" ? "bg-emerald-500/10" : "bg-rose-500/10"}`}
      >
        {type === "success" ? <CheckCircle size={16} /> : <XCircle size={16} />}
      </div>
      <span className="font-medium text-sm text-slate-200">{message}</span>
    </div>
  );
};

// --- CUSTOM CHECKBOX ---
const SmoothCheckbox = ({ checked, onChange, disabled }) => (
  <div
    onClick={(e) => {
      e.stopPropagation();
      if (disabled) return;
      onChange();
    }}
    className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-200 ${disabled
        ? "bg-slate-900 border-slate-700 cursor-not-allowed opacity-30"
        : "cursor-pointer " +
        (checked
          ? "bg-indigo-600 border-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.4)]"
          : "bg-transparent border-slate-600 hover:border-slate-400")
      }`}
  >
    {!disabled && (
      <Check
        size={10}
        className={`text-white transition-transform duration-200 ${checked ? "scale-100" : "scale-0"}`}
        strokeWidth={4}
      />
    )}
    {disabled && <Lock size={8} className="text-slate-500" />}
  </div>
);

const Contacts = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  // States
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Lead Details Modal State
  const [selectedLeadForModal, setSelectedLeadForModal] = useState(null);

  // Quick Select State
  const [showQuickSelectModal, setShowQuickSelectModal] = useState(false);
  const [quickCount, setQuickCount] = useState(5);
  const [quickFilterType, setQuickFilterType] = useState("Unassigned");

  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewUnassignedOnly, setViewUnassignedOnly] = useState(false);

  const [selectedAgent, setSelectedAgent] = useState("");
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    source: "Manual",
    status: "New",
  });

  const fileInputRef = useRef(null);
  const notify = (message, type = "success") => setToast({ message, type });

  const isReassigning = selectedLeads.some((id) => {
    const lead = leads.find((l) => l._id === id);
    return lead && lead.assignedTo;
  });

  // 🔥 FIX 1: fetchData ab 'showLoader' parameter lega.
  // Default true hai (pehli baar ke liye), lekin update ke baad hum false bhejenge.
  const fetchData = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true); // Sirf zaroorat padne par loading dikhaye

      const leadsRes = await api.get("/leads");
      setLeads(leadsRes.data);

      if (user?.role === "admin") {
        const agentsRes = await api.get("/leads/agents");
        setAgents(agentsRes.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // 🔥 FIX 2: Handle Update correctly
  const handleUpdateSingleLead = async (id, updatedData) => {
    try {
      // 1. API Update
      await api.put(`/leads/${id}`, updatedData);

      // 2. Modal ke andar ka data turant update karo (Taaki refresh na ho)
      setSelectedLeadForModal((prev) => ({ ...prev, ...updatedData }));

      // 3. Background me list refresh karo (Bina skeleton loader ke)
      fetchData(false);

      notify("Contact updated successfully");
    } catch (err) {
      notify("Update failed", "error");
    }
  };

  const handleDeleteSingleLead = async (id) => {
    try {
      await api.delete(`/leads/${id}`);
      setSelectedLeadForModal(null);
      fetchData(false); // No loader
      notify("Contact deleted");
    } catch (err) {
      notify("Delete failed", "error");
    }
  };

  // Bulk Handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/leads", { ...formData, status: "New" });
      setShowAddModal(false);
      setFormData({
        name: "",
        phone: "",
        email: "",
        source: "Manual",
        status: "New",
      });
      fetchData(false); // No loader
      notify("Lead added successfully!");
    } catch (error) {
      notify("Failed to add lead.", "error");
    }
  };

  const handleAssignLeads = async () => {
    if (!selectedAgent) return notify("Please select an agent.", "error");
    try {
      await api.put("/leads/assign", {
        leadIds: selectedLeads,
        assignedTo: selectedAgent,
      });
      setShowAssignModal(false);
      setSelectedLeads([]);
      fetchData(false); // No loader
      notify("Assigned successfully!");
    } catch (err) {
      notify("Assignment failed.", "error");
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete("/leads/bulk-delete", {
        data: { leadIds: selectedLeads },
      });
      setShowDeleteModal(false);
      setSelectedLeads([]);
      fetchData(false); // No loader
      notify("Leads deleted permanently.", "success");
    } catch (err) {
      notify("Delete failed.", "error");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append("file", file);
    try {
      const res = await api.post("/leads/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      notify(`Imported ${res.data.added} leads!`);
      setShowImportModal(false);
      fetchData(false); // No loader
    } catch (err) {
      notify("Upload failed.", "error");
    } finally {
      setUploading(false);
    }
  };

  const downloadSample = async () => {
    try {
      const res = await api.get("/leads/template", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Lead_Template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      notify("Template downloaded!");
    } catch (err) {
      notify("Download failed.", "error");
    }
  };

  // --- QUICK SELECT LOGIC ---
  const getLeadsByQuickFilter = () => {
    return leads.filter((l) => {
      if (l.status === "Closed") return false;
      if (quickFilterType === "Unassigned") return !l.assignedTo;
      return l.status === quickFilterType;
    });
  };

  const availableQuickLeads = getLeadsByQuickFilter();
  const maxQuickSelect = availableQuickLeads.length;

  const handleQuickSelect = (e) => {
    e.preventDefault();
    if (maxQuickSelect === 0) {
      setShowQuickSelectModal(false);
      return notify(`No active leads found for '${quickFilterType}'.`, "error");
    }
    const count = Math.min(parseInt(quickCount), maxQuickSelect);
    const leadsToSelect = availableQuickLeads.slice(0, count).map((l) => l._id);
    setSelectedLeads(leadsToSelect);

    if (quickFilterType === "Unassigned") {
      setViewUnassignedOnly(true);
    } else {
      setViewUnassignedOnly(false);
      setStatusFilter(quickFilterType);
    }
    setShowQuickSelectModal(false);
    notify(`${count} leads selected! Ready for action.`);
  };

  const toggleRowSelection = (id) => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id],
    );
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm);
    const matchesStatus =
      statusFilter === "All" || lead.status === statusFilter;
    const matchesAssignment = viewUnassignedOnly ? !lead.assignedTo : true;
    return matchesSearch && matchesStatus && matchesAssignment;
  });

  const unassignedCount = leads.filter(
    (l) => !l.assignedTo && l.status !== "Closed",
  ).length;
  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : "?");
  const getSelectableLeads = () =>
    filteredLeads.filter((l) => l.status !== "Closed");

  const getStatusStyle = (status) => {
    switch (status) {
      case "New":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Contacted":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "Interested":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "Closed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]";
      case "Lost":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  if (loading) return <ContactsSkeleton />;

  return (
    <div className="min-h-screen bg-[#030303] text-slate-300 font-sans selection:bg-indigo-500/30 scroll-smooth">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-[#030303]/80 backdrop-blur-md border-b border-white/5 px-8 py-5">
        <div className="max-w-[1600px] mx-auto flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              <div className="p-2 bg-[#0F0F12] rounded-xl border border-white/10 shadow-inner">
                <Users className="text-indigo-400" size={20} />
              </div>
              Contacts
            </h1>
            <p className="text-slate-500 mt-1.5 text-xs flex items-center gap-3 font-medium tracking-wide">
              <span className="flex items-center gap-1.5">
                <LayoutGrid size={12} /> {leads.length} Leads
              </span>
              {user?.role === "admin" && (
                <>
                  <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                  <span className="text-rose-400 flex items-center gap-1.5 px-2 py-0.5 bg-rose-950/20 rounded border border-rose-500/10">
                    <AlertCircle size={12} /> {unassignedCount} Action Required
                  </span>
                </>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full xl:w-auto">
            {user?.role === "admin" && (
              <>
                <button
                  onClick={() => {
                    setQuickFilterType("Unassigned");
                    setQuickCount(5);
                    setShowQuickSelectModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0F0F12] hover:bg-slate-900 text-amber-400 border border-amber-500/20 hover:border-amber-500/40 rounded-lg transition-all text-sm font-bold shadow-lg shadow-amber-900/10 cursor-pointer active:scale-95"
                >
                  <Zap size={14} className="fill-amber-400/20" /> Quick Select
                </button>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0F0F12] hover:bg-slate-900 text-slate-300 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-all text-sm font-medium cursor-pointer"
                >
                  <FileSpreadsheet size={16} className="text-emerald-500" />{" "}
                  Import
                </button>
              </>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all text-sm font-bold shadow-lg shadow-indigo-900/20 cursor-pointer active:scale-95"
            >
              <Plus size={16} strokeWidth={3} /> Add Lead
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-[1600px] mx-auto px-8 py-8 space-y-6 relative z-10 pb-32">
        {/* Filters and Table code remain the same... just referencing filteredLeads */}
        <div className="flex flex-col md:flex-row gap-4 bg-[#0A0A0C]/60 p-2 rounded-2xl border border-white/5 backdrop-blur-xl shadow-sm">
          <div className="relative flex-1 group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#050505] border border-white/5 group-focus-within:border-indigo-500/50 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none transition-all placeholder:text-slate-700"
            />
          </div>
          <div className="flex gap-3">
            {user?.role === "admin" && (
              <button
                onClick={() => setViewUnassignedOnly(!viewUnassignedOnly)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer ${viewUnassignedOnly ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-[#050505] text-slate-400 border-white/10 hover:border-white/20 hover:text-white"}`}
              >
                <UserX size={14} />{" "}
                {viewUnassignedOnly ? "Unassigned Only" : "Unassigned"}
              </button>
            )}
            <div className="relative w-48 group">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                size={14}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[#050505] border border-white/5 group-focus-within:border-indigo-500/50 rounded-lg py-2.5 pl-9 pr-8 text-sm text-white focus:outline-none appearance-none cursor-pointer hover:bg-white/5 transition-all [&>option]:bg-[#0A0A0C] [&>option]:text-slate-200"
              >
                <option value="All">All Statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Interested">Interested</option>
                <option value="Closed">Closed</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-[#0A0A0C]/60 border border-white/5 rounded-xl overflow-hidden shadow-sm relative z-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#050505] text-slate-500 border-b border-white/5 text-[10px] uppercase tracking-wider font-semibold">
                  {user?.role === "admin" && (
                    <th className="px-6 py-4 w-12 text-center">
                      <div className="flex justify-center">
                        <SmoothCheckbox
                          checked={
                            selectedLeads.length > 0 &&
                            selectedLeads.length === getSelectableLeads().length
                          }
                          onChange={() => {
                            const selectable = getSelectableLeads();
                            if (selectedLeads.length === selectable.length)
                              setSelectedLeads([]);
                            else setSelectedLeads(selectable.map((l) => l._id));
                          }}
                        />
                      </div>
                    </th>
                  )}
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Source</th>
                  {user?.role === "admin" && (
                    <th className="px-6 py-4 font-medium">Agent</th>
                  )}
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-20">
                      <Loader2
                        className="animate-spin mx-auto text-indigo-500"
                        size={24}
                      />
                    </td>
                  </tr>
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="text-center py-20 text-slate-600"
                    >
                      <p>No matching leads found.</p>
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const isClosed = lead.status === "Closed";
                    const isSelected = selectedLeads.includes(lead._id);
                    return (
                      <tr
                        key={lead._id}
                        onClick={(e) => {
                          if (
                            e.target.closest("a") ||
                            e.target.closest("button") ||
                            e.target.closest("input")
                          )
                            return;
                          setSelectedLeadForModal(lead);
                        }}
                        className={`group transition-all duration-200 border-l-[3px] ${isClosed
                            ? "bg-emerald-500/5 border-l-emerald-500/50 cursor-pointer"
                            : isSelected
                              ? "bg-indigo-500/10 border-l-indigo-500 cursor-pointer"
                              : "border-l-transparent hover:bg-white/[0.02] hover:border-l-indigo-500/50 cursor-pointer"
                          }`}
                      >
                        {user?.role === "admin" && (
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center">
                              <SmoothCheckbox
                                checked={isSelected}
                                onChange={() => toggleRowSelection(lead._id)}
                                disabled={isClosed}
                              />
                            </div>
                          </td>
                        )}
                        <td
                          className="px-6 py-4 cursor-pointer"
                          onClick={(e) => {
                            if (user?.role === "admin" && !isClosed) {
                              e.stopPropagation();
                              toggleRowSelection(lead._id);
                            }
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold border transition-all ${isSelected ? "bg-indigo-500 text-white border-indigo-400 scale-110 shadow-lg shadow-indigo-500/30" : "bg-[#0F0F12] text-slate-400 border-white/10 group-hover:border-white/20"}`}
                            >
                              {isSelected ? (
                                <Check size={14} />
                              ) : (
                                getInitials(lead.name)
                              )}
                            </div>
                            <p
                              className={`font-medium text-sm transition-colors ${isSelected ? "text-indigo-300 font-bold" : "text-slate-200 group-hover:text-white"}`}
                            >
                              {lead.name}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-0.5">
                            <p className="text-xs font-mono text-slate-400 flex items-center gap-2">
                              {lead.phone}
                            </p>
                            {lead.email && (
                              <p className="text-[10px] text-slate-500 truncate max-w-[150px]">
                                {lead.email}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] text-slate-400 font-medium">
                            {lead.source}
                          </span>
                        </td>
                        {user?.role === "admin" && (
                          <td className="px-6 py-4">
                            {lead.assignedTo ? (
                              <div className="flex items-center gap-2 bg-[#050505] w-fit px-2 py-1 rounded-lg border border-white/5">
                                <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-400">
                                  {getInitials(lead.assignedTo.name)}
                                </div>
                                <span className="text-xs text-slate-300 font-medium">
                                  {lead.assignedTo.name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 flex items-center gap-1.5 w-fit font-medium">
                                <AlertCircle size={10} /> Unassigned
                              </span>
                            )}
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${isClosed ? "border-slate-800 text-slate-700 bg-transparent" : getStatusStyle(lead.status)}`}
                          >
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {!isClosed ? (
                            <div className="flex justify-end gap-1.5 transition-opacity">
                              <a
                                href={`tel:${lead.phone}`}
                                className="p-1.5 bg-[#0A0A0C] border border-white/10 rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-500 text-slate-500 transition-all cursor-pointer"
                              >
                                <Phone size={14} />
                              </a>
                              <a
                                href={`https://wa.me/${lead.phone}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 bg-[#0A0A0C] border border-white/10 rounded-lg hover:bg-emerald-500 hover:text-white hover:border-emerald-500 text-slate-500 transition-all cursor-pointer"
                              >
                                <MessageCircle size={14} />
                              </a>
                              {lead.email && (
                                <a
                                  href={`mailto:${lead.email}`}
                                  className="p-1.5 bg-[#0A0A0C] border border-white/10 rounded-lg hover:bg-rose-500 hover:text-white hover:border-rose-500 text-slate-500 transition-all cursor-pointer"
                                >
                                  <Mail size={14} />
                                </a>
                              )}
                            </div>
                          ) : (
                            <div className="flex justify-end opacity-20">
                              <Lock size={14} />
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FLOAT ADMIN BAR */}
      {selectedLeads.length > 0 && user?.role === "admin" && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#0F0F12] border border-white/10 shadow-2xl rounded-xl px-4 py-2 flex items-center gap-4 animate-in slide-in-from-bottom-6 z-[100]">
          <span className="text-sm font-bold text-white pl-2">
            {selectedLeads.length} selected
          </span>
          <div className="h-6 w-[1px] bg-white/10"></div>
          <button
            onClick={() => setShowAssignModal(true)}
            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all active:scale-95 shadow-lg cursor-pointer"
          >
            {isReassigning ? <RefreshCw size={14} /> : <Users size={14} />}{" "}
            {isReassigning ? "Reassign" : "Assign"}
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="text-rose-400 hover:text-rose-300 font-medium text-sm flex items-center gap-2 hover:bg-rose-500/10 px-3 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 size={16} /> Delete
          </button>
          <button
            onClick={() => setSelectedLeads([])}
            className="ml-2 text-slate-400 hover:text-white cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* ALL MODALS (Included the rest of the existing modals here...) */}
      {selectedLeadForModal && (
        <LeadModal
          lead={selectedLeadForModal}
          onClose={() => setSelectedLeadForModal(null)}
          onUpdate={handleUpdateSingleLead}
          onDelete={handleDeleteSingleLead}
          currentUser={user}
        />
      )}

      {/* (Baki saare modals same rahenge: QuickSelect, Assign, AddLead, Delete, Import) */}
      {showQuickSelectModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setShowQuickSelectModal(false)}
        >
          <div
            className="bg-[#0A0A0C] border border-white/10 w-full max-w-sm rounded-2xl p-6 shadow-2xl shadow-amber-900/10 relative animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowQuickSelectModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white cursor-pointer bg-white/5 rounded-full p-1"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <Zap className="text-amber-400 fill-amber-400" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Power Select</h3>
                <p className="text-xs text-slate-400">Target specific leads.</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] text-amber-400/80 font-bold uppercase tracking-wider mb-2 block">
                  Target Group
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-[#050505] border border-white/10 text-white p-3 rounded-xl appearance-none cursor-pointer focus:border-amber-500 focus:outline-none transition-all font-medium [&>option]:bg-[#0A0A0C]"
                    value={quickFilterType}
                    onChange={(e) => {
                      setQuickFilterType(e.target.value);
                      setQuickCount(
                        Math.min(
                          5,
                          availableQuickLeads.length > 0
                            ? availableQuickLeads.length
                            : 0,
                        ),
                      );
                    }}
                  >
                    <option value="Unassigned">Unassigned Leads</option>
                    <option value="New">New Status</option>
                    <option value="Contacted">Contacted Status</option>
                    <option value="Interested">Interested Status</option>
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                    size={16}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-2 text-right">
                  {maxQuickSelect} available leads
                </p>
              </div>
              <div>
                <label className="text-[10px] text-amber-400/80 font-bold uppercase tracking-wider mb-3 block flex justify-between">
                  <span>Selection Count</span>
                  <span className="text-white font-mono bg-white/10 px-2 py-0.5 rounded">
                    {quickCount}
                  </span>
                </label>
                <input
                  type="range"
                  min="1"
                  max={maxQuickSelect > 0 ? maxQuickSelect : 1}
                  value={quickCount}
                  onChange={(e) => setQuickCount(parseInt(e.target.value))}
                  disabled={maxQuickSelect === 0}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex gap-2 mt-4">
                  {[5, 10, 25, "All"].map((val) => {
                    const countVal = val === "All" ? maxQuickSelect : val;
                    if (
                      typeof val === "number" &&
                      val > maxQuickSelect &&
                      maxQuickSelect > 0
                    )
                      return null;
                    return (
                      <button
                        key={val}
                        onClick={() => setQuickCount(countVal)}
                        disabled={maxQuickSelect === 0}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${quickCount === countVal ? "bg-amber-500/20 text-amber-400 border-amber-500/50" : "bg-[#050505] text-slate-500 border-white/10 hover:bg-white/5"}`}
                      >
                        {val === "All" ? "MAX" : val}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={handleQuickSelect}
                className="w-full bg-amber-500 hover:bg-amber-400 text-black py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2"
                disabled={maxQuickSelect === 0}
              >
                <CheckCircle size={18} />{" "}
                {maxQuickSelect === 0
                  ? "No Leads Available"
                  : `SELECT ${quickCount} LEADS`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Re-use other modals (Assign, Add, Delete, Import) exactly as they were in previous code */}
      {showAssignModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowAssignModal(false)}
        >
          <div
            className="bg-[#0A0A0C] border border-white/10 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAssignModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-white mb-1">Assign Agent</h3>
            <p className="text-slate-500 text-xs mb-4">
              Assigning {selectedLeads.length} leads.
            </p>
            <select
              className="w-full bg-[#050505] border border-white/10 text-white p-3 rounded-lg mb-4 outline-none focus:border-indigo-500 text-sm cursor-pointer [&>option]:bg-[#0A0A0C]"
              onChange={(e) => setSelectedAgent(e.target.value)}
              value={selectedAgent}
            >
              <option value="">Select Agent...</option>
              {agents.map((agent) => (
                <option key={agent._id} value={agent._id}>
                  {agent.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleAssignLeads}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-[#0A0A0C] p-6 rounded-2xl border border-white/10 w-full max-w-lg shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-slate-500 hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>
            <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <Plus size={20} className="text-indigo-500" /> Add New Contact
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Name
                  </label>
                  <input
                    className="w-full bg-[#050505] border border-white/10 p-2.5 rounded-lg text-white outline-none focus:border-indigo-500 text-sm"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Phone
                  </label>
                  <input
                    className="w-full bg-[#050505] border border-white/10 p-2.5 rounded-lg text-white outline-none focus:border-indigo-500 text-sm"
                    placeholder="+91..."
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full bg-[#050505] border border-white/10 p-2.5 rounded-lg text-white outline-none focus:border-indigo-500 text-sm"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Source
                </label>
                <select
                  className="w-full bg-[#050505] border border-white/10 p-2.5 rounded-lg text-white outline-none focus:border-indigo-500 text-sm cursor-pointer [&>option]:bg-[#0A0A0C]"
                  value={formData.source}
                  onChange={(e) =>
                    setFormData({ ...formData, source: e.target.value })
                  }
                >
                  <option>Manual</option>
                  <option>Facebook</option>
                  <option>Website</option>
                  <option>Referral</option>
                </select>
              </div>
              <button className="w-full bg-white text-black py-3 rounded-lg font-bold text-sm hover:bg-slate-200 transition-all mt-2 cursor-pointer shadow-lg">
                Save Contact
              </button>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-[#0A0A0C] border border-red-500/20 w-full max-w-xs rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white mb-2 text-center">
              Delete Leads?
            </h3>
            <p className="text-slate-500 text-xs mb-6 text-center">
              Are you sure you want to delete {selectedLeads.length} items? This
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-bold cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showImportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setShowImportModal(false)}
        >
          <div
            className="bg-[#0A0A0C] p-8 rounded-3xl border border-white/10 w-full max-w-md shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px] pointer-events-none"></div>
            <button
              onClick={() => setShowImportModal(false)}
              className="absolute top-5 right-5 text-slate-500 hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>
            <div className="relative z-10">
              <h2 className="text-white font-bold text-xl mb-1 flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <FileSpreadsheet size={20} className="text-emerald-500" />
                </div>{" "}
                Bulk Import
              </h2>
              <p className="text-slate-500 text-xs mb-6 ml-11">
                Add multiple contacts via Excel/CSV.
              </p>
              <div className="space-y-4">
                <div className="bg-[#050505] p-4 rounded-xl border border-white/5 flex justify-between items-center group hover:border-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-xs border border-white/5">
                      1
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Download Template
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        Get the correct format.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={downloadSample}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer flex items-center gap-1 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 transition-all"
                  >
                    <Download size={12} /> Download
                  </button>
                </div>
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-emerald-500 hover:bg-emerald-500/5 rounded-2xl h-40 flex flex-col items-center justify-center cursor-pointer transition-all group relative overflow-hidden"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    hidden
                    accept=".csv, .xlsx"
                    onChange={handleFileUpload}
                  />
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2
                        size={32}
                        className="text-emerald-500 animate-spin"
                      />
                      <span className="text-xs text-emerald-400 font-bold">
                        Processing Data...
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                        <FileUp
                          size={20}
                          className="text-slate-400 group-hover:text-emerald-400"
                        />
                      </div>
                      <p className="text-sm text-white font-bold">
                        Click to Upload File
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Supports .xlsx, .csv
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ContactsSkeleton = () => (
  <div className="min-h-screen bg-[#020202] relative overflow-hidden font-mono">
    <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
    <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.8)] animate-[scanline_2.5s_linear_infinite] z-50"></div>
    <style>{`@keyframes scanline { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }`}</style>
    <div className="sticky top-0 z-30 border-b border-cyan-900/30 bg-[#020202]/90 backdrop-blur-md px-8 py-5">
      <div className="max-w-[1600px] mx-auto flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-cyan-900/20 border-l-4 border-cyan-500 rounded-r"></div>
          <div className="h-3 w-32 bg-cyan-900/10 rounded"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-32 bg-cyan-900/10 border border-cyan-500/20 rounded-lg hidden md:block"></div>
          <div className="h-10 w-32 bg-cyan-500/20 border border-cyan-500/30 rounded-lg"></div>
        </div>
      </div>
    </div>
    <div className="max-w-[1600px] mx-auto px-8 py-8 space-y-6 relative z-10">
      <div className="flex gap-4 p-2 rounded-2xl border border-cyan-900/20 bg-[#050505]">
        <div className="h-10 flex-1 bg-cyan-900/10 rounded-xl border border-cyan-500/10"></div>
        <div className="h-10 w-32 bg-cyan-900/10 rounded-xl border border-cyan-500/10 hidden md:block"></div>
        <div className="h-10 w-48 bg-cyan-900/10 rounded-xl border border-cyan-500/10"></div>
      </div>
      <div className="border border-cyan-800/30 rounded-xl overflow-hidden bg-[#050505] shadow-[0_0_15px_rgba(6,182,212,0.05)]">
        <div className="flex items-center px-6 py-4 border-b border-cyan-900/30 bg-cyan-900/5 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={`h-3 bg-cyan-500/20 rounded ${i === 1 ? "w-32" : "w-24"} ${i > 4 ? "hidden md:block" : ""}`}
            ></div>
          ))}
        </div>
        <div className="divide-y divide-cyan-900/20">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="flex items-center px-6 py-4 gap-4 relative overflow-hidden group"
            >
              <div className="w-4 h-4 rounded border border-cyan-500/30 bg-cyan-900/10"></div>
              <div className="w-32 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-900/20 border border-cyan-500/20"></div>
                <div className="h-3 w-20 bg-cyan-900/30 rounded"></div>
              </div>
              <div className="w-40 flex-1">
                <div className="h-3 w-28 bg-cyan-900/20 rounded mb-1.5"></div>
                <div className="h-2 w-20 bg-cyan-900/10 rounded"></div>
              </div>
              <div className="w-24 hidden md:block">
                <div className="h-6 w-16 bg-cyan-900/10 border border-cyan-500/10 rounded-md"></div>
              </div>
              <div className="w-24">
                <div className="h-6 w-20 bg-cyan-500/10 border-l-2 border-cyan-400 rounded-r-md"></div>
              </div>
              <div className="w-20 flex justify-end gap-2">
                <div className="w-6 h-6 rounded bg-cyan-900/10"></div>
                <div className="w-6 h-6 rounded bg-cyan-900/10"></div>
              </div>
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default Contacts;
