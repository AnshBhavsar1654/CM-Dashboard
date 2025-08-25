# Gujarat Outreach Insights: Technical Handover Document

### Introduction

This document provides a comprehensive technical overview of the Gujarat Outreach Insights dashboard. It is intended for developers who will be maintaining and extending the project. It covers everything from local environment setup to the intricacies of the codebase architecture and deployment procedures.

**Document Structure:**
1.  **Environment Setup:** ⚙️ How to get the project running locally.
2.  **Technology Stack:** 📚 A detailed look at the libraries and frameworks used.
3.  **Codebase Architecture:** 🏗️ A deep dive into the project's structure, state management, and data flow.
4.  **Data Structures:** 📊 An explanation of the core data types.
5.  **Developer's Guide:** 👨‍💻 Step-by-step instructions for common tasks.
6.  **Deployment & Maintenance:** 🚀 How to deploy the application and perform maintenance.

---

## 1. Environment Setup ⚙️

This section provides instructions for setting up a local development environment to run the project.

### Prerequisites

*   **Node.js:** v20.0.0 or later
*   **npm:** v10.2.0 or later (usually comes with Node.js)
*   **Git:** For cloning the repository.

### Installation Steps

1.  **Clone the Repository:** 📥
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install Dependencies:** 📦
    This project uses `npm` for package management. Run the following command to install all the necessary dependencies listed in `package.json`:
    ```bash
    npm install
    ```

3.  **Set Up Environment Variables:** 🔑
    The application requires specific environment variables to connect to the Google Sheets API. Create a new file named `.env` in the root of the project directory and add the following variables:

    ```env
    # The full email address of the Google Service Account
    GOOGLE_SHEETS_CLIENT_EMAIL="your-service-account-email@your-project.iam.gserviceaccount.com"

    # The private key for the Google Service Account.
    # IMPORTANT: Copy the entire key, including the -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY----- lines.
    # The key must be enclosed in double quotes.
    GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...your-private-key-here...\n-----END PRIVATE KEY-----\n"

    # The ID of the Google Sheet that contains the event data.
    # This can be found in the URL of the Google Sheet.
    # e.g., for https://docs.google.com/spreadsheets/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ.../edit
    # The ID is "1aBcDeFgHiJkLmNoPqRsTuVwXyZ..."
    GOOGLE_SHEET_ID="your-google-sheet-id"
    ```

    **How to obtain Google Sheets API credentials:**
    *   You will need a Google Cloud Platform (GCP) project.
    *   Enable the "Google Sheets API" in the GCP console.
    *   Create a "Service Account" in the "IAM & Admin" section.
    *   Grant the Service Account the "Viewer" role.
    *   Create a JSON key for the Service Account. The `client_email` and `private_key` values can be found in this downloaded JSON file.
    *   Share the Google Sheet with the Service Account's email address (`client_email`) with at least "Viewer" permissions.

