import axios from "axios";
import { API_URL } from "@/lib/config";
import { useEffect, useState } from "react";

// search all users on server (waits 300ms after user stops typing)
const useSearchUsers = (searchQuery) => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const query = searchQuery.trim();
        if (!query) {
            setResults([]);
            setLoading(false);
            return;
        }

        let cancelled = false; // ignore old results when user types again
        setLoading(true);
        const timer = setTimeout(async () => {
            try {
                const res = await axios.get(`${API_URL}/user/search?q=${encodeURIComponent(query)}`, { withCredentials: true });
                if (!cancelled && res.data.success) {
                    setResults(res.data.users);
                }
            } catch (error) {
                console.log(error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }, 300);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        }
    }, [searchQuery]);

    return { results, loading };
};

export default useSearchUsers;
