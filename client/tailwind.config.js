// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cinnamon: {
          DEFAULT: '#7B3F00',
          light: '#D6A77A',
          bg: '#FFF8F0',
          hover: '#5c2c00',
          glass:   "rgba(255,250,242,0.8)",
        },
      },
      animation: {
        'spin-slow': 'spin 6s linear infinite',
        'spin-fast': 'spin 1s linear infinite',
      },
    },
  },
  plugins: [],
};
