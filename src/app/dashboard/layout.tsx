import { Sidebar } from "@/components/sidebar";
import { Chatbot } from "@/components/chatbot";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-8 py-8">{children}</div>
      </main>
      <Chatbot />
    </div>
  );
}
