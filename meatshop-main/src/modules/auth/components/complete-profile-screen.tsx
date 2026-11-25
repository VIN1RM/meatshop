'use client';

import { useState, type FormEvent } from 'react';
import { UserRoundCheck } from 'lucide-react';
import { AuthLayout } from '@/shared/components/auth-layout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { RequiredMark } from '@/shared/components/ui/required-mark';
import { Spinner } from '@/shared/components/ui/spinner';
import { usePanelAccess } from '@/shared/providers/panel-access-provider';
import { apiPatch, apiPost } from '@/shared/lib/api';
import { completeProfileSchema } from '@/shared/lib/validation-schemas';
import { maskCPF } from '@/shared/lib/input-masks';
import { toast } from '@/shared/lib/toast';

function maskPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  const local = digits.slice(2);
  const split = digits.length > 10 ? 5 : 4;
  return digits.length > 2
    ? `(${digits.slice(0, 2)}) ${local.slice(0, split)}${local.length > split ? `-${local.slice(split)}` : ''}`
    : digits;
}

export function CompleteProfileScreen() {
  const { user, selectedMembership, refresh } = usePanelAccess();
  const [name, setName] = useState(user?.name ?? '');
  const [cpf, setCpf] = useState(maskCPF(user?.cpf ?? ''));
  const [phone, setPhone] = useState(maskPhone(user?.phone ?? ''));
  const [saving, setSaving] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invalidField, setInvalidField] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || leaving) return;
    setError(null);
    setInvalidField('');
    const result = completeProfileSchema.safeParse({ name, cpf, phone });
    if (!result.success) {
      const issue = result.error.issues[0];
      setError(issue.message);
      const field = String(issue.path[0]);
      setInvalidField(field);
      (event.currentTarget.elements.namedItem(field) as HTMLElement | null)?.focus();
      return;
    }
    setSaving(true);
    try {
      const response = await apiPatch('/users/me', {
        ...result.data,
        app_profile: user?.app_profile ?? (selectedMembership?.role === 'DELIVERY' ? 'DELIVERY' : 'CLIENT'),
      }, { silent: true });
      if (response?.user?.profile_complete !== true) {
        throw new Error('O perfil ainda está incompleto. Confira os dados e tente novamente.');
      }
      await refresh();
      toast.success('Perfil regularizado. Seu acesso está pronto.');
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Não foi possível salvar seu perfil. Tente novamente.');
    } finally { setSaving(false); }
  }

  async function logout() {
    if (saving || leaving) return;
    setLeaving(true);
    setError(null);
    try {
      await apiPost('/auth/logout', {}, { silent: true });
      window.dispatchEvent(new Event('auth:session-expired'));
    } catch {
      setError('Não foi possível sair. Tente novamente.');
    } finally { setLeaving(false); }
  }

  return <AuthLayout>
    <div className="mb-7 space-y-3">
      <span className="grid size-12 place-items-center rounded-2xl bg-red-50 text-red-700"><UserRoundCheck className="size-6" aria-hidden="true" /></span>
      <p className="text-sm font-semibold text-red-700">Cadastro pendente</p>
      <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Complete seu perfil</h1>
      <p className="text-sm leading-relaxed text-slate-600">Confira seus dados e informe seu telefone para liberar o acesso ao painel.</p>
    </div>
    <form onSubmit={submit} className="space-y-5" noValidate aria-busy={saving}>
      <fieldset disabled={saving || leaving} className="space-y-5">
        <div>
          <label htmlFor="complete-name" className="mb-1.5 block text-sm font-medium text-slate-700">Nome completo<RequiredMark /></label>
          <Input id="complete-name" name="name" autoFocus autoComplete="name" required maxLength={100} value={name} onChange={event => setName(event.target.value)} aria-invalid={invalidField === 'name'} aria-describedby={invalidField === 'name' ? 'profile-error' : undefined} />
        </div>
        <div>
          <label htmlFor="complete-email" className="mb-1.5 block text-sm font-medium text-slate-700">E-mail de acesso</label>
          <Input id="complete-email" type="email" value={user?.email ?? ''} readOnly className="bg-slate-50 text-slate-600" />
        </div>
        <div>
          <label htmlFor="complete-cpf" className="mb-1.5 block text-sm font-medium text-slate-700">CPF<RequiredMark /></label>
          <Input id="complete-cpf" name="cpf" inputMode="numeric" required value={cpf} onChange={event => setCpf(maskCPF(event.target.value))} placeholder="000.000.000-00" aria-invalid={invalidField === 'cpf'} aria-describedby={invalidField === 'cpf' ? 'profile-error' : undefined} />
        </div>
        <div>
          <label htmlFor="complete-phone" className="mb-1.5 block text-sm font-medium text-slate-700">Telefone com DDD<RequiredMark /></label>
          <Input id="complete-phone" name="phone" type="tel" autoComplete="tel-national" required value={phone} onChange={event => setPhone(maskPhone(event.target.value))} placeholder="(11) 99999-9999" aria-invalid={invalidField === 'phone'} aria-describedby={invalidField === 'phone' ? 'profile-error' : undefined} />
        </div>
      </fieldset>
      {error && <p id="profile-error" role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <Button type="submit" disabled={saving || leaving} className="min-h-11 w-full">{saving && <Spinner />}{saving ? 'Salvando perfil...' : 'Salvar e continuar'}</Button>
      <Button type="button" variant="outline" disabled={saving || leaving} onClick={() => void logout()} className="min-h-11 w-full">{leaving && <Spinner />}{leaving ? 'Saindo...' : 'Sair da conta'}</Button>
    </form>
  </AuthLayout>;
}
