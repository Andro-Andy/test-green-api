import styles from './Avatar.module.css';

const COLORS = ['#e17076', '#7bc862', '#65aadd', '#a695e7', '#ee7aae', '#6ec9cb', '#faa774'];

function pickColor(seed) {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name) {
  const letters = name
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]);
  return letters.join('').toUpperCase() || '?';
}

export default function Avatar({ name, seed, size = 54 }) {
  return (
    <div
      className={styles.avatar}
      style={{ width: size, height: size, fontSize: size * 0.38, background: pickColor(seed || name) }}
      aria-hidden="true"
    >
      {/^\+?\d/.test(name) ? (
        <svg viewBox="0 0 24 24" width={size * 0.5} height={size * 0.5}>
          <path
            fill="currentColor"
            d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
          />
        </svg>
      ) : (
        getInitials(name)
      )}
    </div>
  );
}
