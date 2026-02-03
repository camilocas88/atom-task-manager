/**
 * Entidad de dominio: Task
 * Representa una tarea del sistema de gestión de tareas
 */
export class Task {
  /**
   * Identificador único de la tarea
   */
  id: string;

  /**
   * Identificador del usuario propietario de la tarea
   */
  userId: string;

  /**
   * Título de la tarea
   */
  title: string;

  /**
   * Descripción detallada de la tarea
   */
  description: string;

  /**
   * Estado de completitud de la tarea
   */
  completed: boolean;

  /**
   * Fecha de creación de la tarea
   */
  createdAt: Date;

  /**
   * Fecha de última actualización de la tarea
   */
  updatedAt: Date;

  constructor(partial: Partial<Task>) {
    Object.assign(this, partial);
  }
}
