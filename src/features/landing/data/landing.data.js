import { Users, HeartHandshake, ShieldCheck, UserCheck, LineChart, ClipboardCheck } from 'lucide-react';

export const impactJourneys = [
  {
    id: 'connect',
    icon: Users,
    title: 'Kết nối & Theo dõi',
    description: 'Tham gia các cộng đồng sôi động và theo dõi những nhà tạo tác động phù hợp với giá trị cá nhân của bạn.',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    id: 'fund',
    icon: HeartHandshake,
    title: 'Tài trợ & Tình nguyện',
    description: 'Trực tiếp đóng góp quỹ hoặc cung cấp kỹ năng độc đáo của bạn cho các dự án cần hỗ trợ ngay lập tức.',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    id: 'organize',
    icon: ShieldCheck,
    title: 'Trở thành một Tổ chức',
    description: 'Khởi động phong trào xã hội của riêng bạn, dẫn dắt thay đổi và quản lý tác động của bạn với sự minh bạch hoàn toàn.',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  }
];

export const mockProjects = [
  {
    id: '1',
    category: 'Môi trường',
    categoryColor: 'bg-green-500',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    title: 'Sáng kiến trồng lại rừng Amazon',
    description: 'Giúp chúng tôi trồng 50.000 cây bản địa ở các khu vực bị suy thoái của lưu vực Amazon.',
    progress: 85,
    target: '$50,000'
  },
  {
    id: '2',
    category: 'Giáo dục',
    categoryColor: 'bg-blue-500',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    title: 'Chương trình Dạy chữ cho cộng đồng',
    description: 'Cung cấp các tài liệu đọc thiết yếu và hướng dẫn cho thanh niên thiếu may mắn.',
    progress: 45,
    target: '$12,000'
  },
  {
    id: '3',
    category: 'Sức khỏe',
    categoryColor: 'bg-red-500',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    title: 'Phòng khám sức khỏe di động',
    description: 'Một đơn vị di động để cung cấp kiểm tra y tế miễn phí cho các cộng đồng nông thôn xa xôi.',
    progress: 60,
    target: '$25,000'
  }
];

export const transparencyPromises = [
  { id: 'kyc', icon: UserCheck, text: 'Mọi tổ chức đều được xác minh KYC.' },
  { id: 'ledger', icon: LineChart, text: 'Mọi giao dịch được theo dõi trên sổ cái công khai của chúng tôi.' },
  { id: 'proof', icon: ClipboardCheck, text: 'Mỗi dự án đều yêu cầu bằng chứng giải ngân để phát hành quỹ.' },
];