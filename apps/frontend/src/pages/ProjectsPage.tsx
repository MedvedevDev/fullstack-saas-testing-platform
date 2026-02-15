import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Folder,
  MoreVertical,
  Search,
  Edit2,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import CreateProjectModal from "../components/CreateProjectModal";
import EditProjectModal from "../components/EditProjectModal"; // Import the new modal
import type { Project } from "../types/project";
import type { User } from "../types/user";

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Auth state
  const [canManage, setCanManage] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Dropdown state
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user: User = JSON.parse(userStr);
      const hasPermission = user.roles.some(
        (r) => r.name === "ADMIN" || r.name === "MANAGER",
      );
      setCanManage(hasPermission);
    }
    fetchProjects();

    // Close dropdown when clicking outside
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
      const sortedProjects = response.data.sort(
        (a: Project, b: Project) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setProjects(sortedProjects);
      setFilteredProjects(sortedProjects);
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      setFilteredProjects(
        projects.filter((p) => p.name.toLowerCase().includes(lower)),
      );
    } else {
      setFilteredProjects(projects);
    }
  }, [searchTerm, projects]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault(); // Prevent navigation to project details
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
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-flow-blue text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-sm active:scale-95"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search projects..."
          className="w-full sm:w-96 border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-pulse text-flow-text-muted font-medium">
            Loading projects...
          </div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white border border-dashed border-flow-border p-16 rounded-2xl text-center shadow-sm">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Folder className="h-8 w-8 text-flow-text-muted" />
          </div>
          <h3 className="text-lg font-bold text-flow-text-main">
            No projects found
          </h3>
          <p className="text-flow-text-muted mb-8 max-w-xs mx-auto">
            Try adjusting your search or create a new project.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="relative group">
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
                        className="p-1 text-flow-text-muted hover:text-flow-text-main hover:bg-gray-100 rounded transition-colors"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>

                      {/* Dropdown Menu */}
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
                  {project.description || "No description provided."}
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-flow-border">
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest ${
                      project.status === "ARCHIVED"
                        ? "bg-gray-100 text-gray-600"
                        : "bg-green-50 text-green-600"
                    }`}
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

      {isCreateModalOpen && (
        <CreateProjectModal
          onClose={() => setIsCreateModalOpen(false)}
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
