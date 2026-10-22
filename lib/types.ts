export type TransferHelp = "none" | "some" | "full";

export type Profile = {
  chairWidthCm: number | null;
  maxSteps: number | null;
  transferHelp: TransferHelp | null;
};

export type Verdict = "fits" | "help" | "no";

export type CheckStatus = "ok" | "fail" | "unknown";

export type Check = {
  key: string;
  label: string;
  measured: string; // what was measured, or "not measured"
  required: string; // what this parent's chair needs
  status: CheckStatus;
  gap?: string; // what is missing when status is "unknown", in plain words
};

export type FitResult = { verdict: Verdict; checks: Check[] };

export type Hotel = {
  id: string;
  name: string;
  area: string;
  isPlaceholder: boolean;
  auditDate: string; // YYYY-MM-DD
  entranceSteps: number | null;
  ramp: boolean | null;
  roomDoorCm: number | null;
  bathroomDoorCm: number | null;
  liftDoorCm: number | null;
  liftDepthCm: number | null;
  turningSpaceCm: number | null;
  wheelchairProvided: boolean | null; // can the hotel lend a wheelchair? null = not recorded
  bookingUrl?: string | null; // the hotel's own MakeMyTrip page, added by an auditor
  ratePerNight?: number | null; // sample price in rupees for the demo; null = price on request
  photo: string;
  photoCaption: string;
};

export type Taxi = {
  id: string;
  city: string;
  provider: string;
  vehicleType: "ramp" | "lift" | "fold-chair-only";
  doorWidthCm: number | null;
  interiorHeightCm: number | null;
  verified: boolean;
  note: string;
};

export type AuditFields = Pick<
  Hotel,
  | "entranceSteps"
  | "ramp"
  | "roomDoorCm"
  | "bathroomDoorCm"
  | "liftDoorCm"
  | "liftDepthCm"
  | "turningSpaceCm"
  | "wheelchairProvided"
>;
