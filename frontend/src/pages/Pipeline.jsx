import { useState, useEffect } from "react";
import axios from "axios";
import { Search, Plus, Clock, Phone, Mail, X, Filter, MoreVertical, GripVertical } from "lucide-react";

const API = "http://localhost:8080/api/deals";

function Pipeline() {
  const [deals, setDeals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [draggedOver, setDraggedOver] = useState(null);
  
  const [newDeal, setNewDeal] = useState({
    title: "",
    company: "",
    price: "",
    stage: "Qualification",
    tag: "NEW",
    color: "blue",
    action: "",
    icon: "clock",
  });

  /* ================= FETCH ================= */
  const fetchDeals = async () => {
    try {
      const res = await axios.get(API);
      setDeals(res.data);
    } catch (error) {
      console.error("Error fetching deals:", error);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  /* ================= ADD ================= */
  const addDeal = async () => {
    if (!newDeal.title || !newDeal.company || !newDeal.price) return;
    try {
      await axios.post(API, newDeal);
      setShowModal(false);
      setNewDeal({
        title: "",
        company: "",
        price: "",
        stage: "Qualification",
        tag: "NEW",
        color: "blue",
        action: "",
        icon: "clock",
      });
      fetchDeals();
    } catch (error) {
      console.error("Error adding deal:", error);
    }
  };

  /* ================= DRAG ================= */
  const handleDrop = async (dealId, stage) => {
    try {
      await axios.put(`${API}/${dealId}`, { stage });
      fetchDeals();
      setDraggedOver(null);
    } catch (error) {
      console.error("Error updating deal:", error);
    }
  };

  /* ================= GROUP ================= */
  const stages = ["Qualification", "Discovery", "Proposal", "Negotiation", "Closed"];
  
  const grouped = stages.map((stage) => ({
    stage,
    deals: deals.filter(
      (d) =>
        d.stage === stage &&
        (d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.company.toLowerCase().includes(searchTerm.toLowerCase()))
    ),
  }));

  // Calculate stats
  const totalValue = deals.reduce(
    (sum, d) => sum + (parseFloat(d.price?.replace(/[^0-9.-]+/g, "")) || 0),
    0
  );

  return (
    <div className="flex flex-col h-screen bg-[#0A0E1A]">
      <div className="flex flex-col h-full px-8 py-6 gap-6">
        {/* HEADER */}
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Sales Pipeline
              </h1>
              <p className="text-slate-400">
                Track your opportunities and manage deal flow.
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-slate-400 mb-1">Total Value</p>
                <p className="text-3xl font-bold text-white">
                  ${(totalValue / 1000000).toFixed(1)}M
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400 mb-1">Open Deals</p>
                <p className="text-3xl font-bold text-blue-500">{deals.length}</p>
              </div>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500"
                size={20}
              />
              <input
                type="text"
                placeholder="Search deals, companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#1A1F2E] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-3 bg-[#1A1F2E] border border-slate-700 text-slate-300 rounded-lg hover:bg-[#252A3A] transition-colors">
              <Filter size={18} />
              Filters
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus size={18} />
              Add Opportunity
            </button>
          </div>
        </div>

        {/* PIPELINE */}
        <div className="flex gap-5 overflow-x-auto flex-1 pb-4 custom-scrollbar">
          {grouped.map((s) => (
            <Stage
              key={s.stage}
              stage={s.stage}
              deals={s.deals}
              onDrop={handleDrop}
              draggedOver={draggedOver === s.stage}
              setDraggedOver={setDraggedOver}
            />
          ))}
        </div>

        {/* MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1A1F2E] border border-slate-700 p-8 rounded-xl w-full max-w-lg space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">Add Opportunity</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">
                    Deal Title
                  </label>
                  <input
                    placeholder="e.g., Enterprise License Deal"
                    value={newDeal.title}
                    className="w-full p-3 bg-[#0A0E1A] border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) =>
                      setNewDeal({ ...newDeal, title: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">
                    Company Name
                  </label>
                  <input
                    placeholder="e.g., Acme Corp"
                    value={newDeal.company}
                    className="w-full p-3 bg-[#0A0E1A] border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) =>
                      setNewDeal({ ...newDeal, company: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">
                    Deal Value
                  </label>
                  <input
                    placeholder="e.g., $50,000"
                    value={newDeal.price}
                    className="w-full p-3 bg-[#0A0E1A] border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) =>
                      setNewDeal({ ...newDeal, price: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Stage</label>
                  <select
                    value={newDeal.stage}
                    className="w-full p-3 bg-[#0A0E1A] border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) =>
                      setNewDeal({ ...newDeal, stage: e.target.value })
                    }
                  >
                    {stages.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">
                      Action
                    </label>
                    <input
                      placeholder="e.g., Follow up"
                      value={newDeal.action}
                      className="w-full p-3 bg-[#0A0E1A] border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) =>
                        setNewDeal({ ...newDeal, action: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Icon</label>
                    <select
                      value={newDeal.icon}
                      className="w-full p-3 bg-[#0A0E1A] border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) =>
                        setNewDeal({ ...newDeal, icon: e.target.value })
                      }
                    >
                      <option value="clock">Clock</option>
                      <option value="phone">Phone</option>
                      <option value="mail">Mail</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Tag</label>
                  <select
                    value={newDeal.tag}
                    className="w-full p-3 bg-[#0A0E1A] border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) =>
                      setNewDeal({ ...newDeal, tag: e.target.value })
                    }
                  >
                    <option value="NEW">NEW</option>
                    <option value="HOT">HOT</option>
                    <option value="UPSELL">UPSELL</option>
                    <option value="INBOUND">INBOUND</option>
                    <option value="REFERRAL">REFERRAL</option>
                    <option value="URGENT">URGENT</option>
                    <option value="STRATEGIC">STRATEGIC</option>
                  </select>
                </div>
              </div>

              <button
                onClick={addDeal}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Create Opportunity
              </button>
            </div>
          </div>
        )}
      </div>

     
    </div>
  );
}

export default Pipeline;

/* ================= STAGE COMPONENT ================= */

function Stage({ stage, deals, onDrop, draggedOver, setDraggedOver }) {
  const stageColors = {
    Qualification: "bg-slate-500",
    Discovery: "bg-blue-500",
    Proposal: "bg-amber-500",
    Negotiation: "bg-orange-500",
    Closed: "bg-emerald-500",
  };

  return (
    <div 
      onDragOver={(e) => {
        e.preventDefault();
        setDraggedOver(stage);
      }}
      onDragLeave={() => setDraggedOver(null)}
      onDrop={(e) => {
        onDrop(e.dataTransfer.getData("id"), stage);
      }}
      className={`min-w-[340px] bg-[#111827] rounded-xl p-4 transition-all duration-200 ${
        draggedOver ? "ring-2 ring-blue-500 bg-blue-500/10 scale-[1.02]" : ""
      }`}
    >
      {/* Stage Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${stageColors[stage]}`}></div>
          <h3 className="font-semibold text-white">{stage}</h3>
          <span className="text-slate-500 text-sm">{deals.length}</span>
        </div>
        <button className="p-1 hover:bg-slate-700 rounded transition-colors">
          <MoreVertical size={16} className="text-slate-500" />
        </button>
      </div>

      {/* Deal Cards */}
      <div className="space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto pr-2 stage-scrollbar">
        {deals.length === 0 ? (
          <div className="text-center py-8 text-slate-600">
            <p className="text-sm">No deals</p>
          </div>
        ) : (
          deals.map((deal) => <DealCard key={deal._id} deal={deal} />)
        )}
      </div>
    </div>
  );
}

/* ================= DEAL CARD COMPONENT ================= */

function DealCard({ deal }) {
  const icons = {
    phone: <Phone size={14} />,
    mail: <Mail size={14} />,
    clock: <Clock size={14} />,
  };

  const tagStyles = {
    NEW: "bg-blue-600 text-blue-100",
    HOT: "bg-amber-600 text-amber-100",
    UPSELL: "bg-purple-600 text-purple-100",
    INBOUND: "bg-violet-600 text-violet-100",
    REFERRAL: "bg-pink-600 text-pink-100",
    URGENT: "bg-red-600 text-red-100",
    STRATEGIC: "bg-rose-600 text-rose-100",
  };

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("id", deal._id);
        e.currentTarget.style.opacity = "0.4";
      }}
      onDragEnd={(e) => {
        e.currentTarget.style.opacity = "1";
      }}
      className="group bg-[#0F172A] border border-slate-700 rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-blue-500 transition-all duration-200"
    >
      {/* Tag and Grip */}
      <div className="flex justify-between items-start mb-3">
        <span
          className={`text-xs font-semibold px-2 py-1 rounded ${
            tagStyles[deal.tag] || tagStyles.NEW
          }`}
        >
          {deal.tag}
        </span>
        <GripVertical size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
      </div>

      {/* Title */}
      <h4 className="font-semibold text-white mb-1 leading-snug">
        {deal.title}
      </h4>

      {/* Company */}
      <p className="text-sm text-slate-400 mb-4">{deal.company}</p>

      {/* Price */}
      <div className="mb-4">
        <p className="text-xl font-bold text-white">{deal.price}</p>
      </div>

      {/* Action */}
      {deal.action && (
        <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-800/50 rounded-lg px-3 py-2">
          {icons[deal.icon]}
          <span>{deal.action}</span>
        </div>
      )}
    </div>
  );
}