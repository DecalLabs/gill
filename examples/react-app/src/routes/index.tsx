import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: () => (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to the Example App</h1>
      <p className="text-gray-600">Use the navigation bar above to explore different examples.</p>
    </div>
  ),
});
