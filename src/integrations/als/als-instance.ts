import { AsyncLocalStorage } from "async_hooks";

export const als = new AsyncLocalStorage<Map<string, any>>();

export function setValue(key: string, value: any) {
    const store = als.getStore();
    if (store) {
        store.set(key, value);
    } else {
        throw new Error("No hay un contexto ALS activo.");
    }
}

export function getValue<T = any>(key: string): T | undefined {
    const store = als.getStore();
    return store?.get(key) as T;
}

export function getRequiredValue<T = any>(key: string): T {
    const value = getValue<T>(key);
    if (value === undefined) {
        throw new Error(
            `El valor para la clave "${key}" no existe en el contexto ALS.`,
        );
    }
    return value;
}
