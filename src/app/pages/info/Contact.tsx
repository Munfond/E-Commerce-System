import StaticInfoPage from './StaticInfoPage';

export default function Contact() {
  return (
    <StaticInfoPage
      title="Liên hệ"
      subtitle="Nếu cần hỗ trợ, bạn có thể liên hệ ShopViet qua email hoặc các kênh hỗ trợ hiển thị trên trang web."
      sections={[
        {
          heading: 'Thông tin liên hệ',
          body: [
            'Email hỗ trợ: support@shopviet.vn',
            'Bạn cũng có thể dùng các kênh liên hệ khác trong mục kết nối của footer nếu cần hỗ trợ nhanh hơn.',
          ],
        },
        {
          heading: 'Thời gian phản hồi',
          body: [
            'Chúng tôi cố gắng phản hồi trong thời gian sớm nhất trong giờ làm việc.',
            'Với yêu cầu cần xử lý chi tiết, vui lòng mô tả rõ đơn hàng hoặc vấn đề bạn gặp phải.',
          ],
        },
      ]}
    />
  );
}