4.  **Run the Development Server:**
    Once the dependencies are installed and the environment variables are set, you can start the Next.js development server:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:9002`.

## 2. In-Depth Technology Stack 📚

This project leverages a modern, TypeScript-based stack. Below is a detailed analysis of the key technologies and libraries used.

### Core Framework: Next.js

*   **Official Docs:** **[nextjs.org](https://nextjs.org/)**
*   **Description:** The application is built on Next.js, utilizing the App Router paradigm for file-system based routing, server-side rendering, and API routes.
*   **Project-Specific Implementation:**
    *   **Server Components:** The root page (`src/app/page.tsx`) is a React Server Component (RSC). This allows the initial data fetching from `getEventsData()` to happen on the server, reducing client-side load times and keeping data-fetching credentials secure.
        ```typescript
        // src/app/page.tsx
        export default async function DashboardPage() {
          const events = await getEventsData();
          return <DashboardWrapper initialEvents={events} />;
        }
        ```
    *   **Client Components:** Components that require user interaction and state are designated as Client Components with the `"use client"` directive. The main interactive component is `src/components/dashboard/dashboard.tsx`, which manages all filters and state.

### Styling: Tailwind CSS & shadcn/ui

*   **Official Docs:** **[tailwindcss.com](https://tailwindcss.com/)**, **[ui.shadcn.com](https://ui.shadcn.com/)**
*   **Description:** A utility-first CSS framework for styling, combined with a component library built on Radix UI for accessibility.
*   **Project-Specific Implementation:**
    *   **`tailwind.config.ts`:** This file defines the theme, including custom colors, fonts, and animations used throughout the application.
    *   **`src/components/ui`:** This directory contains the UI components (Button, Card, etc.) provided by `shadcn/ui`. Because these are actual source files and not a node module, they can be directly modified to fit project-specific requirements.

### Data Visualization: Recharts & React Leaflet

*   **Official Docs:** **[recharts.org](https://recharts.org/)**, **[react-leaflet.js.org](https://react-leaflet.js.org/)**
*   **Description:** Recharts is used for creating declarative charts. React Leaflet is used for rendering the interactive map.
*   **Project-Specific Implementation:**
    *   **Charts:** Components like `src/components/dashboard/event-type-chart.tsx` take the filtered event data and use `recharts` components (`<BarChart>`, `<PieChart>`) to render visualizations. Data is often transformed within the component to fit the structure Recharts expects.
    *   **Map:** `src/components/dashboard/map-view.tsx` implements the Leaflet map. It uses the `leaflet.markercluster` plugin (via `marker-cluster-group.tsx`) to group map pins at high zoom levels, ensuring performance.

### AI & Data Handling: Genkit & Zod

*   **Official Docs:** **[firebase.google.com/docs/genkit](https://firebase.google.com/docs/genkit)**, **[zod.dev](https://zod.dev/)**
*   **Description:** Genkit is an open-source framework for building AI-powered features. Zod is used for schema definition and validation.
*   **Project-Specific Implementation:**
    *   **`src/ai/genkit.ts`:** This file configures the Genkit instance, specifying the Google AI plugin and the model (`gemini-2.0-flash`).
    *   **`src/ai/flows/get-events-flow.ts`:** This is a simple Genkit flow that currently acts as a wrapper around `getEventsData()`. Its primary purpose is to expose the data fetching logic to the Genkit framework, allowing it to be easily extended with more complex AI tasks like summarization or insight generation in the future.
    *   **`src/ai/flows/types.ts`:** The Zod schema `eventDataSchema` is defined here. This provides runtime validation and type safety for the data used in AI flows.

## 3. Detailed Codebase Architecture

This section provides a detailed look into the architecture of the application, from the folder structure to state management and data fetching.

### Directory Structure

The `src` directory is the heart of the application. Here is a breakdown of its contents:

```
src/
├── app/         # Next.js App Router: Pages and API routes
│   ├── page.tsx   # Main entry point for the dashboard page
│   └── layout.tsx # Root layout for the application
├── components/  # Reusable React components
│   ├── dashboard/ # Components specific to the dashboard domain
│   ├── ui/        # Generic UI components from shadcn/ui
│   └── common/    # Common components like ThemeProvider
├── lib/         # Core logic, utilities, and data fetching
│   ├── events-data.ts # Main data fetching and processing logic
│   ├── types.ts       # TypeScript type definitions
│   └── utils.ts       # Utility functions (e.g., cn for classnames)
└── ai/          # Genkit AI framework integration
    ├── flows/       # AI-powered workflows
    └── genkit.ts    # Genkit plugin configuration
