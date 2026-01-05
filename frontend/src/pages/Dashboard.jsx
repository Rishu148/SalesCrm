import { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Square,
  X,
  Trash2,
  Calendar,
  TrendingUp,
  CheckSquare,
} from "lucide-react";

const API = "http://localhost:8080/api/tasks";

function Dashboard() {
  const [showModal, setShowModal] = useState(false);
  const [tasks, setTasks] = useState([]);

  const [newTask, setNewTask] = useState({
    title: "",
    company: "",
    date: "",
    priority: "Low",
  });

  const fetchTasks = async () => {
    const res = await axios.get(API);
    setTasks(res.data);
  };

  const addTask = async () => {
    if (!newTask.title) return;
    await axios.post(API, newTask);
    setNewTask({ title: "", company: "", date: "", priority: "Low" });
    setShowModal(false);
    fetchTasks();
  };

  const toggleTask = async (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task._id === id ? { ...task, done: !task.done } : task
      )
    );

    try {
      await axios.put(`${API}/${id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id) => {
    await axios.delete(`${API}/${id}`);
    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Main Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Welcome back, Alex. Here's your day at a glance.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 px-5 py-2.5 rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} /> Add Quick Task
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-xl p-4 min-h-[200px] ">
        <StatCard
          title="Active Deals Value"
          value="$142,500"
          sub="+12% vs last month"
          icon={<TrendingUp />}
          color="text-green-400"
        />
        <StatCard
          title="Meetings This Week"
          value="18"
          sub="4 remaining today"
          icon={<Calendar />}
          color="text-blue-400"
        />
        <StatCard title="Monthly Goal Progress" value="78%" progress />
      </div>

      {/* ACTION CENTER */}
      <div className="bg-[#111827] rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">Action Center</h3>

        {tasks.map((task) => (
          <div
            key={task._id}
            className="flex justify-between items-center py-4 border-b border-white/10"
          >
            <div className="flex items-start gap-3">
              <div
                onClick={() => toggleTask(task._id)}
                className="cursor-pointer"
              >
                {task.done ? (
                  <CheckSquare className="text-blue-500 mt-1" />
                ) : (
                  <Square className="text-gray-500 mt-1" />
                )}
              </div>

              <div>
                <p
                  className={`font-semibold ${task.done && "line-through text-gray-500"
                    }`}
                >
                  {task.title}
                </p>
                <p className="text-sm text-gray-400">
                  {task.company || "No Company"} • {task.date || "No Date"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">
                {task.priority}
              </span>

              <Trash2
                size={16}
                className="text-red-400 cursor-pointer"
                onClick={() => deleteTask(task._id)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {/* ================= MODAL================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#0F172A] border border-white/10 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className="text-lg font-semibold">Create New Task</h3>
              <X
                size={18}
                className="cursor-pointer text-gray-400 hover:text-white"
                onClick={() => setShowModal(false)}
              />
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Task title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Follow up with client about proposal"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="w-full rounded-lg bg-[#111827] px-4 py-2.5 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Company / Client
                </label>
                <input
                  type="text"
                  placeholder="Tech Solutions Inc."
                  value={newTask.company}
                  onChange={(e) =>
                    setNewTask({ ...newTask, company: e.target.value })
                  }
                  className="w-full rounded-lg bg-[#111827] px-4 py-2.5 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Due date
                  </label>
                  <input
                    type="date"
                    value={newTask.date}
                    onChange={(e) =>
                      setNewTask({ ...newTask, date: e.target.value })
                    }
                    className="w-full rounded-lg bg-[#111827] px-4 py-2.5 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) =>
                      setNewTask({ ...newTask, priority: e.target.value })
                    }
                    className="w-full rounded-lg bg-[#111827] px-4 py-2.5 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    <option value="Low">Low priority</option>
                    <option value="Medium">Medium priority</option>
                    <option value="High">High priority</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/10">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg text-sm bg-white/5 hover:bg-white/10"
              >
                Cancel
              </button>

              <button
                onClick={addTask}
                className="px-5 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, sub, icon, color, progress }) {
  return (
    <div className="bg-[#111827] rounded-xl p-6">
      <div className="flex justify-between items-center mb-2">
        <p className="text-gray-400">{title}</p>
        {icon && <div className={color}>{icon}</div>}
      </div>

      <h3 className="text-3xl font-bold">{value}</h3>
      {sub && <p className="text-sm text-gray-400 mt-1">{sub}</p>}

      {progress && (
        <div className="mt-4 w-full h-2 bg-gray-700 rounded">
          <div className="h-2 bg-purple-500 rounded w-[78%]" />
        </div>
      )}
    </div>
  );
}

export default Dashboard;
