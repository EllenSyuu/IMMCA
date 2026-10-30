import { describe, expect, it } from 'vitest';
import { sourceFlag } from '../src/data/monitor';
import { PROGRAMS } from '../src/data/programs';
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

describe('monitor noise filter', () => {
  it('ignores maintenance and outage banners but keeps rule text', () => {
    const page = (banner: string) => pageText(`<main><p>${banner}</p><p>Minimum score 99 for childcare.</p></main>`);
    expect(page('A temporary WelcomeBC.ca site outage will occur on October 28 from 6 am to 8 am (PT).')).toBe('Minimum score 99 for childcare.');
    expect(page('Scheduled maintenance: the portal will be unavailable this weekend.')).toBe('Minimum score 99 for childcare.');
    expect(page('Interruption de service prévue le 2026-11-02.')).toBe('Minimum score 99 for childcare.');
    expect(page('The intake window is closed.')).toContain('The intake window is closed.');
    expect(page('Applications are temporarily unavailable for the Entry Level stream.')).toContain('temporarily unavailable');
  });
});

describe('monitor flags on programs', () => {
  const url = 'https://example.ca/rule';
  it('a changed page flags the program for review, whatever the live status file says', () => {
    expect(sourceFlag([url], { [url]: { status: 'changed', changedOn: '2026-10-29' } })).toEqual({ kind: 'changed', since: '2026-10-29' });
    expect(sourceFlag([url], { [url]: { status: 'unchanged' } })).toBeUndefined();
  });
  it('an unreachable page is flagged only after a week', () => {
    const since = { [url]: { status: 'unreachable' as const, unreachableSince: '2026-10-20' } };
    expect(sourceFlag([url], since, Date.parse('2026-10-24T00:00:00Z'))).toBeUndefined();
    expect(sourceFlag([url], since, Date.parse('2026-10-29T00:00:00Z'))).toEqual({ kind: 'unreachable', since: '2026-10-20' });
  });
  it('tests see the frozen status file: no program is under review', () => {
    for (const p of PROGRAMS) expect(sourceFlag(p.sources.map((s) => s.url))?.kind, p.id).not.toBe('changed');
  });
});
