import Terms from "@/presentation/pages/Terms";

export const metadata = {
  title: "Terms & Privacy",
  description:
    "Read the Hopping Deals terms of service and privacy policy that govern how you use the platform and how we handle your data.",
  alternates: { canonical: "/terms" },
};

export default function Page() {
  return <Terms />;
}
