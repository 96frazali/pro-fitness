import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from "react";
import { LocalNotifications, Weekday } from "@capacitor/local-notifications";
import { Capacitor, registerPlugin } from "@capacitor/core";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Dumbbell,
  Flame,
  Footprints,
  HeartPulse,
  Home,
  Leaf,
  LockKeyhole,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Target,
  TimerReset,
  TrendingUp,
  Trophy,
  UserRound,
  Utensils,
  X,
} from "lucide-react";
import "./App.css";

type Page =
  | "Home"
  | "Workout"
  | "Explore"
  | "Progress"
  | "Nutrition"
  | "Profile";
type SetKind = "Warm-up" | "Working" | "Drop set" | "Superset";
type WorkoutSet = {
  id: number;
  weight: string;
  reps: string;
  rir: string;
  done: boolean;
  kind: SetKind;
  rpe: string;
  note?: string;
};
type TrainingGoal = "Build muscle" | "Lose weight" | "Increase strength";
type ExerciseLevel = "Beginner" | "Intermediate" | "Advanced";
type Exercise = {
  name: string;
  group: string;
  equipment: string;
  level: ExerciseLevel;
  accent: string;
  icon: string;
  goals: TrainingGoal[];
};
type WarmupMove = {
  name: string;
  duration: string;
  target: string;
  cue: string;
  equipmentNote: string;
  visualExercise: Exercise;
};
type CustomerCheckIn = {
  date: string;
  cadence: "Weekly" | "Monthly";
  weight: string;
};
type CustomerProfile = {
  id: string;
  name: string;
  email: string;
  age: string;
  sex: string;
  height: string;
  weight: string;
  targetWeight: string;
  goal: TrainingGoal;
  experience: ExerciseLevel;
  days: number;
  duration: number;
  equipment: string[];
  trainingHistory: string;
  limitations: string;
  createdAt: string;
  checkIns?: CustomerCheckIn[];
};
type NutritionTargets = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  maintenance: number;
  pace: string;
};
type DailyPlan = {
  title: string;
  focus: string;
  minutes: string;
  exercisesLabel: string;
  sets: string;
  exercises: string[];
  message: string;
  prescription: string;
  adjustment: string;
};
type WorkoutTemplate = {
  key: string;
  title: string;
  focus: string;
  groups: string[];
  exercises: string[];
  message: string;
};
type ScheduleDay = {
  id: string;
  label: string;
  kind: "Workout" | "Recovery";
  title: string;
  focus: string;
  note: string;
  plan?: DailyPlan;
};
type WeeklyPlan = {
  days: ScheduleDay[];
  currentPlanId: string;
};
type OnboardingDraft = Omit<CustomerProfile, "id" | "createdAt"> & {
  password: string;
};
type WorkoutLog = {
  id: string;
  date: string;
  title: string;
  exercises: string[];
  completedSets: number;
  totalSets: number;
  volume: number;
  duration: string;
};
type NutritionLog = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};
type FoodEntry = NutritionLog & {
  id: string;
  name: string;
  meal: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  date: string;
};
type BodyMeasurements = {
  bodyFat: string;
  waist: string;
  chest: string;
  shoulders: string;
  arms: string;
  thigh: string;
};
type ProgressPhoto = {
  id: string;
  pose: "Front" | "Side" | "Back";
  dataUrl: string;
  createdAt: string;
};
type ReminderSettings = {
  enabled: boolean;
  time: string;
  days: string[];
};
type FoodEntryInput = Omit<FoodEntry, "id" | "date">;
type HealthConnectStatus = {
  available: boolean;
  status: "available" | "unavailable";
};
type ReadinessCheck = {
  sleep: number;
  energy: number;
  soreness: number;
  stress: number;
  updatedAt: string;
};
type LocalAppState = {
  water: number;
  workoutLogs: WorkoutLog[];
  nutrition: NutritionLog;
  readiness: ReadinessCheck | null;
  foodEntries: FoodEntry[];
  measurements: BodyMeasurements;
  progressPhotos: ProgressPhoto[];
  reminders: ReminderSettings;
};

const nav: { label: Page; icon: typeof Home }[] = [
  { label: "Home", icon: Home },
  { label: "Workout", icon: Dumbbell },
  { label: "Explore", icon: Search },
  { label: "Progress", icon: BarChart3 },
  { label: "Nutrition", icon: Utensils },
  { label: "Profile", icon: UserRound },
];
const mobileNav = nav.filter((item) => item.label !== "Profile");
const HealthConnect = registerPlugin<{
  getStatus: () => Promise<HealthConnectStatus>;
}>("HealthConnect");
const APP_NOW = Date.now();

const recovery = [
  { name: "Back", percent: 94, tone: "ready", detail: "Ready to train" },
  { name: "Biceps", percent: 91, tone: "ready", detail: "Ready to train" },
  { name: "Rear delts", percent: 87, tone: "ready", detail: "Ready to train" },
  { name: "Quads", percent: 62, tone: "resting", detail: "Recovering well" },
  { name: "Chest", percent: 34, tone: "resting", detail: "Resting after Push" },
];

/* Initial six-movement demo library kept for reference.
const exerciseData = [
  { name: 'Lat Pulldown', group: 'Back', equipment: 'Cable', level: 'Beginner', accent: 'violet', icon: '↙' },
  { name: 'Chest-supported Row', group: 'Back', equipment: 'Machine', level: 'Intermediate', accent: 'blue', icon: '↔' },
  { name: 'Incline Dumbbell Curl', group: 'Biceps', equipment: 'Dumbbells', level: 'Intermediate', accent: 'orange', icon: '⌁' },
  { name: 'Face Pull', group: 'Rear delts', equipment: 'Cable', level: 'Beginner', accent: 'lime', icon: '↗' },
  { name: 'Romanian Deadlift', group: 'Hamstrings', equipment: 'Barbell', level: 'Intermediate', accent: 'pink', icon: '⇊' },
  { name: 'Goblet Squat', group: 'Quads', equipment: 'Dumbbells', level: 'Beginner', accent: 'yellow', icon: '⇅' },
]
*/

const allGoals: TrainingGoal[] = [
  "Build muscle",
  "Lose weight",
  "Increase strength",
];
const muscleGroups = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Quads",
  "Hamstrings & glutes",
  "Calves",
  "Core",
  "Fat loss cardio",
];

function groupExercises(
  group: string,
  accent: string,
  icon: string,
  exercises: Array<[string, string, ExerciseLevel, TrainingGoal[]?]>,
): Exercise[] {
  return exercises.map(([name, equipment, level, goals = allGoals]) => ({
    name,
    group,
    equipment,
    level,
    goals,
    accent,
    icon,
  }));
}

const exerciseData: Exercise[] = [
  ...groupExercises("Chest", "red", "CHEST", [
    ["Barbell Bench Press", "Barbell + Bench", "Intermediate"],
    ["Incline Dumbbell Press", "Dumbbells + Bench", "Intermediate"],
    ["Dumbbell Bench Press", "Dumbbells + Bench", "Beginner"],
    ["Machine Chest Press", "Machine", "Beginner"],
    ["Cable Chest Fly", "Cable", "Beginner"],
    ["Pec Deck", "Machine", "Beginner"],
    ["Push-up", "Bodyweight", "Beginner", ["Build muscle", "Lose weight"]],
    ["Incline Push-up", "Bench", "Beginner", ["Build muscle", "Lose weight"]],
    ["Knee Push-up", "Bodyweight", "Beginner", ["Build muscle", "Lose weight"]],
    ["Assisted Dip", "Dip station", "Intermediate"],
    ["Smith Machine Bench Press", "Smith machine", "Beginner"],
  ]),
  ...groupExercises("Back", "crimson", "BACK", [
    ["Lat Pulldown", "Cable", "Beginner"],
    ["Pull-up", "Pull-up bar", "Intermediate"],
    ["Chest-supported Row", "Machine", "Intermediate"],
    [
      "Barbell Row",
      "Barbell",
      "Intermediate",
      ["Build muscle", "Increase strength"],
    ],
    ["One-arm Dumbbell Row", "Dumbbells", "Beginner"],
    ["Seated Cable Row", "Cable", "Beginner"],
    ["Straight-arm Pulldown", "Cable", "Beginner"],
    ["Machine Row", "Machine", "Beginner"],
    ["Rack Pull", "Barbell", "Advanced", ["Build muscle", "Increase strength"]],
  ]),
  ...groupExercises("Shoulders", "rose", "DELTS", [
    ["Dumbbell Shoulder Press", "Dumbbells", "Beginner"],
    ["Seated Machine Press", "Machine", "Beginner"],
    ["Cable Lateral Raise", "Cable", "Intermediate"],
    ["Dumbbell Lateral Raise", "Dumbbells", "Beginner"],
    ["Rear-delt Fly", "Dumbbells", "Beginner"],
    ["Face Pull", "Cable", "Beginner"],
    ["Arnold Press", "Dumbbells", "Intermediate"],
    ["Front Raise", "Dumbbells", "Beginner"],
    ["Reverse Pec Deck", "Machine", "Beginner"],
  ]),
  ...groupExercises("Biceps", "wine", "BICEPS", [
    ["Barbell Curl", "Barbell", "Beginner"],
    ["Incline Dumbbell Curl", "Dumbbells + Bench", "Intermediate"],
    ["Hammer Curl", "Dumbbells", "Beginner"],
    ["Cable Curl", "Cable", "Beginner"],
    ["Preacher Curl", "Machine", "Beginner"],
    ["Concentration Curl", "Dumbbells", "Beginner"],
    ["EZ-bar Curl", "EZ bar", "Beginner"],
    ["Reverse Curl", "EZ bar", "Intermediate"],
    ["Spider Curl", "Dumbbells + Bench", "Intermediate"],
  ]),
  ...groupExercises("Triceps", "coral", "TRI", [
    ["Rope Pushdown", "Cable", "Beginner"],
    ["Overhead Cable Extension", "Cable", "Beginner"],
    ["Lying Triceps Extension", "EZ bar", "Intermediate"],
    [
      "Close-grip Bench Press",
      "Barbell + Bench",
      "Intermediate",
      ["Build muscle", "Increase strength"],
    ],
    ["Bench Dip", "Bench", "Beginner"],
    ["Single-arm Pushdown", "Cable", "Beginner"],
    ["Dumbbell Kickback", "Dumbbells", "Beginner"],
    ["Machine Dip", "Machine", "Beginner"],
    [
      "Diamond Push-up",
      "Bodyweight",
      "Intermediate",
      ["Build muscle", "Lose weight"],
    ],
  ]),
  ...groupExercises("Quads", "scarlet", "QUADS", [
    [
      "Back Squat",
      "Barbell + Rack",
      "Intermediate",
      ["Build muscle", "Increase strength"],
    ],
    ["Leg Press", "Machine", "Beginner"],
    ["Hack Squat", "Machine", "Intermediate"],
    [
      "Bulgarian Split Squat",
      "Dumbbells + Bench",
      "Intermediate",
      ["Build muscle", "Lose weight"],
    ],
    ["Leg Extension", "Machine", "Beginner"],
    ["Goblet Squat", "Dumbbells", "Beginner"],
    ["Sit-to-Stand", "Bench or chair", "Beginner", ["Lose weight"]],
    [
      "Front Squat",
      "Barbell + Rack",
      "Advanced",
      ["Build muscle", "Increase strength"],
    ],
    ["Walking Lunge", "Dumbbells", "Beginner", ["Build muscle", "Lose weight"]],
    [
      "Step-up",
      "Dumbbells + Bench",
      "Beginner",
      ["Build muscle", "Lose weight"],
    ],
  ]),
  ...groupExercises("Hamstrings & glutes", "pink", "GLUTES", [
    [
      "Romanian Deadlift",
      "Barbell",
      "Intermediate",
      ["Build muscle", "Increase strength"],
    ],
    ["Seated Leg Curl", "Machine", "Beginner"],
    ["Hip Thrust", "Barbell + Bench", "Intermediate"],
    ["Cable Pull-through", "Cable", "Beginner"],
    ["Glute Bridge", "Bodyweight", "Beginner", ["Build muscle", "Lose weight"]],
    ["Nordic Hamstring Curl", "Bodyweight", "Advanced"],
    ["Single-leg Romanian Deadlift", "Dumbbells", "Intermediate"],
    [
      "Good Morning",
      "Barbell",
      "Intermediate",
      ["Build muscle", "Increase strength"],
    ],
    [
      "Kettlebell Deadlift",
      "Kettlebell",
      "Beginner",
      ["Build muscle", "Lose weight"],
    ],
  ]),
  ...groupExercises("Calves", "maroon", "CALVES", [
    ["Standing Calf Raise", "Machine", "Beginner"],
    ["Seated Calf Raise", "Machine", "Beginner"],
    ["Leg Press Calf Raise", "Leg press", "Beginner"],
    [
      "Single-leg Calf Raise",
      "Bodyweight",
      "Beginner",
      ["Build muscle", "Lose weight"],
    ],
    ["Donkey Calf Raise", "Machine", "Intermediate"],
    ["Smith Machine Calf Raise", "Smith machine", "Beginner"],
    ["Dumbbell Calf Raise", "Dumbbells", "Beginner"],
    ["Jump Rope", "Jump rope", "Beginner", ["Lose weight"]],
    [
      "Tibialis Raise",
      "Bodyweight",
      "Beginner",
      ["Build muscle", "Lose weight"],
    ],
  ]),
  ...groupExercises("Core", "blood", "CORE", [
    ["Cable Crunch", "Cable", "Beginner"],
    ["Hanging Knee Raise", "Pull-up bar", "Intermediate"],
    ["Dead Bug", "Bodyweight", "Beginner", ["Build muscle", "Lose weight"]],
    ["Plank", "Bodyweight", "Beginner", ["Build muscle", "Lose weight"]],
    ["Pallof Press", "Cable", "Beginner"],
    ["Ab Wheel Rollout", "Ab wheel", "Intermediate"],
    [
      "Russian Twist",
      "Bodyweight",
      "Beginner",
      ["Build muscle", "Lose weight"],
    ],
    [
      "Reverse Crunch",
      "Bodyweight",
      "Beginner",
      ["Build muscle", "Lose weight"],
    ],
    ["Side Plank", "Bodyweight", "Beginner", ["Build muscle", "Lose weight"]],
  ]),
  ...groupExercises("Fat loss cardio", "fire", "CARDIO", [
    ["Incline Treadmill Walk", "Treadmill", "Beginner", ["Lose weight"]],
    ["Stationary Bike Intervals", "Bike", "Beginner", ["Lose weight"]],
    ["Rowing Intervals", "Row machine", "Intermediate", ["Lose weight"]],
    ["Sled Push", "Sled", "Intermediate", ["Lose weight"]],
    ["Kettlebell Swing", "Kettlebell", "Intermediate", ["Lose weight"]],
    ["Battle Rope Intervals", "Battle ropes", "Beginner", ["Lose weight"]],
    ["Elliptical Steady State", "Elliptical", "Beginner", ["Lose weight"]],
    ["Farmer Carry", "Dumbbells", "Beginner", ["Lose weight"]],
    ["Low-impact Step-up Circuit", "Bench", "Beginner", ["Lose weight"]],
  ]),
];

type ExerciseGuide = {
  pattern: "Push" | "Pull" | "Legs" | "Hinge" | "Core" | "Conditioning";
  primary: string[];
  secondary: string[];
  pose: "press" | "pull" | "squat" | "hinge" | "core" | "cardio";
  steps: [string, string, string];
  cue: string;
};

const guideByGroup: Record<string, ExerciseGuide> = {
  Chest: {
    pattern: "Push",
    primary: ["Pectorals", "Upper chest"],
    secondary: ["Triceps", "Front delts"],
    pose: "press",
    steps: [
      "Set your shoulder blades down and back.",
      "Press away with a controlled path.",
      "Return slowly and keep your chest lifted.",
    ],
    cue: "Keep wrists stacked over elbows and avoid bouncing at the bottom.",
  },
  Back: {
    pattern: "Pull",
    primary: ["Lats", "Mid-back"],
    secondary: ["Biceps", "Rear delts"],
    pose: "pull",
    steps: [
      "Set a tall chest and stable torso.",
      "Pull elbows toward your ribs.",
      "Control the reach without losing position.",
    ],
    cue: "Think elbows to hips for vertical pulls and elbows behind you for rows.",
  },
  Shoulders: {
    pattern: "Push",
    primary: ["Deltoids", "Side delts"],
    secondary: ["Triceps", "Upper traps"],
    pose: "press",
    steps: [
      "Brace your core with ribs down.",
      "Raise or press in a smooth arc.",
      "Lower with control, keeping tension.",
    ],
    cue: "Keep your neck long; do not shrug into your ears.",
  },
  Biceps: {
    pattern: "Pull",
    primary: ["Biceps"],
    secondary: ["Brachialis", "Forearms"],
    pose: "pull",
    steps: [
      "Stand tall with elbows close to your sides.",
      "Curl without swinging your torso.",
      "Lower until the elbow is straight but not forced.",
    ],
    cue: "Keep the upper arm quiet so the biceps do the work.",
  },
  Triceps: {
    pattern: "Push",
    primary: ["Triceps"],
    secondary: ["Chest", "Front delts"],
    pose: "press",
    steps: [
      "Lock your upper arm into position.",
      "Extend your elbow until the arm is long.",
      "Return under control without flaring elbows.",
    ],
    cue: "Move at the elbow rather than using momentum from the shoulders.",
  },
  Quads: {
    pattern: "Legs",
    primary: ["Quadriceps"],
    secondary: ["Glutes", "Core"],
    pose: "squat",
    steps: [
      "Brace and place pressure through your whole foot.",
      "Lower with knees tracking over toes.",
      "Drive the floor away to stand tall.",
    ],
    cue: "Use a comfortable depth you can control with a neutral spine.",
  },
  "Hamstrings & glutes": {
    pattern: "Hinge",
    primary: ["Hamstrings", "Glutes"],
    secondary: ["Spinal erectors", "Core"],
    pose: "hinge",
    steps: [
      "Brace and soften your knees.",
      "Send hips back while keeping the load close.",
      "Drive hips forward to finish tall.",
    ],
    cue: "Your hips travel back; do not turn a hinge into a squat.",
  },
  Calves: {
    pattern: "Legs",
    primary: ["Gastrocnemius", "Soleus"],
    secondary: ["Foot stabilizers"],
    pose: "squat",
    steps: [
      "Place the ball of your foot securely.",
      "Rise fully through the ankle.",
      "Pause, then lower into a gentle stretch.",
    ],
    cue: "Use a full, controlled range instead of bouncing.",
  },
  Core: {
    pattern: "Core",
    primary: ["Rectus abdominis", "Obliques"],
    secondary: ["Deep core", "Hip flexors"],
    pose: "core",
    steps: [
      "Set your ribs over your pelvis.",
      "Move without arching your lower back.",
      "Exhale and maintain tension as you return.",
    ],
    cue: "Quality trunk position matters more than speed or range.",
  },
  "Fat loss cardio": {
    pattern: "Conditioning",
    primary: ["Full body"],
    secondary: ["Cardiovascular system", "Core"],
    pose: "cardio",
    steps: [
      "Choose a pace you can control.",
      "Keep your posture tall and breathing steady.",
      "Adjust speed or resistance before form breaks.",
    ],
    cue: "Start at a sustainable effort and progress duration or pace gradually.",
  },
};

const equipmentChoices = [
  "Bodyweight",
  "Dumbbells",
  "Barbell",
  "Bench",
  "Cable",
  "Machine",
  "Treadmill",
  "Bike",
  "Kettlebell",
  "Pull-up bar",
];

// Some exercise-library labels describe a specific version of an equipment
// category. The onboarding choices intentionally stay simple, so map those
// labels back to what a member can actually select.
const equipmentAliases: Record<string, string> = {
  "smith machine": "machine",
  "dip station": "machine",
  "leg press": "machine",
  "row machine": "machine",
  elliptical: "machine",
  "ez bar": "barbell",
  chair: "bench",
};

function normaliseEquipmentName(value: string) {
  const name = value.trim().toLowerCase();
  return equipmentAliases[name] ?? name;
}

function memberHasEquipment(availableEquipment: string[], requirement: string) {
  const required = normaliseEquipmentName(requirement);

  // Bodyweight movements never require a selected machine or tool.
  if (required === "bodyweight") return true;

  return availableEquipment.some(
    (equipment) => normaliseEquipmentName(equipment) === required,
  );
}

function isExerciseAvailable(exercise: Exercise, availableEquipment: string[]) {
  if (exercise.equipment === "Bodyweight") return true;

  // A plus sign means every item is required; "or" offers an alternative.
  // Example: "Dumbbells + Bench" requires both, while "Bench or chair"
  // accepts either selected option.
  return exercise.equipment.split(" + ").every((requirement) =>
    requirement
      .split(/\s+or\s+/i)
      .some((option) => memberHasEquipment(availableEquipment, option)),
  );
}

const customerProfileStorageKey = "pro-fitness-profile-v1";
const legacyCustomerProfileStorageKey = "repwise-demo-profile";

function loadCustomerProfile(): CustomerProfile | null {
  try {
    const saved =
      window.localStorage.getItem(customerProfileStorageKey) ??
      window.localStorage.getItem(legacyCustomerProfileStorageKey);
    if (!saved) return null;

    const profile = JSON.parse(saved) as CustomerProfile;
    return profile?.name && profile?.email ? profile : null;
  } catch {
    return null;
  }
}

function saveCustomerProfile(profile: CustomerProfile) {
  window.localStorage.setItem(customerProfileStorageKey, JSON.stringify(profile));
  window.localStorage.removeItem(legacyCustomerProfileStorageKey);
}

function loadLocalAppState(): LocalAppState {
  try {
    const saved = window.localStorage.getItem("repwise-local-app-state");
    if (!saved)
      return {
        water: 0,
        workoutLogs: [],
        nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        readiness: null,
        foodEntries: [],
        measurements: {
          bodyFat: "",
          waist: "",
          chest: "",
          shoulders: "",
          arms: "",
          thigh: "",
        },
        progressPhotos: [],
        reminders: {
          enabled: false,
          time: "18:30",
          days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        },
      };
    const parsed = JSON.parse(saved) as Partial<LocalAppState>;
    return {
      water: typeof parsed.water === "number" ? parsed.water : 0,
      workoutLogs: Array.isArray(parsed.workoutLogs) ? parsed.workoutLogs : [],
      nutrition: {
        calories: Number(parsed.nutrition?.calories) || 0,
        protein: Number(parsed.nutrition?.protein) || 0,
        carbs: Number(parsed.nutrition?.carbs) || 0,
        fat: Number(parsed.nutrition?.fat) || 0,
      },
      readiness:
        parsed.readiness &&
        [
          parsed.readiness.sleep,
          parsed.readiness.energy,
          parsed.readiness.soreness,
          parsed.readiness.stress,
        ].every((value) => Number(value) >= 1 && Number(value) <= 5)
          ? parsed.readiness
          : null,
      foodEntries: Array.isArray(parsed.foodEntries) ? parsed.foodEntries : [],
      measurements: {
        bodyFat: parsed.measurements?.bodyFat ?? "",
        waist: parsed.measurements?.waist ?? "",
        chest: parsed.measurements?.chest ?? "",
        shoulders: parsed.measurements?.shoulders ?? "",
        arms: parsed.measurements?.arms ?? "",
        thigh: parsed.measurements?.thigh ?? "",
      },
      progressPhotos: Array.isArray(parsed.progressPhotos)
        ? parsed.progressPhotos
        : [],
      reminders: parsed.reminders
        ? {
            enabled: Boolean(parsed.reminders.enabled),
            time: parsed.reminders.time || "18:30",
            days: Array.isArray(parsed.reminders.days)
              ? parsed.reminders.days
              : ["Mon", "Tue", "Wed", "Thu", "Fri"],
          }
        : {
            enabled: false,
            time: "18:30",
            days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
          },
    };
  } catch {
    return {
      water: 0,
      workoutLogs: [],
      nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      readiness: null,
      foodEntries: [],
      measurements: {
        bodyFat: "",
        waist: "",
        chest: "",
        shoulders: "",
        arms: "",
        thigh: "",
      },
      progressPhotos: [],
      reminders: {
        enabled: false,
        time: "18:30",
        days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      },
    };
  }
}

/* Legacy single-day planner replaced by the rotating weekly schedule.
function createLegacyDailyPlan(profile: CustomerProfile): DailyPlan {
  const currentWeight = Number(profile.weight) || 70;
  const targetWeight = Number(profile.targetWeight) || currentWeight;
  const preferLowImpact =
    profile.goal === "Lose weight" &&
    (currentWeight >= 95 ||
      profile.limitations.toLowerCase().includes("knee") ||
      profile.limitations.toLowerCase().includes("running"));
  const byGoal: Record<
    TrainingGoal,
    { title: string; focus: string; names: string[]; message: string }
  > = {
    "Build muscle": {
      title: profile.days <= 3 ? "Full-body build" : "Pull day",
      focus:
        profile.days <= 3
          ? "Chest • Back • Legs"
          : "Back • Biceps • Rear delts",
      names:
        profile.days <= 3
          ? [
              "Goblet Squat",
              "Dumbbell Bench Press",
              "One-arm Dumbbell Row",
              "Seated Leg Curl",
              "Plank",
            ]
          : [
              "Lat Pulldown",
              "Chest-supported Row",
              "Incline Dumbbell Curl",
              "Face Pull",
              "Hammer Curl",
            ],
      message:
        "Your plan prioritizes controlled volume for muscle growth and repeats key movements often enough to progress.",
    },
    "Lose weight": {
      title: "Full-body burn",
      focus: "Strength • Cardio • Core",
      names: [
        "Goblet Squat",
        "Push-up",
        "One-arm Dumbbell Row",
        "Kettlebell Swing",
        "Step-up",
        "Incline Treadmill Walk",
      ],
      message:
        "Today combines full-body strength with conditioning so you can keep building fitness while working toward your weight target.",
    },
    "Increase strength": {
      title: "Strength pull",
      focus: "Back • Biceps • Grip",
      names: [
        "Barbell Row",
        "Pull-up",
        "Rack Pull",
        "Lat Pulldown",
        "Barbell Curl",
      ],
      message:
        "Today starts with the most technical compound lift, followed by steady strength-building accessories.",
    },
  };
  const base = byGoal[profile.goal];
  const planNames = preferLowImpact
    ? [
        "Leg Press",
        "Machine Chest Press",
        "Seated Cable Row",
        "Pallof Press",
        "Stationary Bike Intervals",
        "Elliptical Steady State",
      ]
    : base.names;
  const available = planNames.filter((name) => {
    const exercise = exerciseData.find((item) => item.name === name);
    return Boolean(exercise && isExerciseAvailable(exercise, profile.equipment));
  });
  const fallback = exerciseData
    .filter(
      (exercise) =>
        exercise.goals.includes(profile.goal) &&
        isExerciseAvailable(exercise, profile.equipment),
    )
    .slice(0, 6)
    .map((exercise) => exercise.name);
  const exercises = (
    available.length >= 4
      ? available
      : [...available, ...fallback.filter((name) => !available.includes(name))]
  ).slice(0, 6);
  const sets =
    profile.goal === "Lose weight"
      ? `${exercises.length * 3} rounds`
      : `${exercises.length * (profile.experience === "Beginner" ? 2 : 3)} sets`;
  const prescription =
    profile.goal === "Lose weight"
      ? "3 rounds · 8–12 reps · 45–75 sec rest"
      : profile.experience === "Beginner"
        ? "2 sets · 8–12 reps · 90 sec rest"
        : "3 sets · 8–12 reps · 90–120 sec rest";
  const adjustment =
    profile.goal === "Lose weight"
      ? preferLowImpact
        ? `At ${currentWeight} kg, this plan favors low-impact conditioning and stable machines while you work toward ${targetWeight} kg.`
        : `At ${currentWeight} kg, this plan balances strength circuits with conditioning while you work toward ${targetWeight} kg.`
      : `At ${currentWeight} kg, your volume and recovery targets are calibrated for a steady route toward ${targetWeight} kg.`;
  return {
    title: base.title,
    focus: base.focus,
    minutes: `${Math.min(profile.duration, profile.goal === "Lose weight" ? 55 : 70)} min`,
    exercisesLabel: `${exercises.length} exercises`,
    sets,
    exercises,
    message: base.message,
    prescription,
    adjustment,
  };
}
*/

