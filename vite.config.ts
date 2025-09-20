import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'process.env': {
      NEXT_PUBLIC_CHAIN_ID: '11155111',
      NEXT_PUBLIC_RPC_URL: '"https://sepolia.infura.io/v3/b18fb7e6ca7045ac83c41157ab93f990"',
      NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID: '"2ec9743d0d0cd7fb94dee1a7e6d33475"',
      VITE_WALLET_CONNECT_PROJECT_ID: '"2ec9743d0d0cd7fb94dee1a7e6d33475"',
      NEXT_PUBLIC_INFURA_API_KEY: '"b18fb7e6ca7045ac83c41157ab93f990"',
    }
  },
}));
