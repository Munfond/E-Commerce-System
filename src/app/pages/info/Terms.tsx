import StaticInfoPage from './StaticInfoPage';

export default function Terms() {
  return (
    <StaticInfoPage
      title="Điều khoản"
      subtitle="Các điều khoản này giúp đảm bảo quyền lợi của người mua, người bán và ShopViet trong quá trình sử dụng nền tảng."
      sections={[
        {
          heading: 'Quy tắc sử dụng',
          body: [
            'Người dùng cần cung cấp thông tin chính xác khi tạo tài khoản, đặt hàng hoặc liên hệ hỗ trợ.',
            'Không được sử dụng nền tảng cho các hành vi vi phạm pháp luật hoặc gây ảnh hưởng đến trải nghiệm của người dùng khác.',
          ],
        },
        {
          heading: 'Trách nhiệm',
          body: [
            'ShopViet hỗ trợ kết nối giao dịch, trong khi nội dung sản phẩm và xử lý đơn hàng phụ thuộc vào quy trình vận hành hiện tại.',
            'Chúng tôi có thể cập nhật điều khoản để phù hợp với thay đổi của hệ thống và dịch vụ.',
          ],
        },
      ]}
    />
  );
}
