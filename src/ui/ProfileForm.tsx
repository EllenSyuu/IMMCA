import { Plus, Trash2 } from 'lucide-react';
import { TESTS, toLanguageResult, type Ability } from '../engine/language';
import { EDUCATION_ORDER, PROVINCES, type Teer } from '../engine/types';
import { useI18n } from '../i18n';
import { NumberField, SelectField, Step, TextField, Toggle } from './fields';
import { quebecLevels, type FormState, type LangInput, type LangTest } from './model';

const ABILITIES: Ability[] = ['listening', 'reading', 'writing', 'speaking'];
const TEERS: Teer[] = [0, 1, 2, 3, 4, 5];

type Set = (patch: Partial<FormState>) => void;

function LanguageBlock({ which, value, onChange }: { which: 'en' | 'fr'; value: LangInput; onChange: (v: LangInput) => void }) {
  const { t } = useI18n();
  const tests = (Object.keys(TESTS) as (keyof typeof TESTS)[]).filter((k) => TESTS[k].lang === which);
  const options: { value: LangTest; label: string }[] = [
    { value: 'none', label: t('form.test.none') },
    ...tests.map((k) => ({ value: k as LangTest, label: TESTS[k].label })),
    { value: 'clb', label: t('form.test.clb') },
  ];
  const meta = value.test === 'none' || value.test === 'clb' ? undefined : TESTS[value.test];
  const scale = value.test === 'tcf' ? (a: Ability) => (a === 'writing' || a === 'speaking' ? 20 : 699) : () => meta?.max ?? 12;
  const r = value.test === 'none' || value.test === 'clb' ? undefined : toLanguageResult(value.test, value.scores);
  const qc = which === 'fr' ? quebecLevels(value) : undefined;

  return (
    <div className="lang">
      <SelectField label={t(which === 'en' ? 'form.english' : 'form.french')} value={value.test} options={options} onChange={(test) => onChange({ ...value, test })} />
      {value.test !== 'none' && (
        <>
          <div className="grid-4">
            {ABILITIES.map((a) => (
              <NumberField
                key={a}
                label={t(`form.${a}`)}
                value={value.scores[a]}
                min={0}
                max={value.test === 'clb' ? 12 : scale(a)}
                step={meta?.step ?? 1}
                onChange={(v) => onChange({ ...value, scores: { ...value.scores, [a]: v } })}
              />
            ))}
          </div>
          {r && (
            <p className="lang__result" aria-live="polite">
              {which === 'en'
                ? t('form.clbResult', { l: r.listening, r: r.reading, w: r.writing, s: r.speaking })
                : t('form.nclcResult', { l: r.listening, r: r.reading, w: r.writing, s: r.speaking, o: qc?.oral ?? '–', wr: qc?.written ?? '–' })}
            </p>
          )}
        </>
      )}
    </div>
  );
}

