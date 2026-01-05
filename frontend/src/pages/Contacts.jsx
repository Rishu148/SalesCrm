import { Search, Plus, Filter, Mail, Phone, Linkedin } from "lucide-react";
import { useState } from "react";

function Contacts() {
  const [activeTab, setActiveTab] = useState("All");

  const contacts = [
    {
      name: "Sarah Connor",
      company: "Tech Solutions Inc.",
      email: "sarah.c@techsolutions.com",
      phone: "+1 (555) 001-2345",
      status: "Qualified",
      activity: "2 hours ago",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      name: "John Davis",
      company: "Global Corp",
      email: "john.davis@global.com",
      phone: "+1 (555) 987-6543",
      status: "New",
      activity: "Just now",
    },
    {
      name: "Michael Brown",
      company: "StartUp Labs",
      email: "michael.b@startup.io",
      phone: "+1 (555) 456-7890",
      status: "Contacted",
      activity: "3 days ago",
      avatar: "https://randomuser.me/api/portraits/men/46.jpg",
    },
    {
      name: "Emily Lewis",
      company: "Creative Agency",
      email: "emily@creative.net",
      phone: "+1 (555) 222-3333",
      status: "Unresponsive",
      activity: "2 weeks ago",
    },
  ];

  const badgeColor = {
    New: "bg-blue-500/20 text-blue-400",
    Contacted: "bg-yellow-500/20 text-yellow-400",
    Qualified: "bg-green-500/20 text-green-400",
    Unresponsive: "bg-gray-500/20 text-gray-400",
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contact Database</h1>
          <p className="text-gray-400">
            Manage your leads and track sales progress.
          </p>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10">
            <Filter size={16} /> Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">
            <Plus size={16} /> Add New Lead
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-3.5 text-gray-400" />
        <input
          placeholder="Search by name, email, or company..."
          className="w-full pl-11 py-3 rounded-xl bg-[#111827] border border-white/10 outline-none"
        />
      </div>

      {/* TABS */}
      <div className="flex gap-3">
        {["All", "New", "Contacted", "Qualified", "Unresponsive"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm ${
              activeTab === tab
                ? "bg-white text-black"
                : "bg-white/5 text-gray-300 hover:bg-white/10"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-[#111827] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-gray-400">
            <tr>
              <th className="p-4 text-left">NAME</th>
              <th className="p-4 text-left">CONTACT INFO</th>
              <th className="p-4 text-left">LEAD STATUS</th>
              <th className="p-4 text-left">SOCIAL</th>
              <th className="p-4 text-left">LAST ACTIVITY</th>
            </tr>
          </thead>

          <tbody>
            {contacts.map((c, i) => (
              <tr
                key={i}
                className="border-t border-white/10 hover:bg-white/5"
              >
                <td className="p-4 flex items-center gap-3">
                  {c.avatar ? (
                    <img
                      src={c.avatar}
                      className="w-9 h-9 rounded-full"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center font-semibold">
                      {c.name[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.company}</p>
                  </div>
                </td>

                <td className="p-4 space-y-1 text-gray-300">
                  <div className="flex items-center gap-2">
                    <Mail size={14} /> {c.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} /> {c.phone}
                  </div>
                </td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${badgeColor[c.status]}`}
                  >
                    {c.status}
                  </span>
                </td>

                <td className="p-4 text-blue-400 flex items-center gap-2">
                  <Linkedin size={16} /> LinkedIn
                </td>

                <td className="p-4 text-gray-400">
                  {c.activity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-400">
        Showing 1 to 5 of 1,248 results
      </p>
    </div>
  );
}

export default Contacts;
