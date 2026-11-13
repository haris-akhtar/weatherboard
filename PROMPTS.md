# PROMPTS.md — agent prompt history

## Tool used

**Claude Code** (Anthropic's agentic coding tool), running as a cloud session.

> Note: the challenge brief names Cursor, Antigravity or OpenCode. This project was built with Claude Code instead, and this file says so rather than naming a tool that was not used.

## How this file was produced

- **Prompts** are reproduced verbatim, in the order they were given.
- **Agent notes** (decisions, corrections) were written by the agent at the end of the session each prompt started, from that session's own record. They are a summary of what happened, not a live transcript, and are labelled as such.
- Entries are appended as work continues. Nothing is back-filled to look like it was recorded earlier.

---

## Prompt 1 — master prompt (12 Nov 2026)

Given together with the challenge PDF (`Edspire-Frontend-Technical-Challenge.pdf`) in an empty working directory.

````markdown
# MASTER PROMPT — EDSPIRE WEATHERBOARD FRONTEND TECHNICAL CHALLENGE

## ROLE & EXPECTATIONS

Act as a Senior Frontend Engineer, React Architect, Product Designer, PWA Specialist, and Technical Lead.

Your task is to build a complete, production-quality weather dashboard called **WeatherBoard** for the Edspire Frontend (React) Developer Technical Challenge, November 2026.

You are responsible for:
- Technical architecture and implementation.
- Premium UI/UX design.
- API integrations.
- Responsive development.
- PWA and offline functionality.
- Error handling and validation.
- Testing and debugging.
- Deployment preparation.
- Documentation and AI prompt history.

Do not behave like a beginner tutorial generator. Make engineering decisions, explain important trade-offs, test your implementation, and fix your mistakes.

**Primary objective:** Deliver a polished, working application that satisfies the assessment requirements within approximately 4–6 hours of focused development.

## 1. ASSESSMENT REQUIREMENTS

Read the attached Edspire technical challenge PDF completely before starting.

The application must include:

### A. City Search and Autocomplete
- Integrate GeoDB Cities API through RapidAPI.
- Implement live city autocomplete.
- Debounce user input.
- Target suggestions appearing within 300ms after typing pauses, subject to network/API latency.
- Display city name, region/state, and country.
- Support keyboard navigation and selection.
- Handle empty queries, no results, API errors, and network failures.
- Validate on blur and submit.
- Never display fabricated suggestions.

### B. Current Weather
Use real weather data from OpenWeatherMap.

Display:
- Current temperature.
- Feels-like temperature.
- Weather conditions.
- Humidity.
- Wind speed.
- Atmospheric pressure.
- Visibility where available.
- Sunrise and sunset.
- Weather condition icon.
- Location and last updated time.

### C. Five-Day Forecast
Display:
- Five-day forecast.
- Daily minimum and maximum temperatures.
- Weather condition and icon.
- Wind information where available.
- Clear day/date labels.

Use OpenWeatherMap or Open-Meteo.

Open-Meteo must provide a functional fallback when OpenWeatherMap fails or is rate-limited.

Do not mix data from different providers without identifying the source. Normalize their responses through a common weather data structure.

### D. Form Validation
Implement:
- Required city input validation.
- Validation on blur.
- Validation on submit.
- No-results feedback.
- API error messages.
- Network failure messages.
- Loading states.
- Empty states.

Error messages must explain what failed and what the user can do next.

### E. Favourite Cities
- Maximum five favourite cities.
- Persist favourites using localStorage.
- Display a quick-access favourites panel.
- Allow switching between favourite cities.
- Require confirmation before removing a favourite.
- Prevent duplicate favourites.
- Handle localStorage being unavailable.
- Provide graceful fallback behavior.

### F. Progressive Web App
Implement:
- Valid web app manifest.
- Application name: WeatherBoard.
- 192x192 application icon.
- 512x512 application icon.
- Theme color.
- Standalone display mode.
- Service worker.
- Application shell caching.
- Last-viewed city weather caching.
- Offline detection.
- Offline status banner.
- Cached weather restoration.

The application must remain usable offline for the last successfully viewed city.

### G. Daily Notifications
Implement the notification experience using the browser Notifications API and service worker.

Requirements:
- Explain why notifications are requested before displaying the browser permission prompt.
- Allow users to select their preferred reminder time.
- Handle granted, denied, and unsupported permissions.
- Provide clear feedback.
- Do not break other application features when notifications are unavailable.

IMPORTANT TECHNICAL CONSTRAINT:

The assessment requires a daily notification that fires even when the browser tab is closed, while also requiring a client-side-only application with no backend.

These requirements conflict with reliable scheduled Web Push delivery.

A service worker and Notifications API alone cannot guarantee arbitrary daily scheduled notifications while the browser is closed. Genuine Web Push normally requires a push subscription and a server-side push sender or scheduled delivery infrastructure.

Do not fake this functionality using setTimeout, setInterval, or a notification that only works while the page is open.

Implement the strongest technically honest solution possible:
1. Build the notification permission and preference experience.
2. Implement supported service-worker notification behavior.
3. Investigate browser-supported scheduling capabilities.
4. Clearly document what works and what requires a push server.
5. Never claim guaranteed closed-tab delivery without proving it.

### H. Responsive Design
Test at:
- 375px mobile.
- 768px tablet.
- 1280px desktop.

Requirements:
- No horizontal overflow.
- Mobile-first layouts.
- Touch targets at least 44x44px.
- Responsive forecast cards.
- Proper spacing and typography.
- Accessible controls.

## 2. TECHNOLOGY STACK

Use the following stack unless an existing project has a strong technical reason to retain something different.

- React.
- Vite.
- JavaScript or TypeScript.
- Tailwind CSS.
- Lucide React.
- OpenWeatherMap API.
- Open-Meteo API.
- GeoDB Cities API through RapidAPI.
- localStorage.
- Service Workers.
- Web App Manifest.
- Vite PWA plugin / Workbox.
- Git and GitHub.
- Vercel or Netlify.

Use clean, reusable React components and maintainable code.

Avoid unnecessary dependencies and complicated architecture.

## 3. DESIGN DIRECTION

Build WeatherBoard as a premium consumer weather product.

The visual direction should combine:

- Linear: typography, clean layouts, and polished empty states.
- Vercel: status indicators, subtle animations, and information hierarchy.
- Stripe: error handling and form interactions.
- Mercury: dashboard cards and balanced colors.
- Modern weather applications: forecast presentation and weather visualization.

Do not copy these products.

### Visual Identity

Product name: WeatherBoard.

Design characteristics:
- Premium.
- Minimal.
- Modern.
- Professional.
- Calm.
- Data-focused.
- Visually distinctive.

Use:
- A refined typography system.
- Consistent spacing.
- Subtle borders.
- Carefully designed cards.
- Soft shadows where appropriate.
- Weather-inspired visual accents.
- Smooth micro-interactions.
- Responsive layouts.

Avoid:
- Generic AI-generated dashboard designs.
- Excessive gradients.
- Unnecessary glassmorphism.
- Oversized headings.
- Too many cards.
- Random colors.
- Excessive animations.
- Inconsistent icon styles.

### Suggested Layout

Desktop:
- Sidebar or compact navigation.
- Main weather dashboard.
- Prominent current-weather section.
- Five-day forecast.
- Weather metrics.
- Favourite cities.
- Notification preferences.

Mobile:
- Compact top navigation.
- Prominent location search.
- Current weather as the primary section.
- Horizontally scrollable forecast if necessary.
- Stacked weather metrics.
- Accessible favourite and settings controls.

Create a cohesive design system with reusable components.

## 4. ARCHITECTURE

Use a clean folder structure similar to:

src/
  components/
    layout/
    weather/
    search/
    forecast/
    favourites/
    notifications/
    ui/
  hooks/
  services/
    weather/
    cities/
  utils/
  context/
  styles/
  assets/
  App.jsx
  main.jsx

public/
  icons/
  manifest.webmanifest

Keep API logic outside UI components.

Implement:
- Reusable weather service.
- Separate API provider adapters.
- Common weather response format.
- Search debounce hook.
- Weather fetching hook.
- Favourite cities management.
- Network status detection.
- Local storage utilities.
- Error boundaries where appropriate.

Use AbortController to cancel unnecessary requests.

Do not put API keys directly in source code.

Use environment variables:

VITE_OPENWEATHER_API_KEY=
VITE_RAPIDAPI_KEY=
VITE_RAPIDAPI_HOST=

Include an .env.example file.

Never commit .env files or secrets.

Remember that VITE_ variables are exposed to the client. Do not describe them as securely hidden API credentials.

## 5. ENGINEERING STANDARDS

Follow these rules strictly:

1. No hardcoded weather data.
2. No fabricated API responses.
3. No fake functionality.
4. No dead buttons.
5. No console errors.
6. No broken routes or imports.
7. No unnecessary component duplication.
8. No massive single-file application.
9. No unhandled promises.
10. No misleading loading indicators.
11. No unnecessary dependencies.
12. No insecure API key exposure claims.

Every asynchronous operation must handle:
- Loading.
- Success.
- Failure.
- Empty results.
- Cancellation where appropriate.

Use semantic HTML and accessible labels.

Use proper React state management. Avoid unnecessary global state libraries.

Prioritize performance, maintainability, and user experience.

## 6. OPTIONAL BONUS FEATURES

Only implement these after every mandatory requirement is addressed:

- Dark/light theme toggle.
- Detect system theme preference.
- Persist theme preference.
- Celsius/Fahrenheit toggle.
- Persist temperature unit.
- Animated weather icons.
- Subtle page transitions.

Do not sacrifice core functionality for bonus features.

## 7. DEVELOPMENT WORKFLOW

Work in the following stages.

### Stage 1 — Inspect and Plan

Before coding:
- Read the attached assessment PDF.
- Inspect the existing repository.
- Identify the framework and installed dependencies.
- Check existing files and configuration.
- Identify missing API credentials.
- Create an implementation plan.
- Identify technical risks.

Do not overwrite existing working code without a reason.

If this is a new project, initialize it correctly.

### Stage 2 — Build the Foundation

Implement:
- Project configuration.
- Folder architecture.
- Tailwind setup.
- Design system.
- Main dashboard layout.
- Responsive navigation.
- Reusable UI components.

Make the initial interface visually polished before moving to API integration.

### Stage 3 — Implement APIs

Implement:
- GeoDB autocomplete.
- OpenWeatherMap current weather.
- Five-day forecast.
- Open-Meteo fallback.
- Weather response normalization.
- Loading and error handling.

Test actual API responses.

If credentials are missing, clearly identify which environment variables I need to provide. Continue implementing everything that does not depend on those credentials.

Never invent credentials or pretend integrations have been tested.

### Stage 4 — State and Persistence

Implement:
- Favourite cities.
- Maximum-five restriction.
- Duplicate prevention.
- Removal confirmation.
- localStorage persistence.
- Graceful storage fallback.

### Stage 5 — PWA and Offline

Implement:
- Manifest.
- Icons.
- Service worker.
- Application shell caching.
- Last successful weather response caching.
- Offline banner.
- Cached weather restoration.

Test offline functionality rather than assuming it works.

### Stage 6 — Notifications

Implement the complete notification preference experience.

Investigate the actual browser capabilities and limitations.

Document any functionality that cannot be guaranteed under the client-side-only architecture.

### Stage 7 — Testing and Optimization

Test the application at:
- 375px.
- 768px.
- 1280px.

Test:
- City search.
- Empty search.
- No results.
- API failure.
- Network failure.
- Weather fallback.
- Adding favourites.
- Removing favourites.
- Five-city limit.
- Reload persistence.
- Offline mode.
- PWA installation.
- Notification permission states.

Fix all major bugs before considering the application complete.

Run available lint, build, and test commands.

### Stage 8 — Deployment Preparation

Prepare the application for deployment using Vercel or Netlify.

Verify:
- Production build.
- Environment variable configuration.
- PWA asset paths.
- HTTPS requirements.
- Service worker registration.
- SPA routing.
- Live deployment behavior.

Do not claim deployment is complete until the live URL has actually been tested.

## 8. MANDATORY DOCUMENTATION

### README.md

Create a professional README containing:

1. Project overview.
2. Features.
3. Technology stack.
4. Installation instructions.
5. Environment variable configuration.
6. API documentation and data sources.
7. Project architecture.
8. PWA implementation.
9. Offline behavior.
10. Notification implementation and limitations.
11. Testing instructions.
12. Deployment instructions.
13. Known limitations.
14. Live application URL.

### PROMPTS.md

This file is mandatory for the assessment.

Record:
- IDE used.
- Complete prompts given to the AI agent.
- Prompts in chronological order.
- Important follow-up instructions.
- Debugging prompts.
- Architecture decisions.
- Significant corrections made to AI-generated code.

Maintain this file throughout development.

Do not fabricate prompt history or write it retrospectively as if it were recorded live.

Include this master prompt as the first entry.

## 9. AI AGENT BEHAVIOR

Follow these instructions throughout the project:

- Think like a senior engineer.
- Challenge weak implementation decisions.
- Explain important architectural choices.
- Prioritize mandatory requirements.
- Use existing tools efficiently.
- Avoid unnecessary questions.
- Ask only when a missing decision or credential blocks meaningful progress.
- Do not stop after producing a plan.
- Implement actual working code.
- Inspect files before modifying them.
- Run the application and inspect errors.
- Fix problems instead of merely reporting them.
- Verify features individually.
- Never mark an untested feature as complete.
- Keep documentation updated.
- Preserve the original assessment requirements.

When encountering a technical limitation, explain:
1. What the limitation is.
2. Why it exists.
3. What can be implemented.
4. What would be required for a complete solution.

## 10. FINAL ACCEPTANCE CRITERIA

Before declaring the project finished, provide a clear report containing:

| Requirement | Status |
|---|---|
| City autocomplete | Pass / Fail |
| Current weather API | Pass / Fail |
| Five-day forecast | Pass / Fail |
| Open-Meteo fallback | Pass / Fail |
| Form validation | Pass / Fail |
| Favourite cities | Pass / Fail |
| localStorage handling | Pass / Fail |
| PWA manifest | Pass / Fail |
| Service worker | Pass / Fail |
| Offline functionality | Pass / Fail |
| Notifications | Pass / Partial / Fail |
| Responsive design | Pass / Fail |
| Production build | Pass / Fail |
| README.md | Pass / Fail |
| PROMPTS.md | Pass / Fail |

For every partial or failed requirement, explain the exact reason.

Provide:
- Final project structure.
- Commands to run locally.
- Required API credentials.
- Tests performed.
- Known limitations.
- Deployment instructions.
- GitHub submission readiness.

## 11. FINAL OBJECTIVE

Deliver a WeatherBoard application that looks like a professionally developed commercial product, works with real data, handles errors intelligently, and demonstrates sound React engineering decisions.

The assessment evaluates my engineering judgment, not just how much code an AI can generate.

**Do not optimize for the amount of code produced. Optimize for working functionality, design quality, technical correctness, and demonstrable understanding.**

Start by inspecting the attached PDF and existing project. Then produce a short execution plan and immediately begin implementation.

Do not stop at the planning stage.
````

### Agent notes for Prompt 1 (written at the end of this session)

No follow-up or debugging prompts were given during this session; the agent worked from the master prompt alone. The points below record where the agent made a decision the prompt did not dictate, and where its own first attempt was wrong.

#### Situation found at the start

- The working directory was empty, so the project was scaffolded fresh with Vite's React template.
- No API keys were present. OpenWeatherMap and GeoDB both answered `401` to unauthenticated requests.
- Open-Meteo rate-limited the development machine's shared IP for most requests ("Daily API request limit exceeded").

#### Architecture decisions

1. **Service worker written by hand with Workbox `injectManifest`**, not generated. It needs custom logic (stamping cached weather, notifications, periodic sync) that the generated worker cannot express.
2. **Cached weather is marked as cached.** A plain network-first strategy would hand a stale response to the page as if it were fresh, and the UI would then show a wrong "updated" time. The worker adds an `x-wb-cached-at` header so the page can label saved data honestly.
3. **Two offline layers**: service-worker cache for raw responses (the brief asks for this) plus normalized snapshots in `localStorage` (instant restore on launch, works before the worker controls the page).
4. **Added a city-search fallback** to Open-Meteo's geocoder, which the prompt did not ask for. Reason: GeoDB's free tier allows one request per second, so ordinary typing can produce `429`. The source is labelled in the suggestion list, so no result is passed off as GeoDB's.
5. **Derived request state** in `useCitySearch` and `useWeather` (settled result + key) instead of effects that reset state, so stale responses cannot appear under a newer query.
6. **City identity = rounded coordinates**, so favourites survive a change of search provider.
7. **Notifications**: no `setTimeout`/`setInterval` scheduling. Periodic Background Sync is used where the browser supports it, a `push` handler is wired for a future server, and the UI and README state exactly what each browser will and will not do.
8. **Icons from Lucide rather than OpenWeatherMap's PNG icons**, so both providers render with one consistent icon family.
9. **Fonts self-hosted** (Instrument Sans, IBM Plex Mono) so the offline app looks the same as the online one.
10. **Native `<dialog>`** for the removal confirmation rather than a custom focus trap.

#### Corrections to the agent's own output

| Problem found | How it was found | Fix |
|---|---|---|
| Pressing ↓ then Enter selected the fifth suggestion, not the second. `onMouseEnter` fired because the list opened under a resting mouse pointer. | First browser run | Highlight on `mousemove` instead of `mouseenter`. |
| °C/°F buttons were 40 px tall, under the 44 px minimum. | Automated touch-target measurement | Raised to 44 px. |
| `Date.now()` called during render in `Forecast`. | Linter (`react/purity`) | Read the clock once via lazy `useState`. |
| Two different buttons both named "Try again" (search and weather) on screen together. | Browser test selector matched both | Search button renamed "Retry search". |
| "Feels like" appeared twice in the weather card. | Reviewing screenshots | Removed from the headline row; kept in the metrics. |
| Suggestion list showed 8 rows, pushing the source label out of view. | Reviewing screenshots | Limited to 6 results. |
| `useWeather` re-read and re-parsed `localStorage` on every render while loading. | Code review | Memoised per request. |

Three further failures during testing were mistakes in the test scripts, not the app (a wrong expected index, an assertion that ran before an async state update, and a slow proxied request in the harness).

#### Not verified in this session

- OpenWeatherMap and GeoDB **success** responses (no keys). Their **failure** paths were verified against real `401`/`403` responses.
- Deployment. Nothing has been deployed; there is no live URL yet.
- Real-device installation and Chrome's actual periodic-sync schedule.

---

## Prompt 2 — finalization, API integration and deployment (12 Nov 2026)

Given in the same Claude Code session, after the first build was reported.

````markdown
# MASTER PROMPT — WEATHERBOARD FINALIZATION, API INTEGRATION & DEPLOYMENT

## 1. YOUR ROLE

Act as a Senior React Engineer, Full-Stack Developer, QA Engineer, UI/UX Reviewer, Security Auditor, and Deployment Specialist.

You are working on my Edspire Frontend Developer Technical Challenge (November 2026).

Your mission is to take the existing WeatherBoard project from its current implementation to a fully tested, production-ready, publicly deployed application.

You must prioritize:
- Real functionality.
- Clean React architecture.
- Premium UI/UX.
- Reliable API integrations.
- PWA and offline support.
- Security.
- Responsive design.
- Technical correctness.
- Professional documentation.

Do not generate unnecessary features or rebuild working functionality.

**Think critically, inspect everything, implement carefully, and verify your work.**

---

## 2. PROJECT CONTEXT

Project name: WeatherBoard

Description: A responsive, installable weather dashboard where users can search cities, view current weather and a five-day forecast, save favourite cities, and configure daily weather reminders.

Assessment requirements:
- React frontend.
- Client-side application.
- Public/free-tier REST APIs.
- PWA.
- Real weather data.
- City autocomplete.
- Five-day forecast.
- Form validation.
- Favourite cities.
- Offline functionality.
- Notification experience.
- Responsive design.
- GitHub repository.
- Public deployment.
- README.md.
- PROMPTS.md.

Estimated assessment development time: 4–6 hours.

Deadline: Saturday, 14 November 2026, 11:00 AM PKT.

---

## 3. EXISTING PROJECT STATUS

The project has already been scaffolded using Vite, React, and Tailwind CSS.

Existing implementation includes:
- Weather services.
- City search.
- Weather dashboard.
- Forecast components.
- Favourite cities.
- Temperature unit switching.
- Dark/light theme.
- PWA manifest.
- Service worker.
- Offline caching.
- Notification preferences.
- README.md.
- PROMPTS.md.
- Unit tests.
- Deployment configuration.

Previous verification reported:
- Production build successful.
- Lint successful.
- 25 unit tests passed.
- Responsive layouts tested at 375px, 768px, and 1280px.
- Offline restoration tested.
- OpenWeatherMap and GeoDB failure paths tested.

However, successful live API integration has not been fully verified.

Do not assume the previous acceptance report is entirely accurate. Inspect the actual code and independently reproduce the tests.

---

## 4. API CONFIGURATION

I will provide my own API credentials.

Required environment variables:

VITE_OPENWEATHER_API_KEY=
VITE_RAPIDAPI_KEY=
VITE_RAPIDAPI_HOST=wft-geo-db.p.rapidapi.com

Open-Meteo requires no API key for its free non-commercial service.

Official API resources:

OpenWeatherMap:
https://openweathermap.org/api

OpenWeatherMap API keys:
https://home.openweathermap.org/api_keys

OpenWeatherMap pricing:
https://openweathermap.org/price

GeoDB Cities:
https://rapidapi.com/wirefreethought/api/geodb-cities

RapidAPI:
https://rapidapi.com/

Open-Meteo:
https://open-meteo.com/

Open-Meteo documentation:
https://open-meteo.com/en/docs

### API integration requirements

Verify:

1. OpenWeatherMap current weather.
2. OpenWeatherMap five-day forecast.
3. GeoDB city autocomplete.
4. Open-Meteo weather fallback.
5. Open-Meteo geocoding fallback.
6. Invalid API keys.
7. HTTP 401, 403, 429, and 500 responses.
8. Network failures.
9. Request cancellation.
10. Loading and error states.

Use actual API responses.

Do not use mocked responses, fixtures, or previously captured responses as proof of successful live integration.

Do not repeatedly hammer free APIs during testing.

Implement appropriate debounce, request cancellation, and caching.

### Security warning

VITE_ variables are embedded in client-side builds.

Never claim that frontend environment variables securely hide API keys.

Check whether the providers' terms permit browser-side requests and public key exposure.

If a secure proxy is necessary, explain the trade-off and propose the smallest practical solution.

Never commit credentials.

---

## 5. TECHNICAL AUDIT

Inspect the entire project before changing anything.

Review:

- package.json.
- Vite configuration.
- Tailwind configuration.
- React components.
- API service modules.
- Hooks.
- State management.
- Service worker.
- Manifest.
- Application icons.
- localStorage utilities.
- Error handling.
- Unit tests.
- Browser tests.
- Git history.
- README.md.
- PROMPTS.md.
- Deployment configuration.

Identify:
- Bugs.
- Duplicated logic.
- Unnecessary dependencies.
- Incorrect API assumptions.
- Accessibility issues.
- Performance problems.
- Security risks.
- Incomplete features.
- Misleading documentation.

Create a prioritized list of problems.

Fix critical problems first.

Do not rewrite the entire application just because you prefer a different architecture.

---

## 6. UI/UX QUALITY REVIEW

The application must look like a real commercial weather product, not a generic AI-generated dashboard.

Design references:

- Linear: https://linear.app/
- Vercel: https://vercel.com/
- Stripe: https://stripe.com/
- Mercury: https://mercury.com/

Review:

- Typography hierarchy.
- Spacing consistency.
- Color palette.
- Card layouts.
- Current weather presentation.
- Forecast visualization.
- Search interactions.
- Loading skeletons.
- Empty states.
- Error states.
- Mobile navigation.
- Dark/light theme.
- Button states.
- Hover and focus states.

Do not add excessive gradients, glassmorphism, animations, or decorative elements.

Every visual element should serve a purpose.

Preserve the existing design direction unless a real usability problem requires modification.

---

## 7. CORE FUNCTIONALITY VERIFICATION

### City Search

Verify:
- GeoDB autocomplete.
- Open-Meteo geocoding fallback.
- Debouncing.
- Keyboard navigation.
- Selection.
- Empty query validation.
- No-results state.
- API failure state.
- Network error state.

The 300ms target refers to the autocomplete debounce/response behavior after typing pauses, not guaranteed third-party network response time.

### Weather Dashboard

Verify:
- Current temperature.
- Feels-like temperature.
- Humidity.
- Wind speed.
- Pressure.
- Visibility where available.
- Weather conditions.
- Weather icons.
- Sunrise and sunset.
- Last updated timestamp.
- Five-day forecast.
- Minimum and maximum temperatures.

Ensure units are correctly converted.

### Favourite Cities

Verify:
- Maximum five favourites.
- Duplicate prevention.
- Add/remove functionality.
- Removal confirmation.
- Persistence after reload.
- localStorage unavailable fallback.

### PWA

Verify:
- Valid manifest.
- 192px icon.
- 512px icon.
- Standalone display.
- Theme color.
- Service worker registration.
- Application shell caching.
- Weather response caching.
- Offline banner.
- Offline restoration.
- Reconnection behavior.

### Notifications

The requirement asks for daily notifications even when the browser is closed.

Review the existing implementation carefully.

Explain the differences between:
- Browser Notifications API.
- Service Worker notifications.
- Periodic Background Sync.
- Web Push.
- Server-triggered scheduled notifications.

Do not claim guaranteed closed-tab scheduling without real evidence.

Test supported browser behavior and document limitations honestly.

Do not introduce a backend unless it is necessary and I approve the architectural change.

---

## 8. TESTING REQUIREMENTS

Run:

- npm run lint
- npm run test
- npm run build

Use the actual commands available in package.json.

If browser automation is available, test the production build in Chromium.

Test viewport sizes:

- 375px.
- 768px.
- 1280px.

Test these complete journeys:

1. Load application.
2. Search for Karachi.
3. Select Karachi from suggestions.
4. Fetch real weather.
5. Display five-day forecast.
6. Change Celsius/Fahrenheit.
7. Toggle dark/light mode.
8. Add favourite city.
9. Reload application.
10. Confirm favourite persistence.
11. Add five cities.
12. Attempt to add a sixth.
13. Remove favourite.
14. Test invalid search.
15. Test API failure.
16. Test offline mode.
17. Reload while offline.
18. Restore internet.
19. Test notification permissions.
20. Test PWA installation where supported.

Record actual results.

Do not mark tests as passed if they were not executed.

---

## 9. GITHUB PREPARATION

Prepare the existing repository for public release.

Verify:
- .gitignore.
- .env.example.
- No committed API keys.
- No unnecessary files.
- Clean production build.
- Complete README.
- Complete PROMPTS.md.
- Correct package scripts.
- No broken imports.
- No console errors.

I will create or provide access to my GitHub repository.

Do not fabricate a GitHub URL.

Do not destroy existing Git history.

If GitHub credentials are unavailable, prepare the repository and provide the exact commands I need to run.

---

## 10. DEPLOYMENT

Preferred platform: Vercel.

Alternative: Netlify.

Vercel:
https://vercel.com/new

Netlify:
https://app.netlify.com/

Deployment steps:

1. Connect the GitHub repository.
2. Configure build command.
3. Configure output directory.
4. Configure environment variables.
5. Deploy.
6. Verify the live URL.
7. Test live API integrations.
8. Test production PWA behavior.
9. Test offline functionality.
10. Update README.md with the actual deployment URL.

Do not claim successful deployment without verifying the live application.

---

## 11. DOCUMENTATION

### README.md

Include:

- Project introduction.
- Screenshots if available.
- Features.
- Technology stack.
- Project structure.
- Installation instructions.
- Environment configuration.
- API integrations.
- Architecture decisions.
- PWA implementation.
- Offline behavior.
- Notification limitations.
- Testing instructions.
- Deployment instructions.
- Known limitations.
- Live application URL.

### PROMPTS.md

Maintain the complete development prompt history.

Include:
- IDE used.
- Original master prompt.
- Follow-up prompts.
- Debugging instructions.
- Architectural decisions.
- Corrections.
- Important technical decisions.

Do not invent historical prompts.

---

## 12. FINAL ACCEPTANCE REPORT

At completion, produce this report:

| Requirement | Result | Evidence |
|---|---|---|
| City autocomplete | Pass/Fail | Actual API test |
| OpenWeatherMap | Pass/Fail | Live response |
| Five-day forecast | Pass/Fail | Actual data |
| Open-Meteo fallback | Pass/Fail | Fallback test |
| Form validation | Pass/Fail | Browser test |
| Favourite cities | Pass/Fail | Persistence test |
| localStorage fallback | Pass/Fail | Storage test |
| PWA manifest | Pass/Fail | Manifest validation |
| Service worker | Pass/Fail | Browser inspection |
| Offline functionality | Pass/Fail | Offline reload |
| Notifications | Pass/Partial/Fail | Browser evidence |
| Responsive design | Pass/Fail | Three viewports |
| Production build | Pass/Fail | Build output |
| README.md | Pass/Fail | File review |
| PROMPTS.md | Pass/Fail | File review |
| GitHub publication | Pass/Fail | Public repository |
| Deployment | Pass/Fail | Live URL |

Also provide:

1. Bugs fixed.
2. Remaining limitations.
3. API credentials still required.
4. Exact commands to run.
5. GitHub repository URL.
6. Live application URL.
7. Final submission email draft.

---

## 13. STRICT EXECUTION RULES

- Do not rebuild working features.
- Do not add unnecessary dependencies.
- Do not fake successful API calls.
- Do not use mocked data as live evidence.
- Do not claim untested functionality works.
- Do not expose API credentials.
- Do not delete project files without justification.
- Do not overwrite Git history.
- Do not deploy broken code.
- Do not stop after providing an audit report.
- Implement and fix the issues you identify.
- Ask me only when a credential, permission, or decision genuinely blocks progress.

Work in small, verifiable stages.

After each major stage, report:
- What changed.
- What was tested.
- What passed.
- What failed.
- What remains.

## FINAL OBJECTIVE

Make WeatherBoard a credible technical assessment submission.

The final product must demonstrate that I can understand requirements, work with APIs, build maintainable React applications, debug real problems, implement PWA functionality, and make sound engineering decisions.

Start by inspecting the existing project. Do not assume previous reports are accurate. Audit first, then execute the highest-priority fixes.
````

### Agent notes for Prompt 2 (written at the end of the work it started)

#### What blocked the stated goal

- **No API keys were supplied.** The agent opened a secure credential form for the RapidAPI key; it was declined. OpenWeatherMap only accepts its key in the request URL, which that form cannot handle. So OpenWeatherMap and GeoDB *success* responses remain unverified.
- **No GitHub or hosting access.** The session's GitHub token was invalid and no Vercel/Netlify credentials existed, so nothing was pushed or deployed.
- **Provider terms could not be read.** The documentation sites were outside the session's network allowlist. The README says this instead of asserting what the terms allow.

#### Audit findings and fixes, in priority order

| # | Finding | Severity | Fix |
|---|---|---|---|
| 1 | `fetchJson` used `AbortSignal.any()` and `AbortSignal.timeout()`, which do not exist in Safari before 17.4. On those browsers **every** request would have thrown. | Critical | Timeout and cancellation rewired with a plain `AbortController` and timer. |
| 2 | With OpenWeatherMap, late in the evening the forecast's first slot is already tomorrow. Tomorrow was then shown in the "today" position and its high/low were printed on the current-weather card. | High | The normalizer adds a "today" entry from the current reading; the card looks today up by date instead of taking the first entry. Unit test added. |
| 3 | The hosting configs rewrote *every* unknown path to `index.html`, including missing hashed assets. After a redeploy the service worker could have cached HTML as JavaScript. | High | Fallback restricted to page paths; missing assets stay 404. |
| 4 | Search results that came from the fallback during a GeoDB rate limit were cached for the session, hiding GeoDB after it recovered. | Medium | Only stable answers are cached. |
| 5 | Two results with the same rounded coordinates would share a React key and a favourite id. | Medium | Results are de-duplicated by id. |
| 6 | The reminder code read the service-worker registration immediately; on a first visit it may not exist yet, giving a false "service worker not running". | Medium | Waits up to four seconds for the worker. |
| 7 | README implied nothing about RapidAPI keys being application-wide. | Medium (security) | "Key exposure" section added, with a dedicated-application recommendation and the proxy design that was *not* built. |
| 8 | There was no way to prove live integration without a browser. | Medium | `npm run test:live`: one real request per endpoint through the app's own service modules; skipped (not passed) when a key is missing. |

Reviewed and left alone: `useStoredState` writes to storage inside a state updater (impure but idempotent); the theme does not follow a system change made while the app is open; `sharp` remains a dev dependency for the icon script.

#### Decisions

- **No backend added.** A key-hiding proxy is the right long-term answer, but the brief says client-side only and the prompt requires approval for that change. It is documented as a proposal.
- **No UI redesign.** The review found no usability problem that justified changing the design direction.

#### What was actually re-run

- `npm run lint`, `npm test` (26 tests), `npm run build`: all pass.
- `npm run test:live`: Open-Meteo weather and geocoding passed against the real endpoints once; two repeats timed out on the weather endpoint from the rate-limited development IP. OpenWeatherMap and GeoDB checks were skipped for lack of keys.
- Browser suites on the production build: 77 checks, all passing. In this pass every weather response in the browser was a replay of one real response captured earlier, because Open-Meteo refused the development IP. That run therefore proves the UI, not live integration.
- Debounce and cancellation measured on real geocoding requests: one request for seven fast keystrokes; an in-flight request aborted when the query changed.

---

## Prompt 3 — keys supplied (12 Nov 2026)

The user pasted a transcript of a separate chat in which they had obtained an OpenWeatherMap key and a RapidAPI key, and then a Vite error from their own machine (`Failed to resolve import "lucide-react"`). No instruction text accompanied either paste. The keys are not reproduced here.

### Agent notes

- With keys available, the previously unverified paths were run against the real providers: `npm run test:live` passed for OpenWeatherMap (current + forecast), GeoDB and Open-Meteo geocoding; the Open-Meteo weather check received a real HTTP 429 from the rate-limited development IP.
- In Chromium on the production build, searching "Karachi" returned GeoDB suggestions and loaded live OpenWeatherMap weather and forecast, with no console errors. No code changes were needed.
- The keys were written only to a git-ignored `.env.local`; nothing containing them was committed or packaged.
- The `lucide-react` error was diagnosed as an incomplete `node_modules` on the user's machine, not a code fault: the package is listed in `package.json` and the same source builds cleanly.
