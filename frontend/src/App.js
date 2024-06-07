import Messages from "./components/Messages";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Messages />
    </QueryClientProvider>
  );
}

export default App;
