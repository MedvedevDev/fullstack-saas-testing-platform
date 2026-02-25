import { APIRequestContext, expect } from "@playwright/test";

/**
 * Helper class to interact with the Backend API directly
 * Used for test data setup and API-level testing
 */
export class ApiHelper {
  token: string = "";
  request: APIRequestContext;
  readonly baseUrl: string = "http://localhost:3001/api";

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  /**
   * Authenticates a user and stores the token for subsequent requests
   * @param email - User's email address
   * @param password - User's password
   */
  async login(email: string, password: string) {
    const response = await this.request.post(`${this.baseUrl}/auth/login`, {
      data: {
        email,
        password,
      },
    });
    expect(response.status()).toEqual(200);

    const body = await response.json();
    this.token = body.token;
  }

  /**
   * Creates a new project via API
   * @param name - Project name
   * @param description - Project description
   * @returns The created project object
   */
  async createProject(name: string, description: string) {
    const response = await this.request.post(`${this.baseUrl}/projects`, {
      data: {
        name,
        description,
        status: "ACTIVE",
      },
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
    expect(response.status()).toEqual(201);

    return await response.json();
  }

  /**
   * Updates an existing project.
   * @param projectId - The UUID of the project
   * @param data - Partial object containing fields to update
   */
  async updateProject(
    projectId: string,
    data: {
      name?: string;
      description?: string;
      status?: "ACTIVE" | "ARCHIVED";
    },
  ) {
    const response = await this.request.patch(
      `${this.baseUrl}/projects/${projectId}`,
      {
        data,
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      },
    );

    expect(response.status()).toEqual(200);
    return await response.json();
  }

  /**
   * Deletes a project by ID
   */
  async deleteProject(projectId: string) {
    const response = await this.request.delete(
      `${this.baseUrl}/projects/${projectId}`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      },
    );
    expect(response.status()).toEqual(204);
  }

  /**
   * Creates a new user in the system
   * @param firstName
   * @param lastName
   * @param email
   * @param role - 'ADMIN', 'MANAGER', or 'VIEWER'
   */
  async createUser(
    firstName: string,
    lastName: string,
    email: string,
    role: "ADMIN" | "MANAGER" | "VIEWER",
  ) {
    const response = await this.request.post(`${this.baseUrl}/users`, {
      data: {
        email,
        firstName,
        lastName,
        password: "password123",
        role,
      },
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
    expect(response.status()).toEqual(201);

    return await response.json();
  }

  /**
   * Deletes a user by ID
   */
  async deleteUser(userId: string) {
    const response = await this.request.delete(
      `${this.baseUrl}/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      },
    );
    expect(response.status()).toEqual(204);
  }

  /**
   * Creates a task within a specific project
   * @param projectId - The ID of the parent project
   * @param title - Task title
   */
  async createTask(projectId: string, title: string) {
    const response = await this.request.post(`${this.baseUrl}/tasks`, {
      data: {
        title,
        status: "TODO",
        priority: "HIGH",
        projectId,
      },
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
    expect(response.status()).toEqual(201);

    return await response.json();
  }

  /**
   * Updates an existing task
   * @param taskId - The UUID of the task
   * @param data - Partial object (title, status, priority)
   */
  async updateTask(
    taskId: string,
    data: { title?: string; status?: string; priority?: string },
  ) {
    const response = await this.request.patch(
      `${this.baseUrl}/tasks/${taskId}`,
      {
        data,
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      },
    );
    expect(response.status()).toEqual(200);
    return await response.json();
  }
}
