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
