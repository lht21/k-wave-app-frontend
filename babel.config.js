module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // ... các plugin khác của bạn (nếu có)
      'expo-router/babel', // <-- QUAN TRỌNG: Thêm dòng này
      'react-native-reanimated/plugin', // Nếu dùng drawer hoặc animation, dòng này phải ở cuối cùng
    ],
  };
};