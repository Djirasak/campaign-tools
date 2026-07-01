import Link from "next/link";

const Home = () => {
  return (
    <div style={{ padding: "40px 24px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ marginBottom: "16px" }}>Campaign Tools</h1>
      <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
        <li>
          <Link href="/checkout" style={{ color: "#2B5CE6", fontWeight: 600 }}>
            Checkout Test Tool
          </Link>
          <span style={{ color: "#586075", marginLeft: "10px", fontSize: "13px" }}>
            POST /api/v1/orders/create/ payload builder
          </span>
        </li>
      </ul>
    </div>
  );
};

export default Home;
