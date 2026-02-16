import Icons from './Icons';

export default function VerifiedBadge({ size = 16 }) {
  return (
    <span
      title="Verified Producer"
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: size, height: size, color: '#0984E3',
      }}
    >
      <Icons.Verified />
    </span>
  );
}
