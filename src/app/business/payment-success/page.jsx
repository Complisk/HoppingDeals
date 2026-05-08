import { Suspense } from "react";
import PaymentSuccess from "@/presentation/pages/business/PaymentSuccess";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccess />
    </Suspense>
  );
}
