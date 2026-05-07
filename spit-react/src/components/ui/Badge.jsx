const VARIANTS = {
  green:  { bg: '#BED3C3', color: '#0d1f15' },
  teal:   { bg: 'rgba(166,238,252,0.4)', color: '#166874' },
  navy:   { bg: 'rgba(219,225,255,0.4)', color: '#0a193d' },
  red:    { bg: '#ffdad6', color: '#93000a' },
  gray:   { bg: '#e1e3e4', color: '#45464e' },
  orange: { bg: '#EBACA2', color: '#4a211b' },
};

export default function Badge({ children, variant = 'gray', style = {} }) {
  const v = VARIANTS[variant] || VARIANTS.gray;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: '999px',
      fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
      background: v.bg, color: v.color, ...style
    }}>
      {children}
    </span>
  );
}

export function PurposeBadge({ purpose }) {
  const map = { business: 'green', tourism: 'teal', family: 'navy', medical: 'red' };
  return <Badge variant={map[purpose?.toLowerCase()] || 'gray'}>{purpose || '—'}</Badge>;
}

export function BudgetBadge({ budget }) {
  const map = { premium: 'navy', standard: 'teal', economy: 'gray' };
  return <Badge variant={map[budget?.toLowerCase()] || 'gray'}>{budget || '—'}</Badge>;
}

export function StatusBadge({ status }) {
  const map = { active: 'green', inactive: 'gray', approved: 'green', review: 'orange', draft: 'teal', error: 'red', success: 'green', warning: 'orange', info: 'teal' };
  return <Badge variant={map[status?.toLowerCase()] || 'gray'}>{status}</Badge>;
}
