import { useState, useEffect } from "react";
import { coursesApi, studentsApi, eventsApi } from "../utils/api";

const cache = { courses: [], studentCount: 0, events: [], loaded: false, loading: false };
const listeners = new Set();

function notify() {
    const snap = { courses: cache.courses, studentCount: cache.studentCount, events: cache.events };
    listeners.forEach(fn => fn(snap));
}

export function invalidateStore() {
    cache.loaded  = false;
    cache.loading = false;
    cache.courses      = [];
    cache.studentCount = 0;
    cache.events       = [];
    notify();
}

async function loadStore() {
    if (cache.loaded || cache.loading) return;
    cache.loading = true;
    try {
        const [c, s, e] = await Promise.all([
            coursesApi.getAll(),
            studentsApi.getCount(),
            eventsApi.getAll(),
        ]);
        cache.courses      = c.data.data  || [];
        cache.studentCount = s.data.count || 0;
        cache.events       = e.data.data  || [];
        cache.loaded       = true;
    } catch {
        cache.loaded = false;
    } finally {
        cache.loading = false;
        notify();
    }
}

export function useStore() {
    const [state, setState] = useState({
        courses:      cache.courses,
        studentCount: cache.studentCount,
        events:       cache.events,
    });

    useEffect(() => {
        listeners.add(setState);
        loadStore();
        return () => listeners.delete(setState);
    }, []);

    return state;
}