function buildWorkoutTemplates(profile: CustomerProfile): WorkoutTemplate[] {
  const standard: WorkoutTemplate[] = [
    {
      key: "chest-triceps",
      title: "Chest & triceps",
      focus: "Chest • Triceps",
      groups: ["Chest", "Triceps"],
      exercises: ["Barbell Bench Press", "Dumbbell Bench Press", "Machine Chest Press", "Cable Chest Fly", "Push-up", "Diamond Push-up"],
      message: "Pressing volume for chest and triceps with controlled reps and stable shoulders.",
    },
    {
      key: "back-biceps",
      title: "Back & biceps",
      focus: "Back • Biceps",
      groups: ["Back", "Biceps"],
      exercises: ["Lat Pulldown", "Chest-supported Row", "One-arm Dumbbell Row", "Seated Cable Row", "Barbell Curl", "Hammer Curl"],
      message: "A pull session built around controlled rows, vertical pulls, and elbow flexion.",
    },
    {
      key: "legs-calves",
      title: "Legs & calves",
      focus: "Quads • Glutes • Calves",
      groups: ["Quads", "Hamstrings & glutes", "Calves"],
      exercises: ["Leg Press", "Goblet Squat", "Bulgarian Split Squat", "Romanian Deadlift", "Glute Bridge", "Single-leg Calf Raise"],
      message: "Train the lower body through knee bend, hip hinge, and calf work without rushing reps.",
    },
    {
      key: "shoulders-core",
      title: "Shoulders & core",
      focus: "Shoulders • Core",
      groups: ["Shoulders", "Core"],
      exercises: ["Dumbbell Shoulder Press", "Seated Machine Press", "Dumbbell Lateral Raise", "Face Pull", "Dead Bug", "Plank"],
      message: "Build resilient shoulders and trunk control with deliberate, pain-free range of motion.",
    },
    {
      key: "full-body",
      title: "Full-body strength",
      focus: "Legs • Push • Pull • Core",
      groups: ["Quads", "Chest", "Back", "Core"],
      exercises: ["Goblet Squat", "Push-up", "One-arm Dumbbell Row", "Glute Bridge", "Plank", "Farmer Carry"],
      message: "A balanced full-body session that keeps every major movement pattern progressing.",
    },
    {
      key: "posterior-conditioning",
      title: "Posterior chain & conditioning",
      focus: "Glutes • Back • Cardio",
      groups: ["Hamstrings & glutes", "Back", "Fat loss cardio"],
      exercises: ["Romanian Deadlift", "Hip Thrust", "Cable Pull-through", "Machine Row", "Stationary Bike Intervals", "Incline Treadmill Walk"],
      message: "Build the posterior chain, then finish with conditioning that fits your available equipment.",
    },
  ];

  const strength = standard.map((template, index) => ({
    ...template,
    key: `strength-${template.key}`,
    title: index === 0 ? "Strength push" : index === 1 ? "Strength pull" : index === 2 ? "Strength legs" : template.title,
    message: "Start with your most stable available compound movement, then complete controlled strength accessories.",
  }));
  const fatLoss: WorkoutTemplate[] = [
    { ...standard[0], key: "burn-upper", title: "Upper-body burn", focus: "Push • Pull • Cardio", groups: ["Chest", "Back", "Fat loss cardio"], exercises: ["Push-up", "One-arm Dumbbell Row", "Machine Chest Press", "Lat Pulldown", "Farmer Carry", "Stationary Bike Intervals"], message: "Alternate strength movements with controlled conditioning to support fat loss while protecting muscle." },
    { ...standard[2], key: "burn-lower", title: "Lower-body burn", focus: "Legs • Glutes • Cardio", groups: ["Quads", "Hamstrings & glutes", "Fat loss cardio"], exercises: ["Leg Press", "Goblet Squat", "Glute Bridge", "Single-leg Calf Raise", "Low-impact Step-up Circuit", "Stationary Bike Intervals"], message: "A lower-body circuit that raises your heart rate without sacrificing movement quality." },
    { ...standard[4], key: "burn-full", title: "Full-body metabolic circuit", focus: "Strength • Cardio • Core", groups: ["Quads", "Chest", "Back", "Core", "Fat loss cardio"], exercises: ["Goblet Squat", "Push-up", "One-arm Dumbbell Row", "Dead Bug", "Kettlebell Swing", "Incline Treadmill Walk"], message: "Full-body strength and controlled conditioning for a sustainable calorie burn." },
    { ...standard[3], key: "burn-core", title: "Core & cardio", focus: "Core • Conditioning", groups: ["Core", "Fat loss cardio"], exercises: ["Dead Bug", "Plank", "Russian Twist", "Stationary Bike Intervals", "Incline Treadmill Walk", "Farmer Carry"], message: "Build core control and aerobic fitness at a pace you can recover from." },
    { ...standard[1], key: "burn-pull", title: "Pull & carry circuit", focus: "Back • Arms • Conditioning", groups: ["Back", "Biceps", "Fat loss cardio"], exercises: ["Lat Pulldown", "Seated Cable Row", "Hammer Curl", "Farmer Carry", "Stationary Bike Intervals", "Elliptical Steady State"], message: "Pulling strength and loaded carries keep this session full-body without repeating yesterday’s movements." },
    { ...standard[4], key: "burn-maintain", title: "Strength maintenance", focus: "Legs • Push • Core", groups: ["Quads", "Chest", "Core"], exercises: ["Leg Press", "Machine Chest Press", "Push-up", "Glute Bridge", "Side Plank", "Incline Treadmill Walk"], message: "Strength work helps maintain muscle while your nutrition target drives the weight change." },
  ];
  const templates = profile.goal === "Lose weight" ? fatLoss : profile.goal === "Increase strength" ? strength : standard;
  const count = Math.max(2, Math.min(6, profile.days));
  // With only two available training days, use full-body coverage first so
  // legs, push, pull, and core are not left out of the week.
  return count === 2
    ? [templates[4], templates[2]]
    : templates.slice(0, count);
}

function prefersLowImpact(profile: CustomerProfile) {
  const weight = Number(profile.weight) || 70;
  const limitations = profile.limitations.toLowerCase();
  return profile.goal === "Lose weight" && (
    weight >= 95 || limitations.includes("knee") || limitations.includes("running")
  );
}

function isSuitableForProfile(exercise: Exercise, profile: CustomerProfile) {
  const limitations = profile.limitations.toLowerCase();
  const highImpact = new Set(["Jump Rope", "Kettlebell Swing", "Sled Push", "Walking Lunge", "Step-up", "Low-impact Step-up Circuit"]);
  const kneeSensitive = new Set(["Back Squat", "Hack Squat", "Bulgarian Split Squat", "Walking Lunge", "Step-up", "Jump Rope"]);
  if (prefersLowImpact(profile) && highImpact.has(exercise.name)) return false;
  if (limitations.includes("knee") && kneeSensitive.has(exercise.name)) return false;
  return true;
}

function uniqueExercises(exercises: Exercise[]) {
  return [...new Map(exercises.map((exercise) => [exercise.name, exercise])).values()];
}

function createDailyPlan(profile: CustomerProfile, sessionIndex = 0): DailyPlan {
  const templates = buildWorkoutTemplates(profile);
  const template = templates[sessionIndex % templates.length];
  const targetCount = profile.duration <= 30 ? 4 : profile.duration <= 45 ? 5 : 6;
  const permitted = (exercise: Exercise) =>
    exercise.goals.includes(profile.goal) &&
    isExerciseAvailable(exercise, profile.equipment) &&
    isSuitableForProfile(exercise, profile);
  const named = template.exercises
    .map((name) => exerciseData.find((exercise) => exercise.name === name))
    .filter((exercise): exercise is Exercise => Boolean(exercise && permitted(exercise)));
  const groupFallbacks = template.groups.flatMap((group) =>
    exerciseData.filter((exercise) => exercise.group === group && permitted(exercise)),
  );
  const goalFallbacks = exerciseData.filter(permitted);
  const selectedExercises = uniqueExercises([...named, ...groupFallbacks, ...goalFallbacks]).slice(0, targetCount);
  const exercises = selectedExercises.map((exercise) => exercise.name);
  const actualGroups = selectedExercises
    .map((exercise) => exercise.group)
    .filter((group, index, groups) => groups.indexOf(group) === index)
    .slice(0, 3);
  const hasTemplateFocus = selectedExercises.some((exercise) => template.groups.includes(exercise.group));
  const setsPerExercise = profile.goal === "Increase strength" ? (profile.experience === "Beginner" ? 3 : 4) : profile.experience === "Beginner" ? 2 : 3;
  const currentWeight = Number(profile.weight) || 70;
  const targetWeight = Number(profile.targetWeight) || currentWeight;
  const lowImpact = prefersLowImpact(profile);
  const sets = profile.goal === "Lose weight" ? `${exercises.length * 3} circuit sets` : `${exercises.length * setsPerExercise} working sets`;
  const prescription = profile.goal === "Lose weight"
    ? lowImpact ? "2–3 rounds • controlled pace • 60–90 sec rest" : "3 rounds • 8–12 reps • 45–75 sec rest"
    : profile.goal === "Increase strength"
      ? `${setsPerExercise} sets • 4–8 reps • 2–3 min rest`
      : `${setsPerExercise} sets • 8–12 reps • 90–120 sec rest`;
  const adjustment = profile.goal === "Lose weight"
    ? lowImpact
      ? `At ${currentWeight} kg and with your movement notes, this plan uses low-impact conditioning and stable patterns while you work toward ${targetWeight} kg.`
      : `At ${currentWeight} kg, this schedule alternates strength and conditioning while you work toward ${targetWeight} kg.`
    : `At ${currentWeight} kg, your weekly split, volume, and recovery are adjusted for ${profile.goal.toLowerCase()} and your ${profile.days}-day schedule.`;
  return {
    title: hasTemplateFocus ? template.title : "Equipment-matched full body",
    focus: actualGroups.length ? actualGroups.join(" • ") : template.focus,
    minutes: `${Math.min(profile.duration, profile.goal === "Lose weight" ? 55 : 70)} min`,
    exercisesLabel: `${exercises.length} exercises`,
    sets,
    exercises,
    message: hasTemplateFocus ? template.message : "This session switches to movements that match the equipment you have available today.",
    prescription,
    adjustment,
  };
}

function createWeeklyPlan(profile: CustomerProfile, completedWorkouts: number): WeeklyPlan {
  const templates = buildWorkoutTemplates(profile);
  const trainingDays = Math.max(2, Math.min(6, profile.days));
  const trainingPositions: Record<number, number[]> = {
    2: [0, 3], 3: [0, 2, 4], 4: [0, 2, 4, 5], 5: [0, 1, 3, 4, 5], 6: [0, 1, 2, 3, 4, 5],
  };
  const labels = ["Today", "Tomorrow", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];
  let sessionIndex = completedWorkouts % templates.length;
  const days = Array.from({ length: 7 }, (_, index) => {
    if (trainingPositions[trainingDays].includes(index)) {
      const plan = createDailyPlan(profile, sessionIndex);
      const template = templates[sessionIndex % templates.length];
      sessionIndex += 1;
      return {
        id: `workout-${index}-${template.key}`,
        label: labels[index],
        kind: "Workout" as const,
        title: plan.title,
        focus: plan.focus,
        note: plan.adjustment,
        plan,
      };
    }
    return {
      id: `recovery-${index}`,
      label: labels[index],
      kind: "Recovery" as const,
      title: "Recovery & mobility",
      focus: "Walk • mobility • hydration",
      note: "No hard lifting today. Keep moving gently, prioritize sleep, and return ready for your next scheduled session.",
    };
  });
  return { days, currentPlanId: days.find((day) => day.kind === "Workout")?.id ?? "" };
}

function calculateNutritionTargets(profile: CustomerProfile): NutritionTargets {
  const weight = Number(profile.weight) || 70;
  const height = Number(profile.height) || 170;
  const age = Number(profile.age) || 30;
  const sexAdjustment =
    profile.sex === "Male" ? 5 : profile.sex === "Female" ? -161 : -78;
  const bmr = 10 * weight + 6.25 * height - 5 * age + sexAdjustment;
  const activity = profile.days <= 2 ? 1.35 : profile.days <= 4 ? 1.5 : 1.65;
  const maintenance = Math.round((bmr * activity) / 50) * 50;
  const adjustment =
    profile.goal === "Lose weight"
      ? -350
      : profile.goal === "Build muscle"
        ? 250
        : 0;
  const calories = Math.max(
    1200,
    Math.round((maintenance + adjustment) / 50) * 50,
  );
  const protein = Math.round(
    weight * (profile.goal === "Lose weight" ? 1.9 : 1.7),
  );
  const fat = Math.round(weight * 0.75);
  const carbs = Math.max(
    80,
    Math.round((calories - protein * 4 - fat * 9) / 4),
  );
  const pace =
    profile.goal === "Lose weight"
      ? "A gradual deficit"
      : profile.goal === "Build muscle"
        ? "A modest surplus"
        : "Maintenance intake";
  return { calories, protein, carbs, fat, maintenance, pace };
}

type MuscleInsight = {
  name: string;
  groups: string[];
  target: number;
  sets: number;
  recovery: number | null;
  lastTrained: string;
  nextRecommended: string;
  exercises: string[];
  tone: "ready" | "partial" | "fatigued" | "priority" | "unknown";
};

const muscleDefinitions: Array<
  Pick<MuscleInsight, "name" | "groups" | "target" | "nextRecommended">
> = [
  { name: "Chest", groups: ["Chest"], target: 12, nextRecommended: "Saturday" },
  { name: "Back", groups: ["Back"], target: 14, nextRecommended: "Tomorrow" },
  {
    name: "Shoulders",
    groups: ["Shoulders"],
    target: 10,
    nextRecommended: "Friday",
  },
  { name: "Quads", groups: ["Quads"], target: 12, nextRecommended: "Sunday" },
  {
    name: "Hamstrings",
    groups: ["Hamstrings & glutes"],
    target: 10,
    nextRecommended: "Sunday",
  },
  {
    name: "Arms",
    groups: ["Biceps", "Triceps"],
    target: 10,
    nextRecommended: "Tomorrow",
  },
];

function daysSince(date: string) {
  return Math.max(
    0,
    Math.floor((Date.now() - new Date(date).getTime()) / (24 * 60 * 60 * 1000)),
  );
}

function deriveMuscleInsights(workoutLogs: WorkoutLog[]): MuscleInsight[] {
  return muscleDefinitions.map((definition) => {
    const matched = workoutLogs.flatMap((workout) =>
      workout.exercises.filter((exerciseName) =>
        definition.groups.includes(
          exerciseData.find((exercise) => exercise.name === exerciseName)
            ?.group ?? "",
        ),
      ),
    );
    const matchingWorkouts = workoutLogs.filter((workout) =>
      workout.exercises.some((exerciseName) =>
        definition.groups.includes(
          exerciseData.find((exercise) => exercise.name === exerciseName)
            ?.group ?? "",
        ),
      ),
    );
    const estimatedSets = matchingWorkouts.reduce((total, workout) => {
      const related = workout.exercises.filter((exerciseName) =>
        definition.groups.includes(
          exerciseData.find((exercise) => exercise.name === exerciseName)
            ?.group ?? "",
        ),
      ).length;
      return (
        total +
        (related
          ? Math.round(
              (workout.completedSets * related) /
                Math.max(1, workout.exercises.length),
            )
          : 0)
      );
    }, 0);
    const latest = matchingWorkouts
      .map((workout) => workout.date)
      .sort()
      .at(-1);
    const days = latest ? daysSince(latest) : null;
    const recovery =
      days === null
        ? null
        : days === 0
          ? 38
          : days === 1
            ? 64
            : days === 2
              ? 78
              : 92;
    const ratio = estimatedSets / definition.target;
    const tone: MuscleInsight["tone"] =
      recovery === null
        ? "unknown"
        : recovery < 50
          ? "fatigued"
          : ratio < 0.55 && recovery > 65
            ? "priority"
            : recovery < 75
              ? "partial"
              : "ready";
    return {
      ...definition,
      sets: estimatedSets,
      recovery,
      lastTrained:
        days === null
          ? "No recent data"
          : days === 0
            ? "Today"
            : days === 1
              ? "Yesterday"
              : `${days} days ago`,
      exercises: [...new Set(matched)].slice(0, 3),
      tone,
    };
  });
}

function calculateReadiness(
  check: ReadinessCheck | null,
  workoutLogs: WorkoutLog[],
) {
  const hasEnoughData = Boolean(check) || workoutLogs.length >= 2;
  const sleep = check ? check.sleep * 20 : 76;
  const muscleRecovery = check ? Math.round(check.soreness * 12 + 40) : 74;
  const fatigue = check ? check.energy * 20 : 72;
  const soreness = check ? check.soreness * 20 : 70;
  const recentWorkload = workoutLogs.length
    ? Math.max(
        58,
        Math.min(
          92,
          90 -
            workoutLogs
              .slice(0, 3)
              .reduce((sum, workout) => sum + workout.completedSets, 0),
        ),
      )
    : 76;
  const score = Math.round(
    (sleep + muscleRecovery + fatigue + soreness + recentWorkload) / 5,
  );
  return {
    score,
    estimated: !hasEnoughData,
    factors: [
      { label: "Sleep", value: sleep },
      { label: "Muscle recovery", value: muscleRecovery },
      { label: "Fatigue", value: fatigue },
      { label: "Soreness", value: soreness },
      { label: "Recent workload", value: recentWorkload },
    ],
  };
}

const createStarterSets = (): WorkoutSet[] => [
  {
    id: 1,
    weight: "",
    reps: "10",
    rir: "4",
    kind: "Warm-up",
    rpe: "6",
    done: false,
  },
  {
    id: 2,
    weight: "",
    reps: "",
    rir: "2",
    kind: "Working",
    rpe: "8",
    done: false,
  },
  {
    id: 3,
    weight: "",
    reps: "",
    rir: "2",
    kind: "Working",
    rpe: "8",
    done: false,
  },
  {
    id: 4,
    weight: "",
    reps: "",
    rir: "2",
    kind: "Working",
    rpe: "8",
    done: false,
  },
];

function Ring({
  value,
  size = 92,
  stroke = 8,
  label,
  sublabel,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label: string;
  sublabel?: string;
}) {
  return (
    <div
      className="ring"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(#ff4747 ${value * 3.6}deg, rgba(255,255,255,.09) 0deg)`,
      }}
    >
      <div className="ring-inner" style={{ inset: stroke }}>
        <strong>{label}</strong>
        {sublabel && <span>{sublabel}</span>}
      </div>
    </div>
  );
}

function LogoMark() {
  return (
    <div className="logo-mark">
      <img src="/brand/pro-fitness-launcher.png" alt="" />
    </div>
  );
}

