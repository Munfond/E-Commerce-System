import StaticInfoPage from './StaticInfoPage';

export default function About() {
  return (
    <StaticInfoPage
      title="Giới thiệu"
      subtitle="ShopViet là nền tảng thương mại điện tử tập trung vào trải nghiệm mua sắm nhanh, rõ ràng và tiện lợi cho người dùng Việt Nam."
      sections={[
        {
          heading: 'ShopViet là gì?',
          body: [
            'ShopViet kết nối người mua với nhiều ngành hàng khác nhau, từ thời trang, điện tử đến đồ gia dụng và phụ kiện.',
            'Chúng tôi hướng đến trải nghiệm tìm kiếm nhanh, thanh toán thuận tiện và theo dõi đơn hàng rõ ràng.',
          ],
        },
        {
          heading: 'Mục tiêu của chúng tôi',
          body: [
            'Mang đến không gian mua sắm thân thiện, dễ dùng trên cả máy tính lẫn điện thoại.',
            'Hỗ trợ người bán mở rộng gian hàng và giúp khách hàng tiếp cận sản phẩm phù hợp hơn.',
          ],
        },
      ]}
    />
  );
}
