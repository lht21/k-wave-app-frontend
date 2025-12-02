import { CultureCategory, CultureItem } from '../types/culture';

export const mockCultureCategories: CultureCategory[] = [
  {
    id: 'all',
    title: 'Tất cả',
    icon: '🌟',
    color: '#4CAF50',
    description: 'Tất cả chủ đề văn hóa',
    items: []
  },
  {
    id: 'music',
    title: 'Âm nhạc',
    icon: '🎵',
    color: '#E91E63',
    description: 'K-pop, nhạc truyền thống và văn hóa âm nhạc',
    items: []
  },
  {
    id: 'food',
    title: 'Ẩm thực',
    icon: '🍜',
    color: '#FF9800',
    description: 'Món ăn, văn hóa ăn uống Hàn Quốc',
    items: []
  },
  {
    id: 'travel',
    title: 'Du lịch',
    icon: '🏯',
    color: '#2196F3',
    description: 'Địa điểm, truyền thống du lịch',
    items: []
  },
  {
    id: 'lifestyle',
    title: 'Điện ảnh',
    icon: '🎬',
    color: '#9C27B0',
    description: 'K-drama, phim ảnh và giải trí',
    items: []
  }
];

export const mockCultureItems: CultureItem[] = [
  // K-pop và Âm nhạc
  {
    id: 'kpop-origin',
    categoryId: 'music',
    title: 'Nguồn gốc của K-Pop',
    subtitle: 'Seo Taiji and Boys',
    description: 'Tìm hiểu về nguồn gốc và sự phát triển của K-pop từ những năm 1990',
    content: 'K-pop (Korean Popular Music) bắt đầu từ đầu những năm 1990 với nhóm nhạc Seo Taiji and Boys. Họ đã mang đến một làn gió mới cho ngành công nghiệp âm nhạc Hàn Quốc bằng cách kết hợp hip-hop, rock và các yếu tố âm nhạc phương Tây...',
    image: 'https://example.com/kpop-origin.jpg',
    tags: ['âm nhạc', 'lịch sử', 'giải trí'],
    difficulty: 'beginner'
  },
  {
    id: 'traditional-music',
    categoryId: 'music',
    title: 'Âm nhạc truyền thống',
    subtitle: 'Gugak và các nhạc cụ dân tộc',
    description: 'Khám phá âm nhạc truyền thống Hàn Quốc với gayageum, haegeum',
    content: 'Gugak là thuật ngữ chỉ âm nhạc truyền thống Hàn Quốc. Các nhạc cụ truyền thống như gayageum (đàn tranh), haegeum (nhị), và janggu (trống) đã tồn tại hàng nghìn năm...',
    tags: ['âm nhạc', 'truyền thống', 'văn hóa'],
    difficulty: 'intermediate'
  },

  // Sunbae-Hoobae
  {
    id: 'sunbae-hoobae',
    categoryId: 'lifestyle',
    title: 'Văn hóa sunbae-hoobae',
    subtitle: '선배-후배',
    description: 'Tìm hiểu về mối quan hệ tiền bối - hậu bối trong xã hội Hàn Quốc',
    content: 'Ở Hàn Quốc có một văn hóa rất đặc trưng gọi là sunbae-hoobae (선배-후배). Sunbae có nghĩa là "tiền bối" - tức là những anh chị đi trước, có nhiều kinh nghiệm hơn. Hoobae là "hậu bối" - những người mới hơn, ít kinh nghiệm hơn...',
    tags: ['xã hội', 'văn hóa', 'giao tiếp'],
    difficulty: 'beginner'
  },

  // Ẩm thực
  {
    id: 'banchan',
    categoryId: 'food',
    title: 'Banchan (반찬)',
    subtitle: 'Món ăn phụ',
    description: 'Tìm hiểu về các món ăn phụ truyền thống trong bữa ăn Hàn Quốc',
    content: 'Banchan (반찬) là các món ăn phụ nhỏ được phục vụ cùng với cơm trong bữa ăn Hàn Quốc. Chúng thường bao gồm kimchi, namul (rau củ trộn), jorim (món hầm)...',
    tags: ['ẩm thực', 'truyền thống', 'văn hóa ăn'],
    difficulty: 'beginner'
  },
  {
    id: 'korean-dining',
    categoryId: 'food',
    title: 'Văn hóa ăn uống',
    subtitle: 'Phép lịch sự trên bàn ăn',
    description: 'Các quy tắc và phép lịch sự khi ăn uống trong văn hóa Hàn Quốc',
    content: 'Trong văn hóa Hàn Quốc, có nhiều quy tắc quan trọng khi ăn uống: không được cầm đũa và thìa cùng lúc, phải đợi người lớn tuổi nhất ăn trước...',
    tags: ['ẩm thực', 'phép lịch sự', 'văn hóa'],
    difficulty: 'intermediate'
  },

  // Du lịch
  {
    id: 'seasonal-travel',
    categoryId: 'travel',
    title: 'Du lịch theo mùa',
    subtitle: 'Trải nghiệm đa dạng',
    description: 'Khám phá Hàn Quốc qua 4 mùa với những trải nghiệm độc đáo',
    content: 'Hàn Quốc có 4 mùa rõ rệt, mỗi mùa mang đến những trải nghiệm du lịch khác nhau. Mùa xuân với hoa anh đào, mùa hè với các lễ hội, mùa thu với lá đỏ, mùa đông với tuyết trắng...',
    tags: ['du lịch', 'mùa', 'trải nghiệm'],
    difficulty: 'beginner'
  },
  {
    id: 'hanok-stay',
    categoryId: 'travel',
    title: 'Hanok Stay',
    subtitle: '한옥 스테이',
    description: 'Trải nghiệm ở nhà truyền thống Hàn Quốc',
    content: 'Hanok là kiểu nhà truyền thống của Hàn Quốc với kiến trúc độc đáo. Ngày nay, nhiều hanok đã được chuyển đổi thành nơi lưu trú cho du khách...',
    tags: ['du lịch', 'truyền thống', 'kiến trúc'],
    difficulty: 'intermediate'
  },
  {
    id: 'templestay',
    categoryId: 'travel',
    title: 'Templestay',
    subtitle: 'Tĩnh tâm ở chùa',
    description: 'Trải nghiệm cuộc sống tu hành tại các ngôi chùa Hàn Quốc',
    content: 'Templestay là chương trình cho phép du khách trải nghiệm cuộc sống tu hành tại các ngôi chùa Phật giáo. Đây là cơ hội tuyệt vời để tìm hiểu về Phật giáo và văn hóa tâm linh...',
    tags: ['du lịch', 'tâm linh', 'trải nghiệm'],
    difficulty: 'advanced'
  }
];

// Combine items into categories
mockCultureCategories.forEach(category => {
  if (category.id === 'all') {
    category.items = mockCultureItems;
  } else {
    category.items = mockCultureItems.filter(item => item.categoryId === category.id);
  }
});