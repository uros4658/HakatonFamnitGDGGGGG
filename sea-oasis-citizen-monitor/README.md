# SeaOasis Citizen Monitor

## Problem Statement

Marine biodiversity monitoring often depends on repeated underwater observations, photos, and survey notes. For citizen scientists, this can be difficult to do consistently: routes may vary, required photo targets can be missed, and observations are hard to compare over time.

Sea Oasis Piran also needs a clear way to visualize survey routes around the underwater structure using public location and dimension data, while keeping the workflow understandable for non-expert users.

## Solution

SeaOasis Citizen Monitor is a web app for planning, collecting, and reviewing structured underwater monitoring data.

The app includes:

- A survey route planner based on balanced direction patterns.
- A 3D Sea Oasis Piran route planner with animated drone movement.
- Real Sea Oasis Piran anchor coordinates and public structure dimensions.
- Photo checklist generation for required survey captures.
- Observation entry, dashboard views, reports, and export tools.
- An AI marine advisor for practical monitoring questions.

The 3D route module lets users choose route options, preview drone movement around the structure, inspect depth changes, view waypoint details, and send the selected route into the checklist flow.

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- Three.js
- React Three Fiber
- Drei
- Recharts
- Zod
- jsPDF
- Gemini API route for the AI advisor

## Setup Instructions

Install dependencies:

```bash
npm install
```

Create an optional `.env.local` file for the AI advisor:

```bash
GEMINI_API_KEY=your_api_key_here
```

Run the development server:

```bash
npm run dev
```

Open the app:

```text
http://localhost:3000
```

Useful commands:

```bash
npm run build
npm run lint
npm run test
```
