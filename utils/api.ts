import axios from "axios"

const api = axios.create({ baseURL: "/api", timeout: 150_000 })
api.interceptors.response.use((res) => res.data)

export default api
