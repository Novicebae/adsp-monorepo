export interface Repository<E extends object, V, I = string> {
  delete(entity: E): Promise<boolean>
  get(id: I): Promise<E>
  save(entity: E): Promise<E>
}
