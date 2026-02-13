import { useState, useEffect } from "react";
import { Plus, Folder, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom"; // Import Link
import api from "../api/axios";
import CreateProjectModal from "../components/CreateProjectModal";
import type { Project } from "../types/project";

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await api.get("/projects");
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

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-flow-text-main">Projects</h2>
          <p className="text-sm text-flow-text-muted">
            Manage your workspaces and team goals
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-flow-blue text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-sm active:scale-95"
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-pulse text-flow-text-muted font-medium">
            Loading projects...
          </div>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white border border-dashed border-flow-border p-16 rounded-2xl text-center shadow-sm">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Folder className="h-8 w-8 text-flow-text-muted" />
          </div>
          <h3 className="text-lg font-bold text-flow-text-main">
            No projects yet
          </h3>
          <p className="text-flow-text-muted mb-8 max-w-xs mx-auto">
            Create your first project to start organizing tasks and tracking
            progress.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-flow-blue font-bold hover:underline"
          >
            + Create your first project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              to={`/projects/${project.id}`}
              key={project.id}
              className="bg-white border border-flow-border p-6 rounded-xl shadow-sm hover:shadow-md transition-all group block"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 p-2 rounded-lg group-hover:bg-flow-blue/10 transition-colors">
                  <Folder className="h-6 w-6 text-flow-blue" />
                </div>
                {/* Note: This button might need a preventDefault if you add click logic later */}
                <button className="text-flow-text-muted hover:text-flow-text-main">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
              <h3 className="font-bold text-flow-text-main mb-1 truncate">
                {project.name}
              </h3>
              <p className="text-sm text-flow-text-muted line-clamp-2 h-10 mb-4">
                {project.description || "No description provided."}
              </p>
              <div className="flex justify-between items-center pt-4 border-t border-flow-border">
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded uppercase tracking-widest">
                  {project.status}
                </span>
                <span className="text-[11px] font-medium text-flow-text-muted">
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {isModalOpen && (
        <CreateProjectModal
          onClose={() => setIsModalOpen(false)}
          onRefresh={fetchProjects}
        />
      )}
    </div>
  );
};

export default ProjectsPage;