function SignupOnboarding({
  onComplete,
}: {
  onComplete: (profile: CustomerProfile) => void;
}) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<OnboardingDraft>({
    name: "",
    email: "",
    password: "",
    age: "",
    sex: "Prefer not to say",
    height: "",
    weight: "",
    targetWeight: "",
    goal: "Build muscle",
    experience: "Beginner",
    days: 3,
    duration: 45,
    equipment: ["Bodyweight"],
    trainingHistory: "New to structured training",
    limitations: "None shared",
  });
  const setValue = <K extends keyof OnboardingDraft>(
    key: K,
    value: OnboardingDraft[K],
  ) => setDraft((current) => ({ ...current, [key]: value }));
  const preview = createDailyPlan({
    ...draft,
    id: "RW-DEMO",
    createdAt: new Date().toISOString(),
  });
  const canContinue =
    step === 0
      ? Boolean(draft.name && draft.email && draft.password)
      : step === 1
        ? Boolean(
            draft.age && draft.height && draft.weight && draft.targetWeight,
          )
        : step === 2
          ? draft.equipment.length > 0
          : true;
  const finishSignup = () => {
    const { password: _password, ...profile } = draft;
    onComplete({
      ...profile,
      id: `RW-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      createdAt: new Date().toISOString(),
    });
  };
  const startDemo = () => {
    onComplete({
      id: "RW-DEMO",
      name: "Pro Fitness Demo",
      email: "demo@profitness.app",
      age: "28",
      sex: "Prefer not to say",
      height: "175",
      weight: "78",
      targetWeight: "75",
      goal: "Build muscle",
      experience: "Intermediate",
      days: 4,
      duration: 45,
      equipment: ["Bodyweight", "Dumbbells", "Bench", "Cable", "Machine"],
      trainingHistory: "Training consistently for 6–12 months",
      limitations: "None shared",
      createdAt: new Date().toISOString(),
      checkIns: [],
    });
  };
  const title = [
    "Create your account",
    "Your body and goal",
    "How you like to train",
    "Training history",
    "Your first daily plan",
  ][step];

  return (
    <main className="onboarding-shell">
      <section className="onboarding-aside">
        <div className="brand">
          <LogoMark />
          <span>
            pro <span>fitness</span>
          </span>
        </div>
        <div className="onboarding-aside-copy">
          <span className="eyebrow">
            <span className="live-dot" /> PERSONAL COACHING
          </span>
          <h1>
            A plan built around <em>you.</em>
          </h1>
          <p>
            We ask the essentials before creating your account so
            recommendations are based on your goal, body details, training
            background, and available equipment.
          </p>
        </div>
        <div className="onboarding-benefits">
          <span>
            <Check size={16} /> Daily plan, not a generic PDF
          </span>
          <span>
            <Check size={16} /> All major muscle groups covered
          </span>
          <span>
            <Check size={16} /> Adjusted for equipment and experience
          </span>
        </div>
        <small>Your profile and training data stay saved on this device.</small>
      </section>
      <section className="onboarding-main">
        <div className="onboarding-progress">
          <span>STEP {step + 1} OF 5</span>
          <div>
            {[0, 1, 2, 3, 4].map((item) => (
              <i key={item} className={item <= step ? "active" : ""} />
            ))}
          </div>
          <button
            onClick={() => {
              window.localStorage.removeItem(customerProfileStorageKey);
              window.localStorage.removeItem(legacyCustomerProfileStorageKey);
            }}
          >
            Reset demo
          </button>
        </div>
        <div className="onboarding-form">
          <span className="eyebrow">TAILORED SETUP</span>
          <h2>{title}</h2>
          <p className="onboarding-lead">
            {step === 0
              ? "Your sign-up details stay connected to the plan we create for you."
              : step === 1
                ? "These inputs help establish a sensible starting point. They are not medical advice."
                : step === 2
                  ? "Your daily exercises will only use the training options you select."
                  : step === 3
                    ? "Tell us what you have done before and movements you want to avoid."
                    : "Review the plan created from your answers before starting."}
          </p>
          {step === 0 && (
            <button className="try-demo-button" onClick={startDemo}>
              Try the full demo <ArrowRight size={15} />
            </button>
          )}
          {step === 0 && (
            <div className="onboarding-fields">
              <label>
                Full name
                <input
                  value={draft.name}
                  onChange={(event) => setValue("name", event.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={draft.email}
                  onChange={(event) => setValue("email", event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={draft.password}
                  onChange={(event) => setValue("password", event.target.value)}
                  placeholder="Create a password"
                  autoComplete="new-password"
                />
              </label>
            </div>
          )}
          {step === 1 && (
            <div className="onboarding-fields two">
              <label>
                Age
                <input
                  inputMode="numeric"
                  value={draft.age}
                  onChange={(event) => setValue("age", event.target.value)}
                  placeholder="e.g. 28"
                />
              </label>
              <label>
                Biological sex
                <select
                  value={draft.sex}
                  onChange={(event) => setValue("sex", event.target.value)}
                >
                  <option>Prefer not to say</option>
                  <option>Female</option>
                  <option>Male</option>
                </select>
              </label>
              <label>
                Height (cm)
                <input
                  inputMode="decimal"
                  value={draft.height}
                  onChange={(event) => setValue("height", event.target.value)}
                  placeholder="e.g. 175"
                />
              </label>
              <label>
                Current weight (kg)
                <input
                  inputMode="decimal"
                  value={draft.weight}
                  onChange={(event) => setValue("weight", event.target.value)}
                  placeholder="e.g. 82"
                />
              </label>
              <label>
                Target weight (kg)
                <input
                  inputMode="decimal"
                  value={draft.targetWeight}
                  onChange={(event) =>
                    setValue("targetWeight", event.target.value)
                  }
                  placeholder="e.g. 76"
                />
              </label>
              <div className="goal-choice">
                <span>Primary goal</span>
                <div>
                  {allGoals.map((goal) => (
                    <button
                      key={goal}
                      className={draft.goal === goal ? "selected" : ""}
                      onClick={() => setValue("goal", goal)}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="onboarding-fields">
              <div className="goal-choice">
                <span>Training experience</span>
                <div>
                  {(
                    ["Beginner", "Intermediate", "Advanced"] as ExerciseLevel[]
                  ).map((level) => (
                    <button
                      key={level}
                      className={draft.experience === level ? "selected" : ""}
                      onClick={() => setValue("experience", level)}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <div className="goal-choice">
                <span>Days you can train each week</span>
                <div>
                  {[2, 3, 4, 5, 6].map((days) => (
                    <button
                      key={days}
                      className={draft.days === days ? "selected" : ""}
                      onClick={() => setValue("days", days)}
                    >
                      {days} days
                    </button>
                  ))}
                </div>
              </div>
              <div className="goal-choice">
                <span>Preferred session duration</span>
                <div>
                  {[30, 45, 60, 75].map((duration) => (
                    <button
                      key={duration}
                      className={draft.duration === duration ? "selected" : ""}
                      onClick={() => setValue("duration", duration)}
                    >
                      {duration} min
                    </button>
                  ))}
                </div>
              </div>
              <div className="equipment-choice">
                <span>Equipment you can use</span>
                <div>
                  {equipmentChoices.map((equipment) => (
                    <button
                      key={equipment}
                      className={
                        draft.equipment.includes(equipment) ? "selected" : ""
                      }
                      onClick={() =>
                        setValue(
                          "equipment",
                          draft.equipment.includes(equipment)
                            ? draft.equipment.filter(
                                (item) => item !== equipment,
                              )
                            : [...draft.equipment, equipment],
                        )
                      }
                    >
                      <Check size={14} /> {equipment}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="onboarding-fields">
              <label>
                Training background
                <select
                  value={draft.trainingHistory}
                  onChange={(event) =>
                    setValue("trainingHistory", event.target.value)
                  }
                >
                  <option>New to structured training</option>
                  <option>Returning after a break</option>
                  <option>Training consistently for 6–12 months</option>
                  <option>Training consistently for 1+ years</option>
                </select>
              </label>
              <label>
                Movements to avoid or limitations
                <textarea
                  value={draft.limitations}
                  onChange={(event) =>
                    setValue("limitations", event.target.value)
                  }
                  placeholder="Example: Avoid deep squats, no overhead pressing, or none shared"
                />
              </label>
              <div className="history-note">
                <CircleHelp size={18} />
                <p>
                  This helps the demo deprioritize movements; it does not
                  diagnose injuries or replace professional advice.
                </p>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="plan-ready">
              <div className="plan-ready-top">
                <div>
                  <span className="eyebrow">
                    GENERATED FOR {draft.name || "YOU"}
                  </span>
                  <h3>{preview.title}</h3>
                  <p>{preview.focus}</p>
                </div>
                <Ring
                  value={82}
                  label={`${preview.exercises.length}`}
                  sublabel="EXERCISES"
                />
              </div>
              <div className="plan-ready-list">
                {preview.exercises.map((exercise, index) => (
                  <div key={exercise}>
                    <span>0{index + 1}</span>
                    <b>{exercise}</b>
                    <small>{preview.prescription}</small>
                  </div>
                ))}
              </div>
              <div className="plan-ready-meta">
                <span>
                  <Clock3 size={15} /> {preview.minutes}
                </span>
                <span>
                  <Dumbbell size={15} /> {preview.sets}
                </span>
                <span>
                  <Target size={15} /> {draft.goal}
                </span>
              </div>
              <p className="plan-ready-copy">{preview.message}</p>
            </div>
          )}
          <div className="onboarding-actions">
            <button
              className="back-step"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
            >
              <ChevronLeft size={17} /> Back
            </button>
            {step < 4 ? (
              <button
                className="primary-button"
                onClick={() => setStep(step + 1)}
                disabled={!canContinue}
              >
                Continue <ArrowRight size={17} />
              </button>
            ) : (
              <button className="primary-button" onClick={finishSignup}>
                Create my plan <Sparkles size={17} />
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function App() {
  const [customer, setCustomer] = useState<CustomerProfile | null>(() =>
    loadCustomerProfile(),
  );
  const [page, setPage] = useState<Page>("Home");
  const [workoutOpen, setWorkoutOpen] = useState(false);
  const [warmupComplete, setWarmupComplete] = useState(false);
  const [setsByExercise, setSetsByExercise] = useState<
    Record<string, WorkoutSet[]>
  >({});
  const [customExercises, setCustomExercises] = useState<string[]>([]);
  const [exerciseReplacements, setExerciseReplacements] = useState<
    Record<string, string>
  >({});
  const [selectedScheduleDayId, setSelectedScheduleDayId] = useState<
    string | null
  >(null);
  const [water, setWater] = useState(() => loadLocalAppState().water);
  const [nutrition, setNutrition] = useState<NutritionLog>(
    () => loadLocalAppState().nutrition,
  );
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>(
    () => loadLocalAppState().foodEntries,
  );
  const [measurements, setMeasurements] = useState<BodyMeasurements>(
    () => loadLocalAppState().measurements,
  );
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>(
    () => loadLocalAppState().progressPhotos,
  );
  const [reminders, setReminders] = useState<ReminderSettings>(
    () => loadLocalAppState().reminders,
  );
  const [readinessCheck, setReadinessCheck] = useState<ReadinessCheck | null>(
    () => loadLocalAppState().readiness,
  );
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>(
    () => loadLocalAppState().workoutLogs,
  );
  const [requestedActiveExercise, setActiveExercise] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );
  const [timer, setTimer] = useState(117);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [trainingGoal, setTrainingGoal] = useState<TrainingGoal>(
    () => customer?.goal ?? "Build muscle",
  );

  useEffect(() => {
    if (customer) saveCustomerProfile(customer);
  }, [customer]);

  useEffect(() => {
    window.localStorage.setItem(
      "repwise-local-app-state",
      JSON.stringify({
        water,
        workoutLogs,
        nutrition,
        readiness: readinessCheck,
        foodEntries,
        measurements,
        progressPhotos,
        reminders,
      } satisfies LocalAppState),
    );
  }, [
    water,
    workoutLogs,
    nutrition,
    readinessCheck,
    foodEntries,
    measurements,
    progressPhotos,
    reminders,
  ]);

  useEffect(() => {
    if (!isTimerRunning || timer <= 0) return;
    const tick = window.setInterval(() => setTimer((time) => time - 1), 1000);
    return () => window.clearInterval(tick);
  }, [isTimerRunning, timer]);

  useEffect(() => {
    if (!toast) return;
    const dismiss = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(dismiss);
  }, [toast]);

  const timerLabel = `${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, "0")}`;
  const weeklyPlan = useMemo(
    () =>
      customer ? createWeeklyPlan(customer, workoutLogs.length) : null,
    [customer, workoutLogs.length],
  );
  const dailyPlan = useMemo(() => {
    if (!customer) return null;
    const selectedPlan = weeklyPlan?.days.find(
      (day) => day.id === selectedScheduleDayId && day.kind === "Workout",
    )?.plan;
    const currentPlan = weeklyPlan?.days.find(
      (day) => day.id === weeklyPlan.currentPlanId,
    )?.plan;
    return selectedPlan ?? currentPlan ?? createDailyPlan(customer);
  }, [customer, selectedScheduleDayId, weeklyPlan]);
  const nutritionTargets = useMemo(
    () => (customer ? calculateNutritionTargets(customer) : null),
    [customer],
  );
  const workoutExercises = useMemo(() => {
    if (!dailyPlan) return [];
    const base = [
      ...dailyPlan.exercises,
      ...customExercises.filter(
        (exercise) => !dailyPlan.exercises.includes(exercise),
      ),
    ];
    return base.map((exercise) => exerciseReplacements[exercise] ?? exercise);
  }, [customExercises, dailyPlan, exerciseReplacements]);
  // The workout workspace must never render a remembered exercise from an
  // earlier plan. If a goal, profile, equipment choice, or replacement changes
  // the plan, fall back to the first exercise that is actually scheduled.
  const activeExercise = workoutExercises.includes(requestedActiveExercise)
    ? requestedActiveExercise
    : (workoutExercises[0] ?? "");

  const activeSets = setsByExercise[activeExercise] ?? createStarterSets();
  const completedSets = activeSets.filter((set) => set.done).length;
  const exerciseProgress = useMemo(
    () =>
      Object.fromEntries(
        workoutExercises.map((exercise) => {
          const exerciseSets = setsByExercise[exercise] ?? [];
          return [
            exercise,
            {
              completed: exerciseSets.filter((set) => set.done).length,
              total: exerciseSets.length,
            },
          ];
        }),
      ) as Record<string, { completed: number; total: number }>,
    [setsByExercise, workoutExercises],
  );

  const updateSet = (
    id: number,
    field: keyof Omit<WorkoutSet, "id" | "done">,
    value: string,
  ) => {
    setSetsByExercise((current) => {
      const currentSets = current[activeExercise] ?? createStarterSets();
      return {
        ...current,
        [activeExercise]: currentSets.map((set) =>
          set.id === id ? { ...set, [field]: value } : set,
        ),
      };
    });
  };

  const finishSet = (id: number) => {
    const setWasDone = activeSets.find((set) => set.id === id)?.done;
    const completesExercise =
      !setWasDone &&
      activeSets.length > 0 &&
      activeSets.every((set) => set.done || set.id === id);
    setSetsByExercise((current) => {
      const currentSets = current[activeExercise] ?? createStarterSets();
      return {
        ...current,
        [activeExercise]: currentSets.map((set) =>
          set.id === id ? { ...set, done: !set.done } : set,
        ),
      };
    });
    if (!setWasDone) {
      setTimer(120);
      setIsTimerRunning(true);

      if (completesExercise) {
        const activeIndex = workoutExercises.indexOf(activeExercise);
        const nextExercise = workoutExercises
          .slice(activeIndex + 1)
          .find((exercise) => {
            const exerciseSets = setsByExercise[exercise] ?? [];
            return (
              exerciseSets.length === 0 ||
              exerciseSets.some((set) => !set.done)
            );
          });

        if (nextExercise) {
          setToast(`${activeExercise} done. Next: ${nextExercise}.`);
          window.setTimeout(() => {
            setActiveExercise((current) =>
              current === activeExercise ? nextExercise : current,
            );
          }, 650);
        } else {
          setToast("Workout complete — every exercise is done.");
        }
      }
    }
  };

  const addSet = (kind: SetKind = "Working") => {
    setSetsByExercise((current) => {
      const currentSets = current[activeExercise] ?? createStarterSets();
      const lastSet =
        currentSets[currentSets.length - 1] ?? createStarterSets()[0];
      return {
        ...current,
        [activeExercise]: [
          ...currentSets,
          {
            id: Math.max(0, ...currentSets.map((set) => set.id)) + 1,
            weight: kind === "Warm-up" ? "" : lastSet.weight,
            reps: kind === "Warm-up" ? "10" : lastSet.reps,
            rir: kind === "Warm-up" ? "4" : lastSet.rir,
            kind,
            rpe: kind === "Warm-up" ? "6" : lastSet.rpe,
            done: false,
          },
        ],
      };
    });
    setToast(`${kind} added to ${activeExercise}.`);
  };

  const removeSet = (id: number) => {
    if (activeSets.length <= 1) {
      setToast("Keep at least one set in this exercise.");
      return;
    }
    setSetsByExercise((current) => {
      const currentSets = current[activeExercise] ?? createStarterSets();
      return {
        ...current,
        [activeExercise]: currentSets.filter((set) => set.id !== id),
      };
    });
    setToast(`Set removed from ${activeExercise}.`);
  };

  const startWorkout = () => {
    if (!workoutExercises.length) {
      setToast("Your plan is still being prepared. Please try again in a moment.");
      return;
    }
    setActiveExercise((current) =>
      workoutExercises.includes(current) ? current : workoutExercises[0],
    );
    setWarmupComplete(false);
    setPage("Workout");
    setWorkoutOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectScheduleDay = (day: ScheduleDay) => {
    if (day.kind === "Recovery" || !day.plan) {
      setToast("Recovery day selected: take an easy walk, do mobility, and return for your next planned workout.");
      return;
    }
    setSelectedScheduleDayId(day.id);
    setCustomExercises([]);
    setExerciseReplacements({});
    setSetsByExercise({});
    setActiveExercise("");
    setWarmupComplete(false);
    setToast(`${day.label}: ${day.title} selected.`);
  };

  const addExerciseToWorkout = (exercise: string) => {
    const exerciseDetails = exerciseData.find((item) => item.name === exercise);
    if (
      !exerciseDetails ||
      !isExerciseAvailable(exerciseDetails, customer?.equipment ?? [])
    ) {
      setToast("That movement needs equipment that is not in your available equipment list.");
      return;
    }
    setCustomExercises((current) =>
      dailyPlan?.exercises.includes(exercise) || current.includes(exercise)
        ? current
        : [...current, exercise],
    );
    setActiveExercise(exercise);
    setWarmupComplete(false);
    setPage("Workout");
    setWorkoutOpen(true);
    setToast(`${exercise} added to today's workout.`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const replaceWorkoutExercise = (
    currentExercise: string,
    replacement: string,
  ) => {
    const replacementDetails = exerciseData.find(
      (exercise) => exercise.name === replacement,
    );
    if (
      !workoutExercises.includes(currentExercise) ||
      !replacementDetails ||
      !isExerciseAvailable(replacementDetails, customer?.equipment ?? [])
    ) {
      setToast("Choose an available alternative from today’s workout options.");
      return;
    }
    setExerciseReplacements((current) => ({
      ...current,
      [currentExercise]: replacement,
    }));
    setActiveExercise(replacement);
    setToast(`${currentExercise} replaced with ${replacement}.`);
  };

  const completeSignup = (profile: CustomerProfile) => {
    saveCustomerProfile(profile);
    setCustomer(profile);
    setTrainingGoal(profile.goal);
    setWater(0);
    setNutrition({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    setFoodEntries([]);
    setMeasurements({
      bodyFat: "",
      waist: "",
      chest: "",
      shoulders: "",
      arms: "",
      thigh: "",
    });
    setProgressPhotos([]);
    setReminders({
      enabled: false,
      time: "18:30",
      days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    });
    setReadinessCheck(null);
    setWorkoutLogs([]);
    setSetsByExercise({});
    setCustomExercises([]);
    setExerciseReplacements({});
    setSelectedScheduleDayId(null);
    setActiveExercise("");
    setToast(
      `Welcome, ${profile.name.split(" ")[0]}. Your first daily plan is ready.`,
    );
  };

  const changeGoal = (goal: TrainingGoal) => {
    setTrainingGoal(goal);
    setSelectedScheduleDayId(null);
    setCustomExercises([]);
    setExerciseReplacements({});
    setSetsByExercise({});
    setActiveExercise("");
    setCustomer((current) => (current ? { ...current, goal } : current));
  };

  const saveCheckIn = (weight: string, cadence: "Weekly" | "Monthly") => {
    setCustomer((current) =>
      current
        ? {
            ...current,
            weight,
            checkIns: [
              ...(current.checkIns ?? []),
              { weight, cadence, date: new Date().toISOString() },
            ],
          }
        : current,
    );
    setToast(
      `${cadence} check-in saved. Your targets and workout plan are updated.`,
    );
  };

  const addFoodEntry = (entry: FoodEntryInput) => {
    const add = {
      calories: Math.max(0, Math.round(Number(entry.calories) || 0)),
      protein: Math.max(0, Math.round(Number(entry.protein) || 0)),
      carbs: Math.max(0, Math.round(Number(entry.carbs) || 0)),
      fat: Math.max(0, Math.round(Number(entry.fat) || 0)),
    };
    const foodEntry: FoodEntry = {
      ...entry,
      ...add,
      id: `MEAL-${Date.now()}`,
      date: new Date().toISOString(),
    };
    setFoodEntries((current) => [foodEntry, ...current].slice(0, 100));
    setNutrition((current) => ({
      calories: current.calories + add.calories,
      protein: current.protein + add.protein,
      carbs: current.carbs + add.carbs,
      fat: current.fat + add.fat,
    }));
    setToast(`${entry.name} logged to ${entry.meal.toLowerCase()}.`);
  };

  const removeFoodEntry = (entry: FoodEntry) => {
    setFoodEntries((current) => current.filter((item) => item.id !== entry.id));
    setNutrition((current) => ({
      calories: Math.max(0, current.calories - entry.calories),
      protein: Math.max(0, current.protein - entry.protein),
      carbs: Math.max(0, current.carbs - entry.carbs),
      fat: Math.max(0, current.fat - entry.fat),
    }));
    setToast(`${entry.name} removed from today.`);
  };

  const logQuickMeal = (meal: "balanced" | "protein") => {
    addFoodEntry(
      meal === "protein"
        ? {
            name: "Protein recovery meal",
            meal: "Snack",
            calories: 260,
            protein: 35,
            carbs: 18,
            fat: 7,
          }
        : {
            name: "Balanced training meal",
            meal: "Lunch",
            calories: 460,
            protein: 32,
            carbs: 55,
            fat: 13,
          },
    );
  };

  const saveReminders = async (settings: ReminderSettings) => {
    const reminderIds = [901, 902, 903, 904, 905, 906, 907];
    try {
      if (!settings.enabled || !settings.days.length) {
        await LocalNotifications.cancel({
          notifications: reminderIds.map((id) => ({ id })),
        });
        setReminders({ ...settings, enabled: false });
        setToast("Workout reminders are turned off.");
        return;
      }
      const currentPermission = await LocalNotifications.checkPermissions();
      const permission =
        currentPermission.display === "granted"
          ? currentPermission
          : await LocalNotifications.requestPermissions();
      if (permission.display !== "granted") {
        setToast(
          "Reminder plan was not changed. Allow notifications, then save again.",
        );
        return;
      }
      if (Capacitor.getPlatform() === "android") {
        const exactPermission =
          await LocalNotifications.checkExactNotificationSetting();
        if (exactPermission.exact_alarm !== "granted") {
          await LocalNotifications.changeExactNotificationSetting();
          const updatedExactPermission =
            await LocalNotifications.checkExactNotificationSetting();
          if (updatedExactPermission.exact_alarm !== "granted") {
            setToast(
              "Reminder plan was not changed. Turn on Alarms & reminders, then save again.",
            );
            return;
          }
        }
      }
      await LocalNotifications.cancel({
        notifications: reminderIds.map((id) => ({ id })),
      });
      const [hourText, minuteText] = settings.time.split(":");
      const weekdayByLabel: Record<string, Weekday> = {
        Sun: Weekday.Sunday,
        Mon: Weekday.Monday,
        Tue: Weekday.Tuesday,
        Wed: Weekday.Wednesday,
        Thu: Weekday.Thursday,
        Fri: Weekday.Friday,
        Sat: Weekday.Saturday,
      };
      const scheduleResult = await LocalNotifications.schedule({
        notifications: settings.days.map((day, index) => ({
          id: reminderIds[index],
          title: "Pro Fitness workout reminder",
          body: "Your planned session is ready when you are.",
          schedule: {
            on: {
              weekday: weekdayByLabel[day],
              hour: Number(hourText),
              minute: Number(minuteText),
            },
            repeats: true,
            allowWhileIdle: true,
          },
          isExactNotification: true,
          isExactMandatory: true,
        })),
      });
      setReminders(settings);
      setToast(
        scheduleResult.warning
          ? `Reminder plan saved for ${settings.time}; Android may delay it.`
          : `Workout reminders scheduled for ${settings.time}.`,
      );
    } catch {
      setToast(
        "Reminder plan was not changed. Allow notifications and Alarms & reminders, then save again.",
      );
    }
  };

  const addProgressPhoto = (pose: ProgressPhoto["pose"], dataUrl: string) => {
    setProgressPhotos((current) =>
      [
        {
          id: `PHOTO-${Date.now()}`,
          pose,
          dataUrl,
          createdAt: new Date().toISOString(),
        },
        ...current,
      ].slice(0, 12),
    );
    setToast(`${pose} progress photo saved privately on this device.`);
  };

  const removeProgressPhoto = (id: string) => {
    setProgressPhotos((current) => current.filter((photo) => photo.id !== id));
    setToast("Progress photo removed.");
  };

  const exportPersonalData = () => {
    if (!customer) return;
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      profile: customer,
      tracking: {
        nutrition,
        foodEntries,
        measurements,
        progressPhotos,
        reminders,
        readiness: readinessCheck,
        workoutLogs,
      },
    };
    const file = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = `pro-fitness-data-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    setToast("Your Pro Fitness data export is ready.");
  };

  const deletePersonalData = () => {
    if (
      !window.confirm(
        "Delete this local Pro Fitness profile and all tracking data from this device?",
      )
    )
      return;
    window.localStorage.removeItem(customerProfileStorageKey);
    window.localStorage.removeItem(legacyCustomerProfileStorageKey);
    window.localStorage.removeItem("repwise-local-app-state");
    window.location.reload();
  };

  const saveReadiness = (check: Omit<ReadinessCheck, "updatedAt">) => {
    setReadinessCheck({ ...check, updatedAt: new Date().toISOString() });
    setToast("Readiness check-in saved. Today’s guidance is updated.");
  };

  const saveCompletedWorkout = () => {
    const sessionSets = workoutExercises.flatMap(
      (exercise) => setsByExercise[exercise] ?? [],
    );
    const completed = sessionSets.filter((set) => set.done);
    const volume = completed.reduce(
      (total, set) =>
        total + (Number(set.weight) || 0) * (Number(set.reps) || 0),
      0,
    );
    const workout: WorkoutLog = {
      id: `WL-${Date.now()}`,
      date: new Date().toISOString(),
      title: dailyPlan?.title ?? "Workout",
      exercises: workoutExercises,
      completedSets: completed.length,
      totalSets: sessionSets.length,
      volume,
      duration: dailyPlan?.minutes ?? "0 min",
    };
    setWorkoutLogs((current) => [workout, ...current].slice(0, 50));
    setCustomExercises([]);
    setExerciseReplacements({});
    setSetsByExercise({});
    setSelectedScheduleDayId(null);
    setActiveExercise(workoutExercises[0] ?? "");
    setWarmupComplete(false);
    setWorkoutOpen(false);
    setToast(
      `Workout saved: ${completed.length}/${sessionSets.length} sets and ${Math.round(volume).toLocaleString()} kg volume.`,
    );
  };

  if (!customer || !dailyPlan || !nutritionTargets)
    return <SignupOnboarding onComplete={completeSignup} />;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <LogoMark />
          <span>
            pro <span>fitness</span>
          </span>
        </div>
        <div className="workspace-label">YOUR SPACE</div>
        <nav className="primary-nav">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`nav-item ${page === item.label ? "active" : ""}`}
                onClick={() => {
                  if (item.label === "Workout") {
                    startWorkout();
                    return;
                  }
                  setWorkoutOpen(false);
                  setPage(item.label);
                }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
                {item.label === "Workout" && <i>3</i>}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-promo">
          <div className="promo-orbit">
            <Sparkles size={18} />
          </div>
          <strong>Make every rep count.</strong>
          <p>Your adaptive plan updates after every workout.</p>
          <button onClick={() => setPage("Progress")}>
            See how it works <ArrowRight size={14} />
          </button>
        </div>
        <div className="sidebar-bottom">
          <button
            className="settings-link"
            onClick={() => setToast("Settings are ready for your preferences.")}
          >
            <Settings2 size={18} /> Settings
          </button>
          <div className="mini-user">
            <div className="avatar avatar-small">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <strong>{customer.name}</strong>
              <span>{customer.experience}</span>
            </div>
            <MoreHorizontal size={18} />
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="mobile-brand">
            <LogoMark />
            <b><span>pro</span> fitness</b>
          </div>
          <div className="date-label">
            <CalendarDays size={17} /> Wednesday, August 20
          </div>
          <div className="topbar-actions">
            <button
              className="icon-button"
              onClick={() => setToast("You are all caught up!")}
              aria-label="Notifications"
            >
              <Bell size={20} />
              <em />
            </button>
            <button className="avatar" onClick={() => setPage("Profile")}>
              {customer.name.charAt(0).toUpperCase()}
            </button>
          </div>
        </header>

        {page === "Home" && (
          <HomePage
            startWorkout={startWorkout}
            water={water}
            setWater={setWater}
            setPage={setPage}
            trainingGoal={trainingGoal}
            customer={customer}
            dailyPlan={dailyPlan}
            workoutLogs={workoutLogs}
            nutrition={nutrition}
            nutritionTargets={nutritionTargets}
            readinessCheck={readinessCheck}
            onSaveReadiness={saveReadiness}
            onLogMeal={logQuickMeal}
          />
        )}
        {page === "Workout" && (
          <WorkoutPage
            workoutOpen={workoutOpen}
            setWorkoutOpen={setWorkoutOpen}
            activeExercise={activeExercise}
            setActiveExercise={setActiveExercise}
            sets={activeSets}
            completedSets={completedSets}
            exerciseProgress={exerciseProgress}
            updateSet={updateSet}
            finishSet={finishSet}
            addSet={addSet}
            removeSet={removeSet}
            onReplaceExercise={replaceWorkoutExercise}
            timerLabel={timerLabel}
            isTimerRunning={isTimerRunning}
            setIsTimerRunning={setIsTimerRunning}
            setTimer={setTimer}
            setToast={setToast}
            trainingGoal={trainingGoal}
            workoutExercises={workoutExercises}
            workoutLogs={workoutLogs}
            weeklyPlan={weeklyPlan}
            selectedScheduleDayId={selectedScheduleDayId}
            onSelectScheduleDay={selectScheduleDay}
            planTitle={dailyPlan.title}
            planFocus={dailyPlan.focus}
            planMinutes={dailyPlan.minutes}
            coachSex={customer.sex}
            equipment={customer.equipment}
            warmupComplete={warmupComplete}
            onCompleteWarmup={() => setWarmupComplete(true)}
            onStartWorkout={startWorkout}
            onFinish={saveCompletedWorkout}
          />
        )}
        {page === "Explore" && (
          <ExplorePage
            search={search}
            setSearch={setSearch}
            exercises={exerciseData}
            onAddExercise={addExerciseToWorkout}
            onPreviewExercise={setSelectedExercise}
            trainingGoal={trainingGoal}
            coachSex={customer.sex}
          />
        )}
        {page === "Progress" && (
          <FunctionalProgressPage
            customer={customer}
            workoutLogs={workoutLogs}
            nutrition={nutritionTargets}
            nutritionLog={nutrition}
          />
        )}
        {page === "Nutrition" && (
          <NutritionPage
            nutrition={nutrition}
            targets={nutritionTargets}
            water={water}
            foodEntries={foodEntries}
            onAddWater={() =>
              setWater(Math.min(3, Number((water + 0.25).toFixed(2))))
            }
            onLogMeal={logQuickMeal}
            onAddFood={addFoodEntry}
            onRemoveFood={removeFoodEntry}
          />
        )}
        {page === "Profile" && (
          <ProfileGoalPage
            setToast={setToast}
            trainingGoal={trainingGoal}
            setTrainingGoal={changeGoal}
            customer={customer}
            dailyPlan={dailyPlan}
            nutrition={nutritionTargets}
            onSaveCheckIn={saveCheckIn}
            workoutLogs={workoutLogs}
            measurements={measurements}
            onSaveMeasurements={setMeasurements}
            progressPhotos={progressPhotos}
            onAddProgressPhoto={addProgressPhoto}
            onRemoveProgressPhoto={removeProgressPhoto}
            reminders={reminders}
            onSaveReminders={saveReminders}
            onExportData={exportPersonalData}
            onDeleteData={deletePersonalData}
          />
        )}
      </main>

      <ExerciseDemoLauncher
        selectedExercise={selectedExercise}
        onClose={() => setSelectedExercise(null)}
        onAddExercise={addExerciseToWorkout}
        coachSex={customer.sex}
      />
      <nav className="mobile-nav">
        {mobileNav.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className={page === item.label ? "active" : ""}
              onClick={() => {
                if (item.label === "Workout") {
                  startWorkout();
                  return;
                }
                setWorkoutOpen(false);
                setPage(item.label);
              }}
            >
              <span className="mobile-nav-icon">
                <Icon size={18} />
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      {toast && (
        <div className="toast">
          <Check size={17} /> {toast}
        </div>
      )}
    </div>
  );
}

function LegacyHomePage({
  startWorkout,
  water,
  setWater,
  setPage,
  trainingGoal,
  customer,
  dailyPlan,
  workoutLogs,
}: {
  startWorkout: () => void;
  water: number;
  setWater: (value: number) => void;
  setPage: (page: Page) => void;
  trainingGoal: TrainingGoal;
  customer: CustomerProfile;
  dailyPlan: DailyPlan;
  workoutLogs: WorkoutLog[];
}) {
  const goalPlan = dailyPlan;
  const weekAgo = APP_NOW - 7 * 24 * 60 * 60 * 1000;
  const weeklyWorkouts = workoutLogs.filter(
    (workout) => new Date(workout.date).getTime() >= weekAgo,
  ).length;
  const recentWorkout = workoutLogs[0];
  return (
    <div className="page page-home">
      <section className="welcome-row">
        <div>
          <span className="eyebrow">
            <span className="live-dot" /> {trainingGoal.toUpperCase()} PLAN
          </span>
          <h1>
            Good morning, {customer.name.split(" ")[0]}
            <span className="lime-dot">.</span>
          </h1>
          <p>Your body is ready for {goalPlan.title.toLowerCase()}.</p>
        </div>
        <div className="readiness-card">
          <Ring value={82} label="82" sublabel="READY" />
          <div>
            <span className="eyebrow">DAILY READINESS</span>
            <strong>Looking sharp</strong>
            <p>Up 6% from yesterday</p>
          </div>
          <button aria-label="Readiness details">
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      <section className="today-workout">
        <div className="workout-visual">
          <div className="grid-glow" />
          <div className="workout-glyph">
            <Dumbbell size={52} strokeWidth={1.35} />
          </div>
          <span className="visual-line line-one" />
          <span className="visual-line line-two" />
          <span className="visual-ring" />
        </div>
        <div className="today-copy">
          <span className="eyebrow">TODAY'S WORKOUT</span>
          <h2>
            {goalPlan.title.split(" ")[0]}{" "}
            <span>{goalPlan.title.split(" ").slice(1).join(" ")}</span>
          </h2>
          <p>
            {goalPlan.focus.split(" • ")[0]} <b>•</b>{" "}
            {goalPlan.focus.split(" • ")[1]} <b>•</b>{" "}
            {goalPlan.focus.split(" • ")[2]}
          </p>
          <div className="workout-meta">
            <span>
              <Clock3 size={16} /> {goalPlan.minutes}
            </span>
            <span>
              <Dumbbell size={16} /> {goalPlan.exercisesLabel}
            </span>
            <span>
              <Flame size={16} /> {goalPlan.sets}
            </span>
          </div>
        </div>
        <div className="workout-actions">
          <button className="text-button" onClick={() => setPage("Workout")}>
            View plan <ArrowRight size={16} />
          </button>
          <button className="primary-button" onClick={startWorkout}>
            <Play size={18} fill="currentColor" /> Start workout
          </button>
        </div>
      </section>

      <section className="live-plan-status">
        <div>
          <span className="eyebrow">LIVE PLAN STATUS</span>
          <h3>
            {weeklyWorkouts} <span>/ {customer.days}</span> workouts this week
          </h3>
          <p>
            {recentWorkout
              ? `Last workout: ${recentWorkout.title} · ${recentWorkout.completedSets}/${recentWorkout.totalSets} sets logged`
              : "No sessions logged yet — finish today’s workout to begin your history."}
          </p>
        </div>
        <div className="live-exercise-list">
          {dailyPlan.exercises.slice(0, 3).map((exercise, index) => (
            <span key={exercise}>
              <i>0{index + 1}</i>
              {exercise}
            </span>
          ))}
          <button onClick={() => setPage("Workout")}>
            View full plan <ArrowRight size={14} />
          </button>
        </div>
      </section>
      <section className="dashboard-grid">
        <div className="card weekly-card">
          <div className="card-heading">
            <div>
              <span className="eyebrow">WEEKLY PROGRESS</span>
              <h3>
                3 <span>/ 5</span> workouts
              </h3>
            </div>
            <button
              className="circle-arrow"
              onClick={() => setPage("Progress")}
            >
              <ArrowRight size={17} />
            </button>
          </div>
          <div className="week-track">
            <div className="day done">
              <b>M</b>
              <i>
                <Check size={13} />
              </i>
            </div>
            <div className="day done">
              <b>T</b>
              <i>
                <Check size={13} />
              </i>
            </div>
            <div className="day today">
              <b>W</b>
              <i>
                <Dumbbell size={13} />
              </i>
            </div>
            <div className="day">
              <b>T</b>
              <i />
            </div>
            <div className="day">
              <b>F</b>
              <i />
            </div>
            <div className="day rest">
              <b>S</b>
              <i>—</i>
            </div>
            <div className="day rest">
              <b>S</b>
              <i>—</i>
            </div>
          </div>
          <div className="progress-caption">
            <span>
              You're on a 4-week streak <Flame size={15} fill="currentColor" />
            </span>
            <b>60%</b>
          </div>
        </div>
        <div className="card nutrition-card">
          <div className="card-heading">
            <div>
              <span className="eyebrow">TODAY'S FUEL</span>
              <h3>
                Nutrition <span>on track</span>
              </h3>
            </div>
            <button
              className="circle-arrow"
              onClick={() => setPage("Progress")}
            >
              <ArrowRight size={17} />
            </button>
          </div>
          <div className="macro-summary">
            <div className="calorie-ring">
              <Ring
                value={76}
                size={106}
                stroke={9}
                label="1,820"
                sublabel="/ 2,350 KCAL"
              />
            </div>
            <div className="macro-list">
              <Macro
                name="Protein"
                current="118"
                total="160g"
                value={74}
                tone="lime"
              />
              <Macro
                name="Carbs"
                current="180"
                total="260g"
                value={69}
                tone="purple"
              />
              <Macro
                name="Fat"
                current="52"
                total="70g"
                value={74}
                tone="orange"
              />
            </div>
          </div>
        </div>
        <div className="card recovery-card">
          <div className="card-heading">
            <div>
              <span className="eyebrow">MUSCLE RECOVERY</span>
              <h3>
                Ready to <span>train</span>
              </h3>
            </div>
            <button className="circle-arrow" onClick={() => setPage("Explore")}>
              <ArrowRight size={17} />
            </button>
          </div>
          <div className="recovery-preview">
            <BodyFigure />
            <div className="recovery-muscles">
              {recovery.slice(0, 3).map((item) => (
                <div className="recovery-line" key={item.name}>
                  <span className={`status-dot ${item.tone}`} />
                  <div>
                    <b>{item.name}</b>
                    <small>{item.detail}</small>
                  </div>
                  <strong>{item.percent}%</strong>
                </div>
              ))}
            </div>
          </div>
          <button className="body-map-link" onClick={() => setPage("Explore")}>
            View recovery map <ArrowRight size={15} />
          </button>
        </div>
        <div className="card quick-card">
          <div className="quick-top">
            <div>
              <span className="eyebrow">DAILY TARGETS</span>
              <h3>
                Small wins <span>matter.</span>
              </h3>
            </div>
            <Target size={22} />
          </div>
          <div className="target-row">
            <div className="target-icon steps">
              <Footprints size={19} />
            </div>
            <div>
              <b>Steps</b>
              <span>7,842 / 10,000</span>
            </div>
            <div className="mini-progress">
              <i style={{ width: "78%" }} />
            </div>
            <strong>78%</strong>
          </div>
          <div className="target-row">
            <div className="target-icon water">
              <Activity size={19} />
            </div>
            <div>
              <b>Hydration</b>
              <span>{water.toFixed(1)} / 2.5 L</span>
            </div>
            <div className="mini-progress blue">
              <i style={{ width: `${(water / 2.5) * 100}%` }} />
            </div>
            <button
              className="add-water"
              onClick={() =>
                setWater(Math.min(2.5, Number((water + 0.25).toFixed(2))))
              }
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </section>

      <section className="lower-grid">
        <div className="card volume-card">
          <div className="card-heading">
            <div>
              <span className="eyebrow">WEEKLY VOLUME</span>
              <h3>Keep the balance.</h3>
            </div>
            <button
              className="text-button small"
              onClick={() => setPage("Progress")}
            >
              Details <ArrowRight size={14} />
            </button>
          </div>
          <div className="volume-list">
            <Volume
              label="Back"
              amount="8 / 14"
              width={57}
              color="var(--lime)"
            />
            <Volume
              label="Chest"
              amount="12 / 12"
              width={100}
              color="#d83838"
            />
            <Volume
              label="Side delts"
              amount="5 / 12"
              width={42}
              color="#f17272"
            />
            <Volume label="Quads" amount="10 / 12" width={83} color="#ff9797" />
          </div>
        </div>
        <div className="recommendation-card">
          <div className="recommendation-icon">
            <Sparkles size={21} />
          </div>
          <span className="eyebrow">YOUR COACH SAYS</span>
          <h3>
            {trainingGoal === "Lose weight" ? (
              <>
                Effort and <em>consistency</em> win today.
              </>
            ) : (
              <>
                Back is your <em>opportunity</em> today.
              </>
            )}
          </h3>
          <p>{goalPlan.message}</p>
          <button onClick={startWorkout}>
            Let’s do it <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
}

function HomePage({
  startWorkout,
  water,
  setWater,
  setPage,
  trainingGoal,
  customer,
  dailyPlan,
  workoutLogs,
  nutrition,
  nutritionTargets,
  readinessCheck,
  onSaveReadiness,
  onLogMeal,
}: {
  startWorkout: () => void;
  water: number;
  setWater: (value: number) => void;
  setPage: (page: Page) => void;
  trainingGoal: TrainingGoal;
  customer: CustomerProfile;
  dailyPlan: DailyPlan;
  workoutLogs: WorkoutLog[];
  nutrition: NutritionLog;
  nutritionTargets: NutritionTargets;
  readinessCheck: ReadinessCheck | null;
  onSaveReadiness: (check: Omit<ReadinessCheck, "updatedAt">) => void;
  onLogMeal: (meal: "balanced" | "protein") => void;
}) {
  const [readinessOpen, setReadinessOpen] = useState(false);
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleInsight | null>(
    null,
  );
  const [quickMinutes, setQuickMinutes] = useState(30);
  const [checkDraft, setCheckDraft] = useState({
    sleep: readinessCheck?.sleep ?? 3,
    energy: readinessCheck?.energy ?? 3,
    soreness: readinessCheck?.soreness ?? 3,
    stress: readinessCheck?.stress ?? 3,
  });
  const readiness = calculateReadiness(readinessCheck, workoutLogs);
  const muscles = deriveMuscleInsights(workoutLogs);
  const priority = muscles
    .slice()
    .sort(
      (a, b) =>
        a.sets / a.target - b.sets / b.target ||
        (b.recovery ?? 0) - (a.recovery ?? 0),
    )[0];
  const checkIns = customer.checkIns ?? [];
  const startingWeight = Number(checkIns[0]?.weight ?? customer.weight);
  const currentWeight = Number(customer.weight);
  const weeklyTrend =
    checkIns.length > 1
      ? (currentWeight - startingWeight) /
        Math.max(
          1,
          checkIns.length * (checkIns[0]?.cadence === "Monthly" ? 4 : 1),
        )
      : 0;
  const goalDirection =
    Number(customer.targetWeight) >= currentWeight ? "gain" : "loss";
  const tomorrowFocus =
    priority?.name === "Back"
      ? "Pull focus — Back + Biceps"
      : priority?.name === "Quads" || priority?.name === "Hamstrings"
        ? "Lower focus — Quads + Hamstrings"
        : `${priority?.name ?? "Full body"} focus`;
  const calorieRemaining = nutritionTargets.calories - nutrition.calories;
  const proteinRemaining = Math.max(
    0,
    nutritionTargets.protein - nutrition.protein,
  );

  return (
    <>
      <div className="legacy-profile-hidden">
        <LegacyHomePage
          startWorkout={startWorkout}
          water={water}
          setWater={setWater}
          setPage={setPage}
          trainingGoal={trainingGoal}
          customer={customer}
          dailyPlan={dailyPlan}
          workoutLogs={workoutLogs}
        />
      </div>
      <div className="page intelligence-home">
        <section className="intelligence-welcome">
          <div>
            <span className="eyebrow">
              {trainingGoal.toUpperCase()} · WEEK{" "}
              {Math.max(1, workoutLogs.length + 1)}
            </span>
            <h1>
              Good afternoon, <span>{customer.name.split(" ")[0]}.</span>
            </h1>
            <p>
              Your plan now considers your workout history, recovery, muscle
              volume, and weight goal.
            </p>
          </div>
          <button
            className="readiness-summary"
            onClick={() => setReadinessOpen(true)}
          >
            <Ring
              value={readiness.score}
              size={76}
              stroke={7}
              label={readiness.estimated ? "TUNE" : String(readiness.score)}
              sublabel={readiness.estimated ? "IN" : "/ 100"}
            />
            <div>
              <span className="eyebrow">
                {readiness.estimated
                  ? "TODAY'S COACHING"
                  : "DAILY READINESS"}
              </span>
              <b>
                {readiness.estimated
                  ? "Tune today's workout"
                  : `${readiness.score}% ready`}
              </b>
              <small>
                {readiness.estimated
                  ? "20 seconds. A plan that matches how you feel."
                  : readiness.score >= 75
                    ? "Ready for normal intensity."
                    : "Keep intensity controlled today."}
              </small>
            </div>
            <ChevronRight size={18} />
          </button>
        </section>

        <section className="today-intelligence-card">
          <div className="today-intelligence-copy">
            <span className="eyebrow">TODAY’S WORKOUT</span>
            <h2>{dailyPlan.title}</h2>
            <p>
              {trainingGoal} · Session{" "}
              {(workoutLogs.length % customer.days) + 1}/{customer.days}
            </p>
            <div className="today-intelligence-meta">
              <span>
                <Clock3 size={15} />{" "}
                {quickMinutes === 30
                  ? `${Math.min(30, Number.parseInt(dailyPlan.minutes, 10))} min quick plan`
                  : dailyPlan.minutes}
              </span>
              <span>
                <Dumbbell size={15} /> {dailyPlan.exercises.length} exercises
              </span>
              <span>
                <Target size={15} /> {dailyPlan.sets}
              </span>
              <span>RIR 1–3</span>
            </div>
            <div className="today-exercise-preview">
              {dailyPlan.exercises.slice(0, 3).map((exercise, index) => (
                <span key={exercise}>
                  <b>0{index + 1}</b>
                  {exercise}
                  <small>
                    {customer.experience === "Beginner" ? "2" : "3"} × 8–12
                  </small>
                </span>
              ))}
            </div>
            <div className="today-actions">
              <button className="primary-button" onClick={startWorkout}>
                <Play size={17} fill="currentColor" /> Start workout
              </button>
              <button
                className="secondary-button"
                onClick={() => setPage("Workout")}
              >
                View plan <ArrowRight size={15} />
              </button>
            </div>
          </div>
          <div className="quick-workout">
            <span className="eyebrow">SHORT ON TIME?</span>
            <b>Quick workout</b>
            <p>Rebuild today around your recovery and low-volume muscles.</p>
            <div>
              {[15, 30, 45].map((minutes) => (
                <button
                  key={minutes}
                  className={quickMinutes === minutes ? "selected" : ""}
                  onClick={() => setQuickMinutes(minutes)}
                >
                  {minutes} min
                </button>
              ))}
            </div>
            <small>
              {priority?.name ?? "Back"} gets priority in this version.
            </small>
          </div>
        </section>

        <section className="intelligence-grid">
          <article className="intelligence-card muscle-card">
            <div className="intelligence-heading">
              <div>
                <span className="eyebrow">MUSCLE READINESS</span>
                <h3>What is ready?</h3>
              </div>
              <button onClick={() => setSelectedMuscle(priority)}>
                {selectedMuscle ? "Close detail" : "Open body map"}{" "}
                <ArrowRight size={14} />
              </button>
            </div>
            <div className="interactive-body">
              <div className="body-silhouette">
                <img
                  src={coachImageForSex(customer.sex)}
                  alt={`${coachLabelForSex(customer.sex)} body readiness map`}
                />
                {muscles.map((muscle, index) => (
                  <button
                    key={muscle.name}
                    className={`heat-spot spot-${index} ${muscle.tone}`}
                    onClick={() => setSelectedMuscle(muscle)}
                  >
                    {muscle.name === "Hamstrings" ? "Hams" : muscle.name}
                  </button>
                ))}
              </div>
              <div className="muscle-readiness-list">
                {muscles.map((muscle) => (
                  <button
                    key={muscle.name}
                    onClick={() => setSelectedMuscle(muscle)}
                  >
                    <span className={`readiness-dot ${muscle.tone}`} />
                    <b>{muscle.name}</b>
                    <em>
                      {muscle.recovery === null
                        ? "No data"
                        : `${muscle.recovery}%`}
                    </em>
                  </button>
                ))}
              </div>
            </div>
            <div className="heatmap-legend">
              <span>
                <i className="ready" /> Ready
              </span>
              <span>
                <i className="partial" /> Partial
              </span>
              <span>
                <i className="fatigued" /> Recently trained
              </span>
              <span>
                <i className="priority" /> Priority
              </span>
              <span>
                <i className="unknown" /> No data
              </span>
            </div>
            {selectedMuscle && (
              <div className="muscle-detail">
                <div>
                  <span className="eyebrow">
                    {selectedMuscle.name.toUpperCase()}
                  </span>
                  <h4>
                    {selectedMuscle.recovery === null
                      ? "No recovery data yet"
                      : `${selectedMuscle.recovery}% recovered`}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedMuscle(null)}
                  aria-label="Close muscle detail"
                >
                  <X size={16} />
                </button>
                <div>
                  <span>
                    Last trained <b>{selectedMuscle.lastTrained}</b>
                  </span>
                  <span>
                    Weekly volume{" "}
                    <b>
                      {selectedMuscle.sets} / {selectedMuscle.target} sets
                    </b>
                  </span>
                  <span>
                    Next recommended <b>{selectedMuscle.nextRecommended}</b>
                  </span>
                </div>
                <p>
                  {selectedMuscle.exercises.length
                    ? `Recent: ${selectedMuscle.exercises.join(", ")}`
                    : "Finish a workout to start a muscle-specific history."}
                </p>
              </div>
            )}
          </article>

          <article className="intelligence-card volume-intelligence">
            <div className="intelligence-heading">
              <div>
                <span className="eyebrow">WEEKLY TRAINING VOLUME</span>
                <h3>Train in balance.</h3>
              </div>
              <button onClick={() => setPage("Progress")}>
                Details <ArrowRight size={14} />
              </button>
            </div>
            <div className="smart-volume-list">
              {muscles.slice(0, 5).map((muscle) => (
                <button
                  key={muscle.name}
                  onClick={() => setSelectedMuscle(muscle)}
                >
                  <span>{muscle.name}</span>
                  <div>
                    <i
                      style={{
                        width: `${Math.min(100, (muscle.sets / muscle.target) * 100)}%`,
                      }}
                    />
                  </div>
                  <b>
                    {muscle.sets} / {muscle.target}
                  </b>
                </button>
              ))}
            </div>
            <div className="coaching-insight">
              <Sparkles size={17} />
              <p>
                <b>{priority?.name ?? "Back"}</b> is your highest-volume
                opportunity this week. It is{" "}
                {priority?.recovery === null
                  ? "waiting for your first training data"
                  : `${priority.recovery}% recovered and below its weekly target`}
                .
              </p>
            </div>
          </article>

          <article className="intelligence-card nutrition-intelligence">
            <div className="intelligence-heading">
              <div>
                <span className="eyebrow">NUTRITION TODAY</span>
                <h3>Fuel the plan.</h3>
              </div>
              <button onClick={() => setPage("Nutrition")}>
                Open <ArrowRight size={14} />
              </button>
            </div>
            <div className="nutrition-number">
              <b>{nutrition.calories.toLocaleString()}</b>
              <span>of {nutritionTargets.calories.toLocaleString()} kcal</span>
            </div>
            <div className="nutrition-progress">
              <i
                style={{
                  width: `${Math.min(100, (nutrition.calories / nutritionTargets.calories) * 100)}%`,
                }}
              />
            </div>
            <div className="nutrition-mini-grid">
              <span>
                Protein{" "}
                <b>
                  {nutrition.protein} / {nutritionTargets.protein}g
                </b>
              </span>
              <span>
                Water <b>{water.toFixed(1)} / 3.0L</b>
              </span>
              <span>
                Carbs{" "}
                <b>
                  {nutrition.carbs} / {nutritionTargets.carbs}g
                </b>
              </span>
              <span>
                Fat{" "}
                <b>
                  {nutrition.fat} / {nutritionTargets.fat}g
                </b>
              </span>
            </div>
            <p>
              {calorieRemaining > 0
                ? `${calorieRemaining.toLocaleString()} kcal and ${proteinRemaining}g protein remaining today.`
                : "You have reached today’s calorie target."}
            </p>
            <div className="nutrition-actions">
              <button
                className="primary-button"
                onClick={() => onLogMeal("balanced")}
              >
                <Plus size={15} /> Log meal
              </button>
              <button onClick={() => onLogMeal("protein")}>
                + Protein meal
              </button>
              <button
                onClick={() =>
                  setWater(Math.min(3, Number((water + 0.25).toFixed(2))))
                }
              >
                + Water
              </button>
            </div>
          </article>

          <article className="intelligence-card weight-intelligence">
            <span className="eyebrow">WEIGHT GOAL</span>
            <h3>
              {goalDirection === "gain" ? "Lean gain" : "Fat loss"} · On track
            </h3>
            <div className="weight-goal-grid">
              <span>
                Current <b>{customer.weight} kg</b>
              </span>
              <span>
                Target <b>{customer.targetWeight} kg</b>
              </span>
              <span>
                Weekly trend{" "}
                <b>
                  {weeklyTrend === 0
                    ? "Need 2 check-ins"
                    : `${weeklyTrend > 0 ? "+" : ""}${weeklyTrend.toFixed(2)} kg`}
                </b>
              </span>
              <span>
                Target pace{" "}
                <b>{goalDirection === "gain" ? "+0.20" : "−0.30"} kg/week</b>
              </span>
            </div>
            <p>
              {checkIns.length < 2
                ? "Log two weekly check-ins before Pro Fitness gives a reliable trend."
                : Math.abs(weeklyTrend) < 0.05
                  ? "Your trend is flat. Keep targets for now or discuss a small calorie adjustment."
                  : "Your current trend is moving toward your selected goal."}
            </p>
            <button onClick={() => setPage("Profile")}>
              Update weight <ArrowRight size={14} />
            </button>
          </article>

          <article className="intelligence-card tomorrow-intelligence">
            <div>
              <span className="eyebrow">TOMORROW</span>
              <h3>{tomorrowFocus}</h3>
              <p>
                Recommended because {priority?.name ?? "Back"} is{" "}
                {priority?.recovery === null
                  ? "not yet trained this week"
                  : `${priority.recovery}% recovered`}{" "}
                and only {priority?.sets ?? 0} / {priority?.target ?? 0} weekly
                sets are complete.
              </p>
              <div className="tomorrow-muscles">
                <span>{priority?.name ?? "Back"}</span>
                <span>
                  {priority?.name === "Back" ? "Biceps" : "Support work"}
                </span>
                <span>{priority?.name === "Back" ? "Rear delts" : "Core"}</span>
              </div>
            </div>
            <button
              className="secondary-button"
              onClick={() => setPage("Workout")}
            >
              Preview workout <ArrowRight size={15} />
            </button>
          </article>
        </section>
      </div>
      {readinessOpen && (
        <div
          className="intelligence-modal-backdrop"
          onMouseDown={() => setReadinessOpen(false)}
        >
          <section
            className="readiness-drawer"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setReadinessOpen(false)}
              aria-label="Close readiness"
            >
              <X size={18} />
            </button>
            <span className="eyebrow">
              {readiness.estimated ? "ESTIMATED READINESS" : "DAILY READINESS"}
            </span>
            <h2>
              {readiness.estimated
                ? "Personalize today’s recommendation"
                : `${readiness.score} / 100`}
            </h2>
            <p>
              {readiness.estimated
                ? "A quick check-in gives the score a real explanation. Until then, Pro Fitness labels this as an estimate."
                : readiness.score >= 75
                  ? "You are ready for a normal-intensity workout today."
                  : "Consider keeping one working set in reserve today."}
            </p>
            <div className="readiness-factors">
              {readiness.factors.map((factor) => (
                <span key={factor.label}>
                  <b>{factor.label}</b>
                  <i>
                    <em style={{ width: `${factor.value}%` }} />
                  </i>
                  <strong>
                    {readiness.estimated ? "Estimated" : factor.value}
                  </strong>
                </span>
              ))}
            </div>
            <div className="checkin-form">
              <h3>How are you feeling?</h3>
              {(["sleep", "energy", "soreness", "stress"] as const).map(
                (field) => (
                  <label key={field}>
                    <span>{field}</span>
                    <div>
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          className={
                            checkDraft[field] === value ? "selected" : ""
                          }
                          onClick={() =>
                            setCheckDraft((current) => ({
                              ...current,
                              [field]: value,
                            }))
                          }
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </label>
                ),
              )}
              <button
                className="primary-button"
                onClick={() => {
                  onSaveReadiness(checkDraft);
                  setReadinessOpen(false);
                }}
              >
                Save readiness check-in <ArrowRight size={15} />
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function Macro({
  name,
  current,
  total,
  value,
  tone,
}: {
  name: string;
  current: string;
  total: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="macro">
      <div className="macro-label">
        <span>{name}</span>
        <b>
          {current}
          <small>/{total}</small>
        </b>
      </div>
      <div className={`macro-bar ${tone}`}>
        <i style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
function Volume({
  label,
  amount,
  width,
  color,
}: {
  label: string;
  amount: string;
  width: number;
  color: string;
}) {
  return (
    <div className="volume-row">
      <span>{label}</span>
      <div>
        <i style={{ width: `${width}%`, background: color }} />
      </div>
      <b>{amount}</b>
    </div>
  );
}

function coachImageForSex(sex?: string) {
  return sex === "Female"
    ? "/assets/anatomy/female-muscle-model.png"
    : "/assets/anatomy/male-muscle-model.png";
}

function coachLabelForSex(sex?: string) {
  if (sex === "Female") return "Female anatomical muscle model";
  if (sex === "Male") return "Male anatomical muscle model";
  return "Anatomical muscle model";
}

function BodyFigure({ sex }: { sex?: string }) {
  return (
    <div className="body-figure" aria-label="Muscle recovery body map">
      <img
        className="anatomy-model"
        src={coachImageForSex(sex)}
        alt={`${coachLabelForSex(sex)} showing front and back muscles`}
      />
      <span className="muscle-pop pop-one">94%</span>
      <span className="muscle-pop pop-two">91%</span>
    </div>
  );
}

type MuscleZone =
  | "chest"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "forearms"
  | "abs"
  | "obliques"
  | "quads"
  | "calves"
  | "lats"
  | "midBack"
  | "rearDelts"
  | "traps"
  | "glutes"
  | "hamstrings"
  | "erectors";

const muscleZonesByGroup: Record<
  string,
  { primary: MuscleZone[]; secondary: MuscleZone[] }
> = {
  Chest: { primary: ["chest", "shoulders"], secondary: ["triceps"] },
  Back: {
    primary: ["lats", "midBack"],
    secondary: ["biceps", "rearDelts"],
  },
  Shoulders: {
    primary: ["shoulders", "rearDelts"],
    secondary: ["triceps", "traps"],
  },
  Biceps: { primary: ["biceps"], secondary: ["forearms"] },
  Triceps: { primary: ["triceps"], secondary: ["chest", "shoulders"] },
  Quads: { primary: ["quads"], secondary: ["glutes", "abs"] },
  "Hamstrings & glutes": {
    primary: ["hamstrings", "glutes"],
    secondary: ["erectors", "abs"],
  },
  Calves: { primary: ["calves"], secondary: [] },
  Core: { primary: ["abs", "obliques"], secondary: ["erectors"] },
  "Fat loss cardio": {
    primary: ["chest", "lats", "abs", "quads", "hamstrings"],
    secondary: ["shoulders", "glutes", "calves"],
  },
};

function muscleZonesForExercise(exercise: Exercise) {
  const name = exercise.name.toLowerCase();

  if (exercise.group === "Chest") {
    return /fly|pec deck|cable crossover/.test(name)
      ? { primary: ["chest"] as MuscleZone[], secondary: ["shoulders"] as MuscleZone[] }
      : { primary: ["chest", "shoulders"] as MuscleZone[], secondary: ["triceps"] as MuscleZone[] };
  }

  if (exercise.group === "Back") {
    return /row/.test(name)
      ? { primary: ["lats", "midBack"] as MuscleZone[], secondary: ["biceps", "rearDelts"] as MuscleZone[] }
      : { primary: ["lats"] as MuscleZone[], secondary: ["biceps", "forearms"] as MuscleZone[] };
  }

  if (exercise.group === "Shoulders") {
    return /rear|face pull/.test(name)
      ? { primary: ["rearDelts"] as MuscleZone[], secondary: ["midBack", "traps"] as MuscleZone[] }
      : /raise/.test(name)
        ? { primary: ["shoulders"] as MuscleZone[], secondary: ["traps"] as MuscleZone[] }
        : { primary: ["shoulders"] as MuscleZone[], secondary: ["triceps", "traps"] as MuscleZone[] };
  }

  if (exercise.group === "Quads") {
    return { primary: ["quads"] as MuscleZone[], secondary: ["glutes", "abs"] as MuscleZone[] };
  }

  if (exercise.group === "Hamstrings & glutes") {
    return /bridge|hip thrust|kickback/.test(name)
      ? { primary: ["glutes"] as MuscleZone[], secondary: ["hamstrings"] as MuscleZone[] }
      : { primary: ["hamstrings", "glutes"] as MuscleZone[], secondary: ["erectors"] as MuscleZone[] };
  }

  if (exercise.group === "Core") {
    return /side plank|side bend|woodchop/.test(name)
      ? { primary: ["obliques"] as MuscleZone[], secondary: ["abs"] as MuscleZone[] }
      : { primary: ["abs"] as MuscleZone[], secondary: ["obliques", "erectors"] as MuscleZone[] };
  }

  return muscleZonesByGroup[exercise.group] ?? muscleZonesByGroup.Chest;
}

function MuscleFocusMap({
  exercise,
  primary,
  secondary,
  sex,
}: {
  exercise: Exercise;
  primary: string[];
  secondary: string[];
  sex: string;
}) {
  const zones = muscleZonesForExercise(exercise);
  const zoneClass = (zone: MuscleZone) =>
    `anatomy-zone ${
      zones.primary.includes(zone)
        ? "is-primary"
        : zones.secondary.includes(zone)
          ? "is-secondary"
          : ""
    }`;

  return (
    <section
      className="muscle-focus-map"
      aria-label={`Muscle map for ${exercise.name}. Primary muscles: ${primary.join(", ")}. Supporting muscles: ${secondary.join(", ")}.`}
    >
      <div className="muscle-focus-heading">
        <span>LIVE MUSCLE FOCUS</span>
        <b>{primary.slice(0, 2).join(" + ")}</b>
      </div>
      <div className="muscle-focus-illustration">
        <img
          src={coachImageForSex(sex)}
          alt={`${coachLabelForSex(sex)} for ${exercise.name}`}
        />
        <svg
          className="muscle-focus-overlay"
          viewBox="0 0 1024 1024"
          role="img"
          aria-label={`${exercise.group} muscle activation overlay`}
        >
          <g className={zoneClass("shoulders")}>
            <path d="M225 182C183 179 165 204 169 240L219 253L260 214Z" />
            <path d="M379 182C421 179 439 204 435 240L385 253L344 214Z" />
            <path d="M621 182C579 179 561 204 565 240L615 253L656 214Z" />
            <path d="M775 182C817 179 835 204 831 240L781 253L740 214Z" />
          </g>
          <g className={zoneClass("chest")}>
            <path d="M254 226C274 205 296 207 302 236L300 302L246 283Z" />
            <path d="M350 226C330 205 308 207 302 236L304 302L358 283Z" />
          </g>
          <g className={zoneClass("biceps")}>
            <path d="M193 257L230 250L220 340L181 356Z" />
            <path d="M411 257L374 250L384 340L423 356Z" />
          </g>
          <g className={zoneClass("triceps")}>
            <path d="M633 257L670 250L660 340L621 356Z" />
            <path d="M851 257L814 250L824 340L863 356Z" />
          </g>
          <g className={zoneClass("forearms")}>
            <path d="M179 360L218 344L211 438L170 448Z" />
            <path d="M425 360L386 344L393 438L434 448Z" />
            <path d="M619 360L658 344L651 438L610 448Z" />
            <path d="M865 360L826 344L833 438L874 448Z" />
          </g>
          <g className={zoneClass("abs")}>
            <path d="M275 310L302 307L302 448L269 432Z" />
            <path d="M329 310L302 307L302 448L335 432Z" />
          </g>
          <g className={zoneClass("obliques")}>
            <path d="M244 305L270 320L267 430L235 401Z" />
            <path d="M360 305L334 320L337 430L369 401Z" />
          </g>
          <g className={zoneClass("quads")}>
            <path d="M265 471L301 469L294 684L252 730L236 550Z" />
            <path d="M339 471L303 469L310 684L352 730L368 550Z" />
          </g>
          <g className={zoneClass("calves")}>
            <path d="M249 737L294 696L292 863L258 886Z" />
            <path d="M355 737L310 696L312 863L346 886Z" />
            <path d="M649 737L694 696L692 863L658 886Z" />
            <path d="M755 737L710 696L712 863L746 886Z" />
          </g>
          <g className={zoneClass("traps")}>
            <path d="M664 189L701 151L738 189L724 266L678 266Z" />
          </g>
          <g className={zoneClass("rearDelts")}>
            <path d="M621 185C587 182 570 207 576 244L623 254L652 214Z" />
            <path d="M781 185C815 182 832 207 826 244L779 254L750 214Z" />
          </g>
          <g className={zoneClass("lats")}>
            <path d="M644 266L696 273L690 435L624 399Z" />
            <path d="M758 266L706 273L712 435L778 399Z" />
          </g>
          <g className={zoneClass("midBack")}>
            <path d="M691 263L711 263L733 439L669 439Z" />
          </g>
          <g className={zoneClass("erectors")}>
            <path d="M676 430L701 417L726 430L729 501L673 501Z" />
          </g>
          <g className={zoneClass("glutes")}>
            <path d="M648 485C678 458 703 468 702 525C670 545 642 526 635 501Z" />
            <path d="M754 485C724 458 699 468 700 525C732 545 760 526 767 501Z" />
          </g>
          <g className={zoneClass("hamstrings")}>
            <path d="M658 536L699 537L693 715L651 759L634 586Z" />
            <path d="M742 536L701 537L707 715L749 759L766 586Z" />
          </g>
        </svg>
      </div>
      <svg viewBox="0 0 280 216" role="img" aria-hidden="true">
        <text className="anatomy-label" x="70" y="208" textAnchor="middle">
          FRONT
        </text>
        <text className="anatomy-label" x="210" y="208" textAnchor="middle">
          BACK
        </text>

        <g className="anatomy-figure">
          <circle className="anatomy-base" cx="70" cy="22" r="12" />
          <path
            className="anatomy-base"
            d="M51 40Q70 33 89 40L99 69L88 124L82 126L80 192H60L58 126L52 124L41 69Z"
          />
          <path className="anatomy-base" d="M48 48L32 58L25 111L38 114L52 70Z" />
          <path className="anatomy-base" d="M92 48L108 58L115 111L102 114L88 70Z" />
          <path className={zoneClass("shoulders")} d="M43 43Q50 38 56 45L53 61L41 58Z" />
          <path className={zoneClass("shoulders")} d="M97 43Q90 38 84 45L87 61L99 58Z" />
          <path className={zoneClass("chest")} d="M54 56Q63 50 69 58L69 76Q59 75 52 68Z" />
          <path className={zoneClass("chest")} d="M86 56Q77 50 71 58L71 76Q81 75 88 68Z" />
          <path className={zoneClass("biceps")} d="M35 61L45 58L43 83L31 87Z" />
          <path className={zoneClass("biceps")} d="M105 61L95 58L97 83L109 87Z" />
          <path className={zoneClass("forearms")} d="M31 88L42 84L39 106L27 108Z" />
          <path className={zoneClass("forearms")} d="M109 88L98 84L101 106L113 108Z" />
          <path className={zoneClass("abs")} d="M60 78L70 77L70 116L58 113Z" />
          <path className={zoneClass("abs")} d="M72 77L82 78L82 113L70 116Z" />
          <path className={zoneClass("obliques")} d="M53 76L58 80L58 111L50 105Z" />
          <path className={zoneClass("obliques")} d="M87 76L82 80L82 111L90 105Z" />
          <path className={zoneClass("quads")} d="M59 125L69 125L68 164L58 177L54 147Z" />
          <path className={zoneClass("quads")} d="M71 125L81 125L86 147L82 177L72 164Z" />
          <path className={zoneClass("calves")} d="M57 169L68 164L67 190L59 193Z" />
          <path className={zoneClass("calves")} d="M82 169L71 164L72 190L80 193Z" />
        </g>

        <g className="anatomy-figure">
          <circle className="anatomy-base" cx="210" cy="22" r="12" />
          <path
            className="anatomy-base"
            d="M191 40Q210 33 229 40L239 69L228 124L222 126L220 192H200L198 126L192 124L181 69Z"
          />
          <path className="anatomy-base" d="M188 48L172 58L165 111L178 114L192 70Z" />
          <path className="anatomy-base" d="M232 48L248 58L255 111L242 114L228 70Z" />
          <path className={zoneClass("traps")} d="M197 43L210 35L223 43L219 57L201 57Z" />
          <path className={zoneClass("rearDelts")} d="M183 44Q191 38 197 46L195 61L181 58Z" />
          <path className={zoneClass("rearDelts")} d="M237 44Q229 38 223 46L225 61L239 58Z" />
          <path className={zoneClass("lats")} d="M196 58L208 60L207 105L192 98Z" />
          <path className={zoneClass("lats")} d="M224 58L212 60L213 105L228 98Z" />
          <path className={zoneClass("midBack")} d="M208 57L212 57L216 108L204 108Z" />
          <path className={zoneClass("triceps")} d="M175 61L185 58L183 84L171 88Z" />
          <path className={zoneClass("triceps")} d="M245 61L235 58L237 84L249 88Z" />
          <path className={zoneClass("forearms")} d="M171 89L182 85L179 106L167 108Z" />
          <path className={zoneClass("forearms")} d="M249 89L238 85L241 106L253 108Z" />
          <path className={zoneClass("erectors")} d="M204 108L210 105L216 108L216 124L204 124Z" />
          <path className={zoneClass("glutes")} d="M195 121Q204 115 210 123L210 138Q200 140 194 133Z" />
          <path className={zoneClass("glutes")} d="M225 121Q216 115 210 123L210 138Q220 140 226 133Z" />
          <path className={zoneClass("hamstrings")} d="M199 137L209 138L208 170L198 178L194 149Z" />
          <path className={zoneClass("hamstrings")} d="M211 138L221 137L226 149L222 178L212 170Z" />
          <path className={zoneClass("calves")} d="M197 171L208 165L207 191L199 193Z" />
          <path className={zoneClass("calves")} d="M222 171L211 165L212 191L220 193Z" />
        </g>
      </svg>
      <div className="muscle-map-key">
        <span><i className="primary" /> Primary</span>
        <span><i className="secondary" /> Supporting</span>
      </div>
    </section>
  );
}

function ExerciseDemoLauncher({
  selectedExercise,
  onClose,
  onAddExercise,
  coachSex,
}: {
  selectedExercise: Exercise | null;
  onClose: () => void;
  onAddExercise: (exercise: string) => void;
  coachSex: string;
}) {
  if (!selectedExercise) return null;
  return (
    <ExerciseDemoModal
      exercise={selectedExercise}
      coachSex={coachSex}
      onClose={onClose}
      onAdd={() => {
        onAddExercise(selectedExercise.name);
        onClose();
      }}
    />
  );
}

function ExerciseDemoModal({
  exercise,
  coachSex,
  onClose,
  onAdd,
}: {
  exercise: Exercise;
  coachSex: string;
  onClose: () => void;
  onAdd: () => void;
}) {
  const guide = guideByGroup[exercise.group] ?? guideByGroup.Chest;
  const demoKey = `${exercise.name}-${coachSex}`;
  const [demoLoop, setDemoLoop] = useState({ key: demoKey, frame: 0 });
  const demoFrame = demoLoop.key === demoKey ? demoLoop.frame : 0;
  useEffect(() => {
    const loop = window.setInterval(
      () =>
        setDemoLoop((current) =>
          current.key === demoKey
            ? { ...current, frame: current.frame === 0 ? 1 : 0 }
            : { key: demoKey, frame: 1 },
        ),
      2000,
    );
    return () => window.clearInterval(loop);
  }, [demoKey]);
  const exerciseVisual = getExerciseVisual(exercise, coachSex, demoFrame);
  const visualShape = getExerciseVisualShape(exercise.group);
  const isFemaleCoach = coachSex.trim().toLowerCase() === "female";
  const isPairedVisual = Boolean(
    (isFemaleCoach ? femalePairAtlasByGroup : malePairAtlasByGroup)[
      exercise.group
    ],
  );
  const videoUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${exercise.name} correct form exercise demo`)}`;
  const alternatives = exerciseData
    .filter(
      (item) => item.group === exercise.group && item.name !== exercise.name,
    )
    .slice(0, 3);
  const commonMistakes =
    guide.pattern === "Push"
      ? ["Flaring elbows too far", "Losing shoulder position", "Using momentum"]
      : guide.pattern === "Pull"
        ? [
            "Shrugging toward the ears",
            "Pulling with momentum",
            "Losing a stable torso",
          ]
        : guide.pattern === "Legs" || guide.pattern === "Hinge"
          ? [
              "Letting knees collapse inward",
              "Rushing the bottom position",
              "Losing a braced torso",
            ]
          : [
              "Moving too quickly",
              "Holding your breath",
              "Forcing range of motion",
            ];

  return (
    <div
      className="demo-modal-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="demo-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${exercise.name} exercise guide`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="demo-modal-header">
          <div>
            <span className="eyebrow">
              TECHNIQUE LAB · {guide.pattern.toUpperCase()} MOVEMENT
            </span>
            <h2>{exercise.name}</h2>
            <p>
              {exercise.group} · {exercise.equipment} · {exercise.level}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close exercise guide">
            <X size={21} />
          </button>
        </header>
        <div className="demo-modal-grid">
          <div className="demo-stage real-video-stage">
            <div className="demo-stage-top">
              <span>
                <span className="live-dot" /> REAL COACH VIDEO
              </span>
              <b>{guide.pattern}</b>
            </div>
            <div className="tutorial-video-poster">
              <div
                className="tutorial-exercise-visual"
                role="img"
                aria-label={exerciseVisual.alt}
              >
                <div
                  className={`tutorial-exercise-photo ${isPairedVisual ? "tutorial-exercise-photo-paired" : ""} exercise-visual-shape-${visualShape}`}
                  style={getExerciseVisualStyle(exerciseVisual)}
                  key={demoFrame}
                />
              </div>
              <div className="tutorial-sequence-progress" aria-hidden="true">
                <span>{demoFrame === 0 ? "01 START" : "02 FINISH"}</span>
                <span>2 SEC LOOP</span>
              </div>
              <MuscleFocusMap
                exercise={exercise}
                primary={guide.primary}
                secondary={guide.secondary}
                sex={coachSex}
              />
              <div className="tutorial-video-copy">
                <span>REAL COACH TUTORIAL</span>
                <b>{exercise.name}</b>
                <small>
                  Exact setup and posture reference for this exercise.
                </small>
              </div>
              <a
                className="tutorial-play-button"
                href={videoUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Play size={18} fill="currentColor" /> Play tutorial
              </a>
            </div>
            <div className="demo-muscle-callout">
              {guide.primary[0]}
              <span>primary focus</span>
            </div>
            <div className="demo-timeline">
              {guide.steps.map((step, index) => (
                <div key={step} className={index === 1 ? "active" : ""}>
                  <b>0{index + 1}</b>
                  <span>{step}</span>
                </div>
              ))}
            </div>
            <a
              className="full-demo-link"
              href={videoUrl}
              target="_blank"
              rel="noreferrer"
            >
              <Play size={15} fill="currentColor" /> Open exact {exercise.name}{" "}
              tutorial <ArrowRight size={15} />
            </a>
          </div>
          <div className="demo-insights">
            <div className="movement-badge">
              <Dumbbell size={17} />
              <span>{guide.pattern} movement</span>
            </div>
            <h3>Muscles this exercise trains</h3>
            <div className="muscle-columns">
              <div>
                <span>PRIMARY</span>
                {guide.primary.map((muscle) => (
                  <b key={muscle}>{muscle}</b>
                ))}
              </div>
              <div>
                <span>SECONDARY</span>
                {guide.secondary.map((muscle) => (
                  <b key={muscle}>{muscle}</b>
                ))}
              </div>
            </div>
            <div className="pose-cue">
              <span className="eyebrow">COACHING CUE</span>
              <p>{guide.cue}</p>
            </div>
            <div className="guide-steps">
              <span className="eyebrow">POSE GUIDE</span>
              {guide.steps.map((step, index) => (
                <div key={step}>
                  <i>{index + 1}</i>
                  <p>{step}</p>
                </div>
              ))}
            </div>
            <div className="exercise-detail-grid">
              <div>
                <span className="eyebrow">COMMON MISTAKES</span>
                {commonMistakes.map((mistake) => (
                  <p key={mistake}>• {mistake}</p>
                ))}
              </div>
              <div>
                <span className="eyebrow">ALTERNATIVES</span>
                {alternatives.map((alternative) => (
                  <p key={alternative.name}>{alternative.name}</p>
                ))}
              </div>
            </div>
            <div className="exercise-history-note">
              <span className="eyebrow">YOUR HISTORY</span>
              <b>No completed sets for {exercise.name} yet.</b>
              <small>
                Add it to a workout and log weight, reps, RIR, and RPE to unlock
                your history and PRs.
              </small>
            </div>
            <div className="demo-actions">
              <button className="primary-button" onClick={onAdd}>
                <Plus size={17} /> Add to workout
              </button>
              <button onClick={onClose}>Keep exploring</button>
            </div>
            <small className="demo-note">
              Technique guidance is educational and not medical advice. Stop if
              a movement causes pain.
            </small>
          </div>
        </div>
      </section>
    </div>
  );
}

