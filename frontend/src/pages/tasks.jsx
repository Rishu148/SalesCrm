import { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  Plus,
  X,
  Calendar,
  Flag,
  User,
  FileText,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
 
} from "lucide-react";

const API = "http://localhost:8080/api/taskManagement";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All Tasks");
  const [searchQuery, setSearchQuery] = useState("");

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "", 
    priority: "Medium",
    relatedToName: "",
    relatedToCompany: "",
    owner: "Alex Morgan",
  });

  /* ================= FETCH TASKS ================= */
  const fetchTasks = async () => {
    try {
      const res = await axios.get(API);
      setTasks(res.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  /* ================= ADD TASK ================= */
  const addTask = async () => {
    if (!newTask.title) {
      alert("Task title required");
      return;
    }

    try {
      await axios.post(API, {
        title: newTask.title,
        description: newTask.description,
        dueDate: newTask.dueDate,
        priority: newTask.priority,
        owner: newTask.owner,
        status: "Pending",
        relatedTo: {
          name: newTask.relatedToName,
          company: newTask.relatedToCompany,
        },
      });

      setShowModal(false);
      setNewTask({
        title: "",
        description: "",
        dueDate: "",
        priority: "Medium",
        relatedToName: "",
        relatedToCompany: "",
        owner: "Alex Morgan",
      });
      fetchTasks();
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Failed to add task");
    }
  };

  /* ================= DELETE TASK ================= */
  const deleteTask = async (taskId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API}/${taskId}`);

      // UI se bhi hata do (fast UX)
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task");
    }
  };

  /* ================= TOGGLE TASK STATUS ================= */
  const toggleTaskStatus = async (e, taskId, currentStatus) => {
    e.stopPropagation();
    try {
      const newStatus = currentStatus === "Completed" ? "Pending" : "Completed";
      await axios.patch(`${API}/${taskId}`, { status: newStatus });

      // Update local state immediately for better UX
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error("Error updating task:", error);
      // Fallback: refetch if patch fails
      fetchTasks();
    }
  };

  /* ================= STATS CALCULATION ================= */
  const pendingTasks = tasks.filter((t) => t.status !== "Completed").length;
  const completedToday = tasks.filter((t) => {
    if (t.status !== "Completed") return false;
    const updatedDate = t.updatedAt ? new Date(t.updatedAt) : null;
    return updatedDate && isToday(updatedDate);
  }).length;
  const overdueTasks = tasks.filter(
    (t) =>
      t.status !== "Completed" && t.dueDate && new Date(t.dueDate) < new Date()
  ).length;

  function isToday(date) {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  /* ================= FILTER TASKS ================= */
  const getFilteredTasks = () => {
    let filtered = tasks;

    if (selectedFilter === "High Priority") {
      filtered = filtered.filter((t) => t.priority === "High");
    } else if (selectedFilter === "Due Today") {
      filtered = filtered.filter(
        (t) => t.dueDate && isToday(new Date(t.dueDate))
      );
    } else if (selectedFilter === "Upcoming") {
      filtered = filtered.filter(
        (t) =>
          t.dueDate &&
          new Date(t.dueDate) > new Date() &&
          t.status !== "Completed"
      );
    } else if (selectedFilter === "Completed") {
      filtered = filtered.filter((t) => t.status === "Completed");
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.relatedTo?.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          t.relatedTo?.company
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredTasks = getFilteredTasks();

  /* ================= FORMAT DATE ================= */
  const formatDueDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (isToday(date)) {
      return `Today, ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    } else if (
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear()
    ) {
      return `Tomorrow, ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  /* ================= GET INITIALS ================= */
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  /* ================= GET AVATAR COLOR ================= */
  const getAvatarColor = (name) => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-indigo-500",
    ];
    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  return (
    <div className="flex flex-col h-screen bg-[#0A0E1A] overflow-hidden ">
      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="space-y-6">
          {/* HEADER WITH STATS */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Tasks Management
              </h1>
              <p className="text-slate-400">
                Track your daily activities, follow-ups, and reminders.
              </p>
            </div>

            <div className="flex gap-6">
              <div className="text-right">
                <p className="text-slate-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-white">{pendingTasks}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-sm">Completed Today</p>
                <p className="text-2xl font-bold text-blue-500">
                  {completedToday}
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-sm">Overdue</p>
                <p className="text-2xl font-bold text-red-500">
                  {overdueTasks}
                </p>
              </div>
            </div>
          </div>

          {/* SEARCH & ACTIONS */}
          <div className="flex justify-between items-center gap-4">
            <div className="relative flex-1 max-w-xl">
              <Search
                className="absolute left-4 top-3.5 text-slate-400"
                size={18}
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks, contacts, or deals..."
                className="w-full pl-11 py-3 rounded-lg bg-[#1E293B] border border-slate-700 text-white outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-3 bg-[#1E293B] hover:bg-[#334155] text-white rounded-lg border border-slate-700 transition-colors">
                <SlidersHorizontal size={18} /> Filters
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Plus size={18} /> Add New Task
              </button>
            </div>
          </div>

          {/* FILTER TABS */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[
              "All Tasks",
              "High Priority",
              "Due Today",
              "Upcoming",
              "Completed",
            ].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedFilter === filter
                    ? "bg-white text-slate-900"
                    : "bg-[#1E293B] text-slate-300 hover:bg-[#334155] border border-slate-700"
                }`}
              >
                {filter === "High Priority" && "❗ "}
                {filter === "Due Today" && "📅 "}
                {filter === "Upcoming" && "🔔 "}
                {filter === "Completed" && "✅ "}
                {filter}
              </button>
            ))}
          </div>

          {/* TASK TABLE */}
          <div className="bg-[#111827] rounded-xl overflow-hidden border border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#1E293B] text-slate-400 text-xs uppercase tracking-wider">
                  <tr>     
                    <th className="p-4 text-left w-12"></th>
                    <th className="p-4 text-left min-w-[250px]">
                      Task Description
                    </th>
                    <th className="p-4 text-left min-w-[200px]">Related To</th>
                    <th className="p-4 text-left min-w-[150px]">Due Date</th>
                    <th className="p-4 text-left min-w-[120px]">Priority</th>
                    <th className="p-4 text-left min-w-[100px]">Owner</th>
                  </tr>
                  
                </thead>
                <tbody>
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="p-8 text-center text-slate-400"
                      >
                        No tasks found
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((t) => (
                      <tr
                        key={t._id}
                        className={`border-t border-slate-800 hover:bg-[#1E293B]/50 transition-colors ${
                          t.status === "Completed" ? "opacity-60" : ""
                        }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={t.status === "Completed"}
                              onChange={(e) =>
                                toggleTaskStatus(e, t._id, t.status)
                              }
                              className="w-5 h-5 rounded border-2 border-slate-600 bg-[#0A0E1A] cursor-pointer accent-blue-600"
                              style={{
                                accentColor: "#2563eb",
                              }}
                            />
                          </div>
                        </td>

                        <td className="p-4">
                          <p
                            className={`font-semibold text-white mb-1 ${
                              t.status === "Completed" ? "line-through" : ""
                            }`}
                          >
                            {t.title}
                          </p>
                          <p className="text-xs text-slate-400">
                            {t.description || "No description"}
                          </p>
                        </td>

                        <td className="p-4">
                          {t.relatedTo?.name || t.relatedTo?.company ? (
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white ${getAvatarColor(
                                  t.relatedTo?.name
                                )}`}
                              >
                                {getInitials(t.relatedTo?.name)}
                              </div>
                              <div>
                                <p className="text-white text-sm font-medium">
                                  {t.relatedTo?.name || "-"}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {t.relatedTo?.company || "-"}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-slate-400" />
                            <span
                              className={`text-sm ${
                                t.dueDate &&
                                new Date(t.dueDate) < new Date() &&
                                t.status !== "Completed"
                                  ? "text-red-400 font-medium"
                                  : t.status === "Completed"
                                  ? "text-slate-500"
                                  : "text-white"
                              }`}
                            >
                              {t.status === "Completed"
                                ? "Completed"
                                : formatDueDate(t.dueDate)}
                            </span>
                          </div>
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              t.priority === "High"
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : t.priority === "Medium"
                                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            }`}
                          >
                            {t.priority}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                              {getInitials(t.owner)}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {filteredTasks.length > 0 && (
              <div className="flex justify-between items-center p-4 bg-[#0F172A] border-t border-slate-800">
                <p className="text-sm text-slate-400">
                  Showing 1 to {filteredTasks.length} of {filteredTasks.length}{" "}
                  tasks
                </p>
                <div className="flex gap-2">
                  <button className="p-2 rounded bg-[#1E293B] text-slate-400 hover:bg-[#334155] border border-slate-700 transition-colors">
                    <ChevronLeft size={18} />
                  </button>
                  <button className="px-3 py-2 rounded bg-blue-600 text-white font-medium">
                    1
                  </button>
                  <button className="px-3 py-2 rounded bg-[#1E293B] text-slate-400 hover:bg-[#334155] border border-slate-700 transition-colors">
                    2
                  </button>
                  <button className="px-3 py-2 rounded bg-[#1E293B] text-slate-400 hover:bg-[#334155] border border-slate-700 transition-colors">
                    3
                  </button>
                  <button className="p-2 rounded bg-[#1E293B] text-slate-400 hover:bg-[#334155] border border-slate-700 transition-colors">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= ADD TASK MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] w-full max-w-lg rounded-xl border border-slate-700 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* MODAL HEADER */}
            <div className="flex justify-between items-center sticky top-0 bg-[#0F172A] pb-4 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-white">Add New Task</h2>
              <button
                onClick={() => setShowModal(false)}
                className="hover:bg-slate-800 p-1 rounded transition-colors"
              >
                <X className="text-slate-400 hover:text-white" />
              </button>
            </div>

            {/* TITLE */}
            <div>
              <label className="text-sm text-slate-400 mb-1 block">
                Task Title *
              </label>
              <input
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                placeholder="Follow up on proposal sent"
                className="w-full p-3 rounded-lg bg-[#020617] border border-slate-700 text-white outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="text-sm text-slate-400 mb-1 block">
                Description
              </label>
              <textarea
                rows="3"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                placeholder="Check if they reviewed pricing"
                className="w-full p-3 rounded-lg bg-[#020617] border border-slate-700 text-white outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            {/* RELATED TO */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-400 flex gap-1 items-center mb-1">
                  <User size={14} /> Contact
                </label>
                <input
                  value={newTask.relatedToName}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      relatedToName: e.target.value,
                    })
                  }
                  placeholder="Sarah Connor"
                  className="w-full p-3 rounded-lg bg-[#020617] border border-slate-700 text-white outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 flex gap-1 items-center mb-1">
                  <FileText size={14} /> Company
                </label>
                <input
                  value={newTask.relatedToCompany}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      relatedToCompany: e.target.value,
                    })
                  }
                  placeholder="Tech Solutions Inc."
                  className="w-full p-3 rounded-lg bg-[#020617] border border-slate-700 text-white outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* DATE + PRIORITY */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-400 flex gap-1 items-center mb-1">
                  <Calendar size={14} /> Due Date
                </label>
                <input
                  type="datetime-local"
                  value={newTask.dueDate}
                  onChange={(e) =>
                    setNewTask({ ...newTask, dueDate: e.target.value })
                  }
                  className="w-full p-3 rounded-lg bg-[#020617] border border-slate-700 text-white outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 flex gap-1 items-center mb-1">
                  <Flag size={14} /> Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask({ ...newTask, priority: e.target.value })
                  }
                  className="w-full p-3 rounded-lg bg-[#020617] border border-slate-700 text-white outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addTask}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
              >
                Save Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;