```

### Component Design Strategy

The component architecture is designed for maintainability and reusability.

*   **`src/components/ui`:** These are the "leaf" components of the application, sourced from `shadcn/ui`. They are generic and unstyled by default, providing a consistent and accessible foundation for the UI. Examples include `Button.tsx`, `Card.tsx`, and `Input.tsx`. These should not contain any domain-specific logic.

*   **`src/components/dashboard`:** These are "composite" components that are specific to the dashboard's domain. They are built by combining components from `src/components/ui` and other dashboard components. They often contain state and logic related to the dashboard's functionality. Examples include `MapView.tsx`, `EventsTable.tsx`, and `StatsGrid.tsx`.

### State Management

The application uses a combination of local component state and URL state for managing its state.

*   **Local State (`useState`):** The primary state for the dashboard (e.g., `allEvents`, `filteredEvents`, filter values) is managed within the `src/components/dashboard/dashboard.tsx` component using React's `useState` hook.

*   **URL State (`useRouter`, `useSearchParams`):** To enable sharing and bookmarking of specific dashboard views, the filter state is synchronized with the URL's query parameters.
    *   On component mount, a `useEffect` hook reads the query parameters from the URL and initializes the filter state.
    *   Another `useEffect` hook watches for changes in the filter state and updates the URL's query parameters accordingly using `router.replace()`. This ensures that the URL always reflects the current state of the filters without adding to the browser's history stack.

### Data Fetching & Caching

The data fetching logic is centralized in `src/lib/events-data.ts`.

*   **Authentication:** The application uses a Google Service Account (via a JWT) to authenticate with the Google Sheets API. This is a secure, server-to-server authentication method.

*   **Data Reading (`readSheet`):** This function handles the interaction with the Google Sheets API. It dynamically finds the "Data" sheet and reads its entire contents.

*   **Data Processing:** The raw data from the sheet is then parsed, cleaned, and transformed into the `EventData` type. This includes:
    *   Parsing date strings from multiple formats.
    *   Calculating the distance traveled from a home location.
    *   Skipping rows with missing essential data.

*   **Caching (`unstable_cache`):** To optimize performance, the fetched and processed data is cached on the server using Next.js's `unstable_cache` function.
    *   The data is cached for 86400 seconds (24 hours).
    *   The cache is tagged with the key `events-data`. This allows for manual revalidation if needed.
    *   The `revalidateEvents` function can be called to programmatically invalidate the cache.

#### State Management Flow

The following diagram illustrates the flow of state when a user interacts with a filter on the dashboard.

```mermaid
flowchart TD
    subgraph "Browser"
        A(User clicks a filter, e.g., selects a District) --> B{Dashboard Component};
        B --> C{React's useState Hook};
        C -- Sets new filter state --> B;
        B --> D{React's useEffect Hook};
        D -- Watches for state change --> E{Update URL};
        E -- uses router.replace() --> F[URL Search Params Updated];
    end

    subgraph "Next.js Server"
        G[Page Reload / New Visit] --> H{Read URL Params};
        H --> I{Dashboard Component};
        I --> J{Initialize useState};
    end

    F -.-> G;
```

#### Data Fetching Sequence Diagram

This diagram shows the sequence of events when the application fetches data from the Google Sheet.

```mermaid
sequenceDiagram
    participant Client as Browser
    participant Server as Next.js Server
    participant Cache as Next.js Cache
    participant GSheets as Google Sheets API

    Client->>Server: GET / (Request Dashboard Page)
    Server->>Server: Executes getEventsData()
    Server->>Cache: Check for cached data with tag 'events-data'
    alt Cache Miss
        Cache-->>Server: No valid cache entry
        Server->>GSheets: Authenticate and fetch data
        GSheets-->>Server: Return sheet data
        Server->>Server: Process and transform data
        Server->>Cache: Store processed data (24h TTL)
        Cache-->>Server: Confirm data stored
    else Cache Hit
        Cache-->>Server: Return cached data
    end
    Server->>Client: Render and return HTML with data
```

## 4. Data Structures 📊

This section details the core data structures used throughout the application. The primary data structure is the `EventData` interface, defined in `src/lib/types.ts`.

### The `EventData` Interface

This interface represents a single event record after it has been parsed and processed from the Google Sheet.

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `number` | A unique identifier for the event, generated from its row index. |
| `eventName` | `string` | The official name of the event. **Required**. |
| `date` | `string` | The date of the event in ISO 8601 format (`YYYY-MM-DDTHH:mm:ss.sssZ`). |
| `type` | `string` | The category or type of the event (e.g., "Public Rally", "Inauguration"). |
| `district` | `string` | The district where the event took place. |
| `location` | `string` | The specific location or venue of the event. |
| `latitude` | `number` | The geographic latitude of the event location. Defaults to `0` if not provided. |
| `longitude` | `number` | The geographic longitude of the event location. Defaults to `0` if not provided. |
| `tags` | `string[]` | An array of keywords or tags associated with the event. |
| `distanceTravelled` | `number` | The calculated distance in kilometers from a predefined home location. |
| `department` | `string` | The government department associated with the event. |
| `imgLink` | `string \| undefined` | A URL pointing to an image related to the event. Optional. |
| `eventDateMs` | `number` | The event date represented in milliseconds since the Unix epoch. Used for efficient date comparisons and sorting. **Required**. |

## 5. Developer's Guide to Common Tasks 👨‍💻

This section provides step-by-step instructions for common maintenance and development tasks.

### How to Add a New Data Field

This workflow describes how to add a new field (e.g., "Event Priority") to the dashboard.

1.  **Update the Google Sheet:**
    *   Add a new column to the "Data" sheet in the Google Sheet. For this example, add a column named "Event Priority".
    *   Populate the column with data for existing rows.

2.  **Update the TypeScript Type:**
    *   Open `src/lib/types.ts`.
    *   Add the new field to the `EventData` interface.
        ```typescript
        export interface EventData {
          // ... existing fields
          eventPriority: string;
        }
        ```

3.  **Update the Data Fetching Logic:**
    *   Open `src/lib/events-data.ts`.
    *   In the `readSheet` function, find the `columnMapping` object and add a mapping for the new column. The key should match the new field in `EventData`, and the value should be the lowercase, space-removed version of the column header in the Google Sheet.
        ```typescript
        const columnMapping = {
          // ... existing mappings
          eventPriority: 'eventpriority',
        };
        ```
    *   In the `parsedEvents` mapping, add the logic to read and process the new field from the row data.
        ```typescript
        return {
          // ... existing fields
          eventPriority: String(rowData[columnMapping.eventPriority] || 'Normal').trim(),
        };
        ```
        Here, we default to 'Normal' if the cell is empty.

4.  **Display the New Field in the UI:**
    *   You can now access `event.eventPriority` in any component that receives the `EventData` object.
    *   For example, to add it to the `EventsTable`, open `src/components/dashboard/events-table.tsx` and add a new column definition.

### How to Create a New Chart

1.  **Create the Chart Component:**
    *   Create a new file in `src/components/dashboard/`, for example, `PriorityChart.tsx`.
    *   Use the `recharts` library to build the new chart. You will likely need to process the `filteredEvents` data to get it into the right format for the chart (e.g., counting events by priority).
    *   The component should accept `data: EventData[]` as a prop.

2.  **Add the Chart to the Dashboard:**
    *   Open `src/components/dashboard/dashboard.tsx`.
    *   Import your new `PriorityChart` component.
    *   Add the component to the JSX layout, passing the `filteredEvents` data to it:
        ```jsx
        <div className="grid grid-cols-1 gap-4 md:gap-8">
          <PriorityChart data={filteredEvents} />
        </div>
        ```

### How to Modify the AI Flow

The AI flow is currently simple but can be extended.

1.  **Locate the Flow:**
    *   The main data flow is in `src/ai/flows/get-events-flow.ts`.

2.  **Modify the Input/Output Schema:**
    *   The `inputSchema` and `outputSchema` are defined using Zod. If you want to change the data that the flow accepts or returns, you must update these schemas.

3.  **Update the Flow Logic:**
    *   The main logic is within the async callback of `ai.defineFlow`.
    *   For example, to add an AI-powered summary, you could:
        *   Keep the `getEventsData()` call.
        *   Use `ai.generate()` with a prompt that takes the event data and asks for a summary.
        *   Update the `outputSchema` to include a `summary` string field.
        *   Return both the events and the new summary.

## 5. Deployment & Maintenance

This section covers the deployment process and ongoing maintenance tasks for the application.

### Deployment

The application is configured for deployment on multiple platforms. The presence of `netlify.toml` and `apphosting.yaml` suggests it can be deployed to [Netlify](https://www.netlify.com/) and [Google App Hosting](https://cloud.google.com/app-hosting) respectively.

*   **Netlify:** The `netlify.toml` file contains the build settings for deploying the Next.js application on Netlify. It specifies the build command (`npm run build`) and the publish directory (`.next`).
*   **Google App Hosting:** The `apphosting.yaml` file is used for deploying to Google's App Hosting service. It defines the runtime, build commands, and serving configuration.

To deploy, you would typically connect the Git repository to one of these services and configure the build settings in their respective web UI. The service will then automatically build and deploy the application upon a `git push` to the main branch.

The following diagram illustrates the typical CI/CD (Continuous Integration/Continuous Deployment) workflow for this project:

```mermaid
graph TD
    subgraph "Developer"
        A[Code changes] --> B{git push};
    end

    subgraph "Git Repository (e.g., GitHub)"
        B --> C{Main Branch Update};
    end

    subgraph "Deployment Service (Netlify / Google App Hosting)"
        C --> D[Webhook Trigger];
        D --> E[Start Build];
        E --> F[1. Install Dependencies];
        F --> G[2. Run `npm run build`];
        G --> H[3. Deploy `.next` directory];
        H --> I[🚀 Live Application];
    end

    style I fill:#34A853,color:#fff,stroke:#333,stroke-width:2px
```

**Important:** Ensure that the environment variables (`GOOGLE_SHEETS_CLIENT_EMAIL`, `GOOGLE_SHEETS_PRIVATE_KEY`, `GOOGLE_SHEET_ID`) are also set in the deployment environment's settings.

### Maintenance

#### Manually Revalidating the Data Cache

The data from the Google Sheet is cached for 24 hours. If you make urgent changes to the sheet and need them to be reflected on the live dashboard immediately, you will need to manually revalidate the cache.

The mechanism for this would typically be a secure API endpoint or a manual trigger in the deployment service's dashboard. The `revalidateEvents` function in `src/lib/events-data.ts`, which calls Next.js's `revalidateTag('events-data')`, is the core piece of this functionality.

To implement a manual revalidation trigger, you could:
1.  Create a new API route in `src/app/api/revalidate/route.ts`.
2.  This route should be secured (e.g., with a secret token) to prevent unauthorized access.
3.  When the route is called, it should execute the `revalidateEvents()` function.
4.  You can then call this API endpoint manually to clear the cache.
