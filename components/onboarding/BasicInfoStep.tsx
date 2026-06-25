"use client";

import { AvatarUpload } from "@/components/settings/AvatarUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const UNIVERSITIES = ["DU", "BUET", "NSU", "BRAC", "IUB", "JNU", "SUST", "RUET", "CU", "Others"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Masters"];
const SEMESTERS = ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6", "Semester 7", "Semester 8"];

type BasicInfoStepProps = {
  value: {
    name: string;
    university: string;
    academic_year: string;
    semester: string;
    avatar_url: string | null;
    phone: string;
  };
  onChange: (value: Partial<BasicInfoStepProps["value"]>) => void;
  onNext: () => void;
  onPrevious: () => void;
};

export function BasicInfoStep({ value, onChange, onNext, onPrevious }: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Basic information</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          আপনার profile details দিন যাতে PocketSense আপনার context বুঝে better plan সাজাতে পারে।
        </p>
      </div>

      <AvatarUpload avatarUrl={value.avatar_url} onUploaded={(avatar_url) => onChange({ avatar_url })} />

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="onboarding-name">Name</Label>
          <Input
            id="onboarding-name"
            value={value.name}
            onChange={(event) => onChange({ name: event.target.value })}
            placeholder="আপনার নাম"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="onboarding-phone">Phone</Label>
          <Input id="onboarding-phone" value={value.phone} readOnly />
        </div>
        <div className="space-y-2">
          <Label htmlFor="onboarding-university">University</Label>
          <select
            id="onboarding-university"
            value={value.university}
            onChange={(event) => onChange({ university: event.target.value })}
            className="flex h-10 w-full rounded-full border border-input bg-background px-4 py-2 text-sm ring-offset-background"
          >
            <option value="">Select university</option>
            {UNIVERSITIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="onboarding-year">Year</Label>
          <select
            id="onboarding-year"
            value={value.academic_year}
            onChange={(event) => onChange({ academic_year: event.target.value })}
            className="flex h-10 w-full rounded-full border border-input bg-background px-4 py-2 text-sm ring-offset-background"
          >
            <option value="">Select year</option>
            {YEARS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="onboarding-semester">Semester</Label>
          <select
            id="onboarding-semester"
            value={value.semester}
            onChange={(event) => onChange({ semester: event.target.value })}
            className="flex h-10 w-full rounded-full border border-input bg-background px-4 py-2 text-sm ring-offset-background"
          >
            <option value="">Select semester</option>
            {SEMESTERS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" className="rounded-full" onClick={onPrevious}>
          Previous
        </Button>
        <Button type="button" className="rounded-full" onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
}
