'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [institution, setInstitution] = useState('Northway College');
  const [term, setTerm] = useState('Semester');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-headline-md text-headline-md font-semibold text-on-surface">Settings</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Institution, calendar, and model defaults.
        </p>
      </div>
      <form className="grid grid-cols-1 gap-4 sm:max-w-xl">
        <label className="flex flex-col gap-2">
          <span className="font-label-md text-label-md text-on-surface">Institution</span>
          <input
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            className="clay-card px-3 py-2 font-body-sm text-body-sm text-on-surface"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="font-label-md text-label-md text-on-surface">Academic calendar</span>
          <select
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="clay-card px-3 py-2 font-body-sm text-body-sm text-on-surface"
          >
            <option>Semester</option>
            <option>Quarter</option>
            <option>Trimester</option>
          </select>
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="clay-btn-primary py-2 px-5 font-label-md text-label-md font-semibold"
          >
            Save settings
          </button>
          <span className="font-body-sm text-body-sm text-on-surface-variant">Saved locally for demo.</span>
        </div>
      </form>
    </div>
  );
}
