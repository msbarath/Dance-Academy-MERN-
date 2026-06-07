import { useState, useEffect, useRef } from "react";
import { coursesApi, studentsApi, eventsApi } from "../utils/api";

const CACHE_TTL    = 5 * 60 * 1000;
const RETRY_DELAY  = 30 * 1000;
const cache = { courses: [], studentCount: 0, events: [], loaded: false, loading: false, loadedAt: 0, failedAt: 0 };
const listeners = new Set();

function getSnapshot() {
    return { courses: cache.courses, studentCount: cache.studentCount, events: cache.events };
}

export function invalidateStore() {
    cache.loaded    = false;
    cache.loading   = false;
    cache.loadedAt  = 0;
    cache.failedAt  = 0;
    cache.courses      = [];
    cache.studentCount = 0;
    cache.events       = [];
    listeners.forEach(fn => fn(getSnapshot()));
}

async function loadStore() {
    const now     = Date.now();
    const expired = now - cache.loadedAt > CACHE_TTL;
    const recentFail = now - cache.failedAt < RETRY_DELAY;
    if ((cache.loaded && !expired) || cache.loading || recentFail) return;
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
        cache.loadedAt     = Date.now();
        cache.failedAt     = 0;
    } catch {
        cache.loaded   = false;
        cache.failedAt = Date.now();
    } finally {
        cache.loading = false;
        listeners.forEach(fn => fn(getSnapshot()));
    }
}

export function useStore() {
    const [state, setState] = useState(getSnapshot);
    const stateRef = useRef(setState);
    stateRef.current = setState;

    useEffect(() => {
        const fn = (snap) => stateRef.current(snap);
        listeners.add(fn);
        loadStore();
        return () => listeners.delete(fn);
    }, []);

    return state;
}
