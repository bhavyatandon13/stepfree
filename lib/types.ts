export type TransferHelp = "none" | "some" | "full";

export type Profile = {
  chairWidthCm: number | null;
  maxSteps: number | null;
  transferHelp: TransferHelp | null;
};

export type Verdict = "fits" | "help" | "no";

export type CheckStatus = "ok" | "tight" | "fail" | "unknown";

export type Check = {
  key: string;
  label: string;
  measured: string; // what was measured, or "not measured"
  required: string; // what this parent's chair needs
  status: CheckStatus;
  gap?: string; // what is missing when status is "unknown", in plain words
  note?: string; // the problem in plain words when status is "tight" or "fail"
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
  evidence?: Evidence[]; // time-stamped proof photos
  photo: string;
  photoCaption: string;
};

// A proof photo: what it shows, when it was taken and by whom. The time is stamped onto the image.
export type Evidence = {
  id: string;
  photo: string; // image path or data URL
  shows: string; // e.g. "Washroom door"
  detail: string; // e.g. "Tape measure reads 82 cm"
  takenAt: string; // ISO time the photo was taken
  by: "StepFree auditor" | "Hotel staff" | "Guest reviewer" | "Taxi provider" | "You";
  sample?: boolean; // made up for the demo
  worked?: "yes" | "no" | "unsure"; // did it work for the wheelchair?
};

export type Taxi = {
  id: string;
  city: string;
  provider: string;
  vehicleType: "ramp" | "lift" | "fold-chair-only";
  doorWidthCm: number | null;
  interiorHeightCm: number | null;
  sampleFare?: number | null; // sample fare in rupees for one trip in the city; null = ask the provider
  fareText?: string; // the provider's own published fares, in plain words
  serviceArea?: string;
  details?: string; // what the provider says about its vehicles and service
  contactPhones?: string[];
  contactEmail?: string;
  sourceUrl?: string; // where these facts come from
  sourceName?: string;
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
