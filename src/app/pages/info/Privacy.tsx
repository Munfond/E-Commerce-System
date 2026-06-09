import StaticInfoPage from './StaticInfoPage';

export default function Privacy() {
  return (
    <StaticInfoPage
      title="Chính sách bảo mật"
      subtitle="Chính sách này mô tả cách ShopViet thu thập, sử dụng và bảo vệ dữ liệu người dùng trong quá trình vận hành nền tảng."
      sections={[
        {
          heading: 'Dữ liệu chúng tôi sử dụng',
          body: [
            'Bao gồm thông tin tài khoản, lịch sử mua hàng, địa chỉ giao hàng và dữ liệu cần thiết để hỗ trợ giao dịch.',
            'Chúng tôi chỉ sử dụng dữ liệu cho mục đích vận hành dịch vụ và cải thiện trải nghiệm người dùng.',
          ],
        },
        {
          heading: 'Bảo vệ thông tin',
          body: [
            'ShopViet áp dụng các biện pháp bảo mật phù hợp để giảm thiểu nguy cơ truy cập trái phép.',
            'Người dùng nên bảo vệ tài khoản và không chia sẻ thông tin đăng nhập cho người khác.',
          ],
        },
      ]}
    />
  );
}
