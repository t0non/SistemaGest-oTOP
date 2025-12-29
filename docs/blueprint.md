# **App Name**: TechStore Manager BH

## Core Features:

- Admin Authentication: Secure login for administrators using email/password via Firebase Authentication.
- Client Management (CRUD): Create, read, update, and delete client records in Firestore. Includes fields for name, CPF, phone, address, and notes.
- Client Search: Enable quick client searches by name or CPF within the client listing.
- Financial Records: Log income (sales/services) and expenses in Firestore, tracking description, amount, and date, linking them to clients where applicable.
- Dashboard Overview: Display a dashboard on the main page summarizing the month's revenue and net profit, derived from Firestore transaction data.

## Style Guidelines:

- Primary color: Deep blue (#1E3A8A) to convey trust and professionalism.
- Background color: Light gray (#F9FAFB), very subtly tinted blue, to provide a clean and calming backdrop.
- Accent color: A brighter, sky blue (#38BDF8) to draw the eye to key interactive elements, such as calls to action.
- Body font: 'Inter', a grotesque sans-serif known for its neutral and modern aesthetic, ensures readability and professionalism.
- Headline font: 'Space Grotesk', a proportional sans-serif font which is paired with Inter. Space Grotesk is best used for short bursts of text.
- Use clean, minimalist icons from a library like FontAwesome or Material Icons to represent actions and data.
- Employ a responsive, grid-based layout with clear spacing and hierarchy to ensure usability on various devices.