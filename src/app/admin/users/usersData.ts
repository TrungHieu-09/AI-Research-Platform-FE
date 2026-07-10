export interface UserDetailItem {
  id: number
  name: string
  email: string
  role: "Student" | "Admin"
  status: "Active" | "Suspended"
  joinDate: string
  department?: string
  avatar: string
  phone: string
  location: string
  bio: string
  activity: Array<{
    action: string
    detail: string
    time: string
  }>
}

export const SYSTEM_USERS: UserDetailItem[] = [
  {
    id: 1,
    name: "Quản trị viên hệ thống (Admin Lumis)",
    email: "admin@fpt.edu.vn",
    role: "Admin",
    status: "Active",
    joinDate: "2023-09-01",
    department: "Hệ thống Lumis",
    avatar: "AD",
    phone: "+84 988 888 888",
    location: "FPT University HOL, Hanoi",
    bio: "Quản trị viên chính điều hành hệ thống AI Research Platform Lumis.",
    activity: [
      { action: "Cấu hình hệ thống", detail: "Cập nhật mô hình AI RAG mới nhất", time: "1 giờ trước" },
      { action: "Quản trị người dùng", detail: "Phê duyệt quyền truy cập hệ thống", time: "1 ngày trước" },
      { action: "Đăng nhập hệ thống", detail: "Hà Nội, Việt Nam", time: "2 ngày trước" },
    ],
  },
  {
    id: 2,
    name: "Nguyen Van A",
    email: "anv@fpt.edu.vn",
    role: "Student",
    status: "Active",
    joinDate: "2024-01-15",
    department: "Computer Science",
    avatar: "NA",
    phone: "+84 912 345 678",
    location: "FPT University HOL, Hanoi",
    bio: "Sinh viên chuyên ngành Khoa học Máy tính, định hướng nghiên cứu Trí tuệ Nhân tạo và Học máy.",
    activity: [
      { action: "Tải lên tài liệu", detail: "Deep_Learning_Paper_Review.pdf", time: "2 giờ trước" },
      { action: "Cập nhật hồ sơ", detail: "Cập nhật thông tin bio", time: "1 ngày trước" },
      { action: "Đăng nhập", detail: "Hà Nội, Việt Nam", time: "2 ngày trước" },
    ],
  },
  {
    id: 3,
    name: "Tran Thi B",
    email: "btt@fpt.edu.vn",
    role: "Student",
    status: "Active",
    joinDate: "2024-02-10",
    department: "Information Technology",
    avatar: "TB",
    phone: "+84 934 567 890",
    location: "FPT University HCMC Campus",
    bio: "Sinh viên ngành Công nghệ Thông tin, nghiên cứu hệ thống phân tán và bảo mật.",
    activity: [
      { action: "Tạo dự án mới", detail: "AI Research Dashboard", time: "3 giờ trước" },
      { action: "Tải xuống tài liệu", detail: "Cloud_Security_Guide.pdf", time: "2 ngày trước" },
    ],
  },
  {
    id: 4,
    name: "Le Van C",
    email: "clv@fpt.edu.vn",
    role: "Student",
    status: "Suspended",
    joinDate: "2024-03-05",
    department: "Software Engineering",
    avatar: "LC",
    phone: "+84 945 678 901",
    location: "FPT University Da Nang Campus",
    bio: "Sinh viên Kỹ thuật Phần mềm.",
    activity: [
      { action: "Tạm khóa tài khoản", detail: "Vi phạm quy định sử dụng tài nguyên AI", time: "5 ngày trước" },
    ],
  },
  {
    id: 5,
    name: "Pham Minh D",
    email: "dpm@fpt.edu.vn",
    role: "Student",
    status: "Active",
    joinDate: "2023-12-20",
    department: "Artificial Intelligence",
    avatar: "PD",
    phone: "+84 956 789 012",
    location: "FPT University HOL, Hanoi",
    bio: "Sinh viên ngành Trí tuệ Nhân tạo, nghiên cứu xử lý ngôn ngữ tự nhiên (NLP).",
    activity: [
      { action: "Hỏi đáp AI Workspace", detail: "Thực nghiệm mô hình RAG LLM", time: "30 phút trước" },
      { action: "Đăng nhập", detail: "Hà Nội, Việt Nam", time: "1 ngày trước" },
    ],
  },
  {
    id: 6,
    name: "Võ Hoàng E",
    email: "evh@fpt.edu.vn",
    role: "Student",
    status: "Active",
    joinDate: "2024-05-12",
    department: "Data Science",
    avatar: "VE",
    phone: "+84 967 890 123",
    location: "FPT University Can Tho Campus",
    bio: "Sinh viên Khoa học Dữ liệu.",
    activity: [
      { action: "Tải lên tập dữ liệu", detail: "Student_Performance_Dataset.csv", time: "4 giờ trước" },
    ],
  },
  {
    id: 7,
    name: "Hoàng Minh Tuấn",
    email: "tuanhm@fpt.edu.vn",
    role: "Student",
    status: "Active",
    joinDate: "2024-04-18",
    department: "Computer Science",
    avatar: "HT",
    phone: "+84 978 901 234",
    location: "FPT University HOL, Hanoi",
    bio: "Sinh viên ngành Khoa học Máy tính.",
    activity: [
      { action: "Đăng nhập", detail: "Hà Nội, Việt Nam", time: "3 giờ trước" },
    ],
  },
  {
    id: 8,
    name: "Nguyễn Quốc Bảo",
    email: "baonq@fpt.edu.vn",
    role: "Student",
    status: "Suspended",
    joinDate: "2024-06-01",
    department: "Software Engineering",
    avatar: "NB",
    phone: "+84 989 012 345",
    location: "FPT University HOL, Hanoi",
    bio: "Sinh viên ngành Kỹ thuật Phần mềm.",
    activity: [
      { action: "Tạm khóa tài khoản", detail: "Đã tạm dừng hoạt động theo yêu cầu", time: "1 tuần trước" },
    ],
  },
]
