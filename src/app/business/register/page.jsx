import { Suspense } from "react";
import BusinessRegister from "@/presentation/pages/business/BusinessRegister";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <BusinessRegister />
    </Suspense>
  );
}
