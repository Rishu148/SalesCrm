import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { useAuth } from "../context/authContext";
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
  User,
  Filter,
  AlertCircle,
  UserX,
  CheckCircle,
  XCircle,
  Trash2,
  ChevronDown,
  RefreshCw,
  Zap,
  Layers,
  Check,
  AlertTriangle,
  ListFilter,
  Lock,
} from "lucide-react";

// --- CUSTOM TOAST ---
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-xl animate-in slide-in-from-right-10 duration-300 ${
        type === "success"
          ? "bg-slate-900/95 border-green-500/20 text-green-400 shadow-lg shadow-green-900/20"
          : "bg-slate-900/95 border-red-500/20 text-red-400 shadow-lg shadow-red-900/20"
      }`}
    >
      {type === "success" ? <CheckCircle size={20} /> : <XCircle size={20} />}
      <span className="font-medium text-sm text-slate-200">{message}</span>
    </div>
  );
};

// --- CUSTOM CHECKBOX ---
const SmoothCheckbox = ({ checked, onChange, disabled }) => (
  <div
    onClick={(e) => {
      if (disabled) return;
      e.stopPropagation();
      onChange();
    }}
    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
      disabled
        ? "border-slate-800 bg-slate-900 cursor-not-allowed opacity-50" // Locked Look
        : "cursor-pointer " +
          (checked
            ? "bg-blue-600 border-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)] scale-105"
            : "border-slate-600 bg-slate-800/50 hover:border-slate-400")
    }`}
  >
    {disabled ? (
      <Lock size={10} className="text-slate-600" />
    ) : (
      <Check
        size={12}
        className={`text-white transition-transform duration-200 ${checked ? "scale-100" : "scale-0"}`}
        strokeWidth={3.5}
      />
    )}
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

  // Quick Select State
  const [showQuickSelectModal, setShowQuickSelectModal] = useState(false);
  const [quickCount, setQuickCount] = useState(10);
  const [quickFilterType, setQuickFilterType] = useState("Unassigned");

  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewUnassignedOnly, setViewUnassignedOnly] = useState(false);

  const [selectedAgent, setSelectedAgent] = useState("");
  const [toast, setToast] = useState(null);

  // ⚡ FIXED: Default Status is always 'New', removed Status dropdown from UI
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const leadsRes = await api.get("/leads");
      setLeads(leadsRes.data);
      if (user?.role === "admin") {
        const agentsRes = await api.get("/leads/agents");
        setAgents(agentsRes.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // --- HANDLERS ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Force Status 'New' just in case
      await api.post("/leads", { ...formData, status: "New" });
      setShowAddModal(false);
      setFormData({
        name: "",
        phone: "",
        email: "",
        source: "Manual",
        status: "New",
      });
      fetchData();
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
      fetchData();
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
      fetchData();
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
      fetchData();
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

  // --- ADVANCED QUICK SELECT ---
  const getLeadsByQuickFilter = () => {
    return leads.filter((l) => {
      if (l.status === "Closed") return false; // 🔒 Never select Closed leads automatically
      if (quickFilterType === "Unassigned") return !l.assignedTo;
      return l.status === quickFilterType;
    });
  };

  const handleQuickSelect = (e) => {
    e.preventDefault();
    const availableLeads = getLeadsByQuickFilter();

    if (availableLeads.length === 0) {
      setShowQuickSelectModal(false);
      return notify(`No active leads found for '${quickFilterType}'.`, "error");
    }

    const count = Math.min(parseInt(quickCount), availableLeads.length);
    const leadsToSelect = availableLeads.slice(0, count).map((l) => l._id);

    setSelectedLeads(leadsToSelect);

    if (quickFilterType === "Unassigned") {
      setViewUnassignedOnly(true);
    } else {
      setViewUnassignedOnly(false);
      setStatusFilter(quickFilterType);
    }

    setShowQuickSelectModal(false);
    notify(`${count} '${quickFilterType}' leads selected!`);
  };

  const toggleRowSelection = (id) => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id],
    );
  };

  // --- FILTERS ---
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
  ).length; // Exclude closed
  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : "?");

  // Helper to get selectable leads only
  const getSelectableLeads = () =>
    filteredLeads.filter((l) => l.status !== "Closed");

  const getStatusStyle = (status) => {
    switch (status) {
      case "New":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Contacted":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Interested":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "Closed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"; // Closed style
      default:
        return "bg-slate-700 text-slate-300 border-slate-600";
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 min-h-screen bg-[#0B1220] text-white font-sans selection:bg-blue-500/30 pb-32 relative">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* === HEADER === */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Contacts Pipeline
          </h1>
          <p className="text-slate-400 mt-1 text-sm flex items-center gap-2">
            <LayoutGrid size={14} /> Total {leads.length} leads •{" "}
            <span className="text-red-400 font-bold">
              {unassignedCount} Actionable
            </span>
          </p>
        </div>

        <div className="flex gap-3 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0">
          {user?.role === "admin" && (
            <>
              <button
                onClick={() => {
                  setQuickFilterType("Unassigned");
                  setQuickCount(10);
                  setShowQuickSelectModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/20 rounded-xl transition-all text-sm font-bold whitespace-nowrap active:scale-95 shadow-lg shadow-amber-900/10 group"
              >
                <Zap
                  size={16}
                  className="fill-amber-400/20 group-hover:fill-amber-400 transition-colors"
                />{" "}
                Quick Select
              </button>

              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition-all text-sm font-medium whitespace-nowrap"
              >
                <FileSpreadsheet size={18} /> Import
              </button>
            </>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/20 transition-all text-sm font-bold whitespace-nowrap"
          >
            <Plus size={18} /> Add Lead
          </button>
        </div>
      </div>

      {/* === FILTERS BAR === */}
      <div className="flex flex-col md:flex-row gap-4 bg-slate-800/20 p-1.5 rounded-2xl border border-slate-700/30 backdrop-blur-md">
        <div className="relative flex-1">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
          />
        </div>

        {user?.role === "admin" && (
          <button
            onClick={() => setViewUnassignedOnly(!viewUnassignedOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
              viewUnassignedOnly
                ? "bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                : "bg-slate-900/50 text-slate-400 border-slate-700/50 hover:bg-slate-800"
            }`}
          >
            <UserX size={16} />{" "}
            {viewUnassignedOnly ? "Showing Unassigned" : "Show Unassigned Only"}
          </button>
        )}

        <div className="relative w-full md:w-48">
          <Filter
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 pl-10 pr-10 text-sm text-white focus:outline-none appearance-none cursor-pointer hover:bg-slate-800 transition-all"
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Interested">Interested</option>
            <option value="Closed">Closed</option>
            <option value="Lost">Lost</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
          />
        </div>
      </div>

      {/* === TABLE === */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-700/50 text-xs uppercase tracking-wider font-semibold">
                {user?.role === "admin" && (
                  <th className="px-6 py-4 w-14 text-center">
                    <SmoothCheckbox
                      // Logic: Checked if some selected AND length matches ONLY selectable items (not closed)
                      checked={
                        selectedLeads.length > 0 &&
                        selectedLeads.length === getSelectableLeads().length
                      }
                      onChange={() => {
                        const selectable = getSelectableLeads();
                        if (selectedLeads.length === selectable.length)
                          setSelectedLeads([]); // Deselect All
                        else setSelectedLeads(selectable.map((l) => l._id)); // Select All Active Only
                      }}
                    />
                  </th>
                )}
                <th className="px-6 py-4">Lead Details</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Source</th>
                {user?.role === "admin" && <th className="px-6 py-4">Agent</th>}
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-16">
                    <Loader2
                      className="animate-spin mx-auto text-blue-500"
                      size={32}
                    />
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-16 text-slate-500">
                    No matching leads.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const isClosed = lead.status === "Closed";
                  return (
                    <tr
                      key={lead._id}
                      onClick={(e) => {
                        if (isClosed) return; // 🔒 LOCK ROW CLICK
                        if (e.target.closest("a") || e.target.closest("button"))
                          return;
                        if (user?.role === "admin")
                          toggleRowSelection(lead._id);
                      }}
                      className={`group border-b border-slate-800/60 transition-all ${
                        isClosed
                          ? "bg-emerald-900/5 hover:bg-emerald-900/10 cursor-default" // Locked Style
                          : selectedLeads.includes(lead._id)
                            ? "bg-blue-900/20 border-blue-500/30 hover:bg-blue-900/30 cursor-pointer"
                            : "hover:bg-slate-800/40 cursor-pointer"
                      }`}
                    >
                      {user?.role === "admin" && (
                        <td className="px-6 py-4 text-center">
                          <SmoothCheckbox
                            checked={selectedLeads.includes(lead._id)}
                            onChange={() => toggleRowSelection(lead._id)}
                            disabled={isClosed} // 🔒 LOCK CHECKBOX
                          />
                        </td>
                      )}
                      <td className="px-6 py-4 font-medium text-slate-200">
                        {lead.name}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-400 text-xs">
                        {lead.phone}
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs truncate max-w-[150px]">
                        {lead.email || "-"}
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {lead.source}
                      </td>
                      {user?.role === "admin" && (
                        <td className="px-6 py-4">
                          {lead.assignedTo ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white">
                                {getInitials(lead.assignedTo.name)}
                              </div>
                              <span className="text-xs text-slate-300">
                                {lead.assignedTo.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20 flex items-center gap-1 w-fit">
                              <AlertCircle size={10} /> Unassigned
                            </span>
                          )}
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold border ${getStatusStyle(lead.status)}`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <a
                          href={`tel:${lead.phone}`}
                          className="p-1.5 bg-slate-800 rounded hover:bg-blue-500 hover:text-white transition-colors"
                        >
                          <Phone size={14} />
                        </a>
                        <a
                          href={`https://wa.me/${lead.phone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-slate-800 rounded hover:bg-green-500 hover:text-white transition-colors"
                        >
                          <MessageCircle size={14} />
                        </a>
                        {lead.email && (
                          <a
                            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${lead.email}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 bg-slate-800 rounded hover:bg-purple-500 hover:text-white transition-colors"
                          >
                            <Mail size={14} />
                          </a>
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

      {/* === BULK ACTION BAR === */}
      {selectedLeads.length > 0 && user?.role === "admin" && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#0f172a] border border-slate-600 shadow-2xl rounded-xl px-6 py-3 flex items-center gap-6 animate-in slide-in-from-bottom-6 z-50 ring-2 ring-blue-500/20">
          <span className="text-sm font-bold text-white">
            {selectedLeads.length} Selected
          </span>
          <div className="h-6 w-[1px] bg-slate-700"></div>
          <button
            onClick={() => setShowAssignModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg active:scale-95"
          >
            {isReassigning ? <RefreshCw size={16} /> : <Users size={16} />}
            {isReassigning ? "Reassign" : "Assign to Agent"}
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="text-red-400 hover:text-red-300 font-medium text-sm flex items-center gap-2"
          >
            <Trash2 size={16} /> Delete
          </button>
          <button
            onClick={() => setSelectedLeads([])}
            className="ml-2 text-slate-500 hover:text-slate-300"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* === QUICK SELECT MODAL === */}
      {showQuickSelectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0f172a] border border-slate-700 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95">
            <button
              onClick={() => setShowQuickSelectModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="mb-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <Zap className="text-amber-400" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Quick Select</h3>
                <p className="text-xs text-slate-400">
                  Grab specific leads in bulk.
                </p>
              </div>
            </div>

            {/* Filter Dropdown (Closed Removed) */}
            <div className="mb-5">
              <label className="text-xs text-slate-400 font-bold uppercase mb-2 flex items-center gap-1">
                <ListFilter size={12} /> Select From
              </label>
              <div className="relative">
                <select
                  className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl appearance-none cursor-pointer focus:border-amber-500 focus:outline-none transition-all"
                  value={quickFilterType}
                  onChange={(e) => setQuickFilterType(e.target.value)}
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
              <p className="text-[10px] text-amber-400 mt-1.5 text-right font-medium">
                {getLeadsByQuickFilter().length} leads available
              </p>
            </div>

            <label className="text-xs text-slate-400 font-bold uppercase mb-2 block">
              How many to select?
            </label>
            <div className="flex gap-2 mb-6">
              <input
                type="number"
                min="1"
                max={getLeadsByQuickFilter().length}
                className="flex-1 bg-slate-900 border border-slate-700 text-white p-3 rounded-xl focus:border-amber-500 focus:outline-none font-mono text-center text-lg"
                value={quickCount}
                onChange={(e) => setQuickCount(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-4 gap-2 mb-6">
              {[10, 20, 50, 100].map((num) => (
                <button
                  key={num}
                  onClick={() =>
                    setQuickCount(Math.min(num, getLeadsByQuickFilter().length))
                  }
                  className="bg-slate-800 text-xs font-bold text-slate-300 py-2 rounded-lg hover:bg-slate-700 border border-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={num > getLeadsByQuickFilter().length}
                >
                  {num}
                </button>
              ))}
            </div>

            <button
              onClick={handleQuickSelect}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black py-3 rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={getLeadsByQuickFilter().length === 0}
            >
              Select Top {Math.min(quickCount, getLeadsByQuickFilter().length)}{" "}
              Leads
            </button>
          </div>
        </div>
      )}

      {/* === ASSIGN MODAL === */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-slate-700 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95">
            <button
              onClick={() => setShowAssignModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-white mb-1">Assign Leads</h3>
            <p className="text-slate-400 text-sm mb-6">
              Assigning <b>{selectedLeads.length}</b> leads.
            </p>
            <label className="text-xs text-slate-400 font-bold uppercase mb-2 block">
              Select Agent
            </label>
            <select
              className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl mb-6 focus:outline-none focus:border-blue-500"
              onChange={(e) => setSelectedAgent(e.target.value)}
              value={selectedAgent}
            >
              <option value="">Choose an agent...</option>
              {agents.map((agent) => (
                <option key={agent._id} value={agent._id}>
                  {agent.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleAssignLeads}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-all"
            >
              Confirm Assignment
            </button>
          </div>
        </div>
      )}

      {/* === ADD LEAD MODAL (Status Removed) === */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#0f172a] p-8 rounded-2xl border border-slate-700 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <h2 className="text-white font-bold text-xl flex items-center gap-2">
                <Plus size={20} className="text-blue-500" /> Add New Lead
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">
                    Name *
                  </label>
                  <input
                    className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-blue-500 transition-all"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">
                    Phone *
                  </label>
                  <input
                    className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-blue-500 transition-all"
                    placeholder="+91 999..."
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-blue-500 transition-all"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">
                  Source
                </label>
                <select
                  className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-blue-500 cursor-pointer"
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
              {/* Status input removed (auto-set to New) */}
              <button className="w-full bg-blue-600 py-3.5 rounded-xl text-white font-bold hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all active:scale-95 mt-2">
                Save Customer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* === DELETE & IMPORT MODALS === */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0f172a] border border-red-500/30 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95 ring-1 ring-red-500/20">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
              <AlertTriangle className="text-red-500" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Delete {selectedLeads.length} Leads?
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              This action is permanent and cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-600/20 transition-all"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#0f172a] p-8 rounded-2xl border border-slate-700 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <h2 className="text-white font-bold text-xl flex items-center gap-2">
                <FileSpreadsheet size={20} className="text-emerald-500" />{" "}
                Import Leads
              </h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-6">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Step 1: Get Format
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Download Excel template.
                  </p>
                </div>
                <button
                  onClick={downloadSample}
                  className="flex gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-medium border border-slate-600 transition-colors"
                >
                  <Download size={14} /> Download
                </button>
              </div>
              <div
                onClick={() => fileInputRef.current.click()}
                className="border-2 border-dashed border-slate-600 hover:border-blue-500 hover:bg-slate-800/50 rounded-xl p-8 flex flex-col items-center cursor-pointer transition-all group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  accept=".csv, .xlsx"
                  onChange={handleFileUpload}
                />
                {uploading ? (
                  <Loader2
                    size={32}
                    className="text-blue-500 animate-spin mb-3"
                  />
                ) : (
                  <FileUp
                    size={32}
                    className="text-slate-500 group-hover:text-blue-400 mb-3 transition-colors"
                  />
                )}
                <p className="text-sm text-slate-300 font-medium">
                  {uploading
                    ? "Importing Data..."
                    : "Click to Upload Excel / CSV"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;
