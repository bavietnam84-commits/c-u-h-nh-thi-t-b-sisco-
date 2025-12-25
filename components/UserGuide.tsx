
import React from 'react';

interface UserGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserGuide: React.FC<UserGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    {
      title: "1. Kết nối Thiết bị",
      icon: "fa-link",
      color: "text-blue-400",
      desc: "Chọn loại thiết bị (Switch, Firewall, WiFi, Modem) ở thanh bên trái và nhấn 'Connect Device' để kích hoạt trình điều khiển AI."
    },
    {
      title: "2. Kiểm tra Mạng",
      icon: "fa-network-wired",
      color: "text-emerald-400",
      desc: "Xem thông tin IP công cộng và độ trễ mạng ở bảng 'Chẩn Đoán Mạng' để đảm bảo môi trường kết nối ổn định."
    },
    {
      title: "3. Tạo Cấu hình bằng AI",
      icon: "fa-magic",
      color: "text-purple-400",
      desc: "Nhập yêu cầu bằng tiếng Việt (VD: 'Tạo VLAN 10 tên Kế Toán') vào ô văn bản hoặc chọn các mẫu có sẵn và nhấn 'Generate'."
    },
    {
      title: "4. Trợ lý Giọng nói",
      icon: "fa-microphone",
      color: "text-red-400",
      desc: "Nhấn 'Talk to Engineer' để trò chuyện trực tiếp với kỹ sư AI. Bạn có thể hỏi về giải pháp kỹ thuật hoặc nhờ giải thích các lệnh khó."
    },
    {
      title: "5. Tra cứu Lệnh Thủ công",
      icon: "fa-book",
      color: "text-yellow-400",
      desc: "Sử dụng bảng 'Hướng Dẫn Lệnh Thủ Công' để sao chép nhanh các cấu hình mẫu chuẩn Cisco mà không cần qua AI."
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Hướng Dẫn Sử Dụng</h2>
              <p className="text-xs text-slate-400">Hệ thống tự động hóa Cisco AI Pro v1.1</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {steps.map((step, idx) => (
              <div key={idx} className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-2xl hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <i className={`fas ${step.icon} ${step.color}`}></i>
                  <h3 className="font-bold text-slate-200 text-sm">{step.title}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex gap-4 items-start">
            <i className="fas fa-lightbulb text-blue-400 mt-1"></i>
            <div className="text-xs text-blue-200/80 leading-relaxed">
              <span className="font-bold text-blue-400 block mb-1">Mẹo nhỏ:</span>
              Bạn có thể sao chép nhanh toàn bộ lệnh CLI bằng nút Copy ở góc phải bảng Terminal. Mọi cấu hình tạo ra đều tuân thủ các tiêu chuẩn bảo mật cao nhất của Cisco.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/50 border-t border-slate-800 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-bold text-sm transition-all"
          >
            Đã hiểu, bắt đầu thôi!
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserGuide;
