import { useState, useEffect, useRef, useCallback } from "react";

function useLocalStorage(key, initialValue) {
    const initialRef = useRef(initialValue);

    const read = useCallback(() => {
        try {
            const item = localStorage.getItem(key);
            return item !== null ? JSON.parse(item) : initialRef.current;
        } catch {
            return initialRef.current;
        }
    }, [key]);

    const [storedValue, setStoredValue] = useState(read);

    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(read()) : value;
            localStorage.setItem(key, JSON.stringify(valueToStore));
            setStoredValue(valueToStore);
            window.dispatchEvent(new CustomEvent("local-storage-update", { detail: { key } }));
        } catch {
            // silently fail in production
        }
    }, [key, read]);

    useEffect(() => {
        const handleUpdate = (e) => {
            if (e.detail?.key === key || e.key === key || e.type === "storage") {
                setStoredValue(read());
            }
        };
        window.addEventListener("local-storage-update", handleUpdate);
        window.addEventListener("storage", handleUpdate);
        return () => {
            window.removeEventListener("local-storage-update", handleUpdate);
            window.removeEventListener("storage", handleUpdate);
        };
    }, [key, read]);

    return [storedValue, setValue];
}

export default useLocalStorage;
