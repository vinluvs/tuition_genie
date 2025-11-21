# Tuition Genie

Tuition Genie is a modern, comprehensive tuition management system designed to streamline the administration of classes, students, and billing. Built with cutting-edge web technologies, it offers a premium user experience with a sleek, responsive interface.

## 🚀 Features

-   **Dashboard Overview**: Get a bird's-eye view of your tuition center's performance with integrated reports and analytics.
-   **Class Management**:
    -   Create and manage classes with detailed schedules (days, times, timezones).
    -   Track fees and instructor details.
    -   View class profiles with student lists, logs, and test scores.
-   **Student Management**:
    -   Register new students with comprehensive personal and academic details.
    -   Manage student enrollments and track their progress.
-   **Academic Tracking**:
    -   **Class Logs**: Record daily class activities and notes.
    -   **Test Scores**: Record and monitor student performance on tests.
-   **Financial Management**:
    -   **Billing**: Generate and manage bills for students (feature in progress/available via `add-bill-modal`).
-   **Authentication**: Secure login and signup functionality for administrators/instructors.
-   **Premium UI/UX**:
    -   Dark mode support.
    -   Beautiful, responsive design using Tailwind CSS v4.
    -   Smooth animations and transitions.
    -   Custom-styled components (scrollbars, modals, forms).

## 🛠 Tech Stack

-   **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**:
    -   [Tailwind CSS v4](https://tailwindcss.com/)
    -   [Shadcn/ui](https://ui.shadcn.com/) (Component Library)
    -   [Lucide React](https://lucide.dev/) (Icons)
-   **State Management & Data Fetching**:
    -   [React Query (@tanstack/react-query)](https://tanstack.com/query/latest)
-   **Forms & Validation**:
    -   [React Hook Form](https://react-hook-form.com/)
    -   [Zod](https://zod.dev/)
-   **Backend Integration**: Custom hooks connecting to a separate backend service (`tuition_genie_backend`).

## 📂 Project Structure

```
tuition_genie/
├── app/                  # Next.js App Router pages
│   ├── classes/          # Class management routes
│   ├── dashboard/        # Main dashboard
│   ├── login/            # Authentication
│   ├── students/         # Student management routes
│   └── ...
├── components/           # Reusable UI components
│   ├── ui/               # Shadcn UI primitives
│   ├── add-*-modal.tsx   # Feature-specific modals
│   └── ...
├── hooks/                # Custom React hooks for API integration
├── lib/                  # Utilities and types
└── public/               # Static assets
```

## ⚡ Getting Started

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd tuition_genie
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

4.  **Backend Setup:**
    Ensure the `tuition_genie_backend` service is running and accessible. Configure the API endpoint in your environment variables if necessary (check `.env.local`).

## 🎨 Design Philosophy

Tuition Genie prioritizes **visual excellence**. The application features:
-   Curated color palettes and glassmorphism effects.
-   Inter font for clean, modern typography.
-   Micro-animations for enhanced engagement.
-   A "wow" factor in every interaction.

---

Built with ❤️ by the Tuition Genie Team.
