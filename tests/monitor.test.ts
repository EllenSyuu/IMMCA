import { describe, expect, it } from 'vitest';
import { citedSources, nextState, pageText } from '../scripts/check-sources';

describe('source monitor', () => {
  it('reduces HTML to stable text, ignoring scripts, navigation and markup', () => {
    const a = pageText('<html><nav>Menu</nav><script>var t=1</script><h1>CEC</h1><p>CLB&nbsp;7</p><footer>x</footer></html>');
    const b = pageText('<html><nav>Other menu</nav><script>var t=2</script><h1>CEC</h1>\n<p>CLB 7</p><footer>y</footer></html>');
    expect(a).toBe('CEC\nCLB 7');
    expect(b).toBe(a);
  });

  it('sets a baseline, flags a change once and keeps its first date', () => {
    const s0 = nextState(undefined, 'aaa', '2026-10-28');
    expect(s0).toMatchObject({ baseline: 'aaa', status: 'unchanged' });
    const s1 = nextState(s0, 'bbb', '2026-11-02');
    expect(s1).toMatchObject({ status: 'changed', changedOn: '2026-11-02' });
    expect(nextState(s1, 'ccc', '2026-11-05')).toMatchObject({ status: 'changed', changedOn: '2026-11-02' });
    expect(nextState(s1, 'aaa', '2026-11-06')).toMatchObject({ status: 'unchanged', changedOn: undefined });
  });

  it('treats a failed fetch as unreachable, not as a change', () => {
    const s0 = nextState(undefined, 'aaa', '2026-10-28');
    const s1 = nextState(s0, null, '2026-10-29');
    expect(s1).toMatchObject({ baseline: 'aaa', status: 'unreachable', unreachableSince: '2026-10-29' });
    expect(nextState(s1, null, '2026-10-30').unreachableSince).toBe('2026-10-29');
    expect(nextState(s1, 'aaa', '2026-10-31')).toMatchObject({ status: 'unchanged' });
    expect(nextState(s1, 'aaa', '2026-10-31').unreachableSince).toBeUndefined();
  });

  it('monitors every official URL cited by a program', () => {
    const cited = citedSources();
    expect(cited.size).toBeGreaterThan(40);
    for (const url of cited.keys()) expect(url).toMatch(/^https:\/\//);
  });
});