type FormMotionMode =
  | "horizontal-press"
  | "push-up"
  | "vertical-pull"
  | "row"
  | "curl"
  | "shoulder-press"
  | "triceps-pushdown"
  | "squat"
  | "hinge"
  | "calf-raise"
  | "sit-to-stand"
  | "core"
  | "cardio";

type FormMotionDetails = {
  mode: FormMotionMode;
  label: string;
  start: string;
  work: string;
};

function getFormMotion(exercise: string, guide: ExerciseGuide): FormMotionDetails {
  const name = exercise.toLowerCase();

  if (name.includes("push-up")) {
    return { mode: "push-up", label: "Controlled push-up", start: "Strong plank", work: "Chest lowers as one line" };
  }
  if (name.includes("sit-to-stand")) {
    return { mode: "sit-to-stand", label: "Sit-to-stand", start: "Feet under knees", work: "Stand tall with control" };
  }
  if (guide.primary.includes("Deltoids")) {
    return { mode: "shoulder-press", label: "Shoulder press", start: "Wrists stacked", work: "Ribs stay down" };
  }
  if (guide.primary.includes("Triceps")) {
    return { mode: "triceps-pushdown", label: "Triceps extension", start: "Elbows pinned", work: "Extend with control" };
  }
  if (guide.pattern === "Pull" && guide.primary.includes("Biceps")) {
    return { mode: "curl", label: "Controlled curl", start: "Arms long", work: "Elbows stay in" };
  }
  if (guide.pattern === "Pull") {
    if (/(pull[- ]?up|pull[- ]?down|lat pulldown|straight-arm)/.test(name)) {
      return { mode: "vertical-pull", label: "Vertical pull", start: "Reach tall", work: "Elbows to ribs" };
    }
    return { mode: "row", label: "Neutral-spine row", start: "Reach long", work: "Elbows behind" };
  }
  if (guide.pattern === "Legs" && guide.primary.includes("Quadriceps")) {
    return { mode: "squat", label: "Controlled squat", start: "Brace tall", work: "Knees track toes" };
  }
  if (guide.pattern === "Legs") {
    return { mode: "calf-raise", label: "Full-range calf raise", start: "Heels low", work: "Rise through toes" };
  }
  if (guide.pattern === "Hinge") {
    return { mode: "hinge", label: "Hip hinge", start: "Hips back", work: "Stand tall" };
  }
  if (guide.pattern === "Core") {
    return { mode: "core", label: "Braced core", start: "Ribs down", work: "Keep spine long" };
  }
  if (guide.pattern === "Conditioning") {
    return { mode: "cardio", label: "Light movement", start: "Tall posture", work: "Soft landing" };
  }

  return { mode: "horizontal-press", label: "Controlled press", start: "Wrists stacked", work: "Press without bounce" };
}

