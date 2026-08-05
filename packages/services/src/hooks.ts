import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { Entity, ID, Page, PageRequest } from "@esp/types";
import { keys, type EntityName } from "./keys";
import type { Repository } from "./repo/repository";

export interface EntityHooks<T extends Entity> {
  useList: (
    params?: PageRequest,
    options?: Partial<UseQueryOptions<Page<T>>>,
  ) => UseQueryResult<Page<T>, Error>;
  useGet: (id: ID | undefined) => UseQueryResult<T | undefined, Error>;
  useAll: () => UseQueryResult<T[], Error>;
  useCreate: () => UseMutationResult<
    T,
    Error,
    Omit<T, "id" | "createdAt" | "updatedAt" | "revision">
  >;
  useUpdate: () => UseMutationResult<T, Error, { id: ID; patch: Partial<Omit<T, "id" | "createdAt">> }>;
  useRemove: () => UseMutationResult<void, Error, ID>;
}

export function createHooks<T extends Entity>(
  name: EntityName,
  repo: Repository<T>,
): EntityHooks<T> {
  return {
    useList: (params = {}, options = {}) =>
      useQuery({
        queryKey: keys.collection(name, params),
        queryFn: () => repo.list(params),
        ...options,
      }),
    useGet: (id) =>
      useQuery({
        queryKey: keys.one(name, id),
        queryFn: () => repo.getById(id as ID),
        enabled: Boolean(id),
      }),
    useAll: () =>
      useQuery({
        queryKey: keys.collection(name, { pageSize: 1000 }),
        queryFn: () => repo.getAll(),
      }),
    useCreate: () => {
      const qc = useQueryClient();
      return useMutation({
        mutationFn: (input) => repo.create(input),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["esp", name] }),
      });
    },
    useUpdate: () => {
      const qc = useQueryClient();
      return useMutation({
        mutationFn: ({ id, patch }) => repo.update(id, patch),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["esp", name] }),
      });
    },
    useRemove: () => {
      const qc = useQueryClient();
      return useMutation({
        mutationFn: (id) => repo.remove(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["esp", name] }),
      });
    },
  };
}
