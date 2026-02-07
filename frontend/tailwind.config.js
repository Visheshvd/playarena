/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0b0f14',
          card: '#1a1f26',
          border: '#2a2f36'
        },
        neon: {
          cyan: '#00f0ff',
          pink: '#ff00ff',
          purple: '#bf40bf',
          green: '#39ff14'
        }
      },
      fontFamily: {
        heading: ['Orbitron', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 240, 255, 0.5)',
        'neon-pink': '0 0 20px rgba(255, 0, 255, 0.5)',
        'neon-purple': '0 0 20px rgba(191, 64, 191, 0.5)',
        'neon-green': '0 0 20px rgba(57, 255, 20, 0.5)'
      }
    },
  },
  plugins: [],
}
