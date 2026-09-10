# Pro Fitness

<p align="center">
  <img src="public/brand/pro-fitness-launcher.png" width="128" alt="Pro Fitness app icon" />
</p>

<p align="center"><strong>A private, goal-aware Android fitness coach for smarter gym training.</strong></p>

Pro Fitness creates tailored workouts from a member's goal, body profile,
available equipment, experience, and weekly check-ins. It combines exercise
form coaching, muscle-focus visuals, set logging, nutrition targets, and
private progress tracking in one local-first Android app.

## Portfolio gallery

<p align="center">
  <img src="repwise-workout-check.png" width="220" alt="Workout set logging screen" />
  <img src="public/assets/form-loops/horizontal-press-male.png" width="330" alt="Chest press form coaching visual" />
  <img src="public/assets/anatomy/male-muscle-model.png" width="280" alt="Male muscle focus visual" />
</p>

<p align="center">
  <img src="public/assets/anatomy/female-muscle-model.png" width="220" alt="Female muscle focus visual" />
  <img src="public/assets/form-loops/vertical-pull-female.png" width="330" alt="Female vertical pull form coaching visual" />
  <img src="public/assets/exercise-atlases/male-pairs/chest.png" width="330" alt="Chest exercise form reference" />
</p>

See [the detailed portfolio guide](docs/PORTFOLIO.md) for captions and the
sections each visual represents.

## Highlights

- Goal-aware daily plans for muscle gain, fat loss, and strength.
- Broad exercise library across chest, back, shoulders, arms, legs, core, and cardio.
- Male and female exercise visuals with primary and supporting muscle focus.
- Guided warm-ups, set-by-set workout logging, form cues, and reminders.
- Nutrition targets, meal logging, body measurements, check-ins, and local progress photos.
- Local-first privacy controls: export or permanently delete personal data.

## Run locally

```powershell
npm install
npm run dev
```

## Quality checks

```powershell
npm run build
npm run lint
```

## Android

```powershell
npm run android:sync
npm run android:debug
```

`android:debug` produces an installable debug APK. `android:bundle` creates a Play Store upload bundle only after release signing is configured.

## Privacy and Play release

See [the Play Store handoff guide](docs/PLAY_STORE_RELEASE.md), [the console declaration sheet](docs/PLAY_CONSOLE_DECLARATIONS.md), [the privacy-policy template](docs/PRIVACY_POLICY_TEMPLATE.md), and [the store-listing copy](docs/STORE_LISTING.md).

The app keeps health and progress information local to the device in this release. It has no analytics, ads, remote account, or cloud-sync service. Users can export or delete their local data from Profile.
