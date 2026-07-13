import React from "react";
import { Modal, Title, Table, Button } from "@mantine/core";
import { loadStripe } from "@stripe/stripe-js";
import { SignInButton } from "../TopBar/TopBar";
import config from "../../config";
import { MetadataContext } from "../../MetadataContext";
import { IconBrandStripeFilled, IconCheck } from "@tabler/icons-react";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = config.VITE_STRIPE_PUBLIC_KEY
  ? loadStripe(config.VITE_STRIPE_PUBLIC_KEY)
  : null;

export class SubscribeModal extends React.Component<{
  closeSubscribe: () => void;
}> {
  static contextType = MetadataContext;
  declare context: React.ContextType<typeof MetadataContext>;
  onSubscribe = async () => {
    if (!stripePromise) {
      console.warn("Stripe integration is not configured, cannot subscribe");
      return;
    }
    const stripe = await stripePromise;
    const result = await stripe?.redirectToCheckout({
      lineItems: [
        {
          price:
            config.NODE_ENV === "development"
              ? "price_HNGtabCzD5qyfd"
              : "price_HNDBoPDI7yYRi9",
          quantity: 1,
        },
      ],
      mode: "subscription",
      successUrl: window.location.href,
      cancelUrl: window.location.href,
      customerEmail: this.context.user?.email ?? undefined,
      clientReferenceId: this.context.user?.uid,
    });
    // If `redirectToCheckout` fails due to a browser or network
    // error, display the localized error message to your customer
    // using `error.message`.
    if (result && result.error) {
      console.error(result.error.message);
    }
  };
  render() {
    const { closeSubscribe } = this.props;
    return (
      <Modal
        opened
        onClose={closeSubscribe}
        centered
        size="auto"
        title="اشتراک Watch"
      >
        <div>
          اشتراک به نگهداری سرویس و ساخت قابلیت‌های جدید کمک می‌کند.
        </div>
        <Title order={6}>امکانات</Title>
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th />
              <Table.Th>رایگان</Table.Th>
              <Table.Th>اشتراک</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {/* Priority support */}
            <Table.Tr>
              <Table.Td>تماشای همگام، گفت‌وگو و اشتراک صفحه</Table.Td>
              <Table.Td>
                <IconCheck />
              </Table.Td>
              <Table.Td>
                <IconCheck />
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>تعداد اتاق‌های دائمی</Table.Td>
              <Table.Td>1</Table.Td>
              <Table.Td>20</Table.Td>
            </Table.Tr>
            {/* <Table.Tr>
                  <Table.Td>Max Room Capacity</Table.Td>
                  <Table.Td>20</Table.Td>
                  <Table.Td>100</Table.Td>
                </Table.Tr> */}
            <Table.Tr>
              <Table.Td>دسترسی به مرورگر مجازی</Table.Td>
              <Table.Td>در صورت وجود ظرفیت</Table.Td>
              <Table.Td>همیشه</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>بیشترین وضوح مرورگر مجازی</Table.Td>
              <Table.Td>720p</Table.Td>
              <Table.Td>1080p</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>منابع CPU/RAM</Table.Td>
              <Table.Td>استاندارد</Table.Td>
              <Table.Td>بیشتر</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>مدت نشست مرورگر مجازی</Table.Td>
              <Table.Td>۳ ساعت</Table.Td>
              <Table.Td>۲۴ ساعت</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>انتخاب منطقه مرورگر مجازی</Table.Td>
              <Table.Td></Table.Td>
              <Table.Td>
                <IconCheck />
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>
                اشتراک صفحه و فایل برای بیننده‌های بیشتر با رله
              </Table.Td>
              <Table.Td></Table.Td>
              <Table.Td>
                <IconCheck />
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>نشانی و عنوان اختصاصی اتاق</Table.Td>
              <Table.Td></Table.Td>
              <Table.Td>
                <IconCheck />
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>نام‌های رنگی در گفت‌وگو</Table.Td>
              <Table.Td></Table.Td>
              <Table.Td>
                <IconCheck />
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>قیمت</Table.Td>
              <Table.Td>$۰ / ماه</Table.Td>
              <Table.Td>$۵ / ماه</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
        <div style={{ textAlign: "right" }}>
          {/* if user isn't logged in, provide login prompt */}
          {this.context.user && this.context.user.email ? (
            <Button
              leftSection={<IconBrandStripeFilled />}
              onClick={this.onSubscribe}
            >
              پرداخت با Stripe
            </Button>
          ) : (
            <div>
              برای اشتراک ابتدا وارد شوید: <SignInButton />
            </div>
          )}
        </div>
      </Modal>
    );
  }
}
