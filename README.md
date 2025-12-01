# Med Scrapper - Frontend

A modern React application for searching and comparing medicine prices across multiple pharmacies (1mg, Apollo, PharmEasy, TrueMeds, NetMeds).

## Features

-   **Multi-Pharmacy Search**: Search for medicines across 5 major online pharmacies simultaneously.
-   **Price Comparison**: View and compare prices to find the best deal.
-   **Pincode Serviceability**: Check if delivery is available in your area using your pincode.
-   **Live Location**: Automatically detect your location and pincode for accurate results.
-   **OCR Medicine Extraction**: Upload a prescription image to extract medicine names automatically.
-   **Responsive Design**: Optimized for both desktop and mobile devices.

## Tech Stack

-   **Framework**: React (Vite)
-   **Styling**: CSS / Tailwind
-   **State Management**: React Hooks
-   **API Integration**: Fetch API

## Setup & Installation

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Variables**
    Create a `.env` file in the `frontend` directory:
    ```env
    VITE_API_URL=http://localhost:3000
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

## Project Structure

-   `src/pages/SearchPage.jsx`: Main search interface and logic.
-   `src/pages/LandingPage.jsx`: Home page with pharmacy logos.
-   `src/components`: Reusable UI components.
