'use client';

import type { Journey } from '@memyra/domain';
import { createJourneyInputSchema } from '@memyra/validation';
import { Button } from '@memyra/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const options = {
  region: [['FACE','Rosto'],['NECK','Pescoço'],['CHEST','Colo ou peito'],['BACK','Costas'],['ARM','Braço'],['HAND','Mão'],['LEG','Perna'],['OTHER','Outra região']],
  side: [['LEFT','Lado esquerdo'],['RIGHT','Lado direito'],['NOT_APPLICABLE','Não se aplica']],
  context: [['POST_ACNE_MARK','Marca pós-acne'],['AFTER_INJURY_MARK','Marca após machucado'],['TONE_CHANGE','Alteração de tonalidade'],['POST_INFLAMMATORY_MARK','Marca pós-inflamatória'],['OTHER','Outro contexto'],['UNKNOWN','Não sei informar']],
  approximateAge: [['LESS_THAN_ONE_MONTH','Menos de 1 mês'],['ONE_TO_THREE_MONTHS','De 1 a 3 meses'],['THREE_TO_SIX_MONTHS','De 3 a 6 meses'],['SIX_TO_TWELVE_MONTHS','De 6 a 12 meses'],['ONE_TO_TWO_YEARS','De 1 a 2 anos'],['MORE_THAN_TWO_YEARS','Mais de 2 anos'],['UNKNOWN','Não sei informar']],
  goal: [['EVEN_APPEARANCE','Melhorar a uniformidade percebida'],['REDUCE_MARK_APPEARANCE','Acompanhar a aparência da marca'],['BUILD_CONSISTENT_ROUTINE','Criar consistência no cuidado'],['TRACK_EVOLUTION','Registrar minha trajetória'],['OTHER','Outro objetivo cosmético']],
} as const;

export function JourneyEditForm({ journey }: { journey: Journey }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function submit(formData: FormData) {
    const nameValue = formData.get('name');
    const input = {
      name: typeof nameValue === 'string' ? nameValue : '',
      skinArea: { region: formData.get('region'), side: formData.get('side') },
      context: formData.get('context'),
      approximateAge: formData.get('approximateAge'),
      goal: formData.get('goal'),
    };
    const parsed = createJourneyInputSchema.safeParse(input);
    if (!parsed.success) return setError('Revise os campos antes de salvar.');
    setPending(true);
    setError('');
    try {
      const response = await fetch(`/api/journeys/${journey.id}`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(parsed.data) });
      if (!response.ok) throw new Error('UPDATE_FAILED');
      router.push(`/journey/${journey.id}`);
      router.refresh();
    } catch {
      setError('Não foi possível salvar as alterações. Tente novamente.');
    } finally { setPending(false); }
  }

  return (
    <form action={submit} className="mt-8 grid gap-5">
      <Field label="Nome" name="name" defaultValue={journey.name} />
      <Select label="Região" name="region" options={options.region} defaultValue={journey.skinArea.region} />
      <Select label="Lado" name="side" options={options.side} defaultValue={journey.skinArea.side} />
      <Select label="Contexto percebido" name="context" options={options.context} defaultValue={journey.context} />
      <Select label="Tempo percebido" name="approximateAge" options={options.approximateAge} defaultValue={journey.approximateAge} />
      <Select label="Objetivo" name="goal" options={options.goal} defaultValue={journey.goal} />
      {error && <p role="alert" className="rounded-xl bg-clay/10 p-4 text-sm text-clay">{error}</p>}
      <Button type="submit" disabled={pending}>{pending ? 'Salvando…' : 'Salvar alterações'}</Button>
    </form>
  );
}

function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue: string }) {
  return <label className="grid gap-2 text-sm font-semibold">{label}<input required minLength={2} maxLength={80} name={name} defaultValue={defaultValue} className="min-h-12 rounded-2xl border border-graphite/20 bg-surface px-4 font-normal" /></label>;
}

function Select({ label, name, options: items, defaultValue }: { label: string; name: string; options: readonly (readonly [string,string])[]; defaultValue: string }) {
  return <label className="grid gap-2 text-sm font-semibold">{label}<select name={name} defaultValue={defaultValue} className="min-h-12 rounded-2xl border border-graphite/20 bg-surface px-4 font-normal">{items.map(([value,text]) => <option key={value} value={value}>{text}</option>)}</select></label>;
}
