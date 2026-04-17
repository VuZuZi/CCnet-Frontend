import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button/Button'

export function CTASection() {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-4">
      <section className="bg-black text-white py-20 rounded-[32px] my-16 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Bạn đã sẵn sàng để bắt đầu?</h2>
          <p className="text-xl opacity-75 mb-8">
            Tham gia hàng nghìn nhóm đang sử dụng nền tảng của chúng tôi.
          </p>
          <Link to="/register">
            <Button variant="yellow" className="!px-8 !py-4 !text-lg">Bắt đầu dùng thử miễn phí</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}