export function ProfileForm({ state, set }: { state: FormState; set: Set }) {
  const { t } = useI18n();
  const provinceOptions = PROVINCES.map((p) => ({ value: p, label: t(`prov.${p}`) }));
  const eduOptions = EDUCATION_ORDER.map((e) => ({ value: e, label: t(`edu.${e}`) }));
  const teerOptions = TEERS.map((n) => ({ value: n, label: t(`teer.${n}`) }));
  const updateWork = (id: number, patch: Partial<FormState['work'][number]>) =>
    set({ work: state.work.map((w) => (w.id === id ? { ...w, ...patch } : w)) });

  return (
    <form className="profile" onSubmit={(e) => e.preventDefault()} aria-label={t('form.title')}>
      <Step n={1} title={t('form.step.you')}>
        <div className="grid-2">
          <NumberField label={t('form.age')} value={state.age} min={16} max={70} onChange={(age) => set({ age })} />
          <SelectField
            label={t('form.status')}
            value={state.status}
            options={(['student', 'graduate-pgwp', 'worker', 'outside'] as const).map((s) => ({ value: s, label: t(`status.${s}`) }))}
            onChange={(status) => set({ status, ...(status === 'outside' ? { currentProvince: 'outside' as const } : {}) })}
          />
          <SelectField
            label={t('form.currentProvince')}
            value={state.currentProvince}
            options={[{ value: 'outside' as const, label: t('form.outsideCanada') }, ...provinceOptions]}
            onChange={(currentProvince) => set({ currentProvince })}
          />
          <SelectField
            label={t('form.intendedProvince')}
            value={state.intendedProvince}
            options={[{ value: 'any' as const, label: t('form.anywhere') }, ...provinceOptions]}
            onChange={(intendedProvince) => set({ intendedProvince })}
          />
        </div>
      </Step>

      <Step n={2} title={t('form.step.study')}>
        <SelectField label={t('form.education')} value={state.education} options={eduOptions} onChange={(education) => set({ education })} />
        <Toggle label={t('form.canadianStudy')} checked={state.studied} onChange={(studied) => set({ studied })} />
        {state.studied ? (
          <div className="grid-2 nested">
            <SelectField label={t('form.studyLevel')} value={state.study.level} options={eduOptions.slice(1)} onChange={(level) => set({ study: { ...state.study, level } })} />
            <SelectField label={t('form.studyProvince')} value={state.study.province} options={provinceOptions} onChange={(province) => set({ study: { ...state.study, province } })} />
            <NumberField label={t('form.programMonths')} value={state.study.programMonths} min={1} max={120} onChange={(programMonths) => set({ study: { ...state.study, programMonths } })} />
            <NumberField label={t('form.monthsSince')} help={t('form.monthsSinceHelp')} value={state.study.monthsSinceGraduation} min={0} max={240} onChange={(monthsSinceGraduation) => set({ study: { ...state.study, monthsSinceGraduation } })} />
            <Toggle label={t('form.fullTime')} checked={state.study.fullTime} onChange={(fullTime) => set({ study: { ...state.study, fullTime } })} />
          </div>
        ) : null}
        {!state.studied && state.education !== 'none' && (
          <Toggle label={t('form.hasEca')} checked={state.hasEca} onChange={(hasEca) => set({ hasEca })} />
        )}
      </Step>

      <Step n={3} title={t('form.step.language')}>
        <LanguageBlock which="en" value={state.english} onChange={(english) => set({ english })} />
        <LanguageBlock which="fr" value={state.french} onChange={(french) => set({ french })} />
      </Step>

      <Step n={4} title={t('form.step.work')}>
        <p className="help">{t('form.workHelp')}</p>
        {state.work.length === 0 && <p className="empty">{t('form.noWork')}</p>}
        <ul className="jobs">
          {state.work.map((w) => (
            <li key={w.id} className="job">
              <div className="grid-2">
                <SelectField
                  label={t('form.workWhere')}
                  value={w.where}
                  options={[{ value: 'abroad' as const, label: t('form.abroad') }, ...provinceOptions]}
                  onChange={(where) => updateWork(w.id, { where })}
                />
                <SelectField label={t('form.teer')} value={w.teer} options={teerOptions} onChange={(teer) => updateWork(w.id, { teer })} />
                <TextField label={t('form.noc')} value={w.noc} placeholder="21211" pattern="\d{5}" help={t('form.nocHelp')} onChange={(noc) => updateWork(w.id, { noc })} />
                <NumberField label={t('form.months')} value={w.months} min={0} max={480} onChange={(months) => updateWork(w.id, { months })} />
                <NumberField label={t('form.endedAgo')} help={t('form.endedAgoHelp')} value={w.endedMonthsAgo} min={0} max={480} onChange={(endedMonthsAgo) => updateWork(w.id, { endedMonthsAgo })} />
              </div>
              <div className="job__flags">
                <Toggle label={t('form.whileStudent')} checked={w.whileFullTimeStudent} onChange={(whileFullTimeStudent) => updateWork(w.id, { whileFullTimeStudent })} />
                <Toggle label={t('form.selfEmployed')} checked={w.selfEmployed} onChange={(selfEmployed) => updateWork(w.id, { selfEmployed })} />
                <button type="button" className="link-button" onClick={() => set({ work: state.work.filter((x) => x.id !== w.id) })}>
                  <Trash2 size={15} aria-hidden="true" /> {t('form.removeWork')}
                </button>
              </div>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="secondary-button"
          onClick={() => set({
            work: [...state.work, {
              id: Math.max(0, ...state.work.map((w) => w.id)) + 1,
              where: state.currentProvince === 'outside' ? 'abroad' : state.currentProvince,
              teer: 1, noc: '', months: 12, endedMonthsAgo: 0, whileFullTimeStudent: false, selfEmployed: false,
            }],
          })}
        >
          <Plus size={16} aria-hidden="true" /> {t('form.addWork')}
        </button>
      </Step>

      <Step n={5} title={t('form.step.plans')}>
        <Toggle label={t('form.hasOffer')} checked={state.hasOffer} onChange={(hasOffer) => set({ hasOffer })} />
        {state.hasOffer && (
          <div className="nested">
            <div className="grid-2">
              <SelectField label={t('form.offerProvince')} value={state.offer.province} options={provinceOptions} onChange={(province) => set({ offer: { ...state.offer, province } })} />
              <SelectField label={t('form.teer')} value={state.offer.teer} options={teerOptions} onChange={(teer) => set({ offer: { ...state.offer, teer } })} />
              <TextField label={t('form.noc')} value={state.offer.noc ?? ''} placeholder="21211" pattern="\d{5}" onChange={(noc) => set({ offer: { ...state.offer, noc } })} />
            </div>
            <Toggle label={t('form.offerPermanent')} checked={state.offer.permanent} onChange={(permanent) => set({ offer: { ...state.offer, permanent } })} />
            <Toggle label={t('form.offerFullTime')} checked={state.offer.fullTime} onChange={(fullTime) => set({ offer: { ...state.offer, fullTime } })} />
            {['NB', 'NS', 'PE', 'NL'].includes(state.offer.province) && (
              <Toggle label={t('form.offerDesignated')} checked={!!state.offer.designatedEmployer} onChange={(designatedEmployer) => set({ offer: { ...state.offer, designatedEmployer } })} />
            )}
          </div>
        )}
        <Toggle label={t('form.nomination')} checked={state.nomination} onChange={(nomination) => set({ nomination })} />
        <Toggle label={t('form.certificate')} checked={state.certificate} onChange={(certificate) => set({ certificate })} />
      </Step>

      <Step n={6} title={t('form.step.family')}>
        <div className="grid-2">
          <NumberField label={t('form.familySize')} value={state.familySize} min={1} max={12} onChange={(familySize) => set({ familySize })} />
          <NumberField label={t('form.funds')} value={state.funds} min={0} step={500} onChange={(funds) => set({ funds })} />
        </div>
        <Toggle label={t('form.sibling')} checked={state.sibling} onChange={(sibling) => set({ sibling })} />
        <Toggle label={t('form.hasSpouse')} checked={state.hasSpouse} onChange={(hasSpouse) => set({ hasSpouse, familySize: Math.max(state.familySize, hasSpouse ? 2 : 1) })} />
        {state.hasSpouse && (
          <div className="nested">
            <Toggle label={t('form.spouseAccompanying')} checked={state.spouse.accompanying} onChange={(accompanying) => set({ spouse: { ...state.spouse, accompanying } })} />
            <Toggle label={t('form.spouseCanadian')} checked={state.spouse.canadianOrPr} onChange={(canadianOrPr) => set({ spouse: { ...state.spouse, canadianOrPr } })} />
            <div className="grid-2">
              <SelectField label={t('form.spouseEducation')} value={state.spouse.education} options={eduOptions} onChange={(education) => set({ spouse: { ...state.spouse, education } })} />
              <NumberField label={t('form.spouseClb')} value={state.spouse.clb} min={0} max={12} onChange={(clb) => set({ spouse: { ...state.spouse, clb } })} />
              <NumberField label={t('form.spouseWork')} value={state.spouse.canadianWorkMonths} min={0} max={240} onChange={(canadianWorkMonths) => set({ spouse: { ...state.spouse, canadianWorkMonths } })} />
            </div>
          </div>
        )}
      </Step>
    </form>
  );
}