const realFormSequences: Record<
  FormMotionMode,
  { male: string; female?: string; alt: string; frame: "portrait" | "medium" | "wide" }
> = {
  "horizontal-press": {
    male: "/assets/form-loops/horizontal-press-male.png",
    alt: "Correct start and finish positions for a controlled horizontal press",
    frame: "wide",
  },
  "push-up": {
    male: "/assets/form-loops/push-up-male.png",
    alt: "Correct plank and bottom positions for a controlled push-up",
    frame: "wide",
  },
  "vertical-pull": {
    male: "/assets/form-loops/vertical-pull-male.png",
    female: "/assets/form-loops/vertical-pull-female.png",
    alt: "Correct start and finish positions for a straight-arm cable pulldown",
    frame: "portrait",
  },
  row: {
    male: "/assets/form-loops/row-male.png",
    alt: "Correct reach and pull positions for a neutral-spine row",
    frame: "wide",
  },
  curl: {
    male: "/assets/form-loops/curl-male.png",
    alt: "Correct start and finish positions for a controlled biceps curl",
    frame: "portrait",
  },
  "shoulder-press": {
    male: "/assets/form-loops/shoulder-press-male.png",
    alt: "Correct start and finish positions for a controlled shoulder press",
    frame: "portrait",
  },
  "triceps-pushdown": {
    male: "/assets/form-loops/triceps-pushdown-male.png",
    alt: "Correct start and finish positions for a controlled triceps extension",
    frame: "portrait",
  },
  squat: {
    male: "/assets/form-loops/squat-male.png",
    alt: "Correct tall and bottom positions for a controlled squat",
    frame: "wide",
  },
  hinge: {
    male: "/assets/form-loops/hinge-male.png",
    alt: "Correct hinge and tall finish positions for a Romanian deadlift",
    frame: "medium",
  },
  "calf-raise": {
    male: "/assets/form-loops/calf-raise-male.png",
    alt: "Correct low and high positions for a controlled calf raise",
    frame: "portrait",
  },
  "sit-to-stand": {
    male: "/assets/form-loops/sit-to-stand-male.png",
    alt: "Correct seated and standing positions for a controlled sit-to-stand",
    frame: "portrait",
  },
  core: {
    male: "/assets/form-loops/core-male.png",
    alt: "Correct braced and working positions for a dead bug core exercise",
    frame: "wide",
  },
  cardio: {
    male: "/assets/form-loops/cardio-male.png",
    alt: "Correct start and finish positions for a controlled step-up",
    frame: "wide",
  },
};

type ExerciseAtlas = {
  source: string;
  columns: number;
  rows: number;
};

type ExerciseVisual = ExerciseAtlas & {
  index: number;
  alt: string;
};

const exerciseAtlasByGroup: Record<string, ExerciseAtlas> = {
  Chest: { source: "/assets/exercise-atlases/chest.png", columns: 4, rows: 3 },
  Back: { source: "/assets/exercise-atlases/back.png", columns: 3, rows: 3 },
  Shoulders: { source: "/assets/exercise-atlases/shoulders.png", columns: 3, rows: 3 },
  Biceps: { source: "/assets/exercise-atlases/biceps.png", columns: 3, rows: 3 },
  Triceps: { source: "/assets/exercise-atlases/triceps.png", columns: 3, rows: 3 },
  Quads: { source: "/assets/exercise-atlases/quads.png", columns: 3, rows: 3 },
  "Hamstrings & glutes": {
    source: "/assets/exercise-atlases/hamstrings-glutes.png",
    columns: 3,
    rows: 3,
  },
  Calves: { source: "/assets/exercise-atlases/calves.png", columns: 3, rows: 3 },
  Core: { source: "/assets/exercise-atlases/core.png", columns: 3, rows: 3 },
  "Fat loss cardio": {
    source: "/assets/exercise-atlases/cardio.png",
    columns: 3,
    rows: 3,
  },
};

const femalePairAtlasByGroup: Record<string, ExerciseAtlas> = {
  Chest: {
    source: "/assets/exercise-atlases/female-pairs/chest.png",
    columns: 3,
    rows: 4,
  },
  Back: {
    source: "/assets/exercise-atlases/female-pairs/back.png",
    columns: 3,
    rows: 3,
  },
  Shoulders: {
    source: "/assets/exercise-atlases/female-pairs/shoulders.png",
    columns: 3,
    rows: 3,
  },
  Biceps: {
    source: "/assets/exercise-atlases/female-pairs/biceps.png",
    columns: 3,
    rows: 3,
  },
  Triceps: {
    source: "/assets/exercise-atlases/female-pairs/triceps.png",
    columns: 3,
    rows: 3,
  },
  Quads: {
    source: "/assets/exercise-atlases/female-pairs/quads.png",
    columns: 3,
    rows: 4,
  },
  "Hamstrings & glutes": {
    source: "/assets/exercise-atlases/female-pairs/hamstrings-glutes.png",
    columns: 3,
    rows: 3,
  },
  Calves: {
    source: "/assets/exercise-atlases/female-pairs/calves.png",
    columns: 3,
    rows: 3,
  },
  Core: {
    source: "/assets/exercise-atlases/female-pairs/core.png",
    columns: 3,
    rows: 3,
  },
  "Fat loss cardio": {
    source: "/assets/exercise-atlases/female-pairs/cardio.png",
    columns: 3,
    rows: 3,
  },
};

const malePairAtlasByGroup: Record<string, ExerciseAtlas> = {
  Chest: {
    source: "/assets/exercise-atlases/male-pairs/chest.png",
    columns: 3,
    rows: 4,
  },
  Back: {
    source: "/assets/exercise-atlases/male-pairs/back.png",
    columns: 3,
    rows: 3,
  },
  Shoulders: {
    source: "/assets/exercise-atlases/male-pairs/shoulders.png",
    columns: 3,
    rows: 3,
  },
  Biceps: {
    source: "/assets/exercise-atlases/male-pairs/biceps.png",
    columns: 3,
    rows: 3,
  },
  Triceps: {
    source: "/assets/exercise-atlases/male-pairs/triceps.png",
    columns: 3,
    rows: 3,
  },
  Quads: {
    source: "/assets/exercise-atlases/male-pairs/quads.png",
    columns: 3,
    rows: 4,
  },
  "Hamstrings & glutes": {
    source: "/assets/exercise-atlases/male-pairs/hamstrings-glutes.png",
    columns: 3,
    rows: 3,
  },
  Calves: {
    source: "/assets/exercise-atlases/male-pairs/calves.png",
    columns: 3,
    rows: 3,
  },
  Core: {
    source: "/assets/exercise-atlases/male-pairs/core.png",
    columns: 3,
    rows: 3,
  },
  "Fat loss cardio": {
    source: "/assets/exercise-atlases/male-pairs/cardio.png",
    columns: 3,
    rows: 3,
  },
};

function getExerciseVisual(
  exercise: Exercise,
  coachSex = "Male",
  frame = 0,
): ExerciseVisual {
  const isFemaleCoach = coachSex.trim().toLowerCase() === "female";
  const pairAtlases = isFemaleCoach
    ? femalePairAtlasByGroup
    : malePairAtlasByGroup;
  const pairAtlas = pairAtlases[exercise.group];

  if (pairAtlas) {
    const groupExercises = exerciseData.filter(
      (item) => item.group === exercise.group,
    );
    const tileIndex = Math.max(
      0,
      groupExercises.findIndex((item) => item.name === exercise.name),
    );
    const tileColumn = tileIndex % pairAtlas.columns;
    const tileRow = Math.floor(tileIndex / pairAtlas.columns);
    const pairedColumns = pairAtlas.columns * 2;

    return {
      source: pairAtlas.source,
      columns: pairedColumns,
      rows: pairAtlas.rows,
      index: tileRow * pairedColumns + tileColumn * 2 + frame,
      alt: `${isFemaleCoach ? "Female" : "Male"} coach demonstrating ${exercise.name}, ${frame === 0 ? "start" : "finish"} position`,
    };
  }

  if (exercise.name === "Sit-to-Stand") {
    return {
      source: "/assets/form-loops/sit-to-stand-male.png",
      columns: 2,
      rows: 1,
      index: frame,
      alt: `Coach demonstrating a sit-to-stand, ${frame === 0 ? "start" : "finish"} position`,
    };
  }

  if (frame === 1) {
    const guide = guideByGroup[exercise.group] ?? guideByGroup.Chest;
    const form = realFormSequences[getFormMotion(exercise.name, guide).mode];
    return {
      source: form.male,
      columns: 2,
      rows: 1,
      index: 1,
      alt: `Coach demonstrating ${exercise.name}, finish position`,
    };
  }

  const atlas = exerciseAtlasByGroup[exercise.group];
  const groupExercises = exerciseData.filter(
    (item) => item.group === exercise.group && item.name !== "Sit-to-Stand",
  );
  const index = Math.max(
    0,
    groupExercises.findIndex((item) => item.name === exercise.name),
  );

  return {
    ...atlas,
    index,
    alt: `Coach demonstrating ${exercise.name}, start position`,
  };
}

function getExerciseVisualStyle(visual: ExerciseVisual): CSSProperties {
  const column = visual.index % visual.columns;
  const row = Math.floor(visual.index / visual.columns);
  const x = visual.columns === 1 ? 0 : (column / (visual.columns - 1)) * 100;
  const y = visual.rows === 1 ? 0 : (row / (visual.rows - 1)) * 100;

  return {
    backgroundImage: `url(${visual.source})`,
    backgroundSize: `${visual.columns * 100}% ${visual.rows * 100}%`,
    backgroundPosition: `${x}% ${y}%`,
  };
}

type ExerciseVisualShape = "tall" | "medium" | "wide";

function getExerciseVisualShape(group: string): ExerciseVisualShape {
  if (group === "Chest" || group === "Quads") return "wide";
  if (group === "Shoulders" || group === "Triceps") return "medium";
  return "tall";
}

function buildWarmupMoves(
  workoutExercises: string[],
  equipment: string[],
): WarmupMove[] {
  const sessionExercises = workoutExercises
    .map((name) => exerciseData.find((exercise) => exercise.name === name))
    .filter((exercise): exercise is Exercise => Boolean(exercise));
  const availableSessionExercises = sessionExercises.filter((exercise) =>
    isExerciseAvailable(exercise, equipment),
  );
  const primaryExercise =
    availableSessionExercises[0] ??
    exerciseData.find((exercise) => exercise.equipment === "Bodyweight") ??
    exerciseData[0];
  const groups = new Set(
    availableSessionExercises.map((exercise) => exercise.group),
  );
  const hasEquipment = (item: string) => memberHasEquipment(equipment, item);
  const findAvailableExercise = (name: string, fallback = primaryExercise) => {
    const exercise = exerciseData.find((item) => item.name === name);
    return exercise && isExerciseAvailable(exercise, equipment)
      ? exercise
      : fallback;
  };
  const findSessionExercise = (group: string) =>
    availableSessionExercises.find((exercise) => exercise.group === group) ??
    primaryExercise;
  const cardioExercise = hasEquipment("Bike")
    ? findAvailableExercise("Stationary Bike Intervals")
    : hasEquipment("Treadmill")
      ? findAvailableExercise("Incline Treadmill Walk")
      : null;
  const hasUpperPush =
    groups.has("Chest") || groups.has("Shoulders") || groups.has("Triceps");
  const hasUpperPull = groups.has("Back") || groups.has("Biceps");
  const hasLower =
    groups.has("Quads") || groups.has("Hamstrings & glutes") || groups.has("Calves");
  const warmup: WarmupMove[] = [
    {
      name:
        cardioExercise?.name === "Stationary Bike Intervals"
          ? "Easy bike spin"
          : cardioExercise?.name === "Incline Treadmill Walk"
            ? "Easy treadmill walk"
            : "Low-impact march",
      duration: "2 min",
      target: "Whole body temperature",
      cue: "Keep the pace conversational. You should feel warmer, not tired.",
      equipmentNote:
        !cardioExercise
          ? "No machine needed"
          : `Using your ${cardioExercise.equipment}`,
      visualExercise: cardioExercise ?? primaryExercise,
    },
  ];

  if (hasUpperPush) {
    warmup.push({
      name: "Shoulder circles + reach",
      duration: "45 sec",
      target: "Shoulders and chest",
      cue: "Move slowly through a pain-free range; keep your ribs stacked.",
      equipmentNote: "Bodyweight mobility",
      visualExercise: findAvailableExercise("Knee Push-up"),
    });
  }
  if (hasUpperPull) {
    warmup.push({
      name: hasEquipment("Cable") ? "Light cable scapular pull" : "Scapular wall slide",
      duration: "45 sec",
      target: "Upper back and lats",
      cue: "Keep your neck long and draw the shoulder blades down before the arms move.",
      equipmentNote: hasEquipment("Cable") ? "Cable: use the lightest load" : "Wall or open floor space",
      visualExercise: hasEquipment("Cable")
        ? findAvailableExercise("Lat Pulldown")
        : findSessionExercise("Back"),
    });
  }
  if (hasLower) {
    warmup.push({
      name: "Controlled bodyweight squat",
      duration: "8 reps",
      target: "Hips, knees, and ankles",
      cue: "Sit between the hips, keep feet planted, and stand tall at the top.",
      equipmentNote: "Bodyweight rehearsal",
      visualExercise: findSessionExercise("Quads"),
    });
  }
  if (groups.has("Core")) {
    warmup.push({
      name: "Dead bug breathing",
      duration: "6 slow reps",
      target: "Deep core control",
      cue: "Exhale fully, keep your lower back gently connected to the floor.",
      equipmentNote: "Mat or clear floor space",
      visualExercise: findAvailableExercise("Dead Bug"),
    });
  }

  warmup.push({
    name: `Light ${primaryExercise.name} rehearsal`,
    duration: "1 easy set",
    target: `${primaryExercise.group} movement pattern`,
    cue: "Use about half your normal effort and rehearse the exact form you will use today.",
    equipmentNote: primaryExercise.equipment,
    visualExercise: primaryExercise,
  });

  return warmup.slice(0, 4);
}

function UprightFormBase() {
  return (
    <g className="form-loop-base">
      <circle className="form-loop-head" cx="160" cy="48" r="17" />
      <path className="form-loop-neck" d="M153 63 L153 73 M167 63 L167 73" />
      <path className="form-loop-torso" d="M132 76 Q160 65 188 76 L198 143 Q160 158 122 143 Z" />
      <path className="form-loop-leg" d="M141 142 L135 209 Q136 223 149 223 L159 159" />
      <path className="form-loop-leg" d="M179 142 L185 209 Q184 223 171 223 L161 159" />
      <path className="form-loop-foot" d="M136 220 L119 225" />
      <path className="form-loop-foot" d="M184 220 L201 225" />
      <circle className="form-loop-joint" cx="132" cy="79" r="4" />
      <circle className="form-loop-joint" cx="188" cy="79" r="4" />
      <circle className="form-loop-joint subtle" cx="141" cy="143" r="3" />
      <circle className="form-loop-joint subtle" cx="179" cy="143" r="3" />
    </g>
  );
}

function FormMotionLoop({
  exercise,
  guide,
  coachSex,
}: {
  exercise: string;
  guide: ExerciseGuide;
  coachSex: string;
}) {
  const motion = getFormMotion(exercise, guide);
  const commonLabel = `${motion.label}: a two-second loop from ${motion.start.toLowerCase()} to ${motion.work.toLowerCase()}.`;
  const isFemaleCoach = coachSex.trim().toLowerCase() === "female";
  const formKey = `${exercise}-${coachSex}`;
  const [formLoop, setFormLoop] = useState({ key: formKey, frame: 0 });
  const formFrame = formLoop.key === formKey ? formLoop.frame : 0;
  useEffect(() => {
    const loop = window.setInterval(
      () =>
        setFormLoop((current) =>
          current.key === formKey
            ? { ...current, frame: current.frame === 0 ? 1 : 0 }
            : { key: formKey, frame: 1 },
        ),
      2000,
    );
    return () => window.clearInterval(loop);
  }, [formKey]);
  const exerciseDefinition = exerciseData.find((item) => item.name === exercise);
  const exerciseVisual = exerciseDefinition
    ? getExerciseVisual(exerciseDefinition, coachSex, formFrame)
    : undefined;
  const visualShape = getExerciseVisualShape(
    exerciseDefinition?.group ?? "Back",
  );
  const isPairedVisual = Boolean(
    (isFemaleCoach ? femalePairAtlasByGroup : malePairAtlasByGroup)[
      exerciseDefinition?.group ?? ""
    ],
  );

  const renderMotion = () => {
    switch (motion.mode) {
      case "vertical-pull":
        return (
          <>
            <UprightFormBase />
            <g className="form-loop-start-pose">
              <path className="form-loop-limb" d="M132 79 L105 52 L92 82" />
              <path className="form-loop-limb" d="M188 79 L215 52 L228 82" />
              <circle className="form-loop-joint" cx="105" cy="52" r="4" />
              <circle className="form-loop-joint" cx="215" cy="52" r="4" />
            </g>
            <g className="form-loop-work-pose">
              <path className="form-loop-limb active" d="M132 79 L112 116 L129 137" />
              <path className="form-loop-limb active" d="M188 79 L208 116 L191 137" />
              <circle className="form-loop-joint active" cx="112" cy="116" r="4" />
              <circle className="form-loop-joint active" cx="208" cy="116" r="4" />
            </g>
            <path className="form-loop-path" d="M95 85 C79 125 109 147 128 139 M225 85 C241 125 211 147 192 139" />
          </>
        );
      case "row":
        return (
          <>
            <g className="form-loop-row-base">
              <circle className="form-loop-head" cx="121" cy="70" r="16" />
              <path className="form-loop-torso" d="M132 84 L196 109 L179 151 L114 125 Z" />
              <path className="form-loop-leg" d="M177 149 L145 208 L127 222" />
              <path className="form-loop-leg" d="M181 150 L205 205 L222 217" />
              <path className="form-loop-foot" d="M127 222 L110 223 M222 217 L238 221" />
              <circle className="form-loop-joint" cx="132" cy="89" r="4" />
              <circle className="form-loop-joint" cx="179" cy="107" r="4" />
            </g>
            <g className="form-loop-start-pose">
              <path className="form-loop-limb" d="M132 89 L126 139 L145 169" />
              <path className="form-loop-limb" d="M179 107 L174 150 L192 172" />
            </g>
            <g className="form-loop-work-pose">
              <path className="form-loop-limb active" d="M132 89 L154 123 L178 120" />
              <path className="form-loop-limb active" d="M179 107 L164 136 L151 133" />
              <circle className="form-loop-joint active" cx="154" cy="123" r="4" />
            </g>
            <path className="form-loop-path" d="M145 168 C167 161 176 142 177 122" />
          </>
        );
      case "curl":
        return (
          <>
            <UprightFormBase />
            <g className="form-loop-start-pose">
              <path className="form-loop-limb" d="M132 80 L117 126 L117 158" />
              <path className="form-loop-limb" d="M188 80 L203 126 L203 158" />
            </g>
            <g className="form-loop-work-pose">
              <path className="form-loop-limb active" d="M132 80 L119 125 L143 103" />
              <path className="form-loop-limb active" d="M188 80 L201 125 L177 103" />
              <circle className="form-loop-joint active" cx="119" cy="125" r="4" />
              <circle className="form-loop-joint active" cx="201" cy="125" r="4" />
            </g>
            <path className="form-loop-path" d="M111 158 C95 121 117 97 143 103 M209 158 C225 121 203 97 177 103" />
          </>
        );
      case "squat":
        return (
          <>
            <g className="form-loop-squat-base">
              <circle className="form-loop-head" cx="160" cy="46" r="17" />
              <path className="form-loop-torso" d="M133 75 Q160 67 187 75 L196 140 Q160 151 124 140 Z" />
              <path className="form-loop-limb" d="M133 79 L108 117 L96 143 M187 79 L212 117 L224 143" />
              <circle className="form-loop-joint" cx="133" cy="79" r="4" />
              <circle className="form-loop-joint" cx="187" cy="79" r="4" />
            </g>
            <g className="form-loop-start-pose">
              <path className="form-loop-leg" d="M141 139 L136 210 L119 223" />
              <path className="form-loop-leg" d="M179 139 L184 210 L201 223" />
            </g>
            <g className="form-loop-work-pose">
              <path className="form-loop-leg active" d="M141 139 L112 167 L133 213" />
              <path className="form-loop-leg active" d="M179 139 L208 167 L187 213" />
              <circle className="form-loop-joint active" cx="112" cy="167" r="4" />
              <circle className="form-loop-joint active" cx="208" cy="167" r="4" />
            </g>
            <path className="form-loop-path" d="M139 209 C102 190 99 165 120 155 M181 209 C218 190 221 165 200 155" />
          </>
        );
      case "hinge":
        return (
          <>
            <g className="form-loop-hinge-base">
              <circle className="form-loop-head" cx="107" cy="92" r="16" />
              <path className="form-loop-torso" d="M121 105 L187 128 L171 164 L104 140 Z" />
              <path className="form-loop-leg" d="M171 160 L143 213 L124 223" />
              <path className="form-loop-leg" d="M177 162 L205 211 L223 220" />
              <path className="form-loop-foot" d="M123 223 L108 225 M224 220 L239 223" />
              <circle className="form-loop-joint" cx="121" cy="108" r="4" />
              <circle className="form-loop-joint" cx="187" cy="129" r="4" />
            </g>
            <g className="form-loop-start-pose">
              <path className="form-loop-limb" d="M121 108 L110 151 L132 177 M187 129 L172 164 L149 181" />
            </g>
            <g className="form-loop-work-pose">
              <path className="form-loop-limb active" d="M121 108 L145 131 L157 150 M187 129 L165 147 L153 161" />
            </g>
            <path className="form-loop-path" d="M102 144 C127 164 155 166 174 151" />
          </>
        );
      case "core":
        return (
          <>
            <g className="form-loop-core-base">
              <circle className="form-loop-head" cx="92" cy="143" r="16" />
              <path className="form-loop-torso" d="M105 132 L182 132 L194 165 L111 166 Z" />
              <path className="form-loop-leg" d="M181 157 L226 157 L244 177" />
              <path className="form-loop-leg" d="M180 164 L219 195 L238 196" />
              <path className="form-loop-foot" d="M244 177 L257 178 M238 196 L251 198" />
            </g>
            <g className="form-loop-start-pose">
              <path className="form-loop-limb" d="M111 138 L124 184 L112 210 M113 145 L150 186 L151 211" />
            </g>
            <g className="form-loop-work-pose">
              <path className="form-loop-limb active" d="M111 138 L134 110 L128 84 M113 145 L158 117 L171 91" />
              <circle className="form-loop-joint active" cx="134" cy="110" r="4" />
            </g>
            <path className="form-loop-path" d="M114 210 C100 161 112 113 128 85" />
          </>
        );
      case "cardio":
        return (
          <>
            <UprightFormBase />
            <g className="form-loop-start-pose">
              <path className="form-loop-limb" d="M132 80 L110 112 L96 137 M188 80 L206 108 L218 130" />
              <path className="form-loop-leg" d="M141 142 L133 206 L117 221 M179 142 L189 205 L209 215" />
            </g>
            <g className="form-loop-work-pose">
              <path className="form-loop-limb active" d="M132 80 L116 105 L137 126 M188 80 L207 110 L224 102" />
              <path className="form-loop-leg active" d="M141 142 L164 169 L157 207 M179 142 L161 173 L136 189" />
            </g>
            <path className="form-loop-path" d="M124 211 C151 196 166 178 157 151" />
          </>
        );
      case "horizontal-press":
      default:
        return (
          <>
            <g className="form-loop-press-base">
              <circle className="form-loop-head" cx="74" cy="160" r="16" />
              <path className="form-loop-torso" d="M91 143 L183 143 L198 177 L98 181 Z" />
              <path className="form-loop-leg" d="M184 171 L229 161 L248 181" />
              <path className="form-loop-leg" d="M181 177 L221 198 L240 198" />
              <path className="form-loop-foot" d="M248 181 L261 182 M240 198 L254 200" />
              <path className="form-loop-bench" d="M56 187 L202 187 M113 188 L101 218 M176 188 L191 218" />
              <circle className="form-loop-joint" cx="105" cy="148" r="4" />
              <circle className="form-loop-joint" cx="175" cy="148" r="4" />
            </g>
            <g className="form-loop-start-pose">
              <path className="form-loop-limb" d="M105 148 L119 106 L145 120 M175 148 L165 106 L143 120" />
            </g>
            <g className="form-loop-work-pose">
              <path className="form-loop-limb active" d="M105 148 L118 102 L131 64 M175 148 L164 102 L151 64" />
              <path className="form-loop-bar" d="M120 61 L162 61" />
              <circle className="form-loop-joint active" cx="118" cy="102" r="4" />
              <circle className="form-loop-joint active" cx="164" cy="102" r="4" />
            </g>
            <path className="form-loop-path" d="M144 121 C143 96 143 77 143 62" />
          </>
        );
    }
  };

  if (exerciseVisual) {
    return (
      <div className={`form-motion-loop motion-${motion.mode} real-form-motion`}>
        <div className="form-loop-title">
          <span>EXACT EXERCISE FORM</span>
          <b>{motion.label}</b>
        </div>
        <div
          className={`form-exercise-visual ${isPairedVisual ? "form-exercise-visual-paired" : ""} exercise-visual-shape-${visualShape}`}
          role="img"
          aria-label={exerciseVisual.alt}
        >
          <div
            className="form-exercise-photo"
            style={getExerciseVisualStyle(exerciseVisual)}
            key={formFrame}
          />
        </div>
        <div className="form-loop-keyframes" aria-hidden="true">
          <span>{formFrame === 0 ? "01" : "02"}&nbsp; {formFrame === 0 ? motion.start : motion.work}</span>
          <span>{formFrame === 0 ? "NEXT" : "LOOP"}&nbsp; {formFrame === 0 ? motion.work : motion.start}</span>
        </div>
      </div>
    );
  }

  const realForm = realFormSequences[motion.mode];
  if (realForm) {
    const realFormSource = isFemaleCoach && realForm.female ? realForm.female : realForm.male;

    return (
      <div className={`form-motion-loop motion-${motion.mode} real-form-motion`}>
        <div className="form-loop-title">
          <span>2 SEC REAL FORM LOOP</span>
          <b>{motion.label}</b>
        </div>
        <div
          className={`form-real-sequence form-real-${realForm.frame}`}
          role="img"
          aria-label={commonLabel}
        >
          <img
            src={realFormSource}
            alt={realForm.alt}
          />
        </div>
        <div className="form-loop-keyframes" aria-hidden="true">
          <span>01&nbsp; {motion.start}</span>
          <span>02&nbsp; {motion.work}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`form-motion-loop motion-${motion.mode}`}>
      <div className="form-loop-title">
        <span>2 SEC FORM LOOP</span>
        <b>{motion.label}</b>
      </div>
      <svg viewBox="0 0 320 250" role="img" aria-label={commonLabel}>
        <defs>
          <linearGradient id="form-loop-body" x1="0" x2="1">
            <stop stopColor="#718096" />
            <stop offset="0.48" stopColor="#e2e8f0" />
            <stop offset="1" stopColor="#596579" />
          </linearGradient>
          <filter id="form-loop-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path className="form-loop-floor" d="M43 229 H277" />
        {renderMotion()}
      </svg>
      <div className="form-loop-keyframes" aria-hidden="true">
        <span>01&nbsp; {motion.start}</span>
        <span>02&nbsp; {motion.work}</span>
      </div>
    </div>
  );
}

