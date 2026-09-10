# Pro Fitness Play Console declaration sheet

Use this sheet only for the current **local-first** Pro Fitness release: package
`com.repwise.fitness`, version `1.0.2` / version code `3`. Recheck every answer
if Firebase, analytics, ads, Health Connect records, cloud backup, or another
SDK is added.

## Store listing

- **App name:** Pro Fitness
- **App or game:** App
- **Category:** Health & Fitness
- **Pricing:** Free
- **Contains ads:** No
- **Contact email:** `numlfrazali@gmail.com`

**Short description**

> Personal workouts, nutrition targets, form guides, and progress tracking.

**Full description**

> Train with a plan that adapts to you.
>
> Pro Fitness builds a practical gym routine from your goal, current weight,
> training experience, schedule, equipment, and movement notes. Follow each
> session set by set, learn how every exercise works, and keep your nutrition
> and progress in one focused place.
>
> With Pro Fitness you can build a goal-aware daily workout for muscle gain, fat
> loss, or strength; explore exercise form guidance; record sets, reps, weight,
> RIR, RPE, and notes; track calorie and macro targets, meals, water, body
> measurements, and optional private progress photos; update body weight so
> plans can adapt; set training reminders; and export or delete local data.
>
> Pro Fitness is a training companion, not medical advice. Adjust exercise
> selection for pain, injury, or medical needs with a qualified professional.

## App content answers

### App access

- **All functionality is available without a username, password, or other
  credentials:** Yes.
- **Instructions for reviewers:** Install, complete the local onboarding, then
  use Home, Workout, Explore, Nutrition, Progress, and Profile. No reviewer
  account, payment, or special access code is needed.

### Ads

- **Does the app contain ads?** No.

### Data safety

- **Does the app collect or share any of the required user data types?** No.
- **Privacy policy:** Publish the completed `PRIVACY_POLICY_TEMPLATE.md` at a
  public HTTPS URL first, then enter that exact URL.
- **Security/deletion follow-up:** No user data is transmitted off-device in
  this release. Users can remove their device-local profile and tracking data
  with **Delete all local data** in Profile.

This answer is valid because the app has no account backend, analytics, ads,
cloud sync, or Firebase integration. It stores user-entered information only
on the device. Its tutorial action opens an ordinary YouTube search in the
user's browser; Pro Fitness does not control or collect the data used on that
external page.

### Target audience and content

- **Designed for children?** No.
- **Recommended target audience:** 18 and over, provided this matches the
  publisher's intended audience. Do not select a child age group unless the
  app, privacy policy, and distribution are reviewed for the Families policy.
- **Appeals/contact email for the IARC rating:** `numlfrazali@gmail.com`

### Content rating (IARC)

Use the category that best matches a fitness-planning utility. Answer **No**
to the content indicators that are not present in the installed app: violence,
sexual content, profanity, controlled substances, gambling, fear/horror,
user-to-user communication, publicly shared user-generated content, precise
location sharing, and ads. The browser's external YouTube result page is not
Pro Fitness content and must not be described as an in-app video service.

Review the generated rating before submitting; IARC assigns the final regional
ratings from the selected answers.

## Internal testing release

1. Create an **Internal testing** track for package
   `com.repwise.fitness`.
2. Add up to 100 tester Google-account email addresses and set the feedback
   channel to `numlfrazali@gmail.com`.
3. Create a release using
   `android/app/build/outputs/bundle/release/app-release.aab`.
4. Release it to internal testers and share the generated opt-in link.

## Still required from the publisher

- Developer or business legal name: `Fraz Ali`.
- Working support email address: `numlfrazali@gmail.com`.
- Public HTTPS privacy-policy URL containing the completed contact section.
- Countries/regions for distribution and confirmation that the intended target
  audience is 18+.
- One or more internal-tester Google-account email addresses.
- Five genuine screenshots captured from the final installed Android app:
  Home, Workout, exercise guide, Nutrition, and Profile. Do not use browser
  chrome, mockups, debug overlays, or another app's images as Play screenshots.
