import { ExternalLink } from 'lucide-react';
import { NEWS } from '../data/news';
import { useI18n } from '../i18n';
import { useDate } from './format';

/** Recent policy changes that affect many routes at once. */
export function NewsPanel() {
  const { t, locale } = useI18n();
  const fmt = useDate('long');
  return (
    <section className="panel news" aria-labelledby="news-title">
      <h3 id="news-title">{t('news.title')}</h3>
      <ol className="news__list">
        {NEWS.map((n) => (
          <li key={n.source + n.date}>
            <time dateTime={n.date}>{fmt(n.date)}</time>
            <h4>{n.title[locale]}</h4>
            <p>{n.body[locale]}</p>
            <a href={n.source} target="_blank" rel="noreferrer">{t('decision.officialPage')}<ExternalLink size={13} aria-hidden="true" /></a>
          </li>
        ))}
      </ol>
    </section>
  );
}
