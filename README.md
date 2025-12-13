# LaTeX to MathML Converter

This is a web-based application that allows users to convert LaTeX equations into MathML format with a real-time preview. It provides a user-friendly interface with a text editor for LaTeX input and a live preview panel that displays the rendered equation. Users can also copy the generated MathML to their clipboard or view it in a modal.

## Features

- **Real-time Conversion:** Instantly converts LaTeX input to a rendered MathML preview as you type.
- **Predefined Symbols:** A library of common LaTeX symbols and equations that can be inserted into the editor with a single click.
- **Copy to Clipboard:** Easily copy the generated MathML or the original LaTeX input.
- **View MathML:** View the raw MathML code in a modal for inspection.
- **Light/Dark Mode:** A theme switcher for user comfort.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (React)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Radix UI](https://www.radix-ui.com/) and [shadcn/ui](https://ui.shadcn.com/)
- **LaTeX to MathML Conversion:** [TeMMl](https://github.com/ronkok/Temml)
<!-- - **Analytics:** [Vercel Analytics](https://vercel.com/analytics) -->

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/prasad-kmd/latex2mathml_next
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```
3.  Run the development server
    ```sh
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

The project follows a standard Next.js `app` directory structure:

-   **/app:** Contains the core application files, including the main page (`page.tsx`) and layout (`layout.tsx`).
-   **/components:** Contains all the reusable React components used in the application, such as the equation editor, action buttons, and modal.
-   **/public:** Contains static assets, including the TeMMl font file (`Temml.woff2`) and stylesheet (`Temml-Local.css`).
-   **/lib:** Contains utility functions and helper code.

## How It Works

The application uses the **TeMMl** library to convert LaTeX strings into MathML. The main page component (`/app/page.tsx`) manages the application's state, including the LaTeX input and the generated MathML. When the user types in the LaTeX editor, the state is updated, and the `temml.renderToString` function is called to generate the MathML. This MathML is then passed down to the preview component, which uses `dangerouslySetInnerHTML` to render it.