function LiveFormCoach({
  exercise,
  guide,
  activeSet,
  activeSetIndex,
  totalSets,
  isComplete,
  coachSex,
  onMarkSetDone,
}: {
  exercise: string;
  guide: ExerciseGuide;
  activeSet: WorkoutSet;
  activeSetIndex: number;
  totalSets: number;
  isComplete: boolean;
  coachSex: string;
  onMarkSetDone: () => void;
}) {
  const isWarmUp = activeSet.kind === "Warm-up" && !isComplete;
  const coachImage = coachImageForSex(coachSex);
  const coachLabel = coachLabelForSex(coachSex);
  const setTarget = activeSet.reps || (isWarmUp ? "10" : "8–12");
  const weightTarget = activeSet.weight || (isWarmUp ? "Light" : "45");

  return (
    <section className={`live-form-coach ${isWarmUp ? "warm-up" : ""}`}>
      <div className="form-coach-heading">
        <div>
          <span className="eyebrow">
            {isComplete
              ? "EXERCISE COMPLETE"
              : isWarmUp
                ? "WARM-UP FIRST"
                : "LIVE FORM COACH"}
          </span>
          <h2>{isComplete ? "Sets logged perfectly." : "Your next set"}</h2>
          <p>{exercise} · {guide.pattern} movement</p>
        </div>
        <div className="form-coach-set-count">
          <b>{Math.min(activeSetIndex + 1, totalSets)}</b>
          <span>OF {totalSets} SETS</span>
        </div>
      </div>

      <div className="form-coach-stage">
        <div className="form-coach-grid" />
        <div className="form-coach-reference">
          <img src={coachImage} alt={`${coachLabel} reference`} />
          <span>{coachLabel}</span>
        </div>
        <FormMotionLoop exercise={exercise} guide={guide} coachSex={coachSex} />
        <div className="form-coach-stage-label">
          <span>POSE CHECK</span>
          <b>{guide.cue}</b>
        </div>
      </div>

      <div className="form-coach-targets">
        <div>
          <span>{isWarmUp ? "PREP" : "LOAD"}</span>
          <b>{weightTarget}{isWarmUp ? " set" : " kg"}</b>
        </div>
        <div>
          <span>REPS</span>
          <b>{setTarget}</b>
        </div>
        <div>
          <span>EFFORT</span>
          <b>RIR {activeSet.rir || "2"}</b>
        </div>
      </div>

      <div className="form-coach-steps" aria-label="Exact exercise posture">
        {guide.steps.map((step, index) => (
          <div key={step} className={index === 1 && !isComplete ? "active" : ""}>
            <i>{index + 1}</i>
            <span>{step}</span>
          </div>
        ))}
      </div>

      <button
        className="form-coach-done"
        onClick={onMarkSetDone}
        disabled={isComplete}
      >
        <Check size={18} />
        {isComplete
          ? "Done"
          : `Mark set ${activeSetIndex + 1} done`}
      </button>
      <small className="form-coach-note">
        Log only when your posture matches the three checks above. Stop if you
        feel pain.
      </small>
    </section>
  );
}

function WarmupCoach({
  moves,
  coachSex,
  planFocus,
  onComplete,
}: {
  moves: WarmupMove[];
  coachSex: string;
  planFocus: string;
  onComplete: () => void;
}) {
  const [completedMoves, setCompletedMoves] = useState<number[]>([]);

  const activeIndex = Math.min(completedMoves.length, Math.max(0, moves.length - 1));
  const activeMove = moves[activeIndex];
  const allMovesDone = moves.length > 0 && completedMoves.length === moves.length;
  const warmupVisualShape =
    activeMove?.visualExercise.group === "Chest" ||
    activeMove?.visualExercise.group === "Quads"
      ? "warmup-reference-wide"
      : activeMove?.visualExercise.group === "Shoulders" ||
          activeMove?.visualExercise.group === "Triceps"
        ? "warmup-reference-medium"
        : "warmup-reference-tall";
  const startVisual = activeMove
    ? getExerciseVisual(activeMove.visualExercise, coachSex)
    : null;
  const finishVisual = activeMove
    ? getExerciseVisual(activeMove.visualExercise, coachSex, 1)
    : null;
  const markActiveMoveDone = () => {
    if (allMovesDone || !activeMove) return;
    setCompletedMoves((current) => [...current, activeIndex]);
  };

  if (!activeMove || !startVisual || !finishVisual) return null;

  return (
    <section className="warmup-coach" aria-label="Guided workout warm-up">
      <div className="warmup-hero">
        <div>
          <span className="eyebrow">PRE-WORKOUT WARM-UP</span>
          <h1>Prepare for {planFocus.toLowerCase()}.</h1>
          <p>
            Complete these {moves.length} focused moves before your first working
            set. They adapt to today&apos;s session and your available equipment.
          </p>
        </div>
        <div className="warmup-total">
          <Flame size={19} />
          <b>5–7 min</b>
          <span>SMART PREP</span>
        </div>
      </div>

      <div className="warmup-progress" aria-label={`${completedMoves.length} of ${moves.length} warm-up moves done`}>
        {moves.map((move, index) => (
          <div
            key={move.name}
            className={`${index === activeIndex && !allMovesDone ? "current" : ""} ${completedMoves.includes(index) ? "done" : ""}`}
          >
            <span>{completedMoves.includes(index) ? <Check size={14} /> : index + 1}</span>
            <b>{move.name}</b>
            <small>{move.duration}</small>
          </div>
        ))}
      </div>

      <article className="warmup-current-card">
        <div className={`warmup-reference-gallery ${warmupVisualShape}`}>
          <div
            className="warmup-reference-frame"
            style={getExerciseVisualStyle(startVisual)}
            role="img"
            aria-label={startVisual.alt}
          >
            <span>01 · START</span>
          </div>
          <div
            className="warmup-reference-frame"
            style={getExerciseVisualStyle(finishVisual)}
            role="img"
            aria-label={finishVisual.alt}
          >
            <span>02 · FINISH</span>
          </div>
          <div className="warmup-reference-caption">
            <span>FORM REFERENCE</span>
            <b>{activeMove.visualExercise.name}</b>
          </div>
        </div>
        <div className="warmup-current-copy">
          <span className="eyebrow">
            {allMovesDone ? "WARM-UP COMPLETE" : `MOVE ${String(activeIndex + 1).padStart(2, "0")} OF ${String(moves.length).padStart(2, "0")}`}
          </span>
          <h2>{allMovesDone ? "Your body is ready." : activeMove.name}</h2>
          <div className="warmup-facts">
            <span><Clock3 size={15} /> {activeMove.duration}</span>
            <span><Target size={15} /> {activeMove.target}</span>
          </div>
          <p>{allMovesDone ? "Your main workout is unlocked. Start with a controlled first set." : activeMove.cue}</p>
          <small className="warmup-equipment">
            <Dumbbell size={14} /> {allMovesDone ? "Ready for your planned equipment" : activeMove.equipmentNote}
          </small>
          {allMovesDone ? (
            <button className="primary-button warmup-start-button" onClick={onComplete}>
              Start main workout <ArrowRight size={18} />
            </button>
          ) : (
            <button className="warmup-done-button" onClick={markActiveMoveDone}>
              <Check size={18} /> Mark warm-up move done
            </button>
          )}
        </div>
      </article>
      <p className="warmup-safety-note">
        Warm up without pain. Reduce the range or skip any movement that does not feel right today.
      </p>
    </section>
  );
}

type WorkoutPageProps = {
  workoutOpen: boolean;
  setWorkoutOpen: (value: boolean) => void;
  activeExercise: string;
  setActiveExercise: (exercise: string) => void;
  sets: WorkoutSet[];
  completedSets: number;
  exerciseProgress: Record<string, { completed: number; total: number }>;
  updateSet: (
    id: number,
    field: keyof Omit<WorkoutSet, "id" | "done">,
    value: string,
  ) => void;
  finishSet: (id: number) => void;
  addSet: (kind?: SetKind) => void;
  removeSet: (id: number) => void;
  onReplaceExercise: (currentExercise: string, replacement: string) => void;
  timerLabel: string;
  isTimerRunning: boolean;
  setIsTimerRunning: (value: boolean) => void;
  setTimer: (value: number) => void;
  setToast: (value: string) => void;
  trainingGoal: TrainingGoal;
  workoutExercises: string[];
  workoutLogs: WorkoutLog[];
  weeklyPlan: WeeklyPlan | null;
  selectedScheduleDayId: string | null;
  onSelectScheduleDay: (day: ScheduleDay) => void;
  planTitle: string;
  planFocus: string;
  planMinutes: string;
  coachSex: string;
  equipment: string[];
  warmupComplete: boolean;
  onCompleteWarmup: () => void;
  onStartWorkout: () => void;
  onFinish: () => void;
};

