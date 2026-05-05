import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { HeartHandshake } from "lucide-react";

const defaultNavigation = {
  "Ủng hộ": [
    { label: "Chiến dịch", path: "/projects" },
    { label: "Đồng hành", path: "/need-help" },
    { label: "Tổ chức gây quỹ", path: "/organizer/apply" },
    { label: "Cá nhân gây quỹ", path: "/register" },
  ],
  "Gây quỹ": [
    { label: "Bắt đầu", path: "/projects/create" },
  ],
  "Khám phá": [
    { label: "Bản đồ thiện nguyện", path: "/projects/map" },
    { label: "Sự kiện thiện nguyện", path: "/community" },
    { label: "Bảng tin", path: "/community" },
    { label: "Tin tức", path: "/community" },
  ],
  "Giới thiệu": [
    { label: "Về thiện nguyện", path: "/about" },
    { label: "Hỏi đáp", path: "/about" },
    { label: "Điều khoản sử dụng", path: "/terms" },
    { label: "Chính sách bảo mật", path: "/privacy" },
  ],
};

export function LandingFooter({ navigation = defaultNavigation }) {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 sm:py-14 lg:flex-row lg:gap-16">
        <Link
          to="/"
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[24px] text-orange-600 transition hover:bg-orange-50"
          aria-label="CCNet"
        >
          <HeartHandshake size={54} strokeWidth={2.6} />
        </Link>

        <div className="grid flex-1 grid-cols-1 gap-9 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(navigation).map(([title, links]) => (
            <nav key={title} aria-label={title}>
              <h2 className="text-lg font-black text-slate-900">{title}</h2>
              <ul className="mt-5 space-y-4">
                {links.map((link) => (
                  <li key={`${title}-${link.path}-${link.label}`}>
                    <Link
                      to={link.path}
                      className="block text-base font-medium text-slate-500 transition-colors hover:text-orange-600"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 px-6 py-5 text-center text-sm font-medium text-slate-400">
        © {new Date().getFullYear()} CCNet. Bảo lưu mọi quyền.
      </div>
    </footer>
  );
}

LandingFooter.propTypes = {
  navigation: PropTypes.object,
};
