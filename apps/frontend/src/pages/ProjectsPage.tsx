import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Folder,
  MoreVertical,
  Search,
  Edit2,
  Trash2,
  Filter,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import CreateProjectModal from "../components/CreateProjectModal";
import EditProjectModal from "../components/EditProjectModal";
import type { Project } from "../types/project";
import type { User } from "../types/user";

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [canManage, setCanManage] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "ARCHIVED"
  >("ALL");

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user: User = JSON.parse(userStr);
      setCanManage(
        user.roles.some((r) => r.name === "ADMIN" || r.name === "MANAGER"),
      );
    }
    fetchProjects();

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await api.get("/projects");
      // Default sort by created date (newest first)
      const sortedProjects = response.data.sort(
        (a: Project, b: Project) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setProjects(sortedProjects);
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic Only (Search + Status)
  useEffect(() => {
    let result = [...projects];

    // 1. Search Filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(lower));
    }

    // 2. Status Filter
    if (statusFilter !== "ALL") {
      result = result.filter((p) => p.status === statusFilter);
    }

    setFilteredProjects(result);
  }, [searchTerm, statusFilter, projects]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      !window.confirm(
        "Are you sure? This will delete all tasks within this project.",
      )
    )
      return;
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
      setActiveDropdown(null);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete project");
    }
  };

  const toggleDropdown = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-flow-text-main">Projects</h2>
          <p className="text-sm text-flow-text-muted">
            Manage your workspaces and team goals
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-flow-blue text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-sm active:scale-95"
          >
            <Plus className="h-4 w-4" /> New Project
          </button>
        )}
      </div>

      {/* Toolbar: Search + Status Filter Only */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter with Label */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 border border-gray-300 rounded-lg">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-bold text-gray-600 whitespace-nowrap">
            Status:
          </span>
          <select
            data-testid="status-dropdown"
            className="bg-transparent text-sm focus:outline-none text-gray-700 font-medium cursor-pointer w-full sm:w-auto"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="ALL">All Projects</option>
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">Loading...</div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center p-16 border border-dashed border-gray-200 rounded-2xl">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Folder className="h-8 w-8 text-flow-text-muted" />
          </div>
          <h3 className="text-lg font-bold text-gray-700">No projects found</h3>
          <p className="text-flow-text-muted">
            Try adjusting your filters or search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="relative group"
              test-dataid="project-card"
            >
              <Link
                to={`/projects/${project.id}`}
                className="bg-white border border-flow-border p-6 rounded-xl shadow-sm hover:shadow-md transition-all block h-full"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-blue-50 p-2 rounded-lg group-hover:bg-flow-blue/10 transition-colors">
                    <Folder className="h-6 w-6 text-flow-blue" />
                  </div>
                  {canManage && (
                    <div className="relative">
                      <button
                        onClick={(e) => toggleDropdown(e, project.id)}
                        className="p-1 text-flow-text-muted hover:text-flow-text-main hover:bg-gray-100 rounded"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      {activeDropdown === project.id && (
                        <div
                          ref={dropdownRef}
                          className="absolute right-0 top-8 w-32 bg-white border border-gray-200 rounded-lg shadow-xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                        >
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setEditingProject(project);
                              setActiveDropdown(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Edit2 className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, project.id)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-flow-text-main mb-1 truncate">
                  {project.name}
                </h3>
                <p className="text-sm text-flow-text-muted line-clamp-2 h-10 mb-4">
                  {project.description}
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-flow-border">
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${project.status === "ARCHIVED" ? "bg-gray-100 text-gray-600" : "bg-green-50 text-green-600"}`}
                  >
                    {project.status || "ACTIVE"}
                  </span>
                  <span className="text-[11px] font-medium text-flow-text-muted">
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <CreateProjectModal
          onClose={() => setIsModalOpen(false)}
          onRefresh={fetchProjects}
        />
      )}
      {editingProject && (
        <EditProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onRefresh={fetchProjects}
        />
      )}
    </div>
  );
};

export default ProjectsPage;
