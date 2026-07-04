import styles from "./SiteHeader.module.css";

export default function SiteHeader({ brand }: { brand: string }) {
  return (
    <header className={styles.siteHeader}>
      <a href="#" className={styles.brand}>{brand}</a>
      <div className={styles.secureBadge}>
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        Secure Checkout
      </div>
    </header>
  );
}
