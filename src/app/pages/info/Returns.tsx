import StaticInfoPage from './StaticInfoPage';

export default function Returns() {
  return (
    <StaticInfoPage
      title="Chính sách đổi trả"
      subtitle="Chính sách đổi trả giúp người dùng yên tâm hơn khi mua sắm và xử lý các trường hợp sản phẩm không đúng kỳ vọng."
      sections={[
        {
          heading: 'Trường hợp áp dụng',
          body: [
            'Áp dụng khi sản phẩm bị lỗi kỹ thuật, sai mẫu, thiếu phụ kiện hoặc không đúng mô tả từ người bán.',
            'Tùy từng trường hợp, ShopViet có thể hỗ trợ đổi mới hoặc hoàn tiền theo chính sách đang áp dụng.',
          ],
        },
        {
          heading: 'Cần chuẩn bị gì?',
          body: [
            'Giữ nguyên tình trạng sản phẩm và hóa đơn/biên nhận nếu có để việc xử lý nhanh hơn.',
            'Liên hệ hỗ trợ sớm nhất có thể sau khi phát hiện vấn đề.',
          ],
        },
      ]}
    />
  );
}