function WorkoutPage({
  workoutOpen,
  setWorkoutOpen,
  activeExercise,
  setActiveExercise,
  sets,
  completedSets,
  exerciseProgress,
  updateSet,
  finishSet,
  addSet,
  removeSet,
  onReplaceExercise,
  timerLabel,
  isTimerRunning,
  setIsTimerRunning,
  setTimer,
  setToast,
  trainingGoal,
  workoutExercises,
  workoutLogs,
  weeklyPlan,
  selectedScheduleDayId,
  onSelectScheduleDay,
  planTitle,
  planFocus,
  planMinutes,
  coachSex,
  equipment,
  warmupComplete,
  onCompleteWarmup,
  onStartWorkout,
  onFinish,
}: WorkoutPageProps) {
  const [showReplacements, setShowReplacements] = useState(false);
  const [exerciseNote, setExerciseNote] = useState("");
  const activeInfo = exerciseData.find(
    (exercise) => exercise.name === activeExercise,
  );
  const activeGuide =
    guideByGroup[activeInfo?.group ?? "Chest"] ?? guideByGroup.Chest;
  const nextCoachSet = sets.find((set) => !set.done) ?? sets.at(-1);
  const coachSet = nextCoachSet ?? createStarterSets()[0];
  const coachSetIndex = Math.max(
    0,
    sets.findIndex((set) => set.id === coachSet.id),
  );
  const coachComplete = sets.length > 0 && sets.every((set) => set.done);
  const alternatives = exerciseData
    .filter(
      (exercise) =>
        exercise.group === activeInfo?.group &&
        exercise.name !== activeExercise &&
        isExerciseAvailable(exercise, equipment),
    )
    .slice(0, 4);
  const workingSets = sets.filter((set) => set.kind === "Working");
  const earnedProgression =
    workingSets.length >= 2 &&
    workingSets.every(
      (set) => set.done && Number(set.reps) >= 12 && Number(set.rir) <= 2,
    );
  const lastWorkingWeight = Number(workingSets.at(-1)?.weight ?? 0);
  const hasRecordedSession = workoutLogs.some((workout) =>
    workout.exercises.includes(activeExercise),
  );
  const warmupMoves = useMemo(
    () => buildWarmupMoves(workoutExercises, equipment),
    [workoutExercises, equipment],
  );
  const selectedScheduleDay = weeklyPlan?.days.find(
    (day) => day.id === (selectedScheduleDayId ?? weeklyPlan.currentPlanId),
  );
  const startLabel =
    selectedScheduleDay?.label === "Today"
      ? "Start today's workout"
      : `Start ${selectedScheduleDay?.label.toLowerCase() ?? "planned"} workout`;
  const exitWorkout = () => {
    setWorkoutOpen(false);
    setToast(`${trainingGoal} workout saved as draft.`);
  };
  return (
    <div className="page workout-page">
      {!workoutOpen ? (
        <>
          <section className="page-title">
            <div>
              <span className="eyebrow">YOUR PLAN</span>
              <h1>
                This week’s <span>training.</span>
              </h1>
              <p>Built around your schedule, recovery, and goals.</p>
            </div>
            <button
              className="primary-button"
              onClick={onStartWorkout}
            >
              <Play size={18} fill="currentColor" /> {startLabel}
            </button>
          </section>
          <div className="plan-overview" aria-label="Your seven-day schedule">
            {weeklyPlan?.days.map((day) => {
              const isSelected =
                day.kind === "Workout" &&
                day.id === (selectedScheduleDayId ?? weeklyPlan.currentPlanId);
              return (
                <button
                  key={day.id}
                  className={`plan-day ${isSelected ? "selected" : ""} ${day.kind === "Recovery" ? "recovery" : ""}`}
                  onClick={() => onSelectScheduleDay(day)}
                >
                  <span>{day.label}</span>
                  <b>{day.title}</b>
                  <small>{day.focus}</small>
                  {day.kind === "Workout" ? (
                    <Dumbbell size={17} />
                  ) : (
                    <Leaf size={17} />
                  )}
                </button>
              );
            })}
          </div>
          <section className="workout-preview card">
            <div className="preview-header">
              <div>
                <span className="eyebrow">UP NEXT</span>
                <h2>{planTitle}</h2>
                <p>
                  {planFocus} <b>•</b> {planMinutes}
                </p>
              </div>
              <Ring
                value={Math.round((workoutExercises.length / 9) * 100)}
                label={`${workoutExercises.length}`}
                sublabel="EXERCISES"
              />
            </div>
            <div className="exercise-preview-list">
              {workoutExercises.slice(0, 4).map((exercise, index) => (
                <div key={exercise}>
                  <span className="exercise-number">0{index + 1}</span>
                  <div className={`exercise-illustration ill-${index}`}>
                    <Dumbbell size={19} />
                  </div>
                  <div>
                    <strong>{exercise}</strong>
                    <small>
                      {index < 2 ? "4 sets · 8–12 reps" : "3 sets · 10–15 reps"}
                    </small>
                  </div>
                  <MoreHorizontal size={20} />
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="active-workout">
          <header className="workout-head">
            <button className="back-button" onClick={exitWorkout}>
              <ChevronLeft size={21} /> Save & exit
            </button>
            <div className="workout-running">
              <span className="pulse-dot" /> {warmupComplete ? "WORKOUT IN PROGRESS" : "WARM-UP IN PROGRESS"}
            </div>
            <button className="finish-button" onClick={warmupComplete ? onFinish : exitWorkout}>
              {warmupComplete ? "Finish" : "Save & exit"}
            </button>
          </header>
          {!warmupComplete ? (
            <WarmupCoach
              moves={warmupMoves}
              coachSex={coachSex}
              planFocus={planFocus}
              onComplete={onCompleteWarmup}
            />
          ) : (
            <>
              <div className="workout-progress">
                <span
                  style={{ width: `${(completedSets / sets.length) * 100}%` }}
                />
                <b>
                  {completedSets} of {sets.length} sets complete
                </b>
              </div>
              <div className="active-grid">
            <aside className="exercise-rail">
              <span className="eyebrow">{planFocus.toUpperCase()}</span>
              {workoutExercises.map((exercise, index) =>
                (() => {
                  const progress = exerciseProgress[exercise];
                  const isComplete =
                    Boolean(progress?.total) &&
                    progress.completed === progress.total;
                  return (
                    <button
                      key={exercise}
                      className={`${activeExercise === exercise ? "current" : ""} ${isComplete ? "complete" : ""}`}
                      onClick={() => setActiveExercise(exercise)}
                    >
                      <span>
                        {isComplete ? <Check size={15} /> : index + 1}
                      </span>
                      <div>
                        <b>{exercise}</b>
                        <small>
                          {progress?.total
                            ? `${progress.completed}/${progress.total} sets done`
                            : activeExercise === exercise
                              ? "Ready to log"
                              : "Not started"}
                        </small>
                      </div>
                    </button>
                  );
                })(),
              )}
            </aside>
            <div className="exercise-workspace">
              <div className="exercise-session-title">
                <div>
                  <span className="eyebrow">
                    EXERCISE{" "}
                    {String(
                      Math.max(1, workoutExercises.indexOf(activeExercise) + 1),
                    ).padStart(2, "0")}{" "}
                    OF {String(workoutExercises.length).padStart(2, "0")}
                  </span>
                  <h1>{activeExercise}</h1>
                  <p>Keep your elbows close and control the return.</p>
                </div>
                <button
                  className="icon-button"
                  onClick={() =>
                    setToast(
                      "Use a controlled range of motion and stop if you feel pain.",
                    )
                  }
                  aria-label="Exercise help"
                >
                  <CircleHelp size={20} />
                </button>
              </div>
              <LiveFormCoach
                exercise={activeExercise}
                guide={activeGuide}
                activeSet={coachSet}
                activeSetIndex={coachSetIndex}
                totalSets={sets.length}
                isComplete={coachComplete}
                coachSex={coachSex}
                onMarkSetDone={() => {
                  if (!coachComplete) finishSet(coachSet.id);
                }}
              />
              <div className="previous-performance">
                <div className="previous-icon">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <span>LAST TIME</span>
                  <b>
                    {hasRecordedSession
                      ? "Session recorded"
                      : "No recorded working sets yet"}
                  </b>
                  <small>
                    {hasRecordedSession
                      ? "Use your recent session as the reference for a small, controlled increase."
                      : "Complete this exercise to unlock a personal progression target."}
                  </small>
                </div>
                <button
                  onClick={() =>
                    setToast(
                      "Your latest completed sessions are shown in Progress.",
                    )
                  }
                >
                  History <ArrowRight size={15} />
                </button>
              </div>
              <div className="workout-intelligence-strip">
                <div>
                  <span className="eyebrow">PROGRESSIVE OVERLOAD</span>
                  <b>
                    {earnedProgression
                      ? `Great work — next session try ${(lastWorkingWeight + 2.5).toFixed(1)} kg for 8–10 reps.`
                      : `Today’s target: ${lastWorkingWeight || 45} kg · build toward 3 × 12 with RIR 1–2.`}
                  </b>
                </div>
                <div className="workout-utility-actions">
                  <button
                    onClick={() => setShowReplacements(!showReplacements)}
                  >
                    Replace exercise
                  </button>
                  <button
                    onClick={() =>
                      setToast(
                        `Plate guide for ${lastWorkingWeight || 45} kg: use the bar plus balanced plates on both sides.`,
                      )
                    }
                  >
                    Plate calculator
                  </button>
                </div>
              </div>
              {showReplacements && (
                <div className="replacement-panel">
                  <div>
                    <span className="eyebrow">SIMILAR ALTERNATIVES</span>
                    <b>Keep the same movement pattern and target muscles.</b>
                  </div>
                  {alternatives.length ? (
                    alternatives.map((exercise, index) => (
                      <button
                        key={exercise.name}
                        onClick={() => {
                          onReplaceExercise(activeExercise, exercise.name);
                          setShowReplacements(false);
                        }}
                      >
                        <span>{exercise.name}</span>
                        <small>
                          {94 - index * 5}% match · {exercise.equipment}
                        </small>
                        <ArrowRight size={14} />
                      </button>
                    ))
                  ) : (
                    <p>No close match is available for this exercise.</p>
                  )}
                </div>
              )}
              <div className="set-table">
                <div className="set-table-head">
                  <span>SET</span>
                  <span>
                    WEIGHT <small>kg</small>
                  </span>
                  <span>REPS</span>
                  <span>RIR / RPE</span>
                  <span />
                </div>
                {sets.map((set) => (
                  <div
                    className={`set-row ${set.done ? "complete" : ""}`}
                    key={set.id}
                  >
                    <span className="set-count">
                      <b>{set.done ? <Check size={16} /> : set.id}</b>
                      <small>{set.kind}</small>
                    </span>
                    <input
                      value={set.weight}
                      onChange={(event) =>
                        updateSet(set.id, "weight", event.target.value)
                      }
                      inputMode="decimal"
                      aria-label={`Set ${set.id} weight`}
                    />
                    <input
                      value={set.reps}
                      onChange={(event) =>
                        updateSet(set.id, "reps", event.target.value)
                      }
                      inputMode="numeric"
                      aria-label={`Set ${set.id} reps`}
                    />
                    <div className="rir-select">
                      <input
                        value={set.rir}
                        onChange={(event) =>
                          updateSet(set.id, "rir", event.target.value)
                        }
                        inputMode="numeric"
                        aria-label={`Set ${set.id} RIR`}
                      />
                      <button
                        className="rpe-chip"
                        onClick={() =>
                          updateSet(
                            set.id,
                            "rpe",
                            String(Math.min(10, Number(set.rpe || 7) + 1)),
                          )
                        }
                      >
                        RPE {set.rpe || 7}
                      </button>
                    </div>
                    <div className="set-actions">
                      <button
                        className="set-check"
                        onClick={() => finishSet(set.id)}
                      >
                        {set.done ? <Check size={18} /> : <span>Done</span>}
                      </button>
                      <button
                        className="set-remove"
                        onClick={() => removeSet(set.id)}
                        aria-label={`Remove set ${set.id}`}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="set-builder">
                <span className="eyebrow">ADD SET TYPE</span>
                <div>
                  {(
                    ["Warm-up", "Working", "Drop set", "Superset"] as SetKind[]
                  ).map((kind) => (
                    <button key={kind} onClick={() => addSet(kind)}>
                      {kind}
                    </button>
                  ))}
                  <button
                    className="remove-set"
                    onClick={() => removeSet(sets.at(-1)?.id ?? 1)}
                  >
                    Remove last set
                  </button>
                </div>
              </div>
              <div className="set-notes">
                <span>
                  <TimerReset size={17} /> 2:00 rest recommended
                </span>
                <input
                  value={exerciseNote}
                  onChange={(event) => setExerciseNote(event.target.value)}
                  placeholder="Add exercise note"
                  aria-label="Exercise note"
                />
                <button
                  onClick={() =>
                    setToast(
                      exerciseNote.trim()
                        ? "Exercise note saved for this session."
                        : "Add a note before saving.",
                    )
                  }
                >
                  Save note
                </button>
              </div>
            </div>
            <aside className="rest-timer">
              <span className="eyebrow">REST TIMER</span>
              <div className="timer-orb">
                <div>
                  <TimerReset size={21} />
                  <b>{timerLabel}</b>
                  <small>remaining</small>
                </div>
              </div>
              <button
                className="timer-toggle"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
              >
                {isTimerRunning ? "Pause timer" : "Start timer"}
              </button>
              <button
                className="timer-add"
                onClick={() =>
                  setTimer(
                    Math.min(
                      599,
                      Number(timerLabel.split(":")[0]) * 60 +
                        Number(timerLabel.split(":")[1]) +
                        30,
                    ),
                  )
                }
              >
                + 30 sec
              </button>
              <button
                className="skip-rest"
                onClick={() => {
                  setTimer(0);
                  setIsTimerRunning(false);
                }}
              >
                Skip rest
              </button>
            </aside>
          </div>
          </>
          )}
        </section>
      )}
    </div>
  );
}

/* Original compact library layout.
function ExplorePage({ search, setSearch, exercises, setActiveExercise, startWorkout }: { search: string; setSearch: (search: string) => void; exercises: typeof exerciseData; setActiveExercise: (exercise: string) => void; startWorkout: () => void }) {
  const [filter, setFilter] = useState('All exercises')
  const visible = filter === 'All exercises' ? exercises : exercises.filter((item) => item.group === filter)
  return <div className="page explore-page"><section className="page-title"><div><span className="eyebrow">EXERCISE LIBRARY</span><h1>Train with <span>intent.</span></h1><p>Explore your library, learn each movement, and build better sessions.</p></div><div className="explore-count"><b>248</b><span>guided exercises</span></div></section><div className="explore-toolbar"><div className="search-box"><Search size={19} /><input placeholder="Search exercises, muscles, equipment…" value={search} onChange={(e) => setSearch(e.target.value)} /><button onClick={() => setSearch('')}><X size={16} /></button></div><button className="filter-button"><Settings2 size={17} /> Filters</button></div><div className="filters">{['All exercises', 'Back', 'Biceps', 'Quads', 'Chest', 'Bodyweight'].map((item) => <button key={item} className={filter === item ? 'selected' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div><div className="explore-layout"><section><div className="library-label"><h3>{filter}</h3><span>{visible.length || 0} movements</span></div><div className="exercise-grid">{visible.map((exercise) => <article className="exercise-card" key={exercise.name}><div className={`exercise-art ${exercise.accent}`}><span>{exercise.icon}</span><Dumbbell size={25} /></div><div className="exercise-card-copy"><span>{exercise.group} · {exercise.equipment}</span><h3>{exercise.name}</h3><div><i className={`level-dot ${exercise.level.toLowerCase()}`} /> {exercise.level}<button onClick={() => { setActiveExercise(exercise.name); startWorkout() }}><Plus size={17} /></button></div></div></article>)}</div>{visible.length === 0 && <div className="empty-state"><Search size={25} /><h3>No exercises found</h3><p>Try a broader muscle group or equipment type.</p></div>}</section><aside className="body-map-card"><div><span className="eyebrow">RECOVERY MAP</span><h2>What’s ready?</h2><p>Your weekly work and recovery, in one view.</p></div><div className="body-map-full"><BodyFigure /></div><div className="map-legend"><span><i className="status-dot ready" /> Ready</span><span><i className="status-dot resting" /> Recovering</span><span><i className="status-dot priority" /> Priority</span></div><button onClick={startWorkout}>Build today’s workout <ArrowRight size={16} /></button></aside></div></div>
}

*/

function ExplorePage({
  search,
  setSearch,
  exercises,
  onAddExercise,
  onPreviewExercise,
  trainingGoal,
  coachSex,
}: {
  search: string;
  setSearch: (search: string) => void;
  exercises: Exercise[];
  onAddExercise: (exercise: string) => void;
  onPreviewExercise: (exercise: Exercise) => void;
  trainingGoal: TrainingGoal;
  coachSex: string;
}) {
  const [filter, setFilter] = useState("All exercises");
  const [goalOnly, setGoalOnly] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<TrainingGoal>(trainingGoal);
  const matchingGroup =
    filter === "All exercises"
      ? exercises
      : exercises.filter((item) => item.group === filter);
  const searchTerm = search.trim().toLowerCase();
  const searchedGroup = searchTerm
    ? matchingGroup.filter((item) =>
        `${item.name} ${item.group} ${item.equipment}`
          .toLowerCase()
          .includes(searchTerm),
      )
    : matchingGroup;
  const visible = goalOnly
    ? searchedGroup.filter((item) => item.goals.includes(selectedGoal))
    : searchedGroup;
  const goalTitle =
    selectedGoal === "Lose weight"
      ? "Fat-loss movement plan"
      : selectedGoal === "Increase strength"
        ? "Strength-first movement plan"
        : "Muscle-building movement plan";
  const goalDescription =
    selectedGoal === "Lose weight"
      ? "Compound lifts, low-impact cardio, and conditioning options selected to help you stay active while preserving strength."
      : selectedGoal === "Increase strength"
        ? "Prioritize stable compound movements, progressive loading, and skill practice for your main lifts."
      : "A complete exercise library with enough choices for every major muscle group and your available equipment.";
  const workoutCollections = muscleGroups.map((group) => {
    const firstExercise = exerciseData.find((exercise) => exercise.group === group);
    const collectionVisual = getExerciseVisual(
      firstExercise ?? exerciseData[0],
      coachSex,
    );
    const count = exerciseData.filter((exercise) => exercise.group === group).length;

    return {
      group,
      count,
      visual: collectionVisual,
      visualShape: getExerciseVisualShape(group),
      title: group === "Fat loss cardio" ? "Cardio workout" : `${group} workout`,
    };
  });
  const chooseWorkoutCollection = (group: string) => {
    setFilter(group);
    setGoalOnly(false);
    setSearch("");
    window.setTimeout(() => {
      document
        .getElementById("exercise-library")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  return (
    <div className="page explore-page">
      <section className="page-title">
        <div>
          <span className="eyebrow">EXERCISE LIBRARY</span>
          <h1>
            Train with <span>intent.</span>
          </h1>
          <p>Over 90 guided movements across every major muscle group.</p>
        </div>
        <div className="explore-count">
          <b>{exerciseData.length}</b>
          <span>guided exercises</span>
        </div>
      </section>
      <section className="explore-body-start">
        <div>
          <span className="eyebrow">START WITH THE BODY</span>
          <h2>What do you want to train?</h2>
          <p>
            Tap a body region to focus the exercise library. Every movement
            includes form, muscles, and alternatives.
          </p>
        </div>
        <div className="explore-body-picker">
          <BodyFigure sex={coachSex} />
          <div>
            {muscleGroups.map((group) => (
              <button
                key={group}
                className={filter === group ? "selected" : ""}
                onClick={() => chooseWorkoutCollection(group)}
              >
                {group}
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="goal-library-card">
        <div className="goal-library-icon">
          <Flame size={22} />
        </div>
        <div>
          <span className="eyebrow">
            PERSONALIZED FOR {selectedGoal.toUpperCase()}
          </span>
          <h2>{goalTitle}</h2>
          <p>{goalDescription}</p>
          <div className="goal-chips">
            {allGoals.map((goal) => (
              <button
                key={goal}
                className={selectedGoal === goal ? "selected" : ""}
                onClick={() => {
                  setSelectedGoal(goal);
                  setGoalOnly(true);
                }}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>
        <button
          className={goalOnly ? "goal-toggle selected" : "goal-toggle"}
          onClick={() => setGoalOnly(!goalOnly)}
        >
          {goalOnly ? "Showing my plan" : "Show all"} <ChevronRight size={16} />
        </button>
      </section>
      <section className="workout-collection-section" aria-label="Workout collections">
        <div className="workout-collection-heading">
          <div>
            <span className="eyebrow">CHOOSE A WORKOUT</span>
            <h2>Train a body part</h2>
          </div>
          <p>Each workout has its own methods and form guides.</p>
        </div>
        <div className="workout-collection-list">
          {workoutCollections.map((collection) => (
            <button
              key={collection.group}
              className={filter === collection.group ? "selected" : ""}
              onClick={() => chooseWorkoutCollection(collection.group)}
            >
              <div className="workout-collection-visual" aria-hidden="true">
                <div
                  className={`workout-collection-photo exercise-visual-shape-${collection.visualShape}`}
                  style={getExerciseVisualStyle(collection.visual)}
                />
              </div>
              <span>
                <b>{collection.title}</b>
                <small>{collection.count} exercise methods</small>
              </span>
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          ))}
        </div>
      </section>
      <div className="explore-toolbar">
        <div className="search-box">
          <Search size={19} />
          <input
            placeholder="Search exercises, muscles, equipment…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={() => setSearch("")} aria-label="Clear search">
            <X size={16} />
          </button>
        </div>
        <button
          className="filter-button"
          onClick={() => setGoalOnly((current) => !current)}
          aria-pressed={goalOnly}
        >
          <Settings2 size={17} /> {goalOnly ? "My plan" : "All moves"}
        </button>
      </div>
      <div className="filters">
        {["All exercises", ...muscleGroups].map((item) => (
          <button
            key={item}
            className={filter === item ? "selected" : ""}
            onClick={() => chooseWorkoutCollection(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="explore-layout" id="exercise-library">
        <section>
          <div className="library-label">
            <h3>{goalOnly ? `${selectedGoal} picks · ${filter}` : filter}</h3>
            <span>{visible.length} movements</span>
          </div>
          <div className="exercise-grid">
            {visible.map((exercise) => {
              const exerciseVisual = getExerciseVisual(exercise, coachSex);
              const visualShape = getExerciseVisualShape(exercise.group);
              return (
                  <article
                    className="exercise-card"
                    key={exercise.name}
                    role="button"
                    tabIndex={0}
                    onClick={() => onPreviewExercise(exercise)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onPreviewExercise(exercise);
                      }
                    }}
                    aria-label={`View ${exercise.name} form guide`}
                  >
                    <div className={`exercise-art ${exercise.accent}`}>
                      <div
                        className={`exercise-art-photo exercise-visual-shape-${visualShape}`}
                        style={getExerciseVisualStyle(exerciseVisual)}
                        aria-hidden="true"
                      />
                      <span>{exercise.icon}</span>
                      <Dumbbell size={25} />
                    </div>
                <div className="exercise-card-copy">
                  <span>
                    {exercise.group} · {exercise.equipment}
                  </span>
                  <h3>{exercise.name}</h3>
                  <div>
                    <i
                      className={`level-dot ${exercise.level.toLowerCase()}`}
                    />{" "}
                    {exercise.level}
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        onAddExercise(exercise.name);
                      }}
                      aria-label={`Add ${exercise.name} to workout`}
                    >
                      <Plus size={17} />
                    </button>
                  </div>
                </div>
                  </article>
              );
            })}
          </div>
          {visible.length === 0 && (
            <div className="empty-state">
              <Search size={25} />
              <h3>No matching exercises</h3>
              <p>Show the full library or choose a different muscle group.</p>
            </div>
          )}
        </section>
        <aside className="body-map-card">
          <div>
            <span className="eyebrow">RECOVERY MAP</span>
            <h2>What’s ready?</h2>
            <p>Your weekly work and recovery, in one view.</p>
          </div>
          <div className="body-map-full">
            <BodyFigure sex={coachSex} />
          </div>
          <div className="map-legend">
            <span>
              <i className="status-dot ready" /> Ready
            </span>
            <span>
              <i className="status-dot resting" /> Recovering
            </span>
            <span>
              <i className="status-dot priority" /> Priority
            </span>
          </div>
          <button
            onClick={() =>
              onAddExercise(visible[0]?.name ?? exerciseData[0].name)
            }
          >
            Build today’s workout <ArrowRight size={16} />
          </button>
        </aside>
      </div>
    </div>
  );
}

function ProgressPage() {
  return (
    <div className="page progress-page">
      <section className="page-title">
        <div>
          <span className="eyebrow">YOUR PROGRESS</span>
          <h1>
            Proof you’re <span>growing.</span>
          </h1>
          <p>Small actions, compounded over time.</p>
        </div>
        <button className="date-filter">
          Last 12 weeks <ChevronDown size={16} />
        </button>
      </section>
      <div className="stat-strip">
        <Stat
          icon={<Trophy size={20} />}
          title="Workout streak"
          value="12 days"
          detail="Personal best"
          tone="lime"
        />
        <Stat
          icon={<Dumbbell size={20} />}
          title="Total volume"
          value="84,240 kg"
          detail="↑ 16% this month"
          tone="purple"
        />
        <Stat
          icon={<Flame size={20} />}
          title="Training days"
          value="14 / 16"
          detail="88% consistency"
          tone="orange"
        />
        <Stat
          icon={<HeartPulse size={20} />}
          title="Avg. readiness"
          value="79%"
          detail="↑ 4% this month"
          tone="blue"
        />
      </div>
      <section className="progress-grid">
        <div className="card weight-chart">
          <div className="chart-heading">
            <div>
              <span className="eyebrow">BODY WEIGHT</span>
              <h3>
                80.2 <small>kg</small>{" "}
                <em>
                  <ArrowDownRight size={15} /> 0.3 kg
                </em>
              </h3>
            </div>
            <button className="chart-menu">
              <MoreHorizontal size={20} />
            </button>
          </div>
          <div className="chart-area">
            <div className="y-labels">
              <span>82</span>
              <span>81</span>
              <span>80</span>
              <span>79</span>
            </div>
            <svg
              viewBox="0 0 620 205"
              preserveAspectRatio="none"
              aria-label="Body weight trend"
              role="img"
            >
              <defs>
                <linearGradient id="weightFill" x1="0" x2="0" y1="0" y2="1">
                  <stop stopColor="#ff4747" stopOpacity=".30" />
                  <stop offset="1" stopColor="#ff4747" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,35 C35,25 58,50 88,45 S130,76 165,65 S210,84 244,75 S294,113 330,98 S375,121 413,111 S465,147 498,136 S548,153 620,166 L620,205 L0,205Z"
                fill="url(#weightFill)"
              />
              <path
                d="M0,35 C35,25 58,50 88,45 S130,76 165,65 S210,84 244,75 S294,113 330,98 S375,121 413,111 S465,147 498,136 S548,153 620,166"
                fill="none"
                stroke="#ff4747"
                strokeWidth="3"
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx="498"
                cy="136"
                r="5"
                fill="#17181b"
                stroke="#ff4747"
                strokeWidth="3"
              />
            </svg>
            <div className="x-labels">
              <span>May 30</span>
              <span>Jun 13</span>
              <span>Jun 27</span>
              <span>Jul 11</span>
              <span>Jul 25</span>
              <span>Aug 8</span>
            </div>
          </div>
          <div className="chart-footer">
            <span>7-day average</span>
            <b>
              Goal: 78.0 kg <ArrowRight size={14} />
            </b>
          </div>
        </div>
        <div className="card strength-card">
          <div className="card-heading">
            <div>
              <span className="eyebrow">STRENGTH PROGRESS</span>
              <h3>Top lifts</h3>
            </div>
            <button className="circle-arrow">
              <ArrowRight size={17} />
            </button>
          </div>
          <Strength
            name="Bench press"
            value="80 kg"
            change="+5 kg"
            width={85}
          />
          <Strength
            name="Barbell row"
            value="75 kg"
            change="+7.5 kg"
            width={78}
          />
          <Strength name="Squat" value="100 kg" change="+10 kg" width={100} />
        </div>
        <div className="card adherence-card">
          <span className="eyebrow">NUTRITION ADHERENCE</span>
          <h3>
            You fuelled your goal <span>5 days</span> this week.
          </h3>
          <div className="adherence-days">
            {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
              <div
                key={`${day}${index}`}
                className={index < 5 ? "hit" : index === 5 ? "near" : ""}
              >
                <i>
                  {index < 5 ? <Check size={15} /> : index === 5 ? "82%" : "—"}
                </i>
                <span>{day}</span>
              </div>
            ))}
          </div>
          <p>
            <Leaf size={16} /> Keep averaging 90%+ to stay on pace.
          </p>
        </div>
        <div className="card records-card">
          <div className="card-heading">
            <div>
              <span className="eyebrow">PERSONAL RECORDS</span>
              <h3>
                Three new wins <span>this month.</span>
              </h3>
            </div>
            <Trophy size={23} />
          </div>
          <div className="record-list">
            <Record name="Bench Press" value="80 kg × 8" date="Aug 16" />
            <Record name="Lat Pulldown" value="65 kg × 12" date="Aug 13" />
            <Record name="Squat" value="100 kg × 5" date="Aug 8" />
          </div>
        </div>
      </section>
    </div>
  );
}

function LegacyFunctionalProgressPage({
  customer,
  workoutLogs,
  nutrition,
}: {
  customer: CustomerProfile;
  workoutLogs: WorkoutLog[];
  nutrition: NutritionTargets;
}) {
  const sevenDaysAgo = APP_NOW - 7 * 24 * 60 * 60 * 1000;
  const weekly = workoutLogs.filter(
    (workout) => new Date(workout.date).getTime() >= sevenDaysAgo,
  );
  const weeklyVolume = weekly.reduce(
    (total, workout) => total + workout.volume,
    0,
  );
  const totalSets = workoutLogs.reduce(
    (total, workout) => total + workout.completedSets,
    0,
  );
  const checkIns = customer.checkIns ?? [];
  const priorWeight =
    checkIns.length > 1
      ? Number(checkIns[checkIns.length - 2].weight)
      : Number(customer.weight);
  const change = Number(customer.weight) - priorWeight;
  return (
    <>
      <div className="legacy-profile-hidden">
        <ProgressPage />
      </div>
      <div className="page functional-progress-page">
        <section className="page-title">
          <div>
            <span className="eyebrow">LIVE PROGRESS</span>
            <h1>
              Every session <span>counts.</span>
            </h1>
            <p>
              Real workout, body-weight, and nutrition estimates saved on this
              device.
            </p>
          </div>
          <div className="progress-weight-badge">
            <span>Current weight</span>
            <b>{customer.weight} kg</b>
            <small>
              {change === 0
                ? "No previous check-in"
                : `${change > 0 ? "+" : ""}${change.toFixed(1)} kg from previous`}
            </small>
          </div>
        </section>
        <section className="functional-stats">
          <Stat
            icon={<Dumbbell size={20} />}
            title="Workouts saved"
            value={String(workoutLogs.length)}
            detail={`${weekly.length} this week`}
            tone="lime"
          />
          <Stat
            icon={<Flame size={20} />}
            title="Completed sets"
            value={String(totalSets)}
            detail="Across all logged workouts"
            tone="orange"
          />
          <Stat
            icon={<BarChart3 size={20} />}
            title="Weekly volume"
            value={`${Math.round(weeklyVolume).toLocaleString()} kg`}
            detail="From completed working sets"
            tone="purple"
          />
          <Stat
            icon={<Utensils size={20} />}
            title="Protein target"
            value={`${nutrition.protein} g`}
            detail="Calculated from current weight"
            tone="blue"
          />
        </section>
        <section className="progress-live-grid">
          <div className="profile-dynamic-card progress-session-list">
            <div>
              <span className="eyebrow">COMPLETED WORKOUTS</span>
              <h2>Session history</h2>
            </div>
            {workoutLogs.length ? (
              <div>
                {workoutLogs.map((workout) => (
                  <article key={workout.id}>
                    <div className="session-date">
                      <b>{new Date(workout.date).getDate()}</b>
                      <span>
                        {new Date(workout.date).toLocaleDateString(undefined, {
                          month: "short",
                        })}
                      </span>
                    </div>
                    <div>
                      <b>{workout.title}</b>
                      <span>{workout.exercises.join(" · ")}</span>
                    </div>
                    <div>
                      <b>
                        {workout.completedSets}/{workout.totalSets}
                      </b>
                      <span>sets</span>
                    </div>
                    <div>
                      <b>{Math.round(workout.volume).toLocaleString()}</b>
                      <span>kg volume</span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="progress-empty">
                <Dumbbell size={24} />
                <b>No completed workouts yet</b>
                <span>
                  Start and finish a daily plan to build your real history.
                </span>
              </div>
            )}
          </div>
          <div className="profile-dynamic-card progress-target-card">
            <span className="eyebrow">YOUR CURRENT TARGETS</span>
            <h2>{customer.goal}</h2>
            <div className="progress-target-list">
              <span>
                Daily calories <b>{nutrition.calories.toLocaleString()} kcal</b>
              </span>
              <span>
                Daily protein <b>{nutrition.protein} g</b>
              </span>
              <span>
                Weight target <b>{customer.targetWeight} kg</b>
              </span>
              <span>
                Training schedule <b>{customer.days} days/week</b>
              </span>
            </div>
            <p>These targets recalculate after every saved weight check-in.</p>
          </div>
        </section>
      </div>
    </>
  );
}

function FunctionalProgressPage({
  customer,
  workoutLogs,
  nutrition,
  nutritionLog,
}: {
  customer: CustomerProfile;
  workoutLogs: WorkoutLog[];
  nutrition: NutritionTargets;
  nutritionLog: NutritionLog;
}) {
  const [tab, setTab] = useState<
    "Overview" | "Strength" | "Muscles" | "Body" | "Nutrition" | "Consistency"
  >("Overview");
  const muscles = deriveMuscleInsights(workoutLogs);
  const totalSets = workoutLogs.reduce(
    (total, workout) => total + workout.completedSets,
    0,
  );
  const totalVolume = workoutLogs.reduce(
    (total, workout) => total + workout.volume,
    0,
  );
  const pushSets = muscles
    .filter((muscle) => ["Chest", "Shoulders", "Arms"].includes(muscle.name))
    .reduce((total, muscle) => total + muscle.sets, 0);
  const pullSets = muscles
    .filter((muscle) => ["Back", "Arms"].includes(muscle.name))
    .reduce((total, muscle) => total + muscle.sets, 0);
  const checkIns = customer.checkIns ?? [];
  const weightDelta =
    checkIns.length > 1
      ? Number(customer.weight) - Number(checkIns[0].weight)
      : 0;
  return (
    <>
      <div className="legacy-profile-hidden">
        <LegacyFunctionalProgressPage
          customer={customer}
          workoutLogs={workoutLogs}
          nutrition={nutrition}
        />
      </div>
      <div className="page analytics-page">
        <section className="page-title">
          <div>
            <span className="eyebrow">PROGRESS ANALYTICS</span>
            <h1>
              See the <span>whole picture.</span>
            </h1>
            <p>
              Every metric comes from the sessions, check-ins, and meals logged
              on this device.
            </p>
          </div>
          <div className="analytics-total">
            <span>Working sets</span>
            <b>{totalSets}</b>
            <small>{workoutLogs.length} saved sessions</small>
          </div>
        </section>
        <nav className="analytics-tabs">
          {(
            [
              "Overview",
              "Strength",
              "Muscles",
              "Body",
              "Nutrition",
              "Consistency",
            ] as const
          ).map((item) => (
            <button
              key={item}
              className={tab === item ? "active" : ""}
              onClick={() => setTab(item)}
            >
              {item}
            </button>
          ))}
        </nav>
        {tab === "Overview" && (
          <>
            <section className="analytics-stat-grid">
              <Stat
                icon={<Dumbbell size={20} />}
                title="Workouts"
                value={String(workoutLogs.length)}
                detail="Saved sessions"
                tone="lime"
              />
              <Stat
                icon={<BarChart3 size={20} />}
                title="Training volume"
                value={`${Math.round(totalVolume).toLocaleString()} kg`}
                detail="Completed working sets"
                tone="purple"
              />
              <Stat
                icon={<Flame size={20} />}
                title="Working sets"
                value={String(totalSets)}
                detail="Across all sessions"
                tone="orange"
              />
              <Stat
                icon={<Target size={20} />}
                title="Goal progress"
                value={`${customer.weight} kg`}
                detail={`Target ${customer.targetWeight} kg`}
                tone="blue"
              />
            </section>
            <section className="analytics-layout">
              <article className="analytics-panel">
                <span className="eyebrow">RECENT WORKOUTS</span>
                <h2>Session history</h2>
                {workoutLogs.length ? (
                  workoutLogs.slice(0, 5).map((workout) => (
                    <div className="analytics-session" key={workout.id}>
                      <span>
                        {new Date(workout.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <b>{workout.title}</b>
                      <small>
                        {workout.completedSets}/{workout.totalSets} sets ·{" "}
                        {Math.round(workout.volume).toLocaleString()} kg
                      </small>
                    </div>
                  ))
                ) : (
                  <p className="analytics-empty">
                    Finish a workout to start your real analytics history.
                  </p>
                )}
              </article>
              <article className="analytics-panel">
                <span className="eyebrow">TRAINING BALANCE</span>
                <h2>Push vs pull</h2>
                <div className="balance-row">
                  <span>
                    Push <b>{pushSets} sets</b>
                  </span>
                  <i>
                    <em
                      style={{
                        width: `${Math.min(100, (pushSets / Math.max(1, pushSets + pullSets)) * 100)}%`,
                      }}
                    />
                  </i>
                </div>
                <div className="balance-row">
                  <span>
                    Pull <b>{pullSets} sets</b>
                  </span>
                  <i>
                    <em
                      style={{
                        width: `${Math.min(100, (pullSets / Math.max(1, pushSets + pullSets)) * 100)}%`,
                      }}
                    />
                  </i>
                </div>
                <p>
                  {pullSets < pushSets
                    ? "Your pulling volume is lower than your pushing volume. Consider prioritizing back in the next session."
                    : "Your push and pull work are currently well balanced."}
                </p>
              </article>
            </section>
          </>
        )}
        {tab === "Strength" && (
          <section className="analytics-layout">
            <article className="analytics-panel strength-summary">
              <span className="eyebrow">PROGRESSIVE OVERLOAD</span>
              <h2>Performance trends</h2>
              <p>
                Pro Fitness increases load only when rep performance, RIR, completed
                sets, and recent trend support it.
              </p>
              {["Bench press", "Lat pulldown", "Squat"].map((lift, index) => (
                <div className="strength-trend" key={lift}>
                  <span>{lift}</span>
                  <i>
                    <em style={{ width: `${74 + index * 9}%` }} />
                  </i>
                  <b>{index === 0 ? "Next: +2.5 kg" : "Build reps"}</b>
                </div>
              ))}
            </article>
            <article className="analytics-panel">
              <span className="eyebrow">PERSONAL RECORDS</span>
              <h2>When you log more, this becomes real.</h2>
              <p className="analytics-empty">
                No confirmed PRs yet. Finish sets with weight and reps to unlock
                PR detection.
              </p>
            </article>
          </section>
        )}
        {tab === "Muscles" && (
          <section className="analytics-layout muscle-analytics">
            <article className="analytics-panel">
              <span className="eyebrow">WEEKLY MUSCLE VOLUME</span>
              <h2>Targets by muscle</h2>
              {muscles.map((muscle) => (
                <div className="analytics-muscle-row" key={muscle.name}>
                  <span>{muscle.name}</span>
                  <i>
                    <em
                      style={{
                        width: `${Math.min(100, (muscle.sets / muscle.target) * 100)}%`,
                      }}
                    />
                  </i>
                  <b>
                    {muscle.sets} / {muscle.target}
                  </b>
                  <small>
                    {muscle.recovery === null
                      ? "No recovery data"
                      : `${muscle.recovery}% recovered`}
                  </small>
                </div>
              ))}
            </article>
            <article className="analytics-panel">
              <span className="eyebrow">TRAINING BALANCE</span>
              <h2>Priority guidance</h2>
              <p>
                {muscles
                  .slice()
                  .sort((a, b) => a.sets / a.target - b.sets / b.target)[0]
                  ?.name ?? "Back"}{" "}
                has the largest remaining weekly volume opportunity. Guidance is
                based on completed sets and recovery—not a generic split.
              </p>
            </article>
          </section>
        )}
        {tab === "Body" && (
          <section className="analytics-layout">
            <article className="analytics-panel">
              <span className="eyebrow">BODY WEIGHT</span>
              <h2>
                {customer.weight} kg{" "}
                <small>
                  {weightDelta
                    ? `${weightDelta > 0 ? "+" : ""}${weightDelta.toFixed(1)} kg`
                    : "No trend yet"}
                </small>
              </h2>
              <p>
                Target: {customer.targetWeight} kg. Save weekly or monthly
                check-ins to calculate a reliable weight trend and calorie
                adjustment suggestion.
              </p>
            </article>
            <article className="analytics-panel">
              <span className="eyebrow">CHECK-IN HISTORY</span>
              <h2>Body data</h2>
              {checkIns.length ? (
                checkIns
                  .slice()
                  .reverse()
                  .slice(0, 5)
                  .map((checkIn) => (
                    <div
                      className="analytics-session"
                      key={`${checkIn.date}${checkIn.weight}`}
                    >
                      <span>{checkIn.cadence}</span>
                      <b>{checkIn.weight} kg</b>
                      <small>
                        {new Date(checkIn.date).toLocaleDateString()}
                      </small>
                    </div>
                  ))
              ) : (
                <p className="analytics-empty">
                  Start with a weight check-in. Body measurements and private
                  progress photos can be added from Profile in the next update.
                </p>
              )}
            </article>
          </section>
        )}
        {tab === "Nutrition" && (
          <section className="analytics-layout">
            <article className="analytics-panel">
              <span className="eyebrow">TODAY’S ADHERENCE</span>
              <h2>
                {nutritionLog.calories.toLocaleString()} /{" "}
                {nutrition.calories.toLocaleString()} kcal
              </h2>
              <div className="analytics-nutrition-list">
                <span>
                  Protein{" "}
                  <b>
                    {nutritionLog.protein} / {nutrition.protein}g
                  </b>
                </span>
                <span>
                  Carbs{" "}
                  <b>
                    {nutritionLog.carbs} / {nutrition.carbs}g
                  </b>
                </span>
                <span>
                  Fat{" "}
                  <b>
                    {nutritionLog.fat} / {nutrition.fat}g
                  </b>
                </span>
              </div>
            </article>
            <article className="analytics-panel">
              <span className="eyebrow">COACHING NOTE</span>
              <h2>
                {nutritionLog.protein >= nutrition.protein
                  ? "Protein target reached"
                  : `${nutrition.protein - nutritionLog.protein}g protein remaining`}
              </h2>
              <p>
                Nutrition targets are recalculated after each saved weight
                check-in. Pro Fitness asks before recommending a calorie change; it
                does not silently alter targets.
              </p>
            </article>
          </section>
        )}
        {tab === "Consistency" && (
          <section className="analytics-layout">
            <article className="analytics-panel">
              <span className="eyebrow">LAST 7 DAYS</span>
              <h2>Training consistency</h2>
              <div className="consistency-days">
                {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                  <span
                    key={`${day}${index}`}
                    className={
                      index < Math.min(7, workoutLogs.length) ? "done" : ""
                    }
                  >
                    <i>
                      {index < Math.min(7, workoutLogs.length) ? (
                        <Check size={13} />
                      ) : (
                        ""
                      )}
                    </i>
                    {day}
                  </span>
                ))}
              </div>
            </article>
            <article className="analytics-panel">
              <span className="eyebrow">SUSTAINABLE PLAN</span>
              <h2>
                {workoutLogs.length} of {customer.days} sessions this week
              </h2>
              <p>
                Consistency grows from a plan matched to your schedule. Use the
                Quick Workout options on Home when time is tight.
              </p>
            </article>
          </section>
        )}
      </div>
    </>
  );
}

function Stat({
  icon,
  title,
  value,
  detail,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  detail: string;
  tone: string;
}) {
  return (
    <div className="stat-item">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <div>
        <span>{title}</span>
        <b>{value}</b>
        <small>{detail}</small>
      </div>
    </div>
  );
}
function Strength({
  name,
  value,
  change,
  width,
}: {
  name: string;
  value: string;
  change: string;
  width: number;
}) {
  return (
    <div className="strength-row">
      <div>
        <b>{name}</b>
        <span>{value}</span>
      </div>
      <div className="strength-bar">
        <i style={{ width: `${width}%` }} />
      </div>
      <em>↑ {change}</em>
    </div>
  );
}
function Record({
  name,
  value,
  date,
}: {
  name: string;
  value: string;
  date: string;
}) {
  return (
    <div className="record">
      <div className="record-trophy">
        <Trophy size={17} />
      </div>
      <div>
        <b>{name}</b>
        <span>{value}</span>
      </div>
      <small>{date}</small>
    </div>
  );
}

const mealCatalog: Array<FoodEntryInput & { code: string }> = [
  {
    name: "Chicken rice bowl",
    meal: "Lunch",
    calories: 540,
    protein: 43,
    carbs: 58,
    fat: 14,
    code: "890100000001",
  },
  {
    name: "Greek yogurt protein bowl",
    meal: "Breakfast",
    calories: 320,
    protein: 31,
    carbs: 36,
    fat: 6,
    code: "890100000002",
  },
  {
    name: "Oats and banana",
    meal: "Breakfast",
    calories: 390,
    protein: 15,
    carbs: 66,
    fat: 9,
    code: "890100000003",
  },
  {
    name: "Paneer wrap",
    meal: "Dinner",
    calories: 510,
    protein: 32,
    carbs: 48,
    fat: 21,
    code: "890100000004",
  },
  {
    name: "Whey protein shake",
    meal: "Snack",
    calories: 150,
    protein: 25,
    carbs: 6,
    fat: 3,
    code: "890100000005",
  },
  {
    name: "Egg and toast plate",
    meal: "Breakfast",
    calories: 410,
    protein: 28,
    carbs: 34,
    fat: 18,
    code: "890100000006",
  },
];

function NutritionPage({
  nutrition,
  targets,
  water,
  foodEntries,
  onAddWater,
  onLogMeal,
  onAddFood,
  onRemoveFood,
}: {
  nutrition: NutritionLog;
  targets: NutritionTargets;
  water: number;
  foodEntries: FoodEntry[];
  onAddWater: () => void;
  onLogMeal: (meal: "balanced" | "protein") => void;
  onAddFood: (entry: FoodEntryInput) => void;
  onRemoveFood: (entry: FoodEntry) => void;
}) {
  const [search, setSearch] = useState("");
  const [barcode, setBarcode] = useState("");
  const [customFood, setCustomFood] = useState<FoodEntryInput>({
    name: "",
    meal: "Lunch",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const visibleFoods = mealCatalog.filter((food) =>
    food.name.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const addCustomFood = () => {
    if (!customFood.name.trim() || !Number(customFood.calories)) return;
    onAddFood({ ...customFood, name: customFood.name.trim() });
    setCustomFood({
      name: "",
      meal: customFood.meal,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    });
  };
  const lookupBarcode = () => {
    const food = mealCatalog.find((item) => item.code === barcode.trim());
    if (food) {
      onAddFood(food);
      setBarcode("");
    }
  };
  const macros = [
    {
      label: "Protein",
      current: nutrition.protein,
      target: targets.protein,
      unit: "g",
    },
    {
      label: "Carbs",
      current: nutrition.carbs,
      target: targets.carbs,
      unit: "g",
    },
    { label: "Fat", current: nutrition.fat, target: targets.fat, unit: "g" },
  ];
  const remaining = targets.calories - nutrition.calories;
  return (
    <div className="page nutrition-page">
      <section className="page-title">
        <div>
          <span className="eyebrow">NUTRITION</span>
          <h1>
            Fuel your <span>training.</span>
          </h1>
          <p>
            Log meals here; your daily targets adapt to weight, goal, and
            training schedule.
          </p>
        </div>
        <button
          className="primary-button"
          onClick={() => onLogMeal("balanced")}
        >
          <Plus size={17} /> Log balanced meal
        </button>
      </section>
      <section className="nutrition-dashboard">
        <article className="nutrition-hero">
          <div>
            <span className="eyebrow">TODAY’S CALORIES</span>
            <h2>
              {nutrition.calories.toLocaleString()}{" "}
              <small>/ {targets.calories.toLocaleString()} kcal</small>
            </h2>
            <p>
              {remaining > 0
                ? `${remaining.toLocaleString()} kcal remaining to stay on today’s target.`
                : "Today’s calorie target has been reached."}
            </p>
            <div className="nutrition-actions">
              <button
                className="primary-button"
                onClick={() => onLogMeal("balanced")}
              >
                <Plus size={15} /> Quick meal
              </button>
              <button onClick={() => onLogMeal("protein")}>Protein meal</button>
            </div>
          </div>
          <Ring
            value={Math.min(
              100,
              Math.round((nutrition.calories / targets.calories) * 100),
            )}
            size={138}
            stroke={12}
            label={`${Math.min(100, Math.round((nutrition.calories / targets.calories) * 100))}%`}
            sublabel="TARGET"
          />
        </article>
        <article className="nutrition-macros-card">
          <span className="eyebrow">MACROS</span>
          {macros.map((macro) => (
            <div className="nutrition-macro-row" key={macro.label}>
              <div>
                <b>{macro.label}</b>
                <span>
                  {macro.current} / {macro.target}
                  {macro.unit}
                </span>
              </div>
              <i>
                <em
                  style={{
                    width: `${Math.min(100, (macro.current / macro.target) * 100)}%`,
                  }}
                />
              </i>
            </div>
          ))}
        </article>
        <article className="hydration-card">
          <div>
            <span className="eyebrow">HYDRATION</span>
            <h3>
              {water.toFixed(1)} <small>/ 3.0 L</small>
            </h3>
            <p>Steady hydration supports performance and recovery.</p>
          </div>
          <button className="primary-button" onClick={onAddWater}>
            <Plus size={15} /> 250 ml
          </button>
        </article>
      </section>
      <section className="food-log-layout">
        <article className="food-log-card">
          <div className="food-log-heading">
            <div>
              <span className="eyebrow">FOOD LOG</span>
              <h2>Search and add food</h2>
              <p>Choose a quick entry or add your own meal with macros.</p>
            </div>
          </div>
          <input
            className="food-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search chicken, oats, yogurt…"
            aria-label="Search food library"
          />
          <div className="food-search-results">
            {visibleFoods.map(({ code: _code, ...food }) => (
              <button key={food.name} onClick={() => onAddFood(food)}>
                <span>
                  <b>{food.name}</b>
                  <small>
                    {food.calories} kcal · {food.protein}g protein
                  </small>
                </span>
                <Plus size={16} />
              </button>
            ))}
            {!visibleFoods.length && (
              <p className="food-empty">
                No quick match. Add a custom food below.
              </p>
            )}
          </div>
          <div className="barcode-row">
            <input
              value={barcode}
              onChange={(event) => setBarcode(event.target.value)}
              inputMode="numeric"
              placeholder="Enter packaged-food barcode"
              aria-label="Packaged-food barcode"
            />
            <button onClick={lookupBarcode}>Look up</button>
          </div>
          <small className="barcode-help">
            Barcode lookup works with the built-in starter foods; camera
            scanning can be connected to a food database when a provider is
            chosen.
          </small>
        </article>
        <article className="food-log-card custom-food-card">
          <span className="eyebrow">CUSTOM MEAL</span>
          <h2>Log what you ate</h2>
          <div className="custom-food-fields">
            <input
              value={customFood.name}
              onChange={(event) =>
                setCustomFood((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="Meal name"
              aria-label="Custom meal name"
            />
            <select
              value={customFood.meal}
              onChange={(event) =>
                setCustomFood((current) => ({
                  ...current,
                  meal: event.target.value as FoodEntry["meal"],
                }))
              }
              aria-label="Meal type"
            >
              {(["Breakfast", "Lunch", "Dinner", "Snack"] as const).map(
                (meal) => (
                  <option key={meal}>{meal}</option>
                ),
              )}
            </select>
            {(["calories", "protein", "carbs", "fat"] as const).map((field) => (
              <label key={field}>
                {field === "calories"
                  ? "Calories"
                  : `${field[0].toUpperCase()}${field.slice(1)} (g)`}
                <input
                  type="number"
                  min="0"
                  value={customFood[field] || ""}
                  onChange={(event) =>
                    setCustomFood((current) => ({
                      ...current,
                      [field]: Number(event.target.value),
                    }))
                  }
                />
              </label>
            ))}
          </div>
          <button className="primary-button" onClick={addCustomFood}>
            <Plus size={16} /> Add custom meal
          </button>
        </article>
      </section>
      <section className="recent-foods">
        <div className="food-log-heading">
          <div>
            <span className="eyebrow">TODAY'S ENTRIES</span>
            <h2>
              {foodEntries.length ? "Meals you logged" : "Nothing logged yet"}
            </h2>
          </div>
          {foodEntries.length > 0 && <span>{foodEntries.length} entries</span>}
        </div>
        {foodEntries.length ? (
          <div className="recent-food-list">
            {foodEntries.slice(0, 12).map((food) => (
              <article key={food.id}>
                <div>
                  <b>{food.name}</b>
                  <span>
                    {food.meal} · {food.calories} kcal · {food.protein}g protein
                  </span>
                </div>
                <button onClick={() => onRemoveFood(food)}>Remove</button>
              </article>
            ))}
          </div>
        ) : (
          <p className="food-empty">
            Start with a quick meal, search the starter library, or log a custom
            meal.
          </p>
        )}
      </section>
    </div>
  );
}

function ProfilePage({ setToast }: { setToast: (value: string) => void }) {
  const [unit, setUnit] = useState("Metric");
  return (
    <div className="page profile-page">
      <section className="profile-hero">
        <div className="profile-portrait">
          F<span>✦</span>
        </div>
        <div>
          <span className="eyebrow">YOUR PROFILE</span>
          <h1>Fraz Ahmed</h1>
          <p>Intermediate lifter · Joined May 2026</p>
        </div>
        <button
          className="edit-profile"
          onClick={() => setToast("Profile editing is ready.")}
        >
          Edit profile <Settings2 size={16} />
        </button>
      </section>
      <div className="profile-layout">
        <section className="profile-main">
          <div className="profile-card">
            <div className="profile-section-title">
              <div>
                <span className="eyebrow">PRIMARY FOCUS</span>
                <h2>Build muscle, intelligently.</h2>
              </div>
              <Target size={22} />
            </div>
            <div className="goal-grid">
              <div>
                <small>Primary goal</small>
                <b>Build muscle</b>
              </div>
              <div>
                <small>Target weight</small>
                <b>
                  78.0 kg <em>−2.2 kg</em>
                </b>
              </div>
              <div>
                <small>Training frequency</small>
                <b>5 days / week</b>
              </div>
              <div>
                <small>Session duration</small>
                <b>60 minutes</b>
              </div>
            </div>
            <button
              className="adjust-link"
              onClick={() => setToast("Goal adjustments saved locally.")}
            >
              Adjust goals <ArrowRight size={16} />
            </button>
          </div>
          <div className="profile-card">
            <div className="profile-section-title">
              <div>
                <span className="eyebrow">NUTRITION TARGETS</span>
                <h2>Your daily fuel.</h2>
              </div>
              <Utensils size={22} />
            </div>
            <div className="nutrition-goals">
              <div>
                <span>Calories</span>
                <b>
                  2,350 <small>kcal</small>
                </b>
              </div>
              <div>
                <span>Protein</span>
                <b>
                  160 <small>g</small>
                </b>
              </div>
              <div>
                <span>Carbs</span>
                <b>
                  260 <small>g</small>
                </b>
              </div>
              <div>
                <span>Fat</span>
                <b>
                  70 <small>g</small>
                </b>
              </div>
            </div>
          </div>
          <div className="profile-card">
            <div className="profile-section-title">
              <div>
                <span className="eyebrow">AVAILABLE EQUIPMENT</span>
                <h2>Your training setup.</h2>
              </div>
              <Dumbbell size={22} />
            </div>
            <div className="equipment-tags">
              {[
                "Barbell",
                "Dumbbells",
                "Bench",
                "Cable machine",
                "Power rack",
                "Pull-up bar",
                "Leg press",
                "Treadmill",
              ].map((item) => (
                <span key={item}>
                  <Check size={14} /> {item}
                </span>
              ))}
            </div>
          </div>
        </section>
        <aside className="profile-side">
          <div className="profile-card preference-card">
            <span className="eyebrow">PREFERENCES</span>
            <button
              className="preference-row"
              onClick={() => setUnit(unit === "Metric" ? "Imperial" : "Metric")}
            >
              <div>
                <b>Units</b>
                <small>Weight and measurements</small>
              </div>
              <span>
                {unit} <ChevronRight size={16} />
              </span>
            </button>
            <button
              className="preference-row"
              onClick={() => setToast("Reminder set for 6:30 PM.")}
            >
              <div>
                <b>Workout reminder</b>
                <small>Weekdays, 6:30 PM</small>
              </div>
              <span>
                <Bell size={16} />
              </span>
            </button>
            <button
              className="preference-row"
              onClick={() => setToast("Privacy controls opened.")}
            >
              <div>
                <b>Privacy & data</b>
                <small>Manage your data</small>
              </div>
              <span>
                <LockKeyhole size={16} />
              </span>
            </button>
          </div>
          <div className="coach-note">
            <Sparkles size={20} />
            <strong>Next check-in</strong>
            <p>
              Log your body weight tomorrow morning for a more precise goal
              forecast.
            </p>
            <button
              onClick={() => setToast("We’ll remind you tomorrow morning.")}
            >
              Remind me <ArrowRight size={14} />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CustomerProfileDashboard({
  customer,
  dailyPlan,
  nutrition,
  trainingGoal,
  onChangeGoal,
  onSaveCheckIn,
  workoutLogs,
  measurements,
  onSaveMeasurements,
  progressPhotos,
  onAddProgressPhoto,
  onRemoveProgressPhoto,
  reminders,
  onSaveReminders,
  onExportData,
  onDeleteData,
}: {
  customer: CustomerProfile;
  dailyPlan: DailyPlan;
  nutrition: NutritionTargets;
  trainingGoal: TrainingGoal;
  onChangeGoal: (goal: TrainingGoal) => void;
  onSaveCheckIn: (weight: string, cadence: "Weekly" | "Monthly") => void;
  workoutLogs: WorkoutLog[];
  measurements: BodyMeasurements;
  onSaveMeasurements: (measurements: BodyMeasurements) => void;
  progressPhotos: ProgressPhoto[];
  onAddProgressPhoto: (pose: ProgressPhoto["pose"], dataUrl: string) => void;
  onRemoveProgressPhoto: (id: string) => void;
  reminders: ReminderSettings;
  onSaveReminders: (settings: ReminderSettings) => void;
  onExportData: () => void;
  onDeleteData: () => void;
}) {
  const [cadence, setCadence] = useState<"Weekly" | "Monthly">("Weekly");
  const [checkInWeight, setCheckInWeight] = useState(customer.weight);
  const checkIns = [...(customer.checkIns ?? [])].reverse().slice(0, 4);
  const save = () => {
    if (Number(checkInWeight) > 0) onSaveCheckIn(checkInWeight, cadence);
  };
  return (
    <div className="page customer-profile-page">
      <section className="customer-hero">
        <div className="customer-avatar">
          {customer.name.charAt(0).toUpperCase()}
          <i>✦</i>
        </div>
        <div>
          <span className="eyebrow">{customer.id} · MEMBER PROFILE</span>
          <h1>{customer.name}</h1>
          <p>
            {customer.goal} · {customer.experience} · Joined{" "}
            {new Date(customer.createdAt).toLocaleDateString(undefined, {
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="customer-hero-target">
          <span>Current weight</span>
          <b>
            {customer.weight} <small>kg</small>
          </b>
          <em>Target {customer.targetWeight} kg</em>
        </div>
      </section>
      <section className="profile-overview-grid">
        <div className="profile-dynamic-card body-card">
          <span className="eyebrow">BODY & TRAINING PROFILE</span>
          <div className="body-stat-grid">
            <Metric label="Height" value={`${customer.height} cm`} />
            <Metric label="Age" value={customer.age} />
            <Metric label="Experience" value={customer.experience} />
            <Metric label="Schedule" value={`${customer.days} days / week`} />
          </div>
          <div className="profile-history">
            <b>Training background</b>
            <span>{customer.trainingHistory}</span>
            <b>Movement notes</b>
            <span>{customer.limitations || "None shared"}</span>
          </div>
        </div>
        <div className="profile-dynamic-card target-card">
          <span className="eyebrow">DAILY NUTRITION TARGETS</span>
          <h2>
            {nutrition.calories.toLocaleString()} <small>kcal/day</small>
          </h2>
          <p>
            {nutrition.pace} · Maintenance estimate{" "}
            {nutrition.maintenance.toLocaleString()} kcal
          </p>
          <div className="target-macros">
            <Metric label="Protein" value={`${nutrition.protein} g`} />
            <Metric label="Carbs" value={`${nutrition.carbs} g`} />
            <Metric label="Fat" value={`${nutrition.fat} g`} />
          </div>
          <small className="estimate-note">
            Estimates use your age, sex, height, weight, training schedule, and
            goal—not weight alone.
          </small>
        </div>
        <div className="profile-dynamic-card plan-change-card">
          <span className="eyebrow">WEIGHT-ADAPTIVE DAILY PLAN</span>
          <h2>{dailyPlan.title}</h2>
          <p>{dailyPlan.adjustment}</p>
          <div className="plan-chip-row">
            {dailyPlan.exercises.slice(0, 4).map((exercise) => (
              <span key={exercise}>{exercise}</span>
            ))}
          </div>
          <b>{dailyPlan.prescription}</b>
        </div>
      </section>
      <section className="checkin-layout">
        <div className="profile-dynamic-card checkin-card">
          <div>
            <span className="eyebrow">PROGRESS CHECK-IN</span>
            <h2>Update your weight</h2>
            <p>
              Save weekly or monthly progress. The daily target and exercise
              style update immediately.
            </p>
          </div>
          <div className="checkin-controls">
            <div className="cadence-select">
              <button
                className={cadence === "Weekly" ? "selected" : ""}
                onClick={() => setCadence("Weekly")}
              >
                Weekly
              </button>
              <button
                className={cadence === "Monthly" ? "selected" : ""}
                onClick={() => setCadence("Monthly")}
              >
                Monthly
              </button>
            </div>
            <label>
              Current weight (kg)
              <input
                inputMode="decimal"
                value={checkInWeight}
                onChange={(event) => setCheckInWeight(event.target.value)}
              />
            </label>
            <button className="primary-button" onClick={save}>
              Save check-in <ArrowRight size={16} />
            </button>
          </div>
        </div>
        <div className="profile-dynamic-card checkin-history">
          <span className="eyebrow">YOUR HISTORY</span>
          <h2>Recent updates</h2>
          {checkIns.length ? (
            <div>
              {checkIns.map((checkIn) => (
                <article key={`${checkIn.date}${checkIn.weight}`}>
                  <span>{checkIn.cadence}</span>
                  <b>{checkIn.weight} kg</b>
                  <small>
                    {new Date(checkIn.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </small>
                </article>
              ))}
            </div>
          ) : (
            <p>
              Save your first check-in to see weight changes and plan updates
              here.
            </p>
          )}
        </div>
      </section>
      <section className="profile-dynamic-card workout-history-card">
        <div>
          <span className="eyebrow">WORKOUT HISTORY</span>
          <h2>
            {workoutLogs.length
              ? `${workoutLogs.length} sessions recorded`
              : "Your completed sessions"}
          </h2>
        </div>
        {workoutLogs.length ? (
          <div>
            {workoutLogs.slice(0, 4).map((workout) => (
              <article key={workout.id}>
                <span>
                  {new Date(workout.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <b>{workout.title}</b>
                <small>
                  {workout.completedSets}/{workout.totalSets} sets ·{" "}
                  {Math.round(workout.volume).toLocaleString()} kg volume
                </small>
              </article>
            ))}
          </div>
        ) : (
          <p>
            Finish a workout to save its sets, volume, exercises, and date here.
          </p>
        )}
      </section>
      <ProfileTools
        measurements={measurements}
        onSaveMeasurements={onSaveMeasurements}
        progressPhotos={progressPhotos}
        onAddProgressPhoto={onAddProgressPhoto}
        onRemoveProgressPhoto={onRemoveProgressPhoto}
        reminders={reminders}
        onSaveReminders={onSaveReminders}
        onExportData={onExportData}
        onDeleteData={onDeleteData}
      />
      <section className="profile-dynamic-card goal-update-card">
        <div>
          <span className="eyebrow">GOAL & PLAN SETTINGS</span>
          <h2>What are you training for?</h2>
        </div>
        <div className="goal-profile-buttons">
          {allGoals.map((goal) => (
            <button
              key={goal}
              className={trainingGoal === goal ? "selected" : ""}
              onClick={() => onChangeGoal(goal)}
            >
              {goal}
            </button>
          ))}
        </div>
        <button className="profile-reset" onClick={onDeleteData}>
          Delete local profile <ArrowRight size={14} />
        </button>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

function ProfileTools({
  measurements,
  onSaveMeasurements,
  progressPhotos,
  onAddProgressPhoto,
  onRemoveProgressPhoto,
  reminders,
  onSaveReminders,
  onExportData,
  onDeleteData,
}: {
  measurements: BodyMeasurements;
  onSaveMeasurements: (measurements: BodyMeasurements) => void;
  progressPhotos: ProgressPhoto[];
  onAddProgressPhoto: (pose: ProgressPhoto["pose"], dataUrl: string) => void;
  onRemoveProgressPhoto: (id: string) => void;
  reminders: ReminderSettings;
  onSaveReminders: (settings: ReminderSettings) => void;
  onExportData: () => void;
  onDeleteData: () => void;
}) {
  const [draftMeasurements, setDraftMeasurements] =
    useState<BodyMeasurements>(measurements);
  const [reminderDraft, setReminderDraft] =
    useState<ReminderSettings>(reminders);
  const [photoPose, setPhotoPose] = useState<ProgressPhoto["pose"]>("Front");
  const [healthMessage, setHealthMessage] = useState(
    "Check whether Health Connect is available on this phone.",
  );
  const [isPrivacySummaryOpen, setIsPrivacySummaryOpen] = useState(false);
  const measurementFields: Array<{
    key: keyof BodyMeasurements;
    label: string;
    unit: string;
  }> = [
    { key: "bodyFat", label: "Body fat", unit: "%" },
    { key: "waist", label: "Waist", unit: "cm" },
    { key: "chest", label: "Chest", unit: "cm" },
    { key: "shoulders", label: "Shoulders", unit: "cm" },
    { key: "arms", label: "Arms", unit: "cm" },
    { key: "thigh", label: "Thigh", unit: "cm" },
  ];
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const toggleReminderDay = (day: string) =>
    setReminderDraft((current) => ({
      ...current,
      days: current.days.includes(day)
        ? current.days.filter((item) => item !== day)
        : [...current.days, day],
    }));
  const selectPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const photo = event.target.files?.[0];
    if (!photo) return;
    if (photo.size > 3_000_000) {
      setHealthMessage("Choose a progress photo smaller than 3 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string")
        onAddProgressPhoto(photoPose, reader.result);
    };
    reader.readAsDataURL(photo);
    event.target.value = "";
  };
  const checkHealthConnect = async () => {
    try {
      const result = await HealthConnect.getStatus();
      setHealthMessage(
        result.available
          ? "Health Connect is available. This release does not read or write Health Connect records."
          : "Health Connect is not available yet. Install or update Health Connect, then check again.",
      );
    } catch {
      setHealthMessage(
        "Health Connect can be checked in the installed Android app; browser preview does not expose the phone service.",
      );
    }
  };
  return (
    <section className="profile-tools-grid">
      <article className="profile-dynamic-card profile-tool-card">
        <span className="eyebrow">BODY MEASUREMENTS</span>
        <h2>Track more than scale weight</h2>
        <p>
          Measurements stay on this device and help you see changes a scale can
          miss.
        </p>
        <div className="measurement-grid">
          {measurementFields.map((field) => (
            <label key={field.key}>
              {field.label} ({field.unit})
              <input
                inputMode="decimal"
                value={draftMeasurements[field.key]}
                onChange={(event) =>
                  setDraftMeasurements((current) => ({
                    ...current,
                    [field.key]: event.target.value,
                  }))
                }
              />
            </label>
          ))}
        </div>
        <button
          className="primary-button"
          onClick={() => onSaveMeasurements(draftMeasurements)}
        >
          Save measurements
        </button>
      </article>
      <article className="profile-dynamic-card profile-tool-card">
        <span className="eyebrow">PRIVATE PROGRESS PHOTOS</span>
        <h2>Compare your progress</h2>
        <p>
          Photos are stored locally in this app only; use similar lighting and
          pose.
        </p>
        <div className="photo-controls">
          <select
            value={photoPose}
            onChange={(event) =>
              setPhotoPose(event.target.value as ProgressPhoto["pose"])
            }
          >
            <option>Front</option>
            <option>Side</option>
            <option>Back</option>
          </select>
          <label className="photo-upload">
            Add photo
            <input type="file" accept="image/*" onChange={selectPhoto} />
          </label>
        </div>
        <div className="progress-photo-grid">
          {progressPhotos.length ? (
            progressPhotos.map((photo) => (
              <figure key={photo.id}>
                <img src={photo.dataUrl} alt={`${photo.pose} progress`} />
                <figcaption>
                  <span>{photo.pose}</span>
                  <button onClick={() => onRemoveProgressPhoto(photo.id)}>
                    Remove
                  </button>
                </figcaption>
              </figure>
            ))
          ) : (
            <div className="photo-empty">No progress photos yet.</div>
          )}
        </div>
      </article>
      <article className="profile-dynamic-card profile-tool-card reminder-tool">
        <span className="eyebrow">WORKOUT REMINDERS</span>
        <h2>Make your plan easier to keep</h2>
        <label className="reminder-toggle">
          <input
            type="checkbox"
            checked={reminderDraft.enabled}
            onChange={(event) =>
              setReminderDraft((current) => ({
                ...current,
                enabled: event.target.checked,
              }))
            }
          />
          <span>
            {reminderDraft.enabled ? "Reminders on" : "Reminders off"}
          </span>
        </label>
        <div className="reminder-controls">
          <input
            type="time"
            value={reminderDraft.time}
            onChange={(event) =>
              setReminderDraft((current) => ({
                ...current,
                time: event.target.value,
              }))
            }
          />
          <div className="weekday-picker">
            {weekdays.map((day) => (
              <button
                key={day}
                className={reminderDraft.days.includes(day) ? "selected" : ""}
                onClick={() => toggleReminderDay(day)}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
        <button
          className="primary-button"
          onClick={() => onSaveReminders(reminderDraft)}
        >
          Save reminder plan
        </button>
        <small className="health-status">
          Android may ask for Alarms & reminders so this workout notification can
          arrive at the exact time you selected.
        </small>
      </article>
      <article className="profile-dynamic-card profile-tool-card privacy-tool">
        <span className="eyebrow">PRIVACY & HEALTH</span>
        <h2>You stay in control</h2>
        <p>
          This local-first release has no account, ads, analytics, or cloud
          sync. Your Pro Fitness information stays on this device unless you export
          it.
        </p>
        <div className="privacy-actions">
          <button onClick={onExportData}>Export my data</button>
          <button onClick={() => setIsPrivacySummaryOpen(true)}>
            View privacy policy
          </button>
          <button onClick={checkHealthConnect}>Check Health Connect</button>
          <button className="danger-button" onClick={onDeleteData}>
            Delete all local data
          </button>
        </div>
        <small className="health-status">{healthMessage}</small>
      </article>
      {isPrivacySummaryOpen && (
        <div
          className="privacy-summary-backdrop"
          role="presentation"
          onClick={() => setIsPrivacySummaryOpen(false)}
        >
          <section
            className="privacy-summary-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-summary-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              aria-label="Close privacy policy"
              onClick={() => setIsPrivacySummaryOpen(false)}
            >
              <X size={16} />
            </button>
            <span className="eyebrow">PRO FITNESS PRIVACY POLICY</span>
            <h2 id="privacy-summary-title">Your health data stays on your device</h2>
            <div className="privacy-policy-content">
              <section>
                <b>1. Information kept in the app</b>
                <p>
                  To personalize your plan, Pro Fitness stores the profile details,
                  training preferences, workout history, nutrition entries, check-ins,
                  measurements, reminders, and any progress photos you choose to add.
                </p>
              </section>
              <section>
                <b>2. How it is used</b>
                <p>
                  This information is used only on this device to calculate training,
                  nutrition, and progress guidance. It is not used for advertising.
                </p>
              </section>
              <section>
                <b>3. Sharing and third parties</b>
                <p>
                  This local-first version has no account, analytics, ad network, or
                  cloud-sync service. Pro Fitness does not sell or share your health
                  data. Tutorial links may open YouTube in your browser; YouTube then
                  applies its own privacy practices.
                </p>
              </section>
              <section>
                <b>4. Your choices</b>
                <p>
                  You can export your data or permanently delete all locally stored
                  data from this Profile page. Workout reminders are optional.
                </p>
              </section>
              <section>
                <b>5. Device permissions</b>
                <p>
                  Progress photos require the photo picker only when you add one.
                  Health Connect is availability-only in this release: no Health
                  Connect records are read or written.
                </p>
              </section>
              <small>
                Last updated: September 10, 2026. Privacy support: Fraz Ali —{" "}
                <a href="mailto:numlfrazali@gmail.com">numlfrazali@gmail.com</a>
              </small>
            </div>
            <button
              className="primary-button"
              onClick={() => setIsPrivacySummaryOpen(false)}
            >
              Close policy
            </button>
          </section>
        </div>
      )}
    </section>
  );
}

function ProfileGoalPage({
  setToast,
  trainingGoal,
  setTrainingGoal,
  customer,
  dailyPlan,
  nutrition,
  onSaveCheckIn,
  workoutLogs,
  measurements,
  onSaveMeasurements,
  progressPhotos,
  onAddProgressPhoto,
  onRemoveProgressPhoto,
  reminders,
  onSaveReminders,
  onExportData,
  onDeleteData,
}: {
  setToast: (value: string) => void;
  trainingGoal: TrainingGoal;
  setTrainingGoal: (goal: TrainingGoal) => void;
  customer: CustomerProfile;
  dailyPlan: DailyPlan;
  nutrition: NutritionTargets;
  onSaveCheckIn: (weight: string, cadence: "Weekly" | "Monthly") => void;
  workoutLogs: WorkoutLog[];
  measurements: BodyMeasurements;
  onSaveMeasurements: (measurements: BodyMeasurements) => void;
  progressPhotos: ProgressPhoto[];
  onAddProgressPhoto: (pose: ProgressPhoto["pose"], dataUrl: string) => void;
  onRemoveProgressPhoto: (id: string) => void;
  reminders: ReminderSettings;
  onSaveReminders: (settings: ReminderSettings) => void;
  onExportData: () => void;
  onDeleteData: () => void;
}) {
  const changeGoal = (goal: TrainingGoal) => {
    setTrainingGoal(goal);
    setToast(
      `${goal} plan applied. Your nutrition targets and exercises are updated.`,
    );
  };
  return (
    <>
      <div className="legacy-profile-hidden">
        <ProfilePage setToast={setToast} />
      </div>
      <CustomerProfileDashboard
        customer={customer}
        dailyPlan={dailyPlan}
        nutrition={nutrition}
        trainingGoal={trainingGoal}
        onChangeGoal={changeGoal}
        onSaveCheckIn={onSaveCheckIn}
        workoutLogs={workoutLogs}
        measurements={measurements}
        onSaveMeasurements={onSaveMeasurements}
        progressPhotos={progressPhotos}
        onAddProgressPhoto={onAddProgressPhoto}
        onRemoveProgressPhoto={onRemoveProgressPhoto}
        reminders={reminders}
        onSaveReminders={onSaveReminders}
        onExportData={onExportData}
        onDeleteData={onDeleteData}
      />
    </>
  );
}

export default App;
