import StaticInfoPage from './StaticInfoPage';

export default function BuyingGuide() {
  return (
    <StaticInfoPage
      title="Hướng dẫn mua hàng"
      subtitle="Các bước mua hàng trên ShopViet được thiết kế đơn giản để bạn có thể tìm kiếm, chọn sản phẩm và đặt đơn nhanh chóng."
      sections={[
        {
          heading: 'Các bước cơ bản',
          body: [
            'Tìm sản phẩm bạn cần, mở trang chi tiết và xem giá, mô tả, biến thể hoặc đánh giá.',
            'Thêm sản phẩm vào giỏ hàng, kiểm tra số lượng và tiến hành đặt hàng ở bước thanh toán.',
          ],
        },
        {
          heading: 'Lưu ý khi đặt hàng',
          body: [
            'Kiểm tra thông tin người nhận, địa chỉ và số điện thoại trước khi xác nhận đơn.',
            'Với sản phẩm có nhiều biến thể, hãy chọn đúng phiên bản bạn muốn mua.',
          ],
        },
      ]}
    />
  );
}
