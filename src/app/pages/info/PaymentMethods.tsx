import StaticInfoPage from './StaticInfoPage';

export default function PaymentMethods() {
  return (
    <StaticInfoPage
      title="Phương thức thanh toán"
      subtitle="ShopViet hỗ trợ những phương thức thanh toán phổ biến để phù hợp với thói quen mua sắm của người dùng."
      sections={[
        {
          heading: 'Các hình thức phổ biến',
          body: [
            'Thanh toán khi nhận hàng (COD) tùy theo đơn vị vận chuyển và trạng thái đơn hàng.',
            'Thanh toán điện tử hoặc các phương thức được tích hợp trên hệ thống nếu có sẵn.',
          ],
        },
        {
          heading: 'Lưu ý',
          body: [
            'Kiểm tra kỹ thông tin thanh toán trước khi xác nhận đơn hàng.',
            'Một số phương thức có thể thay đổi theo từng thời điểm hoặc chương trình khuyến mãi.',
          ],
        },
      ]}
    />
  );
}
