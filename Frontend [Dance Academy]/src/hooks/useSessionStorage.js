import { useState } from "react";

function useSessionStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = sessionStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch {
            return initialValue;
        }
    });

    function setValue(value) {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            sessionStorage.setItem(key, JSON.stringify(valueToStore));
            setStoredValue(valueToStore);
        } catch (err) {
            console.error(err);
        }
    }

    function removeValue() {
        sessionStorage.removeItem(key);
        setStoredValue(initialValue);
    }

    return [storedValue, setValue, removeValue];
}

export default useSessionStorage;
