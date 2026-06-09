import StaticInfoPage from './StaticInfoPage';

export default function Careers() {
  return (
    <StaticInfoPage
      title="Tuyển dụng"
      subtitle="Chúng tôi luôn tìm kiếm những người có tinh thần học hỏi, thích xây dựng sản phẩm tốt và sẵn sàng đồng hành cùng đội ngũ ShopViet."
      sections={[
        {
          heading: 'Cơ hội phát triển',
          body: [
            'Làm việc trong môi trường sản phẩm thực tế với nhiều bài toán về thương mại điện tử, vận hành và trải nghiệm người dùng.',
            'Có cơ hội học hỏi từ sản phẩm, thiết kế, kỹ thuật và vận hành cùng một đội ngũ đa chức năng.',
          ],
        },
        {
          heading: 'Bạn phù hợp nếu',
          body: [
            'Bạn chủ động, trách nhiệm và thích giải quyết vấn đề bằng cách đơn giản nhưng hiệu quả.',
            'Bạn quan tâm đến trải nghiệm người dùng và sẵn sàng cải tiến liên tục.',
          ],
        },
      ]}
    />
  );
}
