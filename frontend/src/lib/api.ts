import axios from "axios";
import { parseCookies, destroyCookie } from "nookies"; // setCookie gerekirse eklenir diye duruyordu

// Backend API URL (Environment variable'dan alınır, yoksa default localhost)
// .NET Web API default port: 5058 (HTTP) based on launchsettings
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5058/api";

export const api = axios.create({
    baseURL: BACKEND_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor (Giden her isteğe Token ekler)
api.interceptors.request.use((config) => {
    // Sadece client tarafında ya da ctx objesi alarak çalışabilir (Client-side usage focus)
    const cookies = parseCookies();
    const token = cookies.token;

    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response Interceptor (Eğer 401 gelirse oturum sonlandırılır)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Token expried veya geçersiz api yanıtı
        if (error.response && error.response.status === 401) {
            destroyCookie(null, "token", { path: '/' });
            // Sadece tarayıcıdaysak login sayfasına yönlendir
            if (typeof window !== "undefined") {
                // Eğer zaten login sayfasındaysak loop'a girmesin
                if (window.location.pathname !== '/login') {
                    window.location.href = "/login";
                }
            }
        }
        return Promise.reject(error);
    }
);
