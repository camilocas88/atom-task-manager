import { User } from '../entities/user.entity';

/**
 * Interfaz del repositorio de usuarios (Port)
 * Define el contrato para las operaciones de persistencia de usuarios
 * Siguiendo el principio de Inversión de Dependencias (SOLID)
 */
export interface IUserRepository {
  /**
   * Busca un usuario por su correo electrónico
   * @param email - Correo electrónico del usuario
   * @returns Usuario encontrado o null si no existe
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Crea un nuevo usuario en el sistema
   * @param email - Correo electrónico del usuario
   * @returns Usuario creado con su ID asignado
   */
  create(email: string): Promise<User>;

  /**
   * Busca un usuario por su ID
   * @param id - Identificador único del usuario
   * @returns Usuario encontrado o null si no existe
   */
  findById(id: string): Promise<User | null>;
}
