import { MyRuntimeProvider } from "./MyRuntimeProvider";
import { Layout } from "./Layout";

export default function App() {
  return (
    <MyRuntimeProvider>
      <Layout />
    </MyRuntimeProvider>
  );
}
