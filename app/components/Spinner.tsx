import styles from "./Spinner.module.css";
import { cx } from "../../lib/utils";

type Props = { size?: number; className?: string };

export default function Spinner({ size = 16, className }: Props) {
  return (
    <svg
      className={cx(styles.spinIcon, className)}
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}